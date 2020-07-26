"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("../src/main");
var fs_1 = require("fs");
var fileList = [
    'condensed.pbm',
    'condensed.ppm',
    'simple.pbm',
    'simple.pgm',
    'simple.ppm'
];
test('calc starts when mag is 2', function () {
    expect(main_1.calcStarts(24, 2, 56)).toStrictEqual([56, 60, 80, 84]);
});
test('calc projected start when mag is 2', function () {
    expect(main_1.calcProjectedStart(9, 2, 12)).toBe(56);
});
test('strip comments', function () {
    fileList.forEach(function (filename) {
        var content = fs_1.readFileSync("./tests/files/" + filename, { encoding: 'utf-8' });
        var actual = main_1.stripComments(content);
        expect(actual).not.toContain(/#.+$/gm);
    });
});
test('get Correct Types', function () {
    var expectedValues = {
        'condensed.pbm': main_1.ImageType.P1,
        'condensed.ppm': main_1.ImageType.P3,
        'simple.pbm': main_1.ImageType.P1,
        'simple.pgm': main_1.ImageType.P2,
        'simple.ppm': main_1.ImageType.P3
    };
    fileList.forEach(function (filename) {
        var content = fs_1.readFileSync("./tests/files/" + filename, { encoding: 'utf-8' });
        var header = main_1.getHeader(main_1.stripComments(content));
        expect(header.type).toBe(expectedValues[filename]);
    });
});
test('get Correct Dimensions', function () {
    var expectedValues = {
        'condensed.pbm': { width: 6, height: 10 },
        'condensed.ppm': { width: 3, height: 2 },
        'simple.pbm': { width: 6, height: 10 },
        'simple.pgm': { width: 24, height: 7 },
        'simple.ppm': { width: 3, height: 2 }
    };
    fileList.forEach(function (filename) {
        var content = fs_1.readFileSync("./tests/files/" + filename, { encoding: 'utf-8' });
        var header = main_1.getHeader(main_1.stripComments(content));
        expect(header.dimension).toStrictEqual(expectedValues[filename]);
    });
});
