import Shape, { ShapeBaseOptions } from "./Shape";
import { Point } from "../typings";
import { isInRectRange } from "../utils/index";

export interface RectShapeOptions extends ShapeBaseOptions {
  startPoint: Point;
  width: number;
  height: number;
}

export default class RectShape extends Shape {
  protected startPoint: Point;
  protected width: number;
  protected height: number;

  constructor(options: RectShapeOptions) {
    super(options)
    this.startPoint = options.startPoint
    this.width = options.width
    this.height = options.height
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawRectPath(ctx)
    this.fillColor(ctx)
  }

  move(ctx: CanvasRenderingContext2D, mousePoint: Point): void {
    this.startPoint.x = mousePoint.x - this.offsetX
    this.startPoint.y = mousePoint.y - this.offsetY

    this.draw(ctx)
  }

  setOffset(mousePoint: Point): void {
    this.offsetX = mousePoint.x - this.startPoint.x
    this.offsetY = mousePoint.y - this.startPoint.y
  }

  isSelected(mousePoint: Point): boolean {
    const halfLineWidth = this.lineWidth / 2
    const startPoint = {
      x: this.startPoint.x - halfLineWidth,
      y: this.startPoint.y - halfLineWidth
    }
    const width = this.width + this.lineWidth
    const height = this.height + this.lineWidth

    return isInRectRange(mousePoint, startPoint, width, height)
  }

  isSelectedContent(mousePoint: Point): boolean {
    const halfLineWidth = this.lineWidth / 2
    const startPoint = {
      x: this.startPoint.x + halfLineWidth,
      y: this.startPoint.y + halfLineWidth
    }
    const width = this.width - this.lineWidth
    const height = this.height - this.lineWidth

    return isInRectRange(mousePoint, startPoint, width, height)
  }

  isSelectedBorder(mousePoint: Point): boolean {
    return !this.isSelectedContent(mousePoint) && this.isSelected(mousePoint)
  }

  private drawRectPath(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.rect(this.startPoint.x, this.startPoint.y, this.width, this.height)
  }
}