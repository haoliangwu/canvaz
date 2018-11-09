import Shape, { ShapeBaseOptions } from "./Shape";
import { isInRectRange, isInTriRange } from "@utils/index";
import Line from "@lines/Line";
import { LineOptions } from "@lines/StraightLine";

export enum RectBorderDirection {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}

export interface RectShapeOptions extends ShapeBaseOptions {
  startPoint: Point;
  width: number;
  height: number;
  highlightBackground?: string
  highlightBorder?: string
}

export default class RectShape extends Shape {
  protected width: number;
  protected offsetWidth: number;
  protected contentWidth: number;
  protected height: number;
  protected offsetHeight: number;
  protected contentHeight: number;

  protected startPoint: Point;

  protected highlightBackground: string
  protected highlightBorder: string

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

    this.highlightBackground = options.highlightBackground || this.fillStyle
    this.highlightBorder = options.highlightBorder || this.strokeStyle
  }

  draw(ctx: CanvasRenderingContext2D, options?: ShapeBaseOptions) {
    ctx.save()
    this.drawRectPath(ctx)
    this.fillColor(ctx, options)
    ctx.restore()
  }

  move(mousePoint: Point): void {
    this.startPoint.x = mousePoint.x - this.offsetX
    this.startPoint.y = mousePoint.y - this.offsetY

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

  highlight(ctx: CanvasRenderingContext2D): void {
    this.redraw(ctx, {
      fillStyle: this.highlightBackground,
      strokeStyle: this.highlightBorder
    })
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

  calcConnectionPoint(borderDirection: string): Nullable<ConnectionPoint> {
    switch (borderDirection) {
      case RectBorderDirection.TOP:
        return this.connectionPointFactory(this.topConnectionPoint)
      case RectBorderDirection.RIGHT:
        return this.connectionPointFactory(this.rightConnectionPoint)
      case RectBorderDirection.BOTTOM:
        return this.connectionPointFactory(this.bottomConnectionPoint)
      case RectBorderDirection.LEFT:
        return this.connectionPointFactory(this.leftConnectionPoint)
    }
  }

  getSelectedBorder(mousePoint: Point): Nullable<RectBorderDirection> {
    if (this.isSelectTopTri(mousePoint)) return RectBorderDirection.TOP
    if (this.isSelectRightTri(mousePoint)) return RectBorderDirection.RIGHT
    if (this.isSelectBottomTri(mousePoint)) return RectBorderDirection.BOTTOM
    if (this.isSelectLeftTri(mousePoint)) return RectBorderDirection.LEFT
  }

  private connectionPointFactory(connectionPoint: Point): ConnectionPoint {
    return {
      origin: this.startPoint,
      offsetX: connectionPoint.x - this.startPoint.x,
      offsetY: connectionPoint.y - this.startPoint.y,
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