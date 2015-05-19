# filter-css [![Build Status](https://travis-ci.org/bezoerb/filter-css.svg?branch=master)](https://travis-ci.org/bezoerb/filter-css)

Filter CSS rules


## Install

```
$ npm install --save filter-css
```


## Usage

```js
var filterCss = require('filter-css');
var filtered = filterCss(<input>, <pattern>, <options>);
```

#### Input

*Required*  
Type: `String`

Can be a path to the CSS file or a raw CSS string

#### Pattern

*Required*  
Type `String`,`RegExp`, `Function` or an `Array` containing it.
 
Patterns used to discard specific parts of the CSS. 
The function is invoked with three arguments (context, value, node).
                                                   
* `context` Current matching context. Could be one of `['type','media','selector','declarationProperty','declarationValue']`.
* `value` Current value.
* `node` The currently processed AST node generated by [`css`](https://github.com/reworkcss/css).  

Return true if the element should be discarded. 
 

#### Options

Per default `filter-css` will be applied to all parts of the CSS. This behavior can be customized by disabling specific matchers

| Name                       | Type      | Description   |
| -------------------------- | --------- |-------------- |
| matchSelectors             | `boolean` | Enable / disable matching of CSS selectors. |
| matchTypes                 | `boolean` | Enable / disable matching of [AST Node types](https://github.com/reworkcss/css#types) like `font-face`  |
| matchDeclarationProperties | `boolean` | Enable / disable matching of CSS properties like `background-image` |
| matchDeclarationValues     | `boolean` | Enable / disable matching of CSS values like `url(...)`
| matchMedia                 | `boolean` | Enable / disable matching of media queries like `min-device-pixel-ratio: 2` |


## Examples

```css
.bigBackground {
	width: 100%;
	height: 100%;
	background-image: url('some/big/image.png');
}

@font-face {
	font-family: 'My awesome font';
}

@media print {
    ...
}
```

```js
var filterCss = require('filter-css');

filterCss('test/fixtures/test.css',[/url\(/,'@font-face',/print/]);
```

```css
.bigBackground {
	width: 100%;
	height: 100%;
}
```

#### Remove all media queries

```js
var filterCss = require('filter-css');

filterCss('test/fixtures/test.css',/.*/,{
	matchSelectors: false,
	matchTypes: false,
	matchDeclarationProperties: false,
	matchDeclarationValues: false,
	matchMedia: true
});
```


#### Using a function matcher

```js
var filterCss = require('filter-css');

filterCss('test/fixtures/test.css',function(context, value, node) {
	return context === 'declarationValue' && value === "url('some/big/image.png')"
});

```

#### Complete Example 
```js
filterCss('test/fixtures/test.css', {
    types: ['@font-face'],
    selectors: ['.my-selector > p'],
    declarations: [/url/]
});
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

#### CLI options

See `filtercss --help` for a full list of options.

## License

MIT © [Ben Zörb](http://sommerlaune.com)
