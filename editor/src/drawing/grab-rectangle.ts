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
import { Deserializer, JSONObject } from '../core/object-mapper'
import Point from '../core/point'
import { makePointer, Pointer } from '../core/pointer'
import Rectangle from '../core/rectangle'
import { MouseButton } from '../helper/utils'
import Renderable, { RenderableEvents } from './renderable'
import Grab from './grab'
import { GrabPoint } from './grab-point'
import RenderState from './render-state'
import Collection from '../core/collection'

/**
 * This class is part of the Grab System. A {@link GrabRectangle} instance is listening
 * some {@link MouseEvent | mouse events} to allow the user to move the {@link GrabRectangle} somewhere else.
 *
 * @experimental
 *
 * @see [Grab](./grab.ts)
 * @see [GrabPoint](./grab-point.ts)
 */
export class GrabRectangle extends Grab<Rectangle> {
  readonly overflow: boolean = true

  private grabPoints: [GrabPoint, GrabPoint, GrabPoint, GrabPoint]

  /* if true then the original ratio will be preserved during grabbing */
  private keepRatio = false

  /* will contain original ratio */
  private ratio = 0

  private registered = false

  /* keep track of x (x1), y (y1), width (x2) and height (y2) */
  private x1: Pointer<number>
  private y1: Pointer<number>
  private x2: Pointer<number>
  private y2: Pointer<number>

  /**
   * @returns the four [GrabPoint](./grab-point.ts) of this {@link GrabRectangle}
   *
   * @see {@link grabPoints}
   */
  getGrabPoints () {
    return this.grabPoints
  }

  constructor (box: Rectangle, button: MouseButton) {
    super()
    const origin = Point.duplicate(box.origin)
    const size = Point.duplicate(box.size)

    this.ratio = box.ratio()

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this

    this.x1 = makePointer(origin.x)
    this.y1 = makePointer(origin.y)
    this.x2 = makePointer(size.x)
    this.y2 = makePointer(size.y)

    const grabPoints: [GrabPoint, GrabPoint, GrabPoint, GrabPoint] = [
      new GrabPoint(origin, button),
      new GrabPoint(Point.add(origin, new Point(size.x, 0)), button),
      new GrabPoint(Point.add(origin, size), button),
      new GrabPoint(Point.add(origin, new Point(0, size.y)), button)
    ]

    grabPoints[0].on('change', (p) => {
      if (that.keepRatio) {
        p.y -= (grabPoints[2].getPosition().x - p.x) / that.ratio - (grabPoints[2].getPosition().y - p.y)
      }
      const origin = new Point(that.x1.get(), that.y1.get())
      const size = new Point(that.x2.get(), that.y2.get())
      that.x1.set(p.x)
      that.y1.set(p.y)
      that.x2.set(grabPoints[2].getPosition().x - p.x)
      that.y2.set(grabPoints[2].getPosition().y - p.y)
      grabPoints[1].setPosition(Point.add(origin, new Point(size.x, 0)))
      grabPoints[3].setPosition(Point.add(origin, new Point(0, size.y)))
      that.emit('change', Rectangle.from(that.x1.get(), that.y1.get(), that.x2.get(), that.y2.get()))
    })
    grabPoints[2].on('change', (p) => {
      if (that.keepRatio) {
        p.y -= (grabPoints[0].getPosition().x - p.x) / that.ratio - (grabPoints[0].getPosition().y - p.y)
      }
      const origin = new Point(that.x1.get(), that.y1.get())
      const size = new Point(that.x2.get(), that.y2.get())
      that.x2.set(p.x - origin.x)
      that.y2.set(p.y - origin.y)
      grabPoints[1].setPosition(Point.add(origin, new Point(size.x, 0)))
      grabPoints[3].setPosition(Point.add(origin, new Point(0, size.y)))
      that.emit('change', Rectangle.from(that.x1.get(), that.y1.get(), that.x2.get(), that.y2.get()))
    })
    grabPoints[1].on('change', (p) => {
      if (that.keepRatio) {
        p.y += (grabPoints[3].getPosition().x - p.x) / that.ratio + (grabPoints[3].getPosition().y - p.y)
      }
      const origin = new Point(that.x1.get(), that.y1.get())
      const size = new Point(that.x2.get(), that.y2.get())
      that.x1.set(p.x - size.x)
      that.y1.set(p.y)
      that.x2.set(p.x - grabPoints[3].getPosition().x)
      that.y2.set(grabPoints[3].getPosition().y - p.y)
      grabPoints[0].setPosition(origin)
      grabPoints[2].setPosition(Point.add(origin, size))
      that.emit('change', Rectangle.from(that.x1.get(), that.y1.get(), that.x2.get(), that.y2.get()))
    })
    grabPoints[3].on('change', (p) => {
      if (that.keepRatio) {
        p.y += (grabPoints[1].getPosition().x - p.x) / that.ratio + (grabPoints[1].getPosition().y - p.y)
      }
      const origin = new Point(that.x1.get(), that.y1.get())
      const size = new Point(that.x2.get(), that.y2.get())
      that.x1.set(p.x)
      that.y1.set(p.y - size.y)
      that.x2.set(grabPoints[1].getPosition().x - p.x)
      that.y2.set(p.y - grabPoints[1].getPosition().y)
      grabPoints[0].setPosition(origin)
      grabPoints[2].setPosition(Point.add(origin, size))
      that.emit('change', Rectangle.from(that.x1.get(), that.y1.get(), that.x2.get(), that.y2.get()))
    })

    this.grabPoints = grabPoints
  }

  /**
   * @inheritdoc
   */
  destroy (): void {
    super.destroy()

    /* dont forget to destroy internal grabpoints too */
    for (const grabPoint of this.grabPoints) {
      grabPoint.destroy()
    }
  }

  /**
   * Allow to have access to the actual position and size of this {@link GrabRectangle}
   *
   * @returns the four pointers to have access to respectively : [x, y, width, height]
   */
  pointers () {
    return [this.x1, this.y1, this.x2, this.y2]
  }

  /**
   * Allow to fit this {@link GrabRectangle} to a box
   *
   * @param box a {@link Rectangle}
   */
  refresh (box: Rectangle): void {
    this.ratio = box.ratio()
    this.x1.set(box.origin.x)
    this.y1.set(box.origin.y)
    this.x2.set(box.size.x)
    this.y2.set(box.size.y)
    this.grabPoints[0].setPosition(box.origin)
    this.grabPoints[1].setPosition(Point.add(box.origin, new Point(box.size.x, 0)))
    this.grabPoints[2].setPosition(Point.add(box.origin, box.size))
    this.grabPoints[3].setPosition(Point.add(box.origin, new Point(0, box.size.y)))
  }

  /**
   * @inheritdoc
   */
  render (state: RenderState): void {
    if (!this.registered) return

    const ctx = state.ctx

    /* connect all grabpoints together with a line */
    ctx.beginPath()
    ctx.lineWidth = 1
    let firstpt = true
    for (const grabPoint of this.grabPoints) {
      const pt = grabPoint.getPosition()
      if (firstpt) {
        firstpt = false
        ctx.moveTo(pt.x, pt.y)
      } else {
        ctx.lineTo(pt.x, pt.y)
      }
    }
    ctx.closePath()
    ctx.strokeStyle = 'red'
    ctx.stroke()

    /* dont forget to render grabpoints then */
    for (const grabPoint of this.grabPoints) {
      grabPoint.render(state)
    }
  }

  hover (state: RenderState) {
    this.registered = true
    for (const grabPoint of this.grabPoints) {
      grabPoint.hover(state)
    }
  }

  unhover (state: RenderState): void {
    this.registered = false
    for (const grabPoint of this.grabPoints) {
      grabPoint.unhover(state)
    }
  }

  isGrabbed (): boolean {
    for (const grabPoint of this.grabPoints) {
      if (grabPoint.isGrabbed()) return true
    }
    return false
  }

  /**
   * @inheritdoc
   */
  isHover (state: RenderState) {
    const ctx = state.ctx
    ctx.beginPath()
    ctx.lineWidth = 1
    let firstpt = true
    for (const grabPoint of this.grabPoints) {
      const pt = grabPoint.getPosition()
      if (firstpt) {
        firstpt = false
        ctx.moveTo(pt.x, pt.y)
      } else {
        ctx.lineTo(pt.x, pt.y)
      }
    }
    ctx.closePath()
    let v = false
    let b = false
    if (state.isMouseInPath()) v ||= true
    for (const grabPoint of this.grabPoints) {
      if (grabPoint.isHover(state)) { v ||= true; b ||= true }
    }
    if (!b) {
      for (const grabPoint of this.grabPoints) grabPoint.forceHover()
    }
    return v
  }

  /**
   * @inheritdoc
   */
  renderables <K extends RenderableEvents, T extends Renderable<K>> (): Collection<T> {
    /* this.getGrabPoints() as unknown as Array<T> */
    return Collection.Empty()
  }

  /**
   * @inheritdoc
   */
  register (dispatcher: StrictEventEmitter<Draggable>, instance?: Renderable): void {
    this.registered = true
    for (const grabPoint of this.grabPoints) {
      grabPoint.register(dispatcher, instance)
    }
  }

  /**
   * @inheritdoc
   */
  unregister (dispatcher: StrictEventEmitter<Draggable>): void {
    this.registered = false
    for (const grabPoint of this.grabPoints) {
      grabPoint.unregister(dispatcher)
    }
  }

  serialize (): JSONObject {
    return {
      ...super.serialize(),
      type: 'GrabRectangle',
      overflow: this.overflow,
      keepRatio: this.keepRatio,
      box: Rectangle.from(this.x1.get(), this.y1.get(), this.x2.get(), this.y2.get()).serialize()
    }
  }

  static deserializer: Deserializer<GrabRectangle> = (data: JSONObject) => {
    if (data.type !== 'GrabRectangle') throw new Error('bad type')
    if (typeof data.button !== 'number') throw new Error('bad type')
    // todo: keepRatio
    return new GrabRectangle(Rectangle.deserializer(data.box), data.button)
  }
}

export default GrabRectangle
