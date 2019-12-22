

class Point {
  constructor(x,y) {
    this.x = x || 0;
    this.y = y || 0;
  }
}



class BinaryHeap {

  constructor(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  push(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to sink down.
    this.sinkDown(this.content.length - 1);
  }

  pop() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it bubble up.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.bubbleUp(0);
    }
    return result;
  }

  remove(node) {
    var len = this.content.length;
    // To remove a value, we must search through the array to find
    // it.
    for (var i = 0; i < len; i++) {
      if (this.content[i] == node) {
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();
        if (i != len - 1) {
          this.content[i] = end;
          if (this.scoreFunction(end) < this.scoreFunction(node))
            this.sinkDown(i);
          else
            this.bubbleUp(i);
        }
        return;
      }
    }
    throw new Error("Node not found.");
  }

  size() {
    return this.content.length;
  }

  rescoreElement(node) {
  	this.sinkDown(this.content.indexOf(node));
  }

  bubbleUp(n) {
    // Look up the target element and its score.
    var length = this.content.length,
        element = this.content[n],
        elemScore = this.scoreFunction(element);

    while(true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2, child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
            child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore)
          swap = child1N;
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
            child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == null ? elemScore : child1Score))
          swap = child2N;
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap != null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
      // Otherwise, we are done.
      else {
        break;
      }
    }
  }

  sinkDown(n) {
    // Fetch the element that has to be sunk.
    var element = this.content[n];
    // When at 0, an element can not sink any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      var parentN = Math.floor((n + 1) / 2) - 1,
          parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      }
      // Found a parent that is less, no need to sink any further.
      else {
        break;
      }
    }
  }

}



class SeaPort {

  constructor(surface,name,x,y) {
    this.surface = surface;
    this.name = name;
    this.x = Math.round(x) || 0; // longitude
    this.y = Math.round(y) || 0; // latitude
    this.connectedWith = []; // List of Ports Name
    this.connectedPath = {};
  }

  draw(surface,ctx) {
    ctx.beginPath();
    ctx.rect(this.x/360*surface.texture.resolution-10,this.y/180*surface.texture.resolution-20,20,40);
    ctx.fillStyle = '#FF0000';
    ctx.fill();
  }

  sendShipToSeaPort(name,loop) {
    var _this = this;
    if (name == this.name) return;
    var ship = this.surface.addShip(this.x,this.y);
    var path = this.connectedPath[name];
    console.log('added ship:',this.x,this.y,path.points[0].x,path.points[0].y);
    ship.followPath(path,!(this.x==path.points[0].x&&this.y==path.points[0].y));
    ship.onend = function() {
      if (loop) {
        _this.sendShipToSeaPort(name,loop);
      }
      _this.surface.removeShip(this.id);
    }
  }

}



/* Node Element in Graph */
class Node {

  constructor(x,y,sizeX,sizeY,p,index) {
    this.index = index;

    this.x = x; // longitude
    this.y = y; // latitude

    //this.lat = this.y*180/Math.PI;
    //this.lon = this.x*180/Math.PI;

    //console.log(this.lon,this.lat);



    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.p = p;

    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.gsave = 0;

    this.cost = 1;

    this.visited = false;
    this.closed = false;

    this.wall = false;
    if (!p) this.wall = true;

    this.parent = null;
  }

  /**
  * Get Neighbor around this Node
  * @param {Graph} graph
  */
  getNeighbors(graph) {
    /*
    var n = this.lookup(this.lat, this.lon, 5);
    console.log(n);
    return n;*/

    var neighbors = [];

    var tb = [
      /*[-1,-1],*/[ 0,-1]/*,[ 1,-1]*/,
      [-1, 0]        ,[ 1, 0],
      /*[-1, 1],*/[ 0, 1]/*,[ 1, 1],*/
    ];
    var tb = [
      [-1,-1]/*,[ 0,-1]*/,[ 1,-1],
      /*[-1, 0]        ,[ 1, 0],*/
      [-1, 1]/*,[ 0, 1]*/,[ 1, 1],
    ];
    var tb = [
      [-1,-1],[ 0,-1],[ 1,-1],
      [-1, 0]        ,[ 1, 0],
      [-1, 1],[ 0, 1],[ 1, 1],
    ];
    var tb = [
      [-1,-1],[ 0,-1],[ 1,-1],
      [-1, 0]        ,[ 1, 0],
      [-1, 1],[ 0, 1],[ 1, 1],
    ];
    for (var i = 0; i < tb.length; i++) {

      var pos = tb[i];

      var x = this.x + pos[0]*graph.surface.size;
      var y = this.y + pos[1]*graph.surface.size;


      if (x < 0) x += 360;
      if (x > 359) x %= 360;



      if (graph.isIn([x,y])) {
        neighbors.push(graph.get([x,y]));
      }
    }

    return neighbors;
  }

  init(heuristic,start,end) {
    this.g = 0;
    this.h = 0;
    this.f = 0;
    this.gsave = 0;
    this.visited = false;
    this.closed = false;
    this.parent = null;
  }

  draw(r,ctx) {
    var ctx = canvas.getContext('2d');
    var w = r / this.sizeX;
    var h = r / this.sizeY;
    ctx.beginPath()
    ctx.rect(this.x*w,this.y*h,w,h);
    ctx.strokeStyle = 'rgba(0,0,0,0)';
    //ctx.strokeStyle = '#000';
    //ctx.stroke();
    if (this.wall) {
      ctx.fillStyle = '#fff';
      ctx.fill();
    } else if (color) {
      ctx.fillStyle = '#000';
      ctx.fill();
    }
  }

}



class Graph {

  constructor(surface) {

    this.surface = surface;
    this.content = {};
    this.setter = function(){};
    this.getter = function(){};
    this.isInside = function(){};
    this.getClosest = function(){};

  }

  get(array) {
    if (!this.isIn(array)) {
      array = this.getClosest(this,array);
    }
    return this.getter(this,array);
  }

  isIn(array) {
    return this.isInside(this,array);
  }

  init(setter,getter,isIn,getClosest) {
    this.setter = setter;
    this.getter = getter;
    this.isInside = isIn;
    this.getClosest = getClosest;

    this.setter(this);
  }

}



/* A* Algorithme */
class AStar {

  /**
  * @param {Surface} surface
  */
  constructor(surface) {

    this.surface = surface;
    this.graph = this.surface.graph;
    this.heuristic = this.surface.getDist;

    this.pathSolution = [];
    this.solution = null;

  }

  heap() {
    return new BinaryHeap(function(node) {
      return node.f;
    });
  }

  init(graph,start,end) {
    for (var i in graph.content) {
      if (graph.content.hasOwnProperty(i)) {
        graph.content[i].init(this.heuristic,start,end);
      }
    }
  }

  /**
  * resolve
  * @param {Point} Start
  * @param {Point} End
  * @return {Array} Path (Solution)
  */
  resolve(start, end) {

    this.start = this.graph.get([start.x,start.y]);
    this.end = this.graph.get([end.x,end.y]);

    //this.start = this.surface.lookup(start.lat,start.lon,1)[0];
    //this.end = this.surface.lookup(end.lat,end.lon,1)[0];

    console.log(this.start,this.end);

    if (typeof this.solution === 'boolean') return this.pathSolution;
    var graph = this.graph;
    var start = this.start;
    var end = this.end;


    var lastnode = start;

    this.init(graph,start,end);

    start.h = this.heuristic(start, end);

    var openHeap = this.heap();

    openHeap.push(start);

    while(openHeap.size() > 0) {

        // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
        var currentNode = openHeap.pop();

        // End case -- result has been found, return the traced path.
        if(currentNode === end) {
            var curr = currentNode;
            var ret = [];
            while(curr.parent) {
                ret.push(curr);
                curr = curr.parent;
            }
            ret.push(start);
            return ret.reverse();
        }

        // Normal case -- move currentNode from open to closed, process each of its neighbors.
        currentNode.closed = true;

        // Find all neighbors for the current node. Optionally find diagonal neighbors as well (false by default).
        var neighbors = currentNode.getNeighbors(graph);

        for(var i=0, il = neighbors.length; i < il; i++) {
            var neighbor = neighbors[i];

            if(neighbor.closed || neighbor.wall) {
                // Not a valid node to process, skip to next neighbor.
                continue;
            }

            // The g score is the shortest distance from start to current node.
            // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
            //var gScore = this.heuristic(neighbor, start)/*currentNode.g*/ /*+ neighbor.getCost(this.heuristic,currentNode)*/;
            var gScore = Math.max(currentNode.gsave+this.heuristic(neighbor, currentNode),this.heuristic(neighbor, start))/*currentNode.g + this.heuristic(neighbor, currentNode)*//*this.heuristic(neighbor, start)*/;
            var beenVisited = neighbor.visited;



            if(!beenVisited || gScore < neighbor.g) {

                // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                neighbor.visited = true;
                neighbor.parent = currentNode;
                neighbor.h = neighbor.h || this.heuristic(neighbor, end);
                neighbor.g = gScore;
                neighbor.gsave = currentNode.gsave + this.heuristic(neighbor, currentNode);
                neighbor.f = neighbor.g + neighbor.h;

                lastnode = neighbor;

                if (!beenVisited) {
                    // Pushing to heap will put it in proper place based on the 'f' value.
                    openHeap.push(neighbor);
                }
                else {
                    // Already seen the node, but since it has been rescored we need to reorder it in the heap
                    openHeap.rescoreElement(neighbor);
                }
            }



        }
    }

    console.log('No Solution');
    // No result was found - empty array signifies failure to find path.
    return [];


    console.log('No Solution');

  }

}



/* Build Path with AStar */
class Path {

  /**
  * @return {Path}
  */
  constructor(surface, A, B) {
    this.surface = surface;
    this.A = A;
    this.B = B;
    this.points = [];
  }

  /**
  * @param {Point} A
  * @param {Point} B
  * @return {Array}
  */
  getPath() {
    var a_star = new AStar(this.surface);

    /*var p1 = {
      lon: this.A.x * 360 - 180,
      lat: this.A.y * 180,
      x: this.A.x * 2*Math.PI - Math.PI,
      y: this.A.y * Math.PI,
    };
    var p2 = {
      lon: this.B.x * 360 - 180,
      lat: this.B.y * 180,
      x: this.B.x * 2*Math.PI - Math.PI,
      y: this.B.y * Math.PI
    };*/

    var p1 = {
      x: Math.round(this.A.x * 360),
      y: Math.round(this.A.y * 180)
    };
    var p2 = {
      x: Math.round(this.B.x * 360),
      y: Math.round(this.B.y * 180)
    };


    console.log(p1,p2);

    this.points = a_star.resolve(p1,p2);

    this.getDist();

    console.log(this.dist);

    return this;
  }

  getDist() {
    this.dist = 0;
    for (var i = 0; i < this.points.length-1; i++) {
      this.dist += this.surface.getDist(this.points[i],this.points[i+1]);
    }
    return this.dist;
  }

}



/*
Work with BABYLON
Dynamic Texture (OffScreen Canvas)
*/
class Texture {

  constructor(object) {
    var _this = this;
    this.parent = object;
    this.scene = object.scene;
    this.image = new Image();
    this.ready = false;
    this.resolution = 4096;
    this.material = new BABYLON.DynamicTexture('Texture_'+Texture.id, this.resolution, this.scene);
    this.material.specularColor = new BABYLON.Color3(0, 0, 0);
    this.ctx = this.material.getContext();
    this.image.onload = function () {
      _this.ready = true;
      _this.ctx.beginPath();
      _this.ctx.drawImage(_this.image,0,0,_this.image.width,_this.image.height,0,0,_this.resolution,_this.resolution);
      _this.material.update();
      _this.parent.isloaded = true;
    }
    this.image.src = object.imagepath;
    this.src = object.imagepath;
    Texture.id++;
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.resolution,this.resolution);
    this.ctx.beginPath();
    this.ctx.drawImage(this.image,0,0,this.image.width,this.image.height,0,0,this.resolution,this.resolution);
  }

}
Texture.id = 0;


class Ship {

  constructor(id,surface,scene,onload) {

    this.id = id;

    this.surface = surface;
    this.scene = scene;

    this.onload = onload || function () {};

    this.pathFollow = null;
    this.i = 0;
    this.reverse = false;
    this.rotation = 0;

    this.x = 90;
    this.y = 90;

    this.scale = 0.05;
    this.speed = 0.1;

    this.createObject(scene,'Ship.obj');

  }

  updatePosition() {

    if (this.object == null) return;

    var radius = this.surface.diameter / 2 + 2;


    var theta = (Sphere.normalizeLon(this.x)) * Math.PI / 180 - Math.PI/1.9;
    var gamma = (180-Sphere.normalizeLon(this.y)) * Math.PI / 180;

    var radius = this.surface.diameter / 2 + 2;


    this.object.position.x = radius * Math.sin(gamma) * Math.cos(theta) + this.surface.object.position.x;
    this.object.position.y = radius * Math.cos(gamma) + this.surface.object.position.y;
    this.object.position.z = radius * Math.sin(gamma) * Math.sin(theta) + this.surface.object.position.z;


    this.object.lookAt(this.surface.object.position, 0, -Math.PI/2, -Math.PI);

    var rotation = 0;
    if (this.i > 0 && this.i < this.pathFollow.points.length-1) {
      rotation = Math.atan2(this.pathFollow.points[this.i+1].y-this.pathFollow.points[this.i].y,this.pathFollow.points[this.i+1].x-this.pathFollow.points[this.i].x);
    }
    if (this.reverse) {
      rotation += Math.PI;
    }

    if (this.rotation > rotation) this.rotation -= Math.PI/80;
    if (this.rotation < rotation) this.rotation += Math.PI/80;

    this.object.addRotation(0,this.rotation+Math.PI/2,0);



  }

  createObject(scene,src) {
    var _this = this;
    this.object = null;
    BABYLON.SceneLoader.ImportMesh("", "", src, scene, function (newMeshes) {

      try {
        // Set the target of the camera to the first imported mesh
        // camera.target = newMeshes[0];
        newMeshes[0].setEnabled(false);
        _this.object = newMeshes[0];
        _this.object.isPickable = false;
        _this.object.scaling = new BABYLON.Vector3(_this.scale,_this.scale,_this.scale);

        newMeshes[0].setEnabled(true);

        _this.onload(_this.object);

        _this.updatePosition();
      } catch (e) {
        console.error(e);
      }

    });
  }

  followPath(path,reverse) {
    this.reverse = reverse || false;
    this.pathFollow = path;
    if (this.reverse) this.i = this.pathFollow.points.length-1;
  }

  destroy() {
    this.object.dispose();
  }

  update() {

    if (this.pathFollow == null) return;
    if (this.reverse) {
      if (this.i < 0) {
        this.pathFollow = null;
        this.i = 0;
        if (typeof this.onend === 'function') this.onend();
        return;
      }
    } else {
      if (this.i > this.pathFollow.points.length-1) {
        this.pathFollow = null;
        this.i = 0;
        if (typeof this.onend === 'function') this.onend();
        return;
      }
    }

    var angle = Math.atan2(this.pathFollow.points[this.i].y-this.y,this.pathFollow.points[this.i].x-this.x);

    this.x += this.speed*Math.cos(angle);
    this.y += this.speed*Math.sin(angle);

    if (Math.abs(this.x-this.pathFollow.points[this.i].x) < 2 && Math.abs(this.y-this.pathFollow.points[this.i].y) < 2) {
      if (this.reverse) {
        this.i--;
      } else {
        this.i++;
      }
    }

    this.updatePosition();

  }

}


/*
Work with BABYLON
Graph System (Node with spherical coordinates)
*/
class Sphere {

  constructor(app,name,position,image,heightimage) {

    this.app = app;
    this.scene = app.scene;
    this.name = name;
    this.imagepath = image;
    this.imagepathheightmap = heightimage;
    this.diameter = 100;
    this.isloaded = false;
    this.items = app.items;

    // Event
    this.onclick = function() {};
    this.onload = function() {};
    this.ondraw = function() {};

    // Debug Property
    this.isDebug = false;

    this.size = 1;

    // Others data
    this.data = {};

    // path storing
    this.data.path = [];
    this.data.seaPorts = [];
    this.data.ship = {};
    this.data.shiplength = 0;
    this.data.queueshipdestroy = [];

    /*var aaa = {x: 357, y: 77}, bbb = {x: 0, y: 78};
    console.log(this.getDist(aaa,bbb));
    var aaa = {x: 3, y: 77}, bbb = {x: 0, y: 78};
    console.log(this.getDist(aaa,bbb));*/

    // Create BABYLON Sphere
    this.createObject(this.scene,position,name,image,heightimage);

    // Create BABYLON camera
    this.createCamera();

  }

  addSeaPort(name,x,y) {
    this.data.seaPorts[name] = new SeaPort(this,name,x,y);
  }

  getSeaPort(name) {
    return this.data.seaPorts[name];
  }

  removeSeaPort(name) {
    this.data.seaPorts[name] = null;
    delete this.data.seaPorts[name];
  }

  addShip(x,y) {

    var _this = this;

    this.data.ship[this.data.shiplength] = new Ship(this.data.shiplength,this,this.scene,function(object){
      _this.highlight.addExcludedMesh(object);
    });

    this.data.ship[this.data.shiplength].x = x;
    this.data.ship[this.data.shiplength].y = y;

    this.data.shiplength++;

    return this.data.ship[this.data.shiplength-1];
  }

  removeShip(id) {
    this.data.queueshipdestroy.push(id);
  }

  /**
  * @return {BABYLON.Mesh}
  */
  createObject(scene,position,name,image,heightimage) {
    var _this = this;

    this.texture = new Texture(this);
    this.material = new BABYLON.StandardMaterial("Sphere_texture_"+name, scene);
    this.material.diffuseTexture = this.texture.material;
    this.material.specularColor = new BABYLON.Color3(0, 0, 0);

    this.object = BABYLON.MeshBuilder.CreateSphere(name, {diameter: this.diameter}, scene);
    this.object.material = this.material;
    this.object.position = position;
    this.object.rotation.x += Math.PI;
    this.object.rotation.y += Math.PI/1.9;

    this.objectAtmosphere = BABYLON.MeshBuilder.CreateSphere('Sphere'+name+'_Atm', {diameter: this.diameter+5}, scene);
    this.objectAtmosphere.isPickable = false;
    this.objectAtmosphere.position = position;
    this.materialAtmosphere = new BABYLON.StandardMaterial("Sphere_Atm_texture_"+name, scene);
    this.materialAtmosphere.diffuseColor = new BABYLON.Color3(0, 2, 255);
    this.materialAtmosphere.emissiveColor = new BABYLON.Color3(0,2, 255);
    this.materialAtmosphere.specularColor = new BABYLON.Color3(0,0, 0);
    this.materialAtmosphere.alpha = 0.1;


    /*this.glow = new BABYLON.GlowLayer('Sphere'+name+'Glow', scene, {
      mainTextureFixedSize: 1024,
      blurKernelSize: 64
    });
    this.glow.addIncludedOnlyMesh(this.materialAtmosphere);
    this.glow.intensity = 100;*/

    this.highlight = new BABYLON.HighlightLayer("hg", scene);
    this.highlight.innerGlow = false;
    this.highlight.addMesh(this.object, new BABYLON.Color3(0, 2, 255))
    this.highlight.blurHorizontalSize = 5;
    this.highlight.blurVerticalSize = 5;

    this.objectAtmosphere.material = this.materialAtmosphere;

    this.heightmap = this.getHeightMap(heightimage,function(data){

      // Generate Graph Map from heightimage
      //this.map = new Map(this.sizeX,this.sizeY,this.texture,heightimage);
      _this.graph = new Graph(_this);
      _this.graph.onload = function() {
        if (typeof _this.onload === 'function') _this.onload(_this);
      }
      _this.graph.init(function(graph) {
        var index = 0;
        var v = _this.size;
        for (var x = 0; x < 360; x += _this.size) {
          for (var y = 0; y < 180; y += _this.size) {
            //_this.arraytempnode.push(new Node(x,y,_this.size,_this.size,1,index));
            //graph.content[x+';'+y] = _this.arraytempnode[_this.arraytempnode.length-1];
            var pixel = data(x,y);
            var isBlack = pixel[0] < 50 && pixel[1] < 50 && pixel[2] < 50;
            _this.graph.content[x+';'+y] = new Node(x,y,_this.size,_this.size,!isBlack,index);
            index++;
          }
        }
        if (typeof _this.graph.onload === 'function') _this.graph.onload(_this);
      }, function(graph,array) {
        return _this.graph.content[array[0]+';'+array[1]];
      }, function (graph,array) {
        return typeof _this.graph.content[array[0]+';'+array[1]] !== 'undefined';
      }, function(graph,array) {
        for (var i = 0; i < array.length; i++) {
          var test = array[i] + (array[i] % _this.size);
          if (test % _this.size) {
            array[i] -= array[i] % _this.size;
          } else {
            array[i] = test;
          }
        }
        return array;
      });


    });


  }


  createCamera() {
    this.camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, this.object.position, this.scene);
    this.camera.setPosition(new BABYLON.Vector3(this.object.position.x,this.object.position.y,this.object.position.z+this.diameter+50));
    this.camera.attachControl(this.app.canvas, true);
    this.camera.maxZ = 100000;
    this.camera.lowerAlphaLimit = -Infinity;
    this.camera.upperAlphaLimit = Infinity;
    this.camera.lowerBetaLimit = -Infinity;
    this.camera.upperBetaLimit = Infinity;
    this.scene.activeCamera = this.camera;
  }

  getHeightMap(src,then) {

    var _this = this;

    var image = new Image();
    image.ready = false;
    image.onload = function() {
      var __this = this;
      this.ready = true;
      var canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      canvas.getContext('2d').drawImage(this, 0, 0, this.width, this.height);
      var data = canvas.getContext('2d').getImageData(0, 0,this.width, this.height).data;
      then(function(x,y){
        return [
          data[ Math.floor(y/180*__this.height) * (__this.width * 4) + (Math.floor(x/360*__this.width) * 4)      ],
          data[(Math.floor(y/180*__this.height) * (__this.width * 4) + (Math.floor(x/360*__this.width) * 4)) + 1],
          data[(Math.floor(y/180*__this.height) * (__this.width * 4) + (Math.floor(x/360*__this.width) * 4)) + 2]
        ];
      });
    }
    image.src = src+'?'+new Date().getTime();

  }

  /**
  * Simple draw Method
  */
  draw(_fn,b) {
    while (this.data.queueshipdestroy.length) {
      var id = this.data.queueshipdestroy.pop();
      this.data.ship[id].destroy();
      this.data.ship[id] = null;
      delete this.data.ship[id];
    }
    if (typeof _fn === 'boolean') {
      if (_fn) this.texture.redraw();
      this.ondraw(this,this.texture.ctx);
      this.texture.material.update();
    } else {
      if (b) this.texture.redraw();
      _fn(this.texture.ctx);
      this.texture.material.update();
    }


  }

  /**
  * Just view the graphMap
  */
  debugview() {
    var _this = this;
    if (this.isDebug) {
      this.draw(function(ctx){}); // Just redraw
    } else {
      this.draw(function(ctx){
        ctx.clearRect(0, 0, _this.texture.resolution,_this.texture.resolution);
        ctx.beginPath();
        ctx.drawImage(_this.map.canvasGraph,0,0,_this.map.canvasGraph.width,_this.map.canvasGraph.height,0,0,_this.texture.resolution,_this.texture.resolution);
      });
    }
    this.isDebug = !this.isDebug;
  }

  /**
  * Connect all SeaPorts Together
  */
  connectSeaPorts() {
    for (var name in this.data.seaPorts) {
      if (this.data.seaPorts.hasOwnProperty(name)) {

        var currentSeaPort = this.data.seaPorts[name];
        var p1 = {
          x:currentSeaPort.x/360,
          y:currentSeaPort.y/180
        };
        for (var name2 in this.data.seaPorts) {
          if (this.data.seaPorts.hasOwnProperty(name2)) {

            if (name == name2) continue;

            var seaPort = this.data.seaPorts[name2];
            var isAlreadyConnected = false;
            for (var i = 0; i < seaPort.connectedWith.length; i++) {
              var connectedSeaPort = seaPort.connectedWith[i];
              if (connectedSeaPort.name == name) {
                isAlreadyConnected = true;
                break;
              }
            }
            if (isAlreadyConnected) continue;

            var p2 = {
              x:seaPort.x/360,
              y:seaPort.y/180
            };

            // Connect SeaPort Together
            currentSeaPort.connectedWith.push(seaPort);
            seaPort.connectedWith.push(currentSeaPort);

            // Search for best Path
            var searchPath = new Path(this,p1,p2);
            var path = searchPath.getPath();
            this.drawPath(path);

            // Add Path
            currentSeaPort.connectedPath[name2] = path;
            seaPort.connectedPath[name] = path;



          }
        }

      }
    }
  }

  /**
  * Draw Path
  * @param {NodeArray} path
  */
  drawPath(path) {
    var _this = this;
    if (path != null) {
      this.data.path.push(function(ctx,x,y){
        var keys = Object.keys(path.points);

        ctx.save();
        ctx.lineCap = "round";

        var p1 = [];
        var p2 = [];
        var t = true;

        for (var i = 0; i < keys.length; i++) {
          var node = path.points[keys[i]];
          if (i > 0) {
            var node_prev = path.points[keys[i-1]];
            if (Math.abs(node_prev.x - node.x) > 300) t = false;
          }

          if (t) {
            p1.push(node);
          } else {
            p2.push(node);
          }
        }

        var isinpath = false;

        var p = [p1,p2];

        // check if mouse overlap path
        for (var i = 0; i < p.length; i++) {
          if (!p[i].length) continue;

          for (var j = 0; j < p[i].length; j++) {
            var node = p[i][j];
            ctx.beginPath();
            ctx.rect(
              node.x/360*_this.texture.resolution-20,
              node.y/180*_this.texture.resolution-20,
              40,
              40
            );
            if (ctx.isPointInPath(x,y)) {
              isinpath = true;
            }
          }
        }

        for (var i = 0; i < p.length; i++) {
          if (!p[i].length) continue;

          ctx.beginPath();
          ctx.moveTo(p[i][0].x/360*_this.texture.resolution,p[i][0].y/180*_this.texture.resolution);
          for (var j = 0; j < p[i].length; j++) {
            var node = p[i][j];
            ctx.lineTo(
              node.x/360*_this.texture.resolution,
              node.y/180*_this.texture.resolution,
            );
          }
          ctx.lineWidth = 8;
          ctx.strokeStyle = '#FF009A';
          if (isinpath) {
            ctx.lineWidth = 16;
            ctx.strokeStyle = '#00FF00';
          }
          ctx.stroke();
        }


        ctx.restore();

        return isinpath;
      });
    }
  }

  /**
  * Get Distance between two points
  * @param {Point} A
  * @param {Point} B
  * @return {Integer} Distance
  */
  getDist(A, B) {

    var sp_current = {lon:(A.x) * Math.PI / 180,lat:(90-A.y) * Math.PI / 180};
    var sp_end     = {lon:(B.x) * Math.PI / 180,lat:(90-B.y) * Math.PI / 180};

    var dLat = (sp_end.lat - sp_current.lat);
    var dLon = (sp_end.lon - sp_current.lon);

    var lat1 = (sp_current.lat);
    var lat2 = (sp_end.lat);
    var lon1 = (sp_current.lon);
    var lon2 = (sp_end.lon);

    var R = 6371; // Radius of the earth in km
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;

  }

  static normalizeLon(x) {
    return 360-(180-x)%360;
  }

  static normalizeLat(y) {
    return 180-(90+y)%180;
  }

}
