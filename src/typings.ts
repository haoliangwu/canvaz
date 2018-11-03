export interface Point {
  x: number;
  y: number;
}

export interface Selectable {
  isSelected(mousePoint: Point): boolean
}