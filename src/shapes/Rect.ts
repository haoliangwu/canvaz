import Shape, { ShapeBaseOptions } from "./Shape";
import { Point } from "../typings";

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
    return this.startPoint.x < mousePoint.x && mousePoint.x < (this.startPoint.x + this.width) && this.startPoint.y < mousePoint.y && mousePoint.y < (this.startPoint.y + this.height)
  }

  private drawRectPath(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.rect(this.startPoint.x, this.startPoint.y, this.width, this.height)
  }
}