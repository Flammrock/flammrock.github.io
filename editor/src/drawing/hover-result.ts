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

import { Nullable } from '../helper/utils'
import Renderable from './renderable'
import { Item } from './item'
import Layer from './layer'
import RenderState from './render-state'

/**
 * Used to contain the element _(which must extends the {@link Renderable} class)_ that is
 * currently hovered by the mouse
 */
export class HoverResult {
  layer: Nullable<Layer>
  renderable: Nullable<Renderable>

  static get Empty () { return new HoverResult() }

  static from (layer: Layer, renderable: Renderable): HoverResult {
    return new HoverResult(layer, renderable)
  }

  private constructor (layer?: Layer, renderable?: Renderable) {
    this.layer = typeof layer !== 'undefined' ? layer : null
    this.renderable = typeof renderable !== 'undefined' ? renderable : null
  }

  hover (state: RenderState): void {
    if (this.renderable == null) return
    this.renderable.hover(state)
  }

  unhover (state: RenderState): void {
    if (this.renderable == null) return
    this.renderable.unhover(state)
  }

  isEmpty () {
    return this.renderable == null
  }

  select () {
    if (this.renderable == null) return
    this.renderable.select()
  }

  unselect () {
    if (this.renderable == null) return
    this.renderable.unselect()
  }

  isGrabbed (): boolean {
    if (this.renderable == null) return false
    if (!(this.renderable instanceof Item)) return false
    return this.renderable.isGrabbed()
  }

  isHover (state: RenderState): boolean {
    if (this.renderable == null || this.layer == null) return false
    return this.layer.applyRenderable(state, this.renderable, renderable => {
      return renderable.isHover(state)
    })
  }

  instance (): Nullable<Renderable> {
    return this.renderable
  }
}
