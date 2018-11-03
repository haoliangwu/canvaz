import { Point } from "../typings";

export function isInRectRange(p: Point, sp: Point, width: number, height: number) {
  return sp.x <= p.x && p.x <= (sp.x + width) && sp.y <= p.y && p.y <= (sp.y + height)
}

export function calcDistanceBetweenPoints(sp: Point, ep: Point) {
  const w = Math.abs(ep.x - sp.x)
  const h = Math.abs(ep.y - sp.y)

  return Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2))
}

export function arrayRemove<T>(arr: T[], item: T): T[] {
  const idx = arr.indexOf(item)
  if (idx > -1) {
    arr.splice(idx, 1)
  }

  return arr
}