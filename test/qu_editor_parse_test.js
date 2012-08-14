
//
// testing ruote-fluo-editor
//
// Tue Aug 14 01:13:12 JST 2012
//

function jequal(actual, expected, message) {

  equal(
    JSON.stringify(John.parse('{' + actual + '}')),
    JSON.stringify(expected),
    message)
}

test('attributes parse test', function() {

  jequal('alpha', { alpha: null });
  jequal('"alpha"', { alpha: null });

  jequal('ref:alpha', { ref: 'alpha' });
  jequal('ref:"alpha"', { ref: 'alpha' });
  jequal('ref: "alpha"', { ref: 'alpha' });

  jequal('"ref":"alpha"', { ref: 'alpha' });
  jequal('"ref": "alpha"', { ref: 'alpha' });

  jequal(' "${f:success}"', { '${f:success}': null });

  jequal('alpha, "task": "clean lab"', { alpha: null, task: 'clean lab' });
  jequal('"alpha", "task": "clean lab"', { alpha: null, task: 'clean lab' });

  jequal('"val":1, "var":[2]', { val: 1, 'var': [ 2 ] });

  jequal('"name": "my def", "revision": 0', { name: 'my def', revision: 0 });

  jequal('${f:nada}', { '${f:nada}': null });
  jequal('"${f:nada}"', { '${f:nada}': null });

  jequal('${f:next}, "if": "${f:ok}"', { '${f:next}': null, 'if': '${f:ok}' });
  jequal('"${f:next}", "if": "${f:ok}"', { '${f:next}': null, 'if': '${f:ok}' });
});

