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
    if (!this.startConnect(event)) {
      this.startDrag(event)
    }
  }

  protected onMouseMove(event: MouseEvent): void {
    this.connect(event)
    this.drag(event)
  }

  protected onMouseUp(event: MouseEvent): void {
    this.endConnect(event)
    this.endDrag(event)
  }

  startDrag(event: MouseEvent): boolean {
    const shape = this.selectShape(this.relativeMousePoint)

    if (shape && shape.isSelectedContent(this.relativeMousePoint)) {
      this.dragStartPoint = { x: this.relativeMousePoint.x, y: this.relativeMousePoint.y }
      this.dragShape = shape

      shape.setOffset(this.relativeMousePoint)

      return true
    }

    return false
  }

  drag(event: MouseEvent) {
    if (this.dragShape) {
      this.dragShape.move(this.relativeMousePoint)
      this.draw()
    }
  }

  endDrag(event: MouseEvent) {
    this.dragStartPoint = undefined
    this.dragShape = undefined
  }
}