var path = require('path');

var resolve = require('../../index.js');

var fromFile = ('./test/specs/resolve.spec.js');

describe('resolve', function () {

    describe('loadLocal', function (expect) {

        describe('by index', function (expect) {
            var absPath = path.resolve(__dirname + '/../fixture/index.js');
            var loc = {
                contents: "\nmodule.exports = { name: 'ONE' };\n",
                path: absPath,
            };
            expect(resolve(absPath), fromFile).toBe(loc);
            expect(resolve('../fixture/index.js', fromFile)).toBe(loc);
            expect(resolve('../fixture/index', fromFile)).toBe(loc);
            expect(resolve('../fixture', fromFile)).toBe(loc);
        });

        describe('by the main field package.json', function (expect) {
            expect(resolve('fixture/main', fromFile, ['./test'])).toBe({
                contents: "\nmodule.exports = { name: 'MAIN' };\n",
                path: path.resolve(__dirname + '/../fixture/main/lib/main.js'),
            });
        });

        describe('by the browser field in package.json', function (expect) {
            expect(resolve.browser('fixture/alternate', fromFile, ['./test'])).toBe({
                contents: "\nmodule.exports = { name: 'BROWSER_LOCAL' };\n",
                path: path.resolve(__dirname + '/../fixture/alternate/browser.js'),
            });
        });

        describe('handles empty files', function (expect) {
            expect(resolve('../fixture/empty.js', fromFile)).toBe({
                contents: '',
                path: path.resolve(__dirname + '/../fixture/empty.js'),
            });
        });

    });

    describe('loadFromNodeModules', function () {

        describe('gives priority to node_modules over local files', function (expect) {
            var featherTest = resolve('feather-test', fromFile);
            expect(featherTest.contents.indexOf('module.exports') !== -1).toBe(true);
            expect(featherTest.path).toBe(path.resolve(__dirname + '/../../node_modules/feather-test/index.js'));
        });

        var dummy = resolve.browser('dummy', fromFile);
        if (dummy.contents) {

            describe('respects the browser field in package.json', function (expect) {
                expect(dummy.contents.indexOf('BROWSER') !== -1).toBe(true);
                expect(dummy.path).toBe(path.resolve(__dirname + '/../../node_modules/dummy/browser.js'));
            });

            describe('handles empty files', function (expect) {
                expect(resolve('dummy/empty.js', fromFile)).toBe({
                    contents: '',
                    path: path.resolve(__dirname + '/../../node_modules/dummy/empty.js'),
                });
            });

        } else {
            throw new Error('Oops! Looks like you\'ve removed the "dummy" package from /node_modules. It\'s required for these tests. Go check that out again from the repo.');
        }

    });

    describe('loadFromPaths', function (expect) {
        expect(resolve('./two.js', fromFile, ['./test', './test/fixture'])).toBe({
            contents: "\nmodule.exports = { name: 'TWO' };\n",
            path: path.resolve(__dirname + '/../fixture/two.js'),
        });
    });

});
