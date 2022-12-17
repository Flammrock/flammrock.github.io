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
import { W2Tabs, W2TabsOptions } from 'w2ui'
import Panel from './internal/panel'
import { UIElement } from './internal/ui-element'

export class Layout implements UIElement {
  static Style = 'padding: 5px;'

  private static id = 0

  private mainlayout: W2UI.W2Layout
  private root: JQuery

  constructor (root: JQuery) {
    this.root = root

    this.mainlayout = root.w2layout({
      box: this.root[0],
      name: `layout_${Layout.id}`,
      padding: 0,
      panels: []
    })

    Layout.id++
  }

  state () {
    return this.mainlayout
  }

  element () {
    return this.root
  }

  getMain (): JQuery {
    return $(this.mainlayout.el('main'))
  }

  getTop (): JQuery {
    return $(this.mainlayout.el('top'))
  }

  getLeft () {
    return $(this.mainlayout.el('left'))
  }

  getRight () {
    return $(this.mainlayout.el('right'))
  }

  getBottom () {
    return $(this.mainlayout.el('bottom'))
  }

  getPreview () {
    return $(this.mainlayout.el('preview'))
  }

  render () {
    this.mainlayout.render()
  }

  assignTabs (tabs: W2TabsOptions) {
    this.mainlayout.assignTabs('main', new W2Tabs(tabs) as W2UI.W2Tabs)
  }

  setMain (panel: Panel) {
    panel.type = 'main'
    this.mainlayout.set(panel.type, panel)
    this.mainlayout.show(panel.type, true)
  }

  setTop (panel: Panel) {
    panel.type = 'top'
    this.mainlayout.set(panel.type, panel)
    this.mainlayout.show(panel.type, true)
  }

  setLeft (panel: Panel) {
    panel.type = 'left'
    this.mainlayout.set(panel.type, panel)
    this.mainlayout.show(panel.type, true)
  }

  setRight (panel: Panel) {
    panel.type = 'right'
    this.mainlayout.set(panel.type, panel)
    this.mainlayout.show(panel.type, true)
  }

  setBottom (panel: Panel) {
    panel.type = 'bottom'
    this.mainlayout.set(panel.type, panel)
    this.mainlayout.show(panel.type, true)
  }

  setPreview (panel: Panel) {
    panel.type = 'preview'
    this.mainlayout.set(panel.type, panel)
    this.mainlayout.show(panel.type, true)
  }
}

export default Layout
