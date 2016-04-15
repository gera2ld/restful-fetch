restful-fetch
===
![NPM](https://img.shields.io/npm/v/restful-fetch.svg)
![License](https://img.shields.io/npm/l/restful-fetch.svg)
![Downloads](https://img.shields.io/npm/dt/restful-fetch.svg)

A Restful library based on [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch).

Installation
---
``` sh
$ npm i restful-fetch
```

Usage
---
``` js
import Restful from 'restful-fetch';

restful = new Restful();
restful.get('/foo').then(res => res.json()).then(data => console.log(data));

// `json` preset is also available
restful = new Restful({presets: ['json']});
restful.get('/foo').then(data => console.log(data));
```
