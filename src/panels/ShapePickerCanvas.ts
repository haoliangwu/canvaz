import Shape from "@shapes/Shape";
import BaseCanvas, { BaseCanvasOptions, BaseConvasMode } from "@panels/BaseCanvas";
import { filter, tap, switchMap, takeUntil, throttleTime } from "rxjs/operators";
import { isSameReference } from "@utils/index";
import { Subscription, Subject, BehaviorSubject } from "rxjs";

export interface ShapePickerCanvasOptions extends BaseCanvasOptions {
  target?: BaseCanvas
}

export interface ShapePickerConvasMode extends BaseConvasMode {
  picking: boolean;
}

class ShapeMirrorCanvas extends BaseCanvas {
  constructor(canvas: HTMLCanvasElement, options: ShapePickerCanvasOptions) {
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

export default class ShapePickerCanvas extends BaseCanvas {
  mode: ShapePickerConvasMode = {
    picking: false
  }

  target?: BaseCanvas

  mirror: ShapeMirrorCanvas
  mirrorShape?: Shape

  originPoint: Point
  offsetPoint: Point = { x: 0, y: 0 }

  mirror$$?: Subscription
  pickedShape$ = new Subject<Shape>()

  constructor(canvas: HTMLCanvasElement, options: ShapePickerCanvasOptions = {}) {
    super(canvas, options)

    this.target = options.target

    const $mirrorCanvas = document.createElement('canvas')

    document.body.appendChild($mirrorCanvas)

    this.mirror = new ShapeMirrorCanvas($mirrorCanvas, {
      width: this.canvas.width,
      height: this.canvas.height
    })

    const originCanvasRect = this.canvas.getBoundingClientRect()
    this.originPoint = {
      x: originCanvasRect.left,
      y: originCanvasRect.top
    }
  }

  draw() {
    super.draw()

    if (this.mirrorShape) this.mirrorShape.draw(this.ctx)
  }

  mount() {
    const pickTask$ = this.mousedown$.pipe(
      tap(event => this.startPick(event))
    )

    this.registerTask(Symbol('pick'), pickTask$)

    this.mirror$$ = this.mousedown$.pipe(
      switchMap(() => this.mousemove$.pipe(
        takeUntil(this.mouseup$.pipe(
          tap(event => this.endPick(event))
        ))
      )),
      throttleTime(16),
      tap(event => this.pick(event))
    ).subscribe()

    return super.mount()
  }

  unmount() {
    if (this.mirror$$) this.mirror$$.unsubscribe()

    return super.unmount()
  }

  startPick(event: MouseEvent): void {
    const shapeM = this.selectShape(this.relativeMousePoint)

    if (shapeM.isNone()) return

    const shape = shapeM.some()
    const mousePoint = this.getMousePoint(event)

    if (shape.isSelectedContent(this.relativeMousePoint)) {
      this.mirrorShape = shape.clone()

      this.mirrorShape.setOffset(this.relativeMousePoint)
      this.mirror.registerElement(this.mirrorShape)

      this.offsetPoint = mousePoint

      this.mirror.show({
        x: this.originPoint.x,
        y: this.originPoint.y
      })

      this.changeMode<ShapePickerConvasMode>({
        picking: true
      })
    }
  }

  pick(event: MouseEvent): void {
    if (!this.mirrorShape) return

    this.draw()

    const mousePoint = this.getMousePoint(event)

    this.mirror.move({
      x: mousePoint.x - this.offsetPoint.x,
      y: mousePoint.y - this.offsetPoint.y,
    })
  }

  endPick(event: MouseEvent): void {
    const mousePoint = this.getMousePoint(event)

    if (this.mirrorShape) {
      this.mirror.unregisterElement(this.mirrorShape)
      this.pickedShape$.next(this.mirrorShape)

      if (this.target) {
        this.target.relativeMousePoint = mousePoint

        if (this.target.isPointVisible()) {
          this.mirrorShape.move(this.target.relativeMousePoint)

          this.target.registerElement(this.mirrorShape)
          this.target.draw()
        }
      }
    }

    this.mirrorShape = undefined
    this.changeMode<ShapePickerConvasMode>({
      picking: false
    })

    this.mirror.hide()
  }
}