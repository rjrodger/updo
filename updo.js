/*
  MIT License,
  Copyright (c) 2018-2019, Richard Rodger and other contributors.
*/
'use strict';
var Nua = require('nua');
module.exports = Updo;
// TODO: option to drop older data
// TODO: ability to dynamically reset options
function Updo(opts) {
    var self = this;
    opts = opts || {};
    var opid = opts.id;
    var when = opts.when ||
        function () {
            return Date.now();
        };
    var preserve = null == opts.preserve ? true : !!opts.preserve;
    var log = (true === opts.log
        ? console.log
        : opts.log || function () { }).bind(self);
    self._opcount = 0;
    self._opindex = 0;
    self._ops = [];
    self._hist = [];
    self._data = Object.assign({}, opts.data);
    self.log = log;
    self["do"] = function (op) {
        if (null == op)
            return;
        var opname = op.op || op.name;
        if (null == opname)
            return new Error('Operation has no name: ' + JSON.stringify(op));
        var opfunc = self[opname];
        log('OP', opid, self._opcount, opname, !!opfunc, op.args);
        if (opfunc) {
            self._hist.push(JSON.parse(JSON.stringify(self._data)));
            opfunc.call(self, op.args);
            op.when = when();
            self._ops.push(JSON.parse(JSON.stringify(op)));
            self._opindex = self._ops.length;
        }
    };
    self.data = function () {
        return self._data;
    };
    self.undo = function () {
        if (0 < self._opindex) {
            var previndex = self._opindex - 1;
            var undo_op = JSON.parse(JSON.stringify(self._ops[previndex]));
            undo_op.undo = true;
            undo_op.index = previndex;
            self._ops.push(undo_op);
            self._hist.push(JSON.parse(JSON.stringify(self._data)));
            if (preserve) {
                Nua(self._data, self._hist[previndex]);
            }
            else {
                self._data = self._hist[previndex];
            }
            self._opindex--;
        }
    };
    self.redo = function () {
        if (self._opindex < self._ops.length - 1) {
            var nextindex = self._opindex;
            var redo_op = JSON.parse(JSON.stringify(self._ops[nextindex]));
            redo_op.redo = true;
            redo_op.index = nextindex;
            self._ops.push(redo_op);
            self._hist.push(JSON.parse(JSON.stringify(self._data)));
            if (preserve) {
                Nua(self._data, self._hist[nextindex + 1]);
            }
            else {
                self._data = self._hist[nextindex + 1];
            }
            self._opindex++;
        }
    };
    // TODO: 'tree' is hard-coded!
    self.walk = function (childprop, filter) {
        var found = [];
        filter =
            'function' === typeof filter
                ? filter
                : function () {
                    return true;
                };
        walker(self._data.tree, childprop, filter, found, []);
        return found;
    };
    // TODO: generalize beyond child arrays
    // TODO: early exit once sufficient found
    function walker(obj, childprop, filter, found, path) {
        if (!obj)
            return;
        //path = Lodash.clone(path)
        path = self.util.clone(path);
        path.push(obj);
        if (filter(obj)) {
            found.push({
                entry: obj,
                // path: Lodash.clone(path)
                path: self.util.clone(path)
            });
        }
        var children = obj[childprop];
        if (!children || 0 === children.length)
            return;
        // breadth first
        for (var i = 0; i < children.length; i++) {
            walker(children[i], childprop, filter, found, path);
        }
    }
    self.toString = function () {
        return (JSON.stringify(self._data) +
            ';' +
            self._opindex +
            ';' +
            JSON.stringify(self._ops) +
            ';' +
            JSON.stringify(self._hist));
    };
    self.util = {
        clone: function (obj) {
            return null == obj ? obj : JSON.parse(JSON.stringify(obj));
        }
    };
    return self;
}
//# sourceMappingURL=updo.js.map