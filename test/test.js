'use strict';
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var filterCss = require('../');
var pkg = require('../package.json');
var skipWin = process.platform === 'win32'? it.skip : it;
var exec = require('child_process').exec;
var execFile = require('child_process').execFile;

function read (file) {
	return fs.readFileSync(file, { encoding: 'utf8' });
}

describe('Module', function(){
	it('should work with css string', function(){
		try {
			var css = filterCss(read('test/fixtures/test.css'),[/body/]);
			expect(css).to.not.contain('body');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should work with stylesheet file', function(){
		try {
			var css = filterCss('test/fixtures/test.css',[/body/]);
			expect(css).to.not.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selecror');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});



	it('should remove types specified by shorthand for type', function () {
		try {
			var css = filterCss(read('test/fixtures/test.css'),['@font-face']);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.not.contain('font-face');
			expect(css).to.contain('.my.awesome.selecror');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove selectors specified by shorthand RegExp', function () {
		try {
			var css = filterCss(read('test/fixtures/test.css'),[/awesome/]);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.not.contain('.my.awesome.selecror');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove selectors from media queries', function () {
		try {
			var css = filterCss(read('test/fixtures/test.css'),[/main/]);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selecror');
			expect(css).to.not.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove selectors when shorthand is string', function () {
		try {
			var css = filterCss(read('test/fixtures/test.css'),['main h1 > p']);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selecror');
			expect(css).to.not.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should not remove declarations when using shorthands', function () {
		try {
			var css = filterCss(read('test/fixtures/test.css'),[/url\(/]);
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selecror');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.contain('/myImage.jpg');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove declarations if value matches RegExp', function () {
		try {
			var css = filterCss(read('test/fixtures/test.css'),{declarations: [/url\(/]});
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selecror');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.not.contain('/myImage.jpg');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove declarations if value matches String', function () {
		try {
			var css = filterCss(read('test/fixtures/test.css'),{declarations: ['url(\'/myImage.jpg\')']});
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selecror');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			expect(css).to.not.contain('/myImage.jpg');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove selectors specified by RegExp', function () {
		try {
			var css = filterCss(read('test/fixtures/test.css'),{selectors: [/awesome/]});
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.not.contain('.my.awesome.selecror');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove selectors specified by String', function () {
		try {
			var css = filterCss(read('test/fixtures/test.css'),{selectors: ['main h1 > p']});
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.contain('font-face');
			expect(css).to.contain('.my.awesome.selecror');
			expect(css).to.not.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should remove types specified by string with @', function () {
		try {
			var css = filterCss(read('test/fixtures/test.css'),{types: ['@font-face']});
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.not.contain('font-face');
			expect(css).to.contain('.my.awesome.selecror');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});
	it('should remove types specified by string', function () {
		try {
			var css = filterCss(read('test/fixtures/test.css'),{types: ['font-face']});
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.not.contain('font-face');
			expect(css).to.contain('.my.awesome.selecror');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});
	it('should remove types specified by regexp', function () {
		try {
			var css = filterCss(read('test/fixtures/test.css'),{types: [/face/]});
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.not.contain('font-face');
			expect(css).to.contain('.my.awesome.selecror');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
		} catch (err) {
			expect(err).to.not.exist();
		}
	});

	it('should work with a matching function', function () {
		try {
			var css = filterCss(read('test/fixtures/test.css'),function(type, data){
				return type === 'type' && data === 'font-face' ||
					type === 'selector' && data.match(/test/) ||
					type === 'declaration' && /background/.test(data.property) && /url/.test(data.value);
			});
			expect(css).to.contain('body');
			expect(css).to.contain('html');
			expect(css).to.not.contain('font-face');
			expect(css).to.contain('.my.awesome.selecror');
			expect(css).to.contain('main h1 > p');
			expect(css).to.not.contain('.test');
			expect(css).to.not.contain('/myImage.jpg');
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
			expect(css).to.contain('.my.awesome.selecror');
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
			expect(css).to.contain('.my.awesome.selecror');
			expect(css).to.contain('main h1 > p');
			expect(css).to.contain('.test');
			done();
		});
	});
});
