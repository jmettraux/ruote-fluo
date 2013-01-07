
//
// testing Nu
//
// Tue Aug 14 16:31:18 JST 2012
//


//
// testing John.parse(s)

test('Nu.each(array)', function() {

  var i = 0;

  Nu.each([ 1, 2, 3 ], function(e) {
    i = i + e;
  });

  equal(i, 6);
});

test('Nu.each(nested_array)', function() {

  var r = [];

  Nu.each([ 1, [ 2, 3, [ 4, 5 ] ], "toto" ], function(e, i) {
    r.push(i);
    r.push((typeof e));
  });

  deepEqual(r, [ 0, 'number', 1, 'object', 2, 'string' ]);
});

test('Nu.each(array) with index', function() {

  var a = [];

  Nu.each([ 1, 2, 3 ], function(e, i) {
    a.push(e + ':' + i);
  });

  deepEqual(a, [ '1:0', '2:1', '3:2' ]);
});

test('Nu.each(object)', function() {

  var a = [];

  Nu.each({ a: 1, b: 2, c: 3}, function(k, v) {
    a.push(k + ':' + v);
  });

  deepEqual(a, [ 'a:1', 'b:2', 'c:3' ]);
});

test('Nu.each(listy)', function() {

  var a = [];

  var l = { length: 3 };
  l[0] = 'a';
  l[1] = 'b';
  l[2] = 'c';

  Nu.each(l, function(v) {
    a.push(v);
  });

  deepEqual(a, [ 'a', 'b', 'c' ]);
});

test('Nu.find(array)', function() {

  var r = Nu.find([ 'alpha', 'bravo', 'charly' ], function(e, i) {
    return e.match(/^b/)
  });

  equal(r, 'bravo');
});

test('Nu.find(object)', function() {

  var r = Nu.find({ alpha: 10, bravo: 50, charly: 70 }, function(k, v) {
    return v > 40;
  });

  deepEqual(r, [ 'bravo', 50 ]);
});

test('Nu.map(array)', function() {

  var r = Nu.map([ 1, 2, 3 ], function(e) { return e * 2; });

  deepEqual(r, [ 2, 4, 6 ]);
});

test('Nu.map(object)', function() {

  var r = Nu.map({ alpha: 10, bravo: 50, charly: 70 }, function(k, v) {
    return v / 10;
  });

  deepEqual(r, [ 1, 5, 7 ]);
});

test('Nu.reduce(array)', function() {

  var r = Nu.reduce([ 0, 1, 2, 3, 4, 5 ], function(i, e) {
    return (e % 2 == 0) ? i + e : i;
  });

  equal(r, 6);
});

test('Nu.reduce(array, memo)', function() {

  var r = Nu.reduce([ 0, 1, 2, 3, 4, 5 ], 10, function(i, e) {
    return (e % 2 == 0) ? i + e : i;
  });

  equal(r, 16);
});

test('Nu.reduce(object)', function() {

  var r = Nu.reduce({ a: 1, b: 2, c: 3, d: 4 }, function(i, k, v) {
    return i + v * 2;
  });

  equal(r, 19);
});

test('Nu.reduce(object, memo)', function() {

  var r = Nu.reduce({ a: 1, b: 2, c: 3, d: 4 }, 10, function(i, k, v) {
    return i + v * 2;
  });

  equal(r, 30);
});

test('Nu.filter(array)', function() {

  var r = Nu.filter([ 0, 1, 2, 3, 4, 5 ], function(e) {
    return e % 2 == 1;
  });

  deepEqual(r, [ 1, 3, 5 ]);
});

test('Nu.filter(object)', function() {

  var r = Nu.filter({ a: 1, b: 2, c: 3, d: 4 }, function(k, v) {
    return v % 2 == 1;
  });

  deepEqual(r, { a: 1, c: 3});
});

test('Nu.max(array)', function() {

  var r = Nu.max([ 0, 2, 1, 3, 5, 4 ])

  equal(r, 5);
});

test('Nu.min(array)', function() {

  var r = Nu.min([ 0, 2, 1, 3, 5, -4 ])

  equal(r, -4);
});

test('Nu.flatten(array)', function() {

  var r = Nu.flatten([ 0, [ 1, 2, [ 3, 4 ] ], 5, 6, 7 ])

  deepEqual(r, [ 0, 1, 2, 3, 4, 5, 6, 7 ])
});

test('Nu.flatten(array, 1)', function() {

  var r = Nu.flatten(
    [ 0, [ 1, 2, [ 3, 4 ] ], 5, [ 6, 7 ] ],
    1)

  deepEqual(r, [ 0, 1, 2, [ 3, 4 ], 5, 6, 7 ])
});

test('Nu.flatten(array, 2)', function() {

  var r = Nu.flatten(
    [ 0, [ 1, 2, [ 3, 4 ] ], 5, [ 6, [ 7, [ 8, [ 9 ] ] ] ] ],
    2)

  deepEqual(r, [ 0, 1, 2, 3, 4, 5, 6, 7, [ 8, [ 9 ] ] ])
});

test('Nu.isEmpty(o)', function() {

  equal(Nu.isEmpty([]), true);
  equal(Nu.isEmpty({}), true);

  equal(Nu.isEmpty([ 1 ]), false);
  equal(Nu.isEmpty({ a: null }), false);
});

test('Nu.compact(a)', function() {

  deepEqual(Nu.compact([]), []);
  deepEqual(Nu.compact([ null ]), []);
  deepEqual(Nu.compact([ 1 ]), [ 1 ]);
  deepEqual(Nu.compact([ 1, null ]), [ 1 ]);
  deepEqual(Nu.compact([ 1, null, 2 ]), [ 1, 2 ]);
});

test('Nu.compact(o)', function() {

  deepEqual(Nu.compact({}), {});
  deepEqual(Nu.compact({ a: 1 }), { a: 1 });
  deepEqual(Nu.compact({ a: null }), {});
  deepEqual(Nu.compact({ a: null, b: 2 }), { b: 2 });
});

test('Nu.each_with_object(a)', function() {

  var r = Nu.eachWithObject([ 1, 2, 3, 4, 5 ], [], function(e, a) {
    if (e < 4) a.push(e);
  });

  deepEqual(r, [ 1, 2, 3 ]);
});

test('Nu.each_with_object(o)', function() {

  var r = Nu.eachWithObject({ a: 1, b: 2, c: 3 }, {}, function(k, v, h) {
    if (v != 2) h[k] = v * 2;
  });

  deepEqual(r, { a: 2, c: 6 });
});

test('Nu.include(array, o)', function() {

  var a = [ 1, 2, 3, 4 ];

  equal(Nu.include(a, 2), true);
  equal(Nu.include(a, 5), false);
});

