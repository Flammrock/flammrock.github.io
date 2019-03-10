function Octogone(world,settings) {

  // Ceci correspond au constructor, c'est ici que l'on va créer nos objets octogone

  // Permet d'éviter des erreurs si malheuresmeent aucun paramètre n'est mis
  var opts = settings || {};
  // ici le "||" correspond au 'OU LOGIC', si le 1er est faux (c'est-à-dire qu'il n'existe pas, c'est-à-dire qu'il n'a pas été passé)
  // naturellement si le 1er est faux il passe au 2ème or '{}' est la définition de base d'un objet vide en javascript donc ceci est vrai et ne renvoi pas d'erreur

  // position relative, ceci n'est qu'une simple variable, on aurait pu mettre n'importe quoi à la place
  this.position = opts.position || {x:0,y:0};
  this.width = opts.width || 50;
  this.height = opts.height || 10;
  this.space = opts.space || this.width;

  this.zIndex = -1;

  this.world = world;

  this.canBuild = true;
  // la couleur
  this.color = opts.color || {
    r: 186,
    g: 140,
    b: 93
  };

  // la couche où se trouve le "bloc"
  this.layer = opts.layer || 0;

  this.index = this.world.mapId++;
  this.delete = false;

  var tx = this.position.x*this.space*2+(this.position.y%2==0?this.space:0);
  var ty = this.position.y*this.space/2-this.layer*this.height;

  if (tx < this.world.bound.x) this.world.bound.x = tx;
  if (tx > this.world.bound.width) this.world.bound.width = tx;
  if (ty < this.world.bound.y) this.world.bound.y = ty;
  if (ty > this.world.bound.height) this.world.bound.height = ty;

  var width = this.width - 2;

  this.yIsoMetric = (Math.round((this.position.x*this.space*2+(this.position.y%2==0?this.space:0))/width) - Math.round((this.position.y*this.space*2)/width/2) + 1) / 2;
  this.xIsoMetric = ((Math.round((this.position.y*this.space*2)/width/2)) + Math.round((this.position.x*this.space*2+(this.position.y%2==0?this.space:0))/width) + 1) / 2;

  var x = this.xIsoMetric/*Math.ceil((this.position.x*this.space*2+(this.position.y%2==0?this.space:0))/this.space)*/;
  var y = this.yIsoMetric/*Math.ceil((this.position.y*this.space/2-this.layer*this.height)/this.space)-1*/;

  // Permet de rendre impossible la construction pour tout les octogones en-dessous de celui-ci
  for (var i = 0; i < this.layer; i++) {
    if (typeof this.world.mapPosData2[x+','+y+','+i] !== 'undefined') {
      this.world.mapPosData2[x+','+y+','+i].canBuild = false;
    }
  }

  // dès qu'on créer un octogone on l'ajoute à la liste
  this.world.map.push(this);
  this.world.mapPos[x+','+y] = null;
  this.world.mapPosData[x+','+y] = this;
  this.world.mapPosData2[x+','+y+','+this.layer] = this;
}

// Notre première méthode, celle-ci sera appeler uniquement pour dessiner notre octogone sur le canvas
Octogone.prototype.test = function () {
  // ceci peremt juste de fixer un bug de hover
  var canvas = this.world.canvas, ctx = this.world.ctx;
  this.world.camera.apply();
  ctx.translate(
    this.position.x*this.width*2+(this.position.y%2==0?this.width:0),
    this.position.y*this.width/2-this.layer*this.height
  );
  var width = this.width+2;
  ctx.beginPath();
  ctx.moveTo(-width,0);
  ctx.lineTo(0,-width/2);
  ctx.lineTo(width,0);
  ctx.lineTo(0,width/2);
  ctx.closePath();
  var a = ctx.isPointInPath(mouseX,mouseY);
  ctx.setTransform(1,0,0,1,0,0);
  return a;
};
Octogone.prototype.getPos = function () {
  return {
    x:this.position.x*this.space*2+(this.position.y%2==0?this.space:0),
    y:this.position.y*this.space/2-this.layer*this.height
  };
}
Octogone.prototype.draw = function (isHover) {
  // On se place au centre de l'Octogone que l'on doit dessiner pour travailer avec des coordonnées relative
  // et on positionne l'Octogone correctement

  if (this.delete) {
    return !this.destroy();
  }

  var canvas = this.world.canvas, ctx = this.world.ctx;
  this.world.camera.apply();
  ctx.translate(
    this.position.x*this.space*2+(this.position.y%2==0?this.space:0),
    this.position.y*this.space/2-this.layer*this.height
  );

  var width = this.width+2;

  // On dessine la zone à détecter
  ctx.beginPath();

  ctx.moveTo(-width,0);
  ctx.lineTo(0,-width/2);
  ctx.lineTo(width,0);
  ctx.lineTo(0,width/2);

  ctx.closePath();

  ctx.fillStyle = 'rgb('+this.color.r+','+this.color.g+','+this.color.b+')';

  // et c'est à ce moment qu'on teste
  if (isHover && ctx.isPointInPath(mouseX,mouseY)) {
    if (mouseLeftDown) {
      this.onClick();
    } else {
      this.onHover();
    }
  }

  ctx.fill();


  // On dessine la zone un peu sombre sur le coté
  ctx.beginPath();

  ctx.moveTo(0,width/2);
  ctx.lineTo(0,width/2+this.height);
  ctx.lineTo(width,this.height);
  ctx.lineTo(width,0);

  ctx.closePath();

  ctx.fillStyle = 'rgb('+(this.color.r-40)+','+(this.color.g-40)+','+(this.color.b-40)+')';
  ctx.fill();




  // On dessine la zone un peu clair sur l'autre coté
  ctx.beginPath();

  ctx.moveTo(0,width/2);
  ctx.lineTo(0,width/2+this.height);
  ctx.lineTo(-width,this.height);
  ctx.lineTo(-width,0);

  ctx.closePath();

  ctx.fillStyle = 'rgb('+(this.color.r+20)+','+(this.color.g+20)+','+(this.color.b+20)+')';
  ctx.fill();


  if (this.world.DISPLAY_COORDINATE) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.font = '20px Verdana';
    ctx.fillText('x: '+this.xIsoMetric+', y: '+this.yIsoMetric,0,0);
  }


  // on reinitialise toutes les transformations (ce qui inclut le translate);
  ctx.setTransform(1,0,0,1,0,0);
}
// On définit bien sur des méthodes pour le hover et le clique
Octogone.prototype.onHover = function () {
  this.world.ctx.fillStyle = 'rgb('+(this.color.r-40)+','+(this.color.g-40)+','+(this.color.b-40)+')';
  //console.log('HOVER',this);
  // Si le joueur a sélectionné quelque chose, on le dessine ici
  if (this.world.itemSelectImage!=null) {
    if (this.world.itemSelectImage.isLoad) {
      this.world.hoverMouse = {
        x:this.xIsoMetric,
        y:this.yIsoMetric,
        factor:this.world.itemSelectImage.factor=='auto'?(this.world.mapPosData[this.xIsoMetric+','+this.yIsoMetric].width*(this.world.itemSelectImage.sizeEmplacement!=1?this.world.itemSelectImage.sizeEmplacement*1.2:this.world.itemSelectImage.sizeEmplacement)/this.world.itemSelectImage.width)*1.5:this.world.itemSelectImage.factor,
        factorDefault:this.world.itemSelectImage.factor=='auto'?(this.world.mapPosData[this.xIsoMetric+','+this.yIsoMetric].width/this.world.itemSelectImage.width)*1.5:this.world.itemSelectImage.factor,
        canBuild:this.canBuild
      };
      var xxx=this.xIsoMetric;
      var yyy=this.yIsoMetric;
      var canBuild = true;
      if (this.world.itemSelectImage.sizeEmplacement>1) {
        test: {
          for (var i = 0; i < this.world.itemSelectImage.sizeEmplacement; i++) {
            for (var j = -Math.ceil(this.world.itemSelectImage.sizeEmplacement/2); j < Math.ceil(this.world.itemSelectImage.sizeEmplacement/2); j++) {
              if (typeof this.world.mapPosData[(xxx+i)+','+(yyy+j)] === 'undefined') {
                canBuild = false;
                break test;
              }
              if (!this.world.mapPosData[(xxx+i)+','+(yyy+j)].canBuild) canBuild = false;
            }
          }
        }
        this.world.hoverMouse.canBuild = canBuild;
      }
      if (this.world.currentPlayer.moneyAmount < TypeBuilding.List[this.world.itemSelectImage.towerType].cost) {
        this.world.hoverMouse.canBuild = false;
      }
      if (this.world.hoverMouse.canBuild) {
        this.world.ctx.fillStyle = '#0f0';
      } else {
        this.world.ctx.fillStyle = '#f00';
      }
    }
  }
}
Octogone.prototype.onClick = function () {
  this.world.ctx.fillStyle = '#c00';
  //console.log('CLICK',this);
  if (this.world.itemSelectImage!=null) {
    if (this.world.itemSelectImage.isLoad) {
      var canBuild = this.canBuild;
      var xxx=this.xIsoMetric;
      var yyy=this.yIsoMetric;
      if (this.world.itemSelectImage.sizeEmplacement>1) {
        test: {
          for (var i = 0; i < this.world.itemSelectImage.sizeEmplacement; i++) {
            for (var j = -Math.ceil(this.world.itemSelectImage.sizeEmplacement/2); j < Math.ceil(this.world.itemSelectImage.sizeEmplacement/2); j++) {
              if (typeof this.world.mapPosData[(xxx+i)+','+(yyy+j)] === 'undefined') {
                canBuild = false;
                break test;
              }
              if (!this.world.mapPosData[(xxx+i)+','+(yyy+j)].canBuild) canBuild = false;
            }
          }
        }
      }
      if (canBuild && this.world.currentPlayer.moneyAmount >= TypeBuilding.List[this.world.itemSelectImage.towerType].cost) {
        this.world.currentPlayer.moneyAmount -= TypeBuilding.List[this.world.itemSelectImage.towerType].cost;
        this.world.currentPlayer.update();
        new Building(this.world,{
          x:this.xIsoMetric,
          y:this.yIsoMetric,
          factor:this.world.itemSelectImage.factor=='auto'?(this.world.mapPosData[this.xIsoMetric+','+this.yIsoMetric].width*(this.world.itemSelectImage.sizeEmplacement!=1?this.world.itemSelectImage.sizeEmplacement*1.2:this.world.itemSelectImage.sizeEmplacement)/this.world.itemSelectImage.width)*1.5:this.world.itemSelectImage.factor,
          factorDefault:this.world.itemSelectImage.factor=='auto'?(this.world.mapPosData[this.xIsoMetric+','+this.yIsoMetric].width/this.world.itemSelectImage.width)*1.5:this.world.itemSelectImage.factor,
          type:this.world.itemSelectImage.towerType
        });
        this.world.itemSelectImage = null;
      }
    }
  }
}

// on détruit l'objet ici
Octogone.prototype.destroy = function () {
  var x = this.xIsoMetric/*Math.ceil((this.position.x*this.space*2+(this.position.y%2==0?this.space:0))/this.space)*/;
  var y = this.yIsoMetric/*Math.ceil((this.position.y*this.space/2-this.layer*this.height)/this.space)-1*/;
  for (var i = 0; i < this.world.map.length; i++) {
    if (this.world.map[i] instanceof Octogone) {
      if (this.world.map[i].index == this.index) {
        this.world.map[i] = null;
        delete this.world.map[i];
        break;
      }
    }
  }
  this.world.mapPosData2[x+','+y+','+this.layer] = null;
  delete this.world.mapPosData2[x+','+y+','+this.layer];
  return true;
}

// Create Square Surface
Octogone.createSquare = function (size,onappend) {
  var x2 = 0;
  var y2 = 0;
  var x3 = 0;
  while (x3 < size) {
    var x1 = 0;
    var y1 = 0;
    while (y1 < size){
      onappend(x1-Math.ceil(size/2)+x2,y1-y2);
      if ((y1-y2)%2==0) {
        x1++;
      }
      y1++;
    }
    if ((y1-y2)%2==0) {
      x2++;
    }
    x3++;
    y2++;
  }
}
