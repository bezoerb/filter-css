'use strict';

const meow = require('meow');
const isString = require('lodash.isstring');
const isRegExp = require('lodash.isregexp');
const stdin = require('get-stdin');
const filterCss = require('.');

let ok;

const help = `
Usage: filtercss <input> [<option>]

Options:
  -i, --ignore RegExp, selector @type to ignore
  -S, --skipSelectors Don't match selectors
  -T, --skipTypes Don't match types
  -P, --skipDeclarationProperties Don't match declaration properties
  -V, --skipDeclarationValues Don't match declaration values
  -M, --skipMedia Don't match media
`;

const cli = meow(
	help, {
		flags: {
			ignore: {
				alias: 'i'
			},
			skipSelectors: {
				type: 'boolean',
				alias: 'S'
			},
			skipTypes: {
				type: 'boolean',
				alias: 'T'
			},
			skipDeclarationProperties: {
				type: 'boolean',
				alias: 'P'
			},
			skipDeclarationValues: {
				type: 'boolean',
				alias: 'V'
			},
			skipMedia: {
				type: 'boolean',
				alias: 'M'
			}
		}
	}
);

function go(data) {
	ok = true;
	if (isString(cli.flags.ignore) || isRegExp(cli.flags.ignore)) {
		cli.flags.ignore = [cli.flags.ignore];
	}

	const ignores = (cli.flags.ignore || []).map(ignore => {
		// check regex
		const match = ignore.match(/^\/(.*)\/([igmy]+)?$/);

		if (match) {
			return new RegExp(match[1], match[2]);
		}

		return ignore;
	});

	if (!data) {
		cli.showHelp();
		return;
	}

	const diff = filterCss(data, ignores, {
		matchSelectors: !cli.flags.skipSelectors,
		matchTypes: !cli.flags.skipTypes,
		matchDeclarationProperties: !cli.flags.skipDeclarationProperties,
		matchDeclarationValues: !cli.flags.skipDeclarationValues,
		matchMedia: !cli.flags.skipMedia
	});

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
	// get stdin
	stdin().then(go);
	setTimeout(die, 200);
}
