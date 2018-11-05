import * as _ from '@utils/index';

describe('test utils', () => {
  test('isInRectRange', () => {
    const mp1 = {x: 2, y: 2}
    const mp2 = {x: 3, y: 2}
    const mp3 = {x: 2, y: 4}
    const mp4 = {x: 4, y: 3}
    const sp = {x: 1, y: 1}
    const width = 2
    const height = 2
    
    expect(_.isInRectRange(mp1, sp, width, height)).toBe(true)
    expect(_.isInRectRange(mp2, sp, width, height)).toBe(true)
    expect(_.isInRectRange(mp3, sp, width, height)).toBe(false)
    expect(_.isInRectRange(mp4, sp, width, height)).toBe(false)
  });

  test('isInTriRange', () => {
    const mp1 = { x: 4, y: 1}
    const mp2 = { x: 2, y: 4}
    const mp3 = { x: 6, y: 1}
    const mp4 = { x: 7, y: 2}
    const width = 4
    const height = 4

    expect(_.isInTriRange(mp1, width, height)).toBe(true)
    expect(_.isInTriRange(mp2, width, height)).toBe(false)
    expect(_.isInTriRange(mp3, width, height)).toBe(true)
    expect(_.isInTriRange(mp4, width, height)).toBe(false)
  });

  test('calcDistanceBetweenPoints', () => {
    const p1 = { x: 2, y: 2 }
    const p2 = { x: 2, y: -2 }
    const p3 = { x: -2, y: 2 }
    const p4 = { x: -2, y: -2 }

    expect(_.calcDistanceBetweenPoints(p1, p2)).toBeCloseTo(4)
    expect(_.calcDistanceBetweenPoints(p2, p3)).toBeCloseTo(5.656)
    expect(_.calcDistanceBetweenPoints(p3, p4)).toBeCloseTo(4)
    expect(_.calcDistanceBetweenPoints(p4, p1)).toBeCloseTo(5.656)
  })

  test('arrayRemove', () => {
    const arr1 = [1, 2, 3]

    expect(_.arrayRemove(arr1, 1)).toEqual([2, 3])

    const o1 = {}
    const o2 = {}
    const o3 = {}
    const arr2 = [o1, o2, o3]

    expect(_.arrayRemove(arr2, o1)).toEqual([o2, o3])
  })

  test('isSameReference', () => {
    const p1 = {}
    const p2 = p1
    const p3 = {}

    expect(_.isSameReference(p1, p2)).toBe(true)
    expect(_.isSameReference(p1, p3)).not.toBe(true)
  })
})