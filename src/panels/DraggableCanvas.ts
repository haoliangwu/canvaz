import BaseCanvas, { BaseCanvasOptions, BaseConvasMode } from "@panels/internal/BaseCanvas";
import { BehaviorSubject, Subscription } from "rxjs";
import Shape from "@shapes/Shape";
import { filter, tap, switchMap, takeUntil } from "rxjs/operators";
import RectShape, { RectShapeOptions } from "@shapes/Rect";
import { clonePoint } from "@utils/index";
import { None, Maybe } from "monet";

export interface DraggableCanvasOptions extends BaseCanvasOptions {
}

export interface DraggableConvasMode extends BaseConvasMode {
  dragging?: boolean
  multi?: boolean
}

class MultiSelectMaskRect extends RectShape {
  includeShapes: Shape[] = []

  constructor(options?: RectShapeOptions) {
    super(Object.assign({}, {
      width: 0,
      height: 0,
      fillStyle: 'transparent',
      dashSegments: [10, 10],
      originPoint: { x: 0, y: 0 }
    }, options))
  }

  move(mousePoint: Point) {
    super.move(mousePoint)

    this.includeShapes.forEach(s => {
      s.move({
        x: mousePoint.x - this.offsetX,
        y: mousePoint.y - this.offsetY
      })
    })
  }

  registerIncludeShapes(shapes: Shape[]) {
    this.includeShapes = shapes.map(s => {
      s.setOffsetByRelativePoint(this.originPoint)
      return s
    })
  }

  clear() {
    this.originPoint = { x: 0, y: 0 }
    this.includeShapes = []
  }

  calcHoverSlot(mousePoint: Point): Maybe<Shape> {
    return None()
  }
}

export default class DraggableCanvas extends BaseCanvas {
  mode: DraggableConvasMode = {
    dragging: false,
    multi: false,
  }

  dragStartPoint?: Point
  dragShape?: Shape

  drag$$?: Subscription

  multiSelectMask?: MultiSelectMaskRect

  constructor(canvas: HTMLCanvasElement, options?: DraggableCanvasOptions) {
    super(canvas, Object.assign({ shadow: true }, options))
  }

  mount() {
    this.drag$$ = this.mousedown$.pipe(
      filter(() => !this.mode.connecting),
      tap(event => this.startDrag(event)),
      switchMap(() => this.mousemove$.pipe(
        takeUntil(this.mouseup$.pipe(
          tap(event => this.endDrag(event))
        ))
      )),
      tap(event => this.drag(event))
    ).subscribe()

    return super.mount()
  }

  unmount() {
    if (this.drag$$) this.drag$$.unsubscribe()

    super.unmount()
  }

  toggleMultiDrag(sp: Point, ep: Point) {
    this.multiSelectMask = new MultiSelectMaskRect()

    this.multiSelectMask.move(sp)
    this.multiSelectMask.resize(ep)

    const shapes = this.shapes.filter(e => e.isInMultiSelectRange(sp, ep))

    if (shapes.length > 0) {
      this.multiSelectMask.registerIncludeShapes(shapes)
      this.registerElement(this.multiSelectMask)
      this.changeMode<DraggableConvasMode>({
        multi: true
      })

      this.draw()
    }
  }

  protected startDrag(event: MouseEvent): void {
    const shapeM = this.selectShape(this.relativeMousePoint)

    if (shapeM.isNone()) return

    const shape = shapeM.some()

    if (shape.isSelectedContent(this.relativeMousePoint)) {
      this.dragStartPoint = clonePoint(this.relativeMousePoint)
      this.dragShape = shape

      shape.setOffsetByMousePoint(this.relativeMousePoint)
      this.changeMode<DraggableConvasMode>({
        dragging: true
      })
    }
  }

  protected drag(event: MouseEvent): void {
    if (!this.dragShape) return

    this.dragShape.move(this.relativeMousePoint)
    this.draw()
  }

  protected endDrag(event: MouseEvent): void {
    this.dragStartPoint = undefined
    this.dragShape = undefined

    if (this.mode.multi) {
      this.removeShape(this.multiSelectMask)
      
      if(this.multiSelectMask) this.multiSelectMask.clear()
      
      this.multiSelectMask = undefined
      
      this.draw$.next()
    }

    this.changeMode<DraggableConvasMode>({
      dragging: false,
      multi: false,
    })
  }
}