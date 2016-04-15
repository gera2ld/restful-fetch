const proxyquire = require('proxyquire');
const assert = require('assert');
const fetch = require('../mock-lib/isomorphic-fetch');

const Restful = proxyquire('../dist', {'isomorphic-fetch': fetch});

rest = new Restful({
  presets: ['json'],
});

it('should GET', done => {
  rest.get('/hello')
  .then(data => {
    assert.equal(data.responseLine, 'GET /hello');
  })
  .then(done, done);
});

it('should POST', done => {
  rest.post('/hello', {
    foo: 'bar',
  })
  .then(data => {
    assert.equal(data.responseLine, 'POST /hello');
    assert.equal(data.data.foo, 'bar');
  })
  .then(done, done);
});

it('should PUT', done => {
  rest.put('/hello', {
    foo: 'bar',
  })
  .then(data => {
    assert.equal(data.responseLine, 'PUT /hello');
    assert.equal(data.data.foo, 'bar');
  })
  .then(done, done);
});

it('should DELETE', done => {
  rest.remove('/hello')
  .then(data => {
    assert.equal(data.responseLine, 'DELETE /hello');
    assert.equal(data.data, null);
  })
  .then(done, done);
});
