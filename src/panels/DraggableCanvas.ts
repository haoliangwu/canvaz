import Shape from "@shapes/Shape";
import Line from "@lines/Line";
import StraightLine from "@lines/StraightLine";
import { arrayRemove, isSameReference } from "@utils/index";
import BaseCanvas, { BaseCanvasOptions } from "@panels/BaseCanvas";

export interface DraggableCanvasOptions extends BaseCanvasOptions { }

export default class DraggableCanvas extends BaseCanvas {
  protected dragStartPoint?: Point
  protected dragShape?: Shape

  constructor(canvas: HTMLCanvasElement, options?: DraggableCanvasOptions) {
    super(canvas, options)
  }

  protected onMouseDown(event: MouseEvent): void {
    const { clientX, clientY } = event
    const mousePoint = { x: clientX, y: clientY }

    if (!this.startConnect(mousePoint)) {
      this.startDrag(mousePoint)
    }
  }

  protected onMouseMove(event: MouseEvent): void {
    const { clientX, clientY } = event
    const mousePoint = { x: clientX, y: clientY }

    this.connect(mousePoint)
    this.drag(mousePoint)
  }

  protected onMouseUp(event: MouseEvent): void {
    const { clientX, clientY } = event
    const mousePoint = { x: clientX, y: clientY }

    this.endConnect(mousePoint)
    this.endDrag(mousePoint)
  }

  startDrag(mousePoint: Point): boolean {
    this.relativeMousePoint = mousePoint
    const shape = this.selectShape(this.relativeMousePoint)

    if (shape && shape.isSelectedContent(mousePoint)) {
      this.dragStartPoint = { x: this.relativeMousePoint.x, y: this.relativeMousePoint.y }
      this.dragShape = shape

      shape.setOffset(this.relativeMousePoint)

      return true
    }

    return false
  }

  drag(mousePoint: Point) {
    if (this.dragShape) {
      this.relativeMousePoint = mousePoint
      this.dragShape.move(this.relativeMousePoint)
      this.draw()
    }
  }

  endDrag(mousePoint: Point) {
    this.dragStartPoint = undefined
    this.dragShape = undefined
  }
}