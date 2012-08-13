
//
// testing ruote-fluo-editor
//

function jequal(a, b, message) {
  equal(JSON.stringify(a), JSON.stringify(b), message)
}

test('attributes parse test', function() {

  function parse(source) {
    return FluoEditor.Attributes.parse(source);
  }

  jequal({ alpha: null }, parse('alpha'));
  jequal({ alpha: null }, parse('"alpha"'));

  //jequal({ ref: 'alpha' }, parse('ref:alpha'));
  //jequal({ ref: 'alpha' }, parse('ref:"alpha"'));

  jequal({ ref: 'alpha' }, parse('"ref":"alpha"'));
  jequal({ ref: 'alpha' }, parse('"ref": "alpha"'));

  jequal({ '${f:success}': null }, parse(' "${f:success}"'));

  jequal(
    { alpha: null, task: 'clean lab' },
    parse('alpha, "task": "clean lab"'));
  jequal(
    { alpha: null, task: 'clean lab' },
    parse('"alpha", "task": "clean lab"'));

  jequal({ val: 1, 'var': [ 2 ] }, parse('"val":1, "var":[2]'));

  jequal(
    { name: 'my def', revision: 0 },
    parse('"name": "my def", "revision": 0'));

  jequal({ '${f:nada}': null }, parse('${f:nada}'));
  jequal({ '${f:nada}': null }, parse('"${f:nada}"'));

  jequal(
    { '${f:next}': null, 'if': '${f:ok}' },
    parse('${f:next}, "if": "${f:ok}"'));
  jequal(
    { '${f:next}': null, 'if': '${f:ok}' },
    parse('"${f:next}", "if": "${f:ok}"'));
});

