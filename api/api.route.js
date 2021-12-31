'use strict';

const path = '/api';

const Router = require('@koa/router');
const router = new Router();
const v1 = require('./v1/v1.route');
router.use(path, v1.routes(), v1.allowedMethods());
module.exports = router;
