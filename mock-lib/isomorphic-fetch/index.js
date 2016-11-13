function response(url, init) {
  const responseLine = `${init.method} ${url || '/'}`;
  const data = init.body && JSON.parse(init.body);
  const status = data && data.status || 200;
  return {
    status,
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
