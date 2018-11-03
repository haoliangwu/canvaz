import { Point, Selectable } from "../typings";

export enum LineCapType {
  BUTT = 'butt',
  ROUND = 'round',
  SQUARE = 'square',
}

export interface LineBaseOptions {
  lineWidth?: number;
  strokeStyle?: string;
  lineCap?: LineCapType
}

export default abstract class Line implements Selectable {
  protected strokeStyle: string
  protected lineWidth: number
  protected lineCap: LineCapType = LineCapType.BUTT

  protected startPoint?: Point;
  protected endPoint?: Point;

  constructor(options: LineBaseOptions) {
    this.strokeStyle = options.strokeStyle || ''
    this.lineWidth = options.lineWidth || 6
  }

  abstract draw(ctx: CanvasRenderingContext2D): void
  abstract isSelected(mousePoint: Point): boolean
}