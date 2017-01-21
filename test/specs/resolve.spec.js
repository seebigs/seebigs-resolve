var path = require('path');

var resolve = require('../../index.js');

var fromFile = ('./test/specs/resolve.spec.js');
var absOne = path.resolve(__dirname + '/../fixture/index.js');

describe('resolve', function () {

    describe('loadLocal', function (expect) {
        var loc = {
            contents: "\nmodule.exports = { name: 'ONE' };\n",
            path: absOne
        };
        expect(resolve(absOne), fromFile).toBe(loc);
        expect(resolve('../fixture/index.js', fromFile)).toBe(loc);
        expect(resolve('../fixture/index', fromFile)).toBe(loc);
        expect(resolve('../fixture', fromFile)).toBe(loc);
    });

    describe('loadModule', function (expect) {
        var featherTest = resolve('feather-test', fromFile);
        expect(featherTest.contents.indexOf('module.exports') !== -1).toBe(true);
        expect(featherTest.path).toBe(path.resolve(__dirname + '/../../node_modules/feather-test/index.js'));
    });

});
