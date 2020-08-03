export enum ImageType {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3'
}

interface Doc {
  type: ImageType
  dimension: {
    width: number
    height: number
  }
  max: number
  rawData: string
  parsedData: number[]
}

type DocHeader = Pick<Doc, 'type'|'dimension'>

interface Result extends Doc {
  rgba: Uint8ClampedArray
}

const matchType = (typeStr: string): ImageType => {
  if (typeStr === 'P1') {
    return ImageType.P1
  }
  if (typeStr === 'P2') {
    return ImageType.P2
  }
  if (typeStr === 'P3') {
    return ImageType.P3
  }

  throw new Error(`The type string "${typeStr}" is not any of the supported values: "P1", "P2", or "P3".`)
}

export const getHeader = (inputString: string): DocHeader => {
  const docMatches = inputString.match(/(\w+\s+\w+\s+\w+)\s+(.*)/ms)
  if (docMatches === null) {
    throw new Error('the content is not formatted correct.')
  }
  const [, header] = docMatches
  const headerPartsMatches = header.match(/(\w+)\s+(\w+)\s+(\w+)/ms)
  if (headerPartsMatches === null) {
    throw new Error('the header is not formatted correct.')
  }
  const [, typeStr, widthStr, heightStr] = headerPartsMatches
  return {
    type: matchType(typeStr),
    dimension: {
      width: +widthStr,
      height: +heightStr
    }
  }
}

export const parseImage = (inputString: string, imgHeader: DocHeader): Doc => {
  const { type, dimension: { width, height } } = imgHeader
  let docMatches: RegExpMatchArray | null
  if (type === ImageType.P2 || type === ImageType.P3) {
    docMatches = inputString.match(/(\w+\s+\w+\s+\w+\s+\w+)\s+(.*)/ms)
  } else {
    docMatches = inputString.match(/(\w+\s+\w+\s+\w+)\s+(.*)/ms)
  }
  if (docMatches === null) {
    throw new Error('the content is not formatted correct.')
  }
  const [, header, rawData] = docMatches

  let max: number
  if (type === ImageType.P2 || type === ImageType.P3) {
    const headerPartsMatches = header.match(/(\w+)\s+(\w+)\s+(\w+)\s+(\w+)/ms)
    if (headerPartsMatches === null) {
      throw new Error('the header is not formatted correctly.')
    }
    const [,,,, maxStr] = headerPartsMatches
    max = +maxStr
  } else {
    max = 1
  }

  let parsedData: number[]

  if (type === ImageType.P2 || type === ImageType.P3) {
    parsedData = rawData.split(/\s/ms).reduce((prev: number[], curr: string) => {
      if (curr.length === 0 || Array.isArray(curr.match(/^\s+$/ms))) {
        return prev
      }
      const value = +curr
      if (isNaN(value)) {
        return prev
      }
      prev.push(value)
      return prev
    }, [])
  } else {
    parsedData = rawData.split('').reduce((prev: number[], curr: string) => {
      if (curr.length === 0 || Array.isArray(curr.match(/^\s+$/ms))) {
        return prev
      }
      const value = +curr
      if (isNaN(value)) {
        return prev
      }
      prev.push(value)
      return prev
    }, [])
  }

  return {
    type,
    dimension: {
      width,
      height
    },
    max,
    rawData,
    parsedData
  }
}

export const calcStarts = (perRow: number, mag: number, projectedStart: number): number[] => {
  const result = []
  for (let row = 0; row < mag; row++) {
    for (let col = 0; col < mag; col++) {
      result.push(projectedStart + row * perRow + col * 4)
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

export const calcSingleWidthStart = (unitDocWidth: number, mag: number, i: number): number => {
  const row = Math.floor(i / unitDocWidth) * mag
  const col = (i % unitDocWidth) * mag
  const perRow = unitDocWidth * 4 * mag
  return row * perRow + col * 4
}

const parseData = (doc: Doc, mag: number): Uint8ClampedArray => {
  const { type, dimension, max, parsedData } = doc
  const { width, height } = dimension
  const size = (width * mag) * (height * mag) * 4

  if (type === ImageType.P1 || type === ImageType.P2) {
    return parsedData.reduce((prev, curr, i) => {
      const r = 255 * (curr / max)
      const g = r
      const b = r
      const a = 255
      const projectedStart = calcSingleWidthStart(width, mag, i)
      const projected = calcStarts(width * mag * 4, mag, projectedStart)
      projected.forEach((projectedStart) => {
        prev.set([r, g, b, a], projectedStart)
      })
      return prev
    }, new Uint8ClampedArray(size))
  }

  return parsedData.reduce((prev, curr, i, array) => {
    if (i % 3 === 0) {
      const r = 255 * (array[i] / max)
      const g = 255 * (array[i + 1] / max)
      const b = 255 * (array[i + 2] / max)
      const a = 255
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
    parsedData: doc.parsedData,
    rgba
  }
}

export const stripComments = (inputStr: string): string => {
  return inputStr.replace(/#.+$\s/gm, '')
}

export const parse = (inputStr: string, mag: number): Result => {
  const cleanStr = stripComments(inputStr)
  const header = getHeader(cleanStr)
  const doc = parseImage(cleanStr, header)
  console.log(doc)
  const rgba = parseData(doc, mag)
  return formatOutput(doc, rgba, mag)
}
