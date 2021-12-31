'use strict';

// Pull testing functions into the global namespace
const chai = require('chai');
chai.should();
chai.use(require('sinon-chai'));
global.assert = chai.assert;
global.expect = chai.expect;
global.request = {}; // Set by the API test runner
global.sinon = require('sinon');
global.type = require('type-detect');

// Run top-subfolder test scripts, which should then run any further tests inside.
require('module-alias/register');
require('@api/api.test');
require('@lib/lib.test');
require('@tests/tests.test');
