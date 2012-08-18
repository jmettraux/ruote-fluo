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
 * Depends on jQuery (http://jquery.com).
 *
 * Minified versions of this file available / can generated at
 * https://github.com/jmettraux/ruote-fluo
 *
 * Contains a copy of the excellent $.getStyleObject() from
 * http://upshots.org/javascript/jquery-copy-style-copycss
 */

// http://upshots.org/javascript/jquery-copy-style-copycss
//
$.fn.getStyleObject = function(){
    var dom = this.get(0);
    var style;
    var returns = {};
    if(window.getComputedStyle){
        var camelize = function(a,b){
            return b.toUpperCase();
        };
        style = window.getComputedStyle(dom, null);
        for(var i = 0, l = style.length; i < l; i++){
            var prop = style[i];
            var camel = prop.replace(/\-([a-z])/g, camelize);
            var val = style.getPropertyValue(prop);
            returns[camel] = val;
        };
        return returns;
    };
    if(style = dom.currentStyle){
        for(var prop in style){
            returns[prop] = style[prop];
        };
        return returns;
    };
    if(style = dom.style){
      for(var prop in style){
        if(typeof style[prop] != 'function'){
          returns[prop] = style[prop];
        };
      };
      return returns;
    };
    return returns;
}

// RuoteFluo
//
var RuoteFluo = (function() {

  // see
  // http://javascriptweblog.wordpress.com/2010/12/07/namespacing-in-javascript/
  // for the namespacing
  //
  // var MyModule = (function() {
  //   return this;
  // }).apply({});

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

    for (var i = 0; i < 12; i++) {
      var a = (i + 1) * 30;
      timer[2].push(
        [ 'use',
          { 'xlink:href': '#tt', transform: 'rotate(' + a + ', 14, 14)' } ]);
    }

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
  function svgElt($container, eltName, attributes, text, opts) {

    eltName = eltName || 'svg';
    attributes = attributes || {};
    opts = opts || {};

    var elt = document.createElementNS('http://www.w3.org/2000/svg', eltName);
    Nu.each(
      attributes,
      function(k, v) {

        var ns = null;
        var m = k.match(/^([a-z]+):([a-z-]+)$/)
        if (m) ns = m[1];
        if (ns == 'xlink') ns = 'http://www.w3.org/1999/xlink';

        if (v instanceof Array) v = v.join(' ');

        elt.setAttributeNS(ns, k, v);
      });

    var $elt = $(elt);

    if (text) $elt.append(document.createTextNode(text));

    $container[opts.prepend ? 'prepend' : 'append']($elt);

    if (eltName == 'svg') addDefinitions($elt);

    return $elt;
  };

  // Walks an SVG tree and adds its elements to the DOM on the go
  //
  function svgTree($container, tree) {

    var name = tree[0];
    var attributes = tree[1];
    var children = tree[2] || [];

    if (attributes instanceof Array) {
      children = attributes;
      attributes = {};
    }

    var $elt = svgElt($container, name, attributes);

    Nu.each(children, function(t) { svgTree($elt, t) });

    return $elt;
  }

  function svg($container, eltName, attributes, text, opts) {

    if (eltName instanceof Array)
      return svgTree($container, eltName);
    else
      return svgElt($container, eltName, attributes, text, opts);
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

    return Nu.max(Nu.map($elt.children(), function(c) { return width($(c)); }));
  }

  function totalHeight($elt) {

    return Nu.reduce(
      Nu.map($elt.children(), function(c) { return height($(c)); }),
      0,
      function(c, val) { return c + val });
  }

  function textGroup($container, texts) {

    var $g = svg($container, 'g');
    var y = 0;

    Nu.each(texts, function(text) {
      var t = text;
      var c = '';
      if (text instanceof Array) { c = text[0]; t = text[1]; }
      var $t = svg($g, 'text', { 'class': $.trim('fluo ' + c), x: 0 }, t);
      y = y + height($t);
      $t.attr('y', y);
    });

    $g._width = maxWidth($g);
    $g._height = totalHeight($g);

    return $g;
  }

  // expects an array of jQuery instances
  //
  function center(elts) {

    var w = Nu.inject(
      elts,
      0,
      function(w, $elt) {
        return Nu.max([ w, $elt._width, $elt._center || 0 ]);
      });

    Nu.each(elts, function($elt) {
      var dx = (w - $elt._width) / 2;
      var c = $elt._center; if (c) dx = (w - c) / 2;
      translate($elt, dx, 0);
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

  // Returns [ text, atts ] where text is the key of the first entry
  // whose value is null. Returned text may be null.
  //
  function splitAttributes(flow) {

    var text = Nu.find(flow[1], function(k, v) { return (v == null); });
    if (text) text = text[0]

    var atts = Nu.select(flow[1], function(k, v) { return (v != null) });

    return [ text, atts ];
  }

  //
  // render functions

  function renderCard($container, expid, flow, bodyFunc, opts) {

    opts = opts || {};

    var $card = svg($container, 'g', { 'class': 'fluo card' });

    var $rect = (opts.noCard || opts.noRect) ?
      null : svg($card, 'rect', { 'class': 'fluo' });

    var $tg = null;

    if (opts.noCard) {
      $tg = { _height: 0, _width: 0 };
    }
    else {
      var s = splitAttributes(flow);
      var texts = [ [ 'expname', flow[0] + (s[0] ? ' ' + s[0] : '') ] ];
      Nu.each(s[1], function(k, v) { texts.push(k + ': ' + v); });
      $tg = textGroup($card, texts);
      translate($tg, MARGIN, 0);
    }

    var x = $tg._width;
    if ( ! opts.noCard) x = x + 2 * MARGIN;

    var $body = svg($card, 'g', { 'class': 'fluo card_body' });
    translate($body, x, 0);

    var dim = bodyFunc($body);

    var w = dim[0]; var h = dim[1];

    $card._width = x + w + ($rect ? MARGIN : 0);

    $card._height = Nu.max([ $tg._height, h ]);
    if ( ! opts['short'] && ! opts['noCard']) {
       $card._height = $card._height + 2 * MARGIN;
    }

    if ($rect) {
      $rect.attr('rx', RECT_R);
      $rect.attr('ry', RECT_R);
      $rect.attr('width', '' + $card._width);
      $rect.attr('height', '' + $card._height);
    }

    if (opts.rightCentered) {
      $card._center = ($card._width - w / 2 - MARGIN) * 2;
    }

    $card._body = $body;

    return $card;
  }

  var RENDER = {};

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

        Nu.each(flow[2], function(fl) {
          var $exp = renderExp($body, expid + '_' + i, fl);
          translate($exp, 0, h);
          i = i + 1;
          h = h + $exp._height + MARGIN;
          w = Nu.max([ w, $exp._width ]);
        });

        return [ w, h ];
      });
  }

  RENDER.sequence = function($container, expid, flow) {

    var noCard = Nu.isEmpty(flow[1]);

    return renderCard(
      $container,
      expid,
      flow,
      function($body) {

        var i = 0;
        var h = noCard ? 0 : MARGIN;
        var w = 0;

        var $exps = Nu.map(flow[2], function(fl) {

          var $exp = renderExp($body, expid + '_' + i, fl);
          translate($exp, 0, h);
          i = i + 1;
          h = h + $exp._height;
          w = Nu.max([ w, $exp._width ]);

          if (i >= flow[2].length) return $exp;
            // TODO: there is no shortcircuit here... investigate...

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

        center(Nu.flatten($exps));

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

        var heights = Nu.map(flow[2], function(fl) {

          var $exp = renderExp($body, expid + '_' + i, fl);
          translate($exp, w, MARGIN);

          w = w + $exp._width + MARGIN;
          i = i + 1

          return $exp._height;
        });

        return [ w - MARGIN, Nu.max(heights) ];
      },
      { noRect: true, rightCentered: true });

    var bw = width($card._body);
    var i = 0;
    var ccount = $card._body.children().length;

    Nu.each($card._body.children(), function(c) {

      i = i + 1;
      var $c = $(c);
      var cw = width($c); var ch = height($c);
      var cx = position($c).x;

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
  RENDER.sleep = RENDER.wait;

  Nu.each([
    'set', 'rset', 'unset',
    'rewind', 'continue', 'back', 'break', 'stop', 'cancel', 'skip', 'jump'
  ], function(expname) {
    RENDER[expname] = RENDER.text;
  });

  function renderExp($container, expid, flow) {

    var $exp = (
      RENDER[flow[0]] || RENDER.any
    ).call(THIS, $container, expid, flow);

    $exp[0].id = 'exp_' + expid;
      // TODO: some kind of prefix?

    return $exp;
  }

  function locateRoot(div) {

    return $(((typeof div) == 'string') ? '#' + div : div);
  }

  //
  // "public" functions

  this.render = function(div, flow, opts) {

    opts = opts || {};

    $div = locateRoot(div);

    $div.empty();

    $div[0].fluo_options = opts;

    $g = renderExp(svg($div), '0', flow);

    //if (opts.noOuterBorder) $g.children('rect').attr('opacity', '0');
    if (opts.noOuterBorder) $g.children('rect').remove();
      // TODO: use rect.class!

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

  // alias (for compatibility with canvas ruote-fluo)
  //
  this.renderFlow = this.render;

  // empty implementation (for compatibility with canvas ruote-fluo)
  //
  this.crop = function() {}

  // highlight an expression given its expid
  //
  this.highlight = function(div, expid) {

    $div = locateRoot(div);

    $('#' + $div[0].id + ' rect.fluo_highlight').remove();

    var $e = $('#exp_' + expid);

    if ($e.length < 1) return;

    var p = position($e);
    var d = dimension($e);

    var $h = svg(
      $e.parent(),
      'rect',
      { 'class': 'fluo_highlight' },
      null,
      { prepend: true });

    var margin = parseFloat($h.getStyleObject()['stroke-width'] || '3') + 1;

    $h.attr({
      x: p.x - margin, y: p.y - margin,
      width: d.width + 2 * margin, height: d.height + 2 * margin,
      rx: margin, ry: margin
    });
  }

  return this;

}).apply({});

var Fluo = RuoteFluo; // for compatibility with canvas ruote-fluo

