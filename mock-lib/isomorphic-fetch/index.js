function response(url, init) {
  const responseLine = `${init.method} ${url || '/'}`;
  return {
    status: 200,
    text: () => Promise.resolve(responseLine),
    json: () => Promise.resolve({
      responseLine,
      data: init.body && JSON.parse(init.body),
    }),
  };
}

function fetch(url, init) {
  init.method = init.method || 'GET';
  return Promise.resolve(response(url, init));
}

module.exports = fetch;
