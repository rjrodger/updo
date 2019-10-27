/*
  MIT License,
  Copyright (c) 2016-2018, Richard Rodger and other contributors.
*/
'use strict'
module.exports = Inks
function Inks(tm, ctxt) {
  return walk(tm, make_modify_property(ctxt))
}
var walkers = {
  string: function(tm, modify_property) {
    return modify_property(tm)
  },
  object: function(tm, modify_property) {
    if (null == tm) return tm
    var obj = {}
    Object.keys(tm).forEach(function(key) {
      obj[key] = walk(tm[key], modify_property)
    })
    return obj
  },
  array: function(tm, modify_property) {
    var arr = []
    for (var i = 0; i < tm.length; i++) {
      arr.push(walk(tm[i], modify_property))
    }
    return arr
  },
  number: function(tm, modify_property) {
    return tm
  },
  bigint: function(tm, modify_property) {
    return tm
  },
  boolean: function(tm, modify_property) {
    return tm
  },
  symbol: function(tm, modify_property) {
    return tm
  },
  function: function(tm, modify_property) {
    return tm
  },
  any: function(tm, modify_property) {
    return tm
  }
}
function walk(tm, modify_property) {
  var tm_t = Array.isArray(tm) ? 'array' : typeof tm
  var walker = walkers[tm_t] || walkers.any
  return walker(tm, modify_property)
}
function make_modify_property(ctxt) {
  return function modify_property(tm) {
    return replace_values(tm, ctxt)
  }
}
function replace_values(tm, ctxt) {
  tm = tm.replace(/\\`/g, '\x07')
  var s = null
  var m = null
  var buf = []
  var last = 0
  while ((m = tm.substring(last).match(/(`.*?`)/))) {
    var cs = m[0].substring(1, m[0].length - 1)
    var index = m.index
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
    buf = buf.map(function(x) {
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
function handle_eval($vstr, $obj, $) {
  var $val = null
  eval('$val = ' + $vstr)
  return null == $val ? null : $val
}
//# sourceMappingURL=inks.js.map
