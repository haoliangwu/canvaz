import Line, { LineBaseOptions } from "./Line";
import { isInRectRange, calcDistanceBetweenPoints } from "@utils/index";
import Shape from "@shapes/Shape";

export interface LineOptions extends LineBaseOptions {
}

export default class StraightLine extends Line {
  startPoint: Point;
  endPoint: Point;
  
  constructor(options: LineOptions) {
    super(options)
    this.startPoint = options.startPoint
    this.endPoint = options.endPoint
    this.startShape = options.startShape
    this.endShape = options.endShape
  }

  update(options: Partial<LineOptions>) {
    super.update(options)

    this.startPoint = options.startPoint || this.startPoint
    this.endPoint = options.endPoint || this.endPoint
    this.startShape = options.startShape || this.startShape
    this.endShape = options.endShape || this.endShape
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.beginPath()
    ctx.lineWidth = this.lineWidth
    ctx.lineCap = this.lineCap
    ctx.strokeStyle = this.strokeStyle
    ctx.moveTo(this.startPoint.x, this.startPoint.y)
    ctx.lineTo(this.endPoint.x, this.endPoint.y)
    ctx.stroke()
    ctx.restore()
  }

  stretch(mousePoint: Point): void {
    this.endPoint = mousePoint
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