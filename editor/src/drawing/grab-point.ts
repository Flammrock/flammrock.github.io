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

import { StrictEventEmitter } from 'strict-event-emitter'
import Draggable from '../core/draggable'
import Point from '../core/point'
import { MouseButton, Nullable, TAU } from '../helper/utils'
import RenderState from './render-state'
import Renderable, { RenderableEvents } from './renderable'
import Grab from './grab'
import { makePointer, Pointer } from '../core/pointer'
import { Deserializer, JSONObject } from '../core/object-mapper'
import Collection from '../core/collection'
import MultiColor from './multi-color'
import Color from './color'

// todo: draggable interface to factorize register, unregister, and basic properties ondrag<...>

/**
 * This class is part of the Grab System. A {@link GrabPoint} instance is listening
 * some {@link MouseEvent | mouse events} to allow the user to move the {@link GrabPoint} somewhere else.
 *
 * @experimental
 *
 * @see [Grab](./grab.ts)
 * @see [GrabRectangle](./grab-rectangle.ts)
 */
export class GrabPoint extends Grab<Point> {
  readonly overflow: boolean = true

  private tmppos: Nullable<Point> = null
  private button: MouseButton
  private hovered = false
  private grabbed = false
  private registered = false
  private instance: Renderable

  private x: Pointer<number>
  private y: Pointer<number>
  private color: MultiColor = new MultiColor(5)
  private radius = 20
  private time = 0

  private ondragstart: (mousePosition: Point, mouseButton: MouseButton) => void
  private ondragstep: (mousePosition: Point) => void
  private ondragcancel: () => void
  private ondragend: (mousePosition: Point) => void

  private dispatchers: Map<StrictEventEmitter<Draggable>, boolean> = new Map<StrictEventEmitter<Draggable>, boolean>()

  constructor (position: Point, button: MouseButton) {
    super()
    this.instance = this
    this.button = button
    this.ondragstart = this.dragstart(this)
    this.ondragstep = this.dragstep(this)
    this.ondragcancel = this.dragcancel(this)
    this.ondragend = this.dragend(this)

    this.x = makePointer(position.x)
    this.y = makePointer(position.y)
  }

  destroy (): void {
    super.destroy()
    const dispatchers = Array.from(this.dispatchers.keys())
    for (const dispatcher of dispatchers) {
      this.unregister(dispatcher)
    }
  }

  pointers () {
    return [this.x, this.y]
  }

  setPosition (pos: Point) {
    this.x.set(pos.x)
    this.y.set(pos.y)
  }

  getPosition () {
    return new Point(this.x.get(), this.y.get())
  }

  render (state: RenderState): void {
    if (!this.registered) return
    const ctx = state.ctx
    this.time += state.dt
    if (this.time > TAU) this.time = TAU - this.time
    this.radius = 20 + 4 * Math.sin(this.time)
    const t = ctx.getTransform()
    const scale = (t.a + t.d) / 2
    const radius = this.radius / scale
    this.color.update(state.dt)
    const gradient = ctx.createRadialGradient(this.x.get(), this.y.get(), 0, this.x.get(), this.y.get(), radius)
    gradient.addColorStop(0, this.color.toString())
    gradient.addColorStop(1, `rgba(${this.color.r},${this.color.g},${this.color.b},0.3)`)
    ctx.beginPath()
    ctx.arc(this.x.get(), this.y.get(), radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.closePath()
    ctx.beginPath()
    ctx.arc(this.x.get(), this.y.get(), radius / 5, 0, 2 * Math.PI, false)
    ctx.fillStyle = Color.Black.toString()
    ctx.fill()
    ctx.lineWidth = 4 / scale
    ctx.beginPath()
    ctx.arc(this.x.get(), this.y.get(), radius + 2 / scale, 0, 2 * Math.PI, false)
    ctx.strokeStyle = Color.Black.toString()
    ctx.stroke()
    ctx.lineWidth = 4 / scale
    ctx.beginPath()
    ctx.arc(this.x.get(), this.y.get(), radius, 0, 2 * Math.PI, false)
    ctx.strokeStyle = this.color.toString()
    ctx.stroke()
    ctx.lineWidth = 1
  }

  isHover (state: RenderState) {
    const ctx = state.ctx
    const t = ctx.getTransform()
    ctx.beginPath()
    ctx.arc(this.x.get(), this.y.get(), 20 / ((t.a + t.d) / 2), 0, 2 * Math.PI, false)
    ctx.closePath()
    this.hovered = state.isMouseInPath()
    return this.hovered
  }

  isGrabbed (): boolean {
    return this.grabbed
  }

  hover (state: RenderState) {
    this.register(state.dispatcher)
  }

  unhover (state: RenderState): void {
    this.unregister(state.dispatcher)
  }

  forceHover () {
    this.hovered = true
  }

  renderables <K extends RenderableEvents, T extends Renderable<K>> (): Collection<T> {
    return Collection.Empty()
  }

  register (dispatcher: StrictEventEmitter<Draggable>, instance?: Renderable) {
    this.registered = true
    this.instance = typeof instance === 'undefined' ? this : instance
    this.dispatchers.set(dispatcher, true)
    dispatcher.on('dragstart', this.ondragstart)
    dispatcher.on('dragstep', this.ondragstep)
    dispatcher.on('dragcancel', this.ondragcancel)
    dispatcher.on('dragend', this.ondragend)
  }

  unregister (dispatcher: StrictEventEmitter<Draggable>) {
    this.grabbed = false
    this.hovered = false
    this.instance = this
    this.dispatchers.delete(dispatcher)
    this.registered = false
    dispatcher.off('dragstart', this.ondragstart)
    dispatcher.off('dragstep', this.ondragstep)
    dispatcher.off('dragcancel', this.ondragcancel)
    dispatcher.off('dragend', this.ondragend)
  }

  private dragstart (that: GrabPoint) {
    return (mousePosition: Point, mouseButton: MouseButton) => {
      if (mouseButton === that.button && this.hovered) {
        that.tmppos = Point.sub(mousePosition, that.getPosition())
      } else that.tmppos = null
      if (that.grabbed) {
        that.grabbed = false
        // that.instance.unselect()
      }
    }
  }

  private dragstep (that: GrabPoint) {
    return (mousePosition: Point) => {
      if (that.tmppos != null) {
        that.setPosition(Point.sub(mousePosition, that.tmppos))
        if (!that.grabbed) {
          that.instance.select()
        }
        that.grabbed = true
        that.emit('change', that.getPosition())
        return
      }
      if (that.grabbed) {
        that.grabbed = false
        // that.instance.unselect()
      }
    }
  }

  private dragend (that: GrabPoint) {
    return (mousePosition: Point) => {
      if (that.tmppos != null) {
        that.setPosition(Point.sub(mousePosition, that.tmppos))
        that.emit('change', that.getPosition())
      }
      if (that.grabbed) {
        that.grabbed = false
        // that.instance.unselect()
      }
      that.tmppos = null
    }
  }

  private dragcancel (that: GrabPoint) {
    return () => {
      that.tmppos = null
      if (that.grabbed) {
        that.grabbed = false
        // that.instance.unselect()
      }
    }
  }

  serialize (): JSONObject {
    return {
      ...super.serialize(),
      type: 'GrabPoint',
      button: this.button,
      position: this.getPosition().serialize()
    }
  }

  static deserializer: Deserializer<GrabPoint> = (data: JSONObject) => {
    if (data.type !== 'GrabPoint') throw new Error('bad type')
    if (typeof data.button !== 'number') throw new Error('bad type')
    return new GrabPoint(Point.deserializer(data.position), data.button)
  }
}
