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
import { Pointer } from '../core/pointer'
import Rectangle from '../core/rectangle'
import Renderable, { RenderableEvents } from './renderable'
import RenderState from './render-state'
import Collection from '../core/collection'

/**
 * Any {@link Grab} instance can emit or listening '**change**' event
 */
export interface GrabEvents<T> extends RenderableEvents {

  /**
   * @param data Acutally correspond to a [Point](../core/point.ts) or a [Rectangle](../core/rectangle.ts)
   */
  change: (data: T) => void
}

/**
 * This class is part of the Grab System. A {@link Grab} instance is listening
 * some {@link MouseEvent | mouse events} to allow the user to move the {@link Grab} somewhere else.
 *
 * @virtual
 *
 * @experimental
 *
 * @see [GrabPoint](./grab-point.ts)
 * @see [GrabRectangle](./grab-rectangle.ts)
 */
export abstract class Grab<T = Rectangle | Point> extends Renderable<GrabEvents<T>> {
  abstract overflow: boolean

  constructor () {
    super()
    this.zIndex.clear()
    this.zIndex.set(10000) /* a Grab instance have a z-index of 10000 (it's an arbitrary value) */
  }

  /**
   * {@inheritDoc Renderable.render}
   */
  abstract render(state: RenderState): void

  /**
   * {@inheritDoc Renderable.getAllRenderables}
   */
  abstract renderables <K extends RenderableEvents, T extends Renderable<K>> (): Collection<T>

  abstract isGrabbed(): boolean

  /**
   * Allow to **start** listening events from a {@link dispatcher} (especially {@link MouseEvent | mouse events} here)
   *
   * @param dispatcher a dispatcher which can send {@link Draggable} events
   * @param instance this instance can (depend of implementation) receive select events,
   * if not defined, the grab instance itself is used as the instance
   *
   * @see {@link Grab.unregister}
   */
  abstract register (dispatcher: StrictEventEmitter<Draggable>, instance?: unknown): void

  /**
   * Allow to **stop** listening events from a {@link dispatcher} (especially {@link MouseEvent | mouse events} here)
   *
   * @param dispatcher a dispatcher which can send {@link Draggable} events
   *
   * @see {@link Grab.register}
   */
  abstract unregister (dispatcher: StrictEventEmitter<Draggable>): void

  abstract pointers(): Array<Pointer<number>>

  destroy (): void {
    super.destroy()
  }
}

export default Grab
