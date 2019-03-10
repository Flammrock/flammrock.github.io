function Coin(world, settings) {
  var opts = settings || {};

  this.opts = opts;
  this.world = world;

  this.position = opts.position || {x:0,y:0};

  this.layer = 999999;

  this.zIndex = -1;

  this.isHover = false;
  this.dyHover = 0;
  this.opacityHover = 1;

  this.value = opts.value || 1;
  this.money = opts.money || this.value*10;
  this.radius = 100;
  this.height = this.radius/5;

  this.calcFromValue();

  // On ajoute notre mob dans le "monde"
  this.world.entity.push(this);
}
Coin.prototype.test = function () {
  return false;
}
Coin.prototype.draw = function () {
  var canvas = this.world.canvas, ctx = this.world.ctx;
  this.world.camera.apply();

  ctx.save();

  ctx.globalAlpha = this.opacityHover;
  ctx.translate(0,this.dyHover);
  if (this.isHover && this.opacityHover > 0) {
    this.opacityHover -= 0.1;
    this.dyHover -= 5;
  } else if (this.isHover) {
    this.opacityHover = 0;
  }

  if (this.opacityHover > 0) {
    ctx.beginPath();
    ctx.ellipse(this.position.x, this.position.y-this.radius+this.height, this.radius, this.radius/2, 0, 0, 2*Math.PI, false);
    //ctx.arc(x,y,this.rangeRadius,0,2*Math.PI,false);
    ctx.fillStyle = '#D6B500';
    ctx.fill();
    if (ctx.isPointInPath(mouseX,mouseY)) {
      this.onHover();
    }
    ctx.beginPath();
    ctx.ellipse(this.position.x, this.position.y-this.radius, this.radius, this.radius/2, 0, 0, 2*Math.PI, false);
    //ctx.arc(x,y,this.rangeRadius,0,2*Math.PI,false);
    ctx.fillStyle = '#FFD800';
    ctx.fill();
  }

  ctx.restore();
}
Coin.prototype.getAbsolutePosition = function () {
  return {
    x:this.position.x,
    y:this.position.y+this.radius/2
  }
}
Coin.prototype.calcFromValue = function () {
  this.radius = 20 * Math.sqrt(this.value);
  this.height = this.radius/5;
}
Coin.prototype.onHover = function () {
  if (!this.isHover) {
    if (this.money + this.world.currentPlayer.moneyAmount <= this.world.currentPlayer.moneyStockage) {
      this.world.currentPlayer.moneyAmount += this.money;
      this.world.currentPlayer.update();
      this.isHover = true;
    } else {
      // il faudrait afficher un message au joueur, qu'il comprenne qu'il doit constuire un nouveau entrepot
    }
  }
}
