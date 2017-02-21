var path = require('path');

var resolve = require('../../index.js');

var fromFile = ('./test/specs/resolve.spec.js');
var absOne = path.resolve(__dirname + '/../fixture/index.js');
var absTwo = path.resolve(__dirname + '/../fixture/two.js');
var absMain = path.resolve(__dirname + '/../fixture/main/lib/main.js');

describe('resolve', function () {

    describe('loadLocal', function (expect) {

        describe('by index', function (expect) {
            var loc = {
                contents: "\nmodule.exports = { name: 'ONE' };\n",
                path: absOne
            };
            expect(resolve(absOne), fromFile).toBe(loc);
            expect(resolve('../fixture/index.js', fromFile)).toBe(loc);
            expect(resolve('../fixture/index', fromFile)).toBe(loc);
            expect(resolve('../fixture', fromFile)).toBe(loc);
        });

        describe('by package.json', function (expect) {
            expect(resolve('fixture/main', fromFile, ['./test'])).toBe({
                contents: "\nmodule.exports = { name: 'MAIN' };\n",
                path: absMain
            });
        });

    });

    describe('loadFromNodeModules', function (expect) {
        var featherTest = resolve('feather-test', fromFile);
        expect(featherTest.contents.indexOf('module.exports') !== -1).toBe(true);
        expect(featherTest.path).toBe(path.resolve(__dirname + '/../../node_modules/feather-test/index.js'));
    });

    describe('loadFromPaths', function (expect) {
        expect(resolve('./two.js', fromFile, ['./test', './test/fixture'])).toBe({
            contents: "\nmodule.exports = { name: 'TWO' };\n",
            path: absTwo
        });
    });

});
