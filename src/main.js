module.exports = function () {
	let argv;
	try {
		argv = require('minimist')(process.argv.slice(2));
	} catch (err) {}
	// this is the production code that loads the qodemate-core
	require('qodemate-core')(((argv) ? argv._ : null), argv);
	// for development I'm loading the qodemate-core seperately, it must be placed in the same parent folder as qodemate
	//	require('../../qodemate-core')(((argv) ? argv._ : null), argv);
};
