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
import { isPointer, Pointer } from './pointer'

interface Events {
  set: () => void
  destroy: () => void
}

export type Convertor<T> = (value: string) => T
export type DeConvertor<T> = (value: T) => string

export const floatConvertor: Convertor<number> = (value: string) => {
  if (value.trim() === '' || (value.trim().length > 0 && value.trim().charAt(value.trim().length - 1) === '.') || Number.isNaN(Number(value))) throw new Error('bad value')
  return parseFloat(value)
}
export const floatDeconvertor: DeConvertor<number> = (value: number) => value + ''

class PropertyInputBuilder<T, K> {
  private placeholder = ''
  private value?: T
  private convertor?: Convertor<K>
  private deconvertor?: DeConvertor<K>

  constructor (placeholder: string, value?: T) {
    this.placeholder = placeholder
    this.value = value
  }

  setConvertor (convertor?: Convertor<K>): PropertyInputBuilder<T, K> {
    this.convertor = convertor
    return this
  }

  setDeConvertor (deconvertor?: DeConvertor<K>): PropertyInputBuilder<T, K> {
    this.deconvertor = deconvertor
    return this
  }

  convert (val: string | number | string[] | undefined): K {
    return typeof this.convertor === 'undefined' ? val as K : this.convertor(val as string)
  }

  deconvert (val: K): string {
    return typeof this.deconvertor === 'undefined' ? val as string : this.deconvertor(val)
  }

  build (): JQuery {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    const input = $(document.createElement('input'))
    input.attr('placeholder', this.placeholder)
    if (typeof this.value !== 'undefined') {
      if (isPointer(this.value)) {
        const value = this.value
        const listener = () => {
          input.val(that.deconvert(value.get()))
        }
        input.val(that.deconvert(this.value.get()))
        input.on('change keyup keydown', () => {
          value.off('change', listener)
          try {
            value.set(that.convert(input.val()))
            input.val(that.deconvert(value.get()))
          } catch (e) {}
          value.on('change', listener)
        })
        value.on('change', listener)
      } else {
        input.val(that.deconvert(this.value as unknown as K))
      }
    }
    return input
  }
}

class PropertySelectBuilder<T, K> {
  private placeholder = ''
  private value?: T
  private options: {[key: string]: string}
  private convertor?: Convertor<K>
  private deconvertor?: DeConvertor<K>

  constructor (placeholder: string, options: {[key: string]: string}, value?: T) {
    this.placeholder = placeholder
    this.value = value
    this.options = options
  }

  setConvertor (convertor?: Convertor<K>): PropertySelectBuilder<T, K> {
    this.convertor = convertor
    return this
  }

  setDeConvertor (deconvertor?: DeConvertor<K>): PropertySelectBuilder<T, K> {
    this.deconvertor = deconvertor
    return this
  }

  convert (val: string | number | string[] | undefined): K {
    return typeof this.convertor === 'undefined' ? val as K : this.convertor(val as string)
  }

  deconvert (val: K): string {
    return typeof this.deconvertor === 'undefined' ? val as string : this.deconvertor(val)
  }

  build (): JQuery {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    const input = $(document.createElement('select'))
    for (const [key, value] of Object.entries(this.options)) {
      input.append($('<option>', {
        value: key,
        text: value
      }))
    }
    if (typeof this.value !== 'undefined') {
      if (isPointer(this.value)) {
        const value = this.value
        const listener = () => {
          input.val(that.deconvert(value.get()))
        }
        input.val(that.deconvert(this.value.get()))
        input.on('change keyup keydown', () => {
          value.off('change', listener)
          try {
            value.set(that.convert(input.val()))
            input.val(that.deconvert(value.get()))
          } catch (e) {}
          value.on('change', listener)
        })
        value.on('change', listener)
      } else {
        input.val(that.deconvert(this.value as unknown as K))
      }
    }
    return input
  }
}

class PropertyFormBuilder {
  private name = 'unnamed'
  private input = $(document.createElement('input')) as JQuery

  setName (name: string) {
    this.name = name
    return this
  }

  setInput (input: JQuery) {
    this.input = input
    return this
  }

  build (): JQuery {
    const tr = $(document.createElement('tr'))
    const name = $(document.createElement('td'))
    name.addClass('fitwidth')
    name.html(this.name)
    const value = $(document.createElement('td'))
    value.append(this.input)
    tr.append(name)
    tr.append(value)
    return tr
  }
}

export const PropertyForm = () => {
  return new PropertyFormBuilder()
}

export const PropertyInput = <T, K> (placeholder: string, value?: T) => {
  return new PropertyInputBuilder<T, K>(placeholder, value)
}

export const PropertySelect = <T, K> (placeholder: string, options: {[key: string]: string}, value?: T) => {
  return new PropertySelectBuilder<T, K>(placeholder, options, value)
}

export type FormBuilder = () => JQuery

export const DefaultFormBuilder = <T, K> (name: string, value?: T, convertor?: Convertor<K>, deconvertor?: DeConvertor<K>): FormBuilder => {
  return () => {
    return PropertyForm().setName(name).setInput(PropertyInput<T, K>(name, value).setConvertor(convertor).setDeConvertor(deconvertor).build()).build()
  }
}

export const SelectFormBuilder = <T, K> (name: string, options: {[key: string]: string}, value?: T, convertor?: Convertor<K>, deconvertor?: DeConvertor<K>): FormBuilder => {
  return () => {
    return PropertyForm().setName(name).setInput(PropertySelect<T, K>(name, options, value).setConvertor(convertor).setDeConvertor(deconvertor).build()).build()
  }
}

export class Property<T> extends StrictEventEmitter<Events> {
  private name: string
  private value: T | Pointer<T>
  private convertor: Convertor<T>
  private formbuilder: FormBuilder
  constructor (name: string, defaultValue: T, convertor: Convertor<T>, formbuilder: FormBuilder)
  constructor (name: string, defaultValue: Pointer<T>, convertor: Convertor<T>, formbuilder: FormBuilder)
  constructor (name: string, defaultValue: T | Pointer<T>, convertor: Convertor<T>, formbuilder: FormBuilder) {
    super()
    this.name = name
    this.value = defaultValue
    this.convertor = convertor
    this.formbuilder = formbuilder
  }

  getForm (): JQuery {
    const form = this.formbuilder()
    const listener = () => {
      form.remove()
      this.off('destroy', listener)
    }
    this.on('destroy', listener)
    return form
  }

  getName () {
    return this.name
  }

  setValue (value: T) {
    if (isPointer(this.value)) {
      this.value.set(this.convertor(value as unknown as string))
    } else {
      this.value = this.convertor(value as unknown as string)
    }
    this.emit('set')
  }

  getValue () {
    if (isPointer(this.value)) {
      return this.value.get()
    } else {
      return this.value
    }
  }

  destroy (): void {
    this.emit('destroy')
  }
}

export type Properties<T> = { [K in keyof T]?: Property<T[K] | Pointer<T[K]>> }

export default Property
