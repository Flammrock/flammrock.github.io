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

/* eslint-disable no-use-before-define */
// /* eslint-disable no-use-before-define */
import { Point } from '../core/point'
import { CanvasRenderingContext2DTracked, getMousePos, MouseButton, Nullable, ResetTransformation, trackTransforms } from '../helper/utils'
import Logical from '../core/logical'
import { StrictEventEmitter } from 'strict-event-emitter'
import Draggable from '../core/draggable'
import Scene from './scene'
import RenderState from './render-state'
import RenderStatus from './render-status'

interface Events extends Draggable {
  mousemove: (mousePosition: Point) => void;
  mousedown: (mousePosition: Point, mouseButton: MouseButton) => void;
  mouseup: (mousePosition: Point, mouseButton: MouseButton) => void;
  mousewheel: (mousePosition: Point, wheel: number) => void;
  mouseleave: (mousePosition: Point) => void;
  render: (state: RenderState) => void;
}

export class Canvas extends StrictEventEmitter<Events> {
  private canvas: HTMLCanvasElement // contains the dom HTML Element
  private ctx: CanvasRenderingContext2DTracked // contains the 2d context tracked

  private dragged: boolean // true if mouse click hold down and mouse has moved
  private dragStart: Nullable<Point> // contains mouse position in the world space when user click
  private dragButton: Nullable<number> // containes the mouse button (0 = left, 1 = middle, 2 = right)

  private last: Point // contains the mouse position in the world space (updated each tick)
  private center: Point // used to translate the canvas by canvas.width/2 and canvas.height/2 to center

  private logicals: Array<Logical<StrictEventEmitter<Events>>>

  private scene: Nullable<Scene> = null

  private state: Nullable<RenderState> = null

  constructor () {
    super()
    // create a canvas, retrieve the 2d context and track all matrix transformations
    this.canvas = document.createElement('canvas')
    const ctx = this.canvas.getContext('2d') // todo: use create2DCanvasContextTracked()
    if (ctx == null) throw new Error('Unable to retrieve 2d canvas context')
    this.ctx = trackTransforms(ctx) // allow to reverse transformation matrix that allow to
    // convert screen coordinate to world coordinate easly

    this.ctx.imageSmoothingEnabled = false

    // setCanvasDPI(this.canvas)

    this.logicals = []

    // track mouse drag
    this.dragged = false // true if mouse click hold down and mouse has moved
    this.dragStart = null // contains mouse position in the world space when user click
    this.dragButton = null // containes the mouse button (0 = left, 1 = middle, 2 = right)

    // contains the mouse position in the world space (updated each tick)
    this.last = new Point(this.canvas.width / 2, this.canvas.height / 2)

    // used to translate the canvas by canvas.width/2 and canvas.height/2 to center
    this.center = new Point(0, 0)

    let lastRender = 0
    let currRender = Date.now()

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    // const gkhead = new Image()
    // gkhead.src = 'https://c4.wallpaperflare.com/wallpaper/715/35/760/victory-the-suit-starcraft-rifle-strategy-hd-wallpaper-preview.jpg'
    function redraw () {
      const canvas = that.canvas
      const ctx = that.ctx

      lastRender = currRender
      currRender = Date.now()

      that.state = new RenderState(RenderStatus.Screen, that, that.scene == null ? Scene.Empty : that.scene, (currRender - lastRender) / 1000, ctx, that.last)

      window.requestAnimationFrame(redraw)

      const e = ctx.duplicateTransform()
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      ctx.setTransform(e.a, e.b, e.c, e.d, e.e, e.f)
      that.center = new Point(canvas.width / 2, canvas.height / 2)
      ctx.translate(that.center.x / e.a, that.center.y / e.d)

      // Clear the entire canvas

      that.clear()

      /*
      that.scene.applyClip(ctx)
      that.scene.render(ctx)
      that.scene.unclip()
      that.scene.render(ctx) */

      ctx.imageSmoothingEnabled = false
      that.scene?.render(that.state)
      that.emit('render', that.state)

      // ctx.drawImage(gkhead, 0, 0)

      ctx.translate(-that.center.x / e.a, -that.center.y / e.d)
    }
    redraw()

    this.listen()
  }

  reset () {
    this.ctx.setTransform(ResetTransformation())
  }

  setScene (scene: Scene) {
    this.scene = scene
  }

  /**
   * Retrieve the html element
   * @returns Canvas HTML Element
   */
  element () {
    return this.canvas
  }

  register (logical: Logical<StrictEventEmitter<Events>>) {
    this.logicals.push(logical)
    logical.register(this)
  }

  unregister (logical: Logical<StrictEventEmitter<Events>>) {
    const index = this.logicals.indexOf(logical)
    if (index < 0) throw new Error('logical not found')
    this.logicals[index].unregister(this)
    this.logicals.splice(index, 1)
  }

  private getWorldPoint (pt: Point) {
    const e = this.ctx.getTransform()
    return Point.sub(this.ctx.screenToWorld(pt), Point.div(this.center, new Point(e.a, e.d)))
  }

  clear () {
    const ctx = this.ctx
    const canvas = this.canvas

    const p1 = ctx.screenToWorld(0, 0)
    const p2 = ctx.screenToWorld(canvas.width, canvas.height)
    ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y)

    ctx.save()
    ctx.setTransform(ResetTransformation())
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  }

  /**
   * Start listen useful canvas events (mouse, ...etc) and dispatch in the registered listeners
   */
  private listen () {
    const canvas = this.canvas
    const ctx = this.ctx
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    canvas.addEventListener(
      'mousedown',
      function (evt) {
        that.last = getMousePos(canvas, evt)
        that.dragButton = evt.button
        that.dragStart = that.getWorldPoint(that.last)
        that.dragged = false
        that.emit('mousedown', that.last, that.dragButton as MouseButton)
        that.emit('dragstart', that.dragStart, that.dragButton as MouseButton)
      },
      false
    )

    window.addEventListener(
      'mousemove',
      function (evt) {
        that.last = getMousePos(canvas, evt)
        const pt = that.getWorldPoint(that.last)
        that.emit('mousemove', pt)
        that.dragged = true

        // todo: add enablePan() + enableZoom();
        if (that.dragStart != null && that.dragButton === 2) {
          ctx.translate(pt.x - that.dragStart.x, pt.y - that.dragStart.y)
        }

        if (that.dragStart != null) that.emit('dragstep', pt, that.dragButton as MouseButton)
      },
      false
    )

    window.addEventListener(
      'mouseup',
      function (evt) {
        if (evt.target !== that.canvas) {
          that.dragged = false
          that.emit('dragcancel')
        }
        that.last = getMousePos(canvas, evt)
        const pt = that.getWorldPoint(that.last)
        that.emit('mouseup', pt, that.dragButton as MouseButton)
        if (that.dragged) that.emit('dragend', pt, that.dragButton as MouseButton)
        that.dragButton = null
        that.dragStart = null
      },
      false
    )

    window.addEventListener(
      'mouseleave',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      function (_evt) {
        that.dragStart = null
        that.dragged = false
        that.dragButton = null
        that.emit('mouseleave', that.getWorldPoint(that.last))
      },
      false
    )

    canvas.addEventListener(
      'contextmenu',
      function (evt) {
        evt.preventDefault()
        evt.stopPropagation()
      },
      false
    )

    const scaleFactor = 1.1

    const zoom = function (clicks: number) {
      const pt = that.getWorldPoint(that.last)
      ctx.translate(pt.x, pt.y)
      const factor = Math.pow(scaleFactor, clicks)
      ctx.scale(factor, factor)
      ctx.translate(-pt.x, -pt.y)
    }

    const handleScroll = function (evt: Event) {
      const delta = (<WheelEvent>evt).deltaY
        ? -(<WheelEvent>evt).deltaY / 40
        : (<WheelEvent>evt).detail
            ? -(<WheelEvent>evt).detail
            : 0
      if (delta) zoom(delta)
      that.emit('mousewheel', that.last, delta)
      evt.preventDefault()
      return false
    }

    canvas.addEventListener('DOMMouseScroll', handleScroll, false)
    canvas.addEventListener('mousewheel', handleScroll, false)
  }
}

export default Canvas
