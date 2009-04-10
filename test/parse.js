

load('public/js/fluo-json.js');
load('public/js/fluo-tred.js');

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

  var result = FluoTred.ExpressionHead.parse(source);
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
assert_rep('participant {ref:alpha,} []', 'participant ref="alpha"')
assert_rep('participant {ref:alpha,} []', 'participant "ref"= "alpha"')

