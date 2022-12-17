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

import { Deserializer, Deserializers, JSONObject } from '../core/object-mapper'
import Rectangle from '../core/rectangle'
import Collection from '../core/collection'
import { CanvasRenderingContext2DTracked, clearCanvas, create2DCanvasContextTracked, isContextTracked, Nullable, ResetTransformation, resize2DCanvasContext } from '../helper/utils'
import Renderable, { RenderableEvents, RenderableType } from './renderable'
import Filter from './filter'
import Filterable from './filterable'
import { HoverResult } from './hover-result'
import { Item } from './item'
import RenderState from './render-state'

export interface LayerOptions {
  name: string
  zIndex?: number
  overflow?: boolean
  background?: string
  type?: RenderableType
}

export class Layer<T extends Renderable = Renderable> extends Renderable implements Filterable {
  private currentZIndex: number
  readonly name: string
  readonly overflow: boolean // ???????????
  readonly background: Nullable<string>

  readonly offscreen: CanvasRenderingContext2DTracked = create2DCanvasContextTracked()
  readonly overscreen: CanvasRenderingContext2DTracked = create2DCanvasContextTracked()

  private collection: Collection<T> = new Collection<T>()
  readonly filters: Collection<Filter> = new Collection<Filter>()

  private ondestroy: (t: T) => void

  constructor (options?: LayerOptions) {
    super()
    if (typeof options === 'undefined') options = { name: 'unnamed layer' }
    this.overflow = typeof options.overflow === 'boolean' ? options.overflow : false
    this.currentZIndex = typeof options.zIndex === 'number' ? options.zIndex : 0
    this.name = options.name
    this.background = typeof options.background === 'string' ? options.background : null
    this.renderingType = typeof options.type !== 'undefined' ? options.type : RenderableType.Normal
    this.zIndex.set(this.currentZIndex)
    this.ondestroy = this.ondestroytrigger(this)
  }

  destroy (): void {
    this.collection.forEach(renderable => renderable.destroy())
    this.collection.clear()
    // destroy filter ???
    // destroy canvas offscreen + overscreen ?????
    this.filters.clear()
  }

  private ondestroytrigger (that: Layer<T>) {
    return (t: T) => {
      t.zIndex.pop()
      that.collection.tryRemove(t)
    }
  }

  addRenderable (t: T) {
    const collection = this.collection
    collection.add(t)
    t.zIndex.push(this.currentZIndex)
    t.on('destroy', this.ondestroy as <K extends RenderableEvents, T extends Renderable<K>> (that: T) => void)
  }

  removeRenderable (t: T) {
    t.zIndex.pop()
    this.collection.remove(t)
    t.off('destroy', this.ondestroy as <K extends RenderableEvents, T extends Renderable<K>> (that: T) => void)
  }

  filter (items?: Collection<Item<unknown>>): void {
    this.filters.forEach(filter => {
      filter.apply(this.offscreen, typeof items === 'undefined' ? this.collection : items)
    })
  }

  setTransform (transform: DOMMatrix) {
    this.offscreen.setTransform(transform)
    this.overscreen.setTransform(transform)
  }

  resetTransform () {
    this.offscreen.setTransform(ResetTransformation())
    this.overscreen.setTransform(ResetTransformation())
  }

  clear (color?: string) {
    clearCanvas(this.offscreen, typeof color === 'undefined' ? this.background == null ? color : this.background : color)
    clearCanvas(this.overscreen)
  }

  save () {
    this.offscreen.save()
    this.overscreen.save()
  }

  restore () {
    this.overscreen.restore()
    this.offscreen.restore()
  }

  rect (box: Rectangle, color: string) {
    this.offscreen.beginPath()
    this.offscreen.rect(box.origin.x, box.origin.y, box.size.x, box.size.y)
    this.offscreen.fillStyle = color
    this.offscreen.fill()
  }

  fit (target: CanvasRenderingContext2D | CanvasRenderingContext2DTracked | HTMLImageElement | HTMLCanvasElement) {
    if (target instanceof CanvasRenderingContext2D || isContextTracked(target)) {
      this.resize(target.canvas.width, target.canvas.height)
    } else if (target instanceof HTMLImageElement) {
      this.resize(target.naturalWidth, target.naturalHeight)
    } else if (target instanceof HTMLCanvasElement) {
      this.resize(target.width, target.height)
    } else {
      throw new Error('unable to fit the layer based on the target')
    }
  }

  resize (width: number, height: number) {
    resize2DCanvasContext(this.offscreen, width, height)
    resize2DCanvasContext(this.overscreen, width, height)
  }

  renderables <K extends RenderableEvents, T extends Renderable<K>> (): Collection<T> {
    return this.collection as unknown as Collection<T>
  }

  getHoveredRenderable (state: RenderState): HoverResult {
    const renderables = [...this.collection.toArray()].sort((a, b) => a.compare(b)).reverse()
    for (const renderable of renderables) {
      if (renderable.overflow) {
        state.push(this.overscreen)
        if (renderable.isHover(state)) return HoverResult.from(this as unknown as Layer, renderable)
        state.pop()
      } else {
        state.push(this.offscreen)
        if (renderable.isHover(state)) return HoverResult.from(this as unknown as Layer, renderable)
        state.pop()
      }
    }
    return HoverResult.Empty
  }

  applyRenderable <V> (state: RenderState, renderable: Renderable, fn: (renderable: Renderable) => V): V {
    if (renderable.overflow) {
      state.push(this.overscreen)
      const r = fn(renderable)
      state.pop()
      return r
    } else {
      state.push(this.offscreen)
      const r = fn(renderable)
      state.pop()
      return r
    }
  }

  render (state: RenderState): void {
    this.offscreen.imageSmoothingEnabled = false
    this.overscreen.imageSmoothingEnabled = false
    const renderables = this.collection.toArray()
    let allrenderables: Array<Renderable> = []
    for (const renderable of renderables) allrenderables = allrenderables.concat(renderable.renderables().toArray())
    allrenderables = allrenderables.concat(renderables).sort((a, b) => a.compare(b))
    for (const renderable of allrenderables) {
      if (renderable.overflow) {
        state.push(this.overscreen)
        renderable.render(state)
        state.pop()
      } else {
        state.push(this.offscreen)
        renderable.render(state)
        state.pop()
      }
    }
  }

  isHover (): boolean {
    return false
  }

  serialize (): JSONObject {
    return {
      type: 'Layer',
      name: this.name,
      zIndex: this.currentZIndex,
      background: this.background,
      renderingType: this.renderingType,
      overflow: this.overflow,
      collection: this.collection.serialize(),
      filters: this.filters.serialize()
    }
  }

  static deserializer: Deserializer<Layer> = (data: JSONObject, types?: Deserializers) => {
    if (data.type !== 'Layer') throw new Error('bad type')
    if (typeof types === 'undefined') throw new Error('unable to deserialize generic class without types')
    const layer = new Layer({
      zIndex: data.zIndex,
      name: data.name,
      type: data.renderingType,
      background: data.background,
      overflow: data.overflow
    })
    Collection.deserializer<Renderable>(data.collection, types).forEach(renderable => layer.addRenderable(renderable))
    Collection.deserializer<Filter>(data.filters, types).forEach(filter => layer.filters.add(filter))
    return layer
  }
}

export default Layer
