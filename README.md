# NetPbm Parser

A parser of PBM, PGM, and PPM images

## Features
* Zero Dependency
* Supports P1, P2 and P3
* Supports magnification

## How to Use
```js
import { parse } from 'netpbm-parser'

// content is the content of your ASCII-based image
// mag is the magnification of the output data in Uint8ClampedArray

const doc: Result = parse(content, mag) // mag defaults to 1

// interface Result {
//   type: ImageType;
//   dimension: {
//     width: number;
//     height: number;
//   };
//   max: number;
//   rawData: string;
//   rgba: Uint8ClampedArray
// }
```