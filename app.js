#!/usr/bin/env node

console.log('starting Qodemate!');
global.__rootDir = __dirname;
require('qodemate-desktop')();
