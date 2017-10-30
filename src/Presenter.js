module.exports = function (files) {
	const bot = require('./bot.js');
	const fs = require('fs');
	const ncp = require('copy-paste');
	const open = require('opn');
	const path = require('path');

	const log = console.log;

	function Step(num, text, lines, fidx, seqIdx, opt) {
		this.num = num;
		this.text = text;
		this.opt = opt;
		this.lines = lines;
		this.fidx = fidx;
		this.seqIdx = seqIdx;
		this.setIdx = -1;

		//	this.toString = () => {
		//		return 'num: ' + this.num +
		//			' type: ' + this.type +
		//			' lines: ' + this.lines +
		//			' fidx: ' + this.fidx +
		//			' seqIdx: ' + this.seqIdx +
		//			' setIdx: ' + this.setIdx;
		//	}

	}

	function Slide(num, text) {
		this.num = num;
		this.text = text;
	}

	let check = false;
	let setIdx = -1;
	let seq = [];
	let set = [];
	let slides = [];
	let files = [args[0]];
	for (let i = 0; i < files.length; i++) {
		let file = files[i];
		let data = fs.readFileSync(file, 'utf8');
		let lines, match, mod, prevMatch, tag, tags, text, primarySeqIdx, regex;
		let loop = true;
		file = path.parse(file);
		switch (file.ext) {
			case '.css':
				regex = /\n^.*\/\*\d[^\n]*/gm;
			case '.md':
				regex = /\n^.*\# \d[^\n]*/gm;
			case '.c':
			case '.js':
			case '.java':
			case '.h':
			case '.m':
				regex = /\n^.*\/\/\d[^\n]*/gm;
		}
		let tagRegex = /([^ \w][^\);]+[\);]|[a-zA-Z][^ a-zA-Z]*|[\d\.]+)/g;
		for (let j = -1; loop; j++, primarySeqIdx = j) {
			if (((match = regex.exec(data)) == null)) {
				match = {
					index: data.length - 1
				};
				loop = false;
			}
			if (prevMatch != null) {
				text = data.slice(prevMatch.index, match.index);
				lines = (text.match(/\r\n|\r|\n/g) || [1]).length;
				tags = prevMatch[0].split('//').pop().match(tagRegex);
				let cur;
				for (let k = 0; k < tags.length; k++) {
					tag = tags[k];
					if (/[^ \w][^\);]+[\);]/.test(tag)) {
						cur.lines = 0;
						cur.text = tag;
					} else if (/[a-zA-Z][^ a-zA-Z]*/.test(tag)) {
						cur.opt[tag[0]] = tag.slice(1);
					} else if (/[\d\.]+/.test(tag)) {
						if (k > 0) {
							cur.seqIdx = j++;
							seq.push(cur);
							set.push(cur);
						}
						cur = {
							file: i,
							lines: ((k == 0) ? lines : -lines) + ((loop) ? 0 : 1),
							num: Number(tag),
							opt: ((k == 0) ? {} : {
								d: primarySeqIdx
							}),
							seqIdx: j,
							setIdx: -1,
							text: ((k == 0) ? text : 'd') + ((loop) ? '' : '\n')
						};
					}
				}
				seq.push(cur);
				set.push(cur);
				prevMatch = match;
			} else {
				prevMatch = match;
			}
		}

		set.sort((a, b) => {
			if (a.num < b.num) return -1;
			if (a.num > b.num) return 1;
			return a.seqIdx - b.seqIdx;
		});
		for (let q = 0; q < set.length; q++) {
			set[q].setIdx = q;
		}
		log(seq);
	}

	const countLines = (cur, init, dest) => {
		let result = 0;
		for (let i = init; i < dest; i++) {
			if (seq[i].setIdx < cur.setIdx) {
				result += seq[i].lines;
			}
		}
		return result;
	}

	const performPart = () => {
		let cur, past;
		let from = {
			start: -1,
			past: -1,
			end: -1
		};
		if (setIdx >= 0) {
			past = set[setIdx];
		} else {
			past = set[setIdx + 1];
		}
		cur = set[setIdx + 1];

		if (check && (cur.num != past.num)) {
			check = false;
			bot.focusOnApp();
			return false;
		}
		check = true;

		if (cur.num != 0) {
			from.start = countLines(cur, 0, cur.seqIdx);
			if (past.seqIdx < cur.seqIdx) {
				// count down
				from.past = countLines(cur, past.seqIdx + 1, cur.seqIdx);
			} else {
				// count up
				from.past = countLines(cur, cur.seqIdx + 1, past.seqIdx + 1);
			}
			from.end = countLines(cur, cur.seqIdx, seq.length);
			log(from);

			if (from.end < from.start && from.end < from.past) {
				bot.moveToEnd();
				bot.move(from.end, 'up');
			} else if (from.past < from.start) {
				bot.move(from.past, ((past.seqIdx < cur.seqIdx) ? 'down' : 'up'));
			} else {
				bot.moveToStart();
				bot.move(from.start, 'down');
			}
			bot.moveToEOL();
		}
		log(cur);
		setIdx++;
		if (cur.lines >= 0) {
			let textToPaste;
			if (cur.lines == 0) {
				bot.delete(seq[cur.opt.d].lines);
				let firstChar = cur.text[0];
				let lastChar = cur.text[cur.text.length - 1];
				let regexReplace = `${firstChar}[^${lastChar}]*${lastChar}`;
				regexReplace = new RegExp(regexReplace);
				textToPaste = seq[cur.opt.d].text;
				textToPaste = textToPaste.replace(regexReplace, cur.text);
			} else {
				textToPaste = cur.text;
			}
			var paste = () => {
				bot.paste();
				performStep().next();
			};
			ncp.copy(textToPaste, paste);
		} else {
			bot.delete(-cur.lines);
			performStep().next();
		}
	}

	const performStep = function* () {
		yield setTimeout(performPart, 100);
	}

	const perform = () => {
		bot.focusOnFile(0);
		performStep().next();
	}

	this.next = () => {
		log('next');
		bot.ensureKeysNotPressed(perform);
	}

	this.prev = () => {
		return 0;
	}

	this.reset = () => {
		setIdx = -1;
		return 0;
	}

}
