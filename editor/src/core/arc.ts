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

import { Nullable } from '../helper/utils'
import Line from './line'
import { Deserializer, JSONObject, Serializable } from './object-mapper'
import { Point } from './point'
import { Vector } from './vector'

export class Arc implements Serializable {
  center: Point // readonly ?
  radius: number
  startAngle: number
  endAngle: number

  static get Zero () { return new Arc(Point.Zero, 0, 0, 0) }

  constructor (center: Point, radius: number, startAngle: number, endAngle: number) {
    this.center = center
    this.radius = radius
    this.startAngle = startAngle
    this.endAngle = endAngle
  }

  static duplicate (arc: Arc) {
    return new Arc(Point.duplicate(arc.center), arc.radius, arc.startAngle, arc.endAngle)
  }

  /**
   * p.x = o.x + t d.x = c.x + r cos(u)
   * p.y = o.y + t d.y = c.y + r sin(u)
   */
  intersect (line: Line): Nullable<Array<Point>> {
    const o = new Vector(line.start)
    const d = line.direction
    const c = new Vector(this.center)
    const r = this.radius
    const cs = new Vector(this.center, line.start)

    // (d.x² + d.y²) t² + 2 (d.x.cs.x + d.y.cd.y) t + cs.x² + cs.y² - r² = 0
    const delta = 4 * d.dot(cs) * d.dot(cs) - 4 * d.magSqr() * (cs.magSqr() - r * r)

    if (delta < 0) {
      return null
    }

    if (delta === 0) {
      const t = -d.dot(cs) / d.magSqr()
      if (t > 1 || t < 0) return null
      const p = o.add(d.times(t)) // o + t d
      const u = p.sub(c).argument() // arg( p - c )
      if (u < this.startAngle || u > this.endAngle) return null
      return [new Point(p.x, p.y)]
    }

    const res: Array<Point> = []

    const t1 = -(2 * d.dot(cs) - Math.sqrt(delta)) / (2 * d.magSqr())
    const t2 = -(2 * d.dot(cs) + Math.sqrt(delta)) / (2 * d.magSqr())

    if (t1 >= 0 && t1 <= 1) {
      const p = o.add(d.times(t1)) // o + t1 d
      const u = p.sub(c).argument() // arg( p - c )
      if (u >= this.startAngle && u <= this.endAngle) {
        res.push(new Point(p.x, p.y))
      }
    }
    if (t2 >= 0 && t2 <= 1) {
      const p = o.add(d.times(t2)) // o + t2 d
      const u = p.sub(c).argument() // arg( p - c )
      if (u >= this.startAngle && u <= this.endAngle) {
        res.push(new Point(p.x, p.y))
      }
    }

    return res.length === 0 ? null : res
  }

  serialize (): JSONObject {
    return {
      type: 'Arc',
      center: this.center.serialize(),
      radius: this.radius,
      startAngle: this.startAngle,
      endAngle: this.endAngle
    }
  }

  static deserializer: Deserializer<Arc> = (data: JSONObject) => {
    if (data.type !== 'Arc') throw new Error('bad type')
    return new Arc(Point.deserializer(data.center), data.radius, data.startAngle, data.endAngle)
  }
}

export default Arc
