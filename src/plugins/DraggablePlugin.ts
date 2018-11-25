import Shape from "@shapes/Shape";
import { filter, tap, switchMap, takeUntil } from "rxjs/operators";
import { safeProp } from "@utils/index";
import BasePlugin, { BasePluginOptions } from "@plugins/BasePlugin";
import BaseCanvas from "@panels/BaseCanvas";
import { DraggableConvasMode } from "@panels/DraggableCanvas";
import { Subscription, combineLatest } from "rxjs";

export interface DraggablePluginOptions extends BasePluginOptions {
}

export default class DraggablePlugin extends BasePlugin {
  id = 'draggable'

  panel?: BaseCanvas
  dragStartPoint?: Point
  dragShape?: Shape

  drag$$?: Subscription

  constructor(options: DraggablePluginOptions = {}) {
    super(options)
  }

  mount(panel: BaseCanvas) {
    this.drag$$ = panel.mousedown$.pipe(
      filter(() => !panel.mode.connecting),
      tap(event => this.startDrag(event)),
      switchMap(() => panel.mousemove$.pipe(
        takeUntil(panel.mouseup$.pipe(
          tap(event => this.endDrag(event))
        ))
      )),
      tap(event => this.drag(event))
    ).subscribe()

    return super.mount(panel)
  }

  unmount(panel: BaseCanvas) {
    if (this.drag$$) this.drag$$.unsubscribe()

    super.mount(panel)
  }

  startDrag(event: MouseEvent): void {
    if (!this.panel) return

    const shapeM = this.panel.selectShape(this.panel.relativeMousePoint)

    if (shapeM.isNone()) return

    const shape = shapeM.some()

    if (shape.isSelectedContent(this.panel.relativeMousePoint)) {
      this.dragStartPoint = { x: this.panel.relativeMousePoint.x, y: this.panel.relativeMousePoint.y }
      this.dragShape = shape

      shape.setOffset(this.panel.relativeMousePoint)
      this.panel.changeMode<DraggableConvasMode>({
        dragging: true
      })
    }
  }

  drag(event: MouseEvent): void {
    if (!this.panel || !this.dragShape) return

    this.dragShape.move(this.panel.relativeMousePoint)
    this.panel.draw()
  }

  endDrag(event: MouseEvent): void {
    this.dragStartPoint = undefined
    this.dragShape = undefined

    if (this.panel) {
      this.panel.changeMode<DraggableConvasMode>({
        dragging: false
      })
    }
  }
}