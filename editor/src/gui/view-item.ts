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
import { Item } from '../drawing/item'
import UIElement from './internal/ui-element'

interface Events {
  delete: () => void
  click: () => void
  select: () => void
  unselect: () => void
}

export class ViewItem<T = unknown> extends StrictEventEmitter<Events> implements UIElement {
  private _isselected = false
  private container: HTMLDivElement
  private indexElement: HTMLSpanElement
  private nameElement: HTMLSpanElement
  private deleteElement: HTMLSpanElement
  private name: string
  private item: Item<T>
  private index = 0
  private ondelete: (evt: MouseEvent) => void
  private onclick: (evt: MouseEvent) => void
  private ondestroy: () => void
  private onselect: () => void
  private onunselect: () => void

  constructor (name: string, item: Item<T>) {
    super()
    this.ondelete = this.deletetrigger(this)
    this.onclick = this.clicktrigger(this)
    this.ondestroy = this.destroytrigger(this)
    this.onselect = this.selecttrigger(this)
    this.onunselect = this.unselecttrigger(this)
    this.name = name
    this.item = item
    this.container = document.createElement('div')
    this.container.classList.add('view-item')
    this.container.addEventListener('click', this.onclick, false)
    this.indexElement = document.createElement('span')
    this.indexElement.classList.add('view-item-index')
    this.nameElement = document.createElement('span')
    this.nameElement.classList.add('view-item-name')
    this.deleteElement = document.createElement('span')
    this.deleteElement.classList.add('view-item-delete')
    this.deleteElement.innerHTML = '🗑️'
    this.deleteElement.addEventListener('click', this.ondelete, false)
    this.setIndex(this.index)
    this.setName(this.name)
    this.container.appendChild(this.indexElement)
    this.container.appendChild(this.nameElement)
    this.container.appendChild(this.deleteElement)
    this.item.on('destroy', this.ondestroy)
    this.item.on('select', this.onselect)
    this.item.on('unselect', this.onunselect)
  }

  selecttrigger (that: ViewItem<T>) {
    return () => {
      that.emit('select')
    }
  }

  unselecttrigger (that: ViewItem<T>) {
    return () => {
      that.emit('unselect')
    }
  }

  destroytrigger (that: ViewItem<T>) {
    return () => {
      that.item.off('destroy', that.ondestroy)
      that.item.off('select', that.onselect)
      that.item.off('unselect', that.onunselect)
      that.emit('delete')
    }
  }

  select () {
    this._isselected = true
    this.container.classList.add('selected')
    this.item.off('select', this.onselect)
    this.item.select()
    this.item.on('select', this.onselect)
  }

  unselect () {
    this._isselected = false
    this.container.classList.remove('selected')
    this.item.off('unselect', this.onunselect)
    this.item.unselect()
    this.item.on('unselect', this.onunselect)
  }

  isSelected () {
    return this._isselected
  }

  private clicktrigger (that: ViewItem<T>) {
    return (evt: MouseEvent) => {
      evt.stopPropagation()
      that.emit('click')
    }
  }

  private deletetrigger (that: ViewItem<T>) {
    return (evt: MouseEvent) => {
      evt.stopPropagation()
      this.item.off('destroy', this.ondestroy)
      that.item.destroy()
      that.emit('delete')
    }
  }

  element () {
    return $(this.container)
  }

  setIndex (index: number) {
    this.index = index
    this.indexElement.innerHTML = `#${this.index}`
  }

  setName (name: string) {
    this.name = name
    this.nameElement.innerHTML = name
  }

  getName () {
    return this.name
  }

  getProperties () {
    return this.item.getProperties()
  }

  getItem () {
    return this.item
  }
}

export default ViewItem
