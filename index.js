#!/usr/bin/env node
'use strict';

require('module-alias/register');
const app = require('@lib/app');
const config = require('config');
const http = require('http');
const log = require('@lib/log');

async function main () {
  log.info(['app', 'start'], 'Beginning app initialization.');
  try {
    await app.init();
    const server = http.createServer(app.callback());
    server.listen({
      host: config.get('server.host'),
      port: config.get('server.port')
    }, () => {
      const addr = server.address();
      log.info(['app', 'start'], `Server running at ${addr.address}:${addr.port} using '${config.get('env')}' profile.`);
    });
  } catch (err) {
    log.crit(['start'], err);
  }
}

main();
