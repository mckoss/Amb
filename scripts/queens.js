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