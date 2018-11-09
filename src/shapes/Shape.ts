import Line from "@lines/Line";

export interface ShapeBaseOptions {
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
}

export default abstract class Shape implements Selectable, Connectable<Line, Shape> {
  protected offsetX: number = 0
  protected offsetY: number = 0
  protected fillStyle: string
  protected strokeStyle: string
  protected lineWidth: number
  protected halfLineWidth: number

  connections = new Map<Line, ConnectionPoint>()

  constructor(options: ShapeBaseOptions) {
    this.fillStyle = options.fillStyle || ''
    this.strokeStyle = options.strokeStyle || ''
    this.lineWidth = options.lineWidth || 2
    this.halfLineWidth = this.lineWidth / 2
  }

  abstract draw(ctx: CanvasRenderingContext2D, options?: ShapeBaseOptions): void
  abstract move(mousePoint: Point): void
  abstract highlight(ctx: CanvasRenderingContext2D): void
  abstract setOffset(mousePoint: Point): void
  abstract isSelected(mousePoint: Point): boolean
  abstract isSelectedContent(mousePoint: Point): boolean
  abstract isSelectedBorder(mousePoint: Point): boolean
  abstract calcConnectionPoint(borderDirection?: string): Nullable<ConnectionPoint>
  abstract getSelectedBorder(mousePoint: Point): Nullable<string>

  private fill(ctx: CanvasRenderingContext2D, options?: ShapeBaseOptions): Shape {
    if (options) {
      ctx.fillStyle = options.fillStyle || this.fillStyle
    } else {
      ctx.fillStyle = this.fillStyle
    }
    ctx.fill()

    return this
  }

  private stroke(ctx: CanvasRenderingContext2D, options?: ShapeBaseOptions): Shape {
    if (options) {
      ctx.lineWidth = options.lineWidth || this.lineWidth
      ctx.strokeStyle = options.strokeStyle || this.strokeStyle
    } else {
      ctx.lineWidth = this.lineWidth
      ctx.strokeStyle = this.strokeStyle
    }

    ctx.stroke()

    return this
  }

  redraw(ctx: CanvasRenderingContext2D, options?: ShapeBaseOptions){
    this.draw(ctx, options)

    this.connections.forEach((connection, line) => line.draw(ctx))
  }

  fillColor(ctx: CanvasRenderingContext2D, options?: ShapeBaseOptions): Shape {
    this.fill(ctx, options)
    this.stroke(ctx, options)

    return this
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

  getConnectionPoint(line: Line): Nullable<ConnectionPoint> {
    if (this.connections.has(line)) {
      return this.connections.get(line)
    }
  }

  syncConnectionPoint(connectionPoint: ConnectionPoint): ConnectionPoint {
    connectionPoint.x = connectionPoint.origin.x + connectionPoint.offsetX
    connectionPoint.y = connectionPoint.origin.y + connectionPoint.offsetY

    return connectionPoint
  }
}