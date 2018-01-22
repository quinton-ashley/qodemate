module.exports = function (args, opt) {
	const bot = require('./bot.js');
	const fs = require('fs');
	const ncp = require('copy-paste');
	const open = require('opn');
	const path = require('path');

	const log = console.log;

	let check = false;
	let setIdx = -1; // the set index
	let seq = []; // the sequence array stores step parts in the order they occur in the file(s)
	let set = []; // the set array stores step parts in sorted order, maintaing sequence order of step parts of the same number
	let slides = []; // the slides array stores the markdown text associated with each step to be displayed as a slide if the user includes a slides.md file
	let files = [args[0]]; // the file(s) to process

	for (let i = 0; i < files.length; i++) {
		let file = files[i];
		let data = fs.readFileSync(file, 'utf8');
		let lines, match, mod, prevMatch, tag, tags, text, primarySeqIdx, regex, splitStr;
		let loop = true;
		file = path.parse(file);
		switch (file.ext) {
			case '.css':
				splitStr = '/*';
				regex = /\n^.*\/\*\d[^\n]*/gm;
			case '.md':
				splitStr = '#';
				regex = /\n^.*\# \d[^\n]*/gm;
			case '.c':
			case '.js':
			case '.java':
			case '.h':
			case '.m':
				splitStr = '//';
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
				// the text of this step goes from the start of prevMatch to the start of match
				// if loop is false (this is the end of the file) add another line
				text = data.slice(prevMatch.index, match.index) + ((loop) ? '' : '\n');
				// if no new line char/char seqence is found then line length is 1
				lines = (text.match(/\r\n|\r|\n/g) || [1]).length;
				// the first line of the step, split and pop after the splitStr
				// to get the tags, then get the individual tags with tagRegex
				tags = prevMatch[0].split(splitStr).pop().match(tagRegex);
				// there are three types of tag: step number, editor, and option
				// cur will change if more than one step number tag is found
				let cur;
				for (let k = 0; k < tags.length; k++) {
					tag = tags[k];
					if (/[^ \w][^\);]+[\);]/.test(tag)) {
						// test for editor tags
						cur.lines = 0;
						cur.text = tag;
					} else if (/[a-zA-Z][^ a-zA-Z]*/.test(tag)) {
						// test for any option tag
						cur.opt[tag[0]] = tag.slice(1);
					} else if (/[\d\.]+/.test(tag)) {
						// the first tag will always be the step number tag, so cur will
						// be assigned to the object created below this if statement
						// if another step number tag is found then the current step is
						// complete and is pushed to the arrays seq and set
						// the seqIdx, j, is increased and the old cur is replaced by the
						// object created after the if statement
						if (k > 0) {
							cur.seqIdx = j++; // WRONG? should be just j++; ?
							seq.push(cur);
							set.push(cur);
						}
						// file: index of the file
						// lines: the number of lines the step has or the number of lines to remove
						// num: the step number tag string must be converted to a js Number
						// opt: assigned an empty object if k is 0, else assigned the delete option
						// with step num primarySeqIdx, the seqIdx of the first step
						// seqIdx: j, the seqence index, the order in which the step was read
						// setIdx: -1 is a placeholder, assigned after the set array is sorted
						// text: the text of the step, 'd' was used for debugging purposes
						cur = {
							file: i,
							lines: ((k == 0) ? lines : -lines),
							num: Number(tag),
							opt: ((k == 0) ? {} : {
								d: primarySeqIdx
							}),
							seqIdx: j,
							setIdx: -1,
							text: ((k == 0) ? text : 'd')
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
		// sort from least to greatest step number
		set.sort((a, b) => {
			if (a.num < b.num) return -1;
			if (a.num > b.num) return 1;
			return a.seqIdx - b.seqIdx;
		});
		// setIdx is assigned it's proper value after the sort
		// WRONG? seq never has it's setIdx updated, what's happening here?
		for (let q = 0; q < set.length; q++) {
			set[q].setIdx = q;
		}
		log(seq);
	}

	function countLines(cur, init, dest) {
		let result = 0;
		for (let i = init; i < dest; i++) {
			if (seq[i].setIdx < cur.setIdx) {
				result += seq[i].lines;
			}
		}
		return result;
	}

	function moveToDest(past, cur) {
		// finds the shortest distance in lines that bot needs to
		// traverse to reach the destination
		let from = {
			start: -1,
			past: -1,
			end: -1
		};
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

		// moves the cursor to the destination
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

	function performPart() {
		let cur, past;
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
			moveToDest(past, cur);
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

	function* performStep() {
		yield setTimeout(performPart, 100);
	}

	function perform() {
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
