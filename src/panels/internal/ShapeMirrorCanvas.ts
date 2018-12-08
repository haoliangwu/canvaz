import BaseCanvas, { BaseCanvasOptions } from "@panels/internal/BaseCanvas";
import { ShapePickerCanvasOptions } from "@panels/ShapePickerCanvas";

export default class ShapeMirrorCanvas extends BaseCanvas {
  constructor(canvas: HTMLCanvasElement, options: BaseCanvasOptions) {
    super(canvas, options)

    this.canvas.style.position = 'fixed'
    this.canvas.style.background = 'transparent'

    this.hide()
  }

  show(relativePoint: Point) {
    this.canvas.style.left = `${relativePoint.x}px`
    this.canvas.style.top = `${relativePoint.y}px`
    this.canvas.style.opacity = '0.6'
    this.canvas.style.display = 'initial'
    this.draw()
  }

  hide() {
    this.canvas.style.display = 'none'
    this.canvas.style.transform = `translate(0, 0)`
  }

  move(relativePoint: Point) {
    this.canvas.style.transform = `translate(${relativePoint.x}px, ${relativePoint.y}px)`
  }
}