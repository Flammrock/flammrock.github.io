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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JSONObject = any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassType = any

export interface Serializable {

  serialize(): JSONObject

}

export type Deserializer<T = Serializable> = (data: JSONObject, types?: {[type: string]: Deserializer<ClassType>}) => T

export type Deserializers = {[type: string]: Deserializer<ClassType>}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function IsSerializable (value: any): value is Serializable {
  return typeof value.serialize === 'function'
}

export class ObjectMapper {
  static stringify (o: Serializable): string {
    return JSON.stringify(o.serialize())
  }

  static parse <T> (data: string, types: Deserializers): T {
    const o = JSON.parse(data)
    if (typeof o.type === 'undefined') throw new Error('bad data')
    if (typeof types[o.type] === 'undefined') throw new Error(`unable to find the type ${o.type}`)
    const type = types[o.type]
    return <T>type(o, types)
  }
}
