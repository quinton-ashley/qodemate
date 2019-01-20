/*
 * index.js handles responses to user interactions with the menu and app UI
 * authors: quinton-ashley
 * copyright 2018
 */
module.exports = async function(opt) {
	const err = console.err;
	const log = console.log;
	global.__rootDir = opt.__rootDir;

	const remote = require('electron').remote;
	const {
		app,
		Menu
	} = remote;
	const bot = require('./bot.js');
	const delay = require('delay');
	const elec = require('./electronWrap.js');
	const fs = require('fs-extra');
	const parseIgnore = require('gitignore-globs');
	const gitigTemplates = require('gitignore-templates');
	const ignore = require('ignore');
	const md = require('markdown-it')();
	var Mousetrap = require('mousetrap');
	const os = require('os');
	const path = require('path');
	const getOpenApps = require('get-open-apps');
	const $ = require('jquery');

	window.$ = window.jQuery = $;
	window.Tether = require('tether');
	window.Bootstrap = require('bootstrap');

	global.__usrDir = os.homedir().replace(/\\/g, '/') + '/Documents/Qodemate';

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

	global.cui = require('./contro-ui.js');
	cui.start({
		v: true
	});
	require('process').on('uncaughtException', cui.err);
	cui.uiStateChange('loading');
	let qm = require('./qodemate-core.js');

	let usrFiles = [];
	let proj = {};
	let env;

	async function open() {
		let project = {};
		project.path = elec.selectDir('Choose Qodemate project');

		let apps = {
			open: await getOpenApps()
		};
		log(apps.open);
		if (!apps.open) {
			// temp solution for windows
			apps.open = {
				Atom: path.join(os.homedir().replace(/\\/g, '/'), '/AppData/Local/atom')
			};
		}
		if (!project) {
			return;
		}
		log(project);
		let files = [];
		// implement custom file search from .qodeignore project file
		// let topFiles = fs.readdirSync(project.path);
		// for (let i = 0; i < topFiles.length; i++) {
		//   topFiles[i] = topFiles[i].path;
		// }
		//				const filterFn = item => ig.ignores(item);
		files = await klaw(project.path, {
			nodir: true
		});
		for (let i = 0; i < files.length; i++) {
			files[i] = path.relative(project.path, files[i]);
		}
		let ig = [];
		// ig = parseIgnore(gitigTemplates('Java'));
		ig.push('.DS_Store');
		ig = ignore().add(ig);
		files = ig.filter(files);
		log(files);

		proj.path = __usrDir + '/' + path.parse(project.path).name;
		log(proj.path);
		await fs.copy(project.path, proj.path);

		// this is a preliminary, rudimentary way of finding
		// out which app to use for what language
		for (let i = 0; i < files.length; i++) {
			let lang = path.parse(project.path + '/' + files[i]).ext.slice(1);
			bot.qoapp = await bot.openProject(proj.path, lang, apps);
			if (bot.qoapp) break;
		}
		if (!bot.qoapp) {
			err('error no compatible app found');
			return;
		}
		log('using qoapp:');
		log(bot.qoapp);
		// single file open, I'm currently not allowing this
		//		else {
		//			files = project;
		//			let pDir = path.dirname(project.path);
		//			usrDir = __usrDir + pDir.slice(pDir.lastIndexOf('/'), -1);
		//			fs.copySync(pDir, usrDir);
		//			open(usrDir, {
		//				app: 'brackets'
		//			});
		//		}

		let staticFiles = 0;

		for (let i = 0; i < files.length; i++) {
			let filePath = project.path + '/' + files[i];
			let file = path.parse(filePath);
			let data = await fs.readFile(filePath, 'utf8');
			// parse the file with qodemate-core
			let retVal = qm.parseFile(file, data, i - staticFiles);
			if (retVal) {
				usrFiles.push(proj.path + '/' + files[i]);
				fs.outputFile(usrFiles[i - staticFiles], '');
			} else {
				staticFiles++;
			}
		}
		// init is called after parsing all the files
		qm.init();
		if (bot) {
			await bot.focusOnQodemate();
		}
		cui.uiStateChange('loaded');
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

	function nextSlide() {
		log('next slide');
		if (!usrFiles) {
			return '# no file or folder selected!';
		}
		return qm.nextSlide();
	}

	async function play() {
		log('next');
		if (!qm.hasNextStep()) {
			log('done!');
			return;
		}
		let slide = nextSlide();
		log(slide);
		if (slide != 'same') {
			$('#presentation').empty();
			$('#presentation').prepend(md.render(slide));
		}
		let step = qm.nextStep();
		await bot.focusOnFile(usrFiles[step.fileIndex]);
		while (await performPart()) {
			await delay(500);
		}
		await bot.focusOnQodemate();
	}

	cui.setCustomActions(async function(act) {
		if (act == 'quit') {
			app.quit();
		} else if (act == 'reset') {
			log('reset');
			qm.restart();
		} else if (act == 'play') {
			await play();
		}
	});

	Mousetrap.bind(['command+option+i', 'ctrl+shift+i'], function() {
		remote.getCurrentWindow().toggleDevTools();
		return false;
	});
	Mousetrap.bind(['command+w', 'ctrl+w', 'command+q', 'ctrl+q'], function() {
		cui.doAction('quit');
		return false;
	});
	Mousetrap.bind(['space'], function() {
		cui.doAction('play');
		return false;
	});
	Mousetrap.bind(['up', 'down', 'left', 'right'], function() {
		return false;
	});

	cui.setUIOnChange((state, subState, gamepadConnected) => {
		if (state == 'loaded') {
			$('#open').hide();
			$('#play').show();
		}
	});

	async function bigButtonClicked() {
		if (cui.ui == 'loaded') {
			await play();
		} else {
			await open();
		}
	}

	$('#bigButton').click(bigButtonClicked);
	$('#play').hide();
	$('#mini').hide();

	const template = [{
			label: 'File',
			submenu: [{
				label: 'Open',
				click() {
					open();
				}
			}]
		}, {
			label: 'Edit',
			submenu: [{
					role: 'undo'
				},
				{
					role: 'redo'
				},
				{
					type: 'separator'
				},
				{
					role: 'cut'
				},
				{
					role: 'copy'
				},
				{
					role: 'paste'
				},
				{
					role: 'pasteandmatchstyle'
				},
				{
					role: 'delete'
				},
				{
					role: 'selectall'
				}
			]
		},
		{
			label: 'View',
			submenu: [{
					role: 'reload'
				},
				{
					role: 'forcereload'
				},
				{
					role: 'toggledevtools'
				},
				{
					type: 'separator'
				},
				{
					role: 'resetzoom'
				},
				{
					role: 'zoomin'
				},
				{
					role: 'zoomout'
				},
				{
					type: 'separator'
				},
				{
					role: 'togglefullscreen'
				}
			]
		},
		{
			role: 'window',
			submenu: [{
					role: 'minimize'
				},
				{
					role: 'close'
				}
			]
		},
		{
			role: 'help',
			submenu: [{
				label: 'Learn More',
				click() {
					require('electron').shell.openExternal('https://electronjs.org')
				}
			}]
		}
	]

	if (process.platform === 'darwin') {
		template.unshift({
			label: 'Qodemate',
			submenu: [{
					role: 'about'
				},
				{
					type: 'separator'
				},
				{
					role: 'services',
					submenu: []
				},
				{
					type: 'separator'
				},
				{
					role: 'hide'
				},
				{
					role: 'hideothers'
				},
				{
					role: 'unhide'
				},
				{
					type: 'separator'
				},
				{
					role: 'quit'
				}
			]
		})

		// Window menu
		template[4].submenu = [{
				role: 'close'
			},
			{
				role: 'minimize'
			},
			{
				role: 'zoom'
			},
			{
				type: 'separator'
			},
			{
				role: 'front'
			}
		]
	}

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
};
