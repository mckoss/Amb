namespace.module('org.startpad.amb.demos', function(exports, require) {
    var dom = require('org.startpad.dom');
    var clientLib = require('com.pageforest.client');

    ns.extend({
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
