'use strict';

const fs = require('fs');
const css = require('css');
const defaults = require('lodash.defaults');
const isFunction = require('lodash.isfunction');
const isRegExp = require('lodash.isregexp');
const reject = require('lodash.reject');
const result = require('lodash.result');

const _default = {
	matchSelectors: true,
	matchTypes: true,
	matchDeclarationProperties: true,
	matchDeclarationValues: true,
	matchMedia: true
};

function read(file) {
	return fs.readFileSync(file, {encoding: 'utf8'});
}

function getValue(element, pluck) {
	if (pluck) {
		return result(element, pluck);
	}

	return element;
}

/**
 * Identify ignored selectors
 * @param {array} ignores
 * @param {string} identifier
 * @param {object} node
 * @param {string} pluck attribute to pluck from object
 * @returns {Function}
 */
function _matcher(ignores, identifier, node, pluck) {
	return element => {
		for (let i = 0; i < ignores.length; ++i) {
			if (isFunction(ignores[i]) && ignores[i](identifier, getValue(element, pluck), node || element)) {
				return true;
			}

			/* If ignore is RegExp and matches selector ... */
			if (isRegExp(ignores[i]) && ignores[i].test(getValue(element, pluck))) {
				return true;
			}

			if (ignores[i] === getValue(element, pluck)) {
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
	const matcher = (...args) => _matcher(ignore, ...args);

	return function reducer(rules, rule) {
		// check if whole type is ignored
		if (opts.matchTypes && matcher('type', rule)(`@${rule.type}`)) {
			return rules;
		}

		// check for ignores in media queries
		if (rule.type === 'media') {
			if (opts.matchMedia && matcher('media', rule)(rule.media)) {
				return rules;
			}

			rule.rules = (rule.rules || []).reduce(reducer, []);

			if (rule.rules.length > 0) {
				rules.push(rule);
			}
		} else if (rule.type === 'rule') {
			// check selector
			if (opts.matchSelectors) {
				rule.selectors = reject(rule.selectors || [], matcher('selector', rule));
			}

			if (rule.selectors.length > 0) {
				// check declaration property
				if (opts.matchDeclarationProperties) {
					rule.declarations = reject(rule.declarations || [], matcher('declarationProperty', undefined, 'property'));
				}

				// check declaration value
				if (opts.matchDeclarationValues) {
					rule.declarations = reject(rule.declarations || [], matcher('declarationValue', undefined, 'value'));
				}

				// add rule if something's left
				if (rule.declarations.length > 0) {
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
	opts = defaults(opts || {}, _default);

	if (!Array.isArray(ignore)) {
		ignore = [ignore];
	}

	let sheet;
	try {
		sheet = css.parse(read(stylesheet));
	} catch (error) {
		sheet = css.parse(stylesheet);
	}

	sheet.stylesheet.rules = sheet.stylesheet.rules.reduce(reduceRules(ignore, opts), []);
	return css.stringify(sheet);
}

module.exports = api;
