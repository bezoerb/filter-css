'use strict';
var meow = require('meow');
var _ = require('lodash');
var stdin = require('get-stdin');
var updateNotifier = require('update-notifier');
var filterCss = require('./');
var pkg = require('./package.json');
var ok;

var help = [
	'Usage: filtercss <input> [<option>]',
	'',
	'Options:',
	'   -i, --ignore  RegExp, selector @type to ignore'
].join('\n');

var cli = meow({help: help}, {alias: {i: 'ignore'}});

if (cli.flags['update-notifier'] !== false) {
	updateNotifier({pkg: pkg}).notify();
}

function go(data) {
	ok = true;
	if (_.isString(cli.flags.ignore) || _.isRegExp(cli.flags.ignore)) {
		cli.flags.ignore = [cli.flags.ignore];
	}
	var ignores = _.map(cli.flags.ignore || [], function(ignore) {
		// check regex
		var match = ignore.match(/^\/(.*)\/([igmy]+)?$/);

		if (match) {
			return new RegExp(_.escapeRegExp(match[1]),match[2]);
		}
		return ignore;
	});
	var diff = filterCss(data,ignores);
	console.log(diff);
	process.exit();
}

function die() {
	if (ok) {
		return;
	}
	cli.showHelp();
}


if (cli.input[0]) {
	go(cli.input[0]);
} else {
	stdin(go);
	setTimeout(die, 100);
}
