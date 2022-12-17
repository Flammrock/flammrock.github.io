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
import { Layout } from './layout'
import ViewItem from './view-item'
import { StrictEventEmitter } from 'strict-event-emitter'
import { Nullable } from '../helper/utils'
import Property from '../core/property'
import UIElement from './internal/ui-element'

interface Events {
  delete: (index: number) => void
  select: (index: number) => void
  unselect: (index: number) => void
}

export class View extends StrictEventEmitter<Events> implements UIElement {
  private _layout: Layout
  private root: HTMLDivElement
  private container: HTMLDivElement
  private properties: HTMLDivElement
  private items: Array<ViewItem>
  private selected: Nullable<ViewItem> = null
  private onclick: (evt: MouseEvent) => void

  constructor () {
    super()
    this.onclick = this.clicktrigger(this)
    this.root = document.createElement('div')
    this.container = document.createElement('div')
    this.properties = document.createElement('div')
    // this.root.addEventListener('click', this.onclick, false)
    this.items = []
    this._layout = new Layout($(this.root))
    this._layout.setTop({
      size: 200,
      resizable: true,
      style: Layout.Style,
      title: 'Items',
      content: this.container
    })
    this._layout.setMain({
      size: 200,
      resizable: true,
      style: Layout.Style,
      title: 'Properties',
      content: this.properties
    })
  }

  private clicktrigger (that: View) {
    return (evt: MouseEvent) => {
      evt.stopPropagation()
      if (that.selected != null) {
        const lastSelected = that.getIndex(that.selected)
        that.selected.unselect()
        that.selected = null
        that.emit('unselect', lastSelected)
      }
    }
  }

  private onpropertiesupdatetrigger (item: ViewItem) {
    return () => {
      this.setProperties(item)
    }
  }

  getIndex (item: ViewItem) {
    const index = this.items.indexOf(item)
    if (index < 0) throw new Error('item not found')
    return index
  }

  element () {
    return $(this.container)
  }

  layout () {
    return this._layout.state()
  }

  add (item: ViewItem) {
    this.items.push(item)
    item.setIndex(this.items.length)
    this.container.appendChild(item.element()[0])
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    item.on('delete', () => {
      that.remove(item)
    })
    item.on('click', () => {
      that.toggleSelect(item)
    })
    item.on('select', () => {
      that.select(item)
    })
    item.on('unselect', () => {
      that.unselect(item)
    })
  }

  private listenInput (input: HTMLInputElement, property: Property<unknown>) {
    return () => {
      property.setValue(input.value)
    }
  }

  toggleSelectByIndex (index: number) {
    if (index < 0 || index > this.items.length - 1) throw new Error('index out of bounds')
    const item = this.items[index]
    for (let i = 0; i < this.items.length; i++) {
      if (item === this.items[i]) continue
      this.items[i].unselect()
    }
    if (item.isSelected()) {
      item.unselect()
      this.selected = null
      this.emit('unselect', index)
      $(this.properties).empty()
      return
    }
    item.select()
    this.selected = item
    this.emit('select', index)
    this.setProperties(item)
  }

  toggleSelect (item: ViewItem) {
    const index = this.items.indexOf(item)
    if (index < 0) throw new Error('item not found')
    this.toggleSelectByIndex(index)
  }

  selectByIndex (index: number) {
    if (index < 0 || index > this.items.length - 1) throw new Error('index out of bounds')
    const item = this.items[index]
    for (let i = 0; i < this.items.length; i++) {
      if (item === this.items[i]) continue
      this.items[i].unselect()
    }
    if (item.isSelected()) {
      return
    }
    item.select()
    this.selected = item
    this.emit('select', index)
    this.setProperties(item)
  }

  select (item: ViewItem) {
    const index = this.items.indexOf(item)
    if (index < 0) throw new Error('item not found')
    this.selectByIndex(index)
  }

  unselectByIndex (index: number) {
    if (index < 0 || index > this.items.length - 1) throw new Error('index out of bounds')
    const item = this.items[index]
    for (let i = 0; i < this.items.length; i++) {
      if (item === this.items[i]) continue
      this.items[i].unselect()
    }
    if (item.isSelected()) {
      item.unselect()
      this.selected = null
      this.emit('unselect', index)
      $(this.properties).empty()
    }
  }

  unselect (item: ViewItem) {
    const index = this.items.indexOf(item)
    if (index < 0) throw new Error('item not found')
    this.unselectByIndex(index)
  }

  getSelectedItem () {
    return this.selected
  }

  getSelectedIndex () {
    return this.selected == null ? null : this.getIndex(this.selected)
  }

  removeByIndex (index: number): number {
    if (index < 0 || index > this.items.length - 1) throw new Error('index out of bounds')
    this.container.removeChild(this.items[index].element()[0])
    if (this.selected === this.items[index]) {
      this.selected.unselect()
      this.selected = null
      $(this.properties).empty()
      this.emit('unselect', index)
    }
    this.items.splice(index, 1)
    this.reorder()
    this.emit('delete', index)
    return index
  }

  remove (item: ViewItem): number {
    const index = this.items.indexOf(item)
    if (index < 0) throw new Error('item not found')
    return this.removeByIndex(index)
  }

  reset () {
    this.items = []
    this.selected = null
    $(this.properties).empty()
    $(this.container).empty()
  }

  private reorder () {
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].setIndex(i + 1)
    }
  }

  private setProperties (item: ViewItem) {
    const title = document.createElement('div')
    title.innerHTML = `Properties of <strong>${item.getName()}</strong>`
    $(this.properties).empty()
    this.properties.appendChild(title)
    // todo: properties html build maybe static or something
    const props = item.getProperties() as { [index:string] : Property<string> }

    const table = $(document.createElement('table'))
    table.addClass('properties-table')

    const tbody = $(document.createElement('tbody'))

    item.getItem().removeAllListeners('propertiesUpdate').on('propertiesUpdate', this.onpropertiesupdatetrigger(item))

    for (const key in props) {
      const prop = props[key]
      const tr = prop.getForm()
      tbody.append(tr)
    }
    table.append(tbody)
    $(this.properties).append(table)
  }
}

export default View
