module.exports = function () {
	const argv = require('minimist')(process.argv.slice(2));
	require('./Server.js')(argv._, argv);
};
