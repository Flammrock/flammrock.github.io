window.onload = create;
window.onmousemove = function(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
}
window.onmousedown = function(e) {
  if ("which" in e)  {
    mouseLeftDown = e.which == 1;
    mouseRightDown = e.which == 3;
  } else if ("button" in e) {
    mouseLeftDown = e.button == 1;
    mouseRightDown = e.button == 2;
  }
}
window.onmouseup = function(e) {
  mouseLeftDown = false;
}
window.oncontextmenu = function(e){
  e = e || window.event;
  if(typeof e.preventDefault != 'undefined') {
    e.preventDefault();
  }
  if(typeof e.stopPropagation != 'undefined') {
    e.stopPropagation();
  }
}
