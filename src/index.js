import fetch from 'isomorphic-fetch';

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
      url: url[0] === '/' ? this.root + url : url,
      method,
      headers: Object.assign({}, this.headers, headers),
      body,
    };
    if (params) request.url += this.toQueryString(params);
    return this.prehandlers.reduce((request, handler) => {
      return Object.assign({}, request, handler(request));
    }, request);
  }

  request(options) {
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

  get(url, params) {
    return this.request({url, params});
  }

  post(url, body, params) {
    return this.request({
      method: 'POST',
      url, params, body,
    });
  }

  put(url, body, params) {
    return this.request({
      method: 'PUT',
      url, params, body,
    });
  }

  remove(url, params) {
    return this.request({
      method: 'DELETE',
      url, params,
    });
  }
}
