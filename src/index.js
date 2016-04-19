import fetch from 'isomorphic-fetch';
import Model from './model';

export default class Restful {
  constructor(options) {
    options = options || {};
    this.root = options.root || '';
    this.headers = Object.assign({}, options.headers);
    this.prehandlers = [];
    this.posthandlers = [];
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

  prepareRequest(options) {
    const {method, url, params, body, headers} = options;
    const request = {
      url,
      method,
      headers: Object.assign({}, this.headers, headers),
      body,
    };
    if (params) request.url += this.toQueryString(params);
    return this.prehandlers.reduce((request, handler) => {
      return Object.assign({}, request, handler(request));
    }, request);
  }

  _request(options) {
    const request = this.prepareRequest(options);
    const init = ['method', 'headers', 'body']
    .reduce((init, key) => {
      const val = request[key];
      if (val != null) init[key] = val;
      return init;
    }, {});
    return fetch(request.url, init)
    .then(res => {
      return this.posthandlers.reduce((res, handler) => handler(res), res);
    }, res => {
      return this.errhandlers.reduce((res, handler) => handler(res), res);
    });
  }
}
