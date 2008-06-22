
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

// in order to be used in other projects, this javascript 'library' 
// doesn't rely on prototype like the rest of Densha's javascript code.

var FluoCanvas = function () {

  //
  // private somehow ...

  function toCanvas (o) {

    if (o.getContext)
      return o.getContext("2d");
    return o;
  }

  function drawRoundedRect (c, x, y, width, height, radius) {

    c.beginPath();
    c.moveTo(x, y+radius);
    c.lineTo(x, y+height-radius);
    c.quadraticCurveTo(x, y+height, x+radius, y+height);
    c.lineTo(x+width-radius, y+height);
    c.quadraticCurveTo(x+width, y+height, x+width, y+height-radius);
    c.lineTo(x+width, y+radius);
    c.quadraticCurveTo(x+width, y, x+width-radius, y);
    c.lineTo(x+radius, y);
    c.quadraticCurveTo(x, y, x, y+radius);
    c.stroke();
  }

  function drawLineAndCurve (c, start, end, radius) {

    var dir = (start[0] - end[0]) < 0 ? -1 : 1;

    c.beginPath();
    c.moveTo(start[0], start[1]);
    c.lineTo(end[0] + dir * radius, start[1]);
    c.quadraticCurveTo(end[0], start[1], end[0], end[1]);
    c.stroke();
  }

  function drawPath (c, path, options) {

    c = toCanvas(c);

    if ( ! options) options = {};

    var rel = options['relative'];

    var fil = options['fill'];

    var color = options['color'];

    var i = 0;

    var px = null;
    var py = null;

    c.beginPath();

    while (i < path.length) {

      var x = path[i];
      var y = path[i+1];

      if (i == 0) {
        c.moveTo(x, y);
      }
      else {
        if (rel) {
          x = px + x;
          y = py + y;
        }
        c.lineTo(x, y);
      }

      px = x;
      py = y;

      i += 2;
    }

    if (fil) {
      if (color) c.fillStyle = color;
      c.fill();
    }
    else {
      if (color) c.strokeStyle = color;
      c.stroke();
    }
  }

  function drawArrow (c, start, delta, options) {

    if ( ! options) options = {};
    options['relative'] = true;

    c = toCanvas(c);

    var l = 6;
    var w = 3;

    var dx = delta[0];
    var dy = delta[1];
    var path = start.concat(delta);

    drawPath(c, path, options);

    var tx = start[0] + dx;
    var ty = start[1] + dy;

    options['fill'] = true;

    if (dx != 0) {
      dx = dx < 0 ? 1 : -1;
      path = [ tx, ty, dx * -l, w, 0, -w * 2, dx * l, w ];
      //drawPath(c, path, { relative: true, fill: true });
      drawPath(c, path, options);
    }
    else {
      dy = dy < 0 ? 1 : -1;
      path = [ tx, ty, -w, dy * l, w * 2, 0, w, dy * l ];
      //drawPath(c, path, { relative: true, fill: true });
      drawPath(c, path, options);
    }
  }

  function newDownArrow (boxWidth) {

    var w2 = Math.floor(boxWidth / 2);
    var h = 10;

    var e = new Element("canvas", { "width": boxWidth, "height": h });
    if ( ! e.getContext) return e;
    var c = e.getContext("2d");

    drawArrow(c, [ w2, 0 ], [ 0, h ]);

    return e;
  }

  function newDownUpArrow (boxWidth) {

    var w2 = Math.floor(boxWidth / 2);
    var h = 10;

    var e = new Element("canvas", { "width": boxWidth, "height": h });
    if ( ! e.getContext) return e;
    var c = e.getContext("2d");

    drawArrow(c, [ w2, 0 ], [ 0, h ]);
    drawArrow(c, [ w2+7, h ], [ 0, -h ], { color: 'rgba(0,0,0,0.3)' });

    return e;
  }

  function drawSubprocessCross (c, w, h) {

    var sz = 14;
    var hsz = sz / 2;
    var p = 3;

    var w2 = Math.floor(w / 2);

    drawPath
      (c,
       [ w2 - hsz, h - sz,
         w2 + hsz, h - sz,
         w2 + hsz, h,
         w2 - hsz, h,
         w2 - hsz, h - sz ]);
    drawPath
      (c, 
       [ w2, h - sz + p, 
         w2, h - p ]);
    drawPath
      (c, 
       [ w2 - hsz + p, h - hsz, 
         w2 + hsz - p, h - hsz ]);
  }

  function drawDiamond (c, w, h, sz) {

    var w2 = Math.floor(w / 2);
    var h2 = Math.floor(h / 2);

    drawPath
      (c,
       [ w2, h2 - sz,
         w2 + sz, h2,
         w2, h2 + sz,
         w2 - sz, h2,
         w2, h2 - sz ]);
  }

  function drawParaDiamond (c, w, h, sz) {

    var w2 = Math.floor(w / 2);
    var h2 = Math.floor(h / 2);

    drawDiamond(c, w, h, sz);

    var sz = sz / 2;

    c.lineWidth = 2.5;

    drawPath
      (c,
       [ w2, h2 - sz,
         w2, h2 + sz ]);
    drawPath
      (c,
       [ w2 - sz, h2,
         w2 + sz, h2 ]);

    c.lineWidth = 1;
  }

  function asCanDiv (container, width, height) {

    var wh = "width: "+width+"; height: "+height+";";
    var pos = "position: absolute;"

    container.setStyle({ "width": width, "height": height });

    var ie = new Element(
      "div", { id: "inside_"+container.id, style: wh + pos });
    var ic = new Element(
      "canvas", { 
        "id": "canvas_"+container.id, 
        "width": width, 
        "height": height, 
        "style": pos });

    container.appendChild(ie);
    container.appendChild(ic);

    container.div = ie;
    container.canvas = ic;
      //
      // handy shortcuts
  }

  function asCenteredBox (container, totalWidth, boxWidth, boxHeight, variant) {

    asCanDiv(container, totalWidth, boxHeight);

    var ie = container.div;
    var ic = container.canvas;

    if ( ! ic.getContext) return ie;

    var ww2 = (totalWidth - boxWidth) / 2;

    var ctx = ic.getContext("2d");
    drawRoundedRect(ctx, ww2, 1, boxWidth, boxHeight-2, 10);

    //ie.canvas = ic;
      // a shortcut

    // variants

    if (variant == "subprocess") {
      drawSubprocessCross(ctx, totalWidth, boxHeight);
    }

    return ie;
  }

  function newBox (container, width, height) {

    return newCenteredBox(container, width, width, height);
  }

  //
  // functions directly related to workflow expressions

  function newConcurrenceOpening (width, count) {

    var h = 34;

    var e = new Element("canvas", { "width": width, "height": h });

    if ( ! e.getContext) return e;

    var c = e.getContext("2d");

    drawParaDiamond(c, width, 24, 12);

    var w = width / count;
    var w2 = w / 2;

    for (var i = 0; i < count; i++) {

      drawArrow(c, [ i * w + w2, 24 ], [ 0, 10 ]);

      var start = -12;
      if (i+1 > count/2) start = -start;

      if (count % 2 == 1 && Math.floor(count / 2) == i) continue;

      drawLineAndCurve
        (c, 
         [ width / 2 + start, 12 ], 
         [ i * w + w2, 24 ], 
         10);
    }

    return e;
  }

  function newConcurrenceClosing (width, count) {

    var h = 11;

    var e = new Element("canvas", { "width": width, "height": h });

    if ( ! e.getContext) return e;

    var c = e.getContext("2d");

    var w = width / count;
    var w2 = w / 2;

    drawLineAndCurve // left
      (c, 
       [ width / 2, h-1 ], 
       [ w2, 0 ], 
       10);
    drawLineAndCurve // right
      (c, 
       [ width / 2, h-1 ], 
       [ width - w2, 0 ], 
       10);

    return e;
  }

  function newIfOpening (width) {

    var h = 25;

    var e = new Element("canvas", { "width": width, "height": h });

    if ( ! e.getContext) return e;

    var c = e.getContext("2d");

    drawDiamond(c, width, 24, 12);

    drawLineAndCurve
      (c, 
       [ width / 2 - 12, 12 ], 
       [ width / 4, 24 ], 
       10);
    drawLineAndCurve
      (c, 
       [ width / 2 + 12, 12 ], 
       [ width * 3 / 4, 24 ], 
       10);

    return e;
  }

  /*
   * drawing the if and the else arrows
   */
  function drawIfLines (canvas, hasElse) {

    var h = canvas.height;
    var W = canvas.width;

    w = [ W / 4, W * 3 / 4 ];

    drawArrow(canvas, [ w[0], 0 ], [ 0, h ]);

    if (hasElse)
      drawArrow(canvas, [ w[1], 0 ], [ 0, h ]);
    else
      drawPath(canvas, [ w[1], 0, w[1], h ]);
  }

  return {

    //
    // the public methods

    toCanvas: toCanvas,
    drawRoundedRect: drawRoundedRect,
    drawLineAndCurve: drawLineAndCurve,
    drawPath: drawPath,
    drawArrow: drawArrow,
    newDownArrow: newDownArrow,
    newDownUpArrow: newDownUpArrow,
    drawSubprocessCross: drawSubprocessCross,
    drawDiamond: drawDiamond,
    drawParaDiamond: drawParaDiamond,
    asCanDiv: asCanDiv,
    asCenteredBox: asCenteredBox,
    newBox: newBox,
    newConcurrenceOpening: newConcurrenceOpening,
    newConcurrenceClosing: newConcurrenceClosing,
    newIfOpening: newIfOpening,
    drawIfLines: drawIfLines
  };

}();

