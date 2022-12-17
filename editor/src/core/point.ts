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

import { Deserializer, JSONObject, Serializable } from './object-mapper'

export class Point implements Serializable {
  static get Zero () { return new Point(0, 0) }

  x: number
  y: number

  constructor (x?: number, y?: number) {
    this.x = typeof x === 'number' ? x : 0
    this.y = typeof y === 'number' ? y : 0
  }

  static add (a: Point, b: Point) {
    return new Point(a.x + b.x, a.y + b.y)
  }

  static sub (a: Point, b: Point) {
    return new Point(a.x - b.x, a.y - b.y)
  }

  static mul (a: Point, b: Point) {
    return new Point(a.x * b.x, a.y * b.y)
  }

  static div (a: Point, b: Point) {
    return new Point(a.x / b.x, a.y / b.y)
  }

  static duplicate (p: Point) {
    return new Point(p.x, p.y)
  }

  serialize (): JSONObject {
    return {
      type: 'Point',
      x: this.x,
      y: this.y
    }
  }

  static deserializer: Deserializer<Point> = (data: JSONObject) => {
    if (data.type !== 'Point') throw new Error('bad type')
    return new Point(data.x, data.y)
  }
}

export default Point
