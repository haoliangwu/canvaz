import * as _ from '@utils/index';

describe('test utils', () => {
  test('arrayRemove', () => {
    const arr1 = [1, 2, 3]

    expect(_.arrayRemove(arr1, 1)).toEqual([2, 3])
    
    const o1 = {}
    const o2 = {}
    const o3 = {}
    const arr2 = [o1, o2, o3]

    expect(_.arrayRemove(arr2, o1)).toEqual([o2, o3])
  })
})