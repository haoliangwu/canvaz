import Shape, { ShapeBaseOptions } from "@shapes/Shape";
import { isInCircleRange } from "@utils/index";
import { LineOptions } from "@lines/StraightLine";
import Line from "@lines/Line";
import { Maybe } from "monet";

export interface CircleShapeOptions extends ShapeBaseOptions {
  radius: number;
  centerPoint: Point;
}

export default class CircleShape extends Shape {
  protected radius: number;
  protected centerPoint: Point;

  constructor(options: CircleShapeOptions) {
    super(options)

    this.radius = options.radius
    this.centerPoint = options.centerPoint
  }

  draw(ctx: CanvasRenderingContext2D, options?: CircleShapeOptions | undefined): void {
    ctx.save()
    this.drawCircelPath(ctx)
    this.fillColor(ctx, options)
    ctx.restore()
  }

  move(mousePoint: Point): void {
    this.centerPoint.x = mousePoint.x - this.offsetX
    this.centerPoint.y = mousePoint.y - this.offsetY

    if (this.connections.size > 0) {
      this.connections.forEach((cp: ConnectionPoint, l: Line) => {
        const options: Partial<LineOptions> = {}

        cp = this.syncConnectionPoint(cp)

        if(l.head == this) options.startPoint = cp
        if(l.tail == this) options.endPoint = cp

        l.update(options)
      })
    }
  }

  setOffset(mousePoint: Point): void {
    this.offsetX = mousePoint.x - this.centerPoint.x
    this.offsetY = mousePoint.y - this.centerPoint.y
  }

  isSelected(mousePoint: Point): boolean {
    return isInCircleRange(mousePoint, this.centerPoint, this.radius + this.halfLineWidth)
  }

  isSelectedContent(mousePoint: Point): boolean {
    return isInCircleRange(mousePoint, this.centerPoint, this.radius - this.halfLineWidth)
  }

  isSelectedBorder(mousePoint: Point): boolean {
    return !this.isSelectedContent(mousePoint) && this.isSelected(mousePoint)
  }

  calcConnectionPoint(mousePoint: Point): Maybe<ConnectionPoint> {
    // TODO
    return Maybe.None()
  }

  getSelectedBorder(mousePoint: Point): Maybe<string> {
    // TODO
    return Maybe.None()
  }

  protected drawCircelPath(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.arc(this.centerPoint.x, this.centerPoint.y, this.radius, 0, 2 * Math.PI, false)
  }
}