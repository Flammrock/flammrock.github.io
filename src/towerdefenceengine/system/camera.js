function Camera(x,y,world) {
  var _this = this;
  this.x = x || 0;
  this.y = y || 0;
  this.speed = 5;
  this.code = null;
  this.world = world;
  window.addEventListener('keydown',function (event) {
    _this.world.camera.code = event.keyCode;
  });
  window.addEventListener('keyup',function (event) {
    _this.world.camera.code = null;
  });
}
Camera.prototype.update = function () {
  var testX = null;
  var testY = null;
  switch (this.code) {
    case 37:
      // LEFT
      testX=this.x+this.speed;
      break;
    case 38:
      // UP
      testY=this.y+this.speed;
      break;
    case 39:
      // RIGHT
      testX=this.x-this.speed;
      break;
    case 40:
      // DOWN
      testY=this.y-this.speed;
      break;
    default:

  }
  if (mouseX < 45) testX=this.x+this.speed*2;
  if (mouseX > this.world.canvas.width-45) testX=this.x-this.speed*2;
  if (mouseY < 45) testY=this.y+this.speed*2;
  if (mouseY > this.world.canvas.height-45) testY=this.y-this.speed*2;
  if (testX != null && testX > this.world.bound.x && testX < this.world.bound.width) {
    this.x = testX;
  }
  if (testY != null && testY > this.world.bound.y && testY < this.world.bound.height) {
    this.y = testY;
  }
}
Camera.prototype.apply = function (canvas, ctx) {
  var canvas = canvas || this.world.canvas, ctx = ctx || this.world.ctx;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.translate(canvas.width/2+this.x, canvas.height/2+this.y);
}
