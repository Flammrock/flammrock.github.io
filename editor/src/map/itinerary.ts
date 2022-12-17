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

import Base from './base'

class Go extends Base {
  readonly speed: number
  private constructor (speed: number) {
    super()
    this.speed = speed
  }

  toString (): string {
    return `go ${this.speed}\n`
  }

  getValue () {
    return this.speed
  }

  static from (speed: number) {
    return new Go(speed)
  }
}

class Turn extends Base {
  readonly angle: number
  private constructor (angle: number) {
    super()
    this.angle = angle
  }

  toString (): string {
    return `turn ${this.angle}\n`
  }

  getValue () {
    return this.angle
  }

  static from (angle: number) {
    return new Turn(angle)
  }
}

class Stop extends Base {
  toString (): string {
    return 'stop 0.\n'
  }

  getValue () {
    return 0
  }

  static from () {
    return new Stop()
  }
}

export type Action = Go | Turn | Stop

export class Itinerary extends Base {
  static get Default () { return new Itinerary([Go.from(20), Stop.from()]) }

  private actions: Array<Action>

  constructor (actions: Array<Action>) {
    super()
    this.actions = actions
  }

  size () {
    return this.actions.length
  }

  toString (): string {
    let r = ''
    for (const action of this.actions) {
      r += action.toString()
    }
    return r
  }

  static Go = Go

  static Turn = Turn

  static Stop = Stop
}

export default Itinerary
