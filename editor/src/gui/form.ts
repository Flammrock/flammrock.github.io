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

import { W2FormOptions, W2RecordOptions } from 'w2ui'
import UniqueID from '../core/unique-id'
import UIElement from './internal/ui-element'

export class Form implements UIElement {
  static genId: UniqueID = new UniqueID()
  private root: JQuery
  private record?: W2RecordOptions
  private form: W2UI.W2Form

  constructor (options: W2FormOptions) {
    this.root = $(document.createElement('div'))
    // this.root.addClass('form-full')
    this.form = this.root.w2form({
      ...options,
      name: `form-${Form.genId.get()}`,
      box: this.root
    })
    this.record = options.record
  }

  refresh () {
    this.form.refresh()
  }

  get (field: string) {
    return this.form.getValue(field)
  }

  set (field: string, value: unknown) {
    this.form.setValue(field, value)
  }

  clear () {
    this.form.clear()
  }

  reset () {
    if (this.record) {
      this.form.record = this.record
    } else {
      this.clear()
    }
  }

  element (): JQuery<HTMLElement> {
    return this.root
  }
}

export default Form
