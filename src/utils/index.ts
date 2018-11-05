export function noopMouseEventHandler(event: MouseEvent) { }

export function isInRectRange(mp: Point, sp: Point, width: number, height: number): boolean {
  return sp.x <= mp.x && mp.x <= (sp.x + width) && sp.y <= mp.y && mp.y <= (sp.y + height)
}

/*
            *
  (mp2)*  *
        *   h
      *   *(mp1)
    * * w * *

    mp1.x * h / w > mp1.y
    mp2.x * h / w < mp2.y
*/
export function isInTriRange(mp: Point, width: number, height: number): boolean {
  if (mp.x > width) {
    mp.x = width * 2 - mp.x
  }

  return mp.y < mp.x * height / width
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

export function isSameReference(ob1: any, ob2: any) {
  return ob1 == ob2
}