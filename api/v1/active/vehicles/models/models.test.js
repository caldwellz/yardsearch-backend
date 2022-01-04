'use strict';

const path = '/api/v1/active/vehicles/models';

describe('/models', () => {
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
