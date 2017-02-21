# seebigs-resolve

Resolve a target string to a single filepath and get the contents of the file at that location

*Follows Node spec: [https://nodejs.org/api/modules.html](https://nodejs.org/api/modules.html)*

## Install

```
$ npm install seebigs-resolve
```

## Resolve

```js
var resolve = require('seebigs-resolve');
var fromFile = __filename;

resolve('/abs/module.js', fromFile);
resolve('../rel/module.js', fromFile);
resolve('npm_module', fromFile);

// returns { contents: '...', path: '/path/to/module.js' }
```

## Paths

Modules can also be resolved from an optional array of paths

```js
var resolve = require('seebigs-resolve');
var fromFile = __filename;
var paths = [
    '../one'
];

resolve('module.js', fromFile, paths);
```
