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

import { EPSILON } from '../helper/utils'
import Point from './point'

export class Vector {
  values: number[]

  constructor(x?: number, y?: number);
  constructor(values?: number[]);
  constructor(k?: number);
  constructor(a?: Point);
  constructor(a?: Point, b?: Point);
  constructor (a?: number | number[] | Point, b?: number | Point) {
    if (a instanceof Point && b instanceof Point) {
      const c = Point.sub(b, a)
      this.values = [c.x, c.y]
    } else if (Array.isArray(a)) {
      this.values = a.length >= 2 ? [a[0], a[1]] : a.length === 1 ? [a[0], a[0]] : [0, 0]
    } else if (typeof b === 'undefined') {
      if (a instanceof Point) {
        this.values = [a.x, a.y]
      } else {
        this.values = [typeof a === 'number' ? a : 0, typeof a === 'number' ? a : 0]
      }
    } else {
      this.values = [typeof a === 'number' ? a : 0, typeof b === 'number' ? b : 0]
    }
  }

  get x (): number { return this.values[0] }
  set x (val: number) { this.values[0] = val }

  get y (): number { return this.values[1] }
  set y (val: number) { this.values[1] = val }

  static get Left (): Vector { return new Vector(-1, 0) }
  static get Right (): Vector { return new Vector(+1, 0) }
  static get Up (): Vector { return new Vector(0, +1) }
  static get Down (): Vector { return new Vector(0, -1) }

  static get Zero (): Vector { return new Vector(0, 0) }
  static get One (): Vector { return new Vector(1, 1) }

  static get X (): Vector { return new Vector(+1, 0) }
  static get Y (): Vector { return new Vector(0, +1) }

  /** Adds the scalar value to each component. */
  add(scalar: number): Vector;
  /** Returns the vector addition (this + vector). */
  add(vector: Vector): Vector;
  add (that: Vector | number): Vector {
    if (that instanceof Vector) {
      return new Vector(this.values[0] + that.values[0], this.values[1] + that.values[1])
    } else {
      return new Vector(this.values[0] + that, this.values[1] + that)
    }
  }

  /** Subtracts the scalar value from each component. */
  sub(scalar: number): Vector;
  /** Returns the vector subtraction (this - that). */
  sub(vector: Vector): Vector;
  sub (that: number | Vector): Vector {
    if (that instanceof Vector) {
      return new Vector(this.values[0] - that.values[0], this.values[1] - that.values[1])
    } else {
      return new Vector(this.values[0] - that, this.values[1] - that)
    }
  }

  /** Returns the dot product (this * that). */
  dot (that: Vector): number {
    return this.values[0] * that.values[0] + this.values[1] * that.values[1]
  }

  /**
     * Returns 2D cross product (this x that).
     *
     * Equivalent to embedding this and that in the XY plane and returning the Z value of the product vector
     * (such a vector would be of the form (0, 0, z)).
     */
  cross (that: Vector): number {
    return this.values[0] * that.values[1] - this.values[1] * that.values[0]
  }

  /** Returns the scalar product (scalar * this). */
  times(scalar: number): Vector;
  /** Returns the component-wise product (this * vector). */
  times(vector: Vector): Vector;
  times (that: number | Vector): Vector {
    if (that instanceof Vector) {
      return new Vector(this.values[0] * that.values[0], this.values[1] * that.values[1])
    } else {
      return new Vector(this.values[0] * that, this.values[1] * that)
    }
  }

  /** Returns the scalar division (this / scalar). */
  div(scalar: number): Vector;
  /** Returns the component-wise division (this / vector). */
  div(vector: Vector): Vector;
  div (that: number | Vector): Vector {
    if (that instanceof Vector) {
      return new Vector(this.values[0] / that.values[0], this.values[1] / that.values[1])
    } else {
      return new Vector(this.values[0] / that, this.values[1] / that)
    }
  }

  /** Returns -this. */
  negate (): Vector {
    return this.times(-1)
  }

  /** Returns the squared magnitude of this vector. */
  magSqr (): number {
    return this.values[0] * this.values[0] + this.values[1] * this.values[1]
  }

  /** Returns the magnitude of this vector. */
  mag (): number {
    return Math.sqrt(this.magSqr())
  }

  /** Returns a normalized copy of this vector. */
  normalized (): Vector {
    return this.div(this.mag())
  }

  /** Returns the angle betwen this and vector */
  angle (vector: Vector): number {
    return Math.atan2(this.values[1] - vector.values[1], this.values[0] - vector.values[1])
  }

  /**
     * Returns the angle between this vector and the x-axis.
     *
     * Returns the angle between this vector and (1, 0), in radians, in the range (-Pi, +Pi].
     */
  argument (): number {
    return Math.atan2(this.values[1], this.values[0])
  }

  /** Returns a copy of this vector. */
  clone (): Vector {
    return new Vector(this.values[0], this.values[1])
  }

  /** Returns a copy of this vector, scaled if needed so its magnitude is at most 'length'. */
  cap (length: number): Vector {
    if (length <= EPSILON) {
      return new Vector(0, 0)
    }
    const mag = this.mag()
    if (length < mag) {
      return this.times(length / mag)
    }
    return this.clone()
  }

  /** Returns a copy of this vector, swapping x and y. */
  transpose (): Vector {
    return new Vector(this.values[1], this.values[0])
  }

  /** Returns the orthogonal vector v such that (this, v) is a right-handed basis, and |v| = |this|. */
  orthogonal (): Vector {
    return new Vector(-this.values[1], this.values[0])
  }

  /** Returns a copy of this vector, applying floor() to all components. */
  floor (): Vector {
    return new Vector(Math.floor(this.values[0]), Math.floor(this.values[1]))
  }

  /** Returns a copy of this vector, applying ceil() to all components. */
  ceil (): Vector {
    return new Vector(Math.ceil(this.values[0]), Math.ceil(this.values[1]))
  }

  /** Returns a copy of this vector, applying abs() to all components. */
  abs (): Vector {
    return new Vector(Math.abs(this.values[0]), Math.abs(this.values[1]))
  }

  /** Returns a copy of this vector, applying f() to all components. */
  map (f: (x: number) => number): Vector {
    return new Vector(f(this.values[0]), f(this.values[1]))
  }

  /** Returns the maximum component in this vector. */
  max(): number;
  /** Returns the component-wise maximum of this and that. */
  max(that: Vector): Vector;
  max (that?: Vector): Vector | number {
    if (that === undefined) {
      return Math.max(this.values[0], this.values[1])
    } else {
      return new Vector(
        Math.max(this.values[0], that.values[0]),
        Math.max(this.values[1], that.values[1])
      )
    }
  }

  /** Returns the minimum component in this vector. */
  min(): number;
  /** Returns the component-wise minimum of this and that. */
  min(that: Vector): Vector;
  min (that?: Vector): Vector | number {
    if (that === undefined) {
      return Math.min(this.values[0], this.values[1])
    } else {
      return new Vector(
        Math.min(this.values[0], that.values[0]),
        Math.min(this.values[1], that.values[1])
      )
    }
  }

  /** Returns the Euclidean distance between u and v. */
  static dist (u: Vector, v: Vector): number {
    return u.sub(v).mag()
  }

  /** Returns the projection of arbitrary vector 'v' into *unit* vector 'n', as a Vector. */
  static Project (v: Vector, n: Vector): Vector {
    return n.times(v.dot(n))
  }

  /** Returns a Vector (Cartesian coordinates) corresponding to the polar coordinates (radius, angle). */
  static FromPolar (radius: number, angle: number): Vector {
    return new Vector(radius * Math.cos(angle), radius * Math.sin(angle))
  }

  /** Linearly interpolate between a at t=0 and b at t=1 (t is NOT clamped). */
  static Interpolate (a: Vector, b: Vector, t: number): Vector {
    return a.add(b.sub(a).times(t))
  }

  /** Calculate the average vector. */
  static Average (...vecs: Vector[]): Vector {
    let accumulator = new Vector(0, 0)
    if (vecs.length === 0) {
      return accumulator
    }

    for (const vec of vecs) {
      accumulator = accumulator.add(vec)
    }

    return accumulator.div(vecs.length)
  }

  /**
   * Calculate the weighted average vector.
   *
   * Iterates up to shortest length.
   * Ignores negative or approximately zero weights and their associated vectors.
  */
  static WeightedAverage (vecs: Vector[], weights: number[]): Vector {
    let accumulator = new Vector(0, 0)
    let totalWeight = 0

    const N = Math.min(vecs.length, weights.length)
    if (N === 0) {
      return accumulator
    }

    for (let i = 0; i < N; i++) {
      const vec = vecs[i]
      const weight = weights[i]
      if (weight > EPSILON) {
        totalWeight += weight
        accumulator = accumulator.add(vec.times(weight))
      }
    }

    if (totalWeight > EPSILON) {
      return accumulator.div(totalWeight)
    } else {
      return accumulator
    }
  }
}
