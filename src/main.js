module.exports = function () {
	const argv = require('minimist')(process.argv.slice(2));
	require('../../qodemate-core')(argv._, argv);
};
