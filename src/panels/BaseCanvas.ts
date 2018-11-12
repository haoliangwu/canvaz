import Shape from "@shapes/Shape";
import Line from "@lines/Line";
import { arrayRemove, isSameReference, noopMouseEventHandler } from "@utils/index";
import StraightConnectionLine from "@lines/StraightConnectionLine";
import { Observable, fromEvent, Subscription, of } from 'rxjs';
import { switchMap, takeUntil, tap, publish, refCount, map, filter } from 'rxjs/operators';

export interface BaseCanvasOptions {
  width?: number,
  height?: number,
  onMouseDown?: (event: MouseEvent) => void
  onMouseMove?: (event: MouseEvent) => void
  onMouseUp?: (event: MouseEvent) => void
}

export interface BaseConvasMode {
  connecting: boolean
}

export default abstract class BaseCanvas {
  protected mode: BaseConvasMode = {
    connecting: false
  }

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
  protected selectedShape$?: Observable<Nullable<Shape>>
  protected selectedShapeBorder$?: Observable<Nullable<Shape>>
  protected selectedShapeContent$?: Observable<Nullable<Shape>>

  private connect$$?: Subscription
  private hover$$?: Subscription

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
      .pipe(tap(event => this.relativeMousePoint = this.getMousePoint(event)))
      .pipe(publish(), refCount())
    this.mousemove$ = fromEvent<MouseEvent>(this.canvas, 'mousemove')
      .pipe(tap(event => this.relativeMousePoint = this.getMousePoint(event)))
      .pipe(publish(), refCount())
    this.mouseup$ = fromEvent<MouseEvent>(document, 'mouseup')
      .pipe(tap(event => this.relativeMousePoint = this.getMousePoint(event)))
      .pipe(publish(), refCount())

    this.init(options)
  }

  init(options: BaseCanvasOptions = {}) {
    this.width = options.width || this.canvas.width
    this.height = options.height || this.canvas.height

    // if (options.onMouseDown) this.onMouseDownCustom = options.onMouseDown.bind(this)
    // if (options.onMouseMove) this.onMouseMoveCustom = options.onMouseMove.bind(this)
    // if (options.onMouseUp) this.onMouseUpCustom = options.onMouseUp.bind(this)

    this.selectedShape$ = this.mousedown$.pipe(
      map(() => this.selectShape(this.relativeMousePoint)),
      filter(shape => shape instanceof Shape)
    )

    this.selectedShapeBorder$ = this.selectedShape$.pipe(
      filter(shape => shape ? shape.isSelectedBorder(this.relativeMousePoint) : false)
    )

    this.selectedShapeContent$ = this.selectedShape$.pipe(
      filter(shape => shape ? shape.isSelectedContent(this.relativeMousePoint) : false)
    )
  }

  mount() {
    this.connect$$ = this.mousedown$.pipe(
      filter(event => this.startConnect(event)),
      switchMap(() => this.mousemove$.pipe(
        takeUntil(this.mouseup$.pipe(
          tap(event => this.endConnect(event))
        ))
      )),
      tap(event => this.connect(event))
    ).subscribe()

    this.hover$$ = this.mousemove$.pipe(
      tap(event => this.hoverShape(event))
    ).subscribe()
  }

  destroy() {
    if (this.connect$$) {
      this.connect$$.unsubscribe()
      this.connect$$ = undefined
    }

    if (this.hover$$) {
      this.hover$$.unsubscribe()
      this.hover$$ = undefined
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

  removeConnection(line?: Line) {
    if (!line) return

    this.removeElement(this.lines, line)
  }

  removeShape(shape?: Shape) {
    if (!shape) return

    this.removeElement(this.shapes, shape)
  }

  protected startConnect(event: MouseEvent): boolean {
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

      this.mode.connecting = true

      return true
    }

    return false
  }

  protected connect(event: MouseEvent) {
    if (this.connection) {
      this.connection.stretch(this.relativeMousePoint)
      this.draw()
    }
  }

  protected endConnect(event: MouseEvent) {
    // 如果当前不是有效的连线状态 则 直接返回
    if (!this.connection || !this.connectionStartShape) return

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
    this.mode.connecting = false
  }

  protected hoverShape(event: MouseEvent): void {
    const shape = this.selectShape(this.relativeMousePoint)

    if (shape) {
      if (this.hoveredShape == shape) return

      this.hoveredShape = shape
      this.hoveredShape.highlight(this.ctx)
    }
    else {
      if (this.hoveredShape) {
        this.hoveredShape.cancelHighlight(this.ctx)
        this.hoveredShape = undefined
      }
    }
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