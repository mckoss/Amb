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

    coverage.testCoverage();

});
