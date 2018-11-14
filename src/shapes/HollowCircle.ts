import CircleShape, { CircleShapeOptions } from "@shapes/Circle";
import { isInCircleRange } from "@utils/index";
import { LineOptions } from "@lines/StraightLine";
import Line from "@lines/Line";

export interface HollowCircleShapeOptions extends CircleShapeOptions {
}

export default class HollowCircleShape extends CircleShape {
  protected radius: number;
  protected centerPoint: Point;

  constructor(options: HollowCircleShapeOptions) {
    super(options)

    this.radius = options.radius
    this.centerPoint = options.centerPoint
  }

  draw(ctx: CanvasRenderingContext2D, options?: HollowCircleShapeOptions | undefined): void {
    ctx.save()
    this.drawCircelPath(ctx)
    this.fillBorderColor(ctx, options)
    ctx.restore()
  }
}