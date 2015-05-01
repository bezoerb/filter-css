'use strict';
var _ = require('lodash');
var fs = require('fs');
var css = require('css');

function read(file) {
	return fs.readFileSync(file, {encoding: 'utf8'});
}


/**
 * Identify ignored selectors
 * @param {array} ignore
 * @param {string} key
 * @returns {Function}
 */
function identify(ignore,key) {

	return function (element) {
		if (_.isObject(element) && key) {
			element = _.result(element,key);
		}

		for (var i = 0; i < ignore.length; ++i) {
			/* If ignore is RegExp and matches selector ... */
			if (_.isRegExp(ignore[i]) && ignore[i].test(element)) {
				return true;
			}
			if (ignore[i] === element) {
				return true;
			}
		}
		return false;
	};
}


/**
 *
 * @param ignore
 * @returns {Function}
 */
function reduceRules(ignore) {
	// types to ignore are identified by leading @
	var ignoreTypes = _.filter(ignore, RegExp.prototype.test, /^@/);

	return function reducer(rules, rule) {
		// check if whole type is ignored
		if (_.indexOf(ignoreTypes, '@' + rule.type) !== -1) {
			return rules;
		}

		// check for ignores in media queries
		if (rule.type === 'media') {
			rule.rules = _.reduce(rule.rules || [], reducer, []);

			if (_.size(rule.rules)) {
				rules.push(rule);
			}
		} else if (rule.type === 'rule') {
			rule.selectors = _.reject(rule.selectors || [], identify(ignore));

			if (_.size(rule.selectors)) {
				rule.declarations = _.reject(rule.declarations || [], identify(ignore,'value'));

				rules.push(rule);
			}
		} else {
			rules.push(rule);
		}

		return rules;
	};
}

function api(stylesheet, ignore) {
	if (_.isString(ignore) || _.isRegExp(ignore)) {
		ignore = [ignore];
	}

	var sheet;
	try {
		 sheet = css.parse(read(stylesheet));
	} catch (err) {
		 sheet = css.parse(stylesheet);
	}

	sheet.stylesheet.rules = _.reduce(sheet.stylesheet.rules, reduceRules(ignore || []), []);
	return css.stringify(sheet);
}

module.exports = api;
