
/*
 *  OpenWFEru - open source ruby workflow and bpm engine
 *  (c) 2008 John Mettraux
 *
 *  OpenWFEru is freely distributable under the terms 
 *  of a BSD-style license.
 *  For details, see the OpenWFEru web site: http://openwferu.rubyforge.org
 *
 *  Made in Japan
 */

//var flow = [ 'process-definition', { 'name': 'toto', 'revision': '1.0' }, [
//    [ 'sequence', {}, [
//      [ 'participant', { 'ref': 'alpha' }, [] ],
//      [ 'bravo', {}, [] ]
//    ]]
//  ]
//]

//
// <div> <!-- expression -->
//   <div> <!-- opening -->
//     <span>sequence</span>  <span>(atts)</span>
//   </div>
//   <div> <!-- c0 -->
//     <div>alpha</div>
//   </div>
//   <div> <!-- c1 -->
//     <div>bravo</div>
//   </div>
//   <div>end</div> <!-- end -->
// </div>
//

HTMLElement.prototype.firstChildOfClass = function (className) {
  
  for (var i=0; i < this.childNodes.length; i++) {
    var c = this.childNodes[i];
    if (c.className == className) return c;
  }

  return null;
}

var EditableSpan = function() {
  
  function toInput (espan) {

    var text = espan.firstChild.nodeValue;
    var einput = document.createElement("input");
    einput.className = espan.className;
    einput.setAttribute('type', 'text');
    einput.setAttribute('value', text);
    einput.setAttribute('onkeyup', "return EditableSpan.onKey(event, this);");
    einput.setAttribute('onblur', "EditableSpan.toSpan(this);");
    espan.parentNode.replaceChild(einput, espan);
    einput.focus();
  }

  function toSpan (einput) {

    var text = einput.value;
    var espan = document.createElement("span");
    espan.className = einput.className;
    espan.appendChild(document.createTextNode(text));
    espan.setAttribute("onclick", "EditableSpan.toInput(this);");
    einput.parentNode.replaceChild(espan, einput);

    var tredRoot = Tred.findTredRoot(espan);
    var tree = Tred.toJson(tredRoot);
    //var tredOut = document.getElementById(tredRoot.id + "__out");
    //tredOut.value = tree;

    Tred.onChange(tree);
  }

  function onKey (evt, einput) {

    var e = evt || window.event;
    var c = e.charCode || e.keyCode;

    //if (c == 38) {
    //  var ps = einput.parentNode.previousSibling;
    //  einput.parentNode.parentNode.insertBefore(einput.parentNode, ps);
    //}
    //else if (c == 40) {
    //  alert("down");
    //}
    //else 
    if (c == 13) {

      einput.blur();
    }

    return false;
  }

  return {
    toInput: toInput, // :)
    onKey: onKey,
    toSpan: toSpan
  };
}();

var Tred = function () {

  function onChange (jsonTree) {
    // please override
  }

  function renderOpening (node, exp) {

    var opening = document.createElement("div");

    var sname = document.createElement("span");
    sname.appendChild(document.createTextNode(exp[0]));
    sname.setAttribute("onclick", "EditableSpan.toInput(this);");
    sname.className = "tred_expression_name";
    opening.appendChild(sname);

    //opening.appendChild(document.createTextNode(" "));

    var atts = [];
    for (key in exp[1]) { 
      atts.push("" + key + ': "' + exp[1][key] + '"');
    }
    //atts = atts.substring(0, atts.length-2);
    atts = atts.join(', ');

    var satts = document.createElement("span");
    satts.setAttribute("onclick", "EditableSpan.toInput(this);");
    satts.appendChild(document.createTextNode(atts));
    satts.className = "tred_expression_atts";
    opening.appendChild(satts);

    node.appendChild(opening);
  }

  function renderEnding (node, exp) {

    var ending = document.createElement("div");
    ending.className = "tred_text";
    if (exp[2].length > 0) ending.appendChild(document.createTextNode("end"));
    node.appendChild(ending);
  }

  function renderExpression (parentNode, exp, isRootExp) {

    //
    // draw expression

    var node = document.createElement("div");
    node.className = "tred_expression";
    if ( ! isRootExp) node.setAttribute("style", "margin-left: 14px;");
    parentNode.appendChild(node);

    renderOpening(node, exp);

    //
    // draw children

    for (var i=0; i < exp[2].length; i++) { 

      renderExpression(node, exp[2][i]);
    }

    renderEnding(node, exp);
  }

  function renderFlow (parentNode, flow) {

    renderExpression(parentNode, flow, true);

    parentNode.className = "tred_root";

    //var itree = document.createElement("input");
    //itree.id = parentNode.id + "__out";
    //itree.setAttribute("type", "hidden");
    ////itree.setAttribute("type", "text");
    ////itree.style.width = "800px";
    //itree.setAttribute("value", toJson(parentNode));
    //parentNode.appendChild(itree);
  }

  function findTredRoot (node) {

      if (node.className == 'tred_root') return node;
      return findTredRoot(node.parentNode);
  }

  function toJson (node) {

    node.focus();
      //
      // making sure all the input boxes got blurred...

    if (node.className != 'tred_expression') {
      node = node.firstChildOfClass('tred_expression');
    }

    //
    // expression itself

    //var spans = node.firstChild.getElementsByTagName("span");
    var spans = node.getElementsByTagName("span");

    var expname = spans[0].firstChild.nodeValue;
    var expatts = spans[1].firstChild.nodeValue;

    //
    // children

    var divs = node.childNodes;
    var children = [];
    //if (divs.length > 1) {
    //  for (var i=1; i<divs.length-1; i++) children.push(toJson(divs[i]));
    //}
    for (var i=0; i<divs.length; i++) {
      var e = divs[i];
      if (e.nodeType != 1) continue;
      if (e.className != "tred_expression") continue;
      children.push(toJson(e));
    }
    //children = children.join(", ");

    //
    // done

    //return "['"+expname+"', {"+expatts+"}, ["+children+"]]"
    expatts = eval("({"+expatts+"})");
    return [ expname, expatts, children ];
  }

  //
  // public methods
  //
  return {
    renderFlow: renderFlow,
    findTredRoot: findTredRoot,
    toJson: toJson,
    onChange: onChange
  };
}();

//Tred.renderFlow(document.getElementById("tred"), flow);
//document.write(Tred.toJson(document.getElementById("tred")));
