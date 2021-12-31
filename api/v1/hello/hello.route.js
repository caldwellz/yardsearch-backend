'use strict';

const Router = require('@koa/router');
const router = new Router({
  prefix: '/hello'
});

async function handler (ctx, next) {
  const user = ctx.request.query.user || ctx.request.body.user || 'stranger';
  if (user === 'Bob') { ctx.throw(400, 'Bad user'); }

  ctx.body = {
    message: `Hello, ${user}`
  };
}
router.get('/', handler);
router.post('/', handler);

module.exports = router;
