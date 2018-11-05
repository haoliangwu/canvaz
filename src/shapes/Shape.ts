import Line from "@lines/Line";

export interface ShapeBaseOptions {
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
}

export interface Selectable {
  isSelected(mousePoint: Point): boolean
}

export interface Connectable {
  connections: Map<Line, string>
  registerConnection(line: Line, borderDirection: string): Shape
}

export default abstract class Shape implements Selectable, Connectable {
  protected offsetX: number = 0
  protected offsetY: number = 0
  protected fillStyle: string
  protected strokeStyle: string
  protected lineWidth: number
  protected halfLineWidth: number

  connections = new Map<Line, string>()

  constructor(options: ShapeBaseOptions) {
    this.fillStyle = options.fillStyle || ''
    this.strokeStyle = options.strokeStyle || ''
    this.lineWidth = options.lineWidth || 2
    this.halfLineWidth = this.lineWidth / 2
  }

  abstract draw(ctx: CanvasRenderingContext2D): void
  abstract move(mousePoint: Point): void
  abstract setOffset(mousePoint: Point): void
  abstract isSelected(mousePoint: Point): boolean
  abstract isSelectedContent(mousePoint: Point): boolean
  abstract isSelectedBorder(mousePoint: Point): boolean
  abstract getConnectionPoint(borderDirection: string): Nullable<Point>
  abstract getSelectedBorder(mousePoint: Point): Nullable<string>

  private fill(ctx: CanvasRenderingContext2D): Shape {
    ctx.fillStyle = this.fillStyle
    ctx.fill()

    return this
  }

  private stroke(ctx: CanvasRenderingContext2D): Shape {
    ctx.lineWidth = this.lineWidth
    ctx.strokeStyle = this.strokeStyle
    ctx.stroke()

    return this
  }

  fillColor(ctx: CanvasRenderingContext2D): Shape {
    this.fill(ctx)
    this.stroke(ctx)

    return this
  }

  registerConnection(line: Line, borderDirection: string): Shape {
    if(!this.connections.has(line)) {
      this.connections.set(line, borderDirection)
    }
    return this
  }
}