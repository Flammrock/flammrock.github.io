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
import Road, { RoadDirection } from './road'

export class RoadArc extends Road {
  private center: Point
  private radius: number
  private startAngle: number
  private endAngle: number
  constructor (direction: RoadDirection, speed: number, center: Point, radius: number, startAngle: number, endAngle: number) {
    super(direction, speed)
    this.center = Point.duplicate(center)
    this.radius = radius
    this.startAngle = startAngle
    this.endAngle = endAngle
  }

  toString (): string {
    return `arc ${this.direction} ${this.speed} ${Number(this.center.x).toFixed(2)} ${Number(this.center.y).toFixed(2)} ${Number(this.radius).toFixed(2)} ${Number(this.startAngle).toFixed(2)} ${Number(this.endAngle).toFixed(2)}\n`
  }
}

export default RoadArc
