export function isInRectRange(mp, sp, width, height) {
    return sp.x <= mp.x && mp.x <= (sp.x + width) && sp.y <= mp.y && mp.y <= (sp.y + height);
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
export function isInTriRange(mp, width, height) {
    if (mp.x > width) {
        mp.x = width * 2 - mp.x;
    }
    return mp.y < mp.x * height / width;
}
export function calcDistanceBetweenPoints(sp, ep) {
    var w = Math.abs(ep.x - sp.x);
    var h = Math.abs(ep.y - sp.y);
    return Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
}
export function arrayRemove(arr, item) {
    var idx = arr.indexOf(item);
    if (idx > -1) {
        arr.splice(idx, 1);
    }
    return arr;
}
export function isSameReference(ob1, ob2) {
    return ob1 == ob2;
}
