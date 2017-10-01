module.exports = function (files) {
	const bot = require('./Bot.js');
	const fs = require('fs');
	const ncp = require('copy-paste');
	const open = require('opn');

	const log = console.log;

	let authoredBy = [''];
	let videoURL = '';

	function Step(num, text, type, fidx, seqidx) {
		this.num = num;
		this.text = text;
		this.type = ((type == null) ? 'step' : 'run');
		this.lines = (text.match(/\r\n|\r|\n/g) || [1]).length;
		this.fidx = fidx;
		this.seqidx = seqidx;
		this.setidx = -1;

		//	this.toString = () => {
		//		return 'num: ' + this.num +
		//			' type: ' + this.type +
		//			' lines: ' + this.lines +
		//			' fidx: ' + this.fidx +
		//			' seqidx: ' + this.seqidx +
		//			' setidx: ' + this.setidx;
		//	}

	}

	function Slide(num, text) {
		this.num = num;
		this.text = text;
	}

	let check = false;
	let setidx = -1;
	let seq = [];
	let set = [];
	let slides = [];
	for (var i in files) {
		let file = files[i];
		log(i);
		let data = fs.readFileSync(file, 'utf8');
		let match, prevMatch, tag, num, type;
		let loop = true;
		let steps = [];
		let regex = /\n^.*\/\/\d+[^\n]*/gm;
		for (var j = -1; loop; j++) {
			if (((match = regex.exec(data)) == null)) {
				match = {
					index: data.length - 1
				};
				loop = false;
			}
			if (prevMatch != null) {
				tag = prevMatch[0].split(' ').pop();
				num = Number(tag.match(/\d+/));
				type = tag.match(/\[a-zA-Z]*/);
				steps.push(new Step(
					num, data.slice(prevMatch.index, match.index),
					type, i, j
				));
				seq.push(steps[j]);
				set.push(steps[j]);
				prevMatch = match;
			} else {
				prevMatch = match;

			}
		}

		set.sort((a, b) => {
			if (a.num < b.num) return -1;
			if (a.num > b.num) return 1;
			return a.seqidx - b.seqidx;
		});
		for (var q = 0; q < set.length; q++) {
			set[q].setidx = q;
		}
		//				log(set);
	}

	const countLines = (cur, init, dest) => {
		let result = 0;
		for (let i = init; i < dest; i++) {
			if (seq[i].setidx < cur.setidx) {
				result += seq[i].lines;
			}
		}
		return result;
	}

	const performPart = () => {
		let cur, past;
		let from = [];
		if (setidx >= 0) {
			past = set[setidx];
		} else {
			past = set[setidx + 1];
		}
		cur = set[setidx + 1];

		if (check && (cur.num != past.num)) {
			check = false;
			bot.focusOnApp();
			return false;
		}
		check = true;

		if (cur.num != 0) {
			from[0] = countLines(cur, 0, cur.seqidx);
			if (past.seqidx < cur.seqidx) {
				from[1] = countLines(cur, past.seqidx + 1, cur.seqidx);
			} else {
				from[1] = countLines(cur, cur.seqidx + 1, past.seqidx + 1);
			}
			from[2] = countLines(cur, cur.seqidx, seq.length);
			log(from);

			//			if (from[2] < from[0] && from[2] < from[1]) {
			//				bot.moveToEnd();
			//				bot.move(from[2], 'up');
			//			} else if (from[1] < from[0]) {
			//				bot.moveToBOL();
			//				bot.move(from[1], ((past.seqidx < cur.seqidx) ? 'down' : 'up'));
			//			} else {
			//				bot.moveToStart();
			//				bot.move(from[0], 'down');
			//			}

			bot.move(from[1], ((past.seqidx < cur.seqidx) ? 'down' : 'up'));
			bot.moveToEOL();
		}
		log(cur);
		setidx++;
		var paste = () => {
			bot.paste();
			performStep().next();
		};
		ncp.copy(cur.text, paste);
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
		setidx = -1;
		return 0;
	}

}
