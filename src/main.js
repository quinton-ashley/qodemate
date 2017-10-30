module.exports = function () {
	const argv = require('minimist')(process.argv.slice(2));
	require('./server.js')(argv._, argv);
};
