/* eslint-disable @typescript-eslint/no-explicit-any */
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

import Point from '../core/point'
import { Line } from '../core/line'
import { Canvas } from '../drawing/canvas'
import Color from '../drawing/color'
import Road from '../engine/road'
import Collection from '../core/collection'
import Scene from '../drawing/scene'
import { View } from '../gui/view'
import ViewItem from '../gui/view-item'
import Tool from '../gui/tool'
import Rectangle from '../core/rectangle'
import { Pointer } from '../core/pointer'
import RoadLine from '../engine/road-line'
import RoadArc from '../engine/road-arc'

export const EPSILON = typeof Number.EPSILON === 'undefined' ? 2.220446049250313e-16 : Number.EPSILON

export const TAU = 2 * Math.PI

export type Nullable<T> = T | null

export function DegToRad (deg: number) {
  return deg * Math.PI / 180
}

export function RadToDeg (rad: number) {
  return rad * 180 / Math.PI
}

export function rect (ctx: CanvasRenderingContext2D, box: Rectangle): void
export function rect (ctx: CanvasRenderingContext2D, pt: Point, size: number): void
export function rect (ctx: CanvasRenderingContext2D, pt: Point, size: Point): void
export function rect (ctx: CanvasRenderingContext2D, pt: Point, width: number, height: number): void
export function rect (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void
export function rect (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void
export function rect (ctx: CanvasRenderingContext2D, x: number, y: number, size: Point): void
export function rect (ctx: CanvasRenderingContext2D, x: Pointer<number>, y: Pointer<number>, width: number, height: number): void
export function rect (ctx: CanvasRenderingContext2D, x: Pointer<number>, y: Pointer<number>, size: number): void
export function rect (ctx: CanvasRenderingContext2D, x: Pointer<number>, y: Pointer<number>, size: Point): void
export function rect (ctx: CanvasRenderingContext2D, x: Rectangle | Point | number | Pointer<number>, y?: number | Point | Pointer<number>, w?: number | Point, h?: number): void {
  ctx.beginPath()
  if (x instanceof Rectangle) {
    ctx.rect(x.origin.x - x.size.x / 2, x.origin.y - x.size.y / 2, x.size.x, x.size.y)
  } else if (x instanceof Point && typeof y === 'number') {
    ctx.rect(x.x - y / 2, x.y - y / 2, y, y)
  } else if (x instanceof Point && y instanceof Point) {
    ctx.rect(x.x - y.x / 2, x.y - y.y / 2, y.x, y.y)
  } else if (x instanceof Point && typeof y === 'number' && typeof w === 'number') {
    ctx.rect(x.x - y / 2, x.y - w / 2, y, w)
  } else if (typeof x === 'number' && typeof y === 'number' && typeof w === 'number' && typeof h === 'number') {
    ctx.rect(x - w / 2, y - h / 2, w, h)
  } else if (typeof x === 'number' && typeof y === 'number' && typeof w === 'number' && typeof h === 'undefined') {
    ctx.rect(x - w / 2, y - w / 2, w, w)
  } else if (typeof x === 'number' && typeof y === 'number' && w instanceof Point && typeof h === 'undefined') {
    ctx.rect(x - w.x / 2, y - w.y / 2, w.x, w.y)
  } else if (x instanceof Pointer && y instanceof Pointer && typeof w === 'number' && typeof h === 'number') {
    ctx.rect(x.get() - w / 2, y.get() - h / 2, w, h)
  } else if (x instanceof Pointer && y instanceof Pointer && typeof w === 'number' && typeof h === 'undefined') {
    ctx.rect(x.get() - w / 2, y.get() - w / 2, w, w)
  } else if (x instanceof Pointer && y instanceof Pointer && w instanceof Point && typeof h === 'undefined') {
    ctx.rect(x.get() - w.x / 2, y.get() - w.y / 2, w.x, w.y)
  }
}

export function line (ctx: CanvasRenderingContext2D, line: Line): void
export function line (ctx: CanvasRenderingContext2D, a: Point, b: Point): void
export function line (ctx: CanvasRenderingContext2D, x: number, y: number, b: Point): void
export function line (ctx: CanvasRenderingContext2D, a: Point, x: number, y: number): void
export function line (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void
export function line (ctx: CanvasRenderingContext2D, x: Pointer<number>, y: Pointer<number>, b: Point): void
export function line (ctx: CanvasRenderingContext2D, a: Point, x: Pointer<number>, y: Pointer<number>): void
export function line (ctx: CanvasRenderingContext2D, x1: Pointer<number>, y1: Pointer<number>, x2: Pointer<number>, y2: Pointer<number>): void
export function line (ctx: CanvasRenderingContext2D, a: Line | Point | number | Pointer<number>, b?: Point | number | Pointer<number>, c?: Point | number | Pointer<number>, d?: number | Pointer<number>): void {
  ctx.beginPath()
  if (typeof a === 'number' && typeof b === 'number' && typeof c === 'number' && typeof d === 'number') {
    ctx.moveTo(a, b)
    ctx.lineTo(c, d)
  } else if (a instanceof Pointer && b instanceof Pointer && c instanceof Pointer && d instanceof Pointer) {
    ctx.moveTo(a.get(), b.get())
    ctx.lineTo(c.get(), d.get())
  } else if (a instanceof Line) {
    ctx.moveTo(a.start.x, a.start.y)
    ctx.lineTo(a.start.x, a.start.y)
  } else if (a instanceof Point && b instanceof Point) {
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
  } else if (typeof a === 'number' && typeof b === 'number' && c instanceof Point) {
    ctx.moveTo(a, b)
    ctx.lineTo(c.x, c.y)
  } else if (a instanceof Point && typeof b === 'number' && typeof c === 'number') {
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b, c)
  } else if (a instanceof Pointer && b instanceof Pointer && c instanceof Point) {
    ctx.moveTo(a.get(), b.get())
    ctx.lineTo(c.x, c.y)
  } else if (a instanceof Point && b instanceof Pointer && c instanceof Pointer) {
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.get(), c.get())
  }
}

export function arc (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, startAngle: number, endAngle: number, innerLine?: boolean) {
  ctx.beginPath()
  if (innerLine) ctx.moveTo(x, y)
  ctx.arc(x, y, radius, startAngle, endAngle, false)
  if (innerLine) ctx.closePath()
}

export function fill (ctx: CanvasRenderingContext2D, color: Color) {
  ctx.fillStyle = color.toString()
  ctx.fill()
}

export function stroke (ctx: CanvasRenderingContext2D, color: Color) {
  ctx.strokeStyle = color.toString()
  ctx.stroke()
}

export function getOrDefaultValue <T> (value: T | undefined, defaultValue: T) {
  return typeof value === 'undefined' ? defaultValue : value
}

export interface CanvasRenderingContext2DTracked extends CanvasRenderingContext2D {
  duplicateTransform(): DOMMatrix
  screenToWorld(x?: number | Point, y?: number): Point
  worldToScreen(x?: number | Point, y?: number): Point
}

export function notEmpty<TValue> (value: TValue | null | undefined): value is TValue {
  if (value === null || value === undefined) return false
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testDummy: TValue = value
  return true
}

interface typeMap { // for mapping from strings to types
  string: string;
  number: number;
  boolean: boolean;
}

type PrimitiveOrConstructor = // 'string' | 'number' | 'boolean' | constructor
  | { new (...args: any[]): any }
  | keyof typeMap;

// infer the guarded type from a specific case of PrimitiveOrConstructor
type GuardedType<T extends PrimitiveOrConstructor> = T extends { new(...args: any[]): infer U; } ? U : T extends keyof typeMap ? typeMap[T] : never;

// finally, guard ALL the types!
function typeGuard<T extends PrimitiveOrConstructor> (o: any, className: T):
  o is GuardedType<T> {
  const localPrimitiveOrConstructor: PrimitiveOrConstructor = className
  if (typeof localPrimitiveOrConstructor === 'string') {
    return typeof o === localPrimitiveOrConstructor
  }
  return o instanceof localPrimitiveOrConstructor
}

export function IsInstanceOf<T extends PrimitiveOrConstructor> (className: T) {
  return (o: any): o is GuardedType<T> => {
    return typeGuard(o, className)
  }
}

export function equals0 (x: number): boolean {
  return Math.abs(x) < EPSILON
}

export function ResetTransformation () {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const xform = svg.createSVGMatrix()
  xform.a = 1
  xform.b = 0
  xform.c = 0
  xform.d = 1
  xform.e = 0
  xform.f = 0
  return xform
}

export function trackTransforms (
  ctx: CanvasRenderingContext2D
): CanvasRenderingContext2DTracked {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  let xform = svg.createSVGMatrix()
  ctx.getTransform = function () {
    return xform
  }

  const savedTransforms: Array<DOMMatrix> = []
  const save = ctx.save
  ctx.save = function () {
    savedTransforms.push(xform.translate(0, 0))
    return save.call(ctx)
  }

  const restore = ctx.restore
  ctx.restore = function () {
    const poppedform = savedTransforms.pop()
    if (typeof poppedform === 'undefined') { throw new Error('Too much ctx.restore().') }
    xform = poppedform
    return restore.call(ctx)
  }

  const scale = ctx.scale
  ctx.scale = function (sx, sy) {
    xform = xform.scaleNonUniform(sx, sy)
    return scale.call(ctx, sx, sy)
  }

  const rotate = ctx.rotate
  ctx.rotate = function (radians) {
    xform = xform.rotate((radians * 180) / Math.PI)
    return rotate.call(ctx, radians)
  }

  const translate = ctx.translate
  ctx.translate = function (dx, dy) {
    xform = xform.translate(dx, dy)
    return translate.call(ctx, dx, dy)
  }

  const transform = ctx.transform
  ctx.transform = function (a, b, c, d, e, f) {
    const m2 = svg.createSVGMatrix()
    m2.a = a
    m2.b = b
    m2.c = c
    m2.d = d
    m2.e = e
    m2.f = f
    xform = xform.multiply(m2)
    return transform.call(ctx, a, b, c, d, e, f)
  }

  const setTransform = ctx.setTransform
  ctx.setTransform = function (
    // eslint-disable-next-line no-undef
    a: number | DOMMatrix2DInit | undefined,
    b?,
    c?,
    d?,
    e?,
    f?
  ) {
    if (typeof a === 'undefined') {
      return setTransform.call(ctx, a)
    }

    if (typeof a === 'number') {
      xform.a = a
      xform.b = typeof b === 'number' ? b : 0
      xform.c = typeof c === 'number' ? c : 0
      xform.d = typeof d === 'number' ? d : 0
      xform.e = typeof e === 'number' ? e : 0
      xform.f = typeof f === 'number' ? f : 0
      return setTransform.call(ctx, xform)
    }

    xform.a = typeof a.a === 'number' ? a.a : 0
    xform.b = typeof a.b === 'number' ? a.b : 0
    xform.c = typeof a.c === 'number' ? a.c : 0
    xform.d = typeof a.d === 'number' ? a.d : 0
    xform.e = typeof a.e === 'number' ? a.e : 0
    xform.f = typeof a.f === 'number' ? a.f : 0
    return setTransform.call(ctx, xform)
  }

  const pt = svg.createSVGPoint()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ctx.screenToWorld = function (x?: number | Point, y?: number) {
    if (x instanceof Point) {
      pt.x = x.x
      pt.y = x.y
    } else {
      pt.x = typeof x === 'number' ? x : 0
      pt.y = typeof y === 'number' ? y : 0
    }

    const t = pt.matrixTransform(xform.inverse())
    return new Point(t.x, t.y)
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ctx.worldToScreen = function (x?: number | Point, y?: number) {
    if (x instanceof Point) {
      pt.x = x.x
      pt.y = x.y
    } else {
      pt.x = typeof x === 'number' ? x : 0
      pt.y = typeof y === 'number' ? y : 0
    }

    const t = pt.matrixTransform(xform)
    return new Point(t.x, t.y)
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ctx.duplicateTransform = function () {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const xform = svg.createSVGMatrix()
    const t = ctx.getTransform()
    xform.a = t.a
    xform.b = t.b
    xform.c = t.c
    xform.d = t.d
    xform.e = t.e
    xform.f = t.f
    return xform
  }

  return ctx as CanvasRenderingContext2DTracked
}

export function getMousePos (canvas: HTMLCanvasElement, evt: MouseEvent) {
  const rect = canvas.getBoundingClientRect() // abs. size of element
  const scaleX = canvas.width / rect.width // relationship bitmap vs. element for x
  const scaleY = canvas.height / rect.height // relationship bitmap vs. element for y
  return new Point(
    (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
    (evt.clientY - rect.top) * scaleY // been adjusted to be relative to element
  )
}

export function resize2DCanvasContext (target: HTMLCanvasElement | CanvasRenderingContext2D, width: number, height: number) {
  const canvas = target instanceof CanvasRenderingContext2D ? target.canvas : target
  const ctx = target instanceof CanvasRenderingContext2D ? target : target.getContext('2d')
  if (ctx == null) throw new Error('unable to get 2d context')
  canvas.width = width
  canvas.height = height
  // resizeCanvasDPI(canvas)
  /* canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  const dpi = window.devicePixelRatio
  ctx.scale(dpi, dpi) */
  return ctx
}

export function create2DCanvasContextTracked (width?: number, height?: number): CanvasRenderingContext2DTracked {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx == null) throw new Error('unable to get 2d context')
  ctx.imageSmoothingEnabled = false
  // setCanvasDPI(canvas)
  return trackTransforms(typeof width === 'number' && typeof height === 'number' ? resize2DCanvasContext(ctx, width, height) : ctx)
}

export function isContextTracked (ctx: unknown): ctx is CanvasRenderingContext2DTracked {
  return ctx instanceof CanvasRenderingContext2D && 'duplicateTransform' in ctx && 'transformedPoint' in ctx
}

export function clip (ctx: CanvasRenderingContext2DTracked | CanvasRenderingContext2D, transform: DOMMatrix, box: Rectangle) {
  ctx.save()
  ctx.setTransform(transform)
  ctx.beginPath()
  ctx.rect(box.origin.x, box.origin.y, box.size.x, box.size.y)
  ctx.clip()
  ctx.setTransform(ResetTransformation())
}

export function unclip (ctx: CanvasRenderingContext2DTracked | CanvasRenderingContext2D) {
  ctx.restore()
}

export function clearCanvas (ctx: CanvasRenderingContext2DTracked, color?: string) {
  const canvas = ctx.canvas

  // const p1 = ctx.transformedPoint(0, 0)
  // const p2 = ctx.transformedPoint(canvas.width, canvas.height)
  // ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y)

  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  if (typeof color === 'undefined') {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  } else {
    ctx.beginPath()
    ctx.rect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = color
    ctx.fill()
  }
  ctx.restore()
}

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2
}

export type Comparator<T> = (a: T, b: T) => number

const numbercomp: Comparator<number> = (a: number, b: number) => a - b

export const Comparators = {
  number: numbercomp
}

export function insert<T> (items: T[], item: T, comparator?: Comparator<T>) {
  if (typeof comparator === 'undefined') {
    comparator = (a: T | string, b: T | string) => {
      if (typeof a !== 'string') a = String(a)
      if (typeof b !== 'string') b = String(b)
      return (a > b ? 1 : (a < b ? -1 : 0))
    }
  }

  let low = 0
  let high = items.length

  while (low < high) {
    const mid = (low + high) >> 1
    comparator(items[mid], item) > 0
      ? (high = mid)
      : (low = mid + 1)
  }

  items.splice(low, 0, item)
}

export function connectline (roadsCollection: Collection<Road>, scene: Scene, view: View, canvas: Canvas, tool: Tool) {
  return (data: Line) => {
    const item = RoadLine.from(data)
    item.setColor(Color.Red)
    roadsCollection.add(item)
    item.on('select', () => {
      item.setColor(Color.Green)
      item.enableGrab(canvas)
      tool.select()
    })
    item.on('unselect', () => {
      item.setColor(Color.Red)
      item.disableGrab(canvas)
    })
    view.add(new ViewItem(`line n°${item.getID()}`, item))
  }
}

export function connectarc (roadsCollection: Collection<Road>, scene: Scene, view: View, canvas: Canvas, tool: Tool) {
  return (data: Line) => {
    const item = RoadArc.from(data)
    item.setColor(Color.Red)
    roadsCollection.add(item)
    item.on('select', () => {
      item.setColor(Color.Green)
      item.enableGrab(canvas)
      tool.select()
    })
    item.on('unselect', () => {
      item.setColor(Color.Red)
      item.disableGrab(canvas)
    })
    view.add(new ViewItem(`line n°${item.getID()}`, item))
  }
}

export function isImageLoaded (image: HTMLImageElement) {
  return image.complete && image.naturalHeight !== 0
}
