'use strict';

const path = '/api/v1/hello';

describe('/hello', () => {
  describe('GET', () => {
    it('defaults to stranger if given no name', async () => {
      await request.get(path)
        .expect('Content-Type', /json/)
        .expect(200, '{"message":"Hello, stranger"}');
    });

    it('accepts Alice', async () => {
      const url = `${path}?user=Alice`;
      await request.get(url)
        .expect('Content-Type', /json/)
        .expect(200, '{"message":"Hello, Alice"}');
    });

    it('rejects Bob', async () => {
      const url = `${path}?user=Bob`;
      await request.get(url)
        .expect('Content-Type', /text/)
        .expect(400, 'Bad user');
    });
  });

  describe('POST', () => {
    it('defaults to stranger if given no name', async () => {
      await request.post(path)
        .expect('Content-Type', /json/)
        .expect(200, '{"message":"Hello, stranger"}');
    });

    it('accepts Alice', async () => {
      await request.post(path)
        .send('user=Alice')
        .expect('Content-Type', /json/)
        .expect(200, '{"message":"Hello, Alice"}');
    });

    it('rejects Bob', async () => {
      await request.post(path)
        .send('user=Bob')
        .expect('Content-Type', /text/)
        .expect(400, 'Bad user');
    });
  });
});
