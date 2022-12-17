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

/* eslint-disable @typescript-eslint/no-empty-function */

import $ from 'jquery'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import fileDialog from 'file-dialog'

import './editor.css'
import '../../lib/w2ui/dist/w2ui.css'
import '../../lib/jdmenubar/dist/jdmenubar.css'

import Line from '../core/line'
import Point from '../core/point'
import Rectangle from '../core/rectangle'
import Collection from '../core/collection'
import { ObjectMapper } from '../core/object-mapper'
import Canvas from '../drawing/canvas'
import Sprite from '../drawing/sprite'
import Color from '../drawing/color'
import Layer from '../drawing/layer'
import RenderState from '../drawing/render-state'
import Scene from '../drawing/scene'
import LogicalLines from '../engine/logical-lines'
import Obstacle from '../engine/obstacle'
import Road from '../engine/road'
import RoadFilter from '../engine/filter-road'
import StartingPoint from '../engine/starting-point'
import Step from '../engine/step'
import Stop from '../engine/stop'
import MapWriter from '../engine/map'
import Form from '../gui/form'
import Layout from '../gui/layout'
import Menu from '../gui/menubar'
import Popup from '../gui/popup'
import Tool from '../gui/tool'
import Toolbar from '../gui/toolbar'
import View from '../gui/view'
import ViewItem from '../gui/view-item'
import { IsInstanceOf, MouseButton } from '../helper/utils'
import deserializers from './deserializers'
import { Icons } from '../icons/icons'
import { RenderableType } from '../drawing/renderable'
import MultiColor from '../drawing/multi-color'
import RoadLine from '../engine/road-line'
import RoadArc from '../engine/road-arc'

// todo: refactor (some part are too repetitive and very very bad)

export class Editor {
  private container: JQuery
  private menu = new Menu()
  private toolbar = new Toolbar()
  private layout: Layout
  private canvas = new Canvas()
  private view = new View()
  private logicalLines = new LogicalLines(MouseButton.Left)
  private roadsCollection = new Collection<Road>()
  private stepsCollection = new Collection<Step>()
  private stopsCollection = new Collection<Stop>()
  private roadFilter = new RoadFilter()
  private scene = new Scene(Rectangle.from(-300, -150, 600, 300))

  private tools = {
    roadline: new Tool({ icon: Icons.RoadLine }),
    roadarc: new Tool({ icon: Icons.RoadArc }),
    step: new Tool({ icon: Icons.Flag }),
    pan: new Tool({ icon: Icons.UpDownLeftRight }),
    grab: new Tool({ icon: Icons.Hand }),
    starting: new Tool({ icon: Icons.CarSide }),
    obstacle: new Tool({ icon: Icons.Kamek }),
    stop: new Tool({ icon: Icons.TrafficLight })
  }

  private layers = {
    lines: new Layer({ name: 'line', zIndex: 3 }),
    steps: new Layer({ name: 'step', zIndex: 4 }),
    stops: new Layer({ name: 'stop', zIndex: 5 }),
    images: new Layer({ name: 'image', zIndex: 2 }),
    board: new Layer({ name: 'board', zIndex: 1, background: '#ffffff' }),
    starting: new Layer({ name: 'starting', zIndex: 7, type: RenderableType.Draft }),
    obstacles: new Layer({ name: 'obstacle', zIndex: 6, type: RenderableType.Draft })
  }

  private newform: Form

  constructor (container: JQuery) {
    this.container = container
    this.layout = new Layout(this.container)
    this.newform = new Form({
      style: 'border: 0px; background-color: transparent; color: white;',
      fields: [
        { field: 'name', type: 'text', required: true, html: { label: 'name' } },
        { field: 'width', type: 'int', required: true, html: { label: 'width' } },
        { field: 'height', type: 'int', required: true, html: { label: 'height' } },
        { field: 'guide', type: 'checkbox', required: true, html: { label: 'guide' } }
      ],
      record: {
        name: 'my dummy map',
        width: 600,
        height: 300,
        guide: true
      }
    })
  }

  init () {
    this.initLayers()
    this.initTools()
    this.initListeningTools()
    this.initMenu()
    this.initLayout()
    this.canvas.setScene(this.scene)
    this.canvas.register(this.logicalLines)
  }

  initLayers () {
    this.scene.layers.clear()
    this.layers.lines = new Layer({ name: 'line', zIndex: 3 })
    this.layers.lines.filters.add(this.roadFilter)
    this.layers.steps = new Layer({ name: 'step', zIndex: 4 })
    this.layers.images = new Layer({ name: 'image', zIndex: 2 })
    this.layers.board = new Layer({ name: 'board', zIndex: 1, background: '#ffffff' })
    this.layers.starting = new Layer({ name: 'starting', zIndex: 7, type: RenderableType.Draft })
    this.layers.obstacles = new Layer({ name: 'obstacle', zIndex: 6, type: RenderableType.Draft })
    this.layers.stops = new Layer({ name: 'stop', zIndex: 5 })
    this.scene.layers.add(this.layers.lines)
    this.scene.layers.add(this.layers.steps)
    this.scene.layers.add(this.layers.images)
    this.scene.layers.add(this.layers.board)
    this.scene.layers.add(this.layers.starting)
    this.scene.layers.add(this.layers.obstacles)
    this.scene.layers.add(this.layers.stops)
  }

  initTools () {
    this.toolbar
      .register(this.tools.roadline)
      .register(this.tools.roadarc)
      .register(this.tools.step)
      /* .register(this.tools.pan) */
      .register(this.tools.grab)
      .register(this.tools.starting)
      .register(this.tools.obstacle)
      .register(this.tools.stop)
  }

  private c: (data: Line) => void = () => {}
  private h: (state: RenderState) => void = () => {}
  private carc: (data: Line) => void = () => {}
  private harc: (state: RenderState) => void = () => {}
  private cstep: (data: Line) => void = () => {}
  private hstep: (state: RenderState) => void = () => {}
  private ctrafficlight: (data: Line) => void = () => {}
  private htrafficlight: (state: RenderState) => void = () => {}
  private toolroadlineselect: () => void = () => {}
  private toolroadlineunselect: () => void = () => {}
  private toolroadarcselect: () => void = () => {}
  private toolroadarcunselect: () => void = () => {}
  private toolstepselect: () => void = () => {}
  private toolstepunselect: () => void = () => {}
  private toolgrabselect: () => void = () => {}
  private toolgrabunselect: () => void = () => {}
  private monster: Obstacle = Obstacle.from(Point.Zero)
  private cc6: (state: RenderState) => void = () => {}
  private ccc6: (mouse: Point, mouseButton: MouseButton) => void = () => {}
  private startingPoint: StartingPoint = StartingPoint.from(Point.Zero)
  private cc: (state: RenderState) => void = () => {}
  private ccc: (mouse: Point, mouseButton: MouseButton) => void = () => {}
  private toolstartingselect: () => void = () => {}
  private toolstartingunselect: () => void = () => {}
  private toolobstacleselect: () => void = () => {}
  private toolobstacleunselect: () => void = () => {}
  private tooltrafficlightselect: () => void = () => {}
  private tooltrafficlightunselect: () => void = () => {}

  private setToolListeners () {
    this.c = (data: Line) => {
      const item = RoadLine.from(data)
      item.setColor(Color.Red)
      this.roadsCollection.add(item)
      item.on('select', () => {
        item.setColor(MultiColor.Default)
        this.tools.grab.select()
      })
      item.on('unselect', () => {
        item.setColor(Color.Red)
      })
      this.layers.lines.addRenderable(item)
      this.view.add(new ViewItem(`RoadLine n°${item.getID()}`, item))
    }

    this.h = this.logicalLines.renderCurrentLine(Color.Red)

    this.carc = (data: Line) => {
      const item = RoadArc.from(data)
      item.setColor(Color.Red)
      this.roadsCollection.add(item)
      item.on('select', () => {
        item.setColor(MultiColor.Default)
        this.tools.grab.select()
      })
      item.on('unselect', () => {
        item.setColor(Color.Red)
      })
      this.layers.lines.addRenderable(item)
      this.view.add(new ViewItem(`RoadLine n°${item.getID()}`, item))
    }

    this.harc = this.logicalLines.renderCurrentArc(Color.Red)

    this.cstep = (data: Line) => {
      const item = Step.from(data).setColor(Color.Green)
      this.stepsCollection.add(item)
      item.on('select', () => {
        item.setColor(MultiColor.Default)
        this.tools.grab.select()
      })
      item.on('unselect', () => {
        item.setColor(Color.Green)
      })
      this.layers.steps.addRenderable(item)
      this.view.add(new ViewItem(`Step n°${item.getID()}`, item))
    }

    this.hstep = this.logicalLines.renderCurrentLine(Color.Green)

    this.ctrafficlight = (data: Line) => {
      const item = Stop.from(data).setColor(Color.Blue)
      this.stopsCollection.add(item)
      item.on('select', () => {
        item.setColor(MultiColor.Default)
        this.tools.grab.select()
      })
      item.on('unselect', () => {
        item.setColor(Color.Blue)
      })
      this.layers.stops.addRenderable(item)
      this.view.add(new ViewItem(`Traffic Light n°${item.getID()}`, item))
    }

    this.htrafficlight = this.logicalLines.renderCurrentLine(Color.Blue)

    this.toolroadlineselect = () => {
      this.canvas.on('render', this.h)
      this.logicalLines.on('newline', this.c)
    }

    this.toolroadlineunselect = () => {
      this.canvas.off('render', this.h)
      this.logicalLines.off('newline', this.c)
    }

    this.toolroadarcselect = () => {
      this.canvas.on('render', this.harc)
      this.logicalLines.on('newline', this.carc)
    }

    this.toolroadarcunselect = () => {
      this.canvas.off('render', this.harc)
      this.logicalLines.off('newline', this.carc)
    }

    this.toolstepselect = () => {
      this.canvas.on('render', this.hstep)
      this.logicalLines.on('newline', this.cstep)
    }

    this.toolstepunselect = () => {
      this.canvas.off('render', this.hstep)
      this.logicalLines.off('newline', this.cstep)
    }

    this.tooltrafficlightselect = () => {
      this.canvas.on('render', this.htrafficlight)
      this.logicalLines.on('newline', this.ctrafficlight)
    }

    this.tooltrafficlightunselect = () => {
      this.canvas.off('render', this.htrafficlight)
      this.logicalLines.off('newline', this.ctrafficlight)
    }

    this.toolgrabselect = () => {
      this.scene.enableGrab()
    }

    this.toolgrabunselect = () => {
      this.scene.disableGrab()
    }

    this.monster = Obstacle.from(Point.Zero)
    this.cc6 = (state: RenderState) => {
      this.monster.setPosition(state.screenToWorld(state.mouse))
      this.monster.render(state)
    }

    this.ccc6 = (mouse: Point, mouseButton: MouseButton) => {
      if (mouseButton === MouseButton.Left) {
        this.canvas.off('render', this.cc6)
        this.canvas.off('dragstart', this.ccc6)
        this.tools.pan.select()
        this.monster.setPosition(mouse)
        this.layers.obstacles.addRenderable(this.monster)
        this.view.add(new ViewItem(`Obstacle n°${this.monster.getID()}`, this.monster))
      }
    }

    this.startingPoint = StartingPoint.from(Point.Zero)
    this.cc = (state: RenderState) => {
      this.startingPoint.setPosition(state.screenToWorld(state.mouse))
      this.startingPoint.render(state)
    }

    this.ccc = (mouse: Point, mouseButton: MouseButton) => {
      if (mouseButton === MouseButton.Left) {
        this.canvas.off('render', this.cc)
        this.canvas.off('dragstart', this.ccc)
        this.tools.pan.select()
        this.startingPoint.setPosition(mouse)
        this.layers.starting.addRenderable(this.startingPoint)
        this.view.add(new ViewItem('Starting Point', this.startingPoint))
      }
    }

    this.toolstartingselect = () => {
      if (this.layers.starting.renderables().length > 0) {
        Popup.open({
          title: 'Warning',
          body: 'Only one starting point per map. You can delete the previously added starting point or simply move it using the object grabber tool',
          speed: 0.1,
          style: 'display:flex;align-items:center;',
          actions: {
            Ok: () => {
              Popup.close()
            }
          }
        })
      } else {
        this.startingPoint = StartingPoint.from(Point.Zero)
        this.canvas.on('render', this.cc)
        this.canvas.on('dragstart', this.ccc)
      }
    }

    this.toolstartingunselect = () => {
      this.canvas.off('render', this.cc)
      this.canvas.off('dragstart', this.ccc)
    }

    this.toolobstacleselect = () => {
      this.monster = Obstacle.from(Point.Zero)
      this.canvas.on('render', this.cc6)
      this.canvas.on('dragstart', this.ccc6)
    }

    this.toolobstacleunselect = () => {
      this.canvas.off('render', this.cc6)
      this.canvas.off('dragstart', this.ccc6)
    }
  }

  stopListeningTools () {
    this.toolroadlineunselect()
    this.toolroadarcunselect()
    this.toolstepunselect()
    this.toolgrabunselect()
    this.toolstartingunselect()
    this.toolobstacleunselect()
    this.tooltrafficlightunselect()

    this.tools.roadline.off('select', this.toolroadlineselect)
    this.tools.roadline.off('unselect', this.toolroadlineunselect)

    this.tools.roadarc.off('select', this.toolroadarcselect)
    this.tools.roadarc.off('unselect', this.toolroadarcunselect)

    this.tools.step.off('select', this.toolstepselect)
    this.tools.step.off('unselect', this.toolstepunselect)

    this.tools.grab.off('select', this.toolgrabselect)
    this.tools.grab.off('unselect', this.toolgrabunselect)

    this.tools.starting.off('select', this.toolstartingselect)
    this.tools.starting.off('unselect', this.toolstartingunselect)

    this.tools.obstacle.off('select', this.toolobstacleselect)
    this.tools.obstacle.off('unselect', this.toolobstacleunselect)

    this.tools.stop.off('select', this.tooltrafficlightselect)
    this.tools.stop.off('unselect', this.tooltrafficlightunselect)
  }

  initListeningTools () {
    this.stopListeningTools()
    this.setToolListeners()

    this.tools.roadline.on('select', this.toolroadlineselect)
    this.tools.roadline.on('unselect', this.toolroadlineunselect)

    this.tools.roadarc.on('select', this.toolroadarcselect)
    this.tools.roadarc.on('unselect', this.toolroadarcunselect)

    this.tools.step.on('select', this.toolstepselect)
    this.tools.step.on('unselect', this.toolstepunselect)

    this.tools.grab.on('select', this.toolgrabselect)
    this.tools.grab.on('unselect', this.toolgrabunselect)

    this.tools.starting.on('select', this.toolstartingselect)
    this.tools.starting.on('unselect', this.toolstartingunselect)

    this.tools.obstacle.on('select', this.toolobstacleselect)
    this.tools.obstacle.on('unselect', this.toolobstacleunselect)

    this.tools.stop.on('select', this.tooltrafficlightselect)
    this.tools.stop.on('unselect', this.tooltrafficlightunselect)

    this.tools.roadline.select()
  }

  loadScene (scene: Scene) {
    // this.stopListeningTools()
    this.scene.destroy()
    this.canvas.reset()
    this.view.reset()
    this.roadsCollection.clear()
    this.stepsCollection.clear()
    this.stopsCollection.clear()
    this.scene = scene
    const layers = this.scene.layers.toArray()
    const layersmap: {[key: string]: Layer} = {}
    for (const layer of layers) {
      layersmap[layer.name] = layer
    }
    this.layers.lines = layersmap.line
    this.layers.steps = layersmap.step
    this.layers.board = layersmap.board
    this.layers.images = layersmap.image
    this.layers.starting = layersmap.starting
    this.layers.obstacles = layersmap.obstacle
    this.layers.stops = layersmap.stop
    this.canvas.setScene(this.scene)
    const roadlines = this.scene.renderables().filter(IsInstanceOf(RoadLine)).toArray()
    const roadarcs = this.scene.renderables().filter(IsInstanceOf(RoadArc)).toArray()
    const steps = this.scene.renderables().filter(IsInstanceOf(Step)).toArray()
    const sprites = this.scene.renderables().filter(IsInstanceOf(Sprite)).toArray()
    const startings = this.scene.renderables().filter(IsInstanceOf(StartingPoint)).toArray()
    const obstacles = this.scene.renderables().filter(IsInstanceOf(Obstacle)).toArray()
    const stops = this.scene.renderables().filter(IsInstanceOf(Stop)).toArray()
    for (const road of roadlines) {
      this.roadsCollection.add(road)
      road.on('select', () => {
        road.setColor(MultiColor.Default)
        this.tools.grab.select()
      })
      road.on('unselect', () => {
        road.setColor(Color.Red)
      })
      this.view.add(new ViewItem(`RoadLine n°${road.getID()}`, road))
    }
    for (const road of roadarcs) {
      this.roadsCollection.add(road)
      road.on('select', () => {
        road.setColor(MultiColor.Default)
        this.tools.grab.select()
      })
      road.on('unselect', () => {
        road.setColor(Color.Red)
      })
      this.view.add(new ViewItem(`RoadArc n°${road.getID()}`, road))
    }
    for (const step of steps) {
      this.stepsCollection.add(step)
      step.on('select', () => {
        step.setColor(MultiColor.Default)
        this.tools.grab.select()
      })
      step.on('unselect', () => {
        step.setColor(Color.Green)
      })
      this.view.add(new ViewItem(`Step n°${step.getID()}`, step))
    }
    for (const stop of stops) {
      this.stopsCollection.add(stop)
      stop.on('select', () => {
        stop.setColor(MultiColor.Default)
        this.tools.grab.select()
      })
      stop.on('unselect', () => {
        stop.setColor(Color.Blue)
      })
      this.view.add(new ViewItem(`Traffic Light n°${stop.getID()}`, stop))
    }
    for (const sprite of sprites) {
      this.view.add(new ViewItem(`Sprite n°${sprite.getID()}`, sprite))
    }
    for (const starting of startings) {
      this.view.add(new ViewItem('Starting Point', starting))
    }
    for (const obstacle of obstacles) {
      this.view.add(new ViewItem(`Obstacle n°${obstacle.getID()}`, obstacle))
    }
    // this.initListeningTools()
  }

  initMenu () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    const menu = this.menu
    const file = menu.add({ text: 'File' })
    file.add({ text: 'New map', shortcut: 'Ctrl+N', icon: '✏' }).on('trigger', () => {
      that.newform.reset()
      that.newform.refresh()
      Popup.open({
        title: 'New',
        body: that.newform.element()[0],
        speed: 0.1,
        style: 'display:flex;align-items:center;',
        actions: {
          New: () => {
            that.canvas.reset()
            that.scene.layers.forEach(layer => layer.renderables().clear())
            that.scene.resize(that.newform.get('width') as unknown as number, that.newform.get('height') as unknown as number)
            that.scene.setName(that.newform.get('name') as unknown as string)
            that.view.reset()
            that.roadsCollection.clear()
            Popup.close()
          },
          Cancel: () => {
            Popup.close()
          }
        }
      })
    })
    file.add({ text: 'Open map...' }).on('trigger', () => {
      fileDialog({ accept: 'application/json' }).then(files => {
        if (files.length > 0) {
          const reader = new FileReader()
          reader.onload = function (e) {
            if (e.target == null) throw new Error('unable to load json')
            that.loadScene(ObjectMapper.parse<Scene>(e.target.result as string, deserializers))
          }
          reader.readAsText(files[0])
        }
      })
    })
    file.add({ text: 'Save map' }).on('trigger', () => {
      const scenedata = ObjectMapper.stringify(that.scene)
      saveAs(new Blob([scenedata], {
        type: 'text/plain'
      }), `${that.scene.getName()}.json`)
    })
    file.add({ separator: true })
    file.add({ text: 'Export map' }).on('trigger', () => {
      console.log('start exporting..')
      const archive = new JSZip()
      const map = MapWriter.from(that.scene)
      const guide = that.newform.get('guide') as unknown as boolean
      let graphicsImage
      let guideImage
      if (guide) {
        graphicsImage = that.scene.toBMP(['board', 'image'])
        guideImage = that.scene.toBMP(that.scene.layers.filter((layer): layer is Layer => layer.name !== 'image').map(layer => layer.name).toArray())
      } else {
        graphicsImage = that.scene.toBMP()
        guideImage = graphicsImage
      }
      archive.file(`${map.getName()}.map`, map.build())
      archive.file(map.getItiName(), map.buildItinerary())
      archive.file(map.getGuideName(), guideImage)
      archive.file(map.getGraphicsName(), graphicsImage)
      archive.generateAsync({ type: 'blob' })
        .then(function (blob) {
          saveAs(blob, `${map.getName()}.zip`)
        })
    })
    file.add({ separator: true })
    file.add({ text: 'Exit' }).on('trigger', () => {
      if (confirm('Close Editor?')) {
        close()
      }
    })
    const map = menu.add({ text: 'Map' })
    map.add({ text: 'Import image..', shortcut: 'Ctrl+I' }).on('trigger', () => {
      fileDialog({ accept: 'image/*' })
        .then(files => {
          for (let i = 0; i < files.length; i++) {
            Sprite.from(files[i]).then(sprite => {
              that.layers.images.addRenderable(sprite)
              that.view.add(new ViewItem(`Image n°${sprite.getID()}`, sprite))
              console.log('image added!')
            }).catch(() => {
            // todo: show tooltip
            })
          }
        })
    })
    map.add({ text: 'Settings..' }).on('trigger', () => {
      that.newform.reset()
      that.newform.refresh()
      that.newform.set('name', that.scene.getName())
      that.newform.set('width', that.scene.getBox().size.x)
      that.newform.set('height', that.scene.getBox().size.y)
      Popup.open({
        title: 'Map Settings',
        body: that.newform.element()[0],
        speed: 0.1,
        style: 'display:flex;align-items:center;',
        actions: {
          Update: () => {
            that.scene.resize(that.newform.get('width') as unknown as number, that.newform.get('height') as unknown as number)
            that.scene.setName(that.newform.get('name') as unknown as string)
            Popup.close()
          },
          Cancel: () => {
            Popup.close()
          }
        }
      })
    })
    const help = menu.add({ text: 'Help' })
    help.add({ text: 'About' }).on('trigger', () => {
      Popup.open({
        title: 'About',
        body: '<div style="width:100%"><center>Created&nbsp;by&nbsp;<span style="color: red;"><strong>Lemmy Briot</strong>&nbsp;(Flammrock)</span>&nbsp;<i>(&copy;&nbsp;2022&nbsp;-&nbsp;License&nbsp;MIT)</i></center></div>',
        speed: 0.1,
        width: 400,
        height: 150,
        style: 'display:flex;align-items:center;',
        actions: {
          Ok: () => {
            Popup.close()
          }
        }
      })
    })
    menu.build()
  }

  initLayout () {
    this.layout.setMain({
      style: Layout.Style,
      content: this.canvas.element()
    })
    /* layout.assignTabs({
      name: 'tabs',
      active: 'tab1',
      tabs: [
        { id: 'tab1', text: 'Tab 1', closable: true },
        { id: 'tab2', text: 'Tab 2', closable: true },
        { id: 'tab3', text: 'Tab 3', closable: true },
        { id: 'tab4', text: 'Tab 4', closable: true }
      ]
    }) */
    /* let ind = 10
    new w2tabs({
        box: '#tabs',
        name: 'tabs',
        reorder: true,
        tabs: [
            { id: 'tab1', text: 'TOOLTIP', tooltip: 'This tab has a tooltip' },
            { id: 'tab2', text: 'Tab 2', closable: true },
            { id: 'tab3', text: 'Tab 3', closable: true },
            { id: 'tab4', text: 'FIXED' },
            { id: 'tab6', text: 'Tab 5' },
            { id: 'tab7', text: 'Tab 6' },
            { id: 'add', text: '+' },
        ],
        onClick(event) {
            event.done(() => {
                if (event.target == 'add') {
                    let id = 'tab' + ind
                    this.insert('add', { id: id, text: 'Tab ' + ind, closable: true })
                    this.click(id)
                    ind++
                }
            })
        },
        onReorder(event) {
            if (event.target == 'add') {
                event.preventDefault()
                return
            }
            if (event.target == 'tab4') {
                query("#log2").html('<span style="color: red">This tab cannot be dragged</span>')
                event.preventDefault()
                return
            }
            this.hide('add')
            let tab = this.get(event.target)
            query("#log2").html(`Dragging "${tab.text}"`)
            event.done(() => {
                query("#log2").html(`Moved "${tab.text}" from position "${event.indexFrom}" to "${event.indexTo}".`)
                this.show('add')
            })
            console.log(event)
        }
    }) */
    /* window.popup1 = function() {
        w2popup.open({
            title: 'Popup Title',
            text: 'This is text inside the popup'
        })
    }

    window.popup2 = function() {
        w2popup.open({
            title: 'Popup Title',
            text: 'This is text inside the popup',
            actions: ['Ok', 'Cancel'],
            width: 500,
            height: 300,
            modal: true,
            showClose: true,
            showMax: true,
            onMax(evt) {
                console.log('max', evt)
            },
            onMin(evt) {
                console.log('min', evt)
            },
            onKeydown(evt) {
                console.log('keydown', evt)
            }
        })
        .then((evt) => {
            console.log('popup ready')
        })
        .close(evt => {
            console.log('popup clsoed')
        })
        .ok((evt) => {
            console.log('ok', evt)
            w2popup.close()
        })
        .cancel((evt) => {
            console.log('cancel', evt)
            w2popup.close()
        })
    } */
    this.layout.setTop({
      size: 40,
      resizable: false,
      overflow: 'visible',
      content: this.menu.element(),
      flex: true,
      style: Layout.Style + 'border-bottom: 1px solid var(--theme-secondary-bg-color);',
      zIndex: 1000
    })
    this.layout.setLeft({
      size: 40,
      resizable: false,
      style: Layout.Style + 'border-right: 1px solid var(--theme-secondary-bg-color);',
      content: this.toolbar.element(),
      overflow: 'visible',
      flex: true,
      zIndex: 900
    })
    this.layout.setRight({
      size: 300,
      resizable: true,
      style: Layout.Style,
      content: this.view.layout()
    })
  }

  static launch () {
    $(function () {
      const editor = new Editor($('<main />').appendTo('body'))
      editor.init()
    })
  }
}

export default Editor
