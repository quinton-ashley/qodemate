/*
 * Bot has methods that type, copy/paste, and open files
 * authors: quinton-ashley
 * copyright 2018
 */
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
const kb = require('robotjs');
kb.setKeyboardDelay(0);

let qodemate = {
	name: 'Qodemate',
	path: electron.app.getPath('exe')
};
if (mac) {
	qodemate.path = qodemate.path.replace(/\/Contents\/MacOS\/(Electron|qodemate)/gi, '');
}
log(qodemate);
let ide;

class Bot {
	constructor() {}

	async focusOnQodemate() {
		if (mac) {
			await opn(qodemate.path, {
				wait: false
			});
		} else {
			kb.keyTap('tab', 'alt');
		}
	}

	async focusOnIDE() {
		if (mac) {
			await opn(ide.path, {
				wait: false
			});
		} else {
			kb.keyTap('tab', 'alt');
		}
		await delay(500);
	}

	getCompatibleApps(lang) {
		switch (lang) {
			case 'css':
			case 'html':
			case 'md':
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
	async openProject(proj, lang, apps) {
		if (!win) {
			// find compatible apps for the language of the user's proj
			let compatibleApps = this.getCompatibleApps(lang);
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
		} else if (!arg.dev) {
			ide = {};
			ide.path = await dialog.selectFile('Choose your IDE');
			ide.name = path.parse(ide.path).name;
			log(ide);
		} else {
			ide = {
				path: "C:/Users/quint/AppData/Local/atom/atom.exe",
				name: "atom"
			};
		}
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
				kb.keyTap('3', command);
				await delay(1000);
				await this.copy('import existing projects into');
				await this.paste();
				kb.keyTap('enter');
				await delay(1000);
				await this.copy(proj);
				await this.paste();
				kb.keyTap('enter');
				await delay(1000);
				kb.keyTap('tab');
				kb.keyTap('enter');
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

	async focusOnFile(file) {
		switch (ide.name.toLowerCase()) {
			case 'atom':
				await this.focusOnIDE();
				kb.keyTap('p', command);
				let fileRelPath = path.relative(usrDir,
					file).replace(/\\/g, '/');
				fileRelPath = fileRelPath.replace(/^[^\/]*\//, '');
				log(fileRelPath);
				await this.copy(fileRelPath);
				await this.paste();
				kb.keyTap('enter');
				break;
			default:
				await opn(file, {
					wait: false
				});
		}
		await delay(500);
	}

	run() {
		log('running program');
		switch (ide.name.toLowerCase()) {
			case 'atom':
				break;
			default:
				kb.keyTap('r', command);
		}
	}

	clear() {
		log('clear file contents');
		kb.keyTap('a', command);
		kb.keyTap('backspace');
	}

	moveToStart() {
		log('moved to Start');
		if (mac) {
			kb.keyTap('up', command);
		} else if (win) {
			kb.keyTap('home', command);
		}
	}

	moveToEnd() {
		log('moved to End');
		if (mac) {
			kb.keyTap('down', command);
		} else if (win) {
			kb.keyTap('end', command);
		}
	}

	moveToBOL() {
		log('moved to BOL');
		if (mac) {
			kb.keyTap('left', command);
		} else if (win) {
			kb.keyTap('home');
		}
	}

	moveToEOL() {
		log('moved to EOL');
		if (mac) {
			kb.keyTap('right', command);
		} else if (win) {
			kb.keyTap('end');
		}
	}

	move(lines, direction, mod) {
		log('moved ' + lines + ' ' + direction);
		for (var i = 0; i < lines; i++) {
			if (mod) {
				kb.keyTap(direction, mod);
			} else {
				kb.keyTap(direction);
			}
		}
	}

	deleteLines(lines) {
		this.move(1, 'down');
		this.moveToBOL();
		this.move(lines, 'up', 'shift');
		kb.keyTap('backspace');
		kb.keyTap('up');
		this.moveToEOL();
		log('deleted');
	}

	async copy(text) {
		await awaitCopy(text);
	};

	async paste() {
		kb.keyTap('v', command);
		// await delay(50);
	};
}

module.exports = new Bot();