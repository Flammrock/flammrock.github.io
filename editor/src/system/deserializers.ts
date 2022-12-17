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

import { Deserializers } from '../core/object-mapper'
import Layer from '../drawing/layer'
import Scene from '../drawing/scene'
import Sprite from '../drawing/sprite'
import Obstacle from '../engine/obstacle'
import RoadFilter from '../engine/filter-road'
import StartingPoint from '../engine/starting-point'
import Step from '../engine/step'
import Stop from '../engine/stop'
import RoadLine from '../engine/road-line'
import RoadArc from '../engine/road-arc'
import Line from '../core/line'
import Point from '../core/point'
import Arc from '../core/arc'

export const deserializers: Deserializers = {
  Line: Line.deserializer,
  Point: Point.deserializer,
  Arc: Arc.deserializer,
  Scene: Scene.deserializer,
  Layer: Layer.deserializer,
  RoadLine: RoadLine.deserializer,
  RoadArc: RoadArc.deserializer,
  Sprite: Sprite.deserializer,
  StartingPoint: StartingPoint.deserializer,
  Obstacle: Obstacle.deserializer,
  Step: Step.deserializer,
  Stop: Stop.deserializer,
  RoadFilter: RoadFilter.deserializer
}

export default deserializers
