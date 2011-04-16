namespace.module('org.startpad.amb.test', function (exports, require) {
    var ut = require('com.jquery.qunit');
    var utCoverage = require('org.startpad.qunit.coverage');
    var amb = require('org.startpad.amb');
    var types = require('org.startpad.types');

    ut.module('org.startpad.amb');

    var coverage;

    coverage = new utCoverage.Coverage('org.startpad.amb');

    ut.test("version", function () {
        var version = amb.VERSION.split('.');
        ut.equal(version.length, 3, "VERSION has 3 parts");
        ut.ok(version[0] == 1 && version[1] == 0, "tests for version 1.0");
    });

    function moreThanTen(amb, fail) {
      var a = amb([1, 2, 3]);
      var b = amb([7, 8, 9]);
      if (a + b <= 10) {
         fail();
      }
      return [a, b];
    }

    ut.test("ambCall", function () {
        var x = amb.ambCall(moreThanTen);
        ut.ok(x[0] + x[1] > 10, x);
    });

    ut.test("ambCallWorker", function () {
        var x = amb.ambCallWorker(3, 4, moreThanTen);
        ut.ok(x[0] + x[1] > 10, x);
    });

    coverage.testCoverage();

});
