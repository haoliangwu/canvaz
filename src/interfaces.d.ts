declare type Nullable<T> = T | undefined

declare interface Point {
  x: number;
  y: number;
}

declare interface ConnectionPoint extends Point{
  origin: Point;
  offsetX: number;
  offsetY: number;
}

declare interface Selectable {
  isSelected(mousePoint: Point): boolean
}

declare interface Connectable<L, S> {
  connections: Map<L, ConnectionPoint>
  registerConnectionPoint(line: L, connectionPoint: ConnectionPoint): S
  unregisterConnectionPoint(line: L): S
  getConnectionPoint(line: L): Nullable<ConnectionPoint>
}