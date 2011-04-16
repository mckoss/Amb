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

    ut.test("range", function () {
        ut.equal(amb.range().count, 0, "zero args");
        ut.equal(amb.range(10).count, 10, "one arg");
        ut.equal(amb.range(10, 15).count, 5, "two args");
        ut.equal(amb.range([1, 2, 3]).count, 3, "array");
    });

    ut.test("amb range", function () {
        function range1(amb, fail) {
            var x = amb(10);
            if (x != 5) fail();
            return x;
        }

        function range2(amb, fail) {
            var x = amb(50, 75);
            if (x != 69) fail();
            return x;
        }

        ut.equal(amb.ambCall(range1), 5, "0 .. n");
        ut.equal(amb.ambCall(range2), 69, "n .. m");
    });

    coverage.testCoverage();

});
