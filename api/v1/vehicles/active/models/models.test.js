'use strict';

const path = '/api/v1/vehicles/active/models';

describe('/models', () => {
  require('./models.mock');

  it('returns OK status', async () => {
    await request.get(path)
      .expect(200);
  });

  it('returns the expected content', async () => {
    await request.get(path)
      .expect('Content-Type', /json/)
      .expect(200, {
        FAKEMAKE: [
          'FAKE MODEL 1',
          'FAKE MODEL 2'
        ]
      });
  });
});
