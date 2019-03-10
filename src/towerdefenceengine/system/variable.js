var mouseX = mouseY = 200;
var mouseLeftDown = false;
var mouseRightDown = false;

var world;

Math.dist = function(x1,y1,x2,y2) {
  if(!x2) x2=0;
  if(!y2) y2=0;
  return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min;
}
