import Shape, { ShapeBaseOptions, BorderDirection } from "./Shape";
import { isInRectRange, isInTriRange } from "../utils/index";
import Line from "./Line";
import { LineOptions } from "./StraightLine";

export interface RectShapeOptions extends ShapeBaseOptions {
  startPoint: Point;
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

  protected startPoint: Point;

  protected get centerPoint(): Point {
    return {
      x: this.startPoint.x + this.width / 2,
      y: this.startPoint.y + this.height / 2
    }
  }

  protected get offsetStartPoint(): Point {
    return {
      x: this.startPoint.x - this.halfLineWidth,
      y: this.startPoint.y - this.halfLineWidth
    }
  }

  protected get contentStartPoint(): Point {
    return {
      x: this.startPoint.x + this.halfLineWidth,
      y: this.startPoint.y + this.halfLineWidth
    }
  }

  get topConnectionPoint(): Point {
    return { x: this.centerPoint.x, y: this.startPoint.y }
  }

  get rightConnectionPoint(): Point {
    return { x: this.startPoint.x + this.width, y: this.centerPoint.y }
  }

  get bottomConnectionPoint(): Point {
    return { x: this.centerPoint.x, y: this.startPoint.y + this.height }
  }

  get leftConnectionPoint(): Point {
    return { x: this.startPoint.x, y: this.centerPoint.y }
  }


  constructor(options: RectShapeOptions) {
    super(options)
    this.width = options.width
    this.offsetWidth = this.width + this.lineWidth
    this.contentWidth = this.width - this.lineWidth

    this.height = options.height
    this.offsetHeight = this.height + this.lineWidth
    this.contentHeight = this.height - this.lineWidth

    this.startPoint = options.startPoint
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawRectPath(ctx)
    this.fillColor(ctx)
  }

  move(mousePoint: Point): void {
    this.startPoint.x = mousePoint.x - this.offsetX
    this.startPoint.y = mousePoint.y - this.offsetY

    if (this.connections.size > 0) {
      this.connections.forEach((bd: BorderDirection, l: Line) => {
        const options: Partial<LineOptions> = {}

        if(l.head == this) options.startPoint = l.head.getConnectionPoint(bd)
        if(l.tail == this) options.endPoint = l.tail.getConnectionPoint(bd)

        l.update(options)
      })
    }
  }

  setOffset(mousePoint: Point): void {
    this.offsetX = mousePoint.x - this.startPoint.x
    this.offsetY = mousePoint.y - this.startPoint.y
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

  getConnectionPoint(borderDirection: BorderDirection): Nullable<Point> {
    switch (borderDirection) {
      case BorderDirection.TOP: return this.topConnectionPoint
      case BorderDirection.RIGHT: return this.rightConnectionPoint
      case BorderDirection.BOTTOM: return this.bottomConnectionPoint
      case BorderDirection.LEFT: return this.leftConnectionPoint
    }
  }

  getSelectedBorder(mousePoint: Point): Nullable<BorderDirection> {
    if (this.isSelectTopTri(mousePoint)) return BorderDirection.TOP
    if (this.isSelectRightTri(mousePoint)) return BorderDirection.RIGHT
    if (this.isSelectBottomTri(mousePoint)) return BorderDirection.BOTTOM
    if (this.isSelectLeftTri(mousePoint)) return BorderDirection.LEFT
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
    const startPoint = {
      x: this.offsetStartPoint.x + this.offsetWidth / 2,
      y: this.offsetStartPoint.y
    }

    return isInRectRange(mousePoint, startPoint, this.offsetWidth / 2, this.offsetHeight)
  }

  private isSelectBottomRect(mousePoint: Point): boolean {
    const startPoint = {
      x: this.offsetStartPoint.x,
      y: this.offsetStartPoint.y + this.offsetHeight / 2
    }

    return isInRectRange(mousePoint, startPoint, this.offsetWidth, this.offsetHeight / 2)
  }

  private isSelectLeftRect(mousePoint: Point): boolean {
    return isInRectRange(mousePoint, this.offsetStartPoint, this.offsetWidth / 2, this.offsetHeight)
  }

  private drawRectPath(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.rect(this.startPoint.x, this.startPoint.y, this.width, this.height)
  }
}