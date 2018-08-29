/*
 * Bot has methods that type, copy/paste, and open files
 * authors: quinton-ashley
 * copyright 2018
 */
const Bot = function() {
	const log = console.log;
	const err = console.error;

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
	const robot = require('robotjs');
	// robot.setKeyboardDelay(10);
	let qodemate = {
		name: 'Qodemate',
		path: path.join(global.__rootDir,
			'node_modules/electron/dist/Electron.app')
	};
	let qoapp;

	this.focusOnQodemate = async function() {
		await open(qodemate.path, {
			wait: false
		});
	}

	this.focusOnQoApp = async function() {
		await open(qoapp.path, {
			wait: false
		});
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
				robot.keyTap('3', 'command');
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
				robot.keyTap('p', 'command');
				await this.copy(path.relative(__usrDir, file).replace(/^.*\//gm, ''));
				this.paste();
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
				robot.keyTap('r', 'command');
		}
	}

	this.clear = function() {
		log('clear file contents');
		robot.keyTap('a', 'command');
		robot.keyTap('backspace');
	}

	this.moveToStart = () => {
		log('moved to Start');
		robot.keyTap('up', 'command');
	}

	this.moveToEnd = () => {
		log('moved to End');
		robot.keyTap('down', 'command');
	}

	this.moveToBOL = () => {
		log('moved to BOL');
		robot.keyTap('left', 'command');
	}

	this.moveToEOL = () => {
		log('moved to EOL');
		robot.keyTap('right', 'command');
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

	this.paste = () => {
		robot.keyTap('v', 'command');
	};
}

module.exports = new Bot();
