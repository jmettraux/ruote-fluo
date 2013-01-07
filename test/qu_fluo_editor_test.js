
//
// testing ruote-fluo-editor
//
// Tue Aug 14 01:13:12 JST 2012
//

function jpequal(actual, expected, message) {

  deepEqual(John.parse('{' + actual + '}'), expected, message)
}

test('attributes parse test', function() {

  jpequal('alpha', { alpha: null });
  jpequal('"alpha"', { alpha: null });

  jpequal('ref:alpha', { ref: 'alpha' });
  jpequal('ref:"alpha"', { ref: 'alpha' });
  jpequal('ref: "alpha"', { ref: 'alpha' });

  jpequal('"ref":"alpha"', { ref: 'alpha' });
  jpequal('"ref": "alpha"', { ref: 'alpha' });

  jpequal(' "${f:success}"', { '${f:success}': null });

  jpequal('alpha, "task": "clean lab"', { alpha: null, task: 'clean lab' });
  jpequal('"alpha", "task": "clean lab"', { alpha: null, task: 'clean lab' });

  jpequal('"val":1, "var":[2]', { val: 1, 'var': [ 2 ] });

  jpequal('"name": "my def", "revision": 0', { name: 'my def', revision: 0 });

  jpequal('${f:nada}', { '${f:nada}': null });
  jpequal('"${f:nada}"', { '${f:nada}': null });

  jpequal('${f:next}, "if": "${f:ok}"', { '${f:next}': null, 'if': '${f:ok}' });
  jpequal('"${f:next}", "if": "${f:ok}"', { '${f:next}': null, 'if': '${f:ok}' });
});

