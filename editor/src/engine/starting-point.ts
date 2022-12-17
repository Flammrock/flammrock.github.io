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

import Point from '../core/point'
import UniqueID from '../core/unique-id'
import { arc, DegToRad, fill, MouseButton, stroke, TAU } from '../helper/utils'
import RenderState from '../drawing/render-state'
import { Item } from '../drawing/item'
import { makePointer, Pointer } from '../core/pointer'
import { GrabPoint } from '../drawing/grab-point'
import { DefaultFormBuilder, floatConvertor, floatDeconvertor } from '../core/property'
import { Deserializer, JSONObject } from '../core/object-mapper'
import Color from '../drawing/color'

export interface StartingPointProps {
  x: number
  y: number
  angle: number
  speed: number
}

export class StartingPoint extends Item<StartingPointProps> {
  private static GenID: UniqueID = new UniqueID()

  private x: Pointer<number>
  private y: Pointer<number>
  private angle: Pointer<number>
  private speed: Pointer<number>

  private grab: GrabPoint

  private radius: number
  private time: number

  constructor (pt: Point) {
    super()

    this.radius = 2
    this.time = 0

    this.grab = this.addGrab(pt, MouseButton.Left);

    [this.x, this.y] = this.grab.pointers()

    this.angle = makePointer(0)
    this.speed = makePointer(20)

    this.setProperty('x', this.x, floatConvertor, DefaultFormBuilder('x', this.x, floatConvertor, floatDeconvertor))
    this.setProperty('y', this.y, floatConvertor, DefaultFormBuilder('y', this.y, floatConvertor, floatDeconvertor))
    this.setProperty('angle', this.angle, floatConvertor, DefaultFormBuilder('angle', this.angle, floatConvertor, floatDeconvertor))
    this.setProperty('speed', this.speed, floatConvertor, DefaultFormBuilder('speed', this.speed, floatConvertor, floatDeconvertor))
  }

  setPosition (pos: Point) {
    this.x.set(pos.x)
    this.y.set(pos.y)
  }

  getPosition () {
    return new Point(this.x.get(), this.y.get())
  }

  setAngle (angle: number) {
    this.angle.set(angle)
  }

  getAngle () {
    return this.angle.get()
  }

  setSpeed (speed: number) {
    this.speed.set(speed)
  }

  getSpeed () {
    return this.speed.get()
  }

  render (state: RenderState): void {
    const ctx = state.ctx
    this.time += state.dt
    if (this.time >= TAU) this.time = 0
    ctx.lineCap = 'round'
    ctx.lineWidth = 2
    arc(ctx, this.x.get(), this.y.get(), this.radius / 4, 0, TAU)
    fill(ctx, Color.fromRGB(0, 0, 200))
    ctx.lineWidth = 1 + 2 * Math.abs(Math.sin(this.time))
    ctx.globalAlpha = (1 - Math.abs(Math.sin(this.time))) * 0.7 + 0.3
    arc(ctx, this.x.get(), this.y.get(), this.radius + 10 * Math.abs(Math.sin(this.time)), 0, TAU)
    stroke(ctx, Color.fromRGB(0, 0, 200))
    ctx.globalAlpha = 1
    ctx.lineWidth = 1
    const radAngle = DegToRad(360 - this.angle.get())
    arc(ctx, this.x.get(), this.y.get(), this.radius + 10 * Math.abs(Math.sin(this.time)), radAngle - 0.2, radAngle + 0.2)
    stroke(ctx, Color.fromRGB(200, 0, 0))
  }

  static from (pt: Point) {
    return new StartingPoint(pt)
  }

  serialize (): JSONObject {
    return {
      type: 'StartingPoint',
      position: this.getPosition().serialize(),
      angle: this.angle.get(),
      speed: this.speed.get()
    }
  }

  static deserializer: Deserializer<StartingPoint> = (data: JSONObject) => {
    if (data.type !== 'StartingPoint') throw new Error('bad type')
    const startingPoint = StartingPoint.from(Point.deserializer(data.position))
    startingPoint.setAngle(data.angle)
    startingPoint.setSpeed(data.speed)
    return startingPoint
  }
}

export default StartingPoint
