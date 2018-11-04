export interface Point {
  x: number;
  y: number;
}

export interface Selectable {
  isSelected(mousePoint: Point): boolean
}

export type Nullable<T> = T | undefined | null