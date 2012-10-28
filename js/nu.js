/*
 * Copyright (c) 2012-2012, John Mettraux, jmettraux@gmail.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Made in Japan.
 */

//
// Nu, not underscore.
//
// Inspired by Jeremy Ashkenas' underscore. Not the same API.
//
var Nu = (function() {

  // TODO: at some point leverage browsers' own forEach, map, reduce, filter,
  //       every, some and indexOf
  //
  // or not.

  var self = this;

  function isListy(o) {
    //return (typeof obj.length == 'number');
    return (o.length === +o.length);
  };

  //
  // each

  var breaker = {};

  this.each = function(coll, func) {
    if (isListy(coll)) for (var i = 0; i < coll.length; i++) {
      if (func(coll[i], i) === breaker) break;
    }
    else for (var i in coll) {
      if (func(i, coll[i]) === breaker) break;
    }
    return coll;
  };

  //
  // detect, find

  this.detect = function(coll, func) {
    var result = undefined;
    self.each(coll, function(a, b) {
      if ( ! func(a, b)) return;
      result = isListy(coll) ? a : [ a, b ];
      return breaker;
    });
    return result;
  };
  this.find = this.detect;

  //
  // collect, map

  this.collect = function(coll, func) {
    var result = [];
    self.each(coll, function(a, b) { result.push(func(a, b)); });
    return result;
  };
  this.map = this.collect;

  //
  // inject, foldl, reduce

  this.inject = function(coll, memo, func) {
    if (arguments.length == 2) func = memo;
    var nomemo = arguments.length < 3;
    self.each(coll, function(a, b) {
      if (nomemo) { memo = isListy(coll) ? a : b; nomemo = false; return; }
      memo = func(memo, a, b);
    });
    return memo;
  };
  this.foldl = this.inject;
  this.reduce = this.inject;

  //
  // select, filter

  this.select = function(coll, func) {
    var ar = isListy(coll);
    var result = ar ? [] : {};
    self.each(coll, function(k, v) {
      var r = ar ? func(v, k) : func(k, v);
      if ( ! r) return;
      if (ar) result.push(v); else result[k] = v;
    });
    return result;
  };
  this.filter = this.select;

  //
  // max and min

  this.max = function(ar) {
    return self.reduce(ar, function(m, v) { return m > v ? m : v; });
  };
  this.min = function(ar) {
    return self.reduce(ar, function(m, v) { return m > v ? v : m; });
  };

  //
  // flatten

  //function toArray(o) {
  //  var a = [];
  //  for (var i = 0;; i++) {
  //    if ( ! o.hasOwnProperty(i)) break;
  //    a.push(o[i]);
  //  }
  //  return a;
  //}

  function flatten(ar, depth, result) {

    if (depth < -1) depth = -1;

    self.each(ar, function(e) {
      if (Array.isArray(e) && (depth == -1 || depth > 0))
        flatten(e, depth - 1, result);
      else
        result.push(e);
    });

    return result;
  };

  this.flatten = function(ar, depth) {

    return flatten(ar, depth || -1, []);
  };

  //
  // isEmpty

  this.isEmpty = function(o) {

    if (isListy(o)) return o.length == 0;
    for (var k in o) { if (o.hasOwnProperty(k)) return false; }
    return true;
  };

  //
  // eachWithObject

  this.eachWithObject = function(coll, memo, func) {

    if (Array.isArray(coll)) {
      return self.inject(coll, memo, function(m, e) {
        func(e, m);
        return m;
      });
    }
    else {
      return self.inject(coll, memo, function(m, k, v) {
        func(k, v, m);
        return m;
      });
    }
  };

  //
  // compact

  this.compact = function(coll) {

    if (Array.isArray(coll)) {
      return self.eachWithObject(coll, [], function(e, a) {
        if (e != undefined && e != null) a.push(e);
      });
    }
    else {
      return self.eachWithObject(coll, {}, function(k, v, h) {
        if (v != undefined && v != null) h[k] = v;
      });
    }
  };

  //
  // over.

  return this;

}).apply({});

