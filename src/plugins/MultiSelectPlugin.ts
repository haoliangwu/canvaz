import BasePlugin, { BasePluginOptions } from "@plugins/BasePlugin";
import { Subscription } from "rxjs";
import { delay, filter, tap, switchMap, takeUntil } from "rxjs/operators";
import RectShape from "@shapes/Rect";
import { clonePoint } from "@utils/index";
import DraggableCanvas from "@panels/DraggableCanvas";
import Shape from "@shapes/Shape";

export interface MultiSelectPluginOptions extends BasePluginOptions {
}

export default class MultiSelectPlugin extends BasePlugin {
  id = 'multi-select'

  panel?: DraggableCanvas

  multiDragShapes: Shape[] = []

  rangeStartPoint?: Point
  rangeEndPoint?: Point
  multiSelect$$?: Subscription
  multiSelectMask: RectShape = new RectShape({
    width: 0,
    height: 0,
    fillStyle: 'rgba(255, 255, 255, .7)',
    dashSegments: [10, 10],
    originPoint: { x: 0, y: 0 }
  })

  constructor(options: MultiSelectPluginOptions = {}) {
    super(options)
  }

  mount(panel: DraggableCanvas) {
    if (panel instanceof DraggableCanvas) {
      const multiSelect$ = panel.selectShape$.pipe(
        filter(([shapeM]) => shapeM.isNone()),
        tap(([shapeM, event]) => this.startMultiSelect(event)),
        switchMap(() => panel.mousemove$.pipe(
          takeUntil(panel.mouseup$.pipe(
            tap(event => this.endMultiSelect(event))
          ))
        )),
        tap(event => this.multiSelect(event))
      )

      this.multiSelect$$ = multiSelect$.subscribe()

      super.mount(panel)
    } else {
      console.error('MultiSelectPlugin 只能被注册至 DraggableCanvas 容器中')
    }
  }

  unmount(panel: DraggableCanvas) {
    this.rangeStartPoint = undefined
    this.rangeEndPoint = undefined
    if (this.multiSelect$$) this.multiSelect$$.unsubscribe()

    super.unmount(panel)
  }

  protected startMultiSelect(event: MouseEvent) {
    if (!this.panel) return false

    this.panel.shadow.toggle(true)

    this.rangeStartPoint = clonePoint(this.panel.relativeMousePoint)

    this.multiSelectMask.move(this.rangeStartPoint)
  }

  protected multiSelect(event: MouseEvent) {
    if (!this.panel) return false

    const { relativeMousePoint, shadow } = this.panel

    shadow.clear()
    this.multiSelectMask.resize(relativeMousePoint)
    this.multiSelectMask.draw(shadow.ctx)
  }

  protected endMultiSelect(event: MouseEvent) {
    if (!this.panel || !this.rangeStartPoint) return false

    this.panel.shadow.toggle(false)
    this.panel.shadow.clear()


    this.rangeEndPoint = clonePoint(this.panel.relativeMousePoint)

    this.panel.toggleMultiDrag(this.rangeStartPoint, this.rangeEndPoint)
  }
}