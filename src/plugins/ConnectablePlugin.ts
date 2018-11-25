import BasePlugin, { BasePluginOptions } from "./BasePlugin";
import BaseCanvas from "@panels/BaseCanvas";
import { tap, filter, switchMap, takeUntil } from "rxjs/operators";
import Line from "@lines/Line";
import Shape from "@shapes/Shape";
import { isSameReference } from "@utils/index";
import StraightConnectionLine from "@lines/StraightConnectionLine";
import { Subscription } from "rxjs";

export interface ConnectablePluginOptions extends BasePluginOptions {

}

export default class ConnectablePlugin extends BasePlugin {
  id = 'connectable'

  connectionStartShape?: Shape
  connection?: Line

  connect$$?: Subscription

  constructor(options: ConnectablePluginOptions = {}) {
    super(options)
  }

  mount(panel: BaseCanvas) {
    this.connect$$ = panel.mousedown$.pipe(
      tap(event => {
        this.startConnect(event)
      }),
      filter(() => !!panel.mode.connecting),
      switchMap(() => panel.mousemove$.pipe(
        takeUntil(panel.mouseup$.pipe(
          tap(event => this.endConnect(event)))))),
      tap(event => this.connect(event))
    ).subscribe()

    super.mount(panel)
  }

  unmount(panel: BaseCanvas) {
    if (this.connect$$) this.connect$$.unsubscribe()

    super.mount(panel)
  }

  startConnect(event: MouseEvent): boolean {
    if (!this.panel) return false

    const shapeM = this.panel.selectShape(this.panel.relativeMousePoint)

    if (shapeM.isNone()) return false

    const shape = shapeM.some()

    if (shape.isSelectedBorder(this.panel.relativeMousePoint)) {
      this.connectionStartShape = shape

      const connectionStartPoint = shape.calcConnectionPoint(this.panel.relativeMousePoint)
      if (connectionStartPoint.isNone()) return false

      const startPoint = connectionStartPoint.some()

      this.connection = new StraightConnectionLine({
        startPoint,
        endPoint: startPoint,
        startShape: shape
      })

      shape.registerConnectionPoint(this.connection, startPoint)
      this.panel.registerElement(this.connection)

      this.panel.mode.connecting = true

      return true
    }

    return false
  }

  connect(event: MouseEvent) {
    if (!this.panel) return false

    if (this.connection) {
      this.connection.stretch(this.panel.relativeMousePoint)

      this.panel.draw$.next()
    }
  }

  endConnect(event: MouseEvent): boolean {
    if (!this.panel) return false

    let connected = false

    const shapeM = this.panel.selectShape(this.panel.relativeMousePoint)

    // 如果当前不是有效的连线状态 则 直接返回
    if (shapeM.isNone() || !this.connection) {
      return this.resetConnectionStatus(connected)
    }

    const shape = shapeM.some()

    const isSelectedBorder = shape.isSelectedBorder(this.panel.relativeMousePoint)
    const isNotStartShape = !isSameReference(this.connectionStartShape, shape)
    const connectionEndPoint = shape.calcConnectionPoint(this.panel.relativeMousePoint)

    // 当前鼠标指向某个图形
    // 且悬浮于图形的 border 上
    // 且连线的终点图形不为始点图形
    if (isSelectedBorder && isNotStartShape && connectionEndPoint.isSome()) {
      const endPoint = connectionEndPoint.some()

      // 当存在合法的 endShape 连接点时
      if (connectionEndPoint) {
        this.connection.update({
          endPoint,
          endShape: shape
        })

        shape.registerConnectionPoint(this.connection, endPoint)
        // 移除 hoverSlot
        shape.toggleHoverSlot()
        this.panel.draw$.next()

        connected = true
      }
    }

    return this.resetConnectionStatus(connected)
  }

  /**
   * @param connected - 当前连线是否成功
   * @return 最终的连线是否成功
   */
  private resetConnectionStatus(connected: boolean = false): boolean {
    if (!this.panel) return false

    if (!connected && this.connection && this.connectionStartShape) {
      this.connectionStartShape.unregisterConnectionPoint(this.connection)
      this.panel.removeConnection(this.connection)
    }

    this.connection = undefined
    this.connectionStartShape = undefined
    this.panel.mode.connecting = false

    return connected
  }
}