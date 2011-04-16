namespace.module('org.startpad.amb', function (exports, require) {
    var types = require('org.startpad.types');

    exports.extend({
        'VERSION': '1.0.0r1',
        'ambCall': function (func) { return ambCallWorker(0, 1, func); },
        'ambCallWorker': ambCallWorker,
        'range': range
    });

    function range() {
        var r;
        if (arguments.length == 1) {
            if (types.isArray(arguments[0])) {
                r = {min: 0, max: arguments[0].length, values: arguments[0]};
            } else {
                r = {min: 0, max: arguments[0]};
            }
        } else if (arguments.length == 2) {
            r = {min: arguments[0], max: arguments[1]};
        }
        if (r) {
            if (r.min >= r.max) {
                r = undefined;
            }
        }
        return r;
    }

    // Call func(amb, fail) until it succeeds.
    // Calls to amb returns a selected value.  func is restarted if
    // fail is called.
    function ambCallWorker(id, workers, func) {
        var choices = [];
        var index;

        function amb(values) {
            if (!values || !values.length) {
                fail();
            }
            if (index == choices.length) {
                var start = Math.floor(id * values.length / workers);
                choices.push({i: start,
                              start: start,
                              count: values.length});
            }
            var choice = choices[index++];
            return values[choice.i];
        }

        function fail() { fail.failures++; throw fail; }
        fail.failures = 0;

        while (true) {
            try {
                index = 0;
                return func(amb, fail);
            } catch (e) {
                if (e != fail) {
                    throw e;
                }
                var choice;
                while ((choice = choices.pop())) {
                    if (++choice.i == choice.count) {
                        choice.i = 0;
                    }
                    if (choice.i != choice.start) {
                        break;
                    }
                }
                if (choice == undefined) {
                    return undefined;
                }
                choices.push(choice);
            }
        }
    }

});
