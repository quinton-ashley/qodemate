/*
 * Bot has methods that type, copy/paste, and open files
 * authors: quinton-ashley
 * copyright 2018
 */
const Bot = function() {
	const ncp = require('copy-paste');
	const {
		promisify
	} = require('util');
	const awaitCopy = promisify(ncp.copy);
	let command;
	if (mac) {
		command = 'command';
	} else if (win || linux) {
		command = 'control';
	}
	const robot = require('robotjs');
	robot.setKeyboardDelay(0);

	let qodemate = {
		name: 'Qodemate',
		path: app.getPath('exe')
	};
	if (mac) {
		qodemate.path = qodemate.path.replace(/\/Contents\/MacOS\/(Electron|qodemate)/gi, '');
	}
	log(qodemate);
	let ide;

	this.focusOnQodemate = async function() {
		if (mac) {
			await opn(qodemate.path, {
				wait: false
			});
		} else {
			robot.keyTap('tab', 'alt');
		}
	}

	this.focusOnIDE = async function() {
		if (mac) {
			await opn(ide.path, {
				wait: false
			});
		} else {
			robot.keyTap('tab', 'alt');
		}
		await delay(500);
	}

	function getCompatibleApps(lang) {
		switch (lang) {
			case 'css':
			case 'html':
			case 'js':
			case 'pug':
				return [
					'atom',
					'brackets'
				];
			case 'java':
				return [
					'eclipse',
					'eclipse java'
				];
			case 'pde':
				return ['processing'];
			default:
				return [];
		}
	}

	// proj is the path to the project
	// lang is the programming language
	// apps contains the available apps
	this.openProject = async function(proj, lang, apps) {
		// find compatible apps for the language of the user's proj
		let compatibleApps = getCompatibleApps(lang);

		// check if a compatible app is open
		for (let compApp of compatibleApps) {
			for (let openApp in apps.open) {
				if (openApp.toLowerCase() === compApp) {
					ide = {};
					ide.name = compApp;
					ide.path = apps.open[openApp][0];
					if (mac) {
						ide.path = ide.path.replace(/\.app.*/, '.app');
					}
					this.ide = ide;
					break;
				}
			}
			if (ide) break;
		}
		if (!ide) return;
		// some apps will require more work to load projects in than simply
		// opening the project folder, Eclipse is one of them
		switch (ide.name.toLowerCase()) {
			case 'atom':
			case 'brackets':
				await opn(proj, {
					app: ide.name,
					wait: false
				});
				break;
			case 'eclipse':
			case 'eclipse Java':
				await this.focusOnIDE();
				robot.keyTap('3', command);
				await delay(1000);
				await this.copy('import existing projects into');
				await this.paste();
				robot.keyTap('enter');
				await delay(1000);
				await this.copy(proj);
				await this.paste();
				robot.keyTap('enter');
				await delay(1000);
				robot.keyTap('tab');
				robot.keyTap('enter');
				break;
			case 'processing':
				log(proj + '/' + path.parse(proj).name + '.pde');
				await opn(proj + '/' + path.parse(proj).name + '.pde', {
					app: ide.name,
					wait: false
				});
				break;
			default:
				err('no supported IDE found');
				return;
		}
		return ide;
	}

	this.focusOnFile = async function(file) {
		switch (ide.name.toLowerCase()) {
			case 'atom':
				await this.focusOnIDE();
				robot.keyTap('p', command);
				let fileRelPath = path.relative(__usrDir,
					file).replace(/\\/g, '/');
				fileRelPath = fileRelPath.replace(/^[^\/]*\//, '');
				log(fileRelPath);
				await this.copy(fileRelPath);
				await this.paste();
				robot.keyTap('enter');
				break;
			default:
				await opn(file, {
					wait: false
				});
		}
		await delay(500);
	}

	this.run = () => {
		log('running program');
		switch (ide.name.toLowerCase()) {
			case 'atom':
				break;
			default:
				robot.keyTap('r', command);
		}
	}

	this.clear = function() {
		log('clear file contents');
		robot.keyTap('a', command);
		robot.keyTap('backspace');
	}

	this.moveToStart = () => {
		log('moved to Start');
		if (mac) {
			robot.keyTap('up', command);
		} else if (win) {
			robot.keyTap('home', command);
		}
	}

	this.moveToEnd = () => {
		log('moved to End');
		if (mac) {
			robot.keyTap('down', command);
		} else if (win) {
			robot.keyTap('end', command);
		}
	}

	this.moveToBOL = () => {
		log('moved to BOL');
		if (mac) {
			robot.keyTap('left', command);
		} else if (win) {
			robot.keyTap('home');
		}
	}

	this.moveToEOL = () => {
		log('moved to EOL');
		if (mac) {
			robot.keyTap('right', command);
		} else if (win) {
			robot.keyTap('end');
		}
	}

	this.move = (lines, direction, mod) => {
		log('moved ' + lines + ' ' + direction);
		for (var i = 0; i < lines; i++) {
			if (mod) {
				robot.keyTap(direction, mod);
			} else {
				robot.keyTap(direction);
			}
		}
	}

	this.deleteLines = (lines) => {
		this.move(1, 'down');
		this.moveToBOL();
		this.move(lines, 'up', 'shift');
		robot.keyTap('backspace');
		robot.keyTap('up');
		this.moveToEOL();
		log('deleted');
	}

	this.copy = async function(text) {
		await awaitCopy(text);
	};

	this.paste = async function() {
		robot.keyTap('v', command);
		// await delay(50);
	};
}

module.exports = new Bot();
