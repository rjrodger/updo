/* Copyright (c) 2018-2019 Richard Rodger and other contributors, MIT License */
'use strict'

const Fs = require('fs')

const Updo = require('..')

const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const lab = (exports.lab = Lab.script())
const describe = lab.describe
const it = lab.it
const expect = Code.expect

describe('updo', function () {
  it('compiled', async () => {
    expect(
      Fs.statSync(__dirname + '/../updo.ts').mtimeMs,
      'TYPESCRIPT COMPILATION FAILED - SEE WATCH'
    ).most(Fs.statSync(__dirname + '/../updo.js').mtimeMs)
  })

  it('readme', async () => {
    var a0 = new Updo()
    expect(
      a0.util.clone({ x: 1, y: 'a', z: { q: 2, w: ['e', { f: 3 }] } })
    ).equal({ x: 1, y: 'a', z: { q: 2, w: ['e', { f: 3 }] } })
  })
})
