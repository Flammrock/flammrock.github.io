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
import { MouseButton } from '../helper/utils'
import RenderState from '../drawing/render-state'
import { Item } from '../drawing/item'
import { makePointer, Pointer } from '../core/pointer'
import { GrabPoint } from '../drawing/grab-point'
import { DefaultFormBuilder, floatConvertor, floatDeconvertor } from '../core/property'
import { Deserializer, JSONObject } from '../core/object-mapper'

export interface ObstacleProps {
  x: number
  y: number
  since: number
  till: number
}

export class Obstacle extends Item<ObstacleProps> {
  private static GenID: UniqueID = new UniqueID()

  private x: Pointer<number>
  private y: Pointer<number>
  private since: Pointer<number>
  private till: Pointer<number>

  private id: number

  private grab: GrabPoint

  private image: HTMLImageElement
  private imageloaded: boolean

  constructor (pt: Point) {
    super()

    this.id = Obstacle.GenID.get()

    const that = this
    this.imageloaded = false
    this.image = new Image()
    this.image.onload = () => {
      that.imageloaded = true
    }
    this.image.src = 'data:image/png;base64,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'

    this.grab = this.addGrab(pt, MouseButton.Left);

    [this.x, this.y] = this.grab.pointers()

    this.since = makePointer(1)
    this.till = makePointer(8)

    this.setProperty('x', this.x, floatConvertor, DefaultFormBuilder('x', this.x, floatConvertor, floatDeconvertor))
    this.setProperty('y', this.y, floatConvertor, DefaultFormBuilder('y', this.y, floatConvertor, floatDeconvertor))
    this.setProperty('since', this.since, floatConvertor, DefaultFormBuilder('since', this.since, floatConvertor, floatDeconvertor))
    this.setProperty('till', this.till, floatConvertor, DefaultFormBuilder('till', this.till, floatConvertor, floatDeconvertor))
  }

  getID () {
    return this.id
  }

  destroy (): void {
    super.destroy()
    Obstacle.GenID.remove(this.id)
  }

  setSince (since: number) {
    this.since.set(since)
  }

  getSince () {
    return this.since.get()
  }

  setTill (till: number) {
    this.till.set(till)
  }

  getTill () {
    return this.till.get()
  }

  setPosition (pos: Point) {
    this.x.set(pos.x)
    this.y.set(pos.y)
  }

  getPosition () {
    return new Point(this.x.get(), this.y.get())
  }

  render (state: RenderState): void {
    super.render(state)
    const ctx = state.ctx
    if (this.imageloaded) {
      ctx.drawImage(this.image, -this.image.naturalWidth / 2 + this.x.get(), -this.image.naturalHeight / 2 + this.y.get())
    }
  }

  isHover (state: RenderState) {
    if (super.isHover(state)) return true
    const ctx = state.ctx
    if (this.imageloaded) {
      ctx.beginPath()
      ctx.rect(-this.image.naturalWidth / 2 + this.x.get(), -this.image.naturalHeight / 2 + this.y.get(), this.image.naturalWidth, this.image.naturalHeight)
      return state.isMouseInPath()
    }
    return false
  }

  static from (pt: Point) {
    return new Obstacle(pt)
  }

  serialize (): JSONObject {
    return {
      type: 'Obstacle',
      position: this.getPosition().serialize(),
      since: this.since.get(),
      till: this.till.get()
    }
  }

  static deserializer: Deserializer<Obstacle> = (data: JSONObject) => {
    if (data.type !== 'Obstacle') throw new Error('bad type')
    const obs = Obstacle.from(Point.deserializer(data.position))
    obs.setSince(data.since)
    obs.setTill(data.till)
    return obs
  }
}

export default Obstacle
