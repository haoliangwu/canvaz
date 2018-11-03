import Line, { LineBaseOptions } from "./Line";
import { Point } from "../typings";
import { isInRectRange, calcDistanceBetweenPoints } from "../utils/index";

export interface LineOptions extends LineBaseOptions {
  startPoint: Point;
  endPoint: Point;
}

export default class StraightLine extends Line {
  protected startPoint: Point;
  protected endPoint: Point;
  
  constructor(options: LineOptions) {
    super(options)
    this.startPoint = options.startPoint
    this.endPoint = options.endPoint
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath()
    ctx.moveTo(this.startPoint.x, this.startPoint.y)
    ctx.lineTo(this.endPoint.x, this.endPoint.y)
    ctx.stroke()
  }

  isSelected(mousePoint: Point): boolean {
    const halfWidth = this.lineWidth / 2
    const startPoint = {
      x: this.startPoint.x - halfWidth,
      y: this.startPoint.y - halfWidth
    }
    const width = calcDistanceBetweenPoints(this.startPoint, this.endPoint)
    const height = this.lineWidth

    return isInRectRange(mousePoint, startPoint, width, height)
  }
}