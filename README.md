# restful-fetch

![NPM](https://img.shields.io/npm/v/restful-fetch.svg)
![License](https://img.shields.io/npm/l/restful-fetch.svg)
![Downloads](https://img.shields.io/npm/dt/restful-fetch.svg)

A Restful library based on [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch).

## Installation

``` sh
$ npm i restful-fetch
```

## Usage

``` js
import Restful from 'restful-fetch';

const restful = new Restful();
restful.get('/foo').then(res => res.json()).then(data => console.log(data));

// `json` preset is available
restful = new Restful({presets: ['json']});
restful.get('/foo').then(data => console.log(data));

// Use models
const foo = restful.model('foo');
foo.prehandlers.push(function (options) {
  return {
    headers: Object.assign(options.headers, {
      'X-My-Header': 'Intercepted!',
    }),
  };
});
foo.get().then(data => console.log(data));
```

## Documents

### Restful

The `Restful` object may have `prehandlers`, `posthandlers` and `errhandlers` properties,
which will be discussed later as **interceptors**.

Parameters:

* **options**: *(Optional) Object*

  * root: *(Optional) String*

    Base address for all requests, default as `''`.

  * headers: *(Optional) Object*

    Default request headers.

  * presets: *(Optional) Array*

    Array of presets to be loaded. Currently only `'json'` is supported.

  * config: *(Optional) Object*

    Extra config to be passed to [fetch](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch).

Methods:

The `Restful` objects is like a root model, so it has all the model methods excluding
`fill` which does not make sense.

``` js
const restful = new Restful(options);
// or
const restful = Restful(options);
```

### Model

A `Model` instance is an object derived from a `Restful` object or another model.
A model can have `prehandlers`, `posthandlers` and `overrides` properties.
Any requests initiated by a model will use the model's properties to handle its data.

* Parameters are URL components for the model.

  If a parameter starts with `:`, it will be remembered as a **placeholder** which
  have to be filled with real data before sending a request. This is designed to
  share handlers between different model instances.

Methods:

* model(...comp: *String*)

  Derive a submodel. The `comp`s will be concatinated as the submodel's relative path.

* fill(data: *Object*)

  Get a new `Model` with placeholders filled with `data`.
  `data` is an object with keys as the placeholder names and values to be filled with.

* post(url: *String*, data: *Any*, params: *(Optional) Object*)

  `POST` request.

* get(url: *String*, params: *(Optional) Object*)

  `GET` request.

* put(url: *String*, data: *Any*, params: *(Optional) Object*)

  `PUT` request.

* patch(url: *String*, data: *Any*, params: *(Optional) Object*)

  `PATCH` request.

* delete(url: *String*, params: *(Optional) Object*)

  `DELETE` request.

* remove

  alias to `delete` method.

``` js
const Cars = restful.model('cars');

const AbstractCar = restful.model('cars', ':id');
// or
const AbstractCar = Cars.model(':id');

AbstractCar.prehandlers.push(function () {
  console.log('Get a car!');
});

const car1 = AbstractCar.fill({id: 1});
const car2 = AbstractCar.fill({id: 2});

const seats = car1.model('seats');
seats.get().then(data => console.log(data));
```

### Interceptors

`Restful` and `Model` instances have a several handler properties, which contains
lists of handlers and work as interceptors.
Those on `Restful` instances are global interceptors and those on `Model` instances
are model specific interceptors.

* `prehandlers`

  Both `Restful` and `Model` have `prehandlers`. Those on `Model`s are called first.

* `posthandlers`

  Both `Restful` and `Model` have `posthandlers`. Those on `Restful`s are called first.

  Each posthandler is called with two parameters: `data` and `options`. `data` is the
  current data object and can be modified by returning a new one. `options` contains
  all information of the request, including `method`, `url` (full url), `relative`
  (url relative to current model).

* `errhandlers`

  Only `Restful` object has `errhandlers`.

* `overrides`

  Only `Model` object has `overrides`, which overrides properties on
  `Restful` object temporarily.

```js
const restful = new Restful();
const model = restful.model('/cars/1');

// Global interceptors will execute for all requests
restful.prehandlers.push(options => {
  return {
    params: Object.assign({}, options.params, {hello: 'world'}),
  };
});
restful.posthandlers.push(res => res.json());

// Model interceptors will execute only for the model itself
// Model prehandlers will execute BEFORE global prehandlers
model.prehandlers.push(options => {
  return {
    headers: {
      'X-From-Model': true,
    },
  };
});
// Model posthandlers will execute AFTER global posthandlers
model.posthandlers.push(data => {
  return data || 'empty';
});

model.overrides = {
  posthandlers: [],   // disable global posthandlers
};
```
