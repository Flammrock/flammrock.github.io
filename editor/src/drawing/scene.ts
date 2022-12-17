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
import { fromCanvas, RGBA } from 'binary-bmp'
import Renderable, { RenderableEvents, RenderableType } from './renderable'
import { clip, create2DCanvasContextTracked, Nullable, ResetTransformation, unclip } from '../helper/utils'
import Rectangle from '../core/rectangle'
import Collection from '../core/collection'
import RenderState from './render-state'
import Layer from './layer'
import { HoverResult } from './hover-result'
import Point from '../core/point'
import Canvas from './canvas'
import { Deserializer, Deserializers, JSONObject } from '../core/object-mapper'
import RenderStatus from './render-status'

export class Scene extends Renderable {
  readonly overflow: boolean = false

  private name: string

  private box: Nullable<Rectangle> = null // if null infinite
  readonly layers: Collection<Layer> = new Collection<Layer>()

  private grabEnabled = false
  private hovered = HoverResult.Empty
  private selected = false

  static get Empty () { return new Scene(Rectangle.from(-50, -50, 100, 100)) }

  constructor(box?: Rectangle)
  constructor (name?: string | Rectangle, box?: Rectangle) {
    super()
    this.name = typeof name === 'string' ? name : 'unnamed'
    this.box = typeof box === 'undefined' ? name instanceof Rectangle ? Rectangle.duplicate(name) : null : Rectangle.duplicate(box)
  }

  destroy (): void {
    this.layers.forEach(layer => layer.destroy())
    this.layers.destroy()
    this.disableGrab()
  }

  renderables <K extends RenderableEvents, T extends Renderable<K>> (): Collection<T> {
    let renderables: Array<T> = []
    this.layers.forEach(layer => {
      renderables = renderables.concat(layer.renderables().toArray() as Array<T>)
    })
    return Collection.from(renderables)
  }

  enableGrab () {
    this.grabEnabled = true
  }

  disableGrab () {
    this.grabEnabled = false
  }

  isGrabEnabled () {
    return this.grabEnabled
  }

  getBox (): Rectangle {
    return this.box == null ? Rectangle.Zero : this.box
  }

  toBMP (layersname?: Array<string>) {
    if (this.box == null) throw new Error('infinite canvas to bmp not yet implemented')
    const mix = create2DCanvasContextTracked()
    mix.canvas.width = this.box.size.x // buggued
    mix.canvas.height = this.box.size.y

    mix.setTransform(ResetTransformation())
    mix.translate(-this.box.origin.x, -this.box.origin.y)

    const renderingTypes: Record<string, RenderableType> = {}
    this.layers.forEach(layer => { renderingTypes[layer.name] = layer.getRenderingType() })

    if (typeof layersname !== 'undefined') {
      this.layers.forEach(layer => layer.setRenderingType(RenderableType.Draft))
      layersname.forEach((name) => {
        const layer = this.layers.find((layer): layer is Layer => layer.name === name)
        if (layer == null) return
        if (renderingTypes[layer.name] === RenderableType.Draft) return
        layer.setRenderingType(RenderableType.Normal)
      })
    }

    this.renderInternal(new RenderState(RenderStatus.File, new Canvas(), this, 0, mix, new Point()), false)

    this.layers.forEach(layer => layer.setRenderingType(renderingTypes[layer.name]))

    // mix.canvas.style.cssText = 'position: absolute; left: 10px; top: 10px; border: 1px solid red; z-index: 99999999; transform: scale(0.5); background:blue;'
    // document.body.appendChild(mix.canvas)

    const rgba = fromCanvas(RGBA, mix.canvas)
    return new Blob([rgba], { type: 'image/bmp' })
  }

  setName (name: string): void {
    this.name = name
  }

  getName (): string {
    return this.name
  }

  resize (width: number, height: number): void {
    this.box = Rectangle.from(-width / 2, -height / 2, width, height)
  }

  // should reset all stuff? maybe empty or something ??
  reset () {
    this.layers.forEach(layer => {
      layer.renderables().forEach(renderable => renderable.destroy())
      layer.renderables().destroy()
    })
    this.layers.forEach(layer => layer.resetTransform())
  }

  render (state: RenderState) {
    this.renderInternal(state, true)
  }

  isHover (): boolean {
    return false
  }

  private renderInternal (state: RenderState, b: boolean): void {
    const ctx = state.ctx

    // todo: pop this state (reset)
    if (this.isGrabEnabled()) {
      state.enableHover()
    } else {
      state.disableHover()
      if (!this.hovered.isEmpty()) this.hovered.unhover(state)
      this.hovered = HoverResult.Empty
    }

    const t = ctx.duplicateTransform()
    ctx.setTransform(ResetTransformation())

    this.layers.forEach(layer => {
      if (!b && layer.getRenderingType() === RenderableType.Draft) return
      layer.fit(ctx)
    })
    this.layers.forEach(layer => {
      if (!b && layer.getRenderingType() === RenderableType.Draft) return
      layer.clear()
    })
    this.layers.forEach(layer => {
      if (!b && layer.getRenderingType() === RenderableType.Draft) return
      layer.setTransform(t)
    })

    // sort
    const layers = this.layers.toArray().sort((a, b) => a.compare(b))

    // hover
    if (!this.hovered.isEmpty() && this.hovered.isGrabbed()) {
      if (!this.selected) {
        this.selected = true
        this.hovered.select()
      }
      if (!this.hovered.isHover(state) && !this.hovered.isGrabbed()) {
        this.hovered.unhover(state)
        this.hovered = HoverResult.Empty
      }
    } else {
      this.selected = false
      const layershover = [...this.layers.toArray()].sort((a, b) => b.compare(a))
      const oldhovered = this.hovered
      let renderable = HoverResult.Empty
      for (const layer of layershover) {
        const d = layer.getHoveredRenderable(state)
        if (!d.isEmpty()) {
          renderable = d
          break
        }
      }
      this.hovered = renderable
      if (this.hovered.instance() !== oldhovered.instance()) {
        oldhovered?.unhover(state)
      }
      if (!this.hovered.isEmpty() && oldhovered.instance() !== renderable.instance()) {
        this.hovered.hover(state)
      }
    }

    // render
    layers.forEach(layer => {
      if (!b && layer.getRenderingType() === RenderableType.Draft) return
      layer.render(state)
    })

    // apply filters
    this.layers.forEach(layer => {
      if (!b && layer.getRenderingType() === RenderableType.Draft) return
      layer.filter(this.renderables())
    })

    // draw (+ clip)
    layers.forEach(layer => {
      if (!b && layer.getRenderingType() === RenderableType.Draft) return
      if (this.box != null) {
        clip(ctx, t, this.box)
      }
      ctx.drawImage(layer.offscreen.canvas, 0, 0)
      if (this.box != null) {
        unclip(ctx)
      }
      ctx.drawImage(layer.overscreen.canvas, 0, 0)
    })

    ctx.setTransform(t)
  }

  serialize (): JSONObject {
    const json: JSONObject = {
      type: 'Scene',
      name: this.getName()
    }
    if (this.box != null) json.box = this.box.serialize()
    return {
      ...json,
      layers: this.layers.serialize()
    }
  }

  static deserializer: Deserializer<Scene> = (data: JSONObject, types?: Deserializers) => {
    if (data.type !== 'Scene') throw new Error('bad type')
    if (typeof types === 'undefined') throw new Error('unable to deserialize generic class without types')
    const scene = typeof data.box === 'undefined' ? new Scene() : new Scene(Rectangle.deserializer(data.box))
    scene.setName(data.name)
    Collection.deserializer<Layer>(data.layers, types).forEach(layer => scene.layers.add(layer))
    return scene
  }
}

export default Scene
