var fs = require('fs');
var assert = require('assert');

var expected = fs.readFileSync('./test/expected/main.css', 'utf8');
var result = fs.readFileSync('./test/main.css', 'utf8');

assert(expected === result);
