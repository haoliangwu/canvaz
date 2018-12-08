import Shape, { ShapeBaseOptions } from "./Shape";
import { isInRectRange, isInTriRange } from "@utils/index";
import Line from "@lines/Line";
import { LineOptions } from "@lines/StraightLine";
import { Maybe, None } from "monet";
import CircleShape from "@shapes/Circle";

export enum RectBorderDirection {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}

export interface RectShapeOptions extends ShapeBaseOptions {
  originPoint: Point;
  width: number;
  height: number;
}

export default class RectShape extends Shape {
  protected width: number;
  protected offsetWidth: number;
  protected contentWidth: number;
  protected height: number;
  protected offsetHeight: number;
  protected contentHeight: number;

  protected originPoint: Point;

  protected get centerPoint(): Point {
    return {
      x: this.originPoint.x + this.width / 2,
      y: this.originPoint.y + this.height / 2
    }
  }

  protected get offsetStartPoint(): Point {
    return {
      x: this.originPoint.x - this.halfLineWidth,
      y: this.originPoint.y - this.halfLineWidth
    }
  }

  protected get contentStartPoint(): Point {
    return {
      x: this.originPoint.x + this.halfLineWidth,
      y: this.originPoint.y + this.halfLineWidth
    }
  }

  get topConnectionPoint(): Point {
    return { x: this.centerPoint.x, y: this.originPoint.y }
  }

  get rightConnectionPoint(): Point {
    return { x: this.originPoint.x + this.width, y: this.centerPoint.y }
  }

  get bottomConnectionPoint(): Point {
    return { x: this.centerPoint.x, y: this.originPoint.y + this.height }
  }

  get leftConnectionPoint(): Point {
    return { x: this.originPoint.x, y: this.centerPoint.y }
  }


  constructor(options: RectShapeOptions) {
    super(options)

    this.width = options.width
    this.offsetWidth = this.width + this.lineWidth
    this.contentWidth = this.width - this.lineWidth

    this.height = options.height
    this.offsetHeight = this.height + this.lineWidth
    this.contentHeight = this.height - this.lineWidth

    this.originPoint = {
      x: options.originPoint.x,
      y: options.originPoint.y
    }
  }

  draw(ctx: CanvasRenderingContext2D, options?: RectShapeOptions) {
    ctx.save()
    this.drawRectPath(ctx)
    this.fillColor(ctx, options)
    this.drawSlot(ctx, options)
    ctx.restore()
  }

  move(mousePoint: Point): void {
    this.originPoint.x = mousePoint.x - this.offsetX
    this.originPoint.y = mousePoint.y - this.offsetY

    if (this.connections.size > 0) {
      this.connections.forEach((cp: ConnectionPoint, l: Line) => {
        const options: Partial<LineOptions> = {}

        cp = this.syncConnectionPoint(cp)

        if (l.head == this) options.startPoint = cp
        if (l.tail == this) options.endPoint = cp

        l.update(options)
      })
    }
  }

  resize(mousePoint: Point) {
    const width = mousePoint.x - this.originPoint.x
    const height = mousePoint.y - this.originPoint.y

    this.width = width > 0 ? width: 0
    this.offsetWidth = this.width + this.lineWidth
    this.contentWidth = this.width - this.lineWidth

    this.height = height > 0 ? height : 0
    this.offsetHeight = this.height + this.lineWidth
    this.contentHeight = this.height - this.lineWidth
  }

  setOffset(mousePoint: Point): void {
    this.offsetX = mousePoint.x - this.originPoint.x
    this.offsetY = mousePoint.y - this.originPoint.y
  }

  isSelected(mousePoint: Point): boolean {
    return isInRectRange(mousePoint, this.offsetStartPoint, this.offsetWidth, this.offsetHeight)
  }

  isSelectedContent(mousePoint: Point): boolean {
    return isInRectRange(mousePoint, this.contentStartPoint, this.contentWidth, this.contentHeight)
  }

  isSelectedBorder(mousePoint: Point): boolean {
    return !this.isSelectedContent(mousePoint) && this.isSelected(mousePoint)
  }

  calcConnectionPoint(mousePoint: Point): Maybe<ConnectionPoint> {
    const borderDirectionM = this.getSelectedBorder(mousePoint)

    if (borderDirectionM.isNone()) return None()

    switch (borderDirectionM.some()) {
      case RectBorderDirection.TOP:
        return Maybe.of(this.connectionPointFactory(this.topConnectionPoint))
      case RectBorderDirection.RIGHT:
        return Maybe.of(this.connectionPointFactory(this.rightConnectionPoint))
      case RectBorderDirection.BOTTOM:
        return Maybe.of(this.connectionPointFactory(this.bottomConnectionPoint))
      case RectBorderDirection.LEFT:
        return Maybe.of(this.connectionPointFactory(this.leftConnectionPoint))
    }
  }

  calcHoverSlot(mousePoint: Point): Maybe<Shape> {
    const borderDirectionM = this.getSelectedBorder(mousePoint)

    if (borderDirectionM.isNone()) return None()

    const baseOptions = {
      radius: 4,
      lineWidth: 1,
      strokeStyle: this.hoverSlotOptions.strokeStyle,
      fillStyle: this.hoverSlotOptions.fillStyle,
    }
    let centerPoint: Point = { x: 0, y: 0 }

    switch (borderDirectionM.some()) {
      case RectBorderDirection.TOP:
        centerPoint.x = this.originPoint.x + this.width / 2
        centerPoint.y = this.originPoint.y
        break
      case RectBorderDirection.RIGHT:
        centerPoint.x = this.originPoint.x + this.width
        centerPoint.y = this.originPoint.y + this.height / 2
        break
      case RectBorderDirection.BOTTOM:
        centerPoint.x = this.originPoint.x + this.width / 2
        centerPoint.y = this.originPoint.y + this.height
        break
      case RectBorderDirection.LEFT:
        centerPoint.x = this.originPoint.x
        centerPoint.y = this.originPoint.y + this.height / 2
        break
      default:
        return None()
    }

    if (this.getConnection(centerPoint).isNone()) return Maybe.of(new CircleShape({
      ...baseOptions,
      centerPoint
    }))

    return None()
  }

  getSelectedBorder(mousePoint: Point): Maybe<RectBorderDirection> {
    if (this.isSelectTopTri(mousePoint)) return Maybe.of(RectBorderDirection.TOP)
    if (this.isSelectRightTri(mousePoint)) return Maybe.of(RectBorderDirection.RIGHT)
    if (this.isSelectBottomTri(mousePoint)) return Maybe.of(RectBorderDirection.BOTTOM)
    if (this.isSelectLeftTri(mousePoint)) return Maybe.of(RectBorderDirection.LEFT)

    return Maybe.None()
  }

  clone(): RectShape {
    return new RectShape(this.options as RectShapeOptions)
  }

  private connectionPointFactory(connectionPoint: Point): ConnectionPoint {
    return {
      origin: this.originPoint,
      offsetX: connectionPoint.x - this.originPoint.x,
      offsetY: connectionPoint.y - this.originPoint.y,
      ...connectionPoint,
    }
  }

  private isSelectTopTri(mousePoint: Point): boolean {
    const width = this.offsetWidth / 2
    const height = this.offsetHeight / 2
    const mp = {
      x: mousePoint.x - this.offsetStartPoint.x,
      y: mousePoint.y - this.offsetStartPoint.y
    }

    return isInTriRange(mp, width, height)
  }

  private isSelectRightTri(mousePoint: Point): boolean {
    const width = this.offsetHeight / 2
    const height = this.offsetWidth / 2
    const mp = {
      x: mousePoint.y - this.offsetStartPoint.y,
      y: this.offsetWidth - (mousePoint.x - this.offsetStartPoint.x)
    }

    return isInTriRange(mp, width, height)
  }

  private isSelectBottomTri(mousePoint: Point): boolean {
    const width = this.offsetWidth / 2
    const height = this.offsetHeight / 2
    const mp = {
      x: mousePoint.x - this.offsetStartPoint.x,
      y: this.offsetHeight - (mousePoint.y - this.offsetStartPoint.y)
    }

    return isInTriRange(mp, width, height)
  }

  private isSelectLeftTri(mousePoint: Point): boolean {
    const width = this.offsetHeight / 2
    const height = this.offsetWidth / 2
    const mp = {
      x: this.offsetHeight - (mousePoint.y - this.offsetStartPoint.y),
      y: mousePoint.x - this.offsetStartPoint.x
    }

    return isInTriRange(mp, width, height)
  }

  private isSelectTopRect(mousePoint: Point): boolean {
    return isInRectRange(mousePoint, this.offsetStartPoint, this.offsetWidth, this.offsetHeight / 2)
  }

  private isSelectRightRect(mousePoint: Point): boolean {
    const originPoint = {
      x: this.offsetStartPoint.x + this.offsetWidth / 2,
      y: this.offsetStartPoint.y
    }

    return isInRectRange(mousePoint, originPoint, this.offsetWidth / 2, this.offsetHeight)
  }

  private isSelectBottomRect(mousePoint: Point): boolean {
    const originPoint = {
      x: this.offsetStartPoint.x,
      y: this.offsetStartPoint.y + this.offsetHeight / 2
    }

    return isInRectRange(mousePoint, originPoint, this.offsetWidth, this.offsetHeight / 2)
  }

  private isSelectLeftRect(mousePoint: Point): boolean {
    return isInRectRange(mousePoint, this.offsetStartPoint, this.offsetWidth / 2, this.offsetHeight)
  }

  private drawRectPath(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.setLineDash(this.dashSegments)
    ctx.rect(this.originPoint.x, this.originPoint.y, this.width, this.height)
  }

  private drawSlot(ctx: CanvasRenderingContext2D, options?: RectShapeOptions) {
    if (this.hoverSlot) {
      this.hoverSlot.draw(ctx, options)
    }
  }
}