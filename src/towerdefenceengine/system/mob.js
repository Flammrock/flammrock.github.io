function Mob(world, settings) {
  var opts = settings || {};

  this.opts = opts;

  var spriteSheetData = IsoMetricMobGenerator.List[opts.type||Object.keys(IsoMetricMobGenerator.List)[0]];

  this.world = world;

  this.zIndex = 0;

  this.data = opts.data || {};

  // On utilise notre super classe qui va nous aider à placer la tour aux bonnes coordonnées x et y
  this.emplacement = this.world.mapPosData[(opts.x||0)+','+(opts.y||0)];
  var pos = HelperPlacementSystem.getPositionEmplacement(world,(opts.x||0),(opts.y||0));
  this.position = {x:pos.x,y:pos.y-spriteSheetData.spriteSheet.height/2};

  // Permet d'éviter des bugs de superposition
  this.layer = 9999999999;

  this.sizeEmplacement = 1;

  this.xCorrection = spriteSheetData.xCorrection;
  this.yCorrection = spriteSheetData.yCorrection;

  this.isMoving = false;
  this.level = opts.level || 1;
  this.speed = spriteSheetData.speed || 5;
  this.health_max = spriteSheetData.health || 10;
  this.health = this.health_max;
  this.isAlive = true;

  this.spriteSheet = new SpriteSheet(this.world,{
    path: spriteSheetData.baseSpriteSheet,
    animation: {
      key: 'dup',
      dup: [20,21,23,24,25,18,19],
      dleft: [2,3,4,5,6,7,0,1],
      ddown: [45,46,47,48,49,50,51,52],
      dright: [63,64,65,66,67,68,69,70],
      up: [9,10,11,12,13,14,15,16],
      left: [36,37,38,39,40,41,42,43],
      down: [54,55,56,57,58,59,60,61],
      right: [27,28,29,30,31,32,33,34]
    },
    width: spriteSheetData.spriteSheet.width+0,
    height: spriteSheetData.spriteSheet.height+0,
    position: this.position,
    tick: spriteSheetData.spriteSheet.tick+0,
    factor: spriteSheetData.spriteSheet.factor+0
  });

  // Utiliser par la méthode move (permet au mob de "mémoriser" l'endroit où il doit aller)
  this.target = null;

  // id
  this.id = this.world.entityMob.length+'_'+Date.now().toString(16);

  // on calcule toutes les caractéristiques de notre mob en fonction du level
  this.calcFromLevel();

  // On ajoute notre mob dans le "monde"
  this.world.entity.push(this);
  this.world.entityMob.push(this);
}
Mob.prototype.test = function () {
  // On teste juste si la souris survole l'image du mob,
  // comme cette méthode existe déjà dans la classe SpriteSheet et bin on n'hésite pas à l'utiliser (#gain de temps)
  return this.spriteSheet.test();
}
Mob.prototype.drawHealthBar = function () {
  // A toi de modifier comme tu le sens la barre de vie
  var canvas = this.world.canvas, ctx = this.world.ctx;

  var width = 125; // La longueur de la barre de vie
  var height = 20; // La largeur de la barre de vie

  var x = this.position.x-width/2-this.xCorrection; // position en x de la barre de vie
  var y = this.position.y-(this.spriteSheet.height/2)*this.spriteSheet.factor-height-10-this.yCorrection; // position en y de la barre de vie

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
Mob.prototype.draw = function () {
  if (this.target != null) {
    var isMoving = false;
    this.spriteSheet.animation.key = null;
    if (this.position.x + this.speed + 5 < this.target.x) {
      this.position.x += this.speed;
      this.spriteSheet.animation.key = 'right';
      isMoving = true;
    } else if (this.position.x - this.speed - 5 > this.target.x) {
      this.position.x -= this.speed;
      this.spriteSheet.animation.key = 'left';
      isMoving = true;
    }
    if (this.position.y + this.speed/2 + 5/2 < this.target.y) {
      this.position.y += this.speed/2;
      if (this.spriteSheet.animation.key == null) {
        this.spriteSheet.animation.key = 'down';
      } else {
        this.spriteSheet.animation.key = this.spriteSheet.animation.key=='left'?'ddown':'dright';
      }
      isMoving = true;
    } else if (this.position.y - this.speed/2 - 5/2 > this.target.y) {
      this.position.y -= this.speed/2;
      if (this.spriteSheet.animation.key == null) {
        this.spriteSheet.animation.key = 'up';
      } else {
        this.spriteSheet.animation.key = this.spriteSheet.animation.key=='right'?'dup':'dleft';
      }
      isMoving = true;
    }
    if (this.spriteSheet.animation.key==null) this.spriteSheet.animation.key = 'dup';
    if (!isMoving) {
      this.target = null;
    }
    this.isMoving = isMoving;
    this.spriteSheet.position = this.position;
  }
  if (this.spriteSheet.test()) {
    this.spriteSheet.drawHover(15,{r:0,g:0,b:0},this.xCorrection,this.yCorrection);
    this.spriteSheet.draw(this.isMoving,this.xCorrection,this.yCorrection);
    this.drawHealthBar();
  } else {
    this.spriteSheet.draw(this.isMoving,this.xCorrection,this.yCorrection);
    this.drawHealthBar();
  }
}
Mob.prototype.move = function (x,y) {
  this.target = {x:x,y:y};
}
Mob.prototype.kill = function () {
  this.isAlive = false;
  new Coin(world, {value:getRandomIntInclusive(1,4),position:{x:this.position.x+getRandomIntInclusive(-40,10),y:this.position.y+this.spriteSheet.height*this.spriteSheet.factor/2+getRandomIntInclusive(-40,10)}});
  for (var i = 0; i < this.world.entityMob.length; i++) {
    if (this.world.entityMob[i].id == this.id) {
      this.world.entityMob.splice(i,1);
      break;
    }
  }
  for (var i = 0; i < this.world.entity.length; i++) {
    if (this.world.entity[i] instanceof Mob) {
      if (this.world.entity[i].id == this.id) {
        this.world.entity[i] = null;
        this.world.entity.splice(i,1);
        break;
      }
    }
  }

}
Mob.prototype.calcFromLevel = function () {
  this.health = Math.round(5 * Math.pow(1.5,this.level-1));
  this.health_max = Math.round(5 * Math.pow(1.5,this.level-1));
}
Mob.prototype.getAbsolutePosition = function () {
  return this.spriteSheet.getAbsolutePosition();
}
