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

import { EventMapType, StrictEventEmitter } from 'strict-event-emitter'
import Point from '../core/point'
import { CanvasRenderingContext2DTracked } from '../helper/utils'
import RenderStatus from './render-status'
import Scene from './scene'

export class RenderState {
  private _mouse: Array<Point>
  private stack: Array<CanvasRenderingContext2DTracked>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _dispatcher: StrictEventEmitter<EventMapType>
  private _isHoverEnabled = false
  private _dt: number
  readonly scene: Scene
  readonly status: RenderStatus

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor (status: RenderStatus, dispatcher: StrictEventEmitter<EventMapType>, scene: Scene, dt: number, ctx: CanvasRenderingContext2DTracked, mouse: Point) {
    this._dispatcher = dispatcher
    this.stack = [ctx]
    this._mouse = [Point.duplicate(mouse)]
    this._dt = dt
    this.scene = scene
    this.status = status
  }

  isMouseInPath () {
    if (!this._isHoverEnabled) return false
    return this.ctx.isPointInPath(this.mouse.x, this.mouse.y)
  }

  isPointInPath (x: number, y: number) {
    const p = this.ctx.worldToScreen(x, y)
    return this.ctx.isPointInPath(p.x, p.y)
  }

  enableHover () {
    this._isHoverEnabled = true
  }

  disableHover () {
    this._isHoverEnabled = false
  }

  get ctx () {
    return this.stack[this.stack.length - 1]
  }

  get mouse () {
    return this._mouse[this._mouse.length - 1]
  }

  get dispatcher () {
    return this._dispatcher
  }

  get dt () {
    return this._dt
  }

  screenToWorld (pt: Point) {
    return this.ctx.screenToWorld(pt)
  }

  worldToScreen (pt: Point) {
    return this.ctx.worldToScreen(pt)
  }

  push (ctx: CanvasRenderingContext2DTracked) {
    this._mouse.push(this.ctx.screenToWorld(this.mouse))
    this.stack.push(ctx)
  }

  pop () {
    const ctx = this.stack.pop()
    const mouse = this._mouse.pop()
    if (ctx == null || mouse == null) throw new Error('too much pop()')
    return ctx
  }
}

export default RenderState
