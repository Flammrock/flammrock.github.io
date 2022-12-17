/** *******************************************************************************\
* Copyright (c) 2022 - Lemmy Briot (Flammrock)                                    *
*                                                                                 *
* Permission is hereby granted, free of charge, to any person obtaining a copy    *
* of this software and associated documentation files (the "Software"), to deal   *
* in the Software without restriction, including without limitation the rights    *
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell       *
* copies of the Software, and to permit persons to whom the Software is           *
* furnished to do so, subject to the following conditions:                        *
*                                                                                 *
* The above copyright notice and this permission notice shall be included in all  *
* copies or substantial portions of the Software.                                 *
*                                                                                 *
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR      *
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,        *
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE     *
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER          *
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,   *
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE   *
* SOFTWARE.                                                                       *
\*********************************************************************************/

import Comparable from '../core/comparable'
import { Pointer } from '../core/pointer'
import { Nullable } from '../helper/utils'

export class ZIndex extends Pointer<number> implements Comparable<ZIndex> {
  private values: Array<number> = []

  constructor (value?: number) {
    super(0)
    this.values = typeof value === 'number' ? [value] : []
  }

  push (zIndex: number): void {
    this.values.unshift(zIndex)
  }

  pop (): Nullable<number> {
    const v = this.values.shift()
    if (typeof v === 'undefined') return null
    return v
  }

  get (index?: number): number {
    return this.values[typeof index === 'number' ? index : this.values.length - 1]
  }

  set (zIndex: number): void {
    if (this.values.length === 0) {
      this.values.push(zIndex)
    } else {
      this.values[this.values.length - 1] = zIndex
    }
  }

  size (): number {
    return this.values.length
  }

  clear () {
    this.values = []
  }

  data (): Array<number> {
    return this.values
  }

  /**
   * Allow to compare the **depth** ({@link ZIndex.values | z-index}) between two {@link ZIndex}
   *
   * @example
   * ```
   * const zindexes: Array<ZIndex> = ...
   * zindexes.sort((a, b) => a.compare(b))
   * ```
   *
   * @sealed recommanded to **NOT OVERRIDE** this method
   *
   * @param other a {@link ZIndex}
   *
   * @returns
   *
   * 0 if {@link other} have the same {@link ZIndex.values | z-index}
   *
   * < 0 if {@link other} is behind (smaller {@link ZIndex.values | z-index})
   *
   * \> 0 if {@link other} is in front (bigger {@link ZIndex.values | z-index})
   */
  compare (other: ZIndex): number {
    /* else we compare the z-index */
    if (this.size() !== other.size()) return this.size() - other.size()
    for (let i = this.size() - 1; i >= 0; i--) {
      if (this.get(i) === other.get(i)) continue
      return this.get(i) - other.get(i)
    }

    /* at this step, we assume that the two renderables are on the same depth (z-index) */
    return 0
  }
}

export default ZIndex
