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

/**
 * _**NOTE**_: this class is not working as expected (angle computation is wrong when running in scontest)
 * Maybe a bug in scontest or just a limitation to have free angle
 */

/* eslint-disable @typescript-eslint/no-this-alias */
import { Line } from '../core/line'
import Point from '../core/point'
import UniqueID from '../core/unique-id'
import { arc, DegToRad, MouseButton, RadToDeg, stroke } from '../helper/utils'
import Color from '../drawing/color'
import RenderState from '../drawing/render-state'
import { makePointer, Pointer } from '../core/pointer'
import { GrabPoint } from '../drawing/grab-point'
import { DefaultFormBuilder, floatConvertor, floatDeconvertor } from '../core/property'
import { JSONObject, Deserializer } from '../core/object-mapper'
import MultiColor from '../drawing/multi-color'
import { Vector } from '../core/vector'
import Road, { RoadProps } from './road'

export interface RoadArcProps extends RoadProps {
  centerx: number
  centery: number
  radius: number
  startAngle: number
  endAngle: number
}

export class RoadArc extends Road<RoadArcProps> {
  private static GenID: UniqueID = new UniqueID()
  private id: number

  private testx: Pointer<number>
  private testy: Pointer<number>
  private testx2: Pointer<number>
  private testy2: Pointer<number>

  private centerx: Pointer<number>
  private centery: Pointer<number>
  private radius: Pointer<number>
  private startAngle: Pointer<number>
  private endAngle: Pointer<number>

  private grab: GrabPoint
  private grab2: GrabPoint
  private grab3: GrabPoint

  private time = 0
  private m = 0

  constructor (center: Point, radius: number)
  constructor (line: Line)
  constructor (data: Point | Line, radius?: number)
  constructor (data: Point | Line, radius?: number) {
    super()

    this.id = RoadArc.GenID.get()

    if (data instanceof Point) {
      this.radius = makePointer(typeof radius === 'undefined' ? 1 : radius)
      this.grab = this.addGrab(data, MouseButton.Left)
      this.startAngle = makePointer(90)
      this.endAngle = makePointer(-90)
      this.grab2 = this.addGrab(Point.Zero, MouseButton.Left)
      this.grab3 = this.addGrab(Point.Zero, MouseButton.Left)
    } else {
      const v = new Vector(data.start, data.end)
      this.radius = makePointer(v.mag() / 2)
      this.grab = this.addGrab(new Point((data.start.x + data.end.x) / 2, (data.start.y + data.end.y) / 2), MouseButton.Left)
      this.startAngle = makePointer(RadToDeg(v.argument()))
      this.endAngle = makePointer(RadToDeg(v.argument() + Math.PI))
      this.grab2 = this.addGrab(data.start, MouseButton.Left)
      this.grab3 = this.addGrab(data.end, MouseButton.Left)
    }

    [this.centerx, this.centery] = this.grab.pointers();
    [this.testx, this.testy] = this.grab2.pointers();
    [this.testx2, this.testy2] = this.grab3.pointers()

    const wow = () => {
      this.testx.off('change', wow)
      this.testy.off('change', wow)
      const c = new Vector(this.getCenter())
      const v = new Vector(this.getCenter(), new Point(this.testx.get(), this.testy.get()))
      const u = c.add(v.normalized().times(this.radius.get()))
      this.testx.set(u.x)
      this.testy.set(u.y)
      this.testx.on('change', wow)
      this.testy.on('change', wow)
      const g = v.argument()
      // if (g < -180) g += 180
      this.startAngle.set(RadToDeg(g))
    }

    this.testx.on('change', wow)
    this.testy.on('change', wow)

    const wow2 = () => {
      this.testx2.off('change', wow2)
      this.testy2.off('change', wow2)
      const c = new Vector(this.getCenter())
      const v = new Vector(this.getCenter(), new Point(this.testx2.get(), this.testy2.get()))
      const u = c.add(v.normalized().times(this.radius.get()))
      this.testx2.set(u.x)
      this.testy2.set(u.y)
      this.testx2.on('change', wow2)
      this.testy2.on('change', wow2)
      const g = v.argument()
      // if (g < -180) g += 180
      this.endAngle.set(RadToDeg(g))
    }

    this.testx2.on('change', wow2)
    this.testy2.on('change', wow2)

    this.setProperty('centerx', this.centerx, floatConvertor, DefaultFormBuilder('center.x', this.centerx, floatConvertor, floatDeconvertor))
    this.setProperty('centery', this.centery, floatConvertor, DefaultFormBuilder('center.y', this.centery, floatConvertor, floatDeconvertor))
    this.setProperty('radius', this.radius, floatConvertor, DefaultFormBuilder('radius', this.radius, floatConvertor, floatDeconvertor))
    this.setProperty('startAngle', this.startAngle, floatConvertor, DefaultFormBuilder('startAngle', this.startAngle, floatConvertor, floatDeconvertor))
    this.setProperty('endAngle', this.endAngle, floatConvertor, DefaultFormBuilder('endAngle', this.endAngle, floatConvertor, floatDeconvertor))

    this.radius.on('change', () => {
      this.testx.emit('change')
      this.testy.emit('change')
      this.testx2.emit('change')
      this.testy2.emit('change')
    })

    this.centerx.on('change', () => {
      this.testx.emit('change')
      this.testy.emit('change')
      this.testx2.emit('change')
      this.testy2.emit('change')
    })

    this.centery.on('change', () => {
      this.testx.emit('change')
      this.testy.emit('change')
      this.testx2.emit('change')
      this.testy2.emit('change')
    })

    this.testx.emit('change')
    this.testy.emit('change')
    this.testx2.emit('change')
    this.testy2.emit('change')
  }

  getID (): number {
    return this.id
  }

  destroy (): void {
    super.destroy()
    RoadArc.GenID.remove(this.id)
  }

  setP1 (p1: Point): void {
    this.testx.set(p1.x)
    this.testy.set(p1.y)
    this.testx.emit('change')
    this.testy.emit('change')
  }

  setP2 (p2: Point): void {
    this.testx2.set(p2.x)
    this.testy2.set(p2.y)
    this.testx2.emit('change')
    this.testy2.emit('change')
  }

  setCenter (center: Point): void {
    this.centerx.set(center.x)
    this.centery.set(center.y)
  }

  getCenter (): Point {
    return new Point(this.centerx.get(), this.centery.get())
  }

  setRadius (radius: number): void {
    this.radius.set(radius)
  }

  getRadius (): number {
    return this.radius.get()
  }

  setStartAngle (startAngle: number): void {
    this.startAngle.set(startAngle)
  }

  setEndAngle (endAngle: number): void {
    this.endAngle.set(endAngle)
  }

  getStartAngle (): number {
    return this.startAngle.get()
  }

  getEndAngle (): number {
    return this.endAngle.get()
  }

  render (state: RenderState): void {
    const ctx = state.ctx
    ctx.lineCap = 'round'
    ctx.lineWidth = this.width

    /* const isInArc = (a: number, from: number, to: number): boolean => {
      if (from < to) {
        // trigo direction
        console.log('trigo', Number(a).toFixed(1), Number(from).toFixed(1), Number(to).toFixed(1))
        return (from <= a && a <= to) || (from <= (a + 360) && (a + 360) <= to)
      } else {
        // clock direction
        console.log('clock', Number(a).toFixed(1), Number(from).toFixed(1), Number(to).toFixed(1))
        return (to <= a && a <= from) || (to <= (a + 360) && (a + 360) <= from)
      }
    }

    const lineAngle = (x1: number, y1: number, x2: number, y2: number): number => {
      return RadToDeg(Math.atan2(y2 - y1, x2 - x1))
    } */

    // const mouse = state.screenToWorld(state.mouse)

    // const a = lineAngle(this.centerx.get(), this.centery.get(), mouse.x, mouse.y)
    let from = this.startAngle.get()
    let to = this.endAngle.get()
    if (from >= to) {
      from = this.endAngle.get()
      to = this.startAngle.get()
    }
    // console.log(isInArc(a, this.startAngle.get(), this.endAngle.get()))

    arc(ctx, this.centerx.get(), this.centery.get(), this.radius.get(), DegToRad(from), DegToRad(to))
    stroke(ctx, this.color)

    // arc(ctx, mouse.x, mouse.y, 2, 0, TAU)
    // fill(ctx, Color.Black)

    if (this.color instanceof MultiColor) {
      this.color.update(state.dt)
    }
  }

  static from (center: Point, radius: number): RoadArc
  static from (line: Line): RoadArc
  static from (data: Point | Line, radius?: number): RoadArc {
    return new RoadArc(data, radius)
  }

  serialize (): JSONObject {
    return {
      ...super.serialize(),
      type: 'RoadArc',
      center: this.getCenter().serialize(),
      color: this.color.serialize(),
      width: this.width,
      speed: this.speed.get(),
      direction: this.direction.get(),
      radius: this.radius.get(),
      startAngle: this.startAngle.get(),
      endAngle: this.endAngle.get(),
      p1: new Point(this.testx.get(), this.testy.get()).serialize(),
      p2: new Point(this.testx2.get(), this.testy2.get()).serialize()
    }
  }

  static deserializer: Deserializer<Road> = (data: JSONObject) => {
    if (data.type !== 'RoadArc') throw new Error('bad type')
    const road = RoadArc.from(Point.deserializer(data.center), data.radius)
    road.setColor(Color.deserializer(data.color))
    road.setDirection(data.direction)
    road.setSpeed(data.speed)
    road.setWidth(data.width)
    road.setRadius(data.radius)
    road.setP1(Point.deserializer(data.p1))
    road.setP2(Point.deserializer(data.p2))
    return road
  }
}

export default RoadArc
