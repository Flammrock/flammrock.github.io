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

/* eslint-disable camelcase */
/* eslint-disable no-use-before-define */

import { equals0, Nullable } from '../helper/utils'
import { Deserializer, JSONObject, Serializable } from './object-mapper'
import { Point } from './point'
import { Vector } from './vector'

export class Line implements Serializable {
  start: Point // readonly ?
  end: Point

  static get Zero () { return new Line(Point.Zero, Point.Zero) }

  constructor (start: Point, end: Point) {
    this.start = start
    this.end = end
  }

  get direction () {
    return new Vector(this.start, this.end)
  }

  static duplicate (line: Line) {
    return new Line(Point.duplicate(line.start), Point.duplicate(line.end))
  }

  /**
   *
   * p + t r = q + u s
   *
   * @see https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
   * @see https://gist.github.com/tp/75cb619a7e40e6ad008ef2a6837bbdb2
   */
  intersect (ls1: Line): Nullable<Point> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const ls0 = this
    const p = new Vector(ls0.start)
    const r = ls0.direction
    const q = new Vector(ls1.start)
    const s = ls1.direction

    // r × s
    const r_s = r.cross(s)
    // (q − p) × r
    const q_p_r = q.sub(p).cross(r)

    if (equals0(r_s) && equals0(q_p_r)) {
    // t0 = (q − p) · r / (r · r)
    // const t0 = dot(subtractPoints(q, p), r) / dot(r, r);

      // t1 = (q + s − p) · r / (r · r) = t0 + s · r / (r · r)
      // const t1 = t0 + dot(s, r) / dot(r, r);

      // NOTE(tp): For some reason (which I haven't spotted yet), the above t0 and hence t1 is wrong
      // So resorting to calculating it 'backwards'
      const t1 = q.add(s.sub(p)).dot(r) / r.dot(r)
      const t0 = t1 - s.dot(r) / r.dot(r)

      if ((t0 >= 0 && t0 <= 1) || (t1 >= 0 && t1 <= 1)) {
        const v = p.add(r.times(t1))
        return new Point(v.x, v.y)
      }

      return null
    }

    if (equals0(r_s) && !equals0(q_p_r)) {
      return null
    }

    // t = (q − p) × s / (r × s)
    const t = q.sub(p).cross(s) / r.cross(s)

    // u = (q − p) × r / (r × s)
    const u = q.sub(p).cross(r) / r.cross(s)

    if (!equals0(r_s) && t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      const v = p.add(r.times(t))
      return new Point(v.x, v.y)
    }

    return null
  }

  serialize (): JSONObject {
    return {
      type: 'Line',
      start: this.start.serialize(),
      end: this.end.serialize()
    }
  }

  static deserializer: Deserializer<Line> = (data: JSONObject) => {
    if (data.type !== 'Line') throw new Error('bad type')
    return new Line(Point.deserializer(data.start), Point.deserializer(data.end))
  }
}

export default Line
