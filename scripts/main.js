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
