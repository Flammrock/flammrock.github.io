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
import { Deserializer, Deserializers, IsSerializable, JSONObject, Serializable } from './object-mapper'

interface PointerEvents {
  change: () => void
}

/**
 *
 */
export class Pointer<T> extends StrictEventEmitter<PointerEvents> implements Serializable {
  private value: T

  protected constructor (value: T) {
    super()
    this.value = value
  }

  set (value: T) {
    this.value = value
    this.emit('change')
  }

  get (): T {
    return this.value
  }

  /** @internal */
  static make <T> (value: T) {
    return new Pointer(value)
  }

  serialize (): JSONObject {
    return {
      type: 'Pointer',
      value: IsSerializable(this.value) ? this.value.serialize() : this.value
    }
  }

  static deserializer: Deserializer<Pointer<Serializable>> = (data: JSONObject, types?: Deserializers) => {
    if (data.type !== 'Registry') throw new Error('bad type')
    if (typeof types === 'undefined') throw new Error('unable to deserialize generic class without types')
    if (typeof data.value.type === 'undefined') {
      return Pointer.make(data.value)
    }
    const type = types[data.value.type]
    if (typeof type === 'undefined') throw new Error(`unable to find the type ${data.value.type}`)
    return Pointer.make(type(data.value, types))
  }
}

export function makePointer <T> (value: T) {
  return Pointer.make(value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPointer (ptr: any): ptr is Pointer<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ptr instanceof Pointer<any>
}
