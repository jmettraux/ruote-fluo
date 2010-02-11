
win = 0;
total = 0;

// ----------------------------------------------------------------------------
  var Attributes = function() {

    function unquoteKey (k) {

      var m = k.match(/^"([^"]*)"$|^'([^']*)'$/);
      if (m) return m[1] || m[2];
      return k;
    }

    function parse (s, accumulator) {

      if ( ! accumulator) accumulator = {};

      var icolon = s.indexOf(':');
      var icomma = s.indexOf(',');

      if (icomma > 0 && icomma < icolon) {
        accumulator[unquoteKey(s.substring(0, icomma))] = null;
        return parse(s.substring(icomma + 1), accumulator);
      }

      var m = s.match(/^\s*([^:]+):\s*(.+)$/);
      if (m) {
        var key = m[1];
        var limit = m[2].length;
        while (true) {
          var svalue = m[2].substring(0, limit);
          var value = null;
          try {
            value = JSON.parse(svalue);
          }
          catch (e) {
            var i = svalue.lastIndexOf(',');
            if (i < 0) value = unquoteKey(svalue);
            else limit = i;
          }
          if (value != null) {

            accumulator[key] = value;

            if (limit == m[2].length) return accumulator;
            else return parse(m[2].substring(limit + 1), accumulator);
          }
        }
      }
      accumulator[s] = null;
      return accumulator;
    }

    return { parse: parse };
  }();
// ----------------------------------------------------------------------------

function assert_rep (goal, source) {

  print('-------------------------------------------------------------------------------')

  total++;

  //var result = FluoTred.ExpressionHead.parse(source);
  var result = Attributes.parse(source);
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

print('-------------------------------------------------------------------------------')
print("\n... " + win + " / " + total + "\n");

