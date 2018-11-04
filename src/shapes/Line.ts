import { Point, Selectable, Nullable } from "../typings";
import Shape from "./Shape";

export enum LineCapType {
  BUTT = 'butt',
  ROUND = 'round',
  SQUARE = 'square',
}

export interface LineBaseOptions {
  startPoint: Point;
  endPoint: Point;
  startShape?: Shape;
  endShape?: Shape;
  lineWidth?: number;
  strokeStyle?: string;
  lineCap?: LineCapType
}

export default abstract class Line implements Selectable {
  protected strokeStyle: string
  protected lineWidth: number
  protected lineCap: LineCapType = LineCapType.BUTT

  protected startPoint?: Point
  protected endPoint?: Point

  protected startShape?: Shape;
  protected endShape?: Shape;

  get head(): Shape {
    return this.startShape as Shape
  }

  get tail(): Shape {
    return this.endShape as Shape
  }

  constructor(options: LineBaseOptions) {
    this.strokeStyle = options.strokeStyle || ''
    this.lineWidth = options.lineWidth || 6
  }

  update(options: Partial<LineBaseOptions>): void {
    this.strokeStyle = options.strokeStyle || this.strokeStyle
    this.lineWidth = options.lineWidth || this.lineWidth
  }
  
  abstract draw(ctx: CanvasRenderingContext2D): void
  abstract isSelected(mousePoint: Point): boolean
  abstract stretch(mousePoint: Point): void
}