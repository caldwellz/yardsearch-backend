'use strict';

const app = require('@lib/app');
const supertest = require('supertest');

describe('/api', () => {
  // Start the app and attach supertest to it, cleaning it up when done
  let server = {};
  before(async () => { await app.init(); server = app.listen(); });
  after(() => { server.close(); });
  beforeEach(() => { global.request = supertest(server); });

  require('./v1/v1.test');
});
