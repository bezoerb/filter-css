'use strict';
var _ = require('lodash');
var fs = require('fs');
var css = require('css');

var _default = {
	selectors: [],
	declarations: [],
	types: []
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
function matcher(ignores, pluck) {

	function getValue(element) {
		if (pluck) {
			return _.result(element,pluck);
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
 */
function reduceRules(ignore) {

	function ignoreList(key) {
		return (_.isObject(ignore) && _.result(ignore,key)) || [];
	}


	return function reducer(rules, rule) {
		// check if whole type is ignored
		if (_.isFunction(ignore) && ignore('type',rule.type) || matcher(ignoreList('types'), 'type')(rule)) {
			return rules;
		}

		// check for ignores in media queries
		if (rule.type === 'media') {
			rule.rules = _.reduce(rule.rules || [], reducer, []);

			if (_.size(rule.rules)) {
				rules.push(rule);
			}
		} else if (rule.type === 'rule') {
			rule.selectors = _.reject(rule.selectors || [], _.isFunction(ignore) && _.partial(ignore,'selector') || matcher(ignoreList('selectors')));


			if (_.size(rule.selectors)) {
				rule.declarations = _.reject(rule.declarations || [],  _.isFunction(ignore) && _.partial(ignore,'declaration') || matcher(ignoreList('declarations'),'value'));

				rules.push(rule);
			}
		} else {
			rules.push(rule);
		}

		return rules;
	};
}

/**
 * Normalize ignore to the form {types: [], selectors: [], declarations: []}
 * @param ignore
 * @returns {object|function}
 */
function normalizeIgnore(ignore) {
	if (!ignore) {
		return _default;
	}  else if (_.isFunction(ignore)) {
		return ignore;
	} else if (_.isString(ignore) || _.isRegExp(ignore)) {
		ignore = [ignore];
	}

	// convert shorthands @... for type
	if (_.isArray(ignore)) {
		var parts = _.partition(ignore, RegExp.prototype.test, /^@/);
		return {
			types: _.invoke(parts[0],String.prototype.substr,1),
			selectors: parts[1],
			declarations: []
		};
	}

	return {
		types: _.map(ignore.types || [], function(str){
			return _.isString(str) && str.replace(/^@/,'') || str;
		}),
		selectors: ignore.selectors || [],
		declarations: ignore.declarations || []
	};

}

function api(stylesheet, ignore) {


	var sheet;
	try {
		 sheet = css.parse(read(stylesheet));
	} catch (err) {
		 sheet = css.parse(stylesheet);
	}

	sheet.stylesheet.rules = _.reduce(sheet.stylesheet.rules, reduceRules(normalizeIgnore(ignore)), []);
	return css.stringify(sheet);
}

module.exports = api;
