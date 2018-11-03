import { Point } from "../typings";

export interface ShapeBaseOptions {
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number
}

export default abstract class Shape {
  protected offsetX: number = 0
  protected offsetY: number = 0
  protected fillStyle: string
  protected strokeStyle: string
  protected lineWidth: number

  constructor(options: ShapeBaseOptions) {
    this.fillStyle = options.fillStyle || ''
    this.strokeStyle = options.strokeStyle || ''
    this.lineWidth = options.lineWidth || 1
  }

  abstract draw(ctx: CanvasRenderingContext2D): void
  abstract move(ctx: CanvasRenderingContext2D, mousePoint: Point): void
  abstract setOffset(mousePoint: Point): void
  abstract isSelected(mousePoint: Point): boolean

  private fill(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.fillStyle
    ctx.fill()
  }

  private stroke(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = this.lineWidth
    ctx.strokeStyle = this.strokeStyle
    ctx.stroke()
  }

  fillColor(ctx: CanvasRenderingContext2D): void {
    this.fill(ctx)
    this.stroke(ctx)
  }

  
}