import Shape from "./shapes/Shape";
import { Point } from "./typings";

export interface DraggableCanvasOptions {}

export default class DraggableCanvas {
  private ctx: CanvasRenderingContext2D
  private startPoint: Point = { x: 0, y: 0 }
  private width = 0
  private height = 0

  private shapes: Shape[] = []

  private dragStartPoint?: Point
  private dragShape?: Shape

  constructor(canvas: HTMLCanvasElement, options?: DraggableCanvasOptions) {
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    this.init(canvas)
    this.width = canvas.width
    this.height = canvas.height

    // if (options) {}
  }

  private init(canvas: HTMLCanvasElement) {
    const { top, left } = canvas.getBoundingClientRect()
    this.startPoint = {
      x: left + window.pageXOffset,
      y: top + window.pageYOffset,
    }
  }

  register(shape: Shape) {
    this.shapes.push(shape)
  }

  unregister(shape: Shape) {
    const idx = this.shapes.indexOf(shape)
    if (idx > -1) {
      this.shapes.splice(idx, 1)
    }
  }

  draw() {
    this.shapes.forEach(shape => {
      shape.draw(this.ctx)
    })
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  selectShape(mousePoint: Point): Shape | undefined {
    const relativePoint: Point = {
      x: mousePoint.x - this.startPoint.x,
      y: mousePoint.y - this.startPoint.y
    }

    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i]
      if (shape.isSelected(relativePoint)) return shape
      else continue
    }
  }

  startDrag(mousePoint: Point) {
    const shape = this.selectShape(mousePoint)

    if (shape instanceof Shape) {
      this.dragStartPoint = mousePoint
      shape.setOffset(mousePoint)

      this.dragShape = shape
    }
  }

  drag(mousePoint: Point) {
    if (this.dragShape) {
      this.clear()
      this.dragShape.move(this.ctx, mousePoint)
    }
  }

  endDrag() {
    this.dragStartPoint = undefined
    this.dragShape = undefined
  }
}