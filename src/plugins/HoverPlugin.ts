import BasePlugin, { BasePluginOptions } from "@plugins/BasePlugin";
import BaseCanvas from "@panels/BaseCanvas";
import Shape from "@shapes/Shape";
import { isSameReference } from "@utils/index";
import { Maybe } from "monet";
import { partition, map, tap } from "rxjs/operators";
import { Subscription, merge } from "rxjs";

export interface HoverPluginOptions extends BasePluginOptions {

}

export default class HoverPlugin extends BasePlugin {
  id = 'hover'

  hoveredShape?: Shape
  hover$$?: Subscription

  constructor(options: HoverPluginOptions = {}) {
    super(options)
  }

  mount(panel: BaseCanvas) {
    const hoverMaybeShape$ = panel.mousemove$.pipe(
      map(event => panel.selectShape(panel.relativeMousePoint)), )
    const [hoverShape$, hoverCanvas$] = partition<Maybe<Shape>>(shapeM => shapeM.isSome())(hoverMaybeShape$)

    const hoverShapeTask$ = hoverShape$.pipe(
      map(shapeM => shapeM.some()),
      tap(this.hoverShape.bind(this)))

    const hoverCanvasTask$ = hoverCanvas$.pipe(
      tap(this.hoverCanvas.bind(this)))

    this.hover$$ = merge(hoverShapeTask$, hoverCanvasTask$).subscribe()

    super.mount(panel)
  }

  unmount(panel: BaseCanvas) {
    if(this.hover$$) this.hover$$.unsubscribe()

    super.unmount(panel)
  }

  hoverCanvas(): void {
    if (!this.panel) return

    if (this.hoveredShape) {
      this.hoveredShape.cancelHighlight()
      this.hoveredShape.toggleHoverSlot(this.panel.relativeMousePoint)
      this.hoveredShape = undefined
      this.panel.draw$.next()
    }
  }

  hoverShape(shape: Shape): void {
    if (!this.panel) return

    // 如果 hover 图形和上次 hover 图形不一致
    if (this.hoveredShape && !isSameReference(shape, this.hoveredShape)) {
      this.hoveredShape.cancelHighlight()
    }

    this.hoveredShape = shape
    this.hoveredShape.highlight()
    this.hoveredShape.toggleHoverSlot(this.panel.relativeMousePoint)
    this.panel.draw$.next()
  }
}