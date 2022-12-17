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

export const Globals = {

  /* Maximum Objects in a map */
  MaxRoads: 50, // not currently supported
  MaxSteps: 50, // not currently supported
  MaxStops: 50, // not currently supported
  MaxObstacles: 10, // not currently supported
  MaxTrafficLights: 6, // not currently supported
  MaxItinerary: 50, // not currently supported

  /* Bound Size Map */
  MinX: 0, // not currently supported
  MinY: 0, // not currently supported
  MaxX: 600, // not currently supported
  MaxY: 300, // not currently supported

  /* Traffic lights and stop */
  TLNumber: 5, // not currently supported
  TLView: 50, // supported
  TLCosDir: 0.5, // supported
  STPAfter: 3.0, // not currently supported

  /* Speeds bound */
  MinSpeed: 20, // not currently supported
  MaxSpeed: 40 // not currently supported
}

export default Globals
