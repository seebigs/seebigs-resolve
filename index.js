/**
 * Resolve file paths to actual module contents
 * Follows Node spec: https://nodejs.org/api/modules.html
 */

var fs = require('fs');
var path = require('path');
var requireResolve = require('require-resolve');

function handleOtherErrors (err, str) {
    if (err && err.code !== 'ENOENT') {
        console.log('Error resolving ' + str);
        throw err;
    }
}

function loadLocal (str) {
    var contents;
    var p = str;

    try {
        contents = fs.readFileSync(str, 'utf8');

    } catch (noFile) {
        try {
            var packageJSON = JSON.parse(fs.readFileSync(str + '/package.json', 'utf8'));
            var pathToMain = path.resolve(str, packageJSON.main);
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

    return {
        contents: contents,
        path: path.resolve(p)
    };
}

function loadFromNodeModules (str, fromFile) {
    var i, len;

    // check node_modules
    var mod = requireResolve(str, fromFile) || {};
    try {
        mod = {
            contents: fs.readFileSync(mod.src, 'utf8'),
            path: mod.src
        };
    } catch (err) {
        // do nothing
    }

    return mod || {};
}

function loadFromPaths (str, filepath, paths, dir) {
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
        mod = loadLocal(path.resolve(absPaths[i], str));
        if (mod.contents) {
            break;
        }
    }

    return mod;
}


function resolve (str, fromFile, paths) {
    fromFile = fromFile || '.';
    var dir = path.dirname(fromFile);
    var m = {};
    fromFile = path.resolve(fromFile);


    /* resolve local */

    if (/^\./.test(str)) {
        m = loadLocal(path.join(dir, str));
    } else if (path.isAbsolute(str)) {
        m = loadLocal(str);
    }

    if (m.contents) {
        return m;
    }


    /* resolve node_modules */

    m = loadFromNodeModules(str, fromFile);

    if (m.contents) {
        return m;
    }


    /* resolve from paths */

    m = loadFromPaths(str, path.resolve(fromFile), paths, dir);


    return m || {};
}

module.exports = resolve;
