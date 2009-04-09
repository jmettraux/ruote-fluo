
String.prototype.tstrip = function () {
  var s = this;
  while (s.charAt(0) == ' ') s = s.substring(1);
  while (s.charAt(s.length - 1) == ' ') s = s.substring(0, s.length - 1);
  return s;
}
String.prototype.qstrip = function () {
  var s = this;
  if (s.match(/".*"/)) s = s.substring(1, s.length - 1);
  return s;
}
String.prototype.tqstrip = function () {
  return this.tstrip().qstrip();
}

load('public/js/fluo-json.js');
//load('public/js/fluo-tred.js');

ExpressionHead = {

      attPattern: /([^:]+):([^,]+),?/,

      parseAttributes: function (s) {

        var h = {};

        while (s) {
          m = s.match(ExpressionHead.attPattern);
          if ( ! m) break;
          h[m[1].tqstrip()] = m[2].tqstrip();
          s = s.substring(m[0].length);
        }

        return h;
      },
      parse: function (s) {

        var m = s.match(/^(\S*)( [.]*[^:]*)?( .*)?$/);

        if (m == null) return ['---', {}, []];

        var expname = m[1];

        var children = [];
        if (m[2]) {
          var t = m[2].tstrip();
          if (t.match(/".*"/)) t = t.substring(1, t.length - 1);
          if (t != '') children.push(t);
        }

        //var atts = m[3];
        //atts = atts ? fluoFromJson('({' + atts + '})') : {};
        atts = ExpressionHead.parseAttributes(m[3]);

        return [ expname, atts, children ];
      },
}

function h_to_s (h) {
  var s = '{';
  for (var k in h) {
    s += ('' + k + ':' + h[k] + ',');
  }
  return s + '}';
}
function exp_to_s (e) {
  return e[0] + ' ' + h_to_s(e[1]) + ' [' + e[2].toString() + ']';
}

function assert_rep (goal, source) {

  var result = ExpressionHead.parse(source);
  result = exp_to_s(result);

  if (result == goal) {
    print("\n .  '" + source + "'");
  }
  else {
    print(
      "\n X  '" + source + "'\n    goal :   " +
      goal + "\n    result : " + result);
  }
}

var empty = '--- {}';

//print(exp_to_s([ 'nada', {surf:'really'}]));

assert_rep(empty, '');
assert_rep('alpha {} []', 'alpha')
assert_rep('participant {} [alpha]', 'participant alpha')
assert_rep('participant {} [alpha]', 'participant "alpha"')
assert_rep('participant {} [al pha]', 'participant "al pha"')
assert_rep('participant {activity:nada,} [al pha]', 'participant "al pha" activity: "nada"')
assert_rep('participant {ref:alpha,} []', 'participant ref:alpha')
assert_rep('participant {ref:alpha,} []', 'participant ref:"alpha"')
assert_rep('participant {ref:alpha,} []', 'participant ref: "alpha"')
assert_rep('participant {ref:alpha,} []', 'participant "ref": "alpha"')

