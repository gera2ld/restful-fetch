function response(url, init) {
  const responseLine = init.status === 204 ? '' : `${init.method} ${url || '/'}`;
  const data = init.body && JSON.parse(init.body);
  const status = data && data.status || 200;
  const headers = {
    'content-type': 'application/json',
  };
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get(key) {
        return headers[key.toLowerCase()];
      },
    },
    text: () => Promise.resolve(responseLine),
    json: () => Promise.resolve({
      responseLine,
      data,
      headers: init.headers,
    }),
  };
}

function fetch(url, init) {
  init.method = init.method || 'GET';
  return Promise.resolve(response(url, init));
}

module.exports = fetch;
