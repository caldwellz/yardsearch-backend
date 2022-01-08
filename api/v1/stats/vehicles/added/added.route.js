'use strict';

const logic = require('./added.logic');
const validate = require('./added.validate');

const Router = require('@koa/router');
const router = new Router({
  prefix: '/added'
});

async function handler (ctx, next) {
  const params = validate(ctx.request.query);
  if (!params) {
    ctx.throw(400);
  }
  try {
    ctx.body = await logic.getResults(params);
  } catch (err) {
    ctx.throw(500, err);
  }
  await next();
}
router.get('/', handler);

module.exports = router;
