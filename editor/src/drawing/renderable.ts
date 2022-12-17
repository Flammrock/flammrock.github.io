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

// todo: explain z-index system

/* eslint-disable no-use-before-define */

import { StrictEventEmitter } from 'strict-event-emitter'
import Collection from '../core/collection'
import Comparable from '../core/comparable'
import { JSONObject, Serializable } from '../core/object-mapper'
import RenderState from './render-state'
import ZIndex from './z-index'

/**
 * Type of a {@link Renderable} instance
 *
 * The type of the instance alters the render phase
 *
 * _**NOTE:** only implemented for the layer system_
 */
export enum RenderableType {
  /**
   * Can be rendered anywhere (in a file, on the screen)
   */
  Normal,

  /**
   * Can only be rendered on the screen
   */
  Draft
}

/**
 * Base events of any {@link Renderable}
 *
 * Any {@link Renderable} can receive a :
 * - {@link destroy} event
 * - {@link select} event
 * - {@link unselect} event
 *
 * @virtual Subclasses/subinterfaces are free to build there own logic based on that
 */
export interface RenderableEvents {

  destroy: (that: Renderable) => void

  select: (that: Renderable) => void

  unselect: (that: Renderable) => void

}

/**
 * Base class of every renderable elements.
 * Must be extended by any class which can be drawn on a {@link Canvas}
 */
export abstract class Renderable<T extends RenderableEvents = RenderableEvents> extends StrictEventEmitter<T> implements Comparable<Renderable<T>>, Serializable {
  private _isselected = false
  readonly overflow: boolean = false

  readonly zIndex = new ZIndex()

  protected renderingType = RenderableType.Normal

  getRenderingType (): RenderableType {
    return this.renderingType
  }

  setRenderingType (renderingType: RenderableType): void {
    this.renderingType = renderingType
  }

  /**
   * Allow to render a {@link Renderable} somewhere
   *
   * @param state a {@link RenderState} used to known where to render the {@link Renderable}
   *
   * @virtual Subclasses are free to implement this method as they wish
   */
  abstract render (state: RenderState): void

  /**
   * Allow to check if a {@link Renderable} is hovered
   *
   * @param state a {@link RenderState} used to known where to render the {@link Renderable}
   *
   * @virtual Subclasses are free to implement this method as they wish
   */
  abstract isHover (state: RenderState): boolean

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hover (_state: RenderState): void { /* nothing */ }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unhover (_state: RenderState): void { /* nothing */ }

  /**
   * Allow to retrieve all sub-{@link Renderable}s of a {@link Renderable}
   *
   * @virtual Subclasses are free to implement this method as they wish
   *
   * @returns all the sub-{@link Renderable}s in a {@link Array}
   */
  abstract renderables <K extends RenderableEvents, T extends Renderable<K>> (): Collection<T>

  /**
   * Allow to propagate an {@link RenderableEvents.destroy | destroy} event everywhere
   *
   * @sealed recommanded to **NOT OVERRIDE** this method
   */
  destroy (): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.emit('destroy', this)
  }

  /**
   * Allow to propagate an {@link RenderableEvents.select | select} event everywhere
   *
   * @sealed recommanded to **NOT OVERRIDE** this method
   */
  select (): void {
    this._isselected = true
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.emit('select', this)
  }

  /**
   * Allow to propagate an {@link RenderableEvents.unselect | unselect} event everywhere
   *
   * @sealed recommanded to **NOT OVERRIDE** this method
   */
  unselect (): void {
    this._isselected = false
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.emit('unselect', this)
  }

  /**
   * Allow to check if a {@link Renderable} is currently selected
   *
   * @sealed recommanded to **NOT OVERRIDE** this method
   *
   * @returns true if this {@link Renderable} is selected else false
   */
  isSelected () {
    return this._isselected
  }

  /**
   * Allow to compare the **depth** ({@link Renderable.zIndex | z-index}) between two {@link Renderable}
   *
   * @example
   * ```
   * const renderables: Array<Renderable> = ...
   * renderables.sort((a, b) => a.compare(b))
   * ```
   *
   * @sealed recommanded to **NOT OVERRIDE** this method
   *
   * @param other a {@link Renderable}
   *
   * @returns
   *
   * 0 if {@link other} have the same {@link Renderable.zIndex | z-index}
   *
   * < 0 if {@link other} is behind (smaller {@link Renderable.zIndex | z-index})
   *
   * \> 0 if {@link other} is in front (bigger {@link Renderable.zIndex | z-index})
   */
  compare (other: Renderable<T>): number {
    return this.zIndex.compare(other.zIndex)
  }

  serialize (): JSONObject {
    return {
      type: 'Renderable',
      zIndex: this.zIndex.data(),
      isselected: this._isselected,
      overflow: this.overflow
    }
  }
}

export default Renderable
