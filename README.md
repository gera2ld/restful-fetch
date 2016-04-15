restful-fetch
===

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
