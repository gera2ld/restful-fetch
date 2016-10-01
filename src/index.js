import fetch from 'isomorphic-fetch';
import Model from './model';

export default function Restful(options) {
  if (!(this instanceof Restful)) return new Restful(options);
  options = options || {};
  this.root = options.root || '';
  this.config = Object.assign({}, options.config);
  this.headers = Object.assign({}, options.headers);
  this.prehandlers = [];
  this.posthandlers = [res => {
    if (res.status > 300) throw res;
    return res;
  }];
  this.errhandlers = [
    res => {throw res;},
  ];
  (options.presets || []).forEach(name => {
    const preset = this['preset' + name.toUpperCase()];
    preset && preset.call(this);
  });
  this.rootModel = new Model(this, '');
  [
    'model',
    'request',
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'remove',
  ].forEach(method => {
    this[method] = this.rootModel[method].bind(this.rootModel);
  });
}

Object.assign(Restful.prototype, {
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
  },

  setHeader(key, val) {
    if (val == null) {
      delete this.headers[key];
    } else {
      this.headers[key] = val;
    }
  },

  setHeaders(pairs) {
    for (let key in pairs) {
      this.setHeader(key, pairs[key]);
    }
  },

  toQueryString(params) {
    const qs = Object.keys(params)
    .map(key => {
      let val = params[key];
      if (val == null) val = '';
      return `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
    })
    .join('&');
    return qs ? '?' + qs : '';
  },

  _processHandlers(handlers, value, cb) {
    if (typeof cb !== 'function') {
      const extra = cb;
      cb = (value, handler) => handler(value, extra);
    }
    return handlers.reduce(
      (promise, handler) => promise.then(value => cb(value, handler)),
      Promise.resolve(value)
    );
  },

  _prepareRequest(options, overrides) {
    const {method, url, params, body, headers} = options;
    const request = {
      url,
      method,
      params,
      body,
      headers: Object.assign({}, this.headers, headers),
    };
    return this._processHandlers(
      overrides && overrides.prehandlers || this.prehandlers, request,
      (request, handler) => Object.assign({}, request, handler(request))
    );
  },

  _fetch(request) {
    const init = ['method', 'headers', 'body']
    .reduce((init, key) => {
      const val = request[key];
      if (val != null) init[key] = val;
      return init;
    }, Object.assign({}, this.config));
    const url = request.url + (request.params ? this.toQueryString(request.params) : '');
    return fetch(url, init);
  },

  _request(options, overrides) {
    return this._prepareRequest(options, overrides)
    .then(request => (
      this._fetch(request)
      .then(res => this._processHandlers(overrides && overrides.posthandlers || this.posthandlers, res, request))
    ))
    .catch(res => this._processHandlers(overrides && overrides.errhandlers || this.errhandlers, res));
  },
});
