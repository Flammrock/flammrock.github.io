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
import { isImageLoaded, MouseButton } from '../helper/utils'
import RenderState from './render-state'
import { Item } from './item'
import Rectangle from '../core/rectangle'
import { Pointer } from '../core/pointer'
import GrabRectangle from './grab-rectangle'
import { DefaultFormBuilder, floatConvertor, floatDeconvertor } from '../core/property'
import { JSONObject, Deserializer } from '../core/object-mapper'

export interface SpriteProps {
  x: number
  y: number
  width: number
  height: number
  zIndex: number
}

export class Sprite extends Item<SpriteProps> {
  private static GenID: UniqueID = new UniqueID()
  private box: Rectangle = Rectangle.Zero
  private id: number
  private internal: HTMLImageElement
  private _isloaded: boolean
  private _keep_ratio: boolean

  private x: Pointer<number>
  private y: Pointer<number>
  private width: Pointer<number>
  private height: Pointer<number>

  private grab: GrabRectangle

  constructor (image: HTMLImageElement, box?: Rectangle) {
    super()
    this.id = Sprite.GenID.get()
    this.internal = image
    this._isloaded = typeof box === 'undefined' ? isImageLoaded(this.internal) : true
    this._keep_ratio = false

    if (this._isloaded) {
      this.box = typeof box !== 'undefined' ? Rectangle.duplicate(box) : Rectangle.from(-this.internal.naturalWidth / 2, -this.internal.naturalHeight / 2, this.internal.naturalWidth, this.internal.naturalHeight)
    }

    this.grab = this.addGrab(this.box, MouseButton.Left)
    this.zIndex.set(0);
    [this.x, this.y, this.width, this.height] = this.grab.pointers()

    this.setProperty('x', this.x, floatConvertor, DefaultFormBuilder('x', this.x, floatConvertor, floatDeconvertor))
    this.setProperty('y', this.y, floatConvertor, DefaultFormBuilder('y', this.y, floatConvertor, floatDeconvertor))
    this.setProperty('width', this.width, floatConvertor, DefaultFormBuilder('width', this.width, floatConvertor, floatDeconvertor))
    this.setProperty('height', this.height, floatConvertor, DefaultFormBuilder('height', this.height, floatConvertor, floatDeconvertor))
    this.setProperty('zIndex', this.zIndex, floatConvertor, DefaultFormBuilder('z-index', this.zIndex, floatConvertor, floatDeconvertor))
  }

  getID () {
    return this.id
  }

  destroy (): void {
    super.destroy()
    Sprite.GenID.remove(this.id)
  }

  render (state: RenderState): void {
    const ctx = state.ctx
    if (!this._isloaded && isImageLoaded(this.internal)) {
      this._isloaded = true
      this.box = Rectangle.from(-this.internal.naturalWidth / 2, -this.internal.naturalHeight / 2, this.internal.naturalWidth, this.internal.naturalHeight)
      this.grab.refresh(this.box)
    }
    if (this._isloaded && isImageLoaded(this.internal)) {
      const origin = new Point(this.x.get(), this.y.get())
      const size = new Point(this.width.get(), this.height.get())
      const d = Point.sub(new Point(this.x.get(), this.y.get()), new Point(this.x.get() + this.width.get(), this.y.get() + this.height.get()))
      ctx.translate(origin.x, origin.y)
      ctx.scale(d.x < 0 ? 1 : -1, d.y < 0 ? 1 : -1)
      ctx.drawImage(this.internal, d.x < 0 ? 0 : -size.x, d.y < 0 ? 0 : -size.y, size.x, size.y)
      ctx.scale(d.x < 0 ? 1 : -1, d.y < 0 ? 1 : -1)
      ctx.translate(-origin.x, -origin.y)
    }
  }

  static from (source: FileList): Array<Promise<Sprite>>
  static from (source: File): Promise<Sprite>
  static from (source: HTMLImageElement, box?: Rectangle): Sprite
  static from (source: FileList | File | HTMLImageElement, box?: Rectangle): Array<Promise<Sprite>> | Promise<Sprite> | Sprite {
    if (source instanceof HTMLImageElement) {
      return new Sprite(source, box)
    } else if (source instanceof File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = function (e) {
          if (e.target == null) return reject(new Error('unable to load the image'))
          const image = new Image()
          image.src = e.target.result as string
          resolve(Sprite.from(image))
        }
        reader.readAsDataURL(source)
      })
    } else {
      const p = []
      for (let i = 0; i < source.length; i++) {
        p.push(Sprite.from(source[i]))
      }
      return p
    }
  }

  serialize (): JSONObject {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx == null) throw new Error('unable to get 2d context')
    canvas.height = this.internal.naturalHeight
    canvas.width = this.internal.naturalWidth
    ctx.drawImage(this.internal, 0, 0)
    return {
      type: 'Sprite',
      box: Rectangle.from(this.x.get(), this.y.get(), this.width.get(), this.height.get()).serialize(),
      zIndex: this.zIndex.get(),
      image: canvas.toDataURL()
    }
  }

  static deserializer: Deserializer<Sprite> = (data: JSONObject) => {
    if (data.type !== 'Sprite') throw new Error('bad type')
    const image = new Image()
    const box = Rectangle.deserializer(data.box)
    const sprite = Sprite.from(image, box)
    sprite.zIndex.set(data.zIndex)
    image.src = data.image
    return sprite
  }
}

export default Sprite
