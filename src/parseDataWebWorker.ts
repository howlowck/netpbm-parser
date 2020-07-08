// onmessage = (evt: MessageEvent) => {
//   // string[], mag
//   const { dimension, max, rawData } = doc
//   const { width, height } = dimension
//   const size = (width * mag) * (height * mag) * 4
//   const array = rawData.split(/\s/ms)
//   return array.reduce((prev, curr, i, array) => {
//     if (i % 3 === 0) {
//       const r = 255 * (+array[i] / max)
//       const g = 255 * (+array[i + 1] / max)
//       const b = 255 * (+array[i + 2] / max)
//       const a = 255
//       if (isNaN(r) || isNaN(g) || isNaN(b)) {
//         return prev
//       }
//       const start = (i / 3) * 4
//       prev.set([r, g, b, a], start)
//       return prev
//     }
//     return prev
//   }, new Uint8ClampedArray(size))
// }
