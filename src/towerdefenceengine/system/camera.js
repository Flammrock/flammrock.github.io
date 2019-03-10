function SpriteSheet(world,settings) {
  var opts = settings || {};
  this.world = world;
  this.image = new Image();
  this.image.load = false;
  this.image.onload = function () {
    this.load = true;
  }
  this.zIndex = 0;
  this.layer = 99999;
  this.image.src = opts.path || null;
  this.tick = opts.tick || 100;
  this.width = opts.width || 0;
  this.height = opts.height || 0;
  this.position = opts.position || HelperPlacementSystem.getPosition(this.world,0,0);
  this.factor = opts.factor||1;
  this.factorDefault = opts.factorDefault||1;
  this.sizeEmplacement = opts.sizeEmplacement||1;
  this.xIsoMetric = opts.xIsoMetric || 0;
  this.yIsoMetric = opts.yIsoMetric || 0;
  this.time = Date.now();
  this.i = 0;
  this.animation = opts.animation || {
    key: 'data',
    data: opts.data||[]
  };
  this.animation.current = this.animation[this.animation.key][0];
  if (opts.addToWorld) this.world.entity.push(this);
}
SpriteSheet.prototype.test = function () {
  var isHover = false;
  if (this.image.load) {
    var canvas = this.world.canvas, ctx = this.world.ctx;
    var data = this.getXYspriteSheet(this.animation.current);
    this.world.camera.apply();
    ctx.beginPath();
    ctx.rect(this.position.x-(this.width*this.factor)/2, this.position.y-(this.height*this.factor)/2, this.width*this.factor, this.height*this.factor);
    if (ctx.isPointInPath(mouseX,mouseY)) {
      isHover = true;
    }
    /*
    Cette partie est un peu technique en gros, voici l'idée :
    on créé un canvas de travail (invisible), on dessine notre image dans les même configurations,
    si le pixel aux coordonnése (mouseX,mouseY) est transparent c'est que la souris ne survole pas notre image,
    expliquer comme ça, ça parait évident mais je dois rappeler qu'à présent, on avait que isPointInPath en tête
    mais qu'ici il ne sert strictement à rien xDD
    */
    if (isHover) {
      isHover = false;
      var workingHoverCanvas = document.createElement('canvas');
      var workingHoverCtx = workingHoverCanvas.getContext('2d');
      workingHoverCanvas.width = canvas.width;
      workingHoverCanvas.height = canvas.height;
      this.world.camera.apply(workingHoverCanvas,workingHoverCtx);
      workingHoverCtx.drawImage(this.image, data.x, data.y, this.width, this.height, this.position.x-(this.width*this.factor)/2, this.position.y-(this.height*this.factor)/2, this.width*this.factor, this.height*this.factor);
      if (workingHoverCtx.getImageData(mouseX, mouseY, 1, 1).data[3]!=0) isHover = true;
    }
  }
  return isHover;
}
SpriteSheet.prototype.drawHover = function (size, color,xCorrection,yCorrection) {
  if (this.image.load) {
    var canvas = this.world.canvas, ctx = this.world.ctx;
    ctx.save();
    var data = this.getXYspriteSheet(this.animation.current);
    var workingHoverCanvas = document.createElement('canvas');
    var workingHoverCtx = workingHoverCanvas.getContext('2d');
    workingHoverCanvas.width = this.width*this.factor;
    workingHoverCanvas.height = this.height*this.factor;
    workingHoverCtx.drawImage(this.image, data.x, data.y, this.width, this.height, 0, 0, this.width*this.factor, this.height*this.factor);
    workingHoverCtx.globalCompositeOperation = 'source-in';
    workingHoverCtx.rect(0,0,workingHoverCanvas.width,workingHoverCanvas.height);
    workingHoverCtx.fillStyle = 'rgb('+color.r+','+color.g+','+color.b+')';
    workingHoverCtx.fill();
    this.world.camera.apply();
    if (typeof xCorrection === 'undefined') xCorrection = 0;
    if (typeof yCorrection === 'undefined') yCorrection = 0;
    ctx.drawImage(
      workingHoverCanvas,
      this.position.x-(this.width*this.factor)/2-size/2-xCorrection,
      this.position.y-(this.height*this.factor)/2-size/2-yCorrection,
      this.width*this.factor+size,
      this.height*this.factor+size
    );
    ctx.restore();
  }
}
SpriteSheet.prototype.draw = function (anime,xCorrection,yCorrection) {
  if (this.image.load) {
    var canvas = this.world.canvas, ctx = this.world.ctx;
    var data = this.getXYspriteSheet(this.animation.current);
    this.world.camera.apply();
    if (typeof anime === 'undefined') anime = true;
    if (!anime) {
      this.i = 0;
      this.animation.current = this.animation[this.animation.key][this.i];
    }
    if (typeof xCorrection === 'undefined') xCorrection = 0;
    if (typeof yCorrection === 'undefined') yCorrection = 0;
    ctx.beginPath();
    ctx.drawImage(
      this.image,
      data.x,
      data.y,
      this.width,
      this.height,
      this.position.x-(this.width*this.factor)/2-xCorrection,
      this.position.y-(this.height*this.factor)/2-yCorrection,
      this.width*this.factor,
      this.height*this.factor
    );
    if (Date.now() - this.time > this.tick && anime) {
      this.time = Date.now();
      this.i = this.i!=0 ? this.i%(this.animation[this.animation.key].length-1)==0 ? 0 : this.i+1 : this.i+1;
      this.animation.current = this.animation[this.animation.key][this.i>=this.animation[this.animation.key].length?0:this.i];
    }
  }
}
SpriteSheet.prototype.getXYspriteSheet = function(id) {
  var w = this.image.width-this.image.width%this.width+this.width;
  return {
    x: (this.width*(id+1))%w-this.width,
    y: this.height*Math.floor((this.width*id)/w)
  };
}
SpriteSheet.prototype.getAbsolutePosition = function () {
  return {
    x:this.position.x+(this.width*this.factorDefault)/2,
    y:this.position.y+(this.height*this.factorDefault)/2
  }
}
