import BasePlugin, { BasePluginOptions } from "@plugins/BasePlugin";
import BaseCanvas from "@panels/BaseCanvas";
import { Subscription } from "rxjs";
import { delay, filter, tap, switchMap, takeUntil } from "rxjs/operators";
import RectShape from "@shapes/Rect";

export interface MultiSelectPluginOptions extends BasePluginOptions {
}

export default class MultiSelectPlugin extends BasePlugin {
  id = 'multi-select'

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

  mount(panel: BaseCanvas) {
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
  }

  unmount(panel: BaseCanvas) {
    super.unmount(panel)
  }

  protected startMultiSelect(event: MouseEvent) {
    if (!this.panel) return false

    this.multiSelectMask.move(this.panel.relativeMousePoint)
  }

  protected multiSelect(event: MouseEvent) {
    if (!this.panel) return false

    // TODO 这里应该使用独立的 canvas 来绘制 multiselect-mask
    this.panel.draw()
    this.multiSelectMask.resize(this.panel.relativeMousePoint)
    this.multiSelectMask.draw(this.panel.ctx)
  }

  protected endMultiSelect(event: MouseEvent) {
    if (!this.panel) return false

    this.panel.draw()
  }
}