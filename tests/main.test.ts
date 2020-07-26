import { calcStarts, calcProjectedStart, stripComments, getHeader, ImageType } from '../src/main'
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

test('strip comments', () => {
  fileList.forEach(filename => {
    const content = readFileSync(`./tests/files/${filename}`, { encoding: 'utf-8' })
    const actual = stripComments(content)
    expect(actual).not.toContain(/#.+$/gm)
  })
})

test('get Correct Types', () => {
  const expectedValues: {[key: string]: ImageType} = {
    'condensed.pbm': ImageType.P1,
    'condensed.ppm': ImageType.P3,
    'simple.pbm': ImageType.P1,
    'simple.pgm': ImageType.P2,
    'simple.ppm': ImageType.P3
  }
  fileList.forEach(filename => {
    const content = readFileSync(`./tests/files/${filename}`, { encoding: 'utf-8' })
    const header = getHeader(stripComments(content))
    expect(header.type).toBe(expectedValues[filename])
  })
})

test('get Correct Dimensions', () => {
  const expectedValues: {[key: string]: {width: number, height: number}} = {
    'condensed.pbm': { width: 6, height: 10 },
    'condensed.ppm': { width: 3, height: 2 },
    'simple.pbm': { width: 6, height: 10 },
    'simple.pgm': { width: 24, height: 7 },
    'simple.ppm': { width: 3, height: 2 }
  }
  fileList.forEach(filename => {
    const content = readFileSync(`./tests/files/${filename}`, { encoding: 'utf-8' })
    const header = getHeader(stripComments(content))
    expect(header.dimension).toStrictEqual(expectedValues[filename])
  })
})
