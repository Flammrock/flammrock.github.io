

var PTAH = {};


PTAH.Helper = {};

PTAH.Enum = {};

PTAH.Helper.detectLeftButton = function(evt) {
    evt = evt || window.event;
    if ("buttons" in evt) {
        return evt.buttons == 1;
    }
    var button = evt.which || evt.button;
    return button == 1;
}
PTAH.Helper.positionToID = function(position) {
  if (typeof position !== 'object') {
    throw 'invalid position';
  }
  if (typeof position.x === 'undefined' || typeof position.y === 'undefined' || typeof position.z === 'undefined') {
    throw 'invalid position';
  }
  return position.x+','+position.y+','+position.z;
}
PTAH.Helper.wcToGc = function(position,factor) {
  if (typeof factor !== 'number') factor = 1;
  if (typeof position !== 'object') {
    throw 'invalid position';
  }
  if (typeof position.x === 'undefined' || typeof position.y === 'undefined' || typeof position.z === 'undefined') {
    throw 'invalid position';
  }
  return {
    x:Math.floor(position.x/factor),
    y:0,
    z:Math.floor(position.z/factor)
  }
}
PTAH.Helper.scToWc = function(scene,position) {
  if (typeof position !== 'object') {
    throw 'invalid position';
  }
  if (typeof position.x === 'undefined' || typeof position.y === 'undefined') {
    throw 'invalid position';
  }
  var pickResult = scene.multiPick(position.x, position.y);
  for (var i = 0; i < pickResult.length; i++) {
    if (pickResult[i].hit) {
      if (PTAH.IsGrid(pickResult[i].pickedMesh)) {
        return new BABYLON.Vector3(pickResult[i].pickedPoint.x,pickResult[i].pickedPoint.y,pickResult[i].pickedPoint.z);
      }
    }
  }
  return null;
}
PTAH.Helper.gcToWc = function(position,factor) {
  if (typeof factor !== 'number') factor = 1;
  if (typeof position !== 'object') {
    throw 'invalid position';
  }
  if (typeof position.x === 'undefined' || typeof position.y === 'undefined' || typeof position.z === 'undefined') {
    throw 'invalid position';
  }
  return new BABYLON.Vector3(position.x*factor,position.y*factor,position.z*factor);
}
PTAH.Helper.pToID = function(p) {
  if (typeof p !== 'object') {
    throw 'invalid position';
  }
  var s = [];
  var keys = Object.keys(p);
  for (var i = 0; i < keys.length; i++) {
    if (i == keys.length-1) {
      s += p[keys[i]];
    } else {
      s += p[keys[i]] + ',';
    }
  }
  return s;
}

PTAH.Enum.SelectType = {
  ONCE:   0x00001,
  PATH:   0x00002
};


PTAH.NOT_IMPLEMENTED = 'Not Yet Implemented!';


PTAH.Map = class Map {

  constructor() {
    this.data = {};
  }

  get(position) {
    if (typeof this.data[PTAH.Helper.positionToID(position)] === 'undefined') {
      return null;
    }
  }

  set(position,value) {
    this.data[PTAH.Helper.positionToID(position)] = value;
  }

}

PTAH.Engine = class Engine {

  constructor(canvas, context, params) {

    var _this = this;

    this.canvas = canvas || document.createElement('canvas');
    this.context = context || '3d';

    this.engine = new BABYLON.Engine(this.canvas);

    this.scene = new BABYLON.Scene(this.engine);

    this.map = new PTAH.Map();

    params = typeof params === 'object' ? params : {};
    this.params = {
      displayGrid: true
    };

    for (var i in this.params) {
      if (this.params.hasOwnProperty(i)) {
        if (typeof params[i] !== 'undefined') {
          this.params[i] = params[i];
        }
      }
    }


    this.camera = PTAH.CreateCamera('camera',this);

    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(1, 1, 0),
      this.scene
    );
    var light2 = new BABYLON.PointLight(
      "light2",
      new BABYLON.Vector3(0, 1, -1),
      this.scene
    );

    this.grid = PTAH.CreateGrid("grid",this.scene);
    this.gridFactor = this.grid.mesh.scaling.x*this.grid.material.gridRatio;
    if (!this.params.displayGrid) {
      console.warn('grid disabled');
      this.grid.setEnabled(false);
    }


    this.unselect();

    //var mySphere = BABYLON.MeshBuilder.CreateSphere("mySphere", {diameter: 2, diameterX: 3}, this.scene);

    this.startEvents();

  }

  startEvents() {
    var _this = this;
    this._camerapossave = new BABYLON.Vector3(0,0,0);
    this._leftmousetemp = false;
    this.canvas.addEventListener('pointerdown',function(evt) {
      if (PTAH.Helper.detectLeftButton(evt)) {
        _this._camerapossave = _this.camera.position.clone();
        _this._leftmousetemp = true;
        _this._onLeftDown();
      } else {
        _this._leftmousetemp = false;
      }
    });
    this.canvas.addEventListener('pointerup',function(evt) {
      if (_this._leftmousetemp) {
        _this._leftmousetemp = false;
        _this._onLeftUp();

      }
    });
  }

  runRenderLoop(_fn) {
    var _this = this;

    _fn.bind(this);

    this.engine.runRenderLoop(function () {

      // update grid position just at camera z position
      if (_this.params.displayGrid) {
        if (_this.scene.activeCameras.length > 0) {
          var camera = _this.scene.activeCameras[0];
          _this.grid.mesh.position.set(camera.position.x,_this.grid.mesh.position.y,camera.position.z);
          _this.grid.material.gridOffset = new BABYLON.Vector3(camera.position.x/_this.grid.mesh.scaling.x,_this.grid.material.gridOffset.y,camera.position.z/_this.grid.mesh.scaling.z);
        }
      }

      // update selected object
      if (_this.selectItem3 != null) {
        var v = PTAH.Helper.scToWc(_this.scene,{x:_this.scene.pointerX,y:_this.scene.pointerY});
        if (v != null) {
          var p = PTAH.Helper.gcToWc(PTAH.Helper.wcToGc(v,_this.gridFactor),_this.gridFactor);

          //console.warn(PTAH.Helper.wcToGc(v,engine.gridFactor));
          _this.selectItem3.mesh.position.x = p.x;
          _this.selectItem3.mesh.position.y = p.y;
          _this.selectItem3.mesh.position.z = p.z;

          // enable A*
          if (_this.multiplePlacement) {
            _this.selectItem3.destroy();
            if (
              (_this.multiplePlacement.x != p.x || _this.multiplePlacement.y != p.y || _this.multiplePlacement.z != p.z) &&
              (_this.multiplePlacementLast.x != p.x || _this.multiplePlacementLast.y != p.y || _this.multiplePlacementLast.z != p.z)
            ) {
              var pathSolver = new PTAH.PathSolver(_this.map,_this.multiplePlacement,p,_this.selectItem3.size.x,['y']); // map,start,end,factor,removeDimension
              var path = pathSolver.solve();
              _this.multiplePlacementLast = {x:p.x,y:p.y,z:p.z};

              var p = null;
              while (p = _this.pathItems3.pop()) {p.destroy();}

              for (var i = 0; i < path.length; i++) {

                var tmp = new _this.selectItem3.builder(_this,new BABYLON.Vector3(path[i].x,path[i].y,path[i].z));


                //tmp.createMaterial();
                var scene = tmp.engine.scene;

                tmp.material = new BABYLON.StandardMaterial("myMaterial", scene);

                tmp.material.alpha = 0.8;

                tmp.material.backFaceCulling = false;
                tmp.material.diffuseColor = new BABYLON.Color3(1, 0, 1);


                tmp.createMesh();
                tmp.applyMaterial();

                _this.pathItems3.push(tmp);

              }

            }

          }


        }

      }

      _this.scene.render();
      _fn(_this);
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
      _this.engine.resize();
    });


  }

  select(_class) {
    if (typeof _class !== 'function') throw 'first argument isn\'t a class!';
    if(!(_class.prototype instanceof PTAH.Item3)) {
      throw 'first argument isn\'t child of "PTAH.Item3"!';
    }
    this.selectItem3 = new _class(this,new BABYLON.Vector3(0,0,0));
    this.selectItem3.createMaterial();
    this.selectItem3.createMesh();
    this.selectItem3.applyMaterial();
    this.selectItem3.builder = _class;
  }

  unselect() {
    if (this.isSelect()) this.selectItem3.destroy();
    this.selectItem3 = null;
    this.multiplePlacement = false; // use to create road with A*
    this.multiplePlacementLast = {x:null,y:null,z:null};
    if (typeof this.pathItems3 !== 'undefined') {
      var p = null;
      while (p = this.pathItems3.pop()) {p.destroy();}
    } else {
      this.pathItems3 = [];
    }
  }

  isSelect() {
    return this.selectItem3 != null;
  }

  addConveyor(type,position) {
    var c = null;
    if (typeof PTAH.Conveyor.Type[type] !== 'undefined') {
      c = new PTAH.Conveyor(engine,{x:position.x,y:position.y,z:position.z});
    } else {
      c = new PTAH.Conveyor.Type[type](engine,{x:position.x,y:position.y,z:position.z});
    }
    c.createMaterial();
    c.createMesh();
    c.applyMaterial();

    this.map.set(c.position,c);
  }

  addModule(m) {
    this.map.set(m.position,m);
  }

  disableCameraMovement() {
    this.camera.disableMovement();
  }

  enableCameraMovement() {
    this.camera.enableMovement();
  }

  _enableMultiplePlacement(p) {
    this.multiplePlacement = {x:p.x,y:p.y,z:p.z};
  }

  _onLeftDown() {
    if (this.isSelect()) {

      this.disableCameraMovement();

      var type = this.selectItem3.getSelectType();
      switch (type) {
        case PTAH.Enum.SelectType.PATH:

          var v = PTAH.Helper.scToWc(this.scene,{x:this.scene.pointerX,y:this.scene.pointerY});
          if (v != null) {
            var p = PTAH.Helper.gcToWc(PTAH.Helper.wcToGc(v,this.gridFactor),this.gridFactor);
            this._enableMultiplePlacement(p); // lock start position
          }



          // enable A* Algorithm
          // search path between start position and current mouse position
          // each frame -> rebuild path if not same

          // when new leftdown -> if position valid -> place select item at the start position and unselect

          // take in consideration size of element

          break;
        default:
          // ONCE

          // if position valid -> place select item at the start position and unselect

      }
    }
  }

  _onLeftUp() {
    if (this.camera.inputs.attachedElement == null) {
      this.enableCameraMovement();
    }
    if (this.isSelect()) {

      // TODO: Apply Select

      this.unselect();

    }
  }

}







PTAH.GenerateAllCombinaisons = function(alphabet,length) {
  var v = [];
  var a = [];
  for (var i = 0; i < alphabet.length; i++) {
    a.push(alphabet[i]);
  }
  a.push(null);
  var t = [];
  for (var i = 0; i < length; i++) {
    t.push(a[0]);
  }
  var i = 0;
  var _push = function(t,v) {
    var b = [];
    for (var i = 0; i < t.length; i++) {
      b.push(t[i]);
    }
    v.push(b);
  }
  var _end = function(a,t) {
    if (a.length < 2) return true;
    for (var i = 0; i < t.length; i++) {
      if (t[i] != a[a.length-2]) {
        return false;
      }
    }
    return true;
  }
  var _up = function(a,t) {
    var n = a.indexOf(t[0])+1;
    if (n < a.length) {
      t[0] = a[a.indexOf(t[0])+1];
    } else {
      t[0] = a[0];
    }
    for (var i = 0; i < t.length; i++) {
      if (t[i] == a[a.length-1]) {
        t[i] = a[0];
        if (i+1 < t.length) {
          var n = a.indexOf(t[i+1])+1;
          if (n < a.length) {
            t[i+1] = a[a.indexOf(t[i+1])+1];
          }
        }
      }
    }
  };
  _push(t,v);
  while (!_end(a,t)) {
    _up(a,t);
    _push(t,v);
  }
  return v;
}



PTAH.Node = class Node {
    constructor(value, priority){
        this.value = value;
        this.priority = priority;
    }
}

PTAH.PriorityQueue = class PriorityQueue {

    constructor(cmp){
        this.values = [];
        this.cmp = typeof cmp === 'function' ? cmp : function (a,b) {return a < b ? 1 : a == b ? 0 : -1;};
    }

    //helper method that swaps the values and two indexes of an array
    swap(index1, index2){
        let temp = this.values[index1];
        this.values[index1] = this.values[index2];
        this.values[index2] = temp;
        return this.values;
    }
    //helper methods that bubbles up values from end
    bubbleUp(){
        //get index of inserted element
        let index = this.values.length - 1
        //loop while index is not 0 or element no loger needs to bubble
        while(index > 0){
            //get parent index via formula
            let parentIndex = Math.floor((index - 1)/2);
            //if values is greater than parent, swap the two
            if(this.cmp(this.values[parentIndex].priority,this.values[index].priority) < 0/*this.values[parentIndex].priority > this.values[index].priority*/){
                //swap with helper method
                this.swap(index, parentIndex);
                //change current index to parent index
                index = parentIndex;
            } else{
                break;
            }
        }
        return 0;
    }
    // method that pushes new value onto the end and calls the bubble helper
    push(value){
        this.values.push(value)
        //calculate parent, if parent is greater swap
        //while loop or recurse
        this.bubbleUp();
        return this.values
    }

    bubbleDown(){
        let parentIndex = 0;
        const length = this.values.length;
        const elementPriority = this.values[0].priority;
        //loop breaks if no swaps are needed
        while (true){
            //get indexes of child elements by following formula
            let leftChildIndex = (2 * parentIndex) + 1;
            let rightChildIndex = (2 * parentIndex) + 2;
            let leftChildPriority, rightChildPriority;
            let indexToSwap = null;
            // if left child exists, and is greater than the element, plan to swap with the left child index
            if(leftChildIndex < length){
                leftChildPriority = this.values[leftChildIndex].priority
                if(this.cmp(leftChildPriority,elementPriority) > 0 /*leftChildPriority < elementPriority*/){
                    indexToSwap = leftChildIndex;
                }
            }
            //if right child exists
            if(rightChildIndex < length){
                rightChildPriority = this.values[rightChildIndex].priority;

                if(
                    //if right child is greater than element and there are no plans to swap
                    (this.cmp(rightChildPriority,elementPriority) > 0/*rightChildPriority < elementPriority*/ && indexToSwap === null) ||
                    //OR if right child is greater than left child and there ARE plans to swap
                    (this.cmp(rightChildPriority,leftChildPriority) > 0/*rightChildPriority < leftChildPriority*/ && indexToSwap !== null))
                {
                    //plan to swap with the right child
                    indexToSwap = rightChildIndex;
                }
            }
            //if there are no plans to swap, break out of the loop
            if(indexToSwap === null){
                break;
            }
            //swap with planned element
            this.swap(parentIndex, indexToSwap);
            //starting index is now index that we swapped with
            parentIndex = indexToSwap;
        }
    }

    pop(){
        //swap first and last element
        this.swap(0, this.values.length - 1);
        //pop max value off of values
        let poppedNode = this.values.pop();
        //re-adjust heap if length is greater than 1
        if(this.values.length > 1){
            this.bubbleDown();
        }

        return poppedNode;
    }
}











PTAH.Enum.PathSolver = {
  NOT_SOLVED    : 0x0,
  SOLVED        : 0x1,
  NO_SOLUTION   : 0x2,
  TIME_EXCEEDED : 0x3,
  RUNNING       : 0x4
};
PTAH.PathSolver = class PathSolver {

  constructor(map,start,end,factor,removeDimension) {
    this.map = map;
    this.start = start;
    this.end = end;
    this.removeDimension = removeDimension || [];

    this.dim = 0;
    this.dimkeys = [];

    this.openSet = new PTAH.PriorityQueue();

    this.factor = typeof factor === 'number' ? Math.abs(Math.floor(factor)) : 1;

    this.gScore = {};
    this.fScore = {};

    this.cameFrom = {};

    this.path = [];

    this.status = PTAH.Enum.PathSolver.NOT_SOLVED;

    this._calcDimension();
  }

  _getid(position) {
    var s = '';
    for (var i = 0; i < this.dimkeys.length; i++) {
      s += position[this.dimkeys[i]]+';';
    }
    return s;
  }

  _calcDimension() {
    this.dim = 0;
    this.dimkeys = [];
    if (Object.keys(this.start).length != Object.keys(this.end).length) {
      throw 'start and end point not same dimension!';
    }
    this.dim = Object.keys(this.start).length - this.removeDimension.length;
    for (var i in this.start) {
      if (this.start.hasOwnProperty(i)) {
        if (this.removeDimension.indexOf(i) < 0) {
          this.dimkeys.push(i);
        }
      }
    }
  }

  getStatus() {
    return this.status;
  }

  _isObstacle(position) {
    return false;
    if (this.factor == 1) return typeof this.map[PTAH.Helper.pToID(position)] !== 'undefined';
    var v = PTAH.GenerateAllCombinaisons([0,1,-1],this.factor);
    var r = false;
    for (var i = 1; i < v.length; i++) {
      //this.factor[i]
    }
  }

  solve() {
    var s = this._buildPath()
    if (s) {
      this.status = PTAH.Enum.PathSolver.SOLVED;
      var path = [];
      var n = this.end;
      while (typeof this.cameFrom[this._getid(n)] !== 'undefined') {
        path.push(n);
        n = this.cameFrom[this._getid(n)];
      }
      path.push(n);
      if (s === 2) path.shift();
      return path;
    } else {
      this.status = PTAH.Enum.PathSolver.NO_SOLUTION;
      return [];
    }
  }

  _buildPath() {
    this.status = PTAH.Enum.PathSolver.RUNNING;
    this.openSet.push(new PTAH.Node(this.start,0));

    this._setgScore(new PTAH.Node(this.start),0);
    this._setfScore(new PTAH.Node(this.start),this._euclianDistance(this.start,this.end));

    var current = null;

    var ogggrjojrgijrgijrgij = 0;
    while (ogggrjojrgijrgijrgij < 1000) {
      ogggrjojrgijrgijrgij++;

      current = this.openSet.pop();

      if (current == null) break;

      if (this._getid(current.value) == this._getid(this.end)) {
        return true;
      } else {
        if (this._isEnd(current.value)) {
          this.cameFrom[this._getid(this.end)] = current.value;
          return 2;
        }
      }


      var neighbors = this._getNeighbors(current);
      for (var i = 0; i < neighbors.length; i++) {
        if (this._isObstacle(neighbors[i])) continue;
        var temp_gScore = this._getgScore(current) + this._euclianDistance(current.value,neighbors[i]);
        if (temp_gScore < this._getgScore(new PTAH.Node(neighbors[i]))) {
          this.cameFrom[this._getid(neighbors[i])] = current.value;
          this._setgScore(new PTAH.Node(neighbors[i]),temp_gScore);
          this._setfScore(new PTAH.Node(neighbors[i]),temp_gScore + this._euclianDistance(neighbors[i],this.end));
          var isin = false;
          for (var j = 0; j < this.openSet.values.length; j++) {
            if (this._getid(this.openSet.values[j].value) == this._getid(neighbors[i])) {
              isin = true;
              break;
            }
          }
          if (!isin) {
            this.openSet.push(new PTAH.Node(neighbors[i],this._getfScore(new PTAH.Node(neighbors[i]))));
          }
        }



      }

    }

    this.status = PTAH.Enum.PathSolver.NO_SOLUTION;
    return false;

  }

  _getgScore(node) {
    if (typeof this.gScore[this._getid(node.value)] === 'undefined') return Infinity;
    return this.gScore[this._getid(node.value)];
  }

  _getfScore(node) {
    if (typeof this.fScore[this._getid(node.value)] === 'undefined') return Infinity;
    return this.fScore[this._getid(node.value)];
  }

  _setgScore(node,newgScore) {
    this.gScore[this._getid(node.value)] = newgScore;
  }

  _setfScore(node,newfScore) {
    this.fScore[this._getid(node.value)] = newfScore;
  }

  _isEnd(c) {
    if (this._getid(c) == this._getid(this.end)) {
      return true;
    }

    var v = [];
    for (var i = 1; i < this.factor; i++) {
      v = v.concat(PTAH.GenerateAllCombinaisons([0,-i],this.dim));
    }

    var n = [];
    for (var i = 0; i < v.length; i++) {

      var tmp = {};
      for (var j = 0; j < this.dimkeys.length; j++) {
        tmp[this.dimkeys[j]] = c[this.dimkeys[j]] + v[i][j];
      }
      for (var j = 0; j < this.removeDimension.length; j++) {
        tmp[this.removeDimension[j]] = c[this.removeDimension[j]];
      }

      n.push(tmp);
    }

    for (var i = 0; i < n.length; i++) {
      if (this._getid(n[i]) == this._getid(this.end)) {
        return true;
      }
    }

    return false;
  }

  _getNeighbors(node) {
    var v = PTAH.GenerateAllCombinaisons([0,this.factor,-this.factor],this.dim);

    var n = [];
    for (var i = 1; i < v.length; i++) {

      var tmp = {};
      var diagonal = true;
      for (var j = 0; j < this.dimkeys.length; j++) {
        tmp[this.dimkeys[j]] = node.value[this.dimkeys[j]] + v[i][j];
        if (v[i][j] == 0) diagonal = false;
      }
      if (diagonal) continue;
      for (var j = 0; j < this.removeDimension.length; j++) {
        tmp[this.removeDimension[j]] = node.value[this.removeDimension[j]];
      }

      n.push(tmp);
    }

    return n;
  }

  _euclianDistance(a,b) {
    var s = 0;
    for (var i = 0; i < this.dimkeys.length; i++) {
      var d = this.dimkeys[i];
      s += (a[d] - b[d])*(a[d] - b[d]);
    }
    return Math.sqrt(s);
  }

}



PTAH.IsGrid = function(mesh) {
  return typeof mesh === 'object' ? mesh.isGrid : false;
}

PTAH.CameraInput = class CameraInput {

  constructor(scene,touchEnabled) {
    if (touchEnabled === void 0) { touchEnabled = true; }
    this.touchEnabled = touchEnabled;
    this.buttons = [0, 1, 2];
    this.previousPosition = null;
    this.camerapos = null;
    this.targetemep = null;
    this.rotate = false;
    this.tempcamera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(-10, 10, -10), scene);
    this.tempcamera.setTarget(new BABYLON.Vector3(0,0,0));
    this.tempcamera.inputs.clear();
    this.tempcamera2 = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene);
    this.tempcamera2.inputs.removeByType('ArcRotateCameraMouseWheelInput');
    this.scene = scene;
  }

  getTypeName() {
    return 'PTAHCameraInput';
  }

  getSimpleName() {
    return 'CameraInput';
  }

  attachControl(element, noPreventDefault) {
    var _this = this;
    var engine = this.camera.getEngine();
    if (!this._pointerInput) {
        this.tempcamera2.attachControl(element, noPreventDefault,false,1);
        var pointers = this.tempcamera2.inputs.attached["pointers"];
        if (pointers) {
          pointers.buttons = [2]; // respond to only right button. reserve left button for picking etc
        }
        //this.scene.activeCameras = [this.camera,this.tempcamera2];
        this._pointerInput = function (p, s) {
            var evt = p.event;
            if (p.type === BABYLON.PointerEventTypes.POINTERUP) {
              _this.scene.activeCameras = [_this.camera];
              try {
                evt.srcElement.releasePointerCapture(evt.pointerId);
              } catch (e) {}
              _this.previousPosition = null;
              _this.camerapos = null;
              if (_this.rotate) {
                _this.camera.position.x = _this.tempcamera2.position.x;
                _this.camera.position.y = _this.tempcamera2.position.y;
                _this.camera.position.z = _this.tempcamera2.position.z;
                _this.camera.setTarget(_this.tempcamera2.getTarget());
              }
              _this.rotate = false;
              evt.preventDefault();
              return;
            }
            if (p.type === BABYLON.PointerEventTypes.POINTERDOWN) {
              try {
                  evt.srcElement.setPointerCapture(evt.pointerId);
              } catch (e) {}
              if (evt.button === 0) {
                if (_this.rotate) {
                  _this.camera.position.x = _this.tempcamera2.position.x;
                  _this.camera.position.y = _this.tempcamera2.position.y;
                  _this.camera.position.z = _this.tempcamera2.position.z;
                  _this.camera.setTarget(_this.tempcamera2.getTarget());
                }
                _this.rotate = false;
                var scene = _this.camera.getScene();
                var pickResult = scene.multiPick(scene.pointerX, scene.pointerY);
                for (var i = 0; i < pickResult.length; i++) {
                  if (pickResult[i].hit) {
                    if (PTAH.IsGrid(pickResult[i].pickedMesh)) {
                      _this.tempcamera.position.x = _this.camera.position.x;
                      _this.tempcamera.position.y = _this.camera.position.y;
                      _this.tempcamera.position.z = _this.camera.position.z;
                      var n = _this.camera.getTarget();
                      _this.tempcamera.setTarget(new BABYLON.Vector3(n.x,n.y,n.z));
                      _this.camerapos = new BABYLON.Vector3(_this.camera.position.x,_this.camera.position.y,_this.camera.position.z);
                      _this.previousPosition = new BABYLON.Vector3(pickResult[i].pickedPoint.x,pickResult[i].pickedPoint.y,pickResult[i].pickedPoint.z);
                      break;
                    }
                  }
                }
              } else if (evt.button === 2) {
                var scene = _this.camera.getScene();
                var pickResult = scene.multiPick(engine.getRenderWidth()/2, engine.getRenderHeight()/2);
                for (var i = 0; i < pickResult.length; i++) {
                  if (pickResult[i].hit) {
                    if (PTAH.IsGrid(pickResult[i].pickedMesh)) {
                      _this.rotate = true;
                      _this.tempcamera2.position.x = _this.camera.position.x;
                      _this.tempcamera2.position.y = _this.camera.position.y;
                      _this.tempcamera2.position.z = _this.camera.position.z;
                      _this.targetemep = new BABYLON.Vector3(pickResult[i].pickedPoint.x,pickResult[i].pickedPoint.y,pickResult[i].pickedPoint.z);
                      _this.tempcamera2.setTarget(new BABYLON.Vector3(pickResult[i].pickedPoint.x,pickResult[i].pickedPoint.y,pickResult[i].pickedPoint.z));
                      break;
                    }
                  }
                }




                // move arcrotate camera to universal camera
                // then when move apply arcrotate camera position and target to univerdal camera
              }
              if (!noPreventDefault) {
                evt.preventDefault();
                element.focus();
              }
            } else if (p.type === BABYLON.PointerEventTypes.POINTERMOVE) {
              if (engine.isPointerLock) {
                return;
              }

              if (!_this.rotate) {

                _this.scene.activeCameras = [_this.camera];

                // TRANSLATION
                if (_this.previousPosition != null) {
                  var scene = _this.camera.getScene();
                  var pickResult = scene.multiPick(scene.pointerX, scene.pointerY, null, _this.tempcamera);
                  for (var i = 0; i < pickResult.length; i++) {
                    if (pickResult[i].hit) {
                      if (PTAH.IsGrid(pickResult[i].pickedMesh)) {
                        var p = new BABYLON.Vector3(pickResult[i].pickedPoint.x,pickResult[i].pickedPoint.y,pickResult[i].pickedPoint.z);
                        var d = p.subtract(_this.previousPosition);
                        _this.camera.position.x = _this.camerapos.x - d.x;
                        _this.camera.position.z = _this.camerapos.z - d.z;
                        break;
                      }
                    }
                  }
                }

              } else {

                _this.scene.activeCameras = [_this.tempcamera2];


              }



              if (!noPreventDefault) {
                evt.preventDefault();
              }
            }
        };
    }
    this._observer = this.camera.getScene().onPointerObservable.add(this._pointerInput, BABYLON.PointerEventTypes.POINTERDOWN | BABYLON.PointerEventTypes.POINTERUP | BABYLON.PointerEventTypes.POINTERMOVE);
  }

  detachControl(element) {
    if (this._observer && element) {
      this.camera.getScene().onPointerObservable.remove(this._observer);
      this._observer = null;
      this.previousPosition = null;
      this.camerapos = null;
      this.rotate = false;
    }
  }

  checkInputs() {}

}

PTAH.CreateCamera = function(name,engine) {

  var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(-10, 10, -10), engine.scene);
  camera.setTarget(new BABYLON.Vector3(0,0,0));
  camera.inputs.clear();

  engine.scene.activeCameras = [camera];

  camera.inputs.add(new PTAH.CameraInput(engine.scene));

  camera.attachControl(engine.canvas, false);

  camera.enableMovement = function() {
    camera.attachControl(engine.canvas, false);
    engine.scene.activeCameras = [camera];
  };
  camera.disableMovement = function() {
    camera.detachControl(engine.canvas);
    engine.scene.activeCameras = [camera];
  };

  return camera;

}

PTAH.CreateGrid = function(name,scene) {

  var gridMesh = BABYLON.Mesh.CreateGround(name, 1.0, 0.0, 1, scene);
  gridMesh.scaling.x = 10000;
  gridMesh.scaling.z = gridMesh.scaling.x;
  gridMesh.isPickable = true;
  gridMesh.isGrid = true;

  var gridmaterial = new BABYLON.GridMaterial(name+"Material", scene);
  gridmaterial.majorUnitFrequency = 10;
  gridmaterial.minorUnitVisibility = 0.3;
  gridmaterial.gridRatio = 0.0001;
  gridmaterial.backFaceCulling = false;
  gridmaterial.mainColor = new BABYLON.Color3(1, 1, 1);
  gridmaterial.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
  gridmaterial.opacity = 0.8;
  gridmaterial.zOffset = 1.0;

  gridMesh.material = gridmaterial;

  return {mesh:gridMesh,material:gridmaterial};

}



PTAH.Item3 = class Item3 {

  constructor(engine) {
    this.engine = engine;
    this.mesh = null;
    this.material = null;
  }

  destroy() {throw PTAH.NOT_IMPLEMENTED;}

  createMesh() {throw PTAH.NOT_IMPLEMENTED;}

  createMaterial() {throw PTAH.NOT_IMPLEMENTED;}

  applyMaterial() {throw PTAH.NOT_IMPLEMENTED;}

  getSelectType() {throw PTAH.NOT_IMPLEMENTED;}

}




// path system
PTAH.RegisterConveyor = function(type,_class) {
  PTAH.Conveyor.Type[type] = _class;
}
PTAH.Conveyor = class Conveyor extends PTAH.Item3 {

  constructor(engine,position) {

    super(engine);


    this.position = position;

    this.size = {x:2,y:2};

    // possible next Conveyor
    this.next = [];

    // possible previous Conveyor
    this.previous = [];

    // possible module connection
    this.module = [];

  }

  destroy() {
    this.mesh.dispose();
    this.material.dispose();
  }

  createMesh() {

    var scene = this.engine.scene;

    this.mesh = BABYLON.MeshBuilder.CreatePlane("conveyor", {width: this.size.x*this.engine.gridFactor, height: this.size.y*this.engine.gridFactor}, scene);

    this.mesh.position.x = this.engine.gridFactor * this.position.x;
    this.mesh.position.y = this.engine.gridFactor * this.position.y;
    this.mesh.position.z = this.engine.gridFactor * this.position.z;

    this.mesh.rotation.x = Math.PI/2;

  }

  createMaterial() {

    var scene = this.engine.scene;

    this.material = new BABYLON.StandardMaterial("myMaterial", scene);

    this.material.alpha = 0.8;

    this.material.backFaceCulling = false;
    this.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
    //this.material.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
    //this.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    //this.material.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);
  }

  applyMaterial() {
    if (this.mesh == null || this.material == null) {
      throw 'null mesh or null material';
    }
    this.mesh.material = this.material;
  }

  getSelectType() {
    return PTAH.Enum.SelectType.PATH;
  }

}
PTAH.Conveyor.Type = {};



// objet follow Conveyor
PTAH.Component = class Component {

  constructor() {



  }

}

// block wich have Conveyors inputs and Conveyors outputs
PTAH.Module = class Module {

  constructor() {



  }

}
























/**/
