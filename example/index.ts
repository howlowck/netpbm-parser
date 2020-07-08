import { parse } from '../src/main'

const fileEl = document.querySelector('#file') as HTMLInputElement
const canvasEl = document.querySelector('#image') as HTMLCanvasElement
const magEl = document.querySelector('#mag-input') as HTMLInputElement
const magDisplayEl = document.querySelector('#mag-value') as HTMLSpanElement

let magValue: number = +magEl.value

magEl.addEventListener('change', (evt) => {
  const value = (evt.target as HTMLInputElement).value
  const numValue = +value
  if (isNaN(numValue)) {
    throw Error('not a number')
  }
  magValue = numValue
  magDisplayEl.innerHTML = magValue.toString()
})

fileEl.addEventListener('change', (evt) => {
  const fileList = (evt.target as HTMLInputElement).files as FileList
  const reader = new FileReader()
  reader.onload = (evt) => {
    const ctx = canvasEl.getContext('2d')
    const { dimension, rgba } = parse(evt.target?.result as string, magValue)
    const { width, height } = dimension
    canvasEl.width = width
    canvasEl.height = height
    console.log(width, height, rgba)
    const data: ImageData = new ImageData(rgba, width, height)
    ctx?.putImageData(data, 0, 0)
  }

  reader.readAsText(fileList[0])
})
