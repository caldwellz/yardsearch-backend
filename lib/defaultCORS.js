'use strict';

const config = require('config');

module.exports = function () {
  // Set default CORS options
  return async function defaultCORS (ctx, next) {
    const env = config.get('env');

    // In development modes, don't make browsers validate origin or headers
    if (env !== 'production') {
      ctx.set('Access-Control-Allow-Origin', '*');
      ctx.set('Access-Control-Allow-Headers', '*');
    }

    await next();
  };
};
