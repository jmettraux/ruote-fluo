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

//  var HANDLERS = {
//
//    //'participant': ParticipantHandler
//
//    'sequence': VerticalHandler,
//    'concurrence': ConcurrenceHandler,
//    'if': IfHandler,
//    'set': TextHandler,
//    'unset': TextHandler,
//    'sleep': SymbolHandler,
//    'wait': SymbolHandler,
//    'error': SymbolHandler,
//    'subprocess': SubprocessHandler,
//    'loop': LoopHandler,
//    'repeat': LoopHandler,
//    'cursor': LoopHandler,
//    'concurrent-iterator': ConcurrentIteratorHandler,
//
//    'rewind': TextHandler,
//    'continue': TextHandler,
//    'back': TextHandler,
//    'break': TextHandler,
//    'stop': TextHandler,
//    'cancel': TextHandler,
//    'skip': TextHandler,
//    'jump': TextHandler,
//      // 'commands'
//
//    //'_atts_': AttributeOnlyHandler,
//    '_': GhostHandler
//  };
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
  var MARGIN = 5;

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

  function textGroup($container, texts) {

    var $g = svg($container, 'g');
    var y = 0;

    _.each(texts, function(text) {
      var $t = svg($g, 'text', { class: 'fluo', x: 0 }, text);
      y = y + $t.height();
      $t.attr('y', y);
    });

    return $g;
  }

  function maxWidth($elt) {
    return _.max(_.map($elt.children(), function(c) { return $(c).width() }));
  }

  function totalHeight($elt) {
    return _.reduce(
      _.map($elt.children(), function(c) { return $(c).height() }),
      function(c, val) { return c + val },
      0);
  }

  function rectAndText($container, texts) {

    var $g = svg($container, 'g');

    var $rect = svg($g, 'rect', { class: 'fluo' });
    var $text = textGroup($g, texts);
    translate($text, MARGIN, 0);

    $rect.attr('rx', RECT_R);
    $rect.attr('ry', RECT_R);
    $rect.attr('width', '' + (2 * MARGIN + maxWidth($text)));
    $rect.attr('height', '' + (2 * MARGIN + totalHeight($text)));

    return $g;
  }

  function translate($elt, x, y) {

    $elt.attr('transform', 'translate(' + x + ', ' + y + ')');
  }

  //
  // render functions

  var RENDER = {};

  RENDER.any = function($container, expid, flow) {

    var texts = [ flow[0] ];
    _.each(flow[1], function(v, k) { texts.push(k + ': ' + v); });

    var $tg = rectAndText($container, texts);
    $tg[0].id = "exp_" + expid;

    return $tg;
  }

  RENDER.sequence = function($container, expid, flow) {
  }

  function renderExp($container, expid, flow) {

    return (RENDER[flow[0]] || RENDER['any']).call(
      THIS, svg($container), expid, flow);
  }

  this.render = function(div, flow, options) {

    options = options || {};

    $div = $(_.isString(div) ? "#" + div : div);

    $div[0].fluo_options = options;

    $svg = renderExp($div, '0', flow);
  }

  return this;

}).apply({});

