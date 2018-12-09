import Line from "@lines/Line";
import { Maybe, None, Some } from "monet";
import { isSamePoint } from "@utils/index";

export interface ShapeBaseOptions {
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
  dashSegments?: number[];
  highlight?: {
    fillStyle?: string
    strokeStyle?: string
  };
  hoverSlot?: {
    fillStyle?: string
    strokeStyle?: string
  }
}

export interface ShapeBaseMode {
  highlighted: boolean
}

export interface Selectable {
  isSelected(mousePoint: Point): boolean
}

export interface Connectable<L, S> {
  connections: Map<L, ConnectionPoint>
  registerConnectionPoint(line: L, connectionPoint: ConnectionPoint): S
  unregisterConnectionPoint(line: L): S
  getConnectionPoint(line: L): Maybe<ConnectionPoint>
  getConnection(mousePoint: Point): Maybe<L>
}

export default abstract class Shape implements Selectable, Connectable<Line, Shape> {
  protected mode: ShapeBaseMode = {
    highlighted: false
  }

  protected offsetX: number = 0
  protected offsetY: number = 0
  protected fillStyle: string
  protected strokeStyle: string
  protected dashSegments: number[] = []
  protected lineWidth: number
  protected halfLineWidth: number

  protected options: ShapeBaseOptions = {}

  protected hoverSlot?: Shape

  connections = new Map<Line, ConnectionPoint>()

  get highlightOptions() {
    if (this.options && this.options.highlight) {
      return {
        fillStyle: this.options.highlight.fillStyle || this.fillStyle,
        strokeStyle: this.options.highlight.strokeStyle || this.strokeStyle
      }
    }

    return {
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
    }
  }

  get hoverSlotOptions() {
    if (this.options && this.options.hoverSlot) {
      return {
        fillStyle: this.options.hoverSlot.fillStyle || this.fillStyle,
        strokeStyle: this.options.hoverSlot.strokeStyle || this.strokeStyle
      }
    }

    return {
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
    }
  }

  constructor(options: ShapeBaseOptions) {
    this.options = Object.assign(this.options, options)

    this.fillStyle = options.fillStyle || ''
    this.strokeStyle = options.strokeStyle || ''
    this.dashSegments = options.dashSegments || []
    this.lineWidth = options.lineWidth || 2
    this.halfLineWidth = this.lineWidth / 2
  }

  abstract draw(ctx: CanvasRenderingContext2D, options?: ShapeBaseOptions): void
  abstract move(mousePoint: Point): void
  abstract setOffsetByMousePoint(mousePoint: Point): void
  abstract setOffsetByRelativePoint(relativePoint: Point): void
  abstract isSelected(mousePoint: Point): boolean
  abstract isSelectedContent(mousePoint: Point): boolean
  abstract isSelectedBorder(mousePoint: Point): boolean
  abstract isInMultiSelectRange(startPoint: Point, endPoint: Point): boolean
  abstract calcConnectionPoint(mousePoint: Point): Maybe<ConnectionPoint>
  abstract calcHoverSlot(mousePoint: Point): Maybe<Shape>
  abstract getSelectedBorder(mousePoint: Point): Maybe<string>
  abstract clone(): Shape

  update(options: Partial<ShapeBaseOptions>): void {
    this.fillStyle = options.fillStyle || this.fillStyle
    this.strokeStyle = options.strokeStyle || this.strokeStyle
    this.lineWidth = options.lineWidth || this.lineWidth
    this.halfLineWidth = this.lineWidth / 2
  }

  highlight(): void {
    this.mode.highlighted = true
  }

  cancelHighlight(): void {
    this.mode.highlighted = false
  }

  restoreMode(mode?: Partial<ShapeBaseMode>) {
    this.mode = Object.assign(this.mode, {
      highlighted: false
    }, mode)
  }

  redraw(ctx: CanvasRenderingContext2D, options?: ShapeBaseOptions) {
    this.draw(ctx, options)

    this.connections.forEach((connection, line) => line.draw(ctx))
  }

  fillColor(ctx: CanvasRenderingContext2D, options?: ShapeBaseOptions): Shape {
    return this.fillContentColor(ctx, options).fillBorderColor(ctx, options)
  }

  fillBorderColor(ctx: CanvasRenderingContext2D, options?: ShapeBaseOptions): Shape {
    return this.stroke(ctx, options)
  }

  fillContentColor(ctx: CanvasRenderingContext2D, options?: ShapeBaseOptions): Shape {
    return this.fill(ctx, options)
  }

  registerConnectionPoint(line: Line, connectionPoint: ConnectionPoint): Shape {
    if (!this.connections.has(line)) {
      this.connections.set(line, connectionPoint)
    }
    return this
  }

  unregisterConnectionPoint(line: Line): Shape {
    if (this.connections.has(line)) {
      this.connections.delete(line)
    }

    return this
  }

  getConnectionPoint(line: Line): Maybe<ConnectionPoint> {
    if (this.connections.has(line)) {
      return Maybe.fromNull(this.connections.get(line) as ConnectionPoint)
    }

    return None()
  }

  getConnection(mousePoint: Point): Maybe<Line> {
    for(let [line, cp] of this.connections.entries()) {
      if(isSamePoint(mousePoint, cp)) return Some(line)
    }

    return None()
  }

  syncConnectionPoint(connectionPoint: ConnectionPoint): ConnectionPoint {
    connectionPoint.x = connectionPoint.origin.x + connectionPoint.offsetX
    connectionPoint.y = connectionPoint.origin.y + connectionPoint.offsetY

    return connectionPoint
  }

  /**
   * 根据 mousePoint 位置显示 hoverSlot
   */
  toggleHoverSlot(mousePoint?: Point) {
    if(mousePoint && this.isSelectedBorder(mousePoint)) {
      const slot = this.calcHoverSlot(mousePoint)
      if (slot.isSome()) this.hoverSlot = slot.some()
    } else {
      this.hoverSlot = undefined
    }
  }

  private fill(ctx: CanvasRenderingContext2D, options?: ShapeBaseOptions): Shape {
    if (this.mode.highlighted) {
      if (options && options.highlight) {
        ctx.fillStyle = options.highlight.fillStyle || this.highlightOptions.fillStyle || this.fillStyle
      } else {
        ctx.fillStyle = this.highlightOptions.fillStyle || this.fillStyle
      }
    } else {
      if (options) {
        ctx.fillStyle = options.fillStyle || this.fillStyle
      } else {
        ctx.fillStyle = this.fillStyle
      }
    }
    ctx.fill()

    return this
  }

  private stroke(ctx: CanvasRenderingContext2D, options?: ShapeBaseOptions): Shape {
    if (options) {
      ctx.lineWidth = options.lineWidth || this.lineWidth
    } else {
      ctx.lineWidth = this.lineWidth
    }

    if (this.mode.highlighted) {
      if (options && options.highlight) {
        ctx.strokeStyle = options.highlight.strokeStyle || this.highlightOptions.strokeStyle || this.strokeStyle
      } else {
        ctx.strokeStyle = this.highlightOptions.strokeStyle || this.strokeStyle
      }
    } else {
      if (options) {
        ctx.strokeStyle = options.strokeStyle || this.strokeStyle
      } else {
        ctx.strokeStyle = this.strokeStyle
      }
    }

    ctx.stroke()

    return this
  }
}