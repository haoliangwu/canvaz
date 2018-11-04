import Shape, { ShapeBaseOptions } from "./Shape";
import { Point } from "../typings";
import { isInRectRange } from "../utils/index";

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

  getSelectedBorder(mousePoint: Point): string {
    console.log(this.isSelectTopPanel(mousePoint))
    return 'none'
  }

  private isSelectTopPanel(mousePoint: Point) {
    // return isInRectRange(mousePoint)
  }

  private isSelectRightPanel(mousePoint: Point) {

  }

  private isSelectBottomPanel(mousePoint: Point) {

  }

  private isSelectLeftPanel(mousePoint: Point) {

  }

  private drawRectPath(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.rect(this.startPoint.x, this.startPoint.y, this.width, this.height)
  }
}