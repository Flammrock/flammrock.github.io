function Way(world, settings) {
  var opts = settings || {};
  this.world = world;
  this.way = [];
  this.mob = [];

  this.position = {x:0,y:99999999};
  this.layer = 9999999999;

  this.zIndex = 0;

  this.indexnb = 0;
  this.time = Date.now();
  this.type = null;

  this.WaveNbMob = 5; // nombre de mob par défaut
  this.WaveMobLvl = 1; // Ne sert à rien pour l'instant
  this.WaveTimeBeetweenWave = 5000; // temps entre chaque vague
  this.WaveNb = 1; // numéro de vague
  this.waveISstart = false; // juste un boolean

  this.tick = 1000;
  this.nextWave = null;

  // On ajoute notre chemin dans le "monde"
  this.world.entity.push(this);
}
Way.prototype.test = function () {
  return false;
}
Way.prototype.draw = function () {
  var _this = this;
  if (Date.now() - this.time > this.tick && this.indexnb > 0) {
    this.indexnb--;
    this.time = Date.now();
    this.mob.push(new Mob(world,{x:this.way[0].x,y:this.way[0].y,level:this.WaveMobLvl,type:this.type,data:{indexWay:1}}));
  }
  var a = false;
  for (var i = 0; i < this.mob.length; i++) {
    if (this.mob[i].isAlive) a = true;
  }
  if (this.mob.length > 0 && !a && typeof this.nextWave === 'function' && !this.waveISstart) {
    this.waveISstart = true;
    this.nextWave();
  }
  if (this.mob.length > 0 && !a && this.WaveInfinite && !this.waveISstart) {
    this.waveISstart = true;
    this.onInfiniteWave();
  }
  if (!a) this.waveISstart = false;
  this.mobFollowWay();
}
Way.prototype.mobFollowWay = function () {
  for (var i = 0; i < this.mob.length; i++) {
    if (this.mob[i].target==null) {
      var pos = HelperPlacementSystem.getPositionEmplacement(world,this.way[this.mob[i].data.indexWay].x,this.way[this.mob[i].data.indexWay].y);
      this.mob[i].move(pos.x,pos.y-this.mob[i].spriteSheet.height/2);
      if (this.mob[i].data.indexWay+1 < this.way.length) this.mob[i].data.indexWay++;
    }
  }
}
Way.prototype.addPoint = function (x,y,z,c) {
  if (typeof c === 'undefined') c = {r:255,g:255,b:255};
  this.way.push({x:x,y:y,z:z,c:c});
  var i = z+1;
  var xx = this.world.mapPosData[x+','+y].position.x;
  var yy = this.world.mapPosData[x+','+y].position.y;
  while (typeof this.world.mapPosData2[x+','+y+','+i] !== 'undefined') {
    this.world.mapPosData2[x+','+y+','+i].delete = true;
    i++;
  }
  if (typeof this.world.mapPosData2[x+','+y+','+z] === 'undefined') {
    new Octogone(this.world,{
      position: {x:xx,y:yy},
      width: 100,
      color: c || {
        r: 255,
        g: 255,
        b: 255
      },
      layer: z
    });
  }
  this.world.mapPosData[x+','+y] = this.world.mapPosData2[x+','+y+','+z];
  this.world.mapPosData[x+','+y].color.r = c.r;
  this.world.mapPosData[x+','+y].color.g = c.g;
  this.world.mapPosData[x+','+y].color.b = c.b;
  this.world.mapPosData[x+','+y].canBuild = false;
}
Way.prototype.link = function () {
  var p1 = this.way[0];
  var p2 = this.way[1];
  for (var i = 0; i < this.way.length-1; i++) {
    this.linkData = {x:this.way[i].x,y:this.way[i].y,z:this.way[i].z,c:i==0?this.way[i+1].c:this.way[i].c};
    while (this.link2Point(this.way[i],this.way[i+1],i)) {}
  }
  return true;
}
Way.prototype.link2Point = function (p1,p2,i) {
  var end = false;
  if (this.linkData.x < p2.x) {
    this.linkData.x++;
    end = true;
  } else if (this.linkData.x > p2.x) {
    this.linkData.x--;
    end = true;
  } else if (this.linkData.y < p2.y) {
    this.linkData.y++;
    end = true;
  } else if (this.linkData.y > p2.y) {
    this.linkData.y--;
    end = true;
  }
  if (end) {
    var i = this.linkData.z+1;
    var xx = this.world.mapPosData[this.linkData.x+','+this.linkData.y].position.x;
    var yy = this.world.mapPosData[this.linkData.x+','+this.linkData.y].position.y;
    while (typeof this.world.mapPosData2[this.linkData.x+','+this.linkData.y+','+i] !== 'undefined') {
      this.world.mapPosData2[this.linkData.x+','+this.linkData.y+','+i].delete = true;
      i++;
    }
    if (typeof this.world.mapPosData2[this.linkData.x+','+this.linkData.y+','+this.linkData.z] === 'undefined') {
      new Octogone(this.world,{
        position: {x:xx,y:yy},
        width: 100,
        color: this.linkData.c || {
          r: 255,
          g: 255,
          b: 255
        },
        layer: this.linkData.z
      });
    }
    this.world.mapPosData[this.linkData.x+','+this.linkData.y] = this.world.mapPosData2[this.linkData.x+','+this.linkData.y+','+this.linkData.z];
    this.world.mapPosData[this.linkData.x+','+this.linkData.y].color.r = this.linkData.c.r;
    this.world.mapPosData[this.linkData.x+','+this.linkData.y].color.g = this.linkData.c.g;
    this.world.mapPosData[this.linkData.x+','+this.linkData.y].color.b = this.linkData.c.b;
    this.world.mapPosData[this.linkData.x+','+this.linkData.y].canBuild = false;
  }
  return end;
}
Way.prototype.spawn = function (nb, type, tick, nextWave) {
  this.time = Date.now();
  this.indexnb = nb;
  this.type = type;
  this.tick = tick;
  if (typeof nextWave === 'function') {
    this.nextWave = nextWave || null;
  } else if (typeof nextWave === 'boolean') {
    if (nextWave) this.WaveInfinite = nextWave;
  }
}
Way.prototype.infiniteWave = function (startCount, startLvl) {
  if (typeof startCount !== 'undefined') this.WaveNbMob = startCount;
  if (typeof startLvl !== 'undefined') this.WaveMobLvl = startLvl; // non connecté au système de mob (donc ne sert à rien lol)
  this.spawn(this.WaveNbMob /* nombre */, 'Monster_1'/* type */, 3000 /* tick interval */, true);
}
Way.prototype.onInfiniteWave = function () {
  var _this = this;
  this.WaveNbMob += Math.round(Math.log(this.WaveNbMob));
  this.WaveMobLvl++;
  for (var i = 0; i < this.mob.length; i++) {
    this.mob[i] = null;
    delete this.mob[i];
  }
  this.WaveNb++;
  document.getElementById('vagueNb').innerHTML = 'VAGUE '+this.WaveNb;
  this.mob = [];
  setTimeout(function () {
    _this.spawn(_this.WaveNbMob /* nombre */, 'Monster_1'/* type */, 3000 /* tick interval */, false);
  }, this.WaveTimeBeetweenWave);
}
