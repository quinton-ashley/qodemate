/*
 * renderer.js handles responses to user interactions with the menu and app UI
 * authors: quinton-ashley
 * copyright 2018
 */
module.exports = function(opt) {
	const err = console.err;
	const log = console.log;
	global.__rootDir = opt.__rootDir;

	const {
		app,
		dialog,
		Menu
	} = require('electron').remote;
	const fs = require('fs');
	const md = require('markdown-it')();
	const os = require('os');
	const path = require('path');
	const getOpenApps = require('get-open-apps');
	const $ = require('jquery');

	window.$ = window.jQuery = $;
	window.Tether = require('tether');
	window.Bootstrap = require('bootstrap');

	global.__usrDir = os.homedir().replace(/\\/g, '/') + '/Documents/Qodemate';

	const Presenter = require('./qodemate-presenter.js');
	let ent = new Presenter({
		bot: require('./bot.js')
	});

	let proj;

	async function play() {
		let slide = ent.nextSlide();
		log(slide);
		if (slide != 'same') {
			$('#presentation').empty();
			$('#presentation').prepend(md.render(slide));
		}
		await ent.play();
	}

	async function chooseFile() {
		proj = {
			file: '',
			ide: ''
		};
		proj.file = dialog.showOpenDialog({
			properties: ['openDirectory']
		});

		let apps = {
			open: await getOpenApps()
		};
		log(apps.open);
		let app = await ent.open(proj.file, apps);
		// proj.ide = dialog.showOpenDialog({
		//   properties: ['openFile']
		// });
		$('#open').hide();
		$('#play').show();
	}

	async function bigButtonClicked() {
		if (proj) {
			await play();
		} else {
			await chooseFile();
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
