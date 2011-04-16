namespace.module('org.startpad.amb', function (exports, require) {
    var types = require('org.startpad.types');

    exports.extend({
        'VERSION': '1.0.0r1',
        'ambCall': function (func) { return ambCallWorker(0, 1, func); },
        'ambCallWorker': ambCallWorker,
        'range': range
    });

    function Range() {
        this.min = 0;
        this.max = 0;
        this.init.apply(this, arguments);
    }

    Range.methods({
        init: function() {
            if (arguments.length == 1) {
                if (types.isArray(arguments[0])) {
                    this.max = arguments[0].length;
                    this.values = arguments[0];
                } else {
                    this.max = arguments[0];
                }
            } else if (arguments.length == 2) {
                this.min = arguments[0];
                this.max = arguments[1];
            }
            this.count = Math.max(0, this.max - this.min);
        },

        get: function (i) {
            if (this.values) {
                return this.values[i];
            }
            return (this.min + i);
        }
    });

    function range() {
        var r = new Range();
        r.init.apply(r, arguments);
        return r;
    }

    // Call func(amb, fail) until it succeeds.
    // Calls to amb returns a selected value.  func is restarted if
    // fail is called.
    function ambCallWorker(id, workers, func) {
        var choices = [];
        var index;

        function amb() {
            values = range.apply(undefined, arguments);
            if (values.count == 0) {
                fail();
            }
            if (index == choices.length) {
                var start = Math.floor(id * values.count / workers);
                choices.push({i: start,
                              start: start,
                              count: values.count});
            }
            var choice = choices[index++];
            return values.get(choice.i);
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
