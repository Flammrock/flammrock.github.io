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
import Line from '../core/line'
import Logical from '../core/logical'
import Point from '../core/point'
import Color from '../drawing/color'
import RenderState from '../drawing/render-state'
import { MouseButton, Nullable } from '../helper/utils'
import RoadArc from './road-arc'
import { RoadLine } from './road-line'

interface Events {
  newline: (line: Line) => void
}

export class LogicalLines extends StrictEventEmitter<Events> implements Logical<Draggable> {
  private tmppos: Nullable<Point> = null
  private tmpcur: Nullable<Point> = null
  private lastButton: MouseButton
  private button: MouseButton

  private ondragstart: (mousePosition: Point, mouseButton: MouseButton) => void
  private ondragstep: (mousePosition: Point) => void
  private ondragcancel: () => void
  private ondragend: (mousePosition: Point) => void

  constructor (button: MouseButton) {
    super()
    this.button = button
    this.lastButton = button
    this.ondragstart = this.dragstart(this)
    this.ondragstep = this.dragstep(this)
    this.ondragcancel = this.dragcancel(this)
    this.ondragend = this.dragend(this)
  }

  getCurrentLine () {
    if (this.tmppos && this.tmpcur && this.lastButton === this.button) {
      return new Line(this.tmppos, this.tmpcur)
    }
    return null
  }

  register (dispatcher: StrictEventEmitter<Draggable>) {
    dispatcher.on('dragstart', this.ondragstart)
    dispatcher.on('dragstep', this.ondragstep)
    dispatcher.on('dragcancel', this.ondragcancel)
    dispatcher.on('dragend', this.ondragend)
  }

  unregister (dispatcher: StrictEventEmitter<Draggable>) {
    dispatcher.off('dragstart', this.ondragstart)
    dispatcher.off('dragstep', this.ondragstep)
    dispatcher.off('dragcancel', this.ondragcancel)
    dispatcher.off('dragend', this.ondragend)
  }

  private dragstart (that: LogicalLines) {
    return (mousePosition: Point, mouseButton: MouseButton) => {
      if (mouseButton === that.button) that.tmppos = mousePosition
      else this.tmppos = null
      that.tmpcur = null
      that.lastButton = mouseButton
    }
  }

  private dragstep (that: LogicalLines) {
    return (mousePosition: Point) => {
      that.tmpcur = mousePosition
    }
  }

  private dragend (that: LogicalLines) {
    return (mousePosition: Point) => {
      if (that.tmppos != null) {
        that.emit('newline', new Line(that.tmppos, mousePosition))
      }
      that.tmppos = null
      that.tmpcur = null
    }
  }

  private dragcancel (that: LogicalLines) {
    return () => {
      that.tmppos = null
      that.tmpcur = null
    }
  }

  renderCurrentLine (color: Color) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this

    return (state: RenderState) => {
      const data = that.getCurrentLine()
      if (data != null) {
        const item = RoadLine.from(Line.Zero)
        item.setColor(color)
        item.setStart(data.start)
        item.setEnd(data.end)
        item.render(state)
        item.destroy()
      }
    }
  }

  renderCurrentArc (color: Color) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this

    return (state: RenderState) => {
      const data = that.getCurrentLine()
      if (data != null) {
        const item = RoadArc.from(data)
        item.setColor(color)
        item.render(state)
        item.destroy()
      }
    }
  }
}

export default LogicalLines
