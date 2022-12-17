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

import { getOrDefaultValue, IsInstanceOf } from '../helper/utils'
import Point from '../core/point'
import Rectangle from '../core/rectangle'
import Init from '../map/init'
import Itinerary, { Action } from '../map/itinerary'
import Obstacle from '../map/obstacle'
import Road from '../map/road'
import RoadLine from '../map/road-line'
import RoadArc from '../map/road-arc'
import Stop from '../map/stop'
import TrafficLight from '../map/traffic-light'
import WayPoint from '../map/way-point'
import Scene from '../drawing/scene'
import { RoadLine as RoadLineItem } from './road-line'
import { RoadArc as RoadArcItem } from './road-arc'
import { StartingPoint as StartingPointItem } from './starting-point'
import { Step as StepItem } from './step'
import { Obstacle as ObstacleItem } from './obstacle'
import { Stop as StopItem } from './stop'

export interface MapOptions {
  name?: string
  graphics?: string
  guide?: string
  init?: Init
  roads?: Array<Road>
  ways?: Array<WayPoint>
  trafficLights?: Array<TrafficLight>
  stops?: Array<Stop>
  obstacles?: Array<Obstacle>
  itinerary?: Itinerary
}

export class MapWriter {
  private name: string
  private graphics: string
  private guide: string
  private init: Init
  private roads: Array<Road>
  private ways: Array<WayPoint>
  private trafficLights: Array<TrafficLight>
  private stops: Array<Stop>
  private obstacles: Array<Obstacle>
  private itinerary: Itinerary

  getName () {
    return this.name
  }

  getItiName (): string {
    return `${this.name}.iti`
  }

  getGraphicsName (): string {
    return this.graphics
  }

  getGuideName (): string {
    return this.guide
  }

  private constructor (options: MapOptions) {
    this.name = getOrDefaultValue(options.name, 'unnamed')
    this.graphics = getOrDefaultValue(options.graphics, 'game-unnamed.bmp')
    this.guide = getOrDefaultValue(options.guide, 'b-unnamed.bmp')
    this.init = getOrDefaultValue(options.init, Init.Zero)
    this.roads = getOrDefaultValue(options.roads, [])
    this.ways = getOrDefaultValue(options.ways, [])
    this.trafficLights = getOrDefaultValue(options.trafficLights, [])
    this.stops = getOrDefaultValue(options.stops, [])
    this.obstacles = getOrDefaultValue(options.obstacles, [])
    this.itinerary = getOrDefaultValue(options.itinerary, Itinerary.Default)
  }

  /**
   *
   * @example
   * ```
   * map "oneway_line"
   * graphics "map_00_oneway_line.bmp"
   * guide "b-00.bmp"
   * init 50. 50. 23.703
   * rd 1
   * line 1 30 50. 50. 550. 250.
   * wp 1
   * 0 550. 250.
   * tl 0
   * st 0
   * obst 2
   * 30.  30.  1. 10.
   * 200. 200.  8. 30.
   * iti 2
   * go 20.
   * stop
   * end
   * ```
   *
   * @returns map file content
   */
  build () {
    let r = ''

    r += `map "${this.name}"\n`
    r += `graphics "${this.graphics}"\n`
    r += `guide "${this.guide}"\n`

    r += this.init.toString()

    r += `rd ${this.roads.length}\n`
    for (const road of this.roads) r += road.toString()

    r += `wp ${this.ways.length}\n`
    for (const way of this.ways) r += way.toString()

    r += `tl ${this.trafficLights.length}\n`
    for (const trafficLight of this.trafficLights) r += trafficLight.toString()

    r += `st ${this.stops.length}\n`
    for (const stop of this.stops) r += stop.toString()

    r += `obst ${this.obstacles.length}\n`
    for (const obstacle of this.obstacles) r += obstacle.toString()

    r += `iti ${this.itinerary.size()}\n`
    r += this.itinerary.toString()

    r += 'end\n'
    return r
  }

  /**
   *
   * @example
   * ```
   * go 20.
   * stop
   * ```
   *
   * @returns itinerary content
   */
  buildItinerary () {
    return this.itinerary.toString()
  }

  private static computeCoordinate (box: Rectangle, a: Point): Point {
    return new Point(a.x - box.origin.x, box.size.y - (a.y - box.origin.y))
  }

  static from (scene: Scene): MapWriter {
    const options = {} as MapOptions

    /* get boundaries (will not work with infinite scene) */
    const box = scene.getBox()

    /* setup some properties from the scene's name */
    options.name = scene.getName()
    options.graphics = `game-${options.name}.bmp`
    options.guide = `b-${options.name}.bmp`
    options.roads = []
    const actions: Array<Action> = []

    /* fetch item object from the scene */
    const lines = scene.renderables().filter(IsInstanceOf(RoadLineItem)).toArray()
    const arcs = scene.renderables().filter(IsInstanceOf(RoadArcItem)).toArray()
    const obss = scene.renderables().filter(IsInstanceOf(ObstacleItem)).toArray()
    const startpoints = scene.renderables().filter(IsInstanceOf(StartingPointItem)).toArray()
    const steps = scene.renderables().filter(IsInstanceOf(StepItem)).toArray().sort((a, b) => a.getIndex() - b.getIndex())
    const stops = scene.renderables().filter(IsInstanceOf(StopItem)).toArray()

    /* setup vehicle start point in the map */
    if (startpoints.length > 0) {
      options.init = new Init(this.computeCoordinate(box, startpoints[0].getPosition()), startpoints[0].getAngle())
      actions.push(Itinerary.Go.from(startpoints[0].getSpeed()))
    }

    /* setup roads in the map */
    for (const line of lines) {
      options.roads.push(
        new RoadLine(
          line.getDirection(),
          line.getSpeed(),
          this.computeCoordinate(box, line.getStart()),
          this.computeCoordinate(box, line.getEnd())
        )
      )
    }
    for (const arc of arcs) {
      options.roads.push(
        new RoadArc(
          arc.getDirection(),
          arc.getSpeed(),
          this.computeCoordinate(box, arc.getCenter()),
          arc.getRadius(),
          arc.getStartAngle(),
          arc.getEndAngle()
        )
      )
    }

    /* setup obstacles in the map */
    const obstacles = obss.map(obs => new Obstacle(this.computeCoordinate(box, obs.getPosition()), obs.getSince(), obs.getTill()))
    options.obstacles = obstacles

    /* setup custom itinerary + waypoints */
    // todo: add order index to waypoint as property then sort
    if (steps.length > 0) {
      let currentSpeed = startpoints.length > 0 ? startpoints[0].getSpeed() : 20
      for (const step of steps) {
        const action = step.getAction()
        actions.push(action)
        if (action instanceof Itinerary.Go) {
          currentSpeed = action.getValue()
        } else if (action instanceof Itinerary.Turn) {
          actions.push(Itinerary.Go.from(currentSpeed))
        }
      }

      /* setup the waypoints for the corresponding itinerary */
      const waypoints = []
      for (const step of steps) {
        waypoints.push(new WayPoint(this.computeCoordinate(box, step.getPosition()), step.getRoadIndex()))
      }

      options.itinerary = new Itinerary(actions)
      options.ways = waypoints
    }

    /* if no itinerary, add default one by adding stop at the end */
    if (startpoints.length > 0 && steps.length === 0) {
      actions.push(Itinerary.Stop.from())
      options.itinerary = new Itinerary(actions)
    }

    /* setup stops and traffic lights */
    if (stops.length > 0) {
      const stoppoints = []
      const trafficLights = []
      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i]
        trafficLights.push(new TrafficLight(
          this.computeCoordinate(box, stop.getLightPosition()),
          stop.getRoadIndex(),
          stop.getLightDelayR(),
          stop.getLightDelayA(),
          stop.getLightDelayG(),
          stop.getLightPhase()
        ))
        stoppoints.push(new Stop(this.computeCoordinate(box, stop.getPosition()), stop.getRoadIndex(), i))
      }

      options.stops = stoppoints
      options.trafficLights = trafficLights
    }

    return new MapWriter(options)
  }
}

export default MapWriter
