
//
// testing Nu
//
// Tue Aug 14 16:31:18 JST 2012
//


//
// testing John.parse(s)

function j_assert(source, expected, message) {

  equal(
    JSON.stringify(John.parse(source)),
    JSON.stringify(expected),
    message)
}

test('Nu.each(array)', function() {

  var i = 0;

  Nu.each([ 1, 2, 3 ], function(e) {
    i = i + e;
  });

  equal(i, 6);
});

test('Nu.each(array) with index', function() {

  var a = [];

  Nu.each([ 1, 2, 3 ], function(e, i) {
    a.push(e + ':' + i);
  });

  equal(a.join(', '), '1:0, 2:1, 3:2');
});

test('Nu.each(object)', function() {

  var a = [];

  Nu.each({ a: 1, b: 2, c: 3}, function(k, v) {
    a.push(k + ':' + v);
  });

  equal(a.join(', '), 'a:1, b:2, c:3');
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

  equal(r.join(':'), 'bravo:50');
});

test('Nu.map(array)', function() {

  var r = Nu.map([ 1, 2, 3 ], function(e) { return e * 2; });

  equal(r.join(', '), '2, 4, 6');
});

test('Nu.map(object)', function() {

  var r = Nu.map({ alpha: 10, bravo: 50, charly: 70 }, function(k, v) {
    return v / 10;
  });

  equal(r.join(', '), '1, 5, 7');
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

