import Shape from "@shapes/Shape";
import Line from "@lines/Line";
import StraightLine from "@lines/StraightLine";
import { arrayRemove, isSameReference } from "@utils/index";
import BaseCanvas, { BaseCanvasOptions, BaseConvasMode } from "@panels/BaseCanvas";
import { of, iif, Observable, Subscription } from "rxjs";
import { filter, tap, switchMap, takeUntil } from "rxjs/operators";

export interface DraggableCanvasOptions extends BaseCanvasOptions { }

export interface DraggableConvasMode extends BaseConvasMode{
  dragging: boolean
}

export default class DraggableCanvas extends BaseCanvas {
  protected mode: DraggableConvasMode = {
    connecting: false,
    dragging: false
  }

  protected dragStartPoint?: Point
  protected dragShape?: Shape

  private drag$$?: Subscription

  constructor(canvas: HTMLCanvasElement, options?: DraggableCanvasOptions) {
    super(canvas, options)

    this.mount()
  }

  mount() {
    super.mount()

    this.drag$$ = this.mousedown$.pipe(
      filter(event => !this.mode.connecting),
      tap(event => this.startDrag(event)),
      switchMap(() => this.mousemove$.pipe(
        takeUntil(this.mouseup$.pipe(
          tap(event => this.endDrag(event))
        ))
      )),
      tap(event => this.drag(event))
    ).subscribe()
  }

  destroy() {
    super.destroy()

    if(this.drag$$) {
      this.drag$$.unsubscribe()
      this.drag$$ = undefined
    }
  }

  protected startDrag(event: MouseEvent): void {
    const shapeM = this.selectShape(this.relativeMousePoint)

    if (shapeM.isNone()) return

    const shape = shapeM.some()

    if (shape.isSelectedContent(this.relativeMousePoint)) {
      this.dragStartPoint = { x: this.relativeMousePoint.x, y: this.relativeMousePoint.y }
      this.dragShape = shape

      shape.setOffset(this.relativeMousePoint)
      this.mode.dragging = true
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
    this.mode.dragging = false
  }
}