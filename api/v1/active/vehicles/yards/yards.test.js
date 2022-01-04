'use strict';

const path = '/api/v1/active/vehicles/yards';

describe('/yards', () => {
  it('returns OK status', async () => {
    await request.get(path)
      .expect(200);
  });

  it('returns the expected content', async () => {
    await request.get(path)
      .expect('Content-Type', /json/)
      .expect(200, [
        'MOCK YARD 1',
        'MOCK YARD 2'
      ]);
  });
});
