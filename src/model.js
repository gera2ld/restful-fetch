const RE_SLASHES = /^\/|\/$/g;
const RE_ABSURL = /^[\w-]+:/;

export default class Model {
  constructor(restful, path) {
    this.restful = restful;
    this.prehandlers = [];
    this.posthandlers = [];
    this.overrides = {};
    this.parameters = null;
    this._setPath(path);
  }

  _setPath(path) {
    if (path) {
      path = path.replace(RE_SLASHES, '')
      .split('/')
      .filter(c => c)
      .map(comp => {
        if (!comp) {
          throw new Error('Invalid path!');
        }
        if (comp[0] === ':') {
          this._addParam(comp.slice(1));
        }
        return comp;
      })
      .join('/');
      if (path) path = '/' + path;
    }
    this.path = path || '';
  }

  _addParam(name) {
    const parameters = this.parameters = this.parameters || {};
    if (parameters[name]) {
      throw new Error(`Invalid path: parameter "${name}" already exists!`)
    }
    parameters[name] = true;
  }

  request(options) {
    if (this.parameters) {
      throw new Error('Abstract model cannot be requested!');
    }
    return this.restful._processHandlers(
      this.prehandlers, options,
      (options, handler) => Object.assign({}, options, handler(options))
    ).then(options => {
      var url = options.url || '';
      if (!RE_ABSURL.test(url)) {
        if (url && url[0] !== '/') url = '/' + url;
        url = this.restful.root + this.path + url;
      }
      options.url = url;
      return this.restful._request(options, this.overrides);
    })
    .then(res => this.restful._processHandlers(this.posthandlers, res));
  }

  get(url, params) {
    return this.request({
      method: 'GET',
      url, params,
    });
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

  model(...comp) {
    var path = comp.filter(comp => comp).join('/');
    if (path) path = '/' + path;
    return new Model(this.restful, this.path + path);
  }

  fill(data) {
    const path = this.path.replace(/\/:([^/]*)/g, (match, key) => {
      const value = data[key];
      return value ? '/' + value : match;
    });
    const model = new Model(this.restful, path);
    model.prehandlers = this.prehandlers;
    model.posthandlers = this.posthandlers;
    return model;
  }
}
