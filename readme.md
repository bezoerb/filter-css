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
