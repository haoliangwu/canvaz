import Shape from "@shapes/Shape";
import Line from "@lines/Line";
import { arrayRemove, isSameReference, noopMouseEventHandler, safeProp, isInRectRange } from "@utils/index";
import StraightConnectionLine from "@lines/StraightConnectionLine";
import { Observable, fromEvent, Subscription, of, Subject, EMPTY, merge, pipe, BehaviorSubject } from 'rxjs';
import { switchMap, takeUntil, tap, publish, refCount, map, filter, bufferTime, partition, catchError } from 'rxjs/operators';
import { Some, Maybe, None } from 'monet';
import BasePlugin from "plugins/BasePlugin";
import ShadowCanvas from "@panels/internal/ShadowCanvas";

export type ShapeTuple = [Maybe<Shape>, MouseEvent]

export interface BaseCanvasOptions {
  width?: number,
  height?: number,
  shadow?: boolean,
  plugins?: BasePlugin[]
}

export interface BaseConvasMode {
  [mode: string]: any
}

export default abstract class BaseCanvas {
  options: BaseCanvasOptions = {}

  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  shadow!: ShadowCanvas
  originPoint: Point = { x: 0, y: 0 }

  width = 0
  height = 0

  shapes: Shape[] = []
  lines: Line[] = []

  mousePoint: Point = { x: 0, y: 0 }

  draw$ = new Subject<any>()

  mode: BaseConvasMode = {}

  mouseenter$: Observable<MouseEvent>
  mouseleave$: Observable<MouseEvent>
  mousedown$: Observable<MouseEvent>
  mousemove$: Observable<MouseEvent>
  mouseup$: Observable<MouseEvent>
  selectShape$: Observable<ShapeTuple>

  tasks: Map<string | symbol, Observable<any>> = new Map()
  tasks$$?: Subscription

  plugins: Map<string | symbol, BasePlugin> = new Map()

  set relativeMousePoint(val: Point) {
    this.mousePoint = val
  }
  get relativeMousePoint(): Point {
    return {
      x: this.mousePoint.x - this.originPoint.x,
      y: this.mousePoint.y - this.originPoint.y
    }
  }

  set cursor(cursor: string | null) {
    this.canvas.style.cursor = cursor
  }

  get context(): CanvasRenderingContext2D {
    return this.ctx
  }

  constructor(canvas: HTMLCanvasElement | string, options?: BaseCanvasOptions) {
    this.options = Object.assign(this.options, options)

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

    const multicastMouseEvent = () => pipe(publish<MouseEvent>(), refCount())
    const setRelativeMousePoint = () => tap<MouseEvent>(event => {
      this.relativeMousePoint = this.getMousePoint(event)
    })

    this.mouseenter$ = fromEvent<MouseEvent>(this.canvas, 'mouseenter')
      .pipe(tap(this.onStart.bind(this)), multicastMouseEvent())

    this.mouseleave$ = fromEvent<MouseEvent>(this.canvas, 'mouseleave')
      .pipe(tap(this.onEnd.bind(this)), multicastMouseEvent())

    this.mousedown$ = fromEvent<MouseEvent>(this.canvas, 'mousedown')
      .pipe(setRelativeMousePoint(), multicastMouseEvent())
    this.selectShape$ = this.mousedown$
      .pipe(map<MouseEvent, ShapeTuple>(event => [this.selectShape(this.relativeMousePoint), event]))

    this.mousemove$ = fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(setRelativeMousePoint(), multicastMouseEvent())

    this.mouseup$ = fromEvent<MouseEvent>(document, 'mouseup')
      .pipe(setRelativeMousePoint(), multicastMouseEvent())

    this.init(options)
  }

  init(options: BaseCanvasOptions = {}) {
    this.width = options.width || this.canvas.width
    this.height = options.height || this.canvas.height

    this.canvas.width = this.width
    this.canvas.height = this.height

    if (options.shadow) this.initShadowCanvas()

    const plugins = options.plugins || []
    this.initPlugins(plugins)
  }

  private initShadowCanvas() {
    this.shadow = new ShadowCanvas(this)
  }

  private initPlugins(plugins: BasePlugin[]) {
    plugins.forEach(plugin => this.registerPlugin(plugin.id, plugin))
  }

  mount(): Subscription {
    for (let [id, plugin] of this.plugins.entries()) {
      plugin.mount(this)
    }

    const drawTask$ = this.draw$.pipe(
      bufferTime(50, null, 5),
      filter(actions => actions.length > 0),
      tap(() => this.draw())
    )

    this.registerTask(Symbol('draw'), drawTask$)

    return this._mount()
  }

  unmount() {
    for (let [id, plugin] of this.plugins.entries()) {
      plugin.unmount(this)
    }

    if (this.tasks$$) this.tasks$$.unsubscribe()
  }

  registerPlugin(id: string | symbol, plugin: BasePlugin, override: boolean = false) {
    if (this.plugins.has(id) && !override) {
      return console.error(`plugin:${id} 已被注册. 请使用其他名称或设置 override = true`)
    }

    this.plugins.set(id, plugin)
  }

  unregisterPlugin(id: string | symbol) {
    if (this.plugins.has(id)) {
      (this.plugins.get(id) as BasePlugin).unmount(this)
      this.plugins.delete(id)
    }
  }

  registerTask<T = any>(id: string | symbol, task: Observable<T>, override: boolean = false) {
    if (this.tasks.has(id) && !override) {
      return console.error(`task:${id} 已被注册. 请使用其他名称或设置 override = true`)
    }

    this.tasks.set(id, task)
  }

  unregisterTask<T = any>(id: string) {
    if (this.tasks.has(id)) {
      this.tasks.delete(id)

      this.unmount()
    }

    this._mount()
  }

  registerElement(shape: Shape | Line) {
    if (shape instanceof Shape) {
      this.shapes.push(shape)
    }

    if (shape instanceof Line) {
      this.lines.push(shape)
    }
  }

  unregisterElement(shape: Shape | Line) {
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

  isPointVisible(): boolean {
    return isInRectRange(this.relativeMousePoint, { x: 0, y: 0 }, this.width, this.height)
  }

  onStart(event: MouseEvent) { }

  onEnd(event: MouseEvent) { }

  removeElement<T>(arr: T[], item: T) {
    const idx = arr.indexOf(item)

    if (idx > -1) {
      arr.splice(idx, 1)
    }

    this.draw$.next()
  }

  getMousePoint(event: MouseEvent): Point {
    const { clientX, clientY } = event
    return { x: clientX, y: clientY }
  }

  changeMode<M extends BaseConvasMode>(mode: M) {
    this.mode = Object.assign(this.mode, mode)
  }

  private _mount() {
    this.draw()

    const tasks$: Observable<any>[] = Array.from(this.tasks.entries()).map(([id, task]) => {
      return task.pipe(
        catchError(err => {
          console.error(`task:${id} 中发生错误`)
          return EMPTY
        }))
    })

    this.tasks$$ = this.mouseenter$.pipe(
      switchMap(() => merge(...tasks$).pipe(
        takeUntil(this.mouseleave$)))
    ).subscribe()

    return this.tasks$$
  }
}