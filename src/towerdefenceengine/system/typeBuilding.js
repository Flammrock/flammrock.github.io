function TypeBuilding(world,name,settings) {
  var opts = settings || {};

  this.name = name;

  this.opts = opts;

  this.world = world;
  this.spriteSheetData = {
    path: opts.path,
    data: opts.data,
    width: opts.width,
    height: opts.height,
    tick: opts.tick || 125,
    factor: opts.factor || 0.6
  };

  this.cost = typeof opts.cost !== 'undefined' ? opts.cost : 100; // le cout du batiment

  this.sizeEmplacement = opts.sizeEmplacement || 1;

  this.health_max = opts.health_max || 100; // sa vie maximal
  this.damage = typeof opts.damage === 'undefined' ? 1 : opts.damage; // ses dégats
  this.level = opts.level || 1; // son niveau
  this.timeToBeBuild = opts.timeToBeBuild || 1000 * 3; // le temps avant que la tour soit contruite/opérationnelle (en milliseconde bien sûr)
  this.rangeRadius = opts.rangeRadius || 300;
  this.tickDamage = opts.tickDamage || 500;

  this.xCorrection = opts.xCorrection || 0;
  this.yCorrection = opts.yCorrection || 0;

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = this.spriteSheetData.width;
  canvas.height = this.spriteSheetData.height;
  var image = new Image();
  var _this = this;
  this.div = document.createElement('div');
  this.div.className = 'item';
  image.onload = function () {
    ctx.drawImage(this,0,0);
    _this.image = document.createElement('div');
    _this.image.className = 'image';
    _this.image.style.cssText = 'background:url('+canvas.toDataURL('image/png', 1.0)+') center no-repeat;background-size:contain;';
    _this.div.appendChild(_this.image);
    _this.div.onclick = function () {
        _this.world.itemSelectImage = new Image();
        _this.world.itemSelectImage.isLoad = false;
        _this.world.itemSelectImage.towerType = name;
        _this.world.itemSelectImage.sizeEmplacement = _this.sizeEmplacement;
        _this.world.itemSelectImage.factor = _this.spriteSheetData.factor;
        _this.world.itemSelectImage.onload = function () {
          this.isLoad = true;
        }
        _this.world.itemSelectImage.src = canvas.toDataURL('image/png', 1.0);
    };
  }
  image.src = this.spriteSheetData.path;
  document.getElementById('ct-building').appendChild(this.div);
  TypeBuilding.List[this.name] = this;
}
TypeBuilding.List = {};
