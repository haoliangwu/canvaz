import Shape from "@shapes/Shape";
import BaseCanvas, { BaseCanvasOptions, BaseConvasMode } from "@panels/BaseCanvas";
import { filter, tap, switchMap, takeUntil } from "rxjs/operators";
import { safeProp } from "@utils/index";

export interface DraggableCanvasOptions extends BaseCanvasOptions {
  draggable: boolean
}

export interface DraggableConvasMode extends BaseConvasMode {
  dragging?: boolean
}

export default class DraggableCanvas extends BaseCanvas {
  protected mode: DraggableConvasMode = {
    dragging: false
  }

  protected dragStartPoint?: Point
  protected dragShape?: Shape

  constructor(canvas: HTMLCanvasElement, options?: DraggableCanvasOptions) {
    super(canvas, Object.assign({}, options, {
      draggable: true,
      ...options
    }))
  }

  mount() {
    if (safeProp(this.options, 'draggable')) {
      const dragTask$ = this.mousedown$.pipe(
        filter(event => !this.mode.connecting),
        tap(event => this.startDrag(event)),
        switchMap(() => this.mousemove$.pipe(
          takeUntil(this.mouseup$.pipe(
            tap(event => this.endDrag(event))
          ))
        )),
        tap(event => this.drag(event))
      )

      this.registerTask(Symbol('drag'), dragTask$)
    }

    return super.mount()
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