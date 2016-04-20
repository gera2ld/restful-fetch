import fetch from 'isomorphic-fetch';
import Model from './model';

export default class Restful {
  constructor(options) {
    options = options || {};
    this.root = options.root || '';
    this.headers = Object.assign({}, options.headers);
    this.prehandlers = [];
    this.posthandlers = [res => {
      if (res.status > 300) throw res;
      return res;
    }];
    this.errhandlers = [
      res => {throw res},
    ];
    (options.presets || []).forEach(name => {
      const preset = this['preset' + name.toUpperCase()];
      preset && preset.call(this);
    });
    this.rootModel = new Model(this, this.root);
    [
      'model',
      'request',
      'get',
      'post',
      'put',
      'remove',
    ].forEach(method => {
      this[method] = this.rootModel[method].bind(this.rootModel);
    });
  }

  presetJSON() {
    Object.assign(this.headers, {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    this.prehandlers.push(request => ({
      body: request.body ? JSON.stringify(request.body) : null,
    }));
    this.posthandlers.push(res => res.status === 204 ? null : res.json());
    this.errhandlers.unshift(res => res.json().then(data => ({
      status: res.status,
      data,
    })));
  }

  setHeader(key, val) {
    if (val == null) {
      delete this.headers[key];
    } else {
      this.headers[key] = val;
    }
  }

  setHeaders(pairs) {
    for (let key in pairs) {
      this.setHeader(key, pairs[key]);
    }
  }

  toQueryString(params) {
    const qs = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
    return qs ? '?' + qs : '';
  }

  processHandlers(handlers, value, cb) {
    if (!cb) cb = (value, handler) => handler(value);
    return handlers.reduce(
      (promise, handler) => promise.then(value => cb(value, handler)),
      Promise.resolve(value)
    );
  }

  prepareRequest(options) {
    const {method, url, params, body, headers} = options;
    const request = {
      url,
      method,
      headers: Object.assign({}, this.headers, headers),
      body,
    };
    if (params) request.url += this.toQueryString(params);
    return this.processHandlers(
      this.prehandlers, request,
      (request, handler) => Object.assign({}, request, handler(request))
    );
  }

  _request(options) {
    return this.prepareRequest(options)
    .then(request => {
      const init = ['method', 'headers', 'body']
      .reduce((init, key) => {
        const val = request[key];
        if (val != null) init[key] = val;
        return init;
      }, {});
      return fetch(request.url, init)
    })
    .then(res => this.processHandlers(this.posthandlers, res))
    .catch(res => this.processHandlers(this.errhandlers, res));
  }
}
