# inks
> Interpolate values from a shared context into a string template (or another object).

Substitutes sections of a string marked with `` by evaluating
contents. As a convenience, the values can be referenced from a
context object.

Used by [seneca-msg-test](//github.com/voxgig/seneca-msg-test) to
support back references to earlier test results.


[![NPM][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coveralls][coveralls-badge]][coveralls-url]


## Quick Example


```js
const Inks = require('inks')

var out = Inks('`foo:bar`', {foo:{bar:'zed'}}) 
// out === 'zed'

out = Inks({deep:'`foo:bar`'}, {foo:{bar:'zed'}}) 
// out === {deep:'zed'}

out = Inks({deep:'`$.foo`'}, {foo:{bar:'zed'}}) 
// out === {deep:{bar:'zed'}}

```


Another example, where `$` references the context object.

```
const context = { red: { foo: 1, bar: 'zed'}, green: { fizz: { buzz: 'FRED' }} }
const template = 'Lorem `red:foo` ipsum `$.red.foo + $.red.bar.length` dolor `green:fizz.buzz` sit \\` amet.'

const result = Inks(template, context)

// prints:
// Lorem 1 ipsum 4 dolor FRED sit ` amet.

```

## Notes

* Value reference syntax: `key:dot-path`.
* General form: `<js-expression>` where `$ === context`.
* Single values are not converted to a string and retain their type: `red:foo` -> `1` not `'1'`.
* Anything that is not a number or string is converted to a string (if embedded) using `JSON.stringify`.


## Questions?

[@rjrodger](https://twitter.com/rjrodger)


## License
Copyright (c) 2018, Richard Rodger and other contributors.
Licensed under [MIT][].

[MIT]: ./LICENSE
[npm-badge]: https://badge.fury.io/js/inks.svg
[npm-url]: https://badge.fury.io/js/inks
[travis-badge]: https://travis-ci.org/rjrodger/inks.svg
[travis-url]: https://travis-ci.org/rjrodger/inks
[coveralls-badge]: https://coveralls.io/repos/rjrodger/inks/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/rjrodger/inks?branch=master



