var obj = {};

var mouse = {rx:0,ry:0,x:0,y:0,isLeftDown:false,isRightDown:false};

class Mouse {

  constructor() {
    this.rx = 0;
    this.ry = 0;
    this.x = 0;
    this.y = 0;
    this.isLeftDown = false;
    this.isRightDown = false;
  }

}

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
class App {

  constructor() {

    this.items = {};
    this.items.planets = {};

    this.loaded = 0;
    this.loadtotal = 0;

    this.mouse = new Mouse();

    this.time = Date.now();
    this.speed = 1000;
    this.percentTime = 1000;

    this.canvas = document.getElementById("renderCanvas");
    this.engine = new BABYLON.Engine(this.canvas, true, { stencil: true });

    this.createScene();

    this.startEvents();

    if (!this.loadtotal) {
      this.endload();
    }


    this.update();

  }

  startEvents() {
    var _this = this;

    // When window is resized
    window.addEventListener("resize", function () {
      _this.engine.resize();
    });

    // Mouse addEventListener
    window.addEventListener("mouseup", function(event){
      if (_this.mouse.rx != event.clientX || _this.mouse.ry != event.clientY) {
        _this.mouse.isLeftDown = false;
      }
      var pickResult = _this.scene.pick(event.clientX, event.clientY);
      if (_this.mouse.isLeftDown && pickResult.hit) {
        for (var name in _this.items.planets) {
          if (_this.items.planets.hasOwnProperty(name)) {
            if (pickResult.pickedMesh.name == name) {
              _this.items.planets[name].onclick({clientX:_this.mouse.x,clientY:_this.mouse.y});
            }
          }
        }
      }
      _this.mouse.isLeftDown = false;
      _this.mouse.isRightDown = false;
      _this.mouse.rx = event.clientX;
      _this.mouse.ry = event.clientY;
    });
    window.addEventListener("mousedown", function(event){
      _this.mouse.isLeftDown = event.which == 1;
      _this.mouse.isRightDown = event.which == 3;
      _this.mouse.rx = event.clientX;
      _this.mouse.ry = event.clientY;
    });
    window.addEventListener("mousemove", function (event) {
      var pickResult = _this.scene.pick(event.clientX, event.clientY);
      if (pickResult.hit) {
        var data = pickResult.getTextureCoordinates();
        _this.mouse.x = (data.x);
        _this.mouse.y = (1-data.y);
        document.getElementById('lon').innerHTML = (180-(_this.mouse.x*360)).toFixed(2)+'°';
        document.getElementById('lat').innerHTML = (90-(_this.mouse.y*180)).toFixed(2)+'°';
      }
    });
  }

  createSpaceField() {
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:100000.0}, this.scene);
    skybox.isPickable = false;
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBoxTexture", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox2", this.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    this.items['SkyBox'] = skybox;
  }

  createStar() {
    var star = BABYLON.MeshBuilder.CreateSphere("Sun", {diameter: 1}, this.scene);
    star.position.x = 99999;
    star.rotation.y = Math.PI;
    var starLight = new BABYLON.PointLight("star", new BABYLON.Vector3(0, 0, 0), this.scene);
    starLight.intensity = 5;
    this.items['StarLight'] = starLight;
    star.setPivotMatrix(BABYLON.Matrix.Translation(star.position.x, -star.position.y, -star.position.z));
    this.items['Star'] = star;
    var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(9999999, 0, 0), this.scene);
    var light2 = new BABYLON.HemisphericLight("HemiLight2", new BABYLON.Vector3(-9999999, 0, 0), this.scene);
    light.intensity = 0.5;
    light2.intensity = 0.5;
    this.items['Light'] = light;
    this.items['Light2'] = light2;
  }

  endload() {
    setTimeout(function () {
      document.getElementById('load').style.opacity = 0;
      setTimeout(function () {
        document.getElementById('load').style.display = 'none';
      }, 1000);
    }, 3000);
  }

  localendload(object) {
    this.loaded++;
    if (this.loaded==this.loadtotal) {
      this.endload();
    }
  }

  createScene() {
    var app = this;

    this.scene = new BABYLON.Scene(this.engine);
    this.scene.preventDefaultOnPointerDown = false;

    /*
    this.createPlanet('Mars','Mars.png', 'mars_heightmap.jpg', new BABYLON.Vector3(-10000,0,0),function(e) {

      if (typeof this.data.select === 'undefined') {
        this.data.select = false;
      }
      if (typeof this.data.points === 'undefined') {
        this.data.points = [];
      }

      if (!this.data.select) {
        this.data.points.push([{x:e.clientX,y:e.clientY}]);
      } else {
        this.data.points[this.data.points.length-1].push({x:e.clientX,y:e.clientY});
        var searchPath = new Path(this,this.data.points[this.data.points.length-1][0],this.data.points[this.data.points.length-1][1]);
        var path = searchPath.getPath();
        //console.log(path);
        this.drawPath(path);
      }

      this.data.select = !this.data.select;
    },function(_this){
      console.log('Mars is Ready!');

      app.localendload(_this);

    },function(_this,ctx){
      ctx.beginPath();
      var x = mouse.x*_this.texture.resolution;
      var y = mouse.y*_this.texture.resolution;
      ctx.rect(x-100,y-200,200,400);
      ctx.fillStyle = 'rgba(0,120,255,0.2)';
      ctx.fill();
      if (x-100 < 0) {
        ctx.beginPath();
        ctx.rect(_this.texture.resolution+x-100,y-200,200,400);
        ctx.fillStyle = 'rgba(0,120,255,0.2)';
        ctx.fill();
      }
      if (x+100 > _this.texture.resolution) {
        ctx.beginPath();
        ctx.rect(x-100-_this.texture.resolution,y-200,200,400);
        ctx.fillStyle = 'rgba(0,120,255,0.2)';
        ctx.fill();
      }
      for (var i = 0; i < _this.data.path.length; i++) {
        _this.data.path[i](ctx,x,y);
      }
      for (var name in _this.data.seaPorts) {
        if (_this.data.seaPorts.hasOwnProperty(name)) {
          _this.data.seaPorts[name].draw(_this,_this.texture.ctx);
        }
      }
      for (var id in _this.data.ship) {
        if (_this.data.ship.hasOwnProperty(id)) {
          _this.data.ship[id].update();
        }
      }
    });
    */
    
    this.createPlanet('Earth','Earth.jpg', 'earth_heightmap.jpg', new BABYLON.Vector3(10000,0,0),function(e) {

      if (typeof this.data.select === 'undefined') {
        this.data.select = false;
      }
      if (typeof this.data.points === 'undefined') {
        this.data.points = [];
      }

      if (!this.data.select) {
        this.data.points.push([{x:e.clientX,y:e.clientY}]);
      } else {
        this.data.points[this.data.points.length-1].push({x:e.clientX,y:e.clientY});
        var searchPath = new Path(this,this.data.points[this.data.points.length-1][0],this.data.points[this.data.points.length-1][1]);
        var path = searchPath.getPath();
        //console.log(path);
        this.drawPath(path);
      }

      this.data.select = !this.data.select;
    },function(_this){
      console.log('Earth is Ready!');

      // Add Some seaPorts
      _this.addSeaPort('Le Havre',Sphere.normalizeLon(0.10809999999997899),Sphere.normalizeLat(50.2));
      _this.addSeaPort('Guangzhou',Sphere.normalizeLon(114.29330000000004),Sphere.normalizeLat(22.107433867999987));

      console.log(0.10809999999997899,50.2);
      console.log(114.29330000000004,22.107433867999987);
      console.log('=========');

      // Connect All Ports with A* pathfinding
      _this.connectSeaPorts();

      for (var i = 0; i < 3; i++) {
        setTimeout(function () {
          var seaport = _this.getSeaPort('Le Havre');
          seaport.sendShipToSeaPort('Guangzhou',true);
        }, i*5000);
      }

      app.localendload(_this);

    },function(_this,ctx){
      ctx.beginPath();
      var x = mouse.x*_this.texture.resolution;
      var y = mouse.y*_this.texture.resolution;
      ctx.rect(x-100,y-200,200,400);
      ctx.fillStyle = 'rgba(0,120,255,0.2)';
      ctx.fill();
      if (x-100 < 0) {
        ctx.beginPath();
        ctx.rect(_this.texture.resolution+x-100,y-200,200,400);
        ctx.fillStyle = 'rgba(0,120,255,0.2)';
        ctx.fill();
      }
      if (x+100 > _this.texture.resolution) {
        ctx.beginPath();
        ctx.rect(x-100-_this.texture.resolution,y-200,200,400);
        ctx.fillStyle = 'rgba(0,120,255,0.2)';
        ctx.fill();
      }
      for (var i = 0; i < _this.data.path.length; i++) {
        _this.data.path[i](ctx,x,y);
      }
      for (var name in _this.data.seaPorts) {
        if (_this.data.seaPorts.hasOwnProperty(name)) {
          _this.data.seaPorts[name].draw(_this,_this.texture.ctx);
        }
      }
      for (var id in _this.data.ship) {
        if (_this.data.ship.hasOwnProperty(id)) {
          _this.data.ship[id].update();
        }
      }
    });



    this.createSpaceField();
    this.createStar();
  }

  updateCamera() {
    var currentCamera = this.scene.activeCamera;
    if (currentCamera.beta > Math.PI) {
      var n_a = currentCamera.beta%(2*Math.PI)/(2*Math.PI);
      if (n_a > 0.5 && currentCamera.angularSensibilityX > 0) {
        currentCamera.angularSensibilityX *= -1;
      } else if (n_a <= 0.5 && currentCamera.angularSensibilityX < 0) {
        currentCamera.angularSensibilityX *= -1;
      }
    }
    if (currentCamera.beta < 0) {
      var n_a = currentCamera.beta%(2*Math.PI)/(2*Math.PI);
      if (n_a < -0.5 && currentCamera.angularSensibilityX > 0) {
        currentCamera.angularSensibilityX *= -1;
      } else if (n_a >= -0.5 && currentCamera.angularSensibilityX < 0) {
        currentCamera.angularSensibilityX *= -1;
      }
    }
  }

  update() {
    var _this = this;
    this.engine.runRenderLoop(function () {
      _this.scene.render();
      _this.updateCamera();
      if (Date.now() - _this.time > _this.speed) {
        _this.time = Date.now();
      }
      if (_this.engine.getFps() < 1000) {



        for (var name in _this.items.planets) {
          if (_this.items.planets.hasOwnProperty(name)) {
            if (_this.items.planets[name].isloaded) {
              _this.items.planets[name].draw(true);
            }
          }
        }





        _this.items.Star.rotation.y += (Math.PI*2 / _this.engine.getFps()) / 1000 / (1 / _this.percentTime * 100);
        _this.items.Star.rotation.y %= Math.PI*2;
        var time = Math.floor(24*3600*_this.items.Star.rotation.y/(Math.PI*2)) + 3600;
        var sec = Math.floor(time % 60);
        var min = Math.floor((time / 60) % 60);
        var hour = Math.floor((time / 60 / 60) % 24);
        document.getElementById('time').innerHTML = ((hour+"").length==1?('0'+hour):hour)+':'+((min+"").length==1?('0'+min):min)+':'+((sec+"").length==1?('0'+sec):sec);
        _this.items.StarLight.position.x = _this.items.Star.getAbsolutePosition().x;
        _this.items.StarLight.position.y = _this.items.Star.getAbsolutePosition().y;
        _this.items.StarLight.position.z = _this.items.Star.getAbsolutePosition().z;
      }

    });
  }

  createPlanet(name,image,image_heightmap,position,onclick,onload,ondraw) {
    this.items.planets[name] = new Sphere(this, name, position, image, image_heightmap);
    this.items.planets[name].onclick = onclick || function(){};
    this.items.planets[name].onload = onload || function(){};
    this.items.planets[name].ondraw = ondraw || function(){};
    this.loadtotal++;
  }

  moveCameraToPlanet(name) {
    if (typeof this.items.planets[name] !== 'undefined') {
      this.scene.activeCamera = this.items.planets[name].camera;
    }
  }

}


window.onload = function () {

  var my_app = new App();


};
