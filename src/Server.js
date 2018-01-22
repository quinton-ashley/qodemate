module.exports = function (args, opt) {
	const chalk = require('chalk'); // open source terminal text coloring library
	const enableDestroy = require('server-destroy');
	const express = require('express');
	const fs = require('fs-extra'); // open source library adds functionality to standard node.js fs
	const md = require('markdown-it')();
	const open = require('opn');
	const path = require('path');
	const process = require('process'); // built-in node.js process library
	const {
		spawn
	} = require('child_process');

	const __homeDir = require('os').homedir();
	const __parentDir = path.dirname(process.mainModule.filename);
	const log = console.log;

	let app = express();
	let server;
	const gracefulWebExit = () => {
		log("\nGracefully shutting down from SIGINT (Ctrl-C)");
		server.destroy(() => {
			log('closing server');
			process.exit();
		});
	}

	var Presenter = require('./presenter.js');
	var ent = new Presenter([__dirname + '/../usr/test2.js']);
	// the static function allows us to retreive the content in the specified directory
	app.use('/img', express.static(__dirname + '/../img'));
	app.use('/bootstrap', express.static(__parentDir + '/node_modules/bootstrap'));
	app.use('/jquery', express.static(__parentDir + '/node_modules/jquery'));
	app.use('/md-icons', express.static(__parentDir + '/node_modules/material-design-icons-iconfont'));
	app.use('/moment', express.static(__parentDir + '/node_modules/moment'));
	app.use('/p5', express.static(__parentDir + '/node_modules/p5'));
	app.use('/popper', express.static(__parentDir + '/node_modules/popper.js'));
	app.use('/tether', express.static(__parentDir + '/node_modules/tether'));
	// sets the views folder as the main folder
	app.set('views', __dirname + '/../views');
	app.use(express.static(__dirname + '/../views'));
	// sets up pug as the view engine
	// pug is template framework for rendering html dynamically
	// it's like php but way better
	app.set('view engine', 'pug');
	// use local port
	const port = ((args[0]) ? args[0] : 10005);

	app.get('/', (req, res) => {
		let mark = __dirname + '/../usr/test0.md';
		let file = fs.readFile(mark, 'utf8', (err, data) => {
			if (err) {
				log(err);
			}
			res.render('index', {
				title: 'Hey',
				md: md.render(data.toString())
			});
		});
	});

	app.get('/helium', (req, res) => {
		const helium = spawn('open', ['helium://http://127.0.0.1:' + port]);

		helium.stderr.on('data', (data) => {
			res.render('index', {
				title: 'Helium',
				md: md.render('Download the [Helium](http://heliumfloats.com/) app to use this feature!')
			});
		});

		helium.on('close', (code) => {
			log(`child process exited with code ${code}`);
			res.render('index', {
				title: 'Helium',
				md: md.render('Opened in Helium!')
			});
		});
	});

	app.get('/chrome', (req, res) => {
		let p = open('http://127.0.0.1:' + port);
		res.render('index', {
			title: 'Chrome',
			md: md.render('Opened in Chrome!')
		});
	});

	app.get('/next', (req, res) => {
		log('debug 0');
		ent.next();
		res.render('index', {
			title: 'Next',
			md: md.render('# next')
		});
	});

	app.get('/prev', (req, res) => {
		ent.prev();
		res.render('index', {
			title: 'Previous',
			md: md.render('# prev')
		});
	});

	app.get('/reset', (req, res) => {
		ent.reset();
		res.render('index', {
			title: 'Reset',
			md: md.render('# reset')
		});
	});

	app.get('/exit', (req, res) => {
		res.render('index', {
			title: 'Reset',
			md: md.render('Exit Successful')
		});
		gracefulWebExit();
	});

	server = require('http').createServer(app);

	server.listen(port, () => {
		log('server listening on port ' + port);
		if (opt.o) {
			open('http://127.0.0.1:' + port);
		}
	});
	enableDestroy(server);
	process.on('SIGINT', () => {
		gracefulWebExit();
	});
};
