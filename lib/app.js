'use strict';

require('module-alias/register');
const config = require('config');
const log = require('@lib/log');
const Koa = require('koa');
const app = new Koa();

// Redirect logs to our internal logger
app.on('error', async (err, ctx) => {
  if (!app.silent) {
    let logLevel;
    if (err.status >= 500) { logLevel = 'error'; } else { logLevel = 'info'; }
    log.log([logLevel, 'app', 'koa'], `[${err.status}] ${err.message}`);
  }
});

// Fetch/apply environment configuration
const env = config.get('env');
app.proxy = config.get('server.proxy');

// ---- Mount all-purpose middleware ----

// Add X-Response-Time header in development environments
if (env !== 'production') {
  const responseTime = require('koa-response-time');
  app.use(responseTime({ hrtime: config.get('logger.highResolutionTime') }));
}

// Use Koa-Helmet (see https://github.com/venables/koa-helmet)
const helmet = require('koa-helmet');
app.use(helmet());

// Parse the body. It's recommended to move this down to routes that use it, however.
const koaBody = require('koa-body');
// Copy the config because koa-body expects the object to be extensible.
const bodyParseOptions = JSON.parse(JSON.stringify(config.get('bodyParseOptions')));
app.use(koaBody(bodyParseOptions));

// ---- End of all-purpose middleware ----

// Finally, mount the top-level API router
const api = require('@api/api.route');
app.use(api.routes());
app.use(api.allowedMethods());

module.exports = app;
