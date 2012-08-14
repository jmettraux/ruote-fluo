
//
// testing ruote-fluo-editor (the John module)
//
// Tue Aug 14 01:12:52 JST 2012
//


//
// high-level John.parse(s) testing

function j_assert(source, expected, message) {

  equal(
    JSON.stringify(John.parse(source)),
    JSON.stringify(expected),
    message)
}

test('atomic values', function() {

  j_assert('"oh yeah"', 'oh yeah');
  j_assert('"わしらの電車"', 'わしらの電車');
  j_assert('"a:b"', 'a:b');

  j_assert('1', 1);
  j_assert('1.2', 1.2);
  j_assert('1.2e10', 1.2e10);
  j_assert('-1', -1);

  j_assert('true', true);
  j_assert('false', false);

  j_assert('null', null);
});

test('single quoted strings', function() {

  j_assert("'de nada'", 'de nada');
  j_assert("'わしらの電車'", 'わしらの電車');
  j_assert("'she said \"too bad!\"'", 'she said "too bad!"');
});

test('standalone strings', function() {

  j_assert("炊飯器", '炊飯器');
  j_assert("de nada", 'de nada');
});

test('vanilla arrays', function() {

  j_assert('[ 1, 2, "trois" ]', [ 1, 2, 'trois' ]);
});

test('vanilla objects', function() {

  j_assert('{ "a": 1 }', { a: 1 });
});

test('relaxed arrays', function() {

  j_assert("[ 1, 2, 'trois' ]", [ 1, 2, 'trois' ]);
});

test('relaxed objects', function() {

  j_assert("{ a: 0, b: 1 }", { a: 0, b: 1 });
});


//
// testing extractString() behind the scenes

function es_assert(source, expected, message) {

  equal(
    JSON.stringify(John._es(source)),
    JSON.stringify(expected),
    message);
}

test('extractString()', function() {

  es_assert('abc', [ 'abc', null, '' ]);
  es_assert('"abc"', [ 'abc', null, '' ]);
  es_assert("'abc'", [ 'abc', null, '' ]);

  es_assert('"ab\\"c"', [ 'ab"c', null, '' ]);
  es_assert("'ab\"c'", [ 'ab"c', null, '' ]);
  es_assert("'ab\\\'c'", [ 'ab\'c', null, '' ]);

  es_assert('abc: xxx', [ 'abc', ':', 'xxx' ]);
  es_assert('abc : xxx', [ 'abc', ':', 'xxx' ]);
  es_assert('"abc": xxx', [ 'abc', ':', 'xxx' ]);
  es_assert("'abc': xxx", [ 'abc', ':', 'xxx' ]);
  es_assert('"de nada": xxx', [ 'de nada', ':', 'xxx' ]);

  es_assert('abc, xxx', [ 'abc', ',', 'xxx' ]);
  es_assert('abc , xxx', [ 'abc', ',', 'xxx' ]);
  es_assert('"abc", xxx', [ 'abc', ',', 'xxx' ]);
  es_assert("'abc', xxx", [ 'abc', ',', 'xxx' ]);
  es_assert('"de nada", xxx', [ 'de nada', ',', 'xxx' ]);
});

