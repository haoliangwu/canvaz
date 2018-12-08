import { ShapePickerCanvasOptions } from "@panels/ShapePickerCanvas";
import BaseCanvas from "@panels/BaseCanvas";

export default class ShadowCanvas {
  parent: BaseCanvas
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  width = 0
  height = 0

  constructor(canvaz: BaseCanvas) {
    this.parent = canvaz
    this.canvas = canvaz.canvas.cloneNode() as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D

    this.width = this.canvas.width
    this.height = this.canvas.height

    this.init()
  }

  private init() {
    this.canvas.style.position = 'fixed'
    this.canvas.style.background = 'transparent'

    if (this.canvas.id) this.canvas.id = `shadow_${this.canvas.id}`
    this.canvas.classList.add('shadow_canvas')

    this.canvas.style.left = `${this.parent.originPoint.x}px`
    this.canvas.style.top = `${this.parent.originPoint.y}px`

    this.toggle(false)

    document.body.appendChild(this.canvas)
  }

  toggle(on: boolean) {
    if (on) {
      this.canvas.style.display = 'initial'
    } else {
      this.canvas.style.display = 'none'
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
}