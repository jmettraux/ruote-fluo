/*
 * Copyright (c) 2005-2013, John Mettraux, jmettraux@gmail.com
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
 * depends on jQuery
 *
 * http://jquery.com
 *
 * minified versions of this file available / can generated at
 *
 * https://github.com/jmettraux/ruote-fluo
 */


//
// RuoteFluoEditor
//
var RuoteFluoEditor = function() {

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
        RuoteFluoEditor.TEXTS.add_child_expression,
        function() {
          RuoteFluoEditor.addExpression(expdiv.parentNode, [ '---', {}, [] ]);
        }));

      if (expdiv.parentNode.parentNode != root) {

        buttons.appendChild(createButton(
          'rfe_cut',
          RuoteFluoEditor.TEXTS.cut_expression,
          function() {
            RuoteFluoEditor.removeExpression(expdiv.parentNode);
          }));
        buttons.appendChild(createButton(
          'rfe_moveup',
          RuoteFluoEditor.TEXTS.moveup_expression,
          function() {
            RuoteFluoEditor.moveExpression(expdiv.parentNode, -1);
            buttons.style.opacity = outOpacity;
          }));
        buttons.appendChild(createButton(
          'rfe_movedown',
          RuoteFluoEditor.TEXTS.movedown_expression,
          function() {
            RuoteFluoEditor.moveExpression(expdiv.parentNode, +1);
            buttons.style.opacity = outOpacity;
          }));
        buttons.appendChild(createButton(
          'rfe_paste',
          RuoteFluoEditor.TEXTS.paste_expression,
          function() {
            var clip = document._rfe_clipboard;
            if (clip) RuoteFluoEditor.insertExpression(expdiv.parentNode, clip);
          }));
      }

      expdiv.appendChild(buttons);
    }

    return {

      render: function(node, exp) {

        node = refine(node);

        var expname = exp[0];

        var text = '';
        if ((typeof exp[2][0]) === 'string') text = exp[2].shift();

        var atts = John.sfy(exp[1]);

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
          var pp = p.parentNode;

          var exp = ExpressionHead.parse(this.value);

          if (exp) {
            p.replaceChild(ExpressionHead.render(p, exp), d);
            triggerChange(p);
          }
          else {
            pp.removeChild(p);
            triggerChange(pp);
          }
        };

        // blurring on "enter"
        //
        var onkeyup = function(evt) {

          var e = evt || window.event;
          var c = e.charCode || e.keyCode;
          //console.log(e.shiftKey);
          if (c === 13) this.blur();

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

        var m = s.match(/^(\S+)(.*)$/);

        if (( ! m) || m[1].match(/^-+$/)) return null;

        return [ m[1], John.parse('{' + m[2] + '}'), [] ];
      },

      toExp: function(node) {

        node = node.firstChild;

        var name = node.childNodes[0].firstChild.nodeValue;
        var atts = node.childNodes[1].firstChild.nodeValue;

        return [ name, John.parse('{' + atts + '}'), [] ];
      }
    };
  }();

  function js(o) { return JSON.stringify(o); }

  function asJson(node) {

    return js(toTree(node));
  }

  function toRadial(tree, indent) {

    var s = '';

    for (var i = 0; i < indent; i++) { s = s + '  ' };

    s = s + tree[0];

    var atts = John.sfy(tree[1]);
    if (atts !== '') s = s + ' ' + atts;

    for (var i = 0, l = tree[2].length; i < l; i++) {
      s = s + "\n" + toRadial(tree[2][i], indent + 1);
    }

    return s;
  }

  function asRadial(node) {

    return toRadial(toTree(node), 0);
  }

  function renderEnding(node, exp) {

    var ending = document.createElement('div');
    ending.className = 'rfe_text';
    if (exp[2].length > 0) ending.appendChild(document.createTextNode('end'));
    node.appendChild(ending);
  }

  function addExpression(parentExpNode, exp) {

    parentExpNode = refine(parentExpNode);

    var end = parentExpNode.lastChild;
    var node = renderExpression(parentExpNode, exp);
    parentExpNode.replaceChild(node, end);
    parentExpNode.appendChild(end);

    if (end.childNodes.length === 0)
      end.appendChild(document.createTextNode('end'));

    triggerChange(parentExpNode);
  }

  function removeExpression(expNode) {

    expNode = refine(expNode);

    var p = expNode.parentNode;
    p.removeChild(expNode);

    if (p.childNodes.length === 2)
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

    parentNode = refine(parentNode);

    $(parentNode).addClass('rfe_root');

    while(parentNode.firstChild) {
      parentNode.removeChild(parentNode.firstChild);
    }

    renderExpression(parentNode, flow, true);

    parentNode.stack = []; // the undo stack
    parentNode.currentTree = flow;
  }

  function moveExpression(elt, delta) {

    elt = refine(elt);

    var p = elt.parentNode;

    if (delta === -1) { // move up
      if (elt.previousSibling.className != 'rfe_expression') return;
      p.insertBefore(elt, elt.previousSibling);
    }
    else { // move down
      if (elt.nextSibling.className != 'rfe_expression') return;
      p.insertBefore(elt, elt.nextSibling.nextSibling);
    }

    RuoteFluoEditor.triggerChange(p);
  }

  function insertExpression(before, exp) {

    before = refine(before);

    var newNode = renderExpression(before.parentNode, exp);

    before.parentNode.insertBefore(newNode, before);

    RuoteFluoEditor.triggerChange(before.parentNode);
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

    root = refine(root);
    if (root.stack.length < 1) return;

    while (root.firstChild != null) root.removeChild(root.firstChild);

    var tree = root.stack.pop();

    root.currentTree = tree;
    renderExpression(root, tree, true);

    if (root.onChange) root.onChange(tree);
  }

  function findRfeRoot(node) {

      node = refine(node);

      if ($(node).hasClass('rfe_root')) return node;
      return findRfeRoot(node.parentNode);
  }

  function computeExpId(node, from, expid) {

    if ( ! from) {
      from = findRfeRoot(node);
      expid = '';
    }
    if (from === node) {
      return expid.substring(1, expid.length);
    }

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

    var $node = $(refine(node));

    $node.focus(); // making sure all the input boxes get blurred...

    if ( ! $node.hasClass('rfe_expression')) {
      $node = $node.children('.rfe_expression').first();
    }

    var exp = ExpressionHead.toExp($node[0]);

    $node.children('.rfe_expression').each(function(i, c) {
      exp[2].push(toTree(c));
    });

    return exp;
  }

  function refine(o) {

    if (o.jquery) return o[0];
    if ((typeof o) !== 'string') return o;
    if (o.match(/[\.#\[]/)) return $(o)[0];
    return document.getElementById(o);
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
    asJson: asJson,
    asRadial: asRadial
  };
}();

var FluoEditor = RuoteFluoEditor; // for backward compatibility

