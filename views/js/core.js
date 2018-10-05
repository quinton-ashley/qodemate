/*
 * qodemate-core contains the file parser, the core algorithm of Qodemate
 * the methods of this file use bot.js to present the user's project
 * authors: quinton-ashley
 * copyright 2018
 */
module.exports = function(opt) {
	const err = console.error;
	const log = console.log;

	const {
		app
	} = require('electron').remote;
	const bot = opt.bot;
	const delay = require('delay');
	const fs = require('fs-extra');
	const parseIgnore = require('gitignore-globs');
	const gitigTemplates = require('gitignore-templates');
	const ignore = require('ignore');
	const klawSync = require('klaw-sync');
	const path = require('path');

	let check = false;
	// the set index
	let setIdx = -1;
	// the sequence array stores step parts in the order they occur in the file(s)
	let seq = [];
	// the set array stores step parts in sorted order, maintaing sequence order
	// of step parts of the same number
	let set = [];
	// the slides array stores the markdown text associated with each step to
	// be displayed as a slide if the user includes a slides.md file
	let slides = [];
	let qode = [];
	let lesson = [];
	let steps = [];
	let setIdxs = [];
	let exclude = [];
	let usrFiles = [];
	let slideItr = -1;
	let stepItr = 0;
	let env, proj, linkedApp;
	let tagRegex = /([^ \w][^\);]+[\);]|[a-zA-Z][^ a-zA-Z]*|[\d\.]+)/g;

	this.open = async function(project, apps) {
		if (!project) {
			return;
		}
		log(project);
		let files = [];
		let projDir;
		if (fs.lstatSync(project[0]).isDirectory()) {
			projDir = project[0];
			// implement custom file search from .qodeignore project file
			// let topFiles = fs.readdirSync(projDir);
			// for (let i = 0; i < topFiles.length; i++) {
			//   topFiles[i] = topFiles[i].path;
			// }
			//				const filterFn = item => ig.ignores(item);
			files = klawSync(projDir, {
				nodir: true
			});
			for (let i = 0; i < files.length; i++) {
				files[i] = path.relative(projDir, files[i].path);
			}
			let ig = [];
			// ig = parseIgnore(gitigTemplates('Java'));
			ig.push('.DS_Store');
			ig = ignore().add(ig);
			files = ig.filter(files);
			log(files);

			proj = __usrDir + '/' + path.parse(projDir).name;
			log(proj);
			fs.copySync(projDir, proj);

			// this is a preliminary, rudimentary way of finding
			// out which app to use for what language
			for (let i = 0; i < files.length; i++) {
				let lang = path.parse(projDir + '/' + files[i]).ext.slice(1);
				linkedApp = await bot.openProject(proj, lang, apps);
				if (linkedApp) break;
			}
			if (!linkedApp) {
				err('error no compatible app found');
				return;
			}
			log('using app: ' + linkedApp.name);
		}
		// single file open, I'm currently not allowing this
		//		else {
		//			files = project;
		//			let pDir = path.dirname(projDir);
		//			usrDir = __usrDir + pDir.slice(pDir.lastIndexOf('/'), -1);
		//			fs.copySync(pDir, usrDir);
		//			open(usrDir, {
		//				app: 'brackets'
		//			});
		//		}

		let staticFiles = 0;

		for (let i = 0; i < files.length; i++) {
			let data = fs.readFileSync(projDir + '/' + files[i], 'utf8');
			let retVal = await parseFile(projDir + '/' + files[i], data, i - staticFiles);
			if (!retVal) {
				usrFiles.push(proj + '/' + files[i]);
				fs.outputFile(usrFiles[i - staticFiles], '');
				setIdxs.push(-1);
			} else {
				staticFiles++;
			}
		}
		steps = Object.entries(steps);
		steps.sort(function(a, b) {
			return Number(a[0]) - Number(b[0]);
		});
		log('step numbers');
		log(steps);

		if (bot) {
			await bot.focusOnQodemate();
		}
	}

	async function parseFile(file, data, index) {
		let lines, match, mod, prevMatch, tag, tags;
		let text, primarySeqIdx, isLesson, regex, splitStr;
		let loop = true;
		// parse files of different languages
		// splitStr is the comment syntax for that language
		file = path.parse(file);
		switch (file.ext.toLowerCase()) {
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
				return 2;
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
						// the first tag will always be the step number tag, so cur will
						// be assigned to the object created below this if statement
						// if another step number tag is found then the current step is
						// complete and is pushed to the arrays seq and set
						// the seqIdx, j, is increased and the old cur is replaced by the
						// object created after the if statement
						if (k > 0) {
							cur.seqIdx = j++;
							seq.push(cur);
							set.push(cur);
						}
						// file: index of the file
						// lines: the number of lines the step has or the number of lines
						//   to remove
						// num: the step number tag string must be converted to a
						//   js Number
						// opt: assigned an empty object if k is 0, else assigned the
						//   delete option with step num primarySeqIdx, the seqIdx of
						//   the first step
						// seqIdx: j, the seqence index of the step part in the file
						// setIdx: set index is the index of the step part in an ordered
						//   list of all step parts.  -1 is a placeholder, a proper value
						//   is assigned after the set array is sorted.
						// text: the text of the step part. 'd' for delete, was/is useful
						//   for debugging purposes if the program were to try to print
						//   a delete step part somehow.
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
							steps[cur.num] = index;
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
			if (file.ext != '.md') {
				qode.push({
					seq: seq,
					set: set
				});
			} else {
				for (q = 0; q < set.length; q++) {
					lesson.push({
						num: set [q].num,
						text: set [q].text
					});
				}
				isLesson = 1;
			}
			seq = [];
			set = [];
			return isLesson;
		}
		return -1;
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

	async function moveToDest(past, cur) {
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

	async function performPart() {
		if (setIdx + 1 >= set.length) {
			log('ERROR: ' + (setIdx + 1) + ' overflow of set length ' + set.length);
			log(set);
			check = false;
			return false;
		}
		let cur, past;
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
		if (cur.num >= 1) {
			await moveToDest(past, cur);
		}
		log(cur);
		setIdx++;
		if (cur.lines >= 0) {
			let textToPaste;
			if (cur.lines == 0) {
				bot.deleteLines(seq[cur.opt.d].lines);
				let firstChar = cur.text[0];
				let lastChar = cur.text[cur.text.length - 1];
				let regexReplace = `${firstChar}[^${lastChar}]*${lastChar}`;
				regexReplace = new RegExp(regexReplace);
				textToPaste = seq[cur.opt.d].text;
				textToPaste = textToPaste.replace(regexReplace, cur.text);
			} else {
				textToPaste = cur.text;
			}
			await bot.copy(textToPaste);
			bot.paste();
			return true;
		} else {
			bot.deleteLines(-cur.lines);
			return true;
		}
	}

	async function perform() {
		let fIdx = steps[stepItr][1];
		await bot.focusOnFile(usrFiles[fIdx]);
		seq = qode[fIdx].seq;
		set = qode[fIdx].set;
		setIdx = setIdxs[fIdx];
		while (await performPart()) {
			await delay(500);
		}
		setIdxs[fIdx] = setIdx;
		stepItr++;
		await bot.focusOnQodemate();
	}

	this.next = async function() {
		log('next');
		if (stepItr < steps.length) {
			await perform();
		} else {
			log('done!');
		}
	}

	this.nextSlide = () => {
		log('next slide');
		if (!usrFiles) {
			return '# no file or folder selected!';
		}
		if (slideItr + 1 < lesson.length &&
			lesson[slideItr + 1].num == steps[stepItr][0]) {
			slideItr++;
			return lesson[slideItr].text;
		}
		return 'same';
	}

	this.play = async function() {
		await this.next();
	}

	this.reset = () => {
		log('reset');
		for (let i = 0; i < setIdxs.length; i++) {
			setIdxs[i] = -1;
		}
		return 0;
	}

	this.close = () => {
		app.quit();
	}
}
