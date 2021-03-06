/* Namespace.js - modular namespaces in JavaScript

   by Mike Koss - placed in the public domain
*/

(function(global) {
    var globalNamespace = global['namespace'];
    var Module;
    var VERSION = '3.0.0';

    function numeric(s) {
        if (!s) {
            return 0;
        }
        var a = s.split('.');
        return 10000 * parseInt(a[0]) + 100 * parseInt(a[1]) + parseInt(a[2]);
    }

    if (globalNamespace) {
        if (numeric(VERSION) <= numeric(globalNamespace['VERSION'])) {
            return;
        }
        Module = globalNamespace.constructor;
    } else {
        Module = function () {};
        global['namespace'] = globalNamespace = new Module();
    }
    globalNamespace['VERSION'] = VERSION;

    function require(path) {
        path = path.replace(/-/g, '_');
        var parts = path.split('.');
        var ns = globalNamespace;
        for (var i = 0; i < parts.length; i++) {
            if (ns[parts[i]] === undefined) {
                ns[parts[i]] = new Module();
            }
            ns = ns[parts[i]];
        }
        return ns;
    }

    var proto = Module.prototype;

    proto['module'] = function(path, closure) {
        var exports = require(path);
        if (closure) {
            closure(exports, require);
        }
        return exports;
    };

    proto['extend'] = function(exports) {
        for (var sym in exports) {
            if (exports.hasOwnProperty(sym)) {
                this[sym] = exports[sym];
            }
        }
    };
}(this));
namespace.module('org.startpad.types', function (exports, require) {
    exports.extend({
        'VERSION': '0.1.0',
        'isArguments': function (value) { return isType(value, 'arguments'); },
        'isArray': function (value) { return isType(value, 'array'); },
        'copyArray': copyArray,
        'isType': isType,
        'typeOf': typeOf,
        'extend': extend,
        'project': project,
        'getFunctionName': getFunctionName
    });

    // Can be used to copy Arrays and Arguments into an Array
    function copyArray(arg) {
        return Array.prototype.slice.call(arg);
    }

    var baseTypes = ['number', 'string', 'boolean', 'array', 'function', 'date',
                     'regexp', 'arguments', 'undefined', 'null'];

    function internalType(value) {
        return Object.prototype.toString.call(value).match(/\[object (.*)\]/)[1].toLowerCase();
    }

    function isType(value, type) {
        return typeOf(value) == type;
    }

    // Return one of the baseTypes as a string
    function typeOf(value) {
        if (value === undefined) {
            return 'undefined';
        }
        if (value === null) {
            return 'null';
        }
        var type = internalType(value);
        if (baseTypes.indexOf(type) == -1) {
            type = typeof(value);
        }
        return type;
    }

    // IE 8 has bug that does not enumerates even own properties that have
    // these internal names.
    var enumBug = !{toString: true}.propertyIsEnumerable('toString');
    var internalNames = ['toString', 'toLocaleString', 'valueOf',
                         'constructor', 'isPrototypeOf'];

    // Copy the (own) properties of all the arguments into the first one (in order).
    function extend(dest) {
        var i, j;
        var source;
        var prop;

        if (dest === undefined) {
            dest = {};
        }
        for (i = 1; i < arguments.length; i++) {
            source = arguments[i];
            for (prop in source) {
                if (source.hasOwnProperty(prop)) {
                    dest[prop] = source[prop];
                }
            }
            if (!enumBug) {
                continue;
            }
            for (j = 0; j < internalNames.length; j++) {
                prop = internalNames[j];
                if (source.hasOwnProperty(prop)) {
                    dest[prop] = source[prop];
                }
            }
        }
        return dest;
    }

    // Return new object with just the listed properties "projected"
    // into the new object.  Ignore undefined properties.
    function project(obj, props) {
        var result = {};
        for (var i = 0; i < props.length; i++) {
            var name = props[i];
            if (obj && obj.hasOwnProperty(name)) {
                result[name] = obj[name];
            }
        }
        return result;
    }

    function getFunctionName(fn) {
        if (typeof fn != 'function') {
            return undefined;
        }
        var result = fn.toString().match(/function\s*(\S+)\s*\(/);
        if (!result) {
            return '';
        }
        return result[1];
    }

});
namespace.module('org.startpad.funcs', function (exports, require) {
    var types = require('org.startpad.types');

    exports.extend({
        'VERSION': '0.2.1',
        'methods': methods,
        'bind': bind,
        'decorate': decorate,
        'shadow': shadow,
        'subclass': subclass,
        'numericVersion': numericVersion,
        'monkeyPatch': monkeyPatch,
        'patch': patch
    });

    // Convert 3-part version number to comparable integer.
    // Note: No part should be > 99.
    function numericVersion(s) {
        if (!s) {
            return 0;
        }
        var a = s.split('.');
        return 10000 * parseInt(a[0]) + 100 * parseInt(a[1]) + parseInt(a[2]);
    }

    // Monkey patch additional methods to constructor prototype, but only
    // if patch version is newer than current patch version.
    function monkeyPatch(ctor, by, version, patchMethods) {
        if (ctor._patches) {
            var patchVersion = ctor._patches[by];
            if (numericVersion(patchVersion) >= numericVersion(version)) {
                return;
            }
        }
        ctor._patches = ctor._patches || {};
        ctor._patches[by] = version;
        methods(ctor, patchMethods);
    }

    function patch() {
        monkeyPatch(Function, 'org.startpad.funcs', exports.VERSION, {
            'methods': function (obj) { methods(this, obj); },
            'curry': function () {
                var args = [this, undefined].concat(types.copyArray(arguments));
                return bind.apply(undefined, args);
             },
            'curryThis': function (self) {
                var args = types.copyArray(arguments);
                args.unshift(this);
                return bind.apply(undefined, args);
             },
            'decorate': function (decorator) {
                return decorate(this, decorator);
            },
            'subclass': function(parent, extraMethods) {
                return subclass(this, parent, extraMethods);
            }
        });
        return exports;
    }

    // Copy methods to a Constructor Function's prototype
    function methods(ctor, obj) {
        types.extend(ctor.prototype, obj);
    }

    // Bind 'this' and/or arguments and return new function.
    // Differs from native bind (if present) in that undefined
    // parameters are merged.
    function bind(fn, self) {
        var presets;

        // Handle the monkey-patched and in-line forms of curry
        if (arguments.length == 3 && types.isArguments(arguments[2])) {
            presets = Array.prototype.slice.call(arguments[2], self1);
        } else {
            presets = Array.prototype.slice.call(arguments, 2);
        }

        function merge(a1, a2) {
            var merged = types.copyArray(a1);
            a2 = types.copyArray(a2);
            for (var i = 0; i < merged.length; i++) {
                if (merged[i] === undefined) {
                    merged[i] = a2.shift();
                }
            }
            return merged.concat(a2);
        }

        return function curried() {
            return fn.apply(self || this, merge(presets, arguments));
        };
    }

    // Wrap the fn function with a generic decorator like:
    //
    // function decorator(fn, arguments, wrapper) {
    //   if (fn == undefined) { ... init ...; return;}
    //   ...
    //   result = fn.apply(this, arguments);
    //   ...
    //   return result;
    // }
    //
    // The decorated function is created for each call
    // of the decorate function.  In addition to wrapping
    // the decorated function, it can be used to save state
    // information between calls by adding properties to it.
    function decorate(fn, decorator) {
        function decorated() {
            return decorator.call(this, fn, arguments, decorated);
        }
        // Init call - pass undefined fn - but available in this
        // if needed.
        decorator.call(fn, undefined, arguments, decorated);
        return decorated;
    }

    // Create an empty object whose __proto__ points to the given object.
    // It's properties will "shadow" those of the given object until modified.
    function shadow(obj) {
        function Dummy() {}
        Dummy.prototype = obj;
        return new Dummy();
    }

    // Classical JavaScript inheritance pattern.
    function subclass(ctor, parent, extraMethods) {
        ctor.prototype = shadow(parent.prototype);
        ctor.prototype.constructor = ctor;
        ctor.prototype._super = parent;
        ctor.prototype._proto = parent.prototype;
        methods(ctor, extraMethods);
    }

});
namespace.module('org.startpad.amb.demos', function(exports, require) {
    var dom = require('org.startpad.dom');
    var clientLib = require('com.pageforest.client');
    var funcs = require('org.startpad.funcs').patch();
    var amb = require('org.startpad.amb');
    var queens = require('org.startpad.amb.demos.queens');

    exports.extend({
        'main': main,
        'getDoc': getDoc,
        'setDoc': setDoc
    });

    var client;
    var doc;                            // Bound elements here

    function main() {
        handleAppCache();
        doc = dom.bindIDs();
        client = new clientLib.Client(exports,
                                      {
                                      saveInterval: 0
                                      });

        client.addAppBar();
        $(doc.queens).click(function () {
            var solution = amb.ambCall(queens.eightQueens);
            console.log(solution);
        });
    }

    function setDoc(json) {
    }

    function getDoc() {
        return {
            blob: {
                version: 0
            },
            readers: ['public']
        };
    }

    // For offline - capable applications
    function handleAppCache() {
        if (typeof applicationCache == 'undefined') {
            return;
        }

        if (applicationCache.status == applicationCache.UPDATEREADY) {
            applicationCache.swapCache();
            location.reload();
            return;
        }

        applicationCache.addEventListener('updateready', handleAppCache, false);
    }
});
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
namespace.module('org.startpad.amb.demos.queens', function (exports, require) {
    var amb = require('org.startpad.amb');

    exports['eightQueens'] = eightQueens;

    function eightQueens(amb, fail) {
        var queens = [];
        var rows = [], cols = [], diag1 = [], diag2 = [];

        function unique(n, a) {
            if (a[n]) {
                fail();
            }
            a[n] = true;
        }

        function check(pos) {
            var row = pos[0];
            var col = pos[1];
            unique(row, rows);
            unique(col, cols);
            unique(row - col, diag1);
            unique(col - row, diag2);
        }

        for (var i = 0; i < 8; i++) {
            var next = [amb(8), amb(8)];
            check(next);
            queens.push(next);
        }
        return queens;
    }
});