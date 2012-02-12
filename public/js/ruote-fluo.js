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

  function addDefinitions($svg) {

    svgTree(
      $svg,
      [ 'defs',
        [
          [ 'marker',
            {
              id: 'arrowhead',
              viewBox: '0 0 10 10', refX: '0', refY: '5',
              markerUnits: '4', markerHeight: '3',
              orient: 'auto'
            },
            [
              [ 'path', { d: 'M 0 0 L 10 5 L 0 10 z' } ]
            ]
          ]
        ]
      ]);
  }

  function svgElt($container, eltName, attributes, text) {

    eltName = eltName || 'svg';
    attributes = attributes || {};

    var elt = document.createElementNS('http://www.w3.org/2000/svg', eltName);
    _.each(attributes, function(v, k) { elt.setAttributeNS(null, k, v); });
    if (text) elt.appendChild(document.createTextNode(text));
    $container[0].appendChild(elt);

    var $elt = $(elt);
    if (eltName == 'svg') addDefinitions($elt);

    return $elt;
  };

  function svgTree($container, tree) {

    var name = tree[0];
    var attributes = tree[1];
    var children = tree[2] || [];

    if (_.isArray(attributes)) {
      children = attributes;
      attributes = {};
    }

    $elt = svgElt($container, name, attributes);

    _.each(children, function(t) { svgTree($elt, t) });

    return $elt;
  }

  function svg($container, eltName, attributes, text) {

    if (_.isArray(eltName))
      return svgTree($container, eltName);
    else
      return svgElt($container, eltName, attributes, text);
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

  function center(elts) {

    var w = _.inject(
      elts,
      function(w, elt) { return _.max([ w, elt._width ]) },
      0);

    _.each(elts, function(elt) {
      var dx = (w - elt._width) / 2;
      translate(elt, dx, 0);
    });
  }

  function translate($elt, x, y) {

    var prev = $elt.attr('transform');

    if (prev) {
      var m = prev.match(/^translate\((\d+), (\d+)\)$/);
      var px = m[1]; var py = m[2];
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

  function renderCard($container, expid, flow, bodyFunc) {

    var $g = svg($container, 'g');
    var $rect = svg($g, 'rect', { class: 'fluo' });

    var texts = [ [ 'expname', flow[0] ] ];
    _.each(flow[1], function(v, k) { texts.push(k + ': ' + v); });

    var $tg = textGroup($g, texts);
    translate($tg, MARGIN, 0);

    var x = 2 * MARGIN + $tg._width;

    var dim = bodyFunc($g, x);
    var w = dim[0]; var h = dim[1];

    $g._width = x + w + MARGIN;
    $g._height = _.max([ $tg._height + 2 * MARGIN, h ]);

    $rect.attr('rx', RECT_R);
    $rect.attr('ry', RECT_R);
    $rect.attr('width', '' + $g._width);
    $rect.attr('height', '' + $g._height);

    return $g;
  }

  RENDER.any = function($container, expid, flow) {

    return renderCard(
      $container,
      expid,
      flow,
      function($group, x) {

        var i = 0;
        var h = MARGIN;
        var w = 0;

        _.each(flow[2], function(fl) {
          var $exp = renderExp($group, expid + '_' + i, fl);
          translate($exp, x, h);
          i = i + 1;
          h = h + $exp._height + MARGIN;
          w = _.max([ w, $exp._width ]);
        });

        return [ w, h ];
      });
  }

  RENDER.sequence = function($container, expid, flow) {

    return renderCard(
      $container,
      expid,
      flow,
      function($group, x) {

        var i = 0;
        var h = MARGIN;
        var w = 0;

        var $exps = _.map(flow[2], function(fl) {
          var $exp = renderExp($group, expid + '_' + i, fl);
          translate($exp, x, h);
          i = i + 1;
          h = h + $exp._height + MARGIN;
          w = _.max([ w, $exp._width ]);
          return $exp;
        });
        center($exps);

        return [ w, h ];
      });
  }

  _.each([
    'set', 'rset', 'unset',
    'rewind', 'continue', 'back', 'break', 'stop', 'cancel', 'skip', 'jump'
  ], function(expname) { RENDER[expname] = RENDER.text; });

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

