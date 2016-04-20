export default class Model {
  constructor(restful, path) {
    this.restful = restful;
    this.path = path || '';
    this.prehandlers = [];
    this.posthandlers = [];
  }

  request(options) {
    return this.restful.processHandlers(
      this.prehandlers, options,
      (options, handler) => Object.assign({}, options, handler(options))
    ).then(options => {
      var url = options.url || '';
      // Skip absolute paths
      if (!/^[\w-]+:/.test(url)) {
        if (url && url[0] !== '/') url = '/' + url;
        options.url = this.path + url;
      }
      return this.restful._request(options)
    })
    .then(res => this.restful.processHandlers(this.posthandlers, res));
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

  model(path) {
    path = (path || '').replace(/\/$/, '');
    if (!path) {
      throw new Error('Invalid path: path cannot be empty!');
    }
    if (path[0] !== '/') path = '/' + path;
    return new Model(this.restful, this.path + path);
  }
}
