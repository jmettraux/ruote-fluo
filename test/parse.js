

load('public/js/fluo-json.js');
load('public/js/fluo-tred.js');

/*
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
*/

win = 0;
total = 0;

function assert_rep (goal, source) {

  total++;

  var result = FluoTred.ExpressionHead.parse(source);
  //result = exp_to_s(result);
  result = fluoToJson(result);

  if (result == goal) {
    print("\n .  '" + source + "'");
    win++;
  }
  else {
    print(
      "\n X  '" + source + "'\n    goal :   " +
      goal + "\n    result : " + result);
  }
}

//var empty = '--- {}';
//assert_rep(empty, '');

assert_rep('["alpha", {}, []]', 'alpha');
assert_rep('["part", {}, ["alpha"]]', 'part alpha');
assert_rep('["part", {}, ["alpha"]]', 'part "alpha"');
assert_rep('["part", {}, ["al pha"]]', 'part "al pha"');
assert_rep('["part", {"act": "nada"}, ["al pha"]]', 'part "al pha" act: "nada"');
//assert_rep('["part", {"ref": "alpha"}, []]', 'part ref:alpha');
assert_rep('["part", {"ref": "alpha"}, []]', 'part ref:"alpha"');
assert_rep('["part", {"ref": "alpha"}, []]', 'part ref: "alpha"');
assert_rep('["part", {"ref": "alpha"}, []]', 'part "ref": "alpha"');
assert_rep('["part", {"ref": "alpha bravo"}, []]', 'part ref: "alpha bravo"');
//assert_rep('["part", {"ref": "alpha"}, []]', 'part ref="alpha"');
//assert_rep('["part", {"ref": "alpha"}, []]', 'part "ref"= "alpha"');

assert_rep('["set", {"value": 3.1}, []]', 'set value: 3.1');
assert_rep('["set", {"value": true}, []]', 'set value: true');
assert_rep('["set", {"value": [1, 2, 3]}, []]', 'set value:[1,2,3]');
assert_rep('["set", {"value": [1, [4], 2, 3]}, []]', 'set value:[1,[4],2,3]');
assert_rep('["set", {"value": [1, 2, 3]}, []]', 'set value:[ 1, 2, 3]');

assert_rep('["set", {"val": 1, "var": [2]}, []]', 'set val:1, var:[2]');
assert_rep('["set", {"val": [1], "var": [2]}, []]', 'set val:[1], var:[2]');

print("\n... " + win + " / " + total + "\n");

