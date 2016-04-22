const proxyquire = require('proxyquire');
const assert = require('assert');
const fetch = require('../mock-lib/isomorphic-fetch');

const Restful = proxyquire('../dist', {'isomorphic-fetch': fetch});

var rest;

beforeEach(() => {
  rest = new Restful({
    presets: ['json'],
  });
});

describe('Restful', () => {
  describe('Request', () => {
    it('GET', () => {
      return rest.get('hello')
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

    it('GET absolute path', () => {
      return rest.get('http://www.google.com/')
      .then(data => {
        assert.equal(data.responseLine, 'GET http://www.google.com/');
      });
    });

    it('POST', () => {
      return rest.post('hello', {
        foo: 'bar',
      })
      .then(data => {
        assert.equal(data.responseLine, 'POST /hello');
        assert.equal(data.data.foo, 'bar');
      });
    });

    it('PUT', () => {
      return rest.put('hello', {
        foo: 'bar',
      })
      .then(data => {
        assert.equal(data.responseLine, 'PUT /hello');
        assert.equal(data.data.foo, 'bar');
      });
    });

    it('DELETE', () => {
      return rest.remove('hello')
      .then(data => {
        assert.equal(data.responseLine, 'DELETE /hello');
        assert.equal(data.data, null);
      });
    });
  });

  describe('Model', () => {
    it('may have empty path', () => {
      ['', '/'].forEach(function (path) {
        assert.equal(rest.model(path).path, '');
      });
    });
    it('may provide path pieces', () => {
      assert.equal(rest.model('a', 'b', 'c').path, '/a/b/c');
    });
  });

  describe('Interceptors', () => {
    it('should intercept before request', () => {
      rest.prehandlers.push(options => ({
        url: options.url + '/intercepted',
      }));
      return rest.get('hello')
      .then(data => {
        assert.equal(data.responseLine, 'GET /hello/intercepted');
      });
    });

    it('should intercept after request', () => {
      rest.posthandlers.push(options => {
        options.data = 'intercepted';
        return options;
      });
      return rest.get('hello')
      .then(data => {
        assert.equal(data.responseLine, 'GET /hello');
        assert.equal(data.data, 'intercepted');
      });
    });

    it('should parse errors', () => {
      return rest.post('error', {
        status: 404,
      }).then(data => {
        assert.ok(false);
      }, err => {
        assert.equal(err.status, 404);
        assert.equal(err.data.responseLine, 'POST /error');
      });
    });
  });
});

describe('Model', () => {
  var model;

  beforeEach(() => {
    model = rest.model('/res/1');
  });

  describe('Request', () => {
    it('GET', () => {
      return model.get().then(data => {
        assert.equal(data.responseLine, 'GET /res/1');
      });
    });

    it('POST', () => {
      return model.post('hello', {
        foo: 'bar',
      })
      .then(data => {
        assert.equal(data.responseLine, 'POST /res/1/hello');
        assert.equal(data.data.foo, 'bar');
      });
    });

    it('PUT', () => {
      return model.put('hello', {
        foo: 'bar',
      })
      .then(data => {
        assert.equal(data.responseLine, 'PUT /res/1/hello');
        assert.equal(data.data.foo, 'bar');
      });
    });

    it('DELETE', () => {
      return model.remove('hello')
      .then(data => {
        assert.equal(data.responseLine, 'DELETE /res/1/hello');
        assert.equal(data.data, null);
      });
    });
  });

  describe('Submodel', () => {
    it('may have empty path', () => {
      assert.equal(model.model().path, model.path);
    });
    it('should append path', () => {
      const submodel = model.model('child/2');
      return submodel.get().then(data => {
        assert.equal(data.responseLine, 'GET /res/1/child/2');
      });
    });
  });

  describe('Interceptors', () => {
    it('should intercept before request', () => {
      model.prehandlers.push(options => ({
        params: {
          intercepted: 1
        },
      }));
      return model.get('hello')
      .then(data => {
        assert.equal(data.responseLine, 'GET /res/1/hello?intercepted=1');
      });
    });

    it('should intercept after request', () => {
      model.posthandlers.push(options => {
        options.data = 'intercepted';
        return options;
      });
      return model.get('hello')
      .then(data => {
        assert.equal(data.responseLine, 'GET /res/1/hello');
        assert.equal(data.data, 'intercepted');
      });
    });
  });
});
