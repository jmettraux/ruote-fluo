
win = 0;
total = 0;

load('public/js/fluo-tred.js');

function assert_rep (goal, source) {

  print('-------------------------------------------------------------------------------')

  total++;

  var result = FluoTred.Attributes.parse(source);
  result = JSON.stringify(result);

  if (result == goal) {
    print(" .  '" + source + "'");
    win++;
  }
  else {
    print(
      " X  '" + source + "'\n    goal :   " +
      goal + "\n    result : " + result);
  }
}

////assert_rep('["part", {"ref": "alpha"}, []]', 'part ref="alpha"');
////assert_rep('["part", {"ref": "alpha"}, []]', 'part "ref"= "alpha"');

assert_rep('{"alpha":null}', 'alpha')
assert_rep('{"alpha":null}', '"alpha"')
assert_rep('{"alpha":null}', "'alpha'")
assert_rep('{"ref":"alpha"}', 'ref:alpha')
assert_rep('{"ref":"alpha"}', 'ref: alpha')
assert_rep('{"ref":"alpha"}', 'ref:"alpha"')
assert_rep('{"ref":"alpha"}', 'ref: "alpha"')
assert_rep('{"ref":"alpha"}', "ref:'alpha'")
assert_rep('{"ref":"alpha"}', "ref: 'alpha'")

assert_rep('{"alpha":null,"task":"clean lab"}', "alpha, task: 'clean lab'")
assert_rep('{"alpha bravo":null,"task":"clean lab"}', "'alpha bravo', task: 'clean lab'")

//assert_rep('{"alpha,bravo":null,"task":"clean lab"}', "'alpha,bravo', task: 'clean lab'")

assert_rep('{"val":1,"var":[2]}', 'val:1, var:[2]');
assert_rep('{"john":null,"val":1,"var":[2]}', 'john, val:1, var:[2]');

assert_rep('{"name":"my def","revision":0}', 'name: "my def", revision: 0');

assert_rep('{"alpha":null,"timeout":"2d"}', ' alpha, timeout: 2d');

print('-------------------------------------------------------------------------------')
print("\n... " + win + " / " + total + "\n");

