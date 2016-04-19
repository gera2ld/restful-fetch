const proxyquire = require('proxyquire');
const assert = require('assert');
const fetch = require('../mock-lib/isomorphic-fetch');

const Restful = proxyquire('../dist', {'isomorphic-fetch': fetch});

const rest = new Restful({
  presets: ['json'],
});

describe('Restful', () => {
  describe('Request', () => {
    it('GET', () => {
      return rest.get('/hello')
      .then(data => {
        assert.equal(data.responseLine, 'GET /hello');
      });
    });
    it('GET empty path', () => {
      return rest.get()
      .then(data => {
        assert.equal(data.responseLine, 'GET /');
      });
    });

    it('POST', () => {
      return rest.post('/hello', {
        foo: 'bar',
      })
      .then(data => {
        assert.equal(data.responseLine, 'POST /hello');
        assert.equal(data.data.foo, 'bar');
      });
    });

    it('PUT', () => {
      return rest.put('/hello', {
        foo: 'bar',
      })
      .then(data => {
        assert.equal(data.responseLine, 'PUT /hello');
        assert.equal(data.data.foo, 'bar');
      });
    });

    it('DELETE', () => {
      return rest.remove('/hello')
      .then(data => {
        assert.equal(data.responseLine, 'DELETE /hello');
        assert.equal(data.data, null);
      });
    });
  });

  describe('Model', () => {
    it('should have path', () => {
      ['', '/'].forEach(function (path) {
        try {
          const model = rest.model(path);
          assert.ok(false);
        } catch (err) {
          assert.ok(err.message.startsWith('Invalid path:'));
        }
      });
    });
  });
});

describe('Model', () => {
  const model = rest.model('/res/1');

  describe('Request', () => {
    it('GET', () => {
      return model.get().then(data => {
        assert.equal(data.responseLine, 'GET /res/1');
      });
    });

    it('POST', () => {
      return model.post('/hello', {
        foo: 'bar',
      })
      .then(data => {
        assert.equal(data.responseLine, 'POST /res/1/hello');
        assert.equal(data.data.foo, 'bar');
      });
    });

    it('PUT', () => {
      return model.put('/hello', {
        foo: 'bar',
      })
      .then(data => {
        assert.equal(data.responseLine, 'PUT /res/1/hello');
        assert.equal(data.data.foo, 'bar');
      });
    });

    it('DELETE', () => {
      return model.remove('/hello')
      .then(data => {
        assert.equal(data.responseLine, 'DELETE /res/1/hello');
        assert.equal(data.data, null);
      });
    });
  });

  describe('Submodel', () => {
    it('should have path', () => {
      try {
        const submodel = model.model();
        assert.ok(false);
      } catch (err) {
        assert.ok(err.message.startsWith('Invalid path:'));
      }
    });
    it('should prepend path', () => {
      const submodel = model.model('child/2');
      return submodel.get().then(data => {
        assert.equal(data.responseLine, 'GET /res/1/child/2');
      });
    });
  });
});
