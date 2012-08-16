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
// Inspired by Jeremy Ashkenas' underscore.
//
var Nu = (function() {

  // TODO: at some point leverage browsers' own forEach, map, reduce, filter,
  //       every, some and indexOf
  //
  // or not.

  function isListy(o) {
    //return (typeof obj.length == 'number');
    return (o.length === +o.length);
  }

  //
  // each

  var breaker = {};

  function rawEach(coll, func) {
    if (isListy(coll)) for (var i = 0; i < coll.length; i++) {
      if (func(i, coll[i]) === breaker) break;
    }
    else for (var i in coll) {
      if (func(i, coll[i]) === breaker) break;
    }
    return coll;
  }

  this.each = function(coll, func) {
    return rawEach(coll, function(k, v) {
      if (isListy(coll)) func(v, k); else func(k, v);
    });
  };

  //
  // detect, find

  this.detect = function(coll, func) {
    var ar = isListy(coll);
    var result = undefined;
    rawEach(coll, function(k, v) {
      var r = (ar) ? func(v, k) : func(k, v);
      if (r) {
        result = ar ? v : [ k, v ];
        return breaker;
      }
    });
    return result;
  }
  this.find = this.detect;

  //
  // collect, map

  this.collect = function(coll, func) {
    var ar = isListy(coll);
    var result = [];
    rawEach(coll, function(k, v) {
      result.push((ar) ? func(v, k) : func(k, v));
    });
    return result;
  }
  this.map = this.collect;

  //
  // inject, foldl, reduce

  this.inject = function(coll, memo, func) {
    if (arguments.length == 2) func = memo;
    var memoSet = arguments.length > 2;
    rawEach(coll, function(k, v) {
      if ( ! memoSet) { memo = v; memoSet = true; return; }
      memo = isListy(coll) ? func(memo, v, k) : func(memo, k, v);
    });
    return memo;
  }
  this.foldl = this.inject;
  this.reduce = this.inject;

  //
  // select, filter

  this.select = function(coll, func) {
    var ar = isListy(coll);
    var result = ar ? [] : {};
    rawEach(coll, function(k, v) {
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
    return this.reduce(ar, function(m, v) { return m > v ? m : v; });
  };
  this.min = function(ar) {
    return this.reduce(ar, function(m, v) { return m > v ? v : m; });
  };

  //
  // over.

  return this;

}).apply({});

