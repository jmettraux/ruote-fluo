
/*
 *  OpenWFEru - open source ruby workflow and bpm engine
 *  (c) 2008 John Mettraux
 *
 *  OpenWFEru is freely distributable under the terms 
 *  of a BSD-style license.
 *  For details, see the OpenWFEru web site: http://openwferu.rubyforge.org
 *
 *  This piece of hack was created during the RubyKaigi2008,
 *  between Tsukuba and Akihabara.
 */

//var flow = [ 'process-definition', { 'name': 'toto', 'revision': '1.0' }, [
//    [ 'sequence', {}, [
//      [ 'participant', { 'ref': 'alpha' }, [] ],
//      [ 'bravo', {}, [] ]
//    ]]
//  ]
//]

HTMLElement.prototype.firstChildOfClass = function (className) {
  
  for (var i=0; i < this.childNodes.length; i++) {
    var c = this.childNodes[i];
    if (c.className == className) return c;
  }

  return null;
}
String.prototype.tstrip = function () {
  var s = this;
  while (s.charAt(0) == ' ') s = s.substring(1);
  while (s.charAt(s.length - 1) == ' ') s = s.substring(0, s.length - 1);
  return s;
}

var Tred = function () {

  var ExpressionHead = function () {

    function createButton (imgsrc, tooltip, callback) {

      var i = document.createElement("img");
      i.callback = callback;
      i.className = "tred_button";
      i.setAttribute('src', imgsrc);
      i.setAttribute('title', tooltip);
      i.setAttribute("onclick", "this.callback()");
      return i;
    }

    function addHeadButtons (expdiv) {

      var outOpacity = 0.0;

      var buttons = document.createElement("span");
      buttons.style.opacity = outOpacity;

      expdiv.onmouseover = function () { 
        buttons.style.opacity = 1.0; 
        Tred.onOver(computeExpId(expdiv.parentNode));
      };
      expdiv.onmouseout = function () { 
        buttons.style.opacity = outOpacity; 
        Tred.onOver(null);
      };

      buttons.appendChild(createButton(
        'images/btn-add.gif',
        'add a child expression',
        function () {
          Tred.addExpression(expdiv.parentNode, [ "---", {}, [] ]);
        }));
      buttons.appendChild(createButton(
        'images/btn-cut.gif',
        'cut expression',
        function () {
          Tred.removeExpression(expdiv.parentNode);
        }));

      buttons.appendChild(createButton(
        'images/btn-moveup.gif',
        'move expression up',
        function () {
          Tred.moveExpression(expdiv.parentNode, -1);
          buttons.style.opacity = outOpacity;
        }));

      buttons.appendChild(createButton(
        'images/btn-movedown.gif',
        'move expression down',
        function () {
          Tred.moveExpression(expdiv.parentNode, +1);
          buttons.style.opacity = outOpacity;
        }));

      buttons.appendChild(createButton(
        'images/btn-paste.gif',
        'paste expression here',
        function () {
          var clip = document._tred_clipboard;
          if (clip) Tred.insertExpression(expdiv.parentNode, clip);
        }));

      expdiv.appendChild(buttons);
    }

    return {

      render: function (exp) {

        var expname = exp[0];

        var text = '';
        if ((typeof exp[2][0]) == 'string') text = exp[2].shift();

        //var atts = [];
        //for (key in exp[1]) { 
        //  var skey = key.replace(/-/, '_');
        //  var sval = fluoToJson(exp[1][key]);
        //  atts.push("" + skey + ': ' + sval);
        //}
        //atts = atts.join(", ");
        var atts = fluoToJson(exp[1]);
        atts = atts.substring(1, atts.length - 1);

        var d = document.createElement('div');

        var sen = document.createElement('span');
        sen.setAttribute('class', 'tred_exp_span tred_expression_name');
        sen.appendChild(document.createTextNode(expname));
        d.appendChild(sen);

        var ses = document.createElement('span');
        ses.setAttribute('class', 'tred_exp_span tred_expression_string');
        var t = text;
        if (t != '') t = ' ' + t;
        ses.appendChild(document.createTextNode(t));
        d.appendChild(ses);

        var sea = document.createElement('span');
        sea.setAttribute('class', 'tred_exp_span tred_expression_atts');
        sea.appendChild(document.createTextNode(' ' + atts));
        d.appendChild(sea);

        addHeadButtons(d);

        var onblur = function () {

          var p = d.parentNode;
          var d2 = ExpressionHead.render(ExpressionHead.parse(this.value));
          p.replaceChild(d2, d);

          triggerChange(p); // trigger onChange()...
        };

        var onkeyup = function (evt) {

          var e = evt || window.event;
          var c = e.charCode || e.keyCode;
          if (c == 13) this.blur();

          return false;
        }

        var onclick = function () {
          d.removeChild(sen);
          d.removeChild(ses);
          var input = document.createElement('input');
          input.setAttribute('type', 'text');
          input.value = expname + ' ' + atts;
          if (text != '') input.value = expname + ' ' + text + ' ' + atts;
          d.replaceChild(input, sea);
          input.onblur = onblur;
          input.onkeyup = onkeyup;
          input.focus();
        };

        sen.onclick = onclick;
        ses.onclick = onclick;
        sea.onclick = onclick;

        return d;
      },

      parse: function (s) {

        var m = s.match(/^(\S*)( [.]*[^:]*)?( .*)?$/);

        if (m == null) return ['---', {}, []];

        var expname = m[1];

        var children = [];
        if (m[2]) {
          var t = m[2].tstrip();
          if (t != '') children.push(t);
        }

        var atts = m[3];
        atts = atts ? fluoFromJson('({' + atts + '})') : {};

        return [ expname, atts, children ];
      },

      toExp: function (node) {
        node = node.firstChild;
        var name = node.childNodes[0].firstChild.nodeValue;
        var text = node.childNodes[1].firstChild.nodeValue;
        var atts = node.childNodes[2].firstChild.nodeValue;
        atts = fluoFromJson('({' + atts + '})');
        var children = [];
        if (text != '') children.push(text);
        return [ name, atts, children ];
      }
    };
  }();

  function asJson (node) {

    if ((typeof node) == 'string') 
      node = document.getElementById(node);

    return fluoToJson(toTree(node));
  }
  
  function onChange (tree) {

    alert("Tred.onChange(tree) : please override me");
  }

  function onOver (expid) {

    alert("Tred.onOver(expid) : please override me");
  }

  function renderOpening (node, exp) {

    var opening = ExpressionHead.render(exp);

    //var outOpacity = 0.03;
    var outOpacity = 0.0;


    node.appendChild(opening);
  }

  function renderEnding (node, exp) {

    var ending = document.createElement("div");
    ending.className = "tred_text";
    if (exp[2].length > 0) ending.appendChild(document.createTextNode("end"));
    node.appendChild(ending);
  }

  function renderExpressionString (node, s) {

    var opening = document.createElement("div");

    var sname = document.createElement("span");
    sname.appendChild(document.createTextNode(s));
    sname.setAttribute("onclick", "EditableSpan.toInput(this);");
    sname.className = "tred_expression_string";
    opening.appendChild(sname);

    node.appendChild(opening);
  }

  function addExpression (parentExpNode, exp) {

    var end = parentExpNode.lastChild;
    var node = renderExpression(parentExpNode, exp);
    parentExpNode.replaceChild(node, end);
    parentExpNode.appendChild(end);

    triggerChange(parentExpNode);
  }

  function removeExpression (expNode) {

    var p = expNode.parentNode;
    p.removeChild(expNode);

    document._tred_clipboard = toTree(expNode);

    triggerChange(p);
  }

  function renderExpression (parentNode, exp, isRootExp) {

    //
    // draw expression

    var node = document.createElement("div");
    node.className = "tred_expression";
    if ( ! isRootExp) {
      //node.setAttribute("style", "margin-left: "+this.indentation+"px;");
      node.setAttribute("style", "margin-left: 14px;");
    }
    parentNode.appendChild(node);

    if ( ! (exp instanceof Array)) {

      renderExpressionString(node, exp.toString());
      return;
    }

    renderOpening(node, exp);

    //
    // draw children

    for (var i=0; i < exp[2].length; i++) { 

      var child = exp[2][i];

      renderExpression(node, child);
    }

    renderEnding(node, exp);

    return node;
  }

  function renderFlow (parentNode, flow) {

    renderExpression(parentNode, flow, true);

    parentNode.className = "tred_root";

    parentNode.stack = []; // the undo stack
    parentNode.currentTree = flow;
  }

  function moveExpression (elt, delta) {

    var p = elt.parentNode;

    if (delta == -1) { // move up
      if (elt.previousSibling.className != "tred_expression") return;
      p.insertBefore(elt, elt.previousSibling);
    }
    else { // move down
      if (elt.nextSibling.className != "tred_expression") return;
      p.insertBefore(elt, elt.nextSibling.nextSibling);
    }

    Tred.triggerChange(p); // onChange() points to the original version !
  }

  function insertExpression (before, exp) {

    var newNode = renderExpression(before.parentNode, exp);

    before.parentNode.insertBefore(newNode, before);

    Tred.triggerChange(before.parentNode);
  }

  function triggerChange (elt) {

    var tredRoot = findTredRoot(elt);
    var tree = toTree(tredRoot);

    stack(tredRoot, tree);

    Tred.onChange(tree); // onChange() points to the original version !
  }

  function stack(root, tree) {
    root.stack.push(root.currentTree);
    root.currentTree = tree;
  }

  function undo (root) {

    if ((typeof root) == 'string') root = document.getElementById(root);
    if (root.stack.length < 1) return;

    while (root.firstChild != null) root.removeChild(root.firstChild);

    var tree = root.stack.pop();

    root.currentTree = tree;
    renderExpression(root, tree, true);

    //triggerChange(root);
    Tred.onChange(tree);
  }

  function findTredRoot (node) {

      if (node.className == 'tred_root') return node;
      return findTredRoot(node.parentNode);
  }

  function computeExpId (node, from, expid) {

    if (from == null) {
      from = findTredRoot(node);
      expid = '';
    }
    if (from == node) return expid.substring(1, expid.length);

    var divs = from.childNodes;
    var childid = -1;

    for (var i=0; i<divs.length; i++) {
      var e = divs[i];
      if (e.nodeType != 1) continue;
      if (e.className != "tred_expression") continue;
      childid += 1;
      var ei = computeExpId(node, e, expid + "." + childid);
      if (ei != null) return ei;
    }

    return null;
  }

  function toTree (node) {

    node.focus();
      //
      // making sure all the input boxes get blurred...

    if (node.className != 'tred_expression') {
      node = node.firstChildOfClass('tred_expression');
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
      if (e.className != "tred_expression") continue;
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
    renderFlow: renderFlow,
    onChange: onChange,
    onOver: onOver,
    addExpression: addExpression,
    removeExpression: removeExpression,
    moveExpression: moveExpression,
    insertExpression: insertExpression,
    triggerChange: triggerChange,
    undo: undo,
    asJson: asJson
  };
}();

