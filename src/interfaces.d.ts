declare interface Point {
  x: number;
  y: number;
}

declare interface ConnectionPoint extends Point{
  origin: Point;
  offsetX: number;
  offsetY: number;
}