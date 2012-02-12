/*
 *  Ruote - open source ruby workflow engine
 *  (c) 2005-2012 jmettraux@gmail.com
 *
 *  Ruote is freely distributable under the terms of the MIT license.
 *  For details, see the ruote web site: http://ruote.rubyforge.org
 *
 *  Made in Japan
 */

/*
 * depends on jquery and underscore
 *
 * http://jquery.com
 * http://documentcloud.github.com/underscore/
 */


//$.fn.svg = function(eltName, attributes, text) {
//
//  // ...
//};


var Fluo = (function() {

  // see
  // http://javascriptweblog.wordpress.com/2010/12/07/namespacing-in-javascript/
  // for the namespacing

//    'sequence': VerticalHandler,
//    'concurrence': ConcurrenceHandler,
//    'if': IfHandler,
//    'sleep': SymbolHandler,
//    'wait': SymbolHandler,
//    'error': SymbolHandler,
//    'subprocess': SubprocessHandler,
//    'loop': LoopHandler,
//    'repeat': LoopHandler,
//    'cursor': LoopHandler,
//    'concurrent-iterator': ConcurrentIteratorHandler,
//
//    '_': GhostHandler
//
//  var MINORS = [ 'set', 'set-fields', 'unset', 'description' ];
//
//  var DEFINERS = [ 'process-definition', 'workflow-definition', 'define' ];
//
//  var COLOURS = {
//    'wi': [ '#F4D850', 'black' ],
//    'er': [ 'red', 'black' ],
//    '-': [ '#C8F690', 'black' ] // some green
//  };

  var RECT_R = 7;
  var MARGIN = 4;

  var THIS = this;

  //
  // misc functions

  function svg($container, eltName, attributes, text) {

    eltName = eltName || 'svg';
    attributes = attributes || {};

    var elt = document.createElementNS('http://www.w3.org/2000/svg', eltName);
    _.each(attributes, function(v, k) { elt.setAttributeNS(null, k, v); });
    if (text) elt.appendChild(document.createTextNode(text));
    $container[0].appendChild(elt);

    return $(elt);
  };

  function maxWidth($elt) {

    return _.max(_.map($elt.children(), function(c) { return $(c).width() }));
  }

  function totalHeight($elt) {

    return _.reduce(
      _.map($elt.children(), function(c) { return $(c).height() }),
      function(c, val) { return c + val },
      0);
  }

  function textGroup($container, texts) {

    var $g = svg($container, 'g');
    var y = 0;

    _.each(texts, function(text) {
      var t = text;
      var c = '';
      if (_.isArray(text)) { c = text[0]; t = text[1]; }
      var $t = svg($g, 'text', { class: $.trim('fluo ' + c), x: 0 }, t);
      y = y + $t.height();
      $t.attr('y', y);
    });

    $g._width = maxWidth($g);
    $g._height = totalHeight($g);

    return $g;
  }

//  function rectAndText($container, texts) {
//
//    var $g = svg($container, 'g');
//
//    var $rect = svg($g, 'rect', { class: 'fluo' });
//    var $text = textGroup($g, texts);
//    translate($text, MARGIN, 0);
//
//    $g._width = 2 * MARGIN + $text._width;
//    $g._height = 2 * MARGIN + $text._height;
//
//    $rect.attr('rx', RECT_R);
//    $rect.attr('ry', RECT_R);
//    $rect.attr('width', '' + $g._width);
//    $rect.attr('height', '' + $g._height);
//
//    return $g;
//  }

  function translate($elt, x, y) {

    var prev = $elt.attr('transform');

    if (prev) {
      var _, px, py = prev.match(/^translate\((\d+), (\d+)\)$/);
      x = x + parseInt(px);
      y = y + parseInt(py);
    }

    $elt.attr('transform', 'translate(' + x + ', ' + y + ')');
  }

  //
  // render functions

  var RENDER = {};

//  RENDER.leaf = function($container, expid, flow) {
//
//    var texts = [ [ 'expname', flow[0] ] ];
//    _.each(flow[1], function(v, k) { texts.push(k + ': ' + v); });
//
//    var $rat = rectAndText($container, texts);
//
//    return $rat;
//  }

  RENDER.text = function($container, expid, flow) {

    var atts = JSON.stringify(flow[1]).slice(1, -1);

    var $t = svg(
      $container, 'text', { class: 'fluo' }, $.trim(flow[0] + ' ' + atts));

    $t._width = $t.width();
    $t._height = $t.height() + MARGIN;

    $t.attr('y', $t.height());

    return $t;
  }

  RENDER.any = function($container, expid, flow) {

    var $g = svg($container, 'g');
    var $rect = svg($g, 'rect', { class: 'fluo' });

    var texts = [ [ 'expname', flow[0] ] ];
    _.each(flow[1], function(v, k) { texts.push(k + ': ' + v); });

    var $tg = textGroup($g, texts);
    translate($tg, MARGIN, 0);

    var x = MARGIN + $tg._width;

    var i = 0;
    var y = MARGIN;
    var w = 0;

    _.each(flow[2], function(fl) {
      var $exp = renderExp($tg, expid + '_' + i, fl);
      translate($exp, x, y);
      i = i + 1;
      y = y + $exp._height + MARGIN;
      w = _.max([ w, $exp._width ]);
    });

    $g._width = x + w + 2 * MARGIN;
    $g._height = _.max([ $tg._height + 2 * MARGIN, y ]);

    $rect.attr('rx', RECT_R);
    $rect.attr('ry', RECT_R);
    $rect.attr('width', '' + $g._width);
    $rect.attr('height', '' + $g._height);

    return $g;
  }

  _.each([
    'set', 'rset', 'unset',
    'rewind', 'continue', 'back', 'break', 'stop', 'cancel', 'skip', 'jump'
  ], function(expname) { RENDER[expname] = RENDER.text; });

  //RENDER.sequence = function($container, expid, flow) {
  //  // TODO
  //}

  function renderExp($container, expid, flow) {

    var $exp =
      (RENDER[flow[0]] || RENDER.any).call(THIS, $container, expid, flow);

    $exp[0].id = 'exp_' + expid;
      // TODO: some kind of prefix?

    return $exp;
  }

  this.render = function(div, flow, options) {

    options = options || {};

    $div = $(_.isString(div) ? "#" + div : div);

    $div[0].fluo_options = options;

    return renderExp(svg($div), '0', flow);
  }

  return this;

}).apply({});

