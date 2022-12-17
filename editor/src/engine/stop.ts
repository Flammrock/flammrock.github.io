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
import { arc, fill, IsInstanceOf, line, MouseButton, rect, stroke } from '../helper/utils'
import Color from '../drawing/color'
import RenderState from '../drawing/render-state'
import { Item } from '../drawing/item'
import { makePointer, Pointer } from '../core/pointer'
import { GrabPoint } from '../drawing/grab-point'
import { DefaultFormBuilder, floatConvertor, floatDeconvertor } from '../core/property'
import { Deserializer, JSONObject } from '../core/object-mapper'
import { Vector } from '../core/vector'
import RenderStatus from '../drawing/render-status'
import MultiColor from '../drawing/multi-color'
import Globals from '../system/globals'
import { RoadLine } from './road-line'
import RoadArc from './road-arc'
import Arc from '../core/arc'

export interface StopProps {
  x1: number
  y1: number
  x2: number
  y2: number
  lightx: number
  lighty: number
  lightdelayR: number
  lightdelayA: number
  lightdelayG: number
  lightphase: number
}

export class Stop extends Item<StopProps> {
  private static GenID: UniqueID = new UniqueID()
  private color: Color
  private id: number
  private width: number

  private x1: Pointer<number>
  private y1: Pointer<number>
  private x2: Pointer<number>
  private y2: Pointer<number>

  private lightx: Pointer<number>
  private lighty: Pointer<number>
  private lightdelayR: Pointer<number>
  private lightdelayA: Pointer<number>
  private lightdelayG: Pointer<number>
  private lightphase: Pointer<number>

  private p1: GrabPoint
  private p2: GrabPoint
  private p3: GrabPoint

  private internalTick
  private time = 0

  private roadIntersection = Point.Zero
  private roadIndex = -1

  constructor (line: Line) {
    super()
    this.width = 2 // TODO: default value
    this.color = Color.Default
    this.id = Stop.GenID.get()

    this.p1 = this.addGrab(line.start, MouseButton.Left)
    this.p2 = this.addGrab(line.end, MouseButton.Left)
    this.p3 = this.addGrab(new Point((line.start.x + line.end.x) / 2, (line.start.y + line.end.y) / 2), MouseButton.Left);

    [this.x1, this.y1] = this.p1.pointers();
    [this.x2, this.y2] = this.p2.pointers();
    [this.lightx, this.lighty] = this.p3.pointers()

    this.lightdelayR = makePointer(4)
    this.lightdelayA = makePointer(3)
    this.lightdelayG = makePointer(2)
    this.lightphase = makePointer(0)

    this.internalTick = this.lightphase.get()

    this.lightphase.on('change', () => {
      this.internalTick = this.lightphase.get()
    })

    this.setProperty('x1', this.x1, floatConvertor, DefaultFormBuilder('x1', this.x1, floatConvertor, floatDeconvertor))
    this.setProperty('y1', this.y1, floatConvertor, DefaultFormBuilder('y1', this.y1, floatConvertor, floatDeconvertor))
    this.setProperty('x2', this.x2, floatConvertor, DefaultFormBuilder('x2', this.x2, floatConvertor, floatDeconvertor))
    this.setProperty('y2', this.y2, floatConvertor, DefaultFormBuilder('y2', this.y2, floatConvertor, floatDeconvertor))

    this.setProperty('lightx', this.lightx, floatConvertor, DefaultFormBuilder('light.x', this.lightx, floatConvertor, floatDeconvertor))
    this.setProperty('lighty', this.lighty, floatConvertor, DefaultFormBuilder('light.y', this.lighty, floatConvertor, floatDeconvertor))

    this.setProperty('lightdelayR', this.lightdelayR, floatConvertor, DefaultFormBuilder('light.delayR', this.lightdelayR, floatConvertor, floatDeconvertor))
    this.setProperty('lightdelayA', this.lightdelayA, floatConvertor, DefaultFormBuilder('light.delayA', this.lightdelayA, floatConvertor, floatDeconvertor))
    this.setProperty('lightdelayG', this.lightdelayG, floatConvertor, DefaultFormBuilder('light.delayG', this.lightdelayG, floatConvertor, floatDeconvertor))
    this.setProperty('lightphase', this.lightphase, floatConvertor, DefaultFormBuilder('light.phase', this.lightphase, floatConvertor, floatDeconvertor))
  }

  getID () {
    return this.id
  }

  destroy (): void {
    super.destroy()
    Stop.GenID.remove(this.id)
  }

  setColor (color: Color): Stop {
    this.color = color
    return this
  }

  getColor (): Color {
    return Color.from(this.color)
  }

  setWidth (width: number): Stop {
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

  setLightPosition (pos: Point): Stop {
    this.lightx.set(pos.x)
    this.lighty.set(pos.y)
    return this
  }

  getLightPosition (): Point {
    return new Point(this.lightx.get(), this.lighty.get())
  }

  setLightDelayR (delayR: number): Stop {
    this.lightdelayR.set(delayR)
    return this
  }

  getLightDelayR (): number {
    return this.lightdelayR.get()
  }

  setLightDelayA (delayA: number): Stop {
    this.lightdelayA.set(delayA)
    return this
  }

  getLightDelayA (): number {
    return this.lightdelayA.get()
  }

  setLightDelayG (delayG: number): Stop {
    this.lightdelayG.set(delayG)
    return this
  }

  getLightDelayG (): number {
    return this.lightdelayG.get()
  }

  setLightPhase (phase: number): Stop {
    this.lightphase.set(phase)
    return this
  }

  getLightPhase (): number {
    return this.lightphase.get()
  }

  getRoadIndex (): number {
    return this.roadIndex
  }

  getPosition (): Point {
    return this.roadIntersection
  }

  render (state: RenderState): void {
    const ctx = state.ctx

    /* compute traffic light tick (1 tick = 1sec) */
    this.time += state.dt
    if (this.time > 1) {
      this.time = 1 - this.time
      this.internalTick++
      if (this.internalTick > this.lightdelayR.get() + this.lightdelayA.get() + this.lightdelayG.get()) this.internalTick = 0
    }

    /* render the stop line */
    ctx.lineCap = 'round'
    ctx.lineWidth = this.width
    line(ctx, this.x1, this.y1, this.x2, this.y2)
    stroke(ctx, this.color)
    if (this.color instanceof MultiColor) {
      this.color.update(state.dt)
    }

    /* render the traffic light */
    if (state.status === RenderStatus.Screen) {
      ctx.lineCap = 'butt'
      rect(ctx, this.lightx, this.lighty, 10)
      if (this.internalTick >= 0 && this.internalTick < this.lightdelayG.get()) {
        fill(ctx, Color.Green)
      } else if (this.internalTick >= this.lightdelayG.get() && this.internalTick < this.lightdelayG.get() + this.lightdelayA.get()) {
        fill(ctx, Color.Amber)
      } else {
        fill(ctx, Color.Red)
      }
      rect(ctx, this.lightx, this.lighty, 2)
      fill(ctx, Color.White)
    }

    const roadlines = state.scene.renderables().filter(IsInstanceOf(RoadLine)).toArray()
    const roadarcs = state.scene.renderables().filter(IsInstanceOf(RoadArc)).toArray()
    const lines = roadlines.map(road => new Line(road.getStart(), road.getEnd()))
    const arcs = roadarcs.map(road => new Arc(road.getCenter(), road.getRadius(), road.getStartAngle(), road.getEndAngle()))
    const stepLine = new Line(this.getStart(), this.getEnd())

    let i = 0
    this.roadIndex = -1
    let type: 'line' | 'arc' = 'line'
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
        type = 'line'
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
        type = 'arc'
      }
      i++
    }
    if (this.roadIndex < 0) {
      this.destroy()
      return
    }

    let v
    if (type === 'line') {
      v = new Vector(lines[this.roadIndex].start, lines[this.roadIndex].end).normalized().orthogonal()
    } else {
      v = new Vector(arcs[this.roadIndex - lines.length].center, this.roadIntersection).normalized()
    }
    const pos = v.negate().orthogonal()

    /* render the cone of view */
    if (state.status === RenderStatus.Screen) {
      ctx.lineWidth = 0.5
      arc(ctx, this.roadIntersection.x, this.roadIntersection.y, Globals.TLView, pos.argument() - Math.acos(Globals.TLCosDir), pos.argument() + Math.acos(Globals.TLCosDir), true)
      stroke(ctx, Color.Black)
    }

    /* if traffic light out of the cone of view then re-move it inside */
    if (!state.isPointInPath(this.lightx.get(), this.lighty.get())) {
      this.lightx.set(this.roadIntersection.x + pos.x * 14 + v.x * 8)
      this.lighty.set(this.roadIntersection.y + pos.y * 14 + v.y * 8)
    }
  }

  static from (line: Line) {
    return new Stop(line)
  }

  serialize (): JSONObject {
    return {
      type: 'Stop',
      line: new Line(this.getStart(), this.getEnd()).serialize(),
      color: this.color.serialize(),
      width: this.width,
      lightPos: new Point(this.lightx.get(), this.lighty.get()).serialize(),
      delayR: this.lightdelayR.get(),
      delayA: this.lightdelayA.get(),
      delayG: this.lightdelayG.get(),
      phase: this.lightphase.get()
    }
  }

  static deserializer: Deserializer<Stop> = (data: JSONObject) => {
    if (data.type !== 'Stop') throw new Error('bad type')
    const stop = Stop.from(Line.deserializer(data.line))
    stop.setColor(Color.deserializer(data.color))
    stop.setWidth(data.width)
    stop.setLightPosition(Point.deserializer(data.lightPos))
    stop.setLightDelayR(data.delayR)
    stop.setLightDelayA(data.delayA)
    stop.setLightDelayG(data.delayG)
    stop.setLightPhase(data.phase)
    return stop
  }
}

export default Stop
