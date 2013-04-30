
//
// testing ruote-fluo-editor
//
// Tue Aug 14 01:13:12 JST 2012
//

function eq(actual, expected, message) {

  deepEqual(John.parse('{' + actual + '}'), expected, message)
}

test('attributes parse test', function() {

  eq('alpha', { alpha: null });
  eq('"alpha"', { alpha: null });

  eq('ref:alpha', { ref: 'alpha' });
  eq('ref:"alpha"', { ref: 'alpha' });
  eq('ref: "alpha"', { ref: 'alpha' });

  eq('"ref":"alpha"', { ref: 'alpha' });
  eq('"ref": "alpha"', { ref: 'alpha' });

  eq(' "${f:success}"', { '${f:success}': null });

  eq('alpha, "task": "clean lab"', { alpha: null, task: 'clean lab' });
  eq('"alpha", "task": "clean lab"', { alpha: null, task: 'clean lab' });

  eq('"val":1, "var":[2]', { val: 1, 'var': [ 2 ] });

  eq('"name": "my def", "revision": 0', { name: 'my def', revision: 0 });

  //eq('${f:nada}', { '${f:nada}': null });
  eq('"${f:nada}"', { '${f:nada}': null });

  //eq('${f:next}, "if": "${f:ok}"', { '${f:next}': null, 'if': '${f:ok}' });
  eq('"${f:next}", "if": "${f:ok}"', { '${f:next}': null, 'if': '${f:ok}' });
});


var def0 =
  [ 'define', { name: 'test' }, [
    [ 'alpha', { task: 'clean car' }, [] ],
    [ 'bravo', { task: 'sell car' }, [] ]
  ] ];
var def1 =
  [ "define",{ test0: null }, [
    [ "concurrence", { count: 1}, [
      [ "alpha", {}, [] ],
      [ "bravo", {}, [] ] ]
    ],
    [ "charly", { task: "wash cups" }, [] ]
  ] ];

test('asJson() 0', function() {

  RuoteFluoEditor.render('#editor', def0);

  equal(RuoteFluoEditor.asJson('#editor'), JSON.stringify(def0));
});

test('asJson() 1', function() {

  RuoteFluoEditor.render('#editor', def1);

  equal(RuoteFluoEditor.asJson('#editor'), JSON.stringify(def1));
});

test('asRadial() 0', function() {

  RuoteFluoEditor.render('#editor', def0);

  var s0 =
"define name: test\n\
  alpha task: \"clean car\"\n\
  bravo task: \"sell car\"";

  equal(RuoteFluoEditor.asRadial('#editor'), s0);
});

test('asRadial() 1', function() {

  RuoteFluoEditor.render('#editor', def1);

  var s1 =
"define test0\n\
  concurrence count: 1\n\
    alpha\n\
    bravo\n\
  charly task: \"wash cups\"";

  equal(RuoteFluoEditor.asRadial('#editor'), s1);
});

test('asRuby() 0', function() {

  RuoteFluoEditor.render('#editor', def0);

  var s0 =
"define name: \"test\" do\n\
  alpha task: \"clean car\"\n\
  bravo task: \"sell car\"\n\
end";

  equal(RuoteFluoEditor.asRuby('#editor'), s0);
});

test('asRuby() 1', function() {

  RuoteFluoEditor.render('#editor', def1);

  var s1 =
"define test0 do\n\
  concurrence count: 1 do\n\
    alpha\n\
    bravo\n\
  end\n\
  charly task: \"wash cups\"\n\
end";

  equal(RuoteFluoEditor.asRuby('#editor'), s1);
});

test('asXml() 0', function() {

  RuoteFluoEditor.render('#editor', def0);

  var s0 =
"<define name=\"test\">\
<alpha task=\"clean car\"></alpha>\
<bravo task=\"sell car\"></bravo>\
</define>";

  equal(RuoteFluoEditor.asXml('#editor'), s0);
});

