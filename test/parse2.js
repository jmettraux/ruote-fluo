
win = 0;
total = 0;

load('public/js/ruote-fluo-editor.js');

function assert_rep (goal, source) {

  print('-------------------------------------------------------------------------------')

  total++;

  var result = FluoEditor.Attributes.parse(source);
  //var result = parse(source);
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

assert_rep('{"alpha":null}', 'alpha');
assert_rep('{"alpha":null}', '"alpha"');
assert_rep('{"ref":"alpha"}', '"ref":"alpha"');
assert_rep('{"ref":"alpha"}', '"ref": "alpha"');

assert_rep('{"${f:success}":null}', ' "${f:success}"');

assert_rep('{"alpha":null,"task":"clean lab"}', 'alpha, "task": "clean lab"');
assert_rep('{"alpha":null,"task":"clean lab"}', '"alpha", "task": "clean lab"');

assert_rep('{"val":1,"var":[2]}', '"val":1, "var":[2]');

assert_rep('{"name":"my def","revision":0}', '"name": "my def", "revision": 0');

assert_rep('{"${f:nada}":null}', '${f:nada}');
assert_rep('{"${f:nada}":null}', '"${f:nada}"');
assert_rep('{"${f:next}":null,"if":"${f:ok}"}', '${f:next}, "if": "${f:ok}"');
assert_rep('{"${f:next}":null,"if":"${f:ok}"}', '"${f:next}", "if": "${f:ok}"');

print('-------------------------------------------------------------------------------');
print("\n... " + win + " / " + total + "\n");

