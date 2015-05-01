# filter-css [![Build Status](https://travis-ci.org/bezoerb/filter-css.svg?branch=master)](https://travis-ci.org/bezoerb/filter-css)

Filter CSS rules


## Install

```
$ npm install --save filter-css
```


## Usage

```css
body {
	margin: 0;
	padding: 0;
}

@font-face {
	font-family: 'Glyphicons Halflings';
}
```

#### Match @type
```js
var filterCss = require('filter-css');

filterCss('test/fixtures/test.css',['@font-face']);
//=> 
```
```css
body {
	margin: 0;
	padding: 0;
}
```

#### Match RegExp

```js
var filterCss = require('filter-css');

filterCss('test/fixtures/test.css',[/bod/]);
//=> 
```
```css
@font-face {
	font-family: 'Glyphicons Halflings';
}
```

#### Filter Declaration
```css
.bigBackground {
	width: 100%;
	height: 100%;
	background-image: url('some/big/image.png');
}
```

```js
var filterCss = require('filter-css');

filterCss('test/fixtures/test.css',[/url\(/]);
//=> 
```
```css
.bigBackground {
	width: 100%;
	height: 100%;
}
```

## CLI

filter-css works well with standard input.
```shell
$ cat test/fixture/test.css | filtercss --ignore @font-face
```
You can also pass in the file as an option.
```shell
$ filtercss test/fixture/test.css --ignore @font-face
```

## API

### filterCss(input, [ignores])

#### input

*Required*  
Type: `string`

CSS filepath or raw css string.

#### ignores

Type: `array`

List of RegExp, @type or selectors to remove 


## License

MIT © [Ben Zörb](http://sommerlaune.com)
