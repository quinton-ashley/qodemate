#!/usr/bin/env node

const fs = require('fs');
const isDev = fs.existsSync(__dirname + '/../qodemate-core');

if (isDev) {
	require('../qodemate-core')();
} else {
	require('qodemate-core')();
}
