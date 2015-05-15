'use strict';
var _ = require('lodash');
var fs = require('fs');
var css = require('css');

var _default = {
	matchSelectors: true,
	matchTypes: true,
	matchDeclarationProperties: true,
	matchDeclarationValues: true,
	matchMedia: true
};

function read(file) {
	return fs.readFileSync(file, {encoding: 'utf8'});
}


/**
 * Identify ignored selectors
 * @param {array} ignores
 * @param {string} pluck attribute to pluck from object
 * @returns {Function}
 */
function _matcher(ignores, pluck) {
	function getValue(element) {
		if (pluck) {
			return _.result(element, pluck);
		}
		return element;
	}

	return function (element) {
		for (var i = 0; i < ignores.length; ++i) {
			/* If ignore is RegExp and matches selector ... */
			if (_.isRegExp(ignores[i]) && ignores[i].test(getValue(element))) {
				return true;
			}
			if (ignores[i] === getValue(element)) {
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
 * @param opts
 */
function reduceRules(ignore, opts) {

	var match = _matcher(ignore);
	var matcher = _.partial(_matcher, ignore);


	return function reducer(rules, rule) {
		// check if whole type is ignored
		if (opts.matchTypes && match('@' + rule.type)) {
			return rules;
		}

		// check for ignores in media queries
		if (rule.type === 'media') {
			if (opts.matchMedia && match(rule.media)) {
				return rules;
			}


			rule.rules = _.reduce(rule.rules || [], reducer, []);

			if (_.size(rule.rules)) {
				rules.push(rule);
			}
		} else if (rule.type === 'rule') {
			// check selector
			if (opts.matchSelectors) {
				rule.selectors = _.reject(rule.selectors || [], match);
			}

			if (_.size(rule.selectors)) {
				// check declaration property
				if (opts.matchDeclarationProperties) {
					rule.declarations = _.reject(rule.declarations || [], matcher('property'));
				}

				// check declaration value
				if (opts.matchDeclarationValues) {
					rule.declarations = _.reject(rule.declarations || [], matcher('value'));
				}

				// add rule if something's left
				if (_.size(rule.declarations)) {
					rules.push(rule);
				}
			}
		} else {
			rules.push(rule);
		}

		return rules;
	};
}


function api(stylesheet, ignore, opts) {

	opts = _.defaults(opts || {}, _default);

	var sheet;
	try {
		sheet = css.parse(read(stylesheet));
	} catch (err) {
		sheet = css.parse(stylesheet);
	}

	sheet.stylesheet.rules = _.reduce(sheet.stylesheet.rules, reduceRules(ignore, opts), []);
	return css.stringify(sheet);
}

module.exports = api;
