'use strict';

require('module-alias/register');
const Koa = require('koa');
const app = new Koa();
const config = require('config');
const db = require('@lib/db');
const log = require('@lib/log');

app.init = async function () {
  // Redirect Koa error logs to our internal logger
  this.on('error', async (err, ctx) => {
    if (!this.silent) {
      let logLevel;
      if (err.status >= 500) { logLevel = 'error'; } else { logLevel = 'info'; }
      log.log([logLevel, 'app', 'koa'], `[${err.status}] ${err.message}`);
    }
  });

  // Connect to the database
  try {
    await db.init();
  } catch (err) {
    log.crit(['app', 'start'], 'Failed to connect to MongoDB:');
    log.crit(['app', 'start'], err);
    throw new Error('App initialization failed.');
  }

  // Fetch/apply environment configuration
  const env = config.get('env');
  this.proxy = config.get('server.proxy');

  // ---- Mount all-purpose middleware ----

  // Add X-Response-Time header in development environments
  if (env !== 'production') {
    const responseTime = require('koa-response-time');
    this.use(responseTime({ hrtime: config.get('logger.highResolutionTime') }));
  }

  // Use Koa-Helmet (see https://github.com/venables/koa-helmet)
  const helmet = require('koa-helmet');
  this.use(helmet());

  // Parse the body. It's recommended to move this down to routes that use it, however.
  const koaBody = require('koa-body');
  // Copy the config because koa-body expects the object to be extensible.
  const bodyParseOptions = JSON.parse(JSON.stringify(config.get('bodyParseOptions')));
  this.use(koaBody(bodyParseOptions));

  // ---- End of all-purpose middleware ----

  // Finally, mount the top-level API router
  const api = require('@api/api.route');
  this.use(api.routes());
  this.use(api.allowedMethods());
};

module.exports = app;
