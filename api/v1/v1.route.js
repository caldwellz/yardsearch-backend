'use strict';

const path = '/v1';

const Router = require('@koa/router');
const router = new Router();
const hello = require('./hello/hello.route');
router.use(path, hello.routes(), hello.allowedMethods());
module.exports = router;
