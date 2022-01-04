'use strict';

const Router = require('@koa/router');
const router = new Router({
  // Current folder
  prefix: '/active'
});

// List subfolders here
const subRoutes = [
  'vehicles'
];

for (const routeName of subRoutes) {
  const route = require(`./${routeName}/${routeName}.route`);
  router.use(route.routes());
  router.use(route.allowedMethods());
}

module.exports = router;
