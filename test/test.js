const proxyquire = require('proxyquire');
const assert = require('assert');
const fetch = require('../mock-lib/isomorphic-fetch');

const Restful = proxyquire('../lib', {'isomorphic-fetch': fetch});

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

    it('GET with params', () => {
      return Promise.all([
        rest.get('http://www.google.com/', {a: 1})
        .then(data => {
          assert.equal(data.responseLine, 'GET http://www.google.com/?a=1');
        }),
        rest.get('http://www.google.com/', {a: 0})
        .then(data => {
          assert.equal(data.responseLine, 'GET http://www.google.com/?a=0');
        }),
        rest.get('http://www.google.com/', {a: false})
        .then(data => {
          assert.equal(data.responseLine, 'GET http://www.google.com/?a=false');
        }),
        rest.get('http://www.google.com/', {a: null})
        .then(data => {
          assert.equal(data.responseLine, 'GET http://www.google.com/?a=');
        }),
        rest.get('http://www.google.com/', {a: undefined})
        .then(data => {
          assert.equal(data.responseLine, 'GET http://www.google.com/?a=');
        }),
      ]);
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

    it('PATCH', () => {
      return rest.patch('hello', {
        foo: 'bar',
      })
      .then(data => {
        assert.equal(data.responseLine, 'PATCH /hello');
        assert.equal(data.data.foo, 'bar');
      });
    });

    it('DELETE', () => {
      return rest.delete('hello')
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
      rest.posthandlers.push((res, options) => {
        res.data = 'intercepted';
        res.method = options.method;
        return res;
      });
      return rest.get('hello')
      .then(data => {
        assert.equal(data.responseLine, 'GET /hello');
        assert.equal(data.data, 'intercepted');
        assert.equal(data.method, 'GET');
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

    it('PATCH', () => {
      return model.patch('hello', {
        foo: 'bar',
      })
      .then(data => {
        assert.equal(data.responseLine, 'PATCH /res/1/hello');
        assert.equal(data.data.foo, 'bar');
      });
    });

    it('DELETE', () => {
      return model.delete('hello')
      .then(data => {
        assert.equal(data.responseLine, 'DELETE /res/1/hello');
        assert.equal(data.data, null);
      });
    });
  });

  describe('Submodel', () => {
    it('should allow empty path', () => {
      ['', '/'].forEach(function (path) {
        const child = model.model(path);
        assert.equal(model.path, child.path);
      });
    });

    it('should prepend path', () => {
      const submodel = model.model('child/2');
      return submodel.get().then(data => {
        assert.equal(data.responseLine, 'GET /res/1/child/2');
      });
    });
  });

  describe('Interceptors', () => {
    it('should intercept before request', () => {
      Object.assign(rest.headers, {
        header1: 'header1',
        header2: 'header2',
      });
      model.prehandlers.push(options => ({
        params: {
          intercepted: 1
        },
        headers: {
          header2: 'override header2',
          header3: 'header3',
        },
      }));
      return model.get('hello')
      .then(data => {
        assert.equal(data.responseLine, 'GET /res/1/hello?intercepted=1');
        assert.equal(data.headers.header1, 'header1');
        assert.equal(data.headers.header2, 'override header2');
        assert.equal(data.headers.header3, 'header3');
      });
    });

    it('should intercept after request', () => {
      model.posthandlers.push((data, options) => {
        data.data = 'intercepted';
        data.relative = options.relative;
        return data;
      });
      return model.get('hello')
      .then(data => {
        assert.equal(data.responseLine, 'GET /res/1/hello');
        assert.equal(data.data, 'intercepted');
        assert.equal(data.relative, '/hello');
      });
    });

    it('should override global interceptors', () => {
      model.overrides = {
        posthandlers: [
          res => res.text(),
        ],
      };
      return model.get('hello')
      .then(data => {
        assert.equal(data, 'GET /res/1/hello');
      });
    });
  });

  describe('Placeholders', () => {
    it('should not request for abstract model', () => {
      const child = model.model('child/:id');
      assert.deepEqual(child.parameters, {id: true});
      try {
        child.get();
        throw new Error('Should not execute here.')
      } catch (err) {
        assert.ok(err.message.startsWith('Abstract model'));
      }
    });

    it('should request after data filled', () => {
      const abs = model.model('child/:id');
      const filled = abs.fill({id: '123'});
      assert.strictEqual(abs.prehandlers, filled.prehandlers);
      assert.strictEqual(abs.posthandlers, filled.posthandlers);
      return filled.get()
      .then(data => {
        assert.equal(data.responseLine, 'GET /res/1/child/123');
      });
    });

    it('should allow partial filling', () => {
      const abs = model.model('/a/:a/b/:b');
      const child = abs.fill({a: 1});
      assert.deepEqual(child.parameters, {b: true});
    });

    it('should allow 0 as data', () => {
      const abs = model.model('child/:id');
      const filled = abs.fill({id: 0});
      return filled.get()
      .then(data => {
        assert.equal(data.responseLine, 'GET /res/1/child/0');
      });
    });
  });
});
