/*
 * qodemate-core contains the file parser, the core algorithm of Qodemate
 * authors: quinton-ashley
 * copyright 2018
 */

const log = console.log;
const tagRegex = /([^ \w][^\);]+[\);]|[a-zA-Z][^ a-zA-Z]*|[\d\.]+)/g;

let qode, seq, set, setIdx, setIdxs, cur, past, steps, stepItr;
let lessons, slideItr, check, allFilesAdded, fIdx;

class Qodemate {
	reset() {
		qode = [];
		// the sequence array stores step parts in the order they occur in
		// the file(s)
		seq = [];
		// the set array stores step parts in sorted order, maintaing sequence
		// order of step parts of the same number
		set = [];
		// the set index
		setIdx = -1;
		setIdxs = [];
		cur = {};
		past = {};
		steps = {};
		stepItr = 0;
		// lessons array stores the markdown text associated with each step
		// to be displayed as a slide if the user includes a slides.md file
		lessons = [];
		slideItr = -1;
		check = false;
		allFilesAdded = false;
		fIdx = -1;
	}

	constructor() {
		this.reset();
	}

	restart() {
		for (let i = 0; i < setIdxs.length; i++) {
			setIdxs[i] = -1;
		}
	}

	hasNextStep() {
		return stepItr < steps.length;
	}

	init() {
		steps = Object.entries(steps);
		steps.sort(function(a, b) {
			return Number(a[0]) - Number(b[0]);
		});
		log('step numbers');
		log(steps);
	}

	nextStep() {
		if (!this.hasNextStep()) {
			return false;
		}
		if (fIdx >= 0) {
			setIdxs[fIdx] = setIdx;
			stepItr++;
		}

		fIdx = steps[stepItr][1];
		let res = {
			num: steps[stepItr][0],
			fileIndex: fIdx
		};
		seq = qode[fIdx].seq;
		set = qode[fIdx].set;
		setIdx = setIdxs[fIdx];
		return res;
	}

	nextPart() {
		if (setIdx + 1 >= set.length) {
			log('ERROR: ' + (setIdx + 1) +
				' overflow of set length ' + set.length);
			log(set);
			check = false;
			return false;
		}
		cur = set[setIdx + 1];
		if (setIdx >= 0) {
			past = set[setIdx];
		} else {
			past = set[setIdx + 1];
		}

		if (check && (cur.num != past.num)) {
			check = false;
			return false;
		}
		check = true;
		setIdx++;
		log(cur);
		let part = {};
		if (cur.num >= 1) {
			part.move = this.distanceToPart();
			if (part.move.lines == 0) {
				part.move = null;
			}
		}
		if (cur.lines >= 0) {
			if (cur.lines == 0) {
				part.deleteLines = seq[cur.opt.d].lines;
				let firstChar = cur.text[0];
				let lastChar = cur.text[cur.text.length - 1];
				let regexReplace = `${firstChar}[^${lastChar}]*${lastChar}`;
				regexReplace = new RegExp(regexReplace);
				part.text = seq[cur.opt.d].text;
				part.text = part.text.replace(regexReplace, cur.text);
			} else {
				part.text = cur.text;
			}
		} else {
			part.deleteLines = -cur.lines;
		}
		return part;
	}

	nextSlide() {
		if (slideItr + 1 < lessons.length &&
			lessons[slideItr + 1].num == steps[stepItr][0]) {
			slideItr++;
			return lessons[slideItr].text;
		}
		return 'same';
	}

	parseFile(file, data, fileIdx) {
		let lines, match, mod, prevMatch, tag, tags;
		let text, primarySeqIdx, regex, splitStr, qommentRegex;
		let loop = true;
		seq = [];
		set = [];
		// parse files of different languages
		// splitStr is the comment syntax for that language
		file.ext = file.ext.toLowerCase();
		switch (file.ext) {
			// case '.css':
			//   splitStr = '/*';
			//   regex = /(\n|^)^.*\/\*\d[^\n]*/gm;
			//   break;
			case '.js':
			case '.java':
			case '.pde':
			case '.md':
				splitStr = /\n*\s*\/\//gm;
				qommentRegex = /(\n*\s*\/\/\d[^\n]*)+/gm;
				regex = /(\n|^)^.*(\n*\s*\/\/\d[^\n]*)+/gm;
				break;
			default:
				log(`ignoring file: ${file.dir}/${file.base}`);
				return;
		}
		for (let j = -1; loop; j++, primarySeqIdx = j) {
			if (((match = regex.exec(data)) == null)) {
				match = {
					index: data.length - 1
				};
				loop = false;
			}
			if (prevMatch != null) {
				// the text of this step goes from the start of prevMatch to the
				// start of match if loop is false (this is the end of the file)
				// add another line
				text = data.slice(prevMatch.index, match.index);
				text += ((loop) ? '' : '\n');
				// if no new line char/char seqence is found then line length is 1
				lines = (text.match(/\r\n|\r|\n/g) || [1]).length;
				// the first line of the step, split and pop after the splitStr
				// to get the tags, then get the individual tags with tagRegex
				tags = prevMatch[0].match(qommentRegex)[0];
				tags = tags.replace(splitStr, ' ').match(tagRegex);
				// there are three types of tag: step number, editor, and option
				// cur will change if more than one step number tag is found
				let cur;
				for (let k = 0; k < tags.length; k++) {
					tag = tags[k];
					if (/[^ \w][^\);]+[\);]/.test(tag)) {
						// test for editor tags
						cur.lines = 0;
						cur.text = tag;
					} else if (/[a-zA-Z]+[^ a-zA-Z]*/.test(tag)) {
						// test for any option tag
						let multiTagNum;
						log(tag);
						for (multiTagNum = 0; multiTagNum + 1 < tag.length &&
							/[a-zA-Z]/.test(tag[multiTagNum + 1]); multiTagNum++) {}
						for (let tagNum = 0; tagNum < multiTagNum + 1; tagNum++) {
							cur.opt[tag[tagNum]] = tag.slice(multiTagNum + 1);
						}
					} else if (/[\d\.]+/.test(tag)) {
						// the first tag will always be the step number tag, so cur
						// will be assigned to the obj created below this if stmt
						// if another step number tag is found then the current step
						// is complete and is pushed to the arrays seq and set
						// the seqIdx, j, is increased and the old cur is replaced by
						// the object created after the if statement
						if (k > 0) {
							cur.seqIdx = j++;
							seq.push(cur);
							set.push(cur);
						}
						// file: index of the file
						// lines: the number of lines the step has or the number of
						//   lines to remove
						// num: the step number tag string must be converted to a
						//   js Number
						// opt: assigned an empty object if k is 0, else assigned the
						//   delete option with step num primarySeqIdx, the seqIdx of
						//   the first step
						// seqIdx: j, the seqence index of the step part in the file
						// setIdx: set index is the index of the step part in an
						//   ordered list of all step parts.  -1 is a placeholder, a
						//   proper value is assigned after the set array is sorted.
						// text: the text of the step part. 'd' for delete, was/is
						//   usefulfor debugging purposes if the program were to try
						//   to print a delete step part somehow.
						cur = {
							lines: ((k == 0) ? lines : -lines),
							num: Number(tag).toFixed(2),
							opt: ((k == 0) ? {} : {
								d: primarySeqIdx
							}),
							seqIdx: j,
							setIdx: -1,
							text: ((k == 0) ? text : 'd')
						};
						if ((file.ext != '.md') && (!(cur.num in steps))) {
							steps[cur.num] = fileIdx;
						}
					}
				}
				seq.push(cur);
				set.push(cur);
				prevMatch = match;
			} else {
				prevMatch = match;
			}
		}
		if (set) {

			// sort from least to greatest step number
			set.sort((a, b) => {
				if (a.num < b.num) return -1;
				if (a.num > b.num) return 1;
				return a.seqIdx - b.seqIdx;
			});
			// setIdx is assigned it's proper value after the sort
			for (let q = 0; q < set.length; q++) {
				set[q].setIdx = q;
			}
			log(set);
			if (file.ext == '.md') {
				for (let q = 0; q < set.length; q++) {
					lessons.push({
						num: set [q].num,
						text: set [q].text
					});
				}
				return;
			}
			qode.push({
				seq: seq,
				set: set
			});
			setIdxs.push(-1);
			return true;
		}
		return;
	}

	countLines(init, dest) {
		let result = 0;
		for (let i = init; i < dest; i++) {
			if (seq[i].setIdx < cur.setIdx) {
				result += seq[i].lines;
			}
		}
		return result;
	}

	// finds the shortest distance in lines to the part
	distanceToPart() {
		let from = {
			start: -1,
			past: -1,
			end: -1
		};
		from.start = this.countLines(0, cur.seqIdx);
		if (past.seqIdx < cur.seqIdx) {
			// count down
			from.past = this.countLines(past.seqIdx + 1, cur.seqIdx);
		} else {
			// count up
			from.past = this.countLines(cur.seqIdx + 1, past.seqIdx + 1);
		}
		from.end = this.countLines(cur.seqIdx, seq.length);

		let res = {
			from: {}
		};
		if (from.end < from.start && from.end < from.past) {
			res.from.end = true;
			res.lines = from.end;
			res.direction = 'up';
		} else if (from.past < from.start) {
			res.from.past = true;
			res.lines = from.past;
			res.direction = ((past.seqIdx < cur.seqIdx) ? 'down' : 'up');
		} else {
			res.from.start = true;
			res.lines = from.start;
			res.direction = 'down';
		}

		return res;
	}
}

if (module) {
	module.exports = new Qodemate();
}
