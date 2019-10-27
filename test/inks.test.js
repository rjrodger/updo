/* Copyright (c) 2018-2019 Richard Rodger and other contributors, MIT License */
'use strict'

const Fs = require('fs')

const Inks = require('..')

const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const lab = (exports.lab = Lab.script())
const describe = lab.describe
const it = lab.it
const expect = Code.expect

describe('inks', function() {
  it('compiled', async () => {
    expect(
      Fs.statSync(__dirname + '/../inks.ts').mtimeMs,
      'TYPESCRIPT COMPILATION FAILED - SEE WATCH'
    ).most(Fs.statSync(__dirname + '/../inks.js').mtimeMs)
  })

  it('readme', async () => {
    var out = Inks('`foo:bar`', { foo: { bar: 'zed' } })
    expect(out).equal('zed')

    out = Inks({ deep: '`foo:bar`' }, { foo: { bar: 'zed' } })
    expect(out).equal({ deep: 'zed' })

    out = Inks({ deep: '`$.foo`' }, { foo: { bar: 'zed' } })
    expect(out).equal({ deep: { bar: 'zed' } })

    const context = {
      red: { foo: 1, bar: 'zed' },
      green: { fizz: { buzz: 'FRED' } }
    }
    const template =
      'Lorem `red:foo` ipsum `$.red.foo + $.red.bar.length` dolor `green:fizz.buzz` sit \\` amet.'
    const result = Inks(template, context)

    expect(result).equal('Lorem 1 ipsum 4 dolor FRED sit ` amet.')
  })

  it('happy', async () => {
    expect(Inks('foo')).equal('foo')
    expect(Inks('f`oo')).equal('f`oo')
    expect(Inks('`foo')).equal('`foo')
    expect(Inks('foo`')).equal('foo`')
    expect(Inks('`foo:a`')).equal(null)
    expect(Inks('`foo:a`', { foo: {} })).equal(null)
    expect(Inks('`foo:a`', { foo: { a: 'z' } })).equal('z')
    expect(Inks('`foo:a`', { foo: { a: 1 } })).equal(1)
    expect(Inks('`foo:a`', { foo: { a: { x: 1 } } })).equal({ x: 1 })
    expect(Inks('`foo:a`~`foo:b`', { foo: { a: 'z', b: 'y' } })).equal('z~y')
    expect(Inks('`foo:a`', { foo: { a: 1 } })).equal(1)
    expect(Inks('`foo:a`', { foo: { a: { b: 1 } } })).equal({ b: 1 })
    expect(Inks('|`foo:a`|', { foo: { a: { b: 1 } } })).equal('|{"b":1}|')
    expect(Inks('|`foo:a`|', { foo: { a: 'x' } })).equal('|x|')
    expect(Inks('|`foo:a`|', { foo: { a: 9 } })).equal('|9|')
    expect(Inks('`bar:a`', { foo: { a: 1 } })).equal(null)
    expect(Inks('`foo:b`', { foo: { a: 1 } })).equal(null)
    expect(Inks('`1+1`', {})).equal(2)
    expect(Inks('`1+1`')).equal(2)
    expect(Inks('`$.a`x`$.b`y`$.c`', { a: '', b: '', c: '' })).equal('xy')
    expect(Inks('q`$.a`x`$.b`y`$.c`w', { a: '', b: '', c: '' })).equal('qxyw')

    // escaped string literals
    expect(Inks('`"a"`')).equal('a')
    expect(Inks('`"\\`a\\`"`')).equal('`a`')
  })

  it('walk', async () => {
    expect(Inks({ a: 'b' })).equal({ a: 'b' })
    expect(Inks({ a: { b: 'c' } })).equal({ a: { b: 'c' } })
    expect(Inks(['a', 'b'])).equal(['a', 'b'])
    expect(Inks({ c: ['a', { b: ['d'] }] })).equal({ c: ['a', { b: ['d'] }] })

    var c0 = { x: 1, y: 'q', z: { w: [2] }, k: [3, { e: 4 }] }
    expect(Inks('`$.x`', c0)).equal(1)
    expect(Inks({ a: '`$.x`' }, c0)).equal({ a: 1 })
    expect(Inks({ a: { b: '`$.x`' } }, c0)).equal({ a: { b: 1 } })
    expect(Inks(['s', '`$.x`', { d: 1 }], c0)).equal(['s', 1, { d: 1 }])
    expect(Inks(['s', { x: '`$.x`' }, { d: 1 }], c0)).equal([
      's',
      { x: 1 },
      { d: 1 }
    ])

    var g = () => {}
    var b = Symbol('b')

    var BigIntFunc = function(x) {
      return x
    }

    expect(
      Inks(
        {
          a: '`$.x`',
          b: b,
          c: ('function' === typeof BigInt ? BigInt : BigIntFunc)(1),
          d: true,
          e: null,
          f: void 0,
          g: g
        },
        c0
      )
    ).equal({
      a: 1,
      b: b,
      c: ('function' === typeof BigInt ? BigInt : BigIntFunc)(1),
      d: true,
      e: null,
      f: undefined,
      g: g
    })
  })
})
