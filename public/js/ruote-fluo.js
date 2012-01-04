/*
 *  Ruote - open source ruby workflow engine
 *  (c) 2005-2012 jmettraux@gmail.com
 *
 *  Ruote is freely distributable under the terms of the MIT license.
 *  For details, see the ruote web site: http://ruote.rubyforge.org
 *
 *  Made in Japan
 */

$.fn.app = function(html) {
  var $h = $(html);
  this.append($h);
  return $h;
};


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

  var THIS = this;

  var RENDER = {};

  RENDER.any = function($container, expid, flow) {
    var $svg = $container.app('<svg></svg>');
    var $text = $svg.app('<text></text>');
    $text.append('<p class="fluo expname">' + flow[0] + '</tspan>');
    _.each(flow[1], function(k, v) {
      $text.append('<p class="fluo attribute">' + k  + ': ' + JSON.stringify(v) + '</tspan>');
    });
    var $rect = $svg.app('<rect class="fluo any"></rect>');
    $rect.attr('width', '' + $text.width());
    $rect.attr('height', '' + $text.height());
    return $svg;
  }

  RENDER.sequence = function($container, expid, flow) {
  }

  function renderExp($container, expid, flow) {

    return (RENDER[flow[0]] || RENDER['any']).call(
      THIS, $container, expid, flow);
  }

  this.render = function(div, flow, options) {

    options = options || {};

    $div = $(_.isString(div) ? "#" + div : div);

    $div[0].fluo_options = options;

    $svg = renderExp($div, '0', flow);
  }

  return this;

}).apply({});

