/**
 * @desc Merge two objects into a new object, with `deepKeys` merged
 * recursively.
 */
export function merge(obj1, obj2, deepKeys=[]) {
  return deepKeys.reduce((res, key) => {
    res[key] = Object.assign({}, obj1 && obj1[key], obj2 && obj2[key]);
    return res;
  }, Object.assign({}, obj1, obj2));
}

/**
 * @desc Transform an object to a query string, with prefixed `?`.
 * Similar to `jQuery.param`. There should not be `[]` in keys.
 *
 * e.g.
 * - {} => ''
 * - {a: 'b', c: 'd'} => '?a=b&c=d'
 * - {a: {b: 'c'}, d: 'e', f: [1, 2, 3]} => '?a[b]=c&d=e&f[]=1&f[]=2&f[]=3'
 */
export function toQueryString(params) {
  function addPair(key, val) {
    if (val && typeof val === 'object') {
      encode(val, key);
    } else if (val != null) {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
    }
  }
  function encode(obj, prefix) {
    if (Array.isArray(obj)) {
      const fullKey = `${prefix}[]`;
      obj.forEach(val => addPair(fullKey, val));
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        const val = obj[key];
        const fullKey = prefix ? `${prefix}[${key}]` : key;
        addPair(fullKey, val);
      });
    }
  }
  const pairs = [];
  encode(params);
  const qs = pairs.join('&');
  return qs ? '?' + qs : '';
}

/**
 * @desc Execute handlers in sequence.
 *
 * @param handlers
 *   A list of handlers.
 * @param value
 *   Initial value to be processed.
 * @param cb
 *   An optional callback to decide how to run the handler, or just a value as
 *   the `extra data` to be passed to handler.
 *
 * By default the handler will receive two arguments:
 *   - current value
 *   - (optional) extra data
 */
export function processHandlers(handlers, value, cb) {
  if (typeof cb !== 'function') {
    const extra = cb;
    cb = (value, handler) => handler(value, extra);
  }
  return handlers.reduce(
    (promise, handler) => promise.then(value => cb(value, handler)),
    Promise.resolve(value)
  );
}
