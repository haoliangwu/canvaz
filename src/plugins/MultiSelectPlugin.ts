import BasePlugin, { BasePluginOptions } from "@plugins/BasePlugin";
import BaseCanvas from "@panels/internal/BaseCanvas";
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

    this.panel.shadow.toggle(true)
    this.multiSelectMask.move(this.panel.relativeMousePoint)
  }

  protected multiSelect(event: MouseEvent) {
    if (!this.panel) return false

    const { relativeMousePoint, shadow } = this.panel

    shadow.clear()
    this.multiSelectMask.resize(relativeMousePoint)
    this.multiSelectMask.draw(shadow.ctx)
  }

  protected endMultiSelect(event: MouseEvent) {
    if (!this.panel) return false

    this.panel.shadow.toggle(false)
    this.panel.shadow.clear()
  }
}