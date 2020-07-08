interface Doc {
  type: string
  dimension: {
    width: number
    height: number
  }
  max: number
  rawData: string
}

interface Result extends Doc {
  rgba: Uint8ClampedArray
}

const parseToParts = (inputString: string): Doc => {
  const docMatches = inputString.match(/(\w+\s+\w+\s+\w+\s+\w+)\s+(.*)/ms)
  if (docMatches === null) {
    throw Error('the content is not formatted correct.')
  }
  const [, header, rawData] = docMatches
  const headerPartsMatches = header.match(/(\w+)\s+(\w+)\s+(\w+)\s+(\w+)/ms)
  if (headerPartsMatches === null) {
    throw Error('the header is not formatted correct.')
  }
  const [, typeStr, widthStr, heightStr, maxStr] = headerPartsMatches
  const type = typeStr
  const width = +widthStr
  const height = +heightStr
  const max = +maxStr

  return {
    type,
    dimension: {
      width,
      height
    },
    max,
    rawData
  }
}

export const calcStarts = (perRow: number, mag: number, projectedStart: number): number[] => {
  const result = []
  for (let row = 0; row < mag; row++) {
    for (let col = 0; col < mag; col++) {
      result.push(projectedStart + row * perRow + col * 4) // 3 + 0, 3 + 1
    }
  }
  return result
}

export const calcProjectedStart = (unitDocWidth: number, mag: number, i: number): number => {
  const row = Math.floor(i / unitDocWidth) * mag
  const col = (i % unitDocWidth) / 3 * mag
  const perRow = unitDocWidth / 3 * 4 * mag
  return row * perRow + col * 4
}

const parseData = (doc: Doc, mag: number): Uint8ClampedArray => {
  const { dimension, max, rawData } = doc
  const { width, height } = dimension
  const size = (width * mag) * (height * mag) * 4
  const array = rawData.split(/\s/ms).filter(_ => _ !== '' && _ !== ' ')
  return array.reduce((prev, curr, i, array) => {
    if (i % 3 === 0) {
      const r = 255 * (+array[i] / max)
      const g = 255 * (+array[i + 1] / max)
      const b = 255 * (+array[i + 2] / max)
      const a = 255
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return prev
      }
      const projectedStart = calcProjectedStart(width * 3, mag, i)
      const projected = calcStarts(width * mag * 4, mag, projectedStart)
      projected.forEach((projectedStart) => {
        prev.set([r, g, b, a], projectedStart)
      })
      return prev
    }
    return prev
  }, new Uint8ClampedArray(size))
}

const formatOutput = (doc: Doc, rgba: Uint8ClampedArray, mag: number): Result => {
  return {
    dimension: {
      height: doc.dimension.height * mag,
      width: doc.dimension.width * mag
    },
    rawData: doc.rawData,
    max: doc.max,
    type: doc.type,
    rgba
  }
}

export const parse = (inputStr: string, mag: number): Result => {
  const doc = parseToParts(inputStr)
  const rgba = parseData(doc, mag)
  return formatOutput(doc, rgba, mag)
}
