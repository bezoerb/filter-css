'use strict';
var expect = require('chai').expect;
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var pkg = require('../package.json');
var skipWin = process.platform === 'win32'? it.skip : it;
var exec = require('child_process').exec;
var execFile = require('child_process').execFile;
var filterCss = require('../');
var filterTest = _.partial(filterCss, 'test/fixtures/test.css');

function read (file) {
	return fs.readFileSync(file, { encoding: 'utf8' });
}



describe('Module', function(){
	it('should work with css string', function(){
		try {
			var css = filterCss(read('test/fixtures/test.css'),[/body/]);
			expect(css).to.not.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.contain('only print');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should work with stylesheet file', function(){
		try {
			var css = filterTest([/body/]);
			expect(css).to.not.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.contain('only print');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should consider options', function(){
		var css = filterTest([/.*/],{
			matchSelectors: false,
			matchTypes: false,
			matchDeclarationProperties: false,
			matchDeclarationValues: false,
			matchMedia: false
		});
		expect(css).to.contain('body');
		expect(css).to.contain('html');
		expect(css).to.contain('font-face');
		expect(css).to.contain('.my.awesome.selector');
		expect(css).to.contain('main h1 > p');
		expect(css).to.contain('.test');
		expect(css).to.contain('only print');
	});

	it('should remove everything', function(){
		var css = filterTest([/.*/],{
			matchSelectors: true,
			matchTypes: true,
			matchDeclarationProperties: true,
			matchDeclarationValues: true,
			matchMedia: true
		});
		expect(css).to.not.contain('body');
		expect(css).to.not.contain('html');
		expect(css).to.not.contain('font-face');
		expect(css).to.not.contain('.my.awesome.selector');
		expect(css).to.not.contain('main h1 > p');
		expect(css).to.not.contain('.test');
		expect(css).to.not.contain('only print');

		console.log('CSS:',css);
	});

	it('should consider "matchDeclarationValues" option', function () {
		try {
			var css = filterTest([/url\(/], {
				matchDeclarationValues: false
			});
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.contain('/myImage.jpg');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove types specified by string', function () {
		try {
			var css = filterTest(['@font-face']);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.not.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.contain('only print');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove types specified by RegExp', function () {
		try {
			var css = filterTest([/font-face/]);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.not.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.contain('only print');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});
	it('should remove types with function matcher', function () {
		function filter(context,value,obj) {
			expect(obj).to.have.ownProperty('type');
			return context === 'type' && /font-face/.test(value);
		}

		try {
			var css = filterTest([filter]);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.not.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.contain('only print');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});


	it('should remove empty selectors ', function () {
		function filter(context,value,obj) {
			expect(obj).to.have.ownProperty('type');
			return obj.type === 'declaration' && (obj.property === 'width' || obj.property === 'background' );
		}

		try {
			var css = filterTest(filter);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.not.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove selectors specified by RegExp', function () {
		try {
			var css = filterTest([/awesome/]);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.not.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove selectors from media queries', function () {
		try {
			var css = filterTest([/main/]);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.not.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove selectors for string', function () {
		try {
			var css = filterTest(['main h1 > p']);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.not.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});
	it('should remove selector with function matcher', function () {
		function filter(context,value,obj) {
			expect(obj).to.have.ownProperty('type');
			return context === 'selector' && value === 'main h1 > p';
		}

		try {
			var css = filterTest(filter);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.not.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove declarations if value matches RegExp', function () {
		try {
			var css = filterTest([/url\(/]);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.not.contain('/myImage.jpg');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove declarations if property matches RegExp', function () {
		try {
			var css = filterTest([/ackgrou/]);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.not.contain('/myImage.jpg');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove declarations if value matches string', function () {
		try {
			var css = filterTest(['url(\'/myImage.jpg\')']);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.not.contain('/myImage.jpg');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove declarations with function matcher', function () {
		function filter(context,value,obj) {
			expect(obj).to.have.ownProperty('type');
			return context === 'declarationValue' && /url/.test(value);
		}

		try {
			var css = filterTest(filter);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.not.contain('/myImage.jpg');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove media if it matches string', function () {
		try {
			var css = filterTest(['only print']);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.contain('/myImage.jpg');
			expect(css).to.not.contain('only print');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove media if it matches regexp', function () {
		try {
			var css = filterTest([/print/]);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.contain('/myImage.jpg');
			expect(css).to.not.contain('only print');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove media with function matcher', function () {
		function filter(context,value,obj) {
			expect(obj).to.have.ownProperty('type');
			return context === 'media' && /print/.test(value);
		}

		try {
			var css = filterTest([filter]);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.contain('/myImage.jpg');
			expect(css).to.not.contain('only print');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});
});

describe('CLI', function(){
	// empty stdout on appveyor? runs correct on manual test with Windows 7
	skipWin('should return the version', function (done) {
		execFile('node', [path.join(__dirname, '../', pkg.bin.filtercss), '--version', '--no-update-notifier'], function(error, stdout){
			expect(stdout.replace(/\r\n|\n/g, '')).to.eql(pkg.version);
			done();
		});
	});

	it('should work well with the target stylesheet file passed as an option', function (done) {
		var cp = execFile('node', [
			path.join(__dirname, '../', pkg.bin.filtercss),
			'test/fixtures/test.css',
			'--ignore', '/main/'
		]);

		cp.stdout.on('data', function (css) {
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.not.contain('main h1 > p');
			expect(css).to.contain('.test');
			done();
		});

	});

	// pipes don't work on windows
	skipWin('should work well with the target stylesheet file piped to filtercss', function (done) {
		var cp = exec('cat test/fixtures/test.css | node ' + path.join(__dirname, '../', pkg.bin.filtercss) + ' --ignore @font-face');

		cp.stdout.on('data', function (css) {
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.not.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			done();
		});
	});

	it('should default filter options to true', function (done) {
		var cp = execFile('node', [
			path.join(__dirname, '../', pkg.bin.filtercss),
			'test/fixtures/test.css',
			'--ignore', '/.*/'
		]);

		cp.stdout.on('data', function (css) {
			expect(css).to.not.contain('body');
			expect(css).to.not.contain('html');
			expect(css).to.not.contain('font-face');
			expect(css).to.not.contain('.my.awesome.selector');
			expect(css).to.not.contain('main h1 > p');
			expect(css).to.not.contain('.test');
			done();
		});

	});

	it('should consider ignore options ', function (done) {
		var cp = execFile('node', [
			path.join(__dirname, '../', pkg.bin.filtercss),
			'test/fixtures/test.css',
			'--ignore', '/.*/','-STPVM'
		]);

		cp.stdout.on('data', function (css) {
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selector');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			done();
		});

	});
});
