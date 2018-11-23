import Shape from "@shapes/Shape";
import BaseCanvas, { BaseCanvasOptions, BaseConvasMode } from "@panels/BaseCanvas";
import { filter, tap, switchMap, takeUntil } from "rxjs/operators";
import { isSameReference } from "@utils/index";

export interface ShapePickerCanvasOptions extends BaseCanvasOptions { }

export interface ShapePickerConvasMode extends BaseConvasMode {
  picking: boolean;
}

export default class ShapePickerCanvas extends BaseCanvas {
  protected mode: ShapePickerConvasMode = {
    picking: false
  }

  protected mirrorShape?: Shape

  constructor(canvas: HTMLCanvasElement, options: ShapePickerCanvasOptions = {}) {
    super(canvas, Object.assign({}, options, {
      hover: false,
      connectable: false,
      ...options
    }))
  }

  draw(){
    super.draw()

    if(this.mirrorShape) this.mirrorShape.draw(this.ctx)
  }

  mount() {
    const pickTask$ = this.mousedown$.pipe(
      tap(event => this.startDrag(event)),
      switchMap(() => this.mousemove$.pipe(
        takeUntil(this.mouseup$.pipe(
          tap(event => this.endDrag(event))
        ))
      )),
      tap(event => this.drag(event))
    )

    this.registerTask(Symbol('pick'), pickTask$)

    return super.mount()
  }

  protected onEnd(event: MouseEvent) { 
    this.endDrag(event)
  }

  protected startDrag(event: MouseEvent): void {
    const shapeM = this.selectShape(this.relativeMousePoint)

    if (shapeM.isNone()) return

    const shape = shapeM.some()

    if (shape.isSelectedContent(this.relativeMousePoint)) {
      this.mirrorShape = shape.clone()

      this.mirrorShape.setOffset(this.relativeMousePoint)
      this.mode.picking = true
    }
  }

  protected drag(event: MouseEvent): void {
    if (!this.mirrorShape) return

    this.mirrorShape.move(this.relativeMousePoint)
    this.draw()
  }

  protected endDrag(event: MouseEvent): void {
    this.mirrorShape = undefined
    this.mode.picking = false

    this.draw()
  }
}