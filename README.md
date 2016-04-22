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
```

### Models
``` js
const restful = new Restful({presets: ['json']});

const myCar = restful.model('/cars/1');
myCar.get().then(data => console.log(data));

const mySeat = myCar.model('/seat/2');
mySeat.get().then(data => console.log(data));
```

### Interceptors
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
```

### Overrides
```js
const restful = new Restful({presets: ['json']});

const someText = restful.model('/sometext');
// override global posthandlers to avoid JSON parsing
someText.overrides.posthandlers = [];
someText.get().then(text => console.log(text));
```
