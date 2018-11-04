import Shape from "./shapes/Shape";
import { Point } from "./typings";
import Line from "./shapes/Line";
import { arrayRemove } from "./utils/index";
import StraightLine from "./shapes/StraightLine";

export interface DraggableCanvasOptions { }

export default class DraggableCanvas {
  private ctx: CanvasRenderingContext2D
  private startPoint: Point = { x: 0, y: 0 }

  private width = 0
  private height = 0

  private shapes: Shape[] = []
  private lines: Line[] = []

  private dragStartPoint?: Point
  private dragShape?: Shape

  private connection?: Line

  private mousePoint: Point = { x: 0, y: 0 }

  private set clickPoint(val: Point) {
    this.mousePoint = val
  }
  private get clickPoint(): Point {
    return {
      x: this.mousePoint.x - this.startPoint.x,
      y: this.mousePoint.y - this.startPoint.y
    }
  }

  get context(): CanvasRenderingContext2D {
    return this.ctx
  }

  constructor(canvas: HTMLCanvasElement, options?: DraggableCanvasOptions) {
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    this.init(canvas)
    this.width = canvas.width
    this.height = canvas.height

    if (options) { }
  }

  private init(canvas: HTMLCanvasElement) {
    const { top, left } = canvas.getBoundingClientRect()
    this.startPoint = {
      x: left + window.pageXOffset,
      y: top + window.pageYOffset,
    }
  }

  register(shape: Shape | Line) {
    if (shape instanceof Shape) {
      this.shapes.push(shape)
    }

    if (shape instanceof Line) {
      this.lines.push(shape)
    }
  }

  unregister(shape: Shape | Line) {
    if (shape instanceof Shape) {
      arrayRemove(this.shapes, shape)
    }

    if (shape instanceof Line) {
      arrayRemove(this.lines, shape)
    }
  }

  draw() {
    this.shapes.forEach(shape => {
      shape.draw(this.ctx)
    })

    this.lines.forEach(line => {
      line.draw(this.ctx)
    })
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  selectShape(relativePoint: Point): Shape | undefined {
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i]
      if (shape.isSelected(relativePoint)) return shape
      else continue
    }
  }

  startConnect(mousePoint: Point): boolean {
    this.clickPoint = mousePoint
    const shape = this.selectShape(this.clickPoint)

    if (shape && shape.isSelectedBorder(this.clickPoint)) {
      const borderDirection = shape.getSelectedBorder(this.clickPoint)
      if(!borderDirection) return false

      const connectionStartPoint = shape.getConnectionPoint(borderDirection)
      if (!connectionStartPoint) return false

      this.connection = new StraightLine({
        startPoint: connectionStartPoint,
        endPoint: connectionStartPoint,
        startShape: shape
      })

      shape.registerConnection(this.connection, borderDirection)
      this.lines.push(this.connection)

      return true
    }

    return false
  }

  connect(mousePoint: Point) {
    if (this.connection) {
      this.clickPoint = mousePoint
      this.clear()
      this.connection.stretch(this.clickPoint)
      this.draw()
    }
  }

  endConnect() {
    this.connection = undefined
  }

  startDrag(mousePoint: Point): boolean {
    this.clickPoint = mousePoint
    const shape = this.selectShape(this.clickPoint)

    if (shape && shape.isSelectedContent(mousePoint)) {
      this.dragStartPoint = { x: this.clickPoint.x, y: this.clickPoint.y}
      this.dragShape = shape

      shape.setOffset(this.clickPoint)

      return true
    }

    return false
  }

  drag(mousePoint: Point) {
    if (this.dragShape) {
      this.clickPoint = mousePoint
      this.clear()
      this.dragShape.move(this.clickPoint)
      this.draw()
    }
  }

  endDrag() {
    this.dragStartPoint = undefined
    this.dragShape = undefined
  }
}