'use strict';

const logic = require('./models.logic');
const Router = require('@koa/router');
const router = new Router({
  prefix: '/models'
});

async function handler (ctx, next) {
  let data = {};

  // No parameters to parse, so just pass back the processed data directly.
  try {
    data = await logic.getProcessedData();
  } catch (err) {
    ctx.throw(500);
  }
  ctx.body = data;

  await next();
}

router.get('/', handler);
module.exports = router;
