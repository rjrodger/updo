/*
  MIT License,
  Copyright (c) 2016-2018, Richard Rodger and other contributors.
*/

'use strict'

module.exports = Inks

function Inks(tm: any, ctxt: any) {
  return walk(tm, make_modify_property(ctxt))
}

let walkers: any = {
  string: (tm: string, modify_property: any) => {
    return modify_property(tm)
  },

  object: (tm: { [key: string]: any }, modify_property: any) => {
    if (null == tm) return tm

    var obj: { [key: string]: any } = {}

    Object.keys(tm).forEach(key => {
      obj[key] = walk(tm[key], modify_property)
    })

    return obj
  },

  array: (tm: any[], modify_property: any) => {
    var arr: any[] = []

    for (var i = 0; i < tm.length; i++) {
      arr.push(walk(tm[i], modify_property))
    }

    return arr
  },

  number: (tm: number, modify_property: any) => {
    return tm
  },
  bigint: (tm: bigint, modify_property: any) => {
    return tm
  },
  boolean: (tm: boolean, modify_property: any) => {
    return tm
  },
  symbol: (tm: symbol, modify_property: any) => {
    return tm
  },
  function: (tm: any, modify_property: any) => {
    return tm
  },
  any: (tm: any, modify_property: any) => {
    return tm
  }
}

function walk(tm: any, modify_property: any): any {
  let tm_t: string = Array.isArray(tm) ? 'array' : typeof tm
  let walker: any = walkers[tm_t] || walkers.any
  return walker(tm, modify_property)
}

function make_modify_property(ctxt: any) {
  return function modify_property(tm: string) {
    return replace_values(tm, ctxt)
  }
}

function replace_values(tm: string, ctxt: any) {
  tm = tm.replace(/\\`/g, '\x07')

  var s = null
  let m: RegExpMatchArray | null = null
  var buf = []
  var last = 0
  while ((m = tm.substring(last).match(/(`.*?`)/))) {
    var cs = m[0].substring(1, m[0].length - 1)

    let index: number = <number>m.index

    s = tm.substring(last, last + index)
    if ('' !== s) {
      buf.push(s)
    }

    last = last + index + m[0].length

    var csm = null
    if ((csm = cs.match(/^([^:]+):(.*)$/))) {
      var key = csm[1]
      var path = csm[2]
      var obj = ctxt && ctxt[key]
      var val = null

      if ('object' === typeof obj) {
        buf.push(handle_eval('$obj.' + path, obj, ctxt))
      } else {
        buf.push(null)
      }
    } else {
      buf.push(handle_eval(cs, null, ctxt))
    }
  }
  s = tm.substring(last, tm.length)
  if ('' !== s) {
    buf.push(s)
  }

  var out = null

  // Preserve type if single value
  if (1 === buf.length) {
    out = buf[0]
  } else {
    buf = buf.map(x => {
      if ('string' === typeof x || 'number' === typeof x) {
        return x
      } else return JSON.stringify(x)
    })
    out = buf.join('')
  }

  if ('string' === typeof out) {
    out = out.replace(/\x07/g, '`')
  }

  return out
}

// NOTE: function arguments are used by `eval`!
function handle_eval($vstr: string, $obj: object | null, $: object): any {
  var $val = null

  eval('$val = ' + $vstr)

  return null == $val ? null : $val
}
