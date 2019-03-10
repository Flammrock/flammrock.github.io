function Building(world,settings) {
  var opts = settings || {};

  this.type = opts.type || Object.keys(TypeBuilding.List)[0];

  this.opts = opts;
  this.optsData = TypeBuilding.List[this.type].opts;

  this.world = world;

  this.zIndex = 0;

  // On utilise notre super classe qui va nous aider à placer la tour aux bonnes coordonnées x et y
  this.position = HelperPlacementSystem.getPositionEmplacement(this.world,opts.x||0,opts.y||0);

  this.sizeEmplacement = TypeBuilding.List[this.type].sizeEmplacement || 1;

  // Permet d'éviter des bugs de superposition
  this.layer = 9999999999;

  // On assombri un peu l'emplacement où se trouve la tour
  var xxx=(opts.x||0);
  var yyy=(opts.y||0);
  if (this.sizeEmplacement>1) {
    for (var i = 0; i < this.sizeEmplacement; i++) {
      for (var j = -Math.ceil(this.sizeEmplacement/2); j < Math.ceil(this.sizeEmplacement/2); j++) {
        this.world.mapPosData[(xxx+i)+','+(yyy+j)].color.r -= 50;
        this.world.mapPosData[(xxx+i)+','+(yyy+j)].color.g -= 50;
        this.world.mapPosData[(xxx+i)+','+(yyy+j)].color.b -= 50;
        this.world.mapPosData[(xxx+i)+','+(yyy+j)].canBuild = false;
      }
    }
  } else {
    this.world.mapPosData[(xxx)+','+(yyy)].color.r -= 50;
    this.world.mapPosData[(xxx)+','+(yyy)].color.g -= 50;
    this.world.mapPosData[(xxx)+','+(yyy)].color.b -= 50;
    this.world.mapPosData[(xxx)+','+(yyy)].canBuild = false;
  }


  // Ceci varie en fonction du type de tour
  this.health_max = TypeBuilding.List[this.type].health_max || 100; // sa vie maximal
  this.health = this.health_max; // sa vie
  this.damage = typeof TypeBuilding.List[this.type].damage === 'undefined' ? 1 : TypeBuilding.List[this.type].damage; // ses dégats
  this.level = TypeBuilding.List[this.type].level || 1; // son niveau
  this.timeToBeBuild = TypeBuilding.List[this.type].timeToBeBuild || 1000 * 3; // le temps avant que la tour soit contruite/opérationnelle (en milliseconde bien sûr)
  this.rangeRadius = TypeBuilding.List[this.type].rangeRadius || 300;
  this.tickAttack = TypeBuilding.List[this.type].tickDamage || 500;
  this.timeAttack = Date.now();

  // Dès qu'on ajoute la tour, on met dans cet variable le temps actuelle où on l'a mis
  this.timeAdded = Date.now();

  this.factor = TypeBuilding.List[this.type].spriteSheetData.factor || 0.6;
  this.factorDefault = TypeBuilding.List[this.type].spriteSheetData.factor || 0.6;
  if (TypeBuilding.List[this.type].spriteSheetData.factor=='auto') {
    this.factor = (this.world.mapPosData[(opts.x||0)+','+(opts.y||0)].width*(this.sizeEmplacement!=1?this.sizeEmplacement*1.2:this.sizeEmplacement)/TypeBuilding.List[this.type].spriteSheetData.width)*1.5;
    this.factorDefault = (this.world.mapPosData[(opts.x||0)+','+(opts.y||0)].width/TypeBuilding.List[this.type].spriteSheetData.width)*1.5;
  }
  // Les données du spriteSheet
  var pos = HelperPlacementSystem.getPositionEmplacement(this.world,opts.x||0,opts.y||0);
  this.rposition = {
    x:pos.x,
    y:pos.y - TypeBuilding.List[this.type].spriteSheetData.height*this.factorDefault/2 + this.world.mapPosData[(opts.x||0)+','+(opts.y||0)].width/2 - this.world.mapPosData[(opts.x||0)+','+(opts.y||0)].height*(this.world.mapPosData[(opts.x||0)+','+(opts.y||0)].layer==0?1:this.world.mapPosData[(opts.x||0)+','+(opts.y||0)].layer) + TypeBuilding.List[this.type].yCorrection*this.factor
  };
  this.spriteSheet = new SpriteSheet(this.world,{
    path: TypeBuilding.List[this.type].spriteSheetData.path,
    data: TypeBuilding.List[this.type].spriteSheetData.data,
    width: TypeBuilding.List[this.type].spriteSheetData.width,
    height: TypeBuilding.List[this.type].spriteSheetData.height,
    sizeEmplacement: this.sizeEmplacement,
    position: {
      x:this.rposition.x,
      y:this.rposition.y,
    },
    xIsoMetric: opts.x||0,
    yIsoMetric: opts.y||0,
    tick: TypeBuilding.List[this.type].spriteSheetData.tick || 125,
    factor: this.factor,
    factorDefault: this.factorDefault
  });

  if (typeof this.optsData.onAdd === 'function') {
    this.optsData.onAdd(this.world);
  }

  // On ajoute notre tour dans le "monde"
  this.world.entity.push(this);
}
Building.prototype.test = function () {
  // On teste juste si la souris survole l'image de la tour,
  // comme cette méthode existe déjà dans la classe SpriteSheet et bin on n'hésite pas à l'utiliser (#gain de temps)
  return this.spriteSheet.test();
}
Building.prototype.getMobInRangeVision = function () {
  var canvas = this.world.canvas, ctx = this.world.ctx;
  var mobsInVision = [];
  var emplacement = this.world.mapPosData[(this.opts.x||0)+','+(this.opts.y||0)];
  var pos = emplacement.getPos();
  var x = pos.x;
  var y = pos.y - emplacement.width + emplacement.width / 4;
  for (var i = 0; i < this.world.entityMob.length; i++) {
    var mob = this.world.entityMob[i];
    ctx.beginPath();
    ctx.ellipse(x, y+this.rangeRadius/3, this.rangeRadius, this.rangeRadius/2, 0, 0, 2*Math.PI, false);
    if (ctx.isPointInPath(canvas.width/2+mob.position.x+this.world.camera.x,canvas.height/2+mob.position.y+this.world.camera.y)) {
      mobsInVision.push(mob);
    }
  }
  if (mobsInVision.length > 0) {
    var dist = Math.dist(this.position.x,this.position.y,mobsInVision[0].position.x,mobsInVision[0].position.y);
    var index = 0;
    for (var i = 0; i < mobsInVision.length; i++) {
      if (Math.dist(this.position.x,this.position.y,mobsInVision[i].position.x,mobsInVision[i].position.y) < dist) {
        dist = Math.dist(this.position.x,this.position.y,mobsInVision[i].position.x,mobsInVision[i].position.y);
        index = i;
      }
    }
    return mobsInVision[index];
  } else {
    return false;
  }
}
Building.prototype.drawHealthBar = function () {
  // A toi de modifier comme tu le sens la barre de vie
  var canvas = this.world.canvas, ctx = this.world.ctx;

  var width = 125; // La longueur de la barre de vie
  var height = 20; // La largeur de la barre de vie

  var x = this.rposition.x-width/2; // position en x de la barre de vie
  var y = this.rposition.y-(this.spriteSheet.height/2)*this.spriteSheet.factor-height-10; // position en y de la barre de vie

  // La bordure noir + fond noir
  this.world.camera.apply();
  ctx.beginPath();
  ctx.roundRect(x-2, y-2, width+4, height+4, 10);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x, y, this.health/this.health_max*width, height, 10);
  ctx.fillStyle = '#0f0';
  ctx.fill();

  // le vert
  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = '18px Verdana';
  ctx.fillStyle = '#000';
  ctx.fillText(this.health + ' / ' + this.health_max,x+width/2,y+height/2);
  ctx.restore();

}
Building.prototype.drawRadiusRange = function () {
  // A toi de modifier comme tu veux
  var canvas = this.world.canvas, ctx = this.world.ctx;

  ctx.save();

  this.world.camera.apply();

  var emplacement = this.world.mapPosData[(this.opts.x||0)+','+(this.opts.y||0)];
  var pos = emplacement.getPos();

  var x = pos.x;
  var y = pos.y - emplacement.width + emplacement.width / 4;


  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.ellipse(x, y+this.rangeRadius/3, this.rangeRadius, this.rangeRadius/2, 0, 0, 2*Math.PI, false);
  //ctx.arc(x,y,this.rangeRadius,0,2*Math.PI,false);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.restore();
}
Building.prototype.draw = function () {
  var canvas = this.world.canvas, ctx = this.world.ctx;
  if (Date.now() - this.timeAdded < this.timeToBeBuild) {
    this.inWorkingBuild();
  } else {
    if (this.spriteSheet.test()) {
      this.drawRadiusRange();
      this.spriteSheet.drawHover(15,{r:0,g:0,b:0});
      this.spriteSheet.draw();
      this.drawHealthBar();
    } else {
      this.spriteSheet.draw();
    }

    if (Date.now() - this.timeAttack > this.tickAttack) {
      var mob = this.getMobInRangeVision();
      if (mob) {
        this.timeAttack = Date.now();
        mob.health -= this.damage;
        if (mob.health <= 0) mob.kill();
      }
    }

  }
}
Building.prototype.inWorkingBuild = function () {
  var ctx = this.world.ctx;
  var emplacement = this.world.mapPosData[(this.opts.x||0)+','+(this.opts.y||0)];
  var pos = emplacement.getPos();

  // tout ceci permet de "dessiner" un échafaudage en isométrique

  var width = emplacement.width*this.sizeEmplacement;
  if (this.sizeEmplacement!=1) pos.y += emplacement.width/2*this.sizeEmplacement/1.5;

  ctx.save();
  this.world.camera.apply();
  ctx.translate(pos.x,pos.y);
  ctx.beginPath();
  var dy = this.spriteSheet.height*this.spriteSheet.factor/4;
  for (var i = 1; i < 4; i++) {
    ctx.moveTo(-width,-dy*i);
    ctx.lineTo(0,-width/2-dy*i);
    ctx.moveTo(0,-width/2-dy*i);
    ctx.lineTo(width,-dy*i);
  }
  ctx.lineWidth = 20;
  ctx.strokeStyle = '#966F33';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0,-width/2);
  ctx.lineTo(0,-width/2-this.spriteSheet.height*this.spriteSheet.factor);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#6D6D6D';
  ctx.stroke();
  ctx.restore();

  this.spriteSheet.draw(false);

  ctx.save();
  this.world.camera.apply();
  ctx.translate(pos.x,pos.y);
  ctx.beginPath();
  var dy = this.spriteSheet.height*this.spriteSheet.factor/4;
  for (var i = 1; i < 4; i++) {
    ctx.moveTo(-width,-dy*i);
    ctx.lineTo(0,width/2-dy*i);
    ctx.moveTo(0,width/2-dy*i);
    ctx.lineTo(width,-dy*i);
  }
  ctx.lineWidth = 20;
  ctx.strokeStyle = '#966F33';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-width,0);
  ctx.lineTo(-width,-this.spriteSheet.height*this.spriteSheet.factor);
  ctx.moveTo(0,width/2);
  ctx.lineTo(0,width/2-this.spriteSheet.height*this.spriteSheet.factor);
  ctx.moveTo(width,0);
  ctx.lineTo(width,-this.spriteSheet.height*this.spriteSheet.factor);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#6D6D6D';
  ctx.stroke();

  ctx.restore();

  // Draw Circle loading
  ctx.save();
  this.world.camera.apply();
  ctx.translate(pos.x,pos.y - this.spriteSheet.height*this.spriteSheet.factor/3);
  ctx.beginPath();
  ctx.arc(0,0,25,0,2*Math.PI,false);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.arc(0,0,22,0,(Date.now() - this.timeAdded)/this.timeToBeBuild*2*Math.PI,false);
  ctx.closePath();
  ctx.fillStyle = '#0f0';
  ctx.fill();
  var time = this.timeToBeBuild - (Date.now() - this.timeAdded);
  var second = Math.floor((time/1000)) % 60;
  var minute = Math.floor((time/1000/60)) % 60;
  var hour = Math.floor((time/1000/60/60));
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = '20px Verdana';
  ctx.fillText(((hour+'').length==1?'0':'')+hour+':'+((minute+'').length==1?'0':'')+minute+':'+((second+'').length==1?'0':'')+second,0,-50);
  ctx.restore();
}
Building.prototype.getAbsolutePosition = function () {
  return this.spriteSheet.getAbsolutePosition();
}
