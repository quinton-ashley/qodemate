/*
 * Bot has methods that type, copy/paste, and open files
 * authors: quinton-ashley
 * copyright 2018
 */
const Bot = function() {
	const log = console.log;
	const err = console.error;

	const {
		app
	} = require('electron').remote;
	const delay = require('delay');
	const ncp = require('copy-paste');
	const open = require('opn');
	const os = require('os');
	const {
		promisify
	} = require('util');
	const path = require('path');
	const awaitCopy = promisify(ncp.copy);
	const osType = os.type();
	const linux = (osType == 'Linux');
	const mac = (osType == 'Darwin');
	const win = (osType == 'Windows_NT');
	let command;
	if (mac) {
		command = 'command';
	} else if (win) {
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
	let qoapp;

	this.focusOnQodemate = async function() {
		if (mac) {
			await open(qodemate.path, {
				wait: false
			});
		} else if (win) {
			robot.keyTap('tab', 'alt');
		}
	}

	this.focusOnQoApp = async function() {
		if (mac) {
			await open(qoapp.path, {
				wait: false
			});
		} else if (win) {
			robot.keyTap('tab', 'alt');
		}
		await delay(1000);
	}

	function getCompatibleApps(lang) {
		switch (lang) {
			case 'css':
			case 'html':
			case 'js':
			case 'pug':
				return [
					'Atom',
					'Brackets'
				];
			case 'java':
				return [
					'Eclipse',
					'Eclipse Java'
				];
			case 'pde':
				return ['Processing'];
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
		for (let comApp of compatibleApps) {
			for (let openApp in apps.open) {
				if (openApp.toUpperCase() === comApp.toUpperCase()) {
					qoapp = {
						name: comApp,
						path: apps.open[openApp]
					}
					break;
				}
			}
			if (qoapp) break;
		}
		if (!qoapp) return;
		// some apps will require more work to load projects in than simply
		// opening the project folder, Eclipse is one of them
		switch (qoapp.name) {
			case 'Atom':
			case 'Brackets':
				await open(proj, {
					app: qoapp.name,
					wait: false
				});
				break;
			case 'Eclipse':
			case 'Eclipse Java':
				await this.focusOnQoApp();
				robot.keyTap('3', command);
				await delay(1000);
				await this.copy('import existing projects into');
				this.paste();
				robot.keyTap('enter');
				await delay(1000);
				await this.copy(proj);
				this.paste();
				robot.keyTap('enter');
				await delay(1000);
				robot.keyTap('tab');
				robot.keyTap('enter');
				break;
			case 'Processing':
				log(proj + '/' + path.parse(proj).name + '.pde');
				await open(proj + '/' + path.parse(proj).name + '.pde', {
					app: qoapp.name,
					wait: false
				});
				break;
			default:
				err('no supported IDE found');
				return;
		}
		return qoapp;
	}

	this.focusOnFile = async function(file) {
		switch (qoapp.name) {
			case 'Atom':
				await this.focusOnQoApp();
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
				await open(file, {
					wait: false
				});
		}
		await delay(1000);
	}

	this.run = () => {
		log('running program');
		switch (qoapp.name) {
			case 'Atom':
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
		await delay(500);
	};
}

module.exports = new Bot();
