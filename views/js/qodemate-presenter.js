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
	const elec = require('./electronWrap.js');
	const bot = opt.bot;
	const delay = require('delay');
	const fs = require('fs-extra');
	const parseIgnore = require('gitignore-globs');
	const gitigTemplates = require('gitignore-templates');
	const ignore = require('ignore');
	const path = require('path');

	const klaw = function(dir, options) {
		return new Promise((resolve, reject) => {
			let items = [];
			let i = 0;
			require('klaw')(dir, options)
				.on('data', item => {
					if (i > 0) {
						items.push(item.path);
					}
					i++;
				})
				.on('end', () => resolve(items))
				.on('error', (err, item) => reject(err, item));
		});
	};

	const cui = require('./contro-ui.js');
	let qm = require('./qodemate-core.js');

	let usrFiles = [];
	let env, proj, linkedApp;

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
			files = await klaw(projDir, {
				nodir: true
			});
			for (let i = 0; i < files.length; i++) {
				files[i] = path.relative(projDir, files[i]);
			}
			let ig = [];
			// ig = parseIgnore(gitigTemplates('Java'));
			ig.push('.DS_Store');
			ig = ignore().add(ig);
			files = ig.filter(files);
			log(files);

			proj = __usrDir + '/' + path.parse(projDir).name;
			log(proj);
			await fs.copy(projDir, proj);

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
			let filePath = projDir + '/' + files[i];
			let file = path.parse(filePath);
			let data = await fs.readFile(filePath, 'utf8');
			let retVal = qm.parseFile(file, data, i - staticFiles);
			if (retVal) {
				usrFiles.push(proj + '/' + files[i]);
				fs.outputFile(usrFiles[i - staticFiles], '');
			} else {
				staticFiles++;
			}
		}
		qm.init();
		if (bot) {
			await bot.focusOnQodemate();
		}
	}

	async function performPart() {
		let part = qm.nextPart();
		if (!part) {
			return false;
		}
		if (part.move) {
			if (part.move.from.end) {
				bot.moveToEnd();
			} else if (part.move.from.start) {
				bot.moveToStart();
			}
			bot.move(part.move.lines, part.move.direction);
			bot.moveToEOL();
		}
		if (part.deleteLines) {
			bot.deleteLines(part.deleteLines);
		}
		if (part.text) {
			await bot.copy(part.text);
			await bot.paste();
		}
		return true;
	}

	async function perform() {
		let step = qm.nextStep();
		await bot.focusOnFile(usrFiles[step.fileIndex]);
		while (await performPart()) {
			await delay(500);
		}
		await bot.focusOnQodemate();
	}

	this.next = async function() {
		log('next');
		if (qm.hasNextStep()) {
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
		return qm.nextSlide();
	}

	this.play = async function() {
		await this.next();
	}

	this.reset = () => {
		log('reset');
		qm.restart();
		return 0;
	}

	this.close = () => {
		app.quit();
	}
}
