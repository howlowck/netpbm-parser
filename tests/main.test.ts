import { calcStarts, calcProjectedStart, stripComments, getHeader, ImageType, parseImage } from '../src/main'
import { readFileSync } from 'fs'

const fileList = [
  'condensed.pbm',
  'condensed.ppm',
  'simple.pbm',
  'simple.pgm',
  'simple.ppm'
]

test('calc starts when mag is 2', () => {
  expect(calcStarts(24, 2, 56)).toStrictEqual([56, 60, 80, 84])
})

test('calc projected start when mag is 2', () => {
  expect(calcProjectedStart(9, 2, 12)).toBe(56)
})

describe('strip comments', () => {
  fileList.forEach(filename => {
    test(`can strip comments from ${filename}`, () => {
      const content = readFileSync(`./tests/files/${filename}`, { encoding: 'utf-8' })
      const actual = stripComments(content)
      expect(actual).not.toContain(/#.+$/gm)
    })
  })
})

describe('get Correct Types', () => {
  const expectedValues: {[key: string]: ImageType} = {
    'condensed.pbm': ImageType.P1,
    'condensed.ppm': ImageType.P3,
    'simple.pbm': ImageType.P1,
    'simple.pgm': ImageType.P2,
    'simple.ppm': ImageType.P3
  }
  fileList.forEach(filename => {
    test(`can get correct type from ${filename}`, () => {
      const content = readFileSync(`./tests/files/${filename}`, { encoding: 'utf-8' })
      const header = getHeader(stripComments(content))
      expect(header.type).toBe(expectedValues[filename])
    })
  })
})

describe('get Correct Dimensions', () => {
  const expectedValues: {[key: string]: {width: number, height: number}} = {
    'condensed.pbm': { width: 6, height: 10 },
    'condensed.ppm': { width: 3, height: 2 },
    'simple.pbm': { width: 6, height: 10 },
    'simple.pgm': { width: 24, height: 7 },
    'simple.ppm': { width: 3, height: 2 }
  }
  fileList.forEach(filename => {
    test(`can get correct dimension from ${filename}`, () => {
      const content = readFileSync(`./tests/files/${filename}`, { encoding: 'utf-8' })
      const header = getHeader(stripComments(content))
      expect(header.dimension).toStrictEqual(expectedValues[filename])
    })
  })
})

describe('parses string to numbered array', () => {
  const expectedValue: {[key: string]: number[]} = {
    'condensed.pbm': [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    'condensed.ppm': [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0],
    'simple.pbm': [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    'simple.pgm': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 7, 7, 7, 7, 0, 0, 11, 11, 11, 11, 0, 0, 15, 15, 15, 15, 0, 0, 3, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 15, 0, 0, 15, 0, 0, 3, 3, 3, 0, 0, 0, 7, 7, 7, 0, 0, 0, 11, 11, 11, 0, 0, 0, 15, 15, 15, 15, 0, 0, 3, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 7, 7, 7, 7, 0, 0, 11, 11, 11, 11, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    'simple.ppm': [255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 0, 255, 255, 255, 0, 0, 0]
  }

  fileList.forEach(filename => {
    test(`can parse ${filename} to number array`, () => {
      const content = readFileSync(`./tests/files/${filename}`, { encoding: 'utf-8' })
      const cleanStr = stripComments(content)
      const header = getHeader(cleanStr)
      const doc = parseImage(cleanStr, header)
      expect(doc.parsedData).toStrictEqual(expectedValue[filename])
    })
  })
})
