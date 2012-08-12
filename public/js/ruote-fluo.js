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
 * depends on jquery and underscore
 *
 * http://jquery.com
 * http://documentcloud.github.com/underscore/
 *
 * minified versions of this file available / can generated at
 *
 * https://github.com/jmettraux/ruote-fluo
 */

var Fluo = (function() {

  // see
  // http://javascriptweblog.wordpress.com/2010/12/07/namespacing-in-javascript/
  // for the namespacing

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

  var VERSION = '2.3.0';

  var RECT_R = 7;
  var MARGIN = 4;

  var THIS = this;

  //
  // misc functions

  function addDefinitions($svg) {

    var tree = [ 'defs', [] ];

    // arrowhead marker

    tree[1].push(
      [ 'marker',
        {
          id: 'arrowhead',
          viewBox: '0 0 100 100', refX: '90', refY: '50',
          markerUnits: 'strokeWidth',
          markerWidth: '10', markerHeight: '10',
          orient: 'auto'
        },
        [
          [ 'path', { 'class': 'fluo', d: 'M 0 0 L 100 50 L 0 100 z' } ]
        ]
      ])

    // timer

    var timer =
      [ 'g',
        { id: 'timer' },
        [
          [ 'circle',
            {
              'class': 'fluo',
              cx: '14', cy: '14', r: '14',
              fill: 'none', stroke: 'black',
              'stroke-width': '1'
            }
          ],
          [ 'circle',
            {
              'class': 'fluo',
              cx: '14', cy: '14', r: '10',
              fill: 'none', stroke: 'black',
              'stroke-width': '1'
            }
          ],
          [ 'path',
            {
              id: 'tt',
              'class': 'fluo',
              d: 'M 14 05 L 14 07',
              fill: 'none', stroke: 'black',
              'stroke-width': '1'
            }
          ],
        ]
      ];

    _.times(11, function(i) {
      var a = (i + 1) * 30;
      timer[2].push(
        [ 'use',
          { 'xlink:href': '#tt', transform: 'rotate(' + a + ', 14, 14)' } ]);
    });

    timer[2].push(
      [ 'path',
        {
          'class': 'fluo',
          d: 'M 14 10 L 14 14',
          fill: 'none', stroke: 'black',
          'stroke-width': '1',
          transform: 'rotate(120, 14, 14)'
        }
      ]);
    timer[2].push(
      [ 'path',
        {
          'class': 'fluo',
          d: 'M 14 08 L 14 14',
          fill: 'none', stroke: 'black',
          'stroke-width': '1'
        }
      ]);

    tree[1].push(timer);

    svgTree($svg, tree)
  }

  // Adds an [SVG] element to the DOM
  //
  function svgElt($container, eltName, attributes, text) {

    eltName = eltName || 'svg';
    attributes = attributes || {};

    var elt = document.createElementNS('http://www.w3.org/2000/svg', eltName);
    _.each(
      attributes,
      function(v, k) {

        var ns = null;
        var m = k.match(/^([a-z]+):([a-z-]+)$/)
        if (m) ns = m[1];
        if (ns == 'xlink') ns = 'http://www.w3.org/1999/xlink';

        if (_.isArray(v)) v = v.join(' ');

        elt.setAttributeNS(ns, k, v);
      });

    if (text) elt.appendChild(document.createTextNode(text));
    $container[0].appendChild(elt);

    var $elt = $(elt);
    if (eltName == 'svg') addDefinitions($elt);

    return $elt;
  };

  // Walks an SVG tree and adds its elements to the DOM on the go
  //
  function svgTree($container, tree) {

    var name = tree[0];
    var attributes = tree[1];
    var children = tree[2] || [];

    if (_.isArray(attributes)) {
      children = attributes;
      attributes = {};
    }

    var $elt = svgElt($container, name, attributes);

    _.each(children, function(t) { svgTree($elt, t) });

    return $elt;
  }

  function svg($container, eltName, attributes, text) {

    if (_.isArray(eltName))
      return svgTree($container, eltName);
    else
      return svgElt($container, eltName, attributes, text);
  }

  // working around a ffox issue with $elt.width();
  //
  function width($elt) {

    if ($elt.width() == 0) { // FireFox...
      return dimension($elt).width;
    } else { // the rest
      return $elt.width();
    }
  }

  // working around a ffox issue with $elt.height();
  //
  function height($elt) {

    if ($elt.height() == 0) { // FireFox...
      return dimension($elt).height;
    } else { // the rest
      return $elt.height();
    }
  }

  function maxWidth($elt) {

    return _.max(_.map($elt.children(), function(c) { return width($(c)); }));
  }

  function totalHeight($elt) {

    return _.reduce(
      _.map($elt.children(), function(c) { return height($(c)); }),
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
      var $t = svg($g, 'text', { 'class': $.trim('fluo ' + c), x: 0 }, t);
      y = y + height($t);
      $t.attr('y', y);
    });

    $g._width = maxWidth($g);
    $g._height = totalHeight($g);

    return $g;
  }

  function center(elts) {

    var w = _.inject(
      elts,
      function(w, elt) { return _.max([ w, elt._width, elt._center || 0 ]); },
      0);

    _.each(elts, function(elt) {
      var dx = (w - elt._width) / 2;
      var c = elt._center; if (c) dx = (w - c) / 2;
      translate(elt, dx, 0);
    });
  }

  function dimension($elt) {

    return $elt[0].getBBox();
  }

  function position($elt) {

    var m = (
      $elt.attr('transform') || ''
    ).match(/^translate\((\d+(?:\.\d+)?), (\d+(?:\.\d+)?)\)$/);

    if ( ! m) return { x: 0, y: 0 };

    return { x: parseFloat(m[1]), y: parseFloat(m[2]) };
  }

  function translate($elt, x, y) {

    var p = position($elt);
    $elt.attr('transform', 'translate(' + (p.x + x) + ', ' + (p.y + y) + ')');
  }

  function roundedPath($container, startx, starty, endx, endy, opts) {

    var d = null;
    var r = MARGIN;

    if ( ! opts.bottom) {
      d = [
        'M', startx, starty,
        'L', endx + (endx > startx ? -1 : 1) * r, starty,
        'Q', endx, starty, endx, starty + r,
        'L', endx, endy
      ]
      if (opts.inner) d = [ 'M' ].concat(d.slice(4));
    }
    else {
      d = [
        'M', startx, starty,
        'L', startx, endy - r,
        'Q', startx, endy, startx + (endx > startx ? 1 : -1) * r, endy,
        'L', endx, endy
      ]
      if (opts.inner) d = d.slice(0, 11);
    }

    return svg(
      $container,
      'path',
      { 'class': 'fluo rounded_path', 'd': d, 'fill': 'none' });
  }

  //
  // render functions

  // Returns [ text, atts ] where text is the key of the first entry
  // whose value is null. Returned text may be null.
  //
  function splitAttributes(flow) {

    //var atts = flow[1];
    //var text = _.find(atts, function(v, k) { return (v == null); });
      // doesn't work (as Ruby) with underscore-1.3.3
    var atts = null;
    var text = null;

    _.each(flow[1], function(v, k) {
      if (v == null && text == null) text = k;
    });

    if (text) {
      //atts = _.select(flow[1], function(v, k) { return (k != text); });
        // doesn't work (as Ruby) with underscore-1.3.3
      atts = {};
      _.each(flow[1], function(v, k) { if (k != text) atts[k] = v; });
        // I wish I could foldl
    }

    return [ text, atts || flow[1] ];
  }

  function renderCard($container, expid, flow, bodyFunc, options) {

    options = options || {};

    var $card = svg($container, 'g', { 'class': 'fluo card' });

    var $rect = (options.noCard || options.noRect) ?
      null : svg($card, 'rect', { 'class': 'fluo' });

    var $tg = null;

    if (options.noCard) {
      $tg = { _height: 0, _width: 0 };
    }
    else {
      var s = splitAttributes(flow);
      var texts = [ [ 'expname', flow[0] + (s[0] ? ' ' + s[0] : '') ] ];
      _.each(s[1], function(v, k) { texts.push(k + ': ' + v); });
      $tg = textGroup($card, texts);
      translate($tg, MARGIN, 0);
    }

    var x = 2 * MARGIN + $tg._width;

    var $body = svg($card, 'g', { 'class': 'fluo card_body' });
    translate($body, x, 0);

    var dim = bodyFunc($body);

    var w = dim[0]; var h = dim[1];

    $card._width = x + w + ($rect ? MARGIN : 0);

    $card._height = _.max([ $tg._height, h ]);
    if ( ! options['short']) $card._height = $card._height + 2 * MARGIN;

    if ($rect) {
      $rect.attr('rx', RECT_R);
      $rect.attr('ry', RECT_R);
      $rect.attr('width', '' + $card._width);
      $rect.attr('height', '' + $card._height);
    }

    if (options.rightCentered) {
      $card._center = ($card._width - w / 2 - MARGIN) * 2;
    }

    $card._body = $body;

    return $card;
  }

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
      $container,
      'text',
      { 'class': 'fluo text_exp' },
      $.trim(flow[0] + ' ' + atts));

    $t._width = width($t);
    $t._height = height($t) + MARGIN;

    $t.attr('y', height($t));

    return $t;
  }

  RENDER.any = function($container, expid, flow) {

    return renderCard(
      $container,
      expid,
      flow,
      function($body) {

        var i = 0;
        var h = MARGIN;
        var w = 0;

        _.each(flow[2], function(fl) {
          var $exp = renderExp($body, expid + '_' + i, fl);
          translate($exp, 0, h);
          i = i + 1;
          h = h + $exp._height + MARGIN;
          w = _.max([ w, $exp._width ]);
        });

        return [ w, h ];
      });
  }

  RENDER.sequence = function($container, expid, flow) {

    var noCard = _.isEmpty(flow[1]);

    return renderCard(
      $container,
      expid,
      flow,
      function($body) {

        var i = 0;
        var h = noCard ? 0 : MARGIN;
        var w = 0;

        var $exps = _.map(flow[2], function(fl) {

          var $exp = renderExp($body, expid + '_' + i, fl);
          translate($exp, 0, h);
          i = i + 1;
          h = h + $exp._height;
          w = _.max([ w, $exp._width ]);

          if (i >= flow[2].length) return $exp;

          var $arrow = svg(
            $body,
            'path',
            {
              'class': 'fluo',
              d: 'M 0 0 L 0 11',
              'marker-end': 'url(#arrowhead)'
            });
          translate($arrow, 0, h);
          h = h + 11;

          $arrow._width = width($arrow);
          $arrow._height = height($arrow);

          return [ $exp, $arrow ];
        });

        center(_.flatten($exps));

        return [ w, h ];
      },
      { 'noCard': noCard });
  }

  RENDER.concurrence = function($container, expid, flow) {

    var $card = renderCard(
      $container,
      expid,
      flow,
      function($body) {

        var i = 0;
        var w = 0;

        var heights = _.map(flow[2], function(fl) {

          var $exp = renderExp($body, expid + '_' + i, fl);
          translate($exp, w, MARGIN);
          w = w + $exp._width + MARGIN;
          i = i + 1

          return $exp._height;
        });

        return [ w - MARGIN, _.max(heights) ];
      },
      { noRect: true, rightCentered: true });

    var bw = width($card._body);
    var i = 0;
    var ccount = $card._body.children().length;

    _($card._body.children()).each(function(c) {

      i = i + 1;
      var $c = $(c);
      var cw = width($c); var ch = height($c);
      var cx = position($c).x;

      console.log([ i, $card._body.children().length ]);

      roundedPath(
        $card._body,
        bw / 2 - MARGIN, 0, cx + cw / 2, MARGIN,
        { bottom: false, inner: i > 1 && i < ccount });
      roundedPath(
        $card._body,
        cx + cw / 2, ch + MARGIN, bw / 2 - MARGIN, $card._height,
        { bottom: true, inner: i > 1 && i < ccount });
    });

    return $card;
  }

  RENDER.wait = function($container, expid, flow) {

    return renderCard(
      $container,
      expid,
      flow,
      function($body) {

        var $t = svg($body, 'use', { 'xlink:href': '#timer' });

        return [ 2 * MARGIN + width($t), height($t) ];
      },
      { noRect: true, 'short': true, rightCentered: true });
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

    $g = renderExp(svg($div), '0', flow);

    $svg = $g.parent();

    $svg.attr('width', $g._width + 3);
    $svg.attr('height', $g._height + 3);
      // this is only necessary for FireFox...

    //var e = document.getElementById('exp_0_0_6');
    //var ctm = e.getScreenCTM();
    //svg($g, 'path', {
    //  d: 'M ' + ctm.e + ' ' + ctm.f + ' L 100 100 L 90 110',
    //  fill: 'none', stroke: 'black',
    //  'stroke-width': '1'
    //});

    return $g;
  }

  // alias for compatibility with canvas ruote-fluo
  //
  this.renderFlow = this.render;

  return this;

}).apply({});

