function World() {
  this.camera = new Camera(0,0,this);
  this.currentPlayer = null;
  this.entity = [];
  this.entityMob = [];
  this.map = [];
  this.mapPos = {};
  this.mapPosData = {};
  this.mapPosData2 = {};
  this.mapId = 0;
  this.bound = {
    x:0,
    y:0,
    width:0,
    height:0
  };
  this.itemSelectImage = null;
  this.DISPLAY_COORDINATE = false;
  this.helperPlacementSystem = new HelperPlacementSystem(this);
  this.canvas = document.createElement('canvas');
  this.canvas.style.cssText = 'background:#000';
  this.enableHover=true;
  var _this = this;
  var el = document.getElementsByClassName('bg');
  for (var i = 0; i < el.length; i++) {
    el[i].onmouseenter = function() {
      _this.enableHover=false;
    };
    el[i].onmouseleave = function() {
      _this.enableHover=true;
    };
  }
  this.ctx = this.canvas.getContext('2d');
  document.body.appendChild(this.canvas);
}
World.prototype.draw = function () {
  var canvas = this.canvas, ctx = this.ctx;
  var map = this.map;
  // Resize le canvas et l'efface
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  this.hoverMouse = null;

  if (mouseRightDown) {
    mouseRightDown = false;
    this.itemSelectImage = null;
  }

  // On itère sur tout les Octogone qu'on a créé (bien sûr sans règle)
  var zmap = map.concat(this.entity);
  zmap = zmap.sort(function(a,b){

    if (a.zIndex > b.zIndex) {
      return 1;
    } else if (a.zIndex < b.zIndex) {
      return -1;
    }

    if (!(a instanceof Way) && !(b instanceof Way)) {

      if (a.position.y-b.position.y==0){
        if (!(a instanceof Octogone) && !(b instanceof Octogone)) {
          return a.getAbsolutePosition().y - b.getAbsolutePosition().y;
        } else {
          return a.layer-b.layer;
        }
      } else if (!(a instanceof Octogone) && !(b instanceof Octogone)) {
        return a.getAbsolutePosition().y - b.getAbsolutePosition().y;
      }
      if (a.layer-b.layer==0) {
        return a.position.y-b.position.y;
      } else {
        return a.layer-b.layer;
      }
    } else {
      return 1;
    }
  });
  var hover = false;
  zmap = zmap.filter(function (el) {
    return el != null;
  });
  if (this.enableHover) {
    for (var i = 0; i < zmap.length; i++) {
      if (typeof zmap[i] !== 'undefined') {
        if (zmap[i] instanceof Octogone) {
          if (!hover) {
            hover = zmap[i].test()?zmap[i]:hover;
          } else if (zmap[i].layer>=hover.layer) {
            hover = zmap[i].test()?zmap[i]:hover;
          }
        } else {
          hover = zmap[i].test()?null:hover;
        }
      }
    }
  }
  for (var i = 0; i < zmap.length; i++) {
    // et on appelle la méthode draw que l'on a créé précédement,
    // la méthode aurait bien pu s'appelait chroucroute sa n'aurait rien changer
    if (zmap[i] instanceof SpriteSheet) {
      zmap[i].draw();
    } else {
      zmap[i].draw(hover==false||hover==null?false:hover.index==zmap[i].index?true:false);
    }
  }

  if (this.hoverMouse!=null) {
    var pos = HelperPlacementSystem.getPositionEmplacement(this,this.hoverMouse.x,this.hoverMouse.y);
    this.rposition = {
      x:pos.x - this.itemSelectImage.width*this.hoverMouse.factor/2,
      y:pos.y - this.itemSelectImage.height*this.hoverMouse.factor/2 - this.itemSelectImage.height*this.hoverMouse.factorDefault/2 + this.mapPosData[this.hoverMouse.x+','+this.hoverMouse.y].width/2 - this.mapPosData[this.hoverMouse.x+','+this.hoverMouse.y].height*(this.mapPosData[this.hoverMouse.x+','+this.hoverMouse.y].layer==0?1:this.mapPosData[this.hoverMouse.x+','+this.hoverMouse.y].layer) + TypeBuilding.List[this.itemSelectImage.towerType].yCorrection*this.hoverMouse.factor
    };
    this.camera.apply();
    ctx.save();
    if (this.hoverMouse.canBuild) {
      ctx.globalAlpha = 0.6;
      ctx.drawImage(
        this.itemSelectImage,
        this.rposition.x,
        this.rposition.y,
        this.itemSelectImage.width*this.hoverMouse.factor,
        this.itemSelectImage.height*this.hoverMouse.factor
      );
    } else {
      var canvas2 = document.createElement('canvas');
      var ctx2 = canvas2.getContext('2d');
      canvas2.width = this.itemSelectImage.width*this.hoverMouse.factor;
      canvas2.height = this.itemSelectImage.height*this.hoverMouse.factor;
      ctx2.drawImage(
        this.itemSelectImage,
        0,
        0,
        this.itemSelectImage.width*this.hoverMouse.factor,
        this.itemSelectImage.height*this.hoverMouse.factor
      );
      ctx2.globalAlpha = 0.6;
      ctx2.globalCompositeOperation = 'source-in';
      ctx2.rect(0,0,canvas2.width,canvas2.height);
      ctx2.fillStyle = '#f00';
      ctx2.fill();
      ctx2.globalAlpha = 1.0;
      ctx.globalAlpha = 0.6;
      ctx.drawImage(
        this.itemSelectImage,
        this.rposition.x,
        this.rposition.y,
        this.itemSelectImage.width*this.hoverMouse.factor,
        this.itemSelectImage.height*this.hoverMouse.factor
      );
      ctx.globalAlpha = 1.0;
      ctx.drawImage(
        canvas2,
        this.rposition.x,
        this.rposition.y,
        this.itemSelectImage.width*this.hoverMouse.factor,
        this.itemSelectImage.height*this.hoverMouse.factor
      );
    }
    ctx.restore();
  }

  // là on appelle la méthode que l'on a créé précédemment
  this.camera.update();
}
