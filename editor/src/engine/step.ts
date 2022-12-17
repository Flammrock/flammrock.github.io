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
import { IsInstanceOf, line, MouseButton, stroke } from '../helper/utils'
import Color from '../drawing/color'
import RenderState from '../drawing/render-state'
import { Item } from '../drawing/item'
import { makePointer, Pointer } from '../core/pointer'
import { GrabPoint } from '../drawing/grab-point'
import Itinerary, { Action } from '../map/itinerary'
import { DefaultFormBuilder, floatConvertor, floatDeconvertor, SelectFormBuilder } from '../core/property'
import { Deserializer, JSONObject } from '../core/object-mapper'
import MultiColor from '../drawing/multi-color'
import { RoadLine } from './road-line'
import RoadArc from './road-arc'
import Arc from '../core/arc'

export interface StepProps {
  index: number
  x1: number
  y1: number
  x2: number
  y2: number
  action: Action
  value: number
}

export class Step extends Item<StepProps> {
  private static GenID: UniqueID = new UniqueID()
  private color: Color
  private id: number
  private width: number

  private x1: Pointer<number>
  private y1: Pointer<number>
  private x2: Pointer<number>
  private y2: Pointer<number>

  private action: Pointer<Action>
  private value: Pointer<number>

  private index: Pointer<number>

  private p1: GrabPoint
  private p2: GrabPoint

  private roadIntersection = Point.Zero
  private roadIndex = -1

  constructor (line: Line) {
    super()
    this.width = 2 // TODO: default value
    this.color = Color.Default
    this.id = Step.GenID.get()

    this.p1 = this.addGrab(line.start, MouseButton.Left)
    this.p2 = this.addGrab(line.end, MouseButton.Left);

    [this.x1, this.y1] = this.p1.pointers();
    [this.x2, this.y2] = this.p2.pointers()

    this.value = makePointer(20)
    this.action = makePointer(Itinerary.Go.from(this.value.get()))
    this.index = makePointer(this.id)

    this.setProperty('index', this.index, floatConvertor, DefaultFormBuilder('index', this.index, floatConvertor, floatDeconvertor))

    this.setProperty('x1', this.x1, floatConvertor, DefaultFormBuilder('x1', this.x1, floatConvertor, floatDeconvertor))
    this.setProperty('y1', this.y1, floatConvertor, DefaultFormBuilder('y1', this.y1, floatConvertor, floatDeconvertor))
    this.setProperty('x2', this.x2, floatConvertor, DefaultFormBuilder('x2', this.x2, floatConvertor, floatDeconvertor))
    this.setProperty('y2', this.y2, floatConvertor, DefaultFormBuilder('y2', this.y2, floatConvertor, floatDeconvertor))

    const convertor = (value: string): Action => {
      const action = value === 'GO' ? Itinerary.Go.from(this.value.get()) : value === 'TURN' ? Itinerary.Turn.from(this.value.get()) : Itinerary.Stop.from()
      if (value !== 'GO' && value !== 'TURN') {
        this.value.set(0)
      }
      return action
    }
    const deconvertor = (value: Action) => value instanceof Itinerary.Go ? 'GO' : value instanceof Itinerary.Turn ? 'TURN' : 'STOP'
    this.setProperty('action', this.action, convertor, SelectFormBuilder('action', {
      GO: 'GO',
      TURN: 'TURN',
      STOP: 'STOP'
    }, this.action, convertor, deconvertor))

    const floatConvertorCustom = (value: string) => {
      if (this.action.get() instanceof Itinerary.Stop) {
        this.value.set(0)
        return 0
      }
      const v = floatConvertor(value)
      if (this.action.get() instanceof Itinerary.Go) {
        this.action.set(Itinerary.Go.from(this.value.get()))
      } else if (this.action.get() instanceof Itinerary.Turn) {
        this.action.set(Itinerary.Turn.from(this.value.get()))
      }
      return v
    }
    const floatDeconvertorCustom = (value: number) => value + ''
    this.setProperty('value', this.value, floatConvertorCustom, DefaultFormBuilder('value', this.value, floatConvertorCustom, floatDeconvertorCustom))
  }

  getID () {
    return this.id
  }

  destroy (): void {
    super.destroy()
    Step.GenID.remove(this.id)
  }

  setAction (action: Action): Step {
    this.action.set(action)
    this.value.set(action.getValue())
    return this
  }

  getAction () {
    return this.action.get()
  }

  setColor (color: Color): Step {
    this.color = color
    return this
  }

  getColor (): Color {
    return Color.from(this.color)
  }

  setWidth (width: number): Step {
    this.width = width
    return this
  }

  getWidth () {
    return this.width
  }

  getStart () {
    return new Point(this.x1.get(), this.y1.get())
  }

  getEnd () {
    return new Point(this.x2.get(), this.y2.get())
  }

  getRoadIndex (): number {
    return this.roadIndex
  }

  getPosition (): Point {
    return this.roadIntersection
  }

  setIndex (index: number): void {
    this.index.set(index)
  }

  getIndex (): number {
    return this.index.get()
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

    const roadlines = state.scene.renderables().filter(IsInstanceOf(RoadLine)).toArray()
    const roadarcs = state.scene.renderables().filter(IsInstanceOf(RoadArc)).toArray()
    const lines = roadlines.map(road => new Line(road.getStart(), road.getEnd()))
    const arcs = roadarcs.map(road => new Arc(road.getCenter(), road.getRadius(), road.getStartAngle(), road.getEndAngle()))
    const stepLine = new Line(this.getStart(), this.getEnd())

    let i = 0
    this.roadIndex = -1
    for (const line of lines) {
      const intersection = line.intersect(stepLine)
      if (intersection != null) {
        const p = intersection
        /* ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, TAU)
        ctx.fillStyle = Color.Black.toString()
        ctx.fill() */
        this.roadIntersection = p
        this.roadIndex = i
      }
      i++
    }
    for (const arc of arcs) {
      const intersection = arc.intersect(stepLine)
      if (intersection != null) {
        const p = intersection[0]
        /* ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, TAU)
        ctx.fillStyle = Color.Black.toString()
        ctx.fill() */
        this.roadIntersection = p
        this.roadIndex = i
      }
      i++
    }
    if (this.roadIndex < 0) {
      this.destroy()
    }
  }

  static from (line: Line) {
    return new Step(line)
  }

  serialize (): JSONObject {
    return {
      type: 'Step',
      index: this.index.get(),
      line: new Line(this.getStart(), this.getEnd()).serialize(),
      color: this.color.serialize(),
      width: this.width,
      action: this.action.get() instanceof Itinerary.Go ? ['GO', this.value.get()] : this.action.get() instanceof Itinerary.Turn ? ['TURN', this.value.get()] : ['STOP']
    }
  }

  static deserializer: Deserializer<Step> = (data: JSONObject) => {
    if (data.type !== 'Step') throw new Error('bad type')
    const step = Step.from(Line.deserializer(data.line))
    step.setColor(Color.deserializer(data.color))
    step.setWidth(data.width)
    if (data.action[0] === 'GO') {
      step.setAction(Itinerary.Go.from(data.action[1]))
    } else if (data.action[0] === 'TURN') {
      step.setAction(Itinerary.Turn.from(data.action[1]))
    } else {
      step.setAction(Itinerary.Stop.from())
    }
    step.setIndex(data.index || 0)
    return step
  }
}

export default Step
