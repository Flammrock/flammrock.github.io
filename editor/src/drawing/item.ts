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
import RenderState from './render-state'
import Renderable, { RenderableEvents } from './renderable'
import { GrabPoint } from './grab-point'
import Property, { Convertor, FormBuilder, Properties } from '../core/property'
import Collection from '../core/collection'
import Point from '../core/point'
import { MouseButton } from '../helper/utils'
import { Pointer } from '../core/pointer'
import Rectangle from '../core/rectangle'
import GrabRectangle from './grab-rectangle'
import Grab from './grab'
import { JSONObject } from '../core/object-mapper'

export interface ItemEvents extends RenderableEvents {

  propertiesUpdate: () => void

}

/**
 * Represent the base class of any complex {@link Renderable} object that
 * can have {@link Grab | Grabs} anchor to be moved and have some internal
 * properties which can be accessed from the outside
 */
export abstract class Item<T = unknown> extends Renderable<ItemEvents> {
  readonly overflow: boolean = false

  /* used to not disable grabbing brutally if the item is still currently grabbed with the mouse */
  private _islistening = false

  /* property system used to edit internal properties easier with a view panel */
  private properties: Properties<T> = {}

  /* part of the grab system */
  readonly grabs: Collection<Grab> = new Collection<Grab>()

  constructor () {
    super()
    this.zIndex.set(0) // assume that any new Item object have a 0 z-index
  }

  /**
   * @inheritdoc
   */
  render (state: RenderState): void {
    this.renderGrab(state)
  }

  hover (state: RenderState): void {
    /* const grabs = this.getGrabs()
    for (const grab of grabs) {
      if (grab.isHover(state)) {
        grab.hover(state)
        break
      }
    } */
    this.enableGrab(state.dispatcher)
  }

  unhover (state: RenderState): void {
    /* const grabs = this.getGrabs()
    for (const grab of grabs) {
      grab.unhover(state)
    } */
    this.disableGrab(state.dispatcher)
  }

  /**
   * @inheritdoc
   */
  isHover (state: RenderState): boolean {
    for (const grab of this.grabs.toArray()) {
      if (grab.isHover(state)) return true
    }
    return false
  }

  /**
   *
   * @virtual Subclasses are free to implement this method as they wish but they
   * must call the super method
   *
   * @inheritdoc
   */
  renderables <K extends RenderableEvents, T extends Renderable<K>> (): Collection<T> {
    /* an Item object only have grabs object at this step */
    return this.grabs as unknown as Collection<T>
  }

  /**
   * @inheritdoc
   */
  destroy (): void {
    super.destroy()
    /* dont forget to destroy grabs object too */
    this.grabs.forEach(grab => grab.destroy())
    this.grabs.destroy()
  }

  /**
   * Allow to set the value of a particular {@link Property}
   *
   * @param key name of the {@link Property}
   * @param value new value
   */
  set <K extends keyof T> (key: K, value: T[K]) {
    this.getProperty(key).setValue(value)
  }

  /**
   * Allow to retrieve the value of a particular {@link Property}
   *
   * @param key name of the {@link Property}
   *
   * @returns the value of the {@link Property}
   */
  get <K extends keyof T> (key: K) {
    return this.getProperty(key).getValue()
  }

  /**
   * Allow to retrieve the {@link Property} object itself
   *
   * @param key name of the {@link Property}
   *
   * @returns the {@link Property} which have this name
   */
  getProperty <K extends keyof T> (key: K): Property<T[K] | Pointer<T[K]>> {
    const p = this.properties[key]
    if (typeof p === 'undefined') throw new Error(`no property "${key as string}"`)
    return p
  }

  /**
   * Allow to retrieve all the {@link Properties} contained in this {@link Item}
   *
   * @returns all the {@link Properties}
   */
  getProperties () {
    return this.properties
  }

  /**
   * Allow to create a {@link Property}
   *
   * @param name name of the {@link Property}
   * @param defaultValue default value of the {@link Property}
   * @param convertor a {@link Convertor} that allow to convert a string to compatible value for the {@link Property}
   * @param formbuilder a {@link FormBuilder} to easly build the corresponding HTML with some events
   *
   * @returns the created {@link Property}
   */
  setProperty <K extends keyof T> (name: K, defaultValue: T[K] | Pointer<T[K]>, convertor: Convertor<T[K]>, formbuilder: FormBuilder): Property<T[K] | Pointer<T[K]>> {
    const property = new Property(name as string, defaultValue, convertor, formbuilder)
    this.properties[name] = property
    return property
  }

  removeProperty (property: string): void
  removeProperty <K extends keyof T> (property: Property<T[K] | Pointer<T[K]>>): void
  /**
   * Allow to remove a {@link Property} by reference in this {@link Item} instance
   *
   * @param property the {@link Property} to remove
   */
  removeProperty <K extends keyof T> (property: string | Property<T[K] | Pointer<T[K]>>): void {
    const key: K = (typeof property === 'string' ? property : property.getName()) as K
    // console.log('remove property')
    this.properties[key]?.destroy()
    delete this.properties[key]
  }

  /**
   * Allow to easly add new {@link Grab} instance to this {@link Item}
   *
   * @param data actually a {@link Point} or a {@link Rectangle}
   * @param button mouse button used to move the {@link Grab} instance ({@link MouseButton})
   *
   * @returns a {@link GrabPoint} or a {@link GrabRectangle}
   */
  addGrab (data: Point, button: MouseButton): GrabPoint
  addGrab (data: Rectangle, button: MouseButton): GrabRectangle
  addGrab (data: Point | Rectangle, button: MouseButton): GrabPoint | GrabRectangle {
    const grab = data instanceof Point ? new GrabPoint(data, button) : new GrabRectangle(data, button)
    this.grabs.add(grab)
    return grab
  }

  /**
   * Allow to remove a {@link Grab} instance by reference
   *
   * @param grab the {@link Grab} instance to remove
   */
  removeGrab (grab: Grab) {
    this.grabs.remove(grab)
  }

  // todo: removeAllGrabs

  /**
   * Allow to enable grabbing. (by default the grabbing is disabled)
   *
   * @param dispatcher a {@link StrictEventEmitter} that can emit {@link Draggable} events
   * @param instance (optional) can be used to set another parent instance
   */
  enableGrab (dispatcher: StrictEventEmitter<Draggable>, instance?: unknown) {
    this.grabs.forEach(grab => grab.register(dispatcher, instance))
  }

  /**
   * Allow to disable grabbing. (by default the grabbing is disabled)
   *
   * @param dispatcher a {@link StrictEventEmitter} that can emit {@link Draggable} events
   */
  disableGrab (dispatcher: StrictEventEmitter<Draggable>) {
    this.grabs.forEach(grab => grab.unregister(dispatcher))
  }

  /**
   * Allow to render all {@link Grab | Grabs} instances
   *
   * @param state a {@link RenderSate}
   */
  private renderGrab (state: RenderState) {
    this.grabs.forEach(grab => grab.render(state))
  }

  isGrabbed () {
    // if (grabs.length === 0) return super.isSelected()
    for (const grab of this.grabs.toArray()) {
      if (grab.isGrabbed()) { return true }
    }
    return false
  }

  serialize (): JSONObject {
    return {
      ...super.serialize(),
      type: 'Item',
      grabs: this.grabs.serialize()
    }
  }
}
