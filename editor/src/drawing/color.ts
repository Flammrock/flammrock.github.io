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

import { Deserializer, JSONObject, Serializable } from '../core/object-mapper'

export class Color implements Serializable {
  static get Default () { return Color.fromRGB(100, 100, 100) }
  static get Blue () { return Color.fromRGB(0, 0, 255) }
  static get Red () { return Color.fromRGB(255, 0, 0) }
  static get Green () { return Color.fromRGB(0, 255, 0) }
  static get Yellow () { return Color.fromRGB(255, 255, 0) }
  static get Magenta () { return Color.fromRGB(255, 0, 255) }
  static get Cyan () { return Color.fromRGB(0, 255, 255) }
  static get Amber () { return Color.fromRGB(255, 191, 0) }
  static get Black () { return Color.fromRGB(0, 0, 0) }
  static get White () { return Color.fromRGB(255, 255, 255) }

  private _r: number
  private _g: number
  private _b: number

  protected set r (r: number) {
    this._r = r
  }

  get r (): number {
    return this._r
  }

  protected set g (g: number) {
    this._g = g
  }

  get g (): number {
    return this._g
  }

  protected set b (b: number) {
    this._b = b
  }

  get b (): number {
    return this._b
  }

  /**
   * Converts an RGB color value to HSL. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes r, g, and b are contained in the set [0, 255] and
   * returns h, s, and l in the set [0, 1].
   *
   * @param r The red color value
   * @param g The green color value
   * @param b The blue color value
   * @return The HSL representation
   */
  static rgbToHsl (r: number, g: number, b: number) {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b); const min = Math.min(r, g, b)
    let h = 0; let s = 0; const l = (max + min) / 2

    if (max === min) {
      h = s = 0 // achromatic
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return [h, s, l]
  }

  /**
   * Converts an HSL color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes h, s, and l are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   *
   * @param h The hue
   * @param s The saturation
   * @param l The lightness
   * @return The RGB representation
   */
  static hslToRgb (h: number, s: number, l: number) {
    let r, g, b

    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const hue2rgb = function hue2rgb (p: number, q: number, t: number) {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }

  protected constructor (r: number, g: number, b: number) {
    this._r = r
    this._g = g
    this._b = b
  }

  toString (): string {
    return `rgb(${this.r},${this.g},${this.b})`
  }

  static fromRGB (r: number, g: number, b: number) {
    return new Color(r, g, b)
  }

  static from (color: Color) {
    return new Color(color.r, color.g, color.b)
  }

  addRed (r: number): void {
    this.r += r
    if (this.r < 0) this.r = 0
    if (this.r > 255) this.r = 255
  }

  addGreen (g: number): void {
    this.g += g
    if (this.g < 0) this.g = 0
    if (this.g > 255) this.g = 255
  }

  addBlue (b: number): void {
    this.b += b
    if (this.b < 0) this.b = 0
    if (this.b > 255) this.b = 255
  }

  serialize (): JSONObject {
    return {
      type: 'Color',
      r: this.r,
      g: this.g,
      b: this.b
    }
  }

  static deserializer: Deserializer<Color> = (data: JSONObject) => {
    if (data.type !== 'Color') throw new Error('bad type')
    return Color.fromRGB(data.r, data.g, data.b)
  }
}

export default Color
