/*
 * Copyright (c) 2005-2012, John Mettraux, jmettraux@gmail.com
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

/*
 *  This piece of hack was created during the RubyKaigi2008,
 *  between Tsukuba and Akihabara.
 */

/*
 * depends on jquery and underscore
 *
 * http://jquery.com
 * http://documentcloud.github.com/underscore/
 *
 * minified versions of this file available / can generated at
 *
 * https://github.com/jmettraux/ruote-fluo
 */

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


// TODO: use jquery instead
//
try {
  HTMLElement.prototype.firstChildOfClass = function(className) {
    for (var i=0; i < this.childNodes.length; i++) {
      var c = this.childNodes[i];
      if (c.className == className) return c;
    }
    return null;
  }
} catch (e) {
  // when testing via spidermonkey
}

var FluoEditor = function() {

  var TEXTS = {
    add_child_expression: 'add a child expression',
    cut_expression: 'cut expression',
    moveup_expression: 'move expression up',
    movedown_expression: 'move expression down',
    paste_expression: 'paste expression here'
  };

  var ExpressionHead = function() {

    function createButton(rfeClass, tooltip, callback) {

      var i = document.createElement('a');
      i.callback = callback;
      i.className = 'rfe_button ' + rfeClass;
      i.setAttribute('href', '');
      i.setAttribute('title', tooltip);
      i.setAttribute('onclick', 'this.callback(); return false;');
      return i;
    }

    function addHeadButtons(expdiv) {

      var outOpacity = 0.0;

      var buttons = document.createElement('span');
      buttons.className = 'rfe_buttons';
      buttons.style.opacity = outOpacity;

      var root = findRfeRoot(expdiv);

      expdiv.onmouseover = function() {
        buttons.style.opacity = 1.0;
        if (root.onOver) root.onOver(computeExpId(expdiv.parentNode));
      };
      expdiv.onmouseout = function() {
        buttons.style.opacity = outOpacity;
        if (root.onOver) root.onOver(null);
      };

      buttons.appendChild(createButton(
        'rfe_add',
        FluoEditor.TEXTS.add_child_expression,
        function() {
          FluoEditor.addExpression(expdiv.parentNode, [ '---', {}, [] ]);
        }));

      if (expdiv.parentNode.parentNode != root) {

        buttons.appendChild(createButton(
          'rfe_cut',
          FluoEditor.TEXTS.cut_expression,
          function() {
            FluoEditor.removeExpression(expdiv.parentNode);
          }));
        buttons.appendChild(createButton(
          'rfe_moveup',
          FluoEditor.TEXTS.moveup_expression,
          function() {
            FluoEditor.moveExpression(expdiv.parentNode, -1);
            buttons.style.opacity = outOpacity;
          }));
        buttons.appendChild(createButton(
          'rfe_movedown',
          FluoEditor.TEXTS.movedown_expression,
          function() {
            FluoEditor.moveExpression(expdiv.parentNode, +1);
            buttons.style.opacity = outOpacity;
          }));
        buttons.appendChild(createButton(
          'rfe_paste',
          FluoEditor.TEXTS.paste_expression,
          function() {
            var clip = document._rfe_clipboard;
            if (clip) FluoEditor.insertExpression(expdiv.parentNode, clip);
          }));
      }

      expdiv.appendChild(buttons);
    }

    var headPattern = /^(\S+)(.*)$/;

    return {

      render: function(node, exp) {

        var expname = exp[0];

        var text = '';
        if ((typeof exp[2][0]) == 'string') text = exp[2].shift();

        var atts = John.stringify(exp[1]);
        if (atts == '{}') atts = '';
        else atts = atts.slice(1, -1);
        atts = atts.trim();

        var d = document.createElement('div');
        d.setAttribute('class', 'rfe_exp');
        node.appendChild(d);

        var sen = document.createElement('span');
        sen.setAttribute('class', 'rfe_exp_span rfe_expression_name');
        sen.appendChild(document.createTextNode(expname));
        d.appendChild(sen);

        var sea = document.createElement('span');
        sea.setAttribute('class', 'rfe_exp_span rfe_expression_atts');
        sea.appendChild(document.createTextNode(' ' + atts));
        d.appendChild(sea);

        addHeadButtons(d);

        var onblur = function() {

          var p = d.parentNode;
          var d2 = ExpressionHead.render(p, ExpressionHead.parse(this.value));
          p.replaceChild(d2, d);

          triggerChange(p); // trigger onChange()...
        };

        // blurring on "enter"
        //
        var onkeyup = function(evt) {

          var e = evt || window.event;
          var c = e.charCode || e.keyCode;
          if (c == 13) this.blur();

          return false;
        }

        // preventing propagation of "enter"
        //
        var onkeypress = function(evt) {

          var e = evt || window.event;
          var c = e.charCode || e.keyCode;

          return (c != 13);
        }

        var onclick = function() {
          d.removeChild(sen);
          var input = document.createElement('input');
          input.setAttribute('type', 'text');
          input.value = expname + ' ' + atts;
          if (text != '') input.value = expname + ' ' + text + ' ' + atts;
          d.replaceChild(input, sea);
          input.onblur = onblur;
          input.onkeyup = onkeyup;
          input.onkeypress = onkeypress;
          input.focus();
        };

        sen.onclick = onclick;
        sea.onclick = onclick;

        return d;
      },

      parse: function(s) {

        var m = s.match(headPattern);

        if (m == null) return [ '---', {}, [] ];

        var attributes = John.parse('{' + m[2] + '}');

        return [ m[1], attributes, [] ];
      },

      toExp: function(node) {

        node = node.firstChild;

        var name = node.childNodes[0].firstChild.nodeValue;
        var atts = node.childNodes[1].firstChild.nodeValue;

        atts = John.parse('{' + atts + '}');

        var children = [];

        return [ name, atts, children ];
      }
    };
  }();

  function asJson(node) {

    if ((typeof node) == 'string') node = document.getElementById(node);

    return JSON.stringify(toTree(node));
  }

  function renderEnding(node, exp) {

    var ending = document.createElement('div');
    ending.className = 'rfe_text';
    if (exp[2].length > 0) ending.appendChild(document.createTextNode('end'));
    node.appendChild(ending);
  }

  function addExpression(parentExpNode, exp) {

    var end = parentExpNode.lastChild;
    var node = renderExpression(parentExpNode, exp);
    parentExpNode.replaceChild(node, end);
    parentExpNode.appendChild(end);

    if (end.childNodes.length == 0)
      end.appendChild(document.createTextNode('end'));

    triggerChange(parentExpNode);
  }

  function removeExpression(expNode) {

    var p = expNode.parentNode;
    p.removeChild(expNode);

    if (p.childNodes.length == 2)
      p.lastChild.removeChild(p.lastChild.firstChild);

    document._rfe_clipboard = toTree(expNode);

    triggerChange(p);
  }

  function renderExpression(parentNode, exp, isRootExp) {

    //
    // draw expression

    var node = document.createElement('div');
    node.className = 'rfe_expression';

    if ( ! isRootExp)
      node.setAttribute('style', 'margin-left: 14px;');

    parentNode.appendChild(node);

    if ( ! (exp instanceof Array)) {
      renderExpressionString(node, exp.toString());
      return;
    }

    ExpressionHead.render(node, exp);

    //
    // draw children

    for (var i=0; i < exp[2].length; i++) renderExpression(node, exp[2][i]);

    //
    // over

    renderEnding(node, exp);

    return node;
  }

  function render(parentNode, flow) {

    if ((typeof parentNode) == 'string') {
      parentNode = document.getElementById(parentNode);
    }

    parentNode.className = 'rfe_root';

    while(parentNode.firstChild) {
      parentNode.removeChild(parentNode.firstChild);
    }

    renderExpression(parentNode, flow, true);

    parentNode.stack = []; // the undo stack
    parentNode.currentTree = flow;
  }

  function moveExpression(elt, delta) {

    var p = elt.parentNode;

    if (delta == -1) { // move up
      if (elt.previousSibling.className != 'rfe_expression') return;
      p.insertBefore(elt, elt.previousSibling);
    }
    else { // move down
      if (elt.nextSibling.className != 'rfe_expression') return;
      p.insertBefore(elt, elt.nextSibling.nextSibling);
    }

    FluoEditor.triggerChange(p);
  }

  function insertExpression(before, exp) {

    var newNode = renderExpression(before.parentNode, exp);

    before.parentNode.insertBefore(newNode, before);

    FluoEditor.triggerChange(before.parentNode);
  }

  function triggerChange(elt) {

    var rfeRoot = findRfeRoot(elt);
    var tree = toTree(rfeRoot);

    stack(rfeRoot, tree);

    if (rfeRoot.onChange) rfeRoot.onChange(tree);
  }

  function stack(root, tree) {
    root.stack.push(root.currentTree);
    root.currentTree = tree;
  }

  function undo(root) {

    if ((typeof root) == 'string') root = document.getElementById(root);
    if (root.stack.length < 1) return;

    while (root.firstChild != null) root.removeChild(root.firstChild);

    var tree = root.stack.pop();

    root.currentTree = tree;
    renderExpression(root, tree, true);

    if (root.onChange) root.onChange(tree);
  }

  function findRfeRoot(node) {

      if (node.className == 'rfe_root') return node;
      return findRfeRoot(node.parentNode);
  }

  function computeExpId(node, from, expid) {

    if (from == null) {
      from = findRfeRoot(node);
      expid = '';
    }
    if (from == node) return expid.substring(1, expid.length);

    var divs = from.childNodes;
    var childid = -1;

    for (var i=0; i<divs.length; i++) {
      var e = divs[i];
      if (e.nodeType != 1) continue;
      if (e.className != 'rfe_expression') continue;
      childid += 1;
      var ei = computeExpId(node, e, expid + '_' + childid);
      if (ei != null) return ei;
    }

    return null;
  }

  function toTree(node) {

    node.focus();
      //
      // making sure all the input boxes get blurred...

    if (node.className != 'rfe_expression') {
      node = node.firstChildOfClass('rfe_expression');
    }

    //
    // expression itself

    var exp = ExpressionHead.toExp(node);

    //
    // children

    var divs = node.childNodes;

    var children = exp[2];

    for (var i=0; i<divs.length; i++) {
      var e = divs[i];
      if (e.nodeType != 1) continue;
      if (e.className != 'rfe_expression') continue;
      children.push(toTree(e));
    }

    //
    // done

    return exp;
  }

  //
  // public methods
  //
  return {

    TEXTS: TEXTS,

    ExpressionHead: ExpressionHead,

    render: render,
    addExpression: addExpression,
    removeExpression: removeExpression,
    moveExpression: moveExpression,
    insertExpression: insertExpression,
    triggerChange: triggerChange,
    undo: undo,
    asJson: asJson
  };
}();

