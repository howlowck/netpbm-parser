import { calcStarts, calcProjectedStart } from './main'

test('calc starts when mag is 2', () => {
  expect(calcStarts(24, 2, 56)).toStrictEqual([56, 60, 80, 84])
})

test('calc projected start when mag is 2', () => {
  expect(calcProjectedStart(9, 2, 12)).toBe(56)
})
