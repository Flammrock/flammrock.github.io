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
import Color from '../drawing/color'
import { Item } from '../drawing/item'
import { makePointer, Pointer } from '../core/pointer'
import { DefaultFormBuilder, floatConvertor, floatDeconvertor, SelectFormBuilder } from '../core/property'
import { JSONObject } from '../core/object-mapper'
import { RoadDirection } from '../map/road'

export interface RoadProps {
  direction: RoadDirection
  speed: number
}

export abstract class Road<T extends RoadProps = RoadProps> extends Item<T> {
  protected color: Color
  protected width: number

  protected speed: Pointer<number>
  protected direction: Pointer<RoadDirection>

  constructor () {
    super()
    this.direction = makePointer(1)
    this.speed = makePointer(20) // TODO: default value

    this.width = 2 // TODO: default value
    this.color = Color.Default

    const convertor = (value: string): RoadDirection => value === '1' ? 1 : 2
    const deconvertor = (value: RoadDirection) => value + ''

    this.setProperty('direction', this.direction, convertor, SelectFormBuilder('direction', {
      1: '1',
      2: '2'
    }, this.direction, convertor, deconvertor))

    this.setProperty('speed', this.speed, floatConvertor, DefaultFormBuilder('speed', this.speed, floatConvertor, floatDeconvertor))
  }

  abstract getID(): number

  setColor (color: Color): void {
    this.color = color
  }

  getColor (): Color {
    return Color.from(this.color)
  }

  getDirection () {
    return this.direction.get()
  }

  getSpeed () {
    return this.speed.get()
  }

  setDirection (direction: RoadDirection) {
    this.direction.set(direction)
  }

  setSpeed (speed: number) {
    this.speed.set(speed)
  }

  setWidth (width: number) {
    this.width = width
  }

  getWidth () {
    return this.width
  }

  serialize (): JSONObject {
    return {
      type: 'Road',
      color: this.color.serialize(),
      width: this.width,
      speed: this.speed.get(),
      direction: this.direction.get()
    }
  }
}

export default Road
