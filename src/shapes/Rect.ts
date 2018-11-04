import Shape, { ShapeBaseOptions } from "./Shape";
import { Point, Nullable } from "../typings";
import { isInRectRange, isInTriRange } from "../utils/index";

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
    return isInRectRange(mousePoint, this.offsetStartPoint, this.offsetWidth, this.offsetHeight)
  }

  isSelectedContent(mousePoint: Point): boolean {
    return isInRectRange(mousePoint, this.contentStartPoint, this.contentWidth, this.contentHeight)
  }

  isSelectedBorder(mousePoint: Point): boolean {
    return !this.isSelectedContent(mousePoint) && this.isSelected(mousePoint)
  }

  getConnectionPoint(mousePoint: Point): Nullable<Point> {
    const borderDirection = this.getSelectedBorder(mousePoint)
    let connectionPoint: Nullable<Point> = undefined

    switch (borderDirection) {
      case 'top':
        connectionPoint = {
          x: this.centerPoint.x,
          y: this.startPoint.y
        }
        break
      case 'right':
        connectionPoint = {
          x: this.startPoint.x + this.width,
          y: this.centerPoint.y
        }
        break
      case 'bottom':
        connectionPoint = {
          x: this.centerPoint.x,
          y: this.startPoint.y + this.height
        }
        break
      case 'left':
        connectionPoint = {
          x: this.startPoint.x,
          y: this.centerPoint.y
        }
        break
    }

    return connectionPoint
  }

  private getSelectedBorder(mousePoint: Point): string {
    if (this.isSelectTopTri(mousePoint)) return 'top'
    if (this.isSelectRightTri(mousePoint)) return 'right'
    if (this.isSelectBottomTri(mousePoint)) return 'bottom'
    if (this.isSelectLeftTri(mousePoint)) return 'left'
    return 'none'
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