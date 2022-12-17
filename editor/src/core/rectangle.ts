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
import { Point } from './point'

export class Rectangle implements Serializable {
  static get Zero () { return Rectangle.from(0, 0, 0, 0) }

  origin: Point
  size: Point

  constructor (origin: Point, size: Point) {
    this.origin = origin
    this.size = size
  }

  ratio () {
    return this.size.x / this.size.y
  }

  static from (x: number, y: number, w: number, h: number) {
    return new Rectangle(new Point(x, y), new Point(w, h))
  }

  static fromSize (w: number, h: number) {
    return new Rectangle(new Point(0, 0), new Point(w, h))
  }

  static duplicate (rect: Rectangle) {
    return new Rectangle(Point.duplicate(rect.origin), Point.duplicate(rect.size))
  }

  serialize (): JSONObject {
    return {
      type: 'Rectangle',
      origin: this.origin.serialize(),
      size: this.size.serialize()
    }
  }

  static deserializer: Deserializer<Rectangle> = (data: JSONObject) => {
    if (data.type !== 'Rectangle') throw new Error('bad type')
    return new Rectangle(Point.deserializer(data.origin), Point.deserializer(data.size))
  }
}

export default Rectangle
