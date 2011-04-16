#!/usr/bin/env node
global.namespace = require('../sub/namespace/src/namespace.js').namespace;
require('../sub/namespace/src/types.js');
require('../sub/namespace/src/funcs.js');
namespace.module('org.startpad.funcs').patch();
require('../sub/namespace/test/qunit-node.js');

require('../scripts/amb.js');
require('./test-amb.js');
