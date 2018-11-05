import Shape from "@shapes/Shape";
import Line from "@lines/Line";
import StraightLine from "@lines/StraightLine";
import { arrayRemove, isSameReference } from "@utils/index";

export interface BaseCanvasOptions { }

export default class BaseCanvas {
  protected ctx: CanvasRenderingContext2D
  protected startPoint: Point = { x: 0, y: 0 }

  protected width = 0
  protected height = 0

  protected shapes: Shape[] = []
  protected lines: Line[] = []

  protected connectionStartShape?: Shape
  protected connection?: Line

  protected mousePoint: Point = { x: 0, y: 0 }

  protected set relativeMousePoint(val: Point) {
    this.mousePoint = val
  }
  protected get relativeMousePoint(): Point {
    return {
      x: this.mousePoint.x - this.startPoint.x,
      y: this.mousePoint.y - this.startPoint.y
    }
  }

  get context(): CanvasRenderingContext2D {
    return this.ctx
  }

  constructor(canvas: HTMLCanvasElement, options?: BaseCanvasOptions) {
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    this.init(canvas)
    this.width = canvas.width
    this.height = canvas.height

    if (options) { }
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
    this.clear()

    this.shapes.forEach(shape => {
      this.ctx.save()
      shape.draw(this.ctx)
      this.ctx.restore()
    })

    this.lines.forEach(line => {
      this.ctx.save()
      line.draw(this.ctx)
      this.ctx.restore()
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
    this.relativeMousePoint = mousePoint
    const shape = this.selectShape(this.relativeMousePoint)

    if (shape && shape.isSelectedBorder(this.relativeMousePoint)) {
      this.connectionStartShape = shape

      const borderDirection = shape.getSelectedBorder(this.relativeMousePoint)
      if (!borderDirection) return false

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
      this.relativeMousePoint = mousePoint
      this.connection.stretch(this.relativeMousePoint)
      this.draw()
    }
  }

  endConnect(mousePoint: Point) {
    this.relativeMousePoint = mousePoint
    const shape = this.selectShape(this.relativeMousePoint)

    // 当前鼠标指向某个图形
    // 且悬浮于图形的 border 上
    // 且连线的终点图形不为始点图形
    if (shape && shape.isSelectedBorder(this.relativeMousePoint) && !isSameReference(this.connectionStartShape, shape)) {
      const borderDirection = shape.getSelectedBorder(this.relativeMousePoint)

      if (this.connection && borderDirection) {
        const connectionEndPoint = shape.getConnectionPoint(borderDirection)

        if (connectionEndPoint) {
          this.connection.update({
            endPoint: connectionEndPoint,
            endShape: shape
          })

          shape.registerConnection(this.connection, borderDirection)
          this.draw()
        }
      }
    } else {
      // todo revert current connection line
      this.removeConnection(this.connection)
    }

    this.connection = undefined
    this.connectionStartShape = undefined
  }

  removeConnection(line?: Line) {
    if(!line) return
    
    this.removeElement(this.lines, line)
  }

  removeShape(shape?: Shape) {
    if(!shape) return

    this.removeElement(this.shapes, shape)
  }

  private init(canvas: HTMLCanvasElement) {
    const { top, left } = canvas.getBoundingClientRect()
    this.startPoint = {
      x: left + window.pageXOffset,
      y: top + window.pageYOffset,
    }
  }

  protected removeElement<T>(arr: T[], item: T) {
    const idx = arr.indexOf(item)

    if (idx > -1) {
      arr.splice(idx, 1)
    }

    this.draw()
  }
}