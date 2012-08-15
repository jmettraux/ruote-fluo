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
 */


//
// John, a relaxed Json parser
//
var John = (function() {

  function tryParse(s) {

    try { return JSON.parse(s); } catch (e) {}; return undefined;
  }

  function extractString(s) {

    s = s.trim();

    var str = '';
    var del = null;
    var car = null;
    var cdr = s;
    var q = false;
    var curly = false;

    while(true) {

      car = cdr.slice(0, 1); cdr = cdr.slice(1);

      if (q == false && car.match(/['"]/)) {
        q = car;
      }
      else if (q == false) {
        str = str + car;
        q = true;
      }
      else if (car == q) {
        del = cdr.slice(0, 1);
        cdr = cdr.slice(1);
        break;
      }
      else if (q == true && curly == false && car.match(/[:,]/)) {
        del = car;
        break;
      }
      else if (car == '\\') {
        ncar = cdr.slice(0, 1); ncdr = cdr.slice(1);
        if (ncar.match(/[^"']/)) str = str + car;
        car = ncar; cdr = ncdr;
        str = str + ncar;
      }
      else {
        str = str + car;

        if (car == '{') curly = (curly || 0) + 1;
        else if (car == '}') curly = (curly || 0) - 1;
        if (curly < 1) curly = false;

        if ( ! cdr) break;
      }
    }

    if (q == true) str = str.trim();
    if (del == '') del = null;
    cdr = cdr.trim();

    return [ str, del, cdr ];
  }

  function parseArray(s, accu) {

    var es = extractString(s);
    accu.push(parse(es[0]));

    if (es[1]) parseArray(es[2], accu);

    return accu;
  }

  function parseObject(s, accu) {

    var ek = extractString(s);
    var k = ek[0];
    var v = null;
    var del = ek[1];
    var cdr = ek[2];
    if (del == ':') {
      ev = extractString(cdr);
      v = parse(ev[0]);
      del = ev[1];
      cdr = ev[2];
    }
    accu[k] = v;

    if (del == ',') parseObject(cdr, accu);

    return accu;
  }

  function parse(s) {

    s = s.trim();

    if (s == 'null') return null;

    var j = tryParse(s);
    if (j != undefined) return j;

    var m;

    if (s.match(/^\[.*\]$/)) {
      return parseArray(s.slice(1, -1), []);
    } else if (s.match(/^{.*}$/)) {
      return parseObject(s.slice(1, -1), {});
    } else if (m = s.match(/^'(.*)'$/)) {
      return m[1];
    } else {
      return s;
    }
  }

  function stringify(o) {

    if (o == null) return 'null'

    var t = (typeof o);

    if (t == 'number' || t == 'boolean') return '' + o;

    if (o instanceof Array) {
      var a = [];
      o.forEach(function(e) { a.push(stringify(e)); });
      if (a.length < 1) return '[]'
      return '[ ' + a.join(', ') + ' ]';
    }
    if (t == 'object') {
      var a = [];
      for(var k in o) {
        var s = stringify(k);
        var v = o[k];
        if (v != null) s = s + ': ' + stringify(v);
        a.push(s);
      }
      if (a.length < 1) return '{}'
      return '{ ' + a.join(', ') + ' }';
    }

    if (o.match(/[\s:,]/)) return JSON.stringify(o);

    return o;
  }

  this._es = extractString; // for testing purposes

  //
  // the public interface

  this.parse = parse;
  this.stringify = stringify;

  return this;

}).apply({});

