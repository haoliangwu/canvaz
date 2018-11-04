import { Point, Selectable } from "../typings";

export interface ShapeBaseOptions {
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
}

export default abstract class Shape implements Selectable {
  protected offsetX: number = 0
  protected offsetY: number = 0
  protected fillStyle: string
  protected strokeStyle: string
  protected lineWidth: number
  protected halfLineWidth: number

  constructor(options: ShapeBaseOptions) {
    this.fillStyle = options.fillStyle || ''
    this.strokeStyle = options.strokeStyle || ''
    this.lineWidth = options.lineWidth || 2
    this.halfLineWidth = this.lineWidth / 2
  }

  abstract draw(ctx: CanvasRenderingContext2D): void
  abstract move(ctx: CanvasRenderingContext2D, mousePoint: Point): void
  abstract setOffset(mousePoint: Point): void
  abstract isSelected(mousePoint: Point): boolean
  abstract isSelectedContent(mousePoint: Point): boolean
  abstract isSelectedBorder(mousePoint: Point): boolean
  abstract getSelectedBorder(mousePoint: Point): string

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