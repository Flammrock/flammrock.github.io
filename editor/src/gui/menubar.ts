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
import $ from 'jquery'
import { StrictEventEmitter } from 'strict-event-emitter'
import { Nullable } from '../helper/utils'
import { ButtonItem, MenuBar, MenuItem, SeparatorItem } from 'jdmenubar'
import UIElement from './internal/ui-element'

interface Events {
  trigger: (item: MenuInternalButtonItem) => void
}

type MenuInternalItemOptions = Omit<ButtonItem, 'subMenuItems'> | SeparatorItem

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MenuInternalItem {
}

type MenuInternalItemReturnType<T> = T extends SeparatorItem ? MenuInternalSeparatorItem : MenuInternalButtonItem

function IsMenuSeparator (object: MenuInternalItemOptions): object is SeparatorItem {
  return 'separator' in object
}

class MenuInternalSeparatorItem implements MenuInternalItem {
  private options: SeparatorItem
  private data: Array<MenuItem>
  constructor (options: SeparatorItem, data: Array<MenuItem>) {
    this.options = options
    this.data = data
    this.data.push(options)
  }
}

class MenuInternalButtonItem extends StrictEventEmitter<Events> implements MenuInternalItem {
  private options: Omit<ButtonItem, 'subMenuItems'>
  private data?: Array<MenuItem>
  constructor (options: Omit<ButtonItem, 'subMenuItems'>, data: Array<MenuItem>) {
    super()
    this.options = options
    const opts = options as ButtonItem
    opts.handler = this.handlertrigger(this)
    data.push(opts)
  }

  private handlertrigger (that: MenuInternalButtonItem) {
    return () => {
      that.emit('trigger', this)
    }
  }

  add <T extends MenuInternalItemOptions> (options: T): MenuInternalItemReturnType<T> {
    if (typeof this.data === 'undefined') {
      const opts = this.options as ButtonItem
      opts.subMenuItems = []
      this.data = opts.subMenuItems
    }
    return MenuInternalItemFactory.from(options, this.data) as MenuInternalItemReturnType<T>
  }
}

class MenuInternalItemFactory {
  static from (options: MenuInternalItemOptions, data: Array<MenuItem>) {
    if (IsMenuSeparator(options)) {
      return new MenuInternalSeparatorItem(options, data)
    } else {
      return new MenuInternalButtonItem(options, data)
    }
  }
}

export class Menu implements UIElement {
  private internal: Nullable<MenuBar>
  private data: Array<MenuItem>
  private root: JQuery

  constructor () {
    this.root = $(document.createElement('div'))
    this.data = []
    // eslint-disable-next-line no-unused-vars
    this.internal = new MenuBar(this.root[0], this.data)
    // this.internal.
  }

  add <T extends MenuInternalItemOptions> (options: T): MenuInternalItemReturnType<T> {
    return MenuInternalItemFactory.from(options, this.data) as MenuInternalItemReturnType<T>
  }

  build () {
    this.internal?.update()
  }

  element (): JQuery<HTMLElement> {
    return this.root
  }
}

export default Menu

/* [
      {
        text: 'File',
        subMenuItems: [
          {
            text: 'New',
            shortcut: 'Ctrl+N',
            icon: '✏'
          },
          { text: 'Open' },
          {
            id: 'open_recent',
            text: 'Open Recent',
            subMenuItems: [
              { text: 'File1.txt' },
              { text: 'File2.txt' },
              { separator: true },
              {
                text: 'Or even older',
                subMenuItems: [
                  { text: 'File3.txt' },
                  { text: 'File4.txt' }
                ]
              }
            ]
          },
          { separator: true },
          { text: 'Save', shortcut: 'Ctrl+S', icon: '&#128190;', enabled: false },
          { text: 'Save As...', shortcut: 'Ctrl+Shift+S' }
        ]
      },
      {
        id: 'edit',
        text: 'Edit',
        subMenuItems: [
          { text: 'Cut', icon: '✂️' },
          { text: 'Copy', icon: '📄' },
          { text: 'Paste', icon: '📋' }
        ]
      },
      {
        text: 'Help',
        subMenuItems: [
          {
            text: 'More',
            icon: '☃',
            subMenuItems: [
              { text: 'This' },
              { text: 'And that' }
            ]
          },
          { text: 'About' }
        ]
      }
    ] */
