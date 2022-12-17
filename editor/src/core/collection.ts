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

import { Nullable } from '../helper/utils'
import { Deserializers, IsSerializable, JSONObject, Serializable } from './object-mapper'

export class Collection<T> implements Serializable {
  private storage: Array<T> = []

  static Empty <T> () { return new Collection<T>() }

  static from <T> (storage: Array<T>) {
    const r = new Collection<T>()
    for (const instance of storage) {
      r.add(instance)
    }
    return r
  }

  get length (): number {
    return this.storage.length
  }

  get (index: number): T {
    return this.storage[index]
  }

  add (instance: T) {
    this.storage.push(instance)
  }

  remove (instance: T) {
    const index = this.storage.indexOf(instance)
    if (index < 0) throw new Error('instance not found')
    this.storage.splice(index, 1)
  }

  tryRemove (instance: T) {
    const index = this.storage.indexOf(instance)
    if (index < 0) return
    this.storage.splice(index, 1)
  }

  forEach <K> (callbackfn: (this: K, value: T, index: number, array: T[]) => void, thisArg?: K) {
    this.storage.forEach(callbackfn, thisArg)
  }

  map <K, V> (callbackfn: (this: K, value: T, index: number, array: T[]) => V, thisArg?: K): Collection<V> {
    return Collection.from(this.storage.map(callbackfn, thisArg) as Array<V>)
  }

  find<S extends T> (
    predicate: (this: void, value: T, index: number, obj: T[]) => value is S,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thisArg?: any
  ): Nullable<S> {
    const v = this.storage.find(predicate, thisArg)
    if (typeof v === 'undefined') return null
    return v as S
  }

  filter<S extends T> (
    predicate: (this: void, value: T, index: number, obj: T[]) => value is S,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thisArg?: any
  ): Collection<S> {
    return Collection.from(this.storage.filter(predicate, thisArg)) as unknown as Collection<S>
  }

  toArray (): Array<T> {
    return this.storage
  }

  clear (): void {
    this.storage = []
  }

  destroy (): void {
    this.clear()
  }

  serialize (): JSONObject {
    const storage = []
    for (const instance of this.storage) {
      if (IsSerializable(instance)) {
        storage.push(instance.serialize())
      } else {
        storage.push(instance)
      }
    }
    return {
      type: 'Collection',
      storage
    }
  }

  static deserializer <T extends Serializable> (data: JSONObject, types?: Deserializers): Collection<T> {
    if (data.type !== 'Collection') throw new Error('bad type')
    if (typeof types === 'undefined') throw new Error('unable to deserialize generic class without types')
    const storage = []
    for (let i = 0; i < data.storage.length; i++) {
      const type = types[data.storage[i].type]
      if (typeof type === 'undefined') throw new Error(`unable to find the type ${data.storage[i].type}`)
      storage.push(type(data.storage[i], types))
    }
    return Collection.from(storage)
  }
}

export default Collection
