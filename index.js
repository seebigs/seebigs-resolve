/**
 * Resolve file paths to actual module contents
 * Follows Node spec: https://nodejs.org/api/modules.html
 */

var browserResolve = require('browser-resolve').sync;
var fs = require('fs');
var path = require('path');
var requireResolve = require('require-resolve');

function handleOtherErrors (err, str) {
    if (err && err.code !== 'ENOENT') {
        console.log('Error resolving ' + str);
        throw err;
    }
}

function mainForBrowser (packageJSON, str) {
    var b = packageJSON.browser;
    if (typeof b === 'string') {
        return b;
    } else if (typeof b === 'object') {
        var bSpecific = b[str];
        return bSpecific ? bSpecific : (bSpecific === false ? {} : packageJSON.main);
    }
    return packageJSON.main;
}

function loadLocal (str, _isBrowser) {
    var contents;
    var p = str;

    try {
        contents = fs.readFileSync(str, 'utf8');

    } catch (noFile) {
        try {
            var packageJSON = JSON.parse(fs.readFileSync(str + '/package.json', 'utf8'));
            var pathToMain = path.resolve(str, _isBrowser ? mainForBrowser(packageJSON, str) : packageJSON.main);
            contents = fs.readFileSync(pathToMain, 'utf8');
            p = pathToMain;

        } catch (noPackageJson) {
            try {
                contents = fs.readFileSync(str + '.js', 'utf8');
                p = str + '.js';

            } catch (noJS) {
                try {
                    contents = fs.readFileSync(str + '/index.js', 'utf8');
                    p = str + '/index.js';

                } catch (noIndex) {
                    handleOtherErrors(noIndex, str);
                }
            }
        }
    }

    if (typeof contents !== 'undefined') {
        return {
            contents: contents,
            path: path.resolve(p),
        };
    }

    return {};
}

function loadFromNodeModules (str, fromFile, _isBrowser) {
    var i, len, modPath;
    var mod = {};

    // check node_modules
    try {
        if (_isBrowser) {
            if (fs.statSync(fromFile).isDirectory()) {
                fromFile += '/file.file';
            }
            modPath = browserResolve(str, { filename: fromFile });
        } else {
            modPath = requireResolve(str, fromFile).src;
        }
    } catch (err) {
        // do nothing
    }

    try {
        mod = {
            contents: fs.readFileSync(modPath, 'utf8'),
            path: modPath
        };
    } catch (err) {
        // do nothing
    }

    return mod || {};
}

function loadFromPaths (str, filepath, paths, dir, _isBrowser) {
    paths = paths || [];

    var mod;
    var absPaths = {};
    absPaths[dir] = 1;

    paths.forEach(function (root) {
        if (path.isAbsolute(root)) {
            absPaths[root] = 1;
        } else {
            absPaths[path.resolve(process.cwd(), root)] = 1;
        }
    });

    absPaths = Object.keys(absPaths);

    // check provided paths
    for (var i = 0, len = absPaths.length; i < len; i++) {
        mod = loadLocal(path.resolve(absPaths[i], str), _isBrowser);
        if (mod.path) {
            break;
        }
    }

    return mod;
}


function resolve (str, fromFile, paths, _isBrowser) {
    fromFile = fromFile || '.';
    var dir = path.dirname(fromFile);
    var mod = {};
    fromFile = path.resolve(fromFile);

    /* resolve node_modules */
    mod = loadFromNodeModules(str, fromFile, _isBrowser);
    if (mod.path) {
        return mod;
    }

    /* resolve from paths */
    mod = loadFromPaths(str, path.resolve(fromFile), paths, dir, _isBrowser);


    return mod.path ? mod : {};
}

resolve.browser = function (str, fromFile, paths) {
    return resolve.call(this, str, fromFile, paths, true);
};

module.exports = resolve;
