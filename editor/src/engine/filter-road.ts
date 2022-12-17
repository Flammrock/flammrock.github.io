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

import { arc, DegToRad, IsInstanceOf, line, Nullable, stroke } from '../helper/utils'
import Filter from '../drawing/filter'
import { Item } from '../drawing/item'
import Road from './road'
import { Deserializer, JSONObject } from '../core/object-mapper'
import Color from '../drawing/color'
import Collection from '../core/collection'
import { RoadLine } from './road-line'
import RoadArc from './road-arc'

export class RoadFilter implements Filter {
  apply (ctx: CanvasRenderingContext2D, items: Collection<Item>): void {
    // wow
    const c = ctx.globalCompositeOperation
    ctx.globalCompositeOperation = 'destination-over'

    // solution: ctx.lineJoin = "round";
    // found closest point => link them and build path

    const w = ctx.lineWidth
    // const cap = ctx.lineCap

    const color1 = Color.Magenta
    const color2 = Color.Yellow

    ctx.lineCap = 'butt'
    ctx.lineWidth = 1

    if (items.length === 0) return
    let l: Nullable<Road> = items.find(IsInstanceOf(RoadLine))
    if (l == null) {
      l = items.find(IsInstanceOf(RoadArc))
    }
    if (l == null) return

    const width = l.getWidth()
    const isize = 0.7

    const roadlines: Array<Road> = items.filter(IsInstanceOf(RoadLine)).toArray()
    const roadarcs: Array<Road> = items.filter(IsInstanceOf(RoadArc)).toArray()
    const roads = roadlines.concat(roadarcs)

    // const deltac = 255 / Math.floor(width * (1 / isize))

    for (let i = 0; i < width * (1 / isize); i++) {
      // color1.addBlue(deltac)
      // color2.addGreen(deltac)

      for (let j = roads.length - 1; j >= 0; j--) {
        const road = roads[j]

        if (!(road instanceof RoadLine || road instanceof RoadArc)) continue

        const amount = width / 2 + ctx.lineWidth / 2
        if (road instanceof RoadLine) {
          const start = road.getStart()
          const end = road.getEnd()
          const angle = Math.atan2(end.y - start.y, end.x - start.x)
          const vx = Math.cos(angle)
          const vy = Math.sin(angle)
          const dx = ((i * isize) + amount) * vx
          const dy = ((i * isize) + amount) * vy
          line(ctx, start.x - dy, start.y + dx, end.x - dy, end.y + dx)
          stroke(ctx, color1)
          arc(ctx, end.x, end.y, amount + i * isize, angle, angle + Math.PI / 2)
          stroke(ctx, color1)
          arc(ctx, start.x, start.y, amount + i * isize, angle + Math.PI / 2, angle + Math.PI)
          stroke(ctx, color1)
          line(ctx, start.x + dy, start.y - dx, end.x + dy, end.y - dx)
          stroke(ctx, color2)
          arc(ctx, end.x, end.y, amount + i * isize, angle - Math.PI / 2, angle)
          stroke(ctx, color2)
          arc(ctx, start.x, start.y, amount + i * isize, angle + Math.PI, angle + Math.PI + Math.PI / 2)
          stroke(ctx, color2)
        } else if (road instanceof RoadArc) {
          const center = road.getCenter()
          const radius = road.getRadius()
          const startAngle = DegToRad(road.getStartAngle())
          const endAngle = DegToRad(road.getEndAngle())
          let from = startAngle
          let to = endAngle
          if (from >= to) {
            from = endAngle
            to = startAngle
          }
          arc(ctx, center.x, center.y, radius + ((i * isize) + amount), from, to)
          stroke(ctx, color1)
          arc(ctx, center.x, center.y, radius - ((i * isize) + amount), from, to)
          stroke(ctx, color2)
        }
      }
    }

    ctx.globalCompositeOperation = c
    ctx.lineWidth = w
  }

  serialize (): JSONObject {
    return {
      type: 'RoadFilter'
    }
  }

  static deserializer: Deserializer<RoadFilter> = (data: JSONObject) => {
    if (data.type !== 'RoadFilter') throw new Error('bad type')
    return new RoadFilter()
  }
}

export default RoadFilter
