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

/* eslint-disable @typescript-eslint/no-this-alias */
import { Line } from '../core/line'
import Point from '../core/point'
import UniqueID from '../core/unique-id'
import { line, MouseButton, stroke } from '../helper/utils'
import Color from '../drawing/color'
import RenderState from '../drawing/render-state'
import { Pointer } from '../core/pointer'
import { GrabPoint } from '../drawing/grab-point'
import { DefaultFormBuilder, floatConvertor, floatDeconvertor } from '../core/property'
import { JSONObject, Deserializer } from '../core/object-mapper'
import MultiColor from '../drawing/multi-color'
import Road, { RoadProps } from './road'

export interface RoadLineProps extends RoadProps {
  x1: number
  y1: number
  x2: number
  y2: number
}

export class RoadLine extends Road<RoadLineProps> {
  private static GenID: UniqueID = new UniqueID()

  private id: number

  private x1: Pointer<number>
  private y1: Pointer<number>
  private x2: Pointer<number>
  private y2: Pointer<number>

  private p1: GrabPoint
  private p2: GrabPoint

  constructor (line: Line) {
    super()
    this.id = RoadLine.GenID.get()

    this.p1 = this.addGrab(line.start, MouseButton.Left)
    this.p2 = this.addGrab(line.end, MouseButton.Left);

    [this.x1, this.y1] = this.p1.pointers();
    [this.x2, this.y2] = this.p2.pointers()

    this.setProperty('x1', this.x1, floatConvertor, DefaultFormBuilder('x1', this.x1, floatConvertor, floatDeconvertor))
    this.setProperty('y1', this.y1, floatConvertor, DefaultFormBuilder('y1', this.y1, floatConvertor, floatDeconvertor))
    this.setProperty('x2', this.x2, floatConvertor, DefaultFormBuilder('x2', this.x2, floatConvertor, floatDeconvertor))
    this.setProperty('y2', this.y2, floatConvertor, DefaultFormBuilder('y2', this.y2, floatConvertor, floatDeconvertor))
  }

  getID (): number {
    return this.id
  }

  destroy (): void {
    super.destroy()
    RoadLine.GenID.remove(this.id)
  }

  setStart (start: Point): void {
    this.x1.set(start.x)
    this.y1.set(start.y)
  }

  setEnd (end: Point): void {
    this.x2.set(end.x)
    this.y2.set(end.y)
  }

  getStart () {
    return new Point(this.x1.get(), this.y1.get())
  }

  getEnd () {
    return new Point(this.x2.get(), this.y2.get())
  }

  render (state: RenderState): void {
    const ctx = state.ctx
    ctx.lineCap = 'round'
    ctx.lineWidth = this.width

    line(ctx, this.x1, this.y1, this.x2, this.y2)
    stroke(ctx, this.color)

    if (this.color instanceof MultiColor) {
      this.color.update(state.dt)
    }
  }

  static from (line: Line): RoadLine {
    return new RoadLine(line)
  }

  serialize (): JSONObject {
    return {
      ...super.serialize(),
      type: 'RoadLine',
      line: new Line(this.getStart(), this.getEnd()).serialize()
    }
  }

  static deserializer: Deserializer<Road> = (data: JSONObject) => {
    if (data.type !== 'RoadLine') throw new Error('bad type')
    const road = RoadLine.from(Line.deserializer(data.line))
    road.setColor(Color.deserializer(data.color))
    road.setDirection(data.direction)
    road.setSpeed(data.speed)
    road.setWidth(data.width)
    return road
  }
}

export default RoadLine
