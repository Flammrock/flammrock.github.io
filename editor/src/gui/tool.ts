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
import UIElement from './internal/ui-element'

interface Events {
  select: (tool: Tool) => void
  unselect: (tool: Tool) => void
}

interface ToolOptions {
  icon: string
}

export class Tool extends StrictEventEmitter<Events> implements UIElement {
  readonly icon: string
  private root: JQuery
  private selected = false
  constructor (options: ToolOptions) {
    super()
    this.icon = options.icon
    this.root = $(document.createElement('div'))
    this.root.html(`<div class="tool-icon"><i class="${this.icon}"></i></div>`)
    this.root.addClass('tool')
    this.root.on('click', () => {
      this.select()
    })
  }

  element (): JQuery<HTMLElement> {
    return this.root
  }

  select () {
    if (this.isSelected()) return
    this.selected = true
    this.root.addClass('active')
    this.emit('select', this)
  }

  unselect () {
    if (!this.isSelected()) return
    this.selected = false
    this.root.removeClass('active')
    this.emit('unselect', this)
  }

  isSelected () {
    return this.selected
  }
}

export default Tool
