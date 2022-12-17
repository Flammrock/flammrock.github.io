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

import $ from 'jquery'
import { StrictEventEmitter } from 'strict-event-emitter'
import Tool from './tool'
import UIElement from './internal/ui-element'
import { Nullable } from '../helper/utils'

interface Events {
  select: (tool: Tool) => void
  unselect: (tool: Tool) => void
}

export class Toolbar extends StrictEventEmitter<Events> implements UIElement {
  private internal: Array<Tool> = []
  private root: JQuery
  private _selected: Nullable<Tool> = null

  private toolonselect: (tool: Tool) => void
  private toolonunselect: (tool: Tool) => void

  constructor () {
    super()
    this.root = $(document.createElement('div'))
    this.root.addClass('toolbar')
    this.toolonselect = this.toolonselecttrigger(this)
    this.toolonunselect = this.toolonunselecttrigger(this)
  }

  private toolonselecttrigger (that: Toolbar) {
    return (t: Tool) => {
      // disable all but enable one
      that._selected = t
      const tools = this.internal
      for (const tool of tools) {
        if (tool.isSelected() && t === tool) continue
        tool.off('select', that.toolonselect)
        tool.off('unselect', that.toolonunselect)
        if (t === tool && !tool.isSelected()) {
          tool.select() // duplicate?
        } else if (tool.isSelected()) {
          tool.unselect() // duplicate?
        }
        tool.on('select', that.toolonselect)
        tool.on('unselect', that.toolonunselect)
      }
    }
  }

  private toolonunselecttrigger (that: Toolbar) {
    return () => {
      // disable all
      that._selected = null
      const tools = this.internal
      for (const tool of tools) {
        if (!tool.isSelected()) continue
        tool.off('select', that.toolonselect)
        tool.off('unselect', that.toolonunselect)
        // tool.removeAllListeners('unselect')
        tool.unselect() // duplicate?
        tool.on('select', that.toolonselect)
        tool.on('unselect', that.toolonunselect)
      }
    }
  }

  element () {
    return this.root
  }

  register (tool: Tool): Toolbar {
    this.internal.push(tool)
    this.root.append(tool.element()) // duplicate?
    tool.on('select', this.toolonselect)
    tool.on('unselect', this.toolonunselect)
    return this
  }

  unregister (tool: Tool): Toolbar {
    const index = this.internal.indexOf(tool)
    if (index >= 0) this.internal.splice(index, 1)
    this.root.find(tool.element()).remove() // duplicate?
    tool.off('select', this.toolonselect)
    tool.off('unselect', this.toolonunselect)
    return this
  }

  selected () {
    return this._selected
  }
}

export default Toolbar
