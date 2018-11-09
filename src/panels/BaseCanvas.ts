import Shape from "@shapes/Shape";
import Line from "@lines/Line";
import { arrayRemove, isSameReference, noopMouseEventHandler } from "@utils/index";
import StraightConnectionLine from "@lines/StraightConnectionLine";
import { Observable, fromEvent, Subscription } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

export interface BaseCanvasOptions {
  width?: number,
  height?: number,
  onMouseDown?: (event: MouseEvent) => void
  onMouseMove?: (event: MouseEvent) => void
  onMouseUp?: (event: MouseEvent) => void
}

export default abstract class BaseCanvas {
  protected canvas: HTMLCanvasElement
  protected ctx: CanvasRenderingContext2D
  protected startPoint: Point = { x: 0, y: 0 }

  protected width = 0
  protected height = 0

  protected shapes: Shape[] = []
  protected lines: Line[] = []

  protected connectionStartShape?: Shape
  protected connection?: Line

  protected hoveredShape?: Shape

  protected mousePoint: Point = { x: 0, y: 0 }

  protected mousedown$: Observable<MouseEvent>
  protected mousemove$: Observable<MouseEvent>
  protected mouseup$: Observable<MouseEvent>

  private mouseBaseSub?: Subscription
  private hoverCanvasSub?: Subscription

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

  private onMouseDownCustom: (event: MouseEvent) => void = noopMouseEventHandler
  private onMouseMoveCustom: (event: MouseEvent) => void = noopMouseEventHandler
  private onMouseUpCustom: (event: MouseEvent) => void = noopMouseEventHandler

  protected abstract onMouseDown(event: MouseEvent): void
  protected abstract onMouseUp(event: MouseEvent): void
  protected abstract onMouseMove(event: MouseEvent): void

  constructor(canvas: HTMLCanvasElement | string, options?: BaseCanvasOptions) {
    if (canvas instanceof HTMLCanvasElement) {
      this.canvas = canvas
    } else {
      this.canvas = document.querySelector(canvas) as HTMLCanvasElement
    }

    if (!this.canvas) throw new Error('请传入正确的 canvas 元素或者选择器')

    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.width = this.canvas.width
    this.height = this.canvas.height

    const { top, left } = this.canvas.getBoundingClientRect()
    this.startPoint = {
      x: left + window.pageXOffset,
      y: top + window.pageYOffset,
    }

    this.mousedown$ = fromEvent<MouseEvent>(this.canvas, 'mousedown')
    this.mousemove$ = fromEvent<MouseEvent>(this.canvas, 'mousemove')
    this.mouseup$ = fromEvent<MouseEvent>(document, 'mouseup')

    this.mouseBaseSub = this.mousedown$.pipe(
      tap(e => this.mouseDownHandler(e)),
      switchMap(() => this.mousemove$.pipe(
        takeUntil(this.mouseup$.pipe(
          tap(e => this.mouseUpHandler(e))
        ))
      )),
      tap(e => this.mouseMoveHandler(e)),
    ).subscribe()

    this.hoverCanvasSub = this.mousemove$.pipe(
      tap(e => this.hoverCanvasHandler(e))
    ).subscribe()

    if (options) this.init(options)
  }

  init(options: BaseCanvasOptions) {
    this.width = options.width || this.canvas.width
    this.height = options.height || this.canvas.height

    if (options.onMouseDown) this.onMouseDownCustom = options.onMouseDown.bind(this)
    if (options.onMouseMove) this.onMouseMoveCustom = options.onMouseMove.bind(this)
    if (options.onMouseUp) this.onMouseUpCustom = options.onMouseUp.bind(this)
  }

  destroy() {
    if (this.mouseBaseSub) {
      this.mouseBaseSub.unsubscribe()
      this.mouseBaseSub = undefined
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
    this.clear()

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
    this.relativeMousePoint = mousePoint
    const shape = this.selectShape(this.relativeMousePoint)

    if (shape && shape.isSelectedBorder(this.relativeMousePoint)) {
      this.connectionStartShape = shape

      const borderDirection = shape.getSelectedBorder(this.relativeMousePoint)
      if (!borderDirection) return false

      const connectionStartPoint = shape.calcConnectionPoint(borderDirection)
      if (!connectionStartPoint) return false

      this.connection = new StraightConnectionLine({
        startPoint: connectionStartPoint,
        endPoint: connectionStartPoint,
        startShape: shape
      })

      shape.registerConnectionPoint(this.connection, connectionStartPoint)
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
    // 如果当前不是有效的连线状态 则 直接返回
    if (!this.connection || !this.connectionStartShape) return

    this.relativeMousePoint = mousePoint
    const shape = this.selectShape(this.relativeMousePoint)

    // 当前鼠标指向某个图形
    // 且悬浮于图形的 border 上
    // 且连线的终点图形不为始点图形
    if (shape && shape.isSelectedBorder(this.relativeMousePoint) && !isSameReference(this.connectionStartShape, shape)) {
      const borderDirection = shape.getSelectedBorder(this.relativeMousePoint)

      if (borderDirection) {
        const connectionEndPoint = shape.calcConnectionPoint(borderDirection)

        if (connectionEndPoint) {
          this.connection.update({
            endPoint: connectionEndPoint,
            endShape: shape
          })

          shape.registerConnectionPoint(this.connection, connectionEndPoint)
          this.draw()
        }
      }
    } else {
      this.connectionStartShape.unregisterConnectionPoint(this.connection)
      this.removeConnection(this.connection)
    }

    this.connection = undefined
    this.connectionStartShape = undefined
  }

  removeConnection(line?: Line) {
    if (!line) return

    this.removeElement(this.lines, line)
  }

  removeShape(shape?: Shape) {
    if (!shape) return

    this.removeElement(this.shapes, shape)
  }

  protected onCanvasHover(event: MouseEvent): void {
    const { clientX, clientY } = event
    const mousePoint = this.getMousePoint(event)

    this.relativeMousePoint = mousePoint
    const shape = this.selectShape(this.relativeMousePoint)

    if (shape) {
      if (this.hoveredShape == shape) return

      this.hoveredShape = shape
      this.hoveredShape.highlight(this.ctx)
    }
    else {
      if (this.hoveredShape) {
        this.hoveredShape.redraw(this.ctx)
        this.hoveredShape = undefined
      }
    }
  }

  protected mouseDownHandler(event: MouseEvent) {
    this.onMouseDown(event)
    this.onMouseDownCustom(event)
  }

  protected mouseMoveHandler(event: MouseEvent) {
    this.onMouseMove(event)
    this.onMouseMoveCustom(event)
  }

  protected mouseUpHandler(event: MouseEvent) {
    this.onMouseUp(event)
    this.onMouseUpCustom(event)
  }

  protected hoverCanvasHandler(event: MouseEvent) {
    this.onCanvasHover(event)
  }

  protected removeElement<T>(arr: T[], item: T) {
    const idx = arr.indexOf(item)

    if (idx > -1) {
      arr.splice(idx, 1)
    }

    this.draw()
  }

  protected getMousePoint(event: MouseEvent): Point {
    const { clientX, clientY } = event
    return { x: clientX, y: clientY }
  }
}