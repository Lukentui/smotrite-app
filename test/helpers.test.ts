import { describe, it, expect, beforeEach } from 'vitest'
import { humanFileSize } from '../src/helpers'

describe.concurrent('humanFileSize', () => {
  // bytes | digits | expected
  it.concurrent.each([
    [501, 1, '0kB'],
    [23201, 2, '23.20kB'],
    [5301, 3, '5.301kB'],
  
    [1048576, 1, '1.0MB'],
    [2097152, 2, '2.10MB'],
    [3145728, 3, '3.146MB'],
  
    [1073741824, 1, '1.1GB'],
    [1023741824, 2, '1.02GB'],
    [3221225472, 3, '3.221GB'],

    [null, 1, '0kB'],
    [undefined, 1, '0kB'],
  ])('should return correct results, case %#', (bytes, digits, expected) => {
    expect(humanFileSize(bytes, digits)).toBe(expected)
  })
})

describe.todo('another function name...', () => {
  // bytes | digits | expected
  // it.concurrent.each([
  //   [501, 1, '0kB'],
  //   [23201, 2, '23.20kB'],
  //   [5301, 3, '5.301kB'],
  
  //   [1048576, 1, '1.0MB'],
  //   [2097152, 2, '2.10MB'],
  //   [3145728, 3, '3.146MB'],
  
  //   [1073741824, 1, '1.1GB'],
  //   [1023741824, 2, '1.02GB'],
  //   [3221225472, 3, '3.221GB'],

  //   [null, 1, '0kB'],
  //   [undefined, 1, '0kB'],
  // ])('should return correct results', (bytes, digits, expected) => {
  //   expect(humanFileSize(bytes, digits)).toBe(expected)
  // })
})