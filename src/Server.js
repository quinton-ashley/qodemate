module.exports = function (args, opt) {
	const bodyParser = require('body-parser');
	const chalk = require('chalk'); // open source terminal text coloring library
	const enableDestroy = require('server-destroy');
	const express = require('express');
	const fs = require('fs-extra'); // open source library adds functionality to standard node.js fs
	const md = require('markdown-it')();
	const path = require('path');
	const process = require('process'); // built-in node.js process library
	const open = require('opn');

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

	var Presenter = require('./Presenter.js');
	var ent = new Presenter([__dirname + '/../usr/test2.js']);
	// the static function allows us to retreive the content in the specified directory
	app.use('/img', express.static(__dirname + '/../img'));
	app.use('/bootstrap', express.static(__parentDir + '/node_modules/bootstrap'));
	app.use('/jquery', express.static(__parentDir + '/node_modules/jquery'));
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

	app.get('/', (req, res) => {
		let mark = __dirname + '/../usr/test0.md';
		let file = fs.readFile(mark, 'utf8', (err, data) => {
			if (err) {
				log(err);
			}
			res.render('index', {
				title: 'Hey',
				message: md.render(data.toString())
			});
		});
	});

	app.get('/next', (req, res) => {
		log('debug 0');
		ent.next();
		res.render('index', {
			title: 'Next',
			message: md.render('# next')
		});
	});

	app.get('/prev', (req, res) => {
		ent.prev();
		res.render('index', {
			title: 'Previous',
			message: md.render('# prev')
		});
	});

	app.get('/reset', (req, res) => {
		ent.reset();
		res.render('index', {
			title: 'Reset',
			message: md.render('# reset')
		});
	});

	app.get('/exit', (req, res) => {
		res.writeHead(200, {
			'Content-Type': 'text/html'
		});
		res.end('Exit successful');
		gracefulWebExit();
	});

	server = require('http').createServer(app);

	// use local port
	const port = ((args[0]) ? args[0] : 10002);
	server.listen(port, () => {
		log('server listening on port ' + port);
		if (opt.o) {
			open('http://localhost:' + port + '/');
		}
	});
	enableDestroy(server);
	process.on('SIGINT', () => {
		gracefulWebExit();
	});
};
