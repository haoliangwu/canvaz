import Line from "./shapes/Line";
import Shape, { BorderDirection } from "./shapes/Shape";

export interface Point {
  x: number;
  y: number;
}

export interface Selectable {
  isSelected(mousePoint: Point): boolean
}

export interface Connectable {
  connections: Map<Line, BorderDirection>
  registerConnection(line: Line, borderDirection: BorderDirection): Shape
}

export type Nullable<T> = T | undefined