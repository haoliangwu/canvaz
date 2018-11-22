import Shape from "@shapes/Shape";
import Line from "@lines/Line";
import { arrayRemove, isSameReference, noopMouseEventHandler } from "@utils/index";
import StraightConnectionLine from "@lines/StraightConnectionLine";
import { Observable, fromEvent, Subscription, of, Subject, interval, empty, iif } from 'rxjs';
import { switchMap, takeUntil, tap, publish, refCount, map, filter, bufferTime, partition } from 'rxjs/operators';
import { Some, Maybe, None } from 'monet';

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
  protected originPoint: Point = { x: 0, y: 0 }

  protected width = 0
  protected height = 0

  protected shapes: Shape[] = []
  protected lines: Line[] = []

  protected connectionStartShape?: Shape
  protected connection?: Line

  protected hoveredShape?: Shape

  protected mousePoint: Point = { x: 0, y: 0 }

  draw$: Subject<any> = new Subject()

  protected mousedown$: Observable<MouseEvent>
  protected mousemove$: Observable<MouseEvent>
  protected mouseup$: Observable<MouseEvent>

  private draw$$?: Subscription
  private connect$$?: Subscription
  private hoverShape$$?: Subscription
  private hoverCanvas$$?: Subscription

  protected set relativeMousePoint(val: Point) {
    this.mousePoint = val
  }
  protected get relativeMousePoint(): Point {
    return {
      x: this.mousePoint.x - this.originPoint.x,
      y: this.mousePoint.y - this.originPoint.y
    }
  }

  protected set cursor(cursor: string | null) {
    this.canvas.style.cursor = cursor
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
    this.originPoint = {
      x: left + window.pageXOffset,
      y: top + window.pageYOffset,
    }

    this.mousedown$ = fromEvent<MouseEvent>(this.canvas, 'mousedown')
      .pipe(tap(event => {
        this.relativeMousePoint = this.getMousePoint(event)
      }))
      .pipe(publish(), refCount())
    this.mousemove$ = fromEvent<MouseEvent>(this.canvas, 'mousemove')
      .pipe(tap(event => {
        this.relativeMousePoint = this.getMousePoint(event)
      }))
      .pipe(publish(), refCount())
    this.mouseup$ = fromEvent<MouseEvent>(document, 'mouseup')
      .pipe(tap(event => {
        this.relativeMousePoint = this.getMousePoint(event)
      }))
      .pipe(publish(), refCount())

    this.init(options)
  }

  init(options: BaseCanvasOptions = {}) {
    this.width = options.width || this.canvas.width
    this.height = options.height || this.canvas.height

    // if (options.onMouseDown) this.onMouseDownCustom = options.onMouseDown.bind(this)
    // if (options.onMouseMove) this.onMouseMoveCustom = options.onMouseMove.bind(this)
    // if (options.onMouseUp) this.onMouseUpCustom = options.onMouseUp.bind(this)
  }

  mount() {
    this.connect$$ = this.mousedown$.pipe(
      tap(event => this.startConnect(event)),
      filter(() => this.mode.connecting),
      switchMap(() => this.mousemove$.pipe(
        takeUntil(this.mouseup$.pipe(
          tap(event => this.endConnect(event))
        ))
      )),
      tap(event => this.connect(event))
    ).subscribe()

    const hoverMaybeShape$ = this.mousemove$.pipe(
      map(event => this.selectShape(this.relativeMousePoint))
    )
    const [hoverShape$, hoverCanvas$] = partition<Maybe<Shape>>(shapeM => shapeM.isSome())(hoverMaybeShape$)

    this.hoverShape$$ = hoverShape$.pipe(
      map(shapeM => shapeM.some()),
    ).subscribe(this.hoverShape.bind(this))
    this.hoverCanvas$$ = hoverCanvas$.subscribe(this.hoverCanvas.bind(this))

    this.draw$$ = this.draw$.pipe(
      bufferTime(50, null, 5),
      filter(actions => actions.length > 0),
      tap(actions => {
        this.draw()
      })
    ).subscribe()
  }

  destroy() {
    [this.connect$$, this.hoverCanvas$$, this.hoverShape$$, this.draw$$].forEach(sub => {
      if (sub) sub.unsubscribe()
      sub = undefined
    })
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

  selectShape(relativePoint: Point): Maybe<Shape> {
    let selectedShape = undefined

    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i]
      if (shape.isSelected(relativePoint)) {
        selectedShape = shape
        break
      }
    }

    // undefined as None<Shape> type
    return Maybe.fromNull(selectedShape as Shape)
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
    const shapeM = this.selectShape(this.relativeMousePoint)

    if (shapeM.isNone()) return false

    const shape = shapeM.some()

    if (shape.isSelectedBorder(this.relativeMousePoint)) {
      this.connectionStartShape = shape

      const connectionStartPoint = shape.calcConnectionPoint(this.relativeMousePoint)
      if (connectionStartPoint.isNone()) return false

      const startPoint = connectionStartPoint.some()

      this.connection = new StraightConnectionLine({
        startPoint,
        endPoint: startPoint,
        startShape: shape
      })

      shape.registerConnectionPoint(this.connection, startPoint)
      this.lines.push(this.connection)

      this.mode.connecting = true

      return true
    }

    return false
  }

  protected connect(event: MouseEvent) {
    if (this.connection) {
      this.connection.stretch(this.relativeMousePoint)

      this.cursor = 'crosshair'

      this.draw$.next()
    }
  }

  protected endConnect(event: MouseEvent): boolean {
    let connected = false

    const shapeM = this.selectShape(this.relativeMousePoint)

    // 如果当前不是有效的连线状态 则 直接返回
    if (shapeM.isNone() || !this.connection) {
      return this.resetConnectionStatus(connected)
    }

    const shape = shapeM.some()

    const isSelectedBorder = shape.isSelectedBorder(this.relativeMousePoint)
    const isNotStartShape = !isSameReference(this.connectionStartShape, shape)
    const connectionEndPoint = shape.calcConnectionPoint(this.relativeMousePoint)

    // 当前鼠标指向某个图形
    // 且悬浮于图形的 border 上
    // 且连线的终点图形不为始点图形
    if (isSelectedBorder && isNotStartShape && connectionEndPoint.isSome()) {
      const endPoint = connectionEndPoint.some()

      // 当存在合法的 endShape 连接点时
      if (connectionEndPoint) {
        this.connection.update({
          endPoint,
          endShape: shape
        })

        shape.registerConnectionPoint(this.connection, endPoint)
        // 移除 hoverSlot
        shape.toggleHoverSlot()
        this.draw$.next()

        connected = true
      }
    }

    return this.resetConnectionStatus(connected)
  }

  protected hoverCanvas(): void {
    if (this.hoveredShape) {
      this.hoveredShape.cancelHighlight()
      this.hoveredShape.toggleHoverSlot(this.relativeMousePoint)
      this.hoveredShape = undefined
      this.draw$.next()

      this.cursor = 'auto'
    }
  }

  protected hoverShape(shape: Shape): void {
    // 如果 hover 图形和上次 hover 图形不一致
    if (this.hoveredShape && !isSameReference(shape, this.hoveredShape)) {
      this.hoveredShape.cancelHighlight()
    }

    this.hoveredShape = shape
    this.hoveredShape.highlight()
    this.hoveredShape.toggleHoverSlot(this.relativeMousePoint)
    this.draw$.next()
  }

  protected removeElement<T>(arr: T[], item: T) {
    const idx = arr.indexOf(item)

    if (idx > -1) {
      arr.splice(idx, 1)
    }

    this.draw$.next()
  }

  protected getMousePoint(event: MouseEvent): Point {
    const { clientX, clientY } = event
    return { x: clientX, y: clientY }
  }

  /**
   * @param connected - 当前连线是否成功
   * @return 最终的连线是否成功
   */
  private resetConnectionStatus(connected: boolean = false): boolean {
    if (!connected && this.connection && this.connectionStartShape) {
      this.connectionStartShape.unregisterConnectionPoint(this.connection)
      this.removeConnection(this.connection)
    }

    this.connection = undefined
    this.connectionStartShape = undefined
    this.mode.connecting = false

    return connected
  }
}