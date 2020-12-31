window.onload = create;

window.requestAnimationFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};

if (!Object.create) {
  Object.create = function(proto) {
    function F(){}
    F.prototype = proto;
    return new F();
  };

}


CanvasRenderingContext2D.prototype.clearArc = function(x, y, radius, startAngle, endAngle, turn) {
  this.beginPath();
  this.arc(x, y, radius, startAngle, endAngle, turn);
  this.clip();
  this.clearRect(x - radius - 1, y - radius - 1, radius * 2 + 2, radius * 2 + 2);
};

CanvasRenderingContext2D.prototype.hexagone = function(x,y,r) {
  this.save();
  this.translate(x,y);
  this.rotate(Math.PI/3/2);
  this.beginPath();
  this.moveTo(0,0);
  for (var i = 0; i < 6; i++) {
    this.lineTo(r,0);
    this.translate(r,0);
    this.rotate(Math.PI/3);
  }
  this.closePath();
  this.setTransform(1,0,0,1,0,0);
  this.restore();
};
CanvasRenderingContext2D.prototype.Bighexagone = function(x,y,r) {
  this.save();
  this.translate(x,y);
  this.rotate(Math.PI/3/2);
  this.beginPath();
  this.moveTo(0,0);
  for (var i = 0; i < 18; i++) {
    this.lineTo(r,0);
    this.translate(r,0);
    this.rotate(Math.PI/3*((i+1)%3==0?-1:1));
  }
  this.closePath();
  this.setTransform(1,0,0,1,0,0);
  this.restore();
};

CanvasRenderingContext2D.prototype.triangleLine = function(x,y,len,angle,w) {
  this.save();
  if (angle == Math.PI/3) {
    var hypo = w;
  } else {
    var hypo = Math.sqrt(w*w-w*w*Math.sin(angle)*Math.sin(angle))+w*Math.cos(angle);
  }
  this.translate(x,y);
  this.rotate(-angle/2);
  this.beginPath();
  this.moveTo(0,0);
  for (var i = 0; i < len/hypo; i++) {
    this.rotate(angle*(i%2==0?1:-1));
    this.lineTo(w,0);
    this.translate(w,0);
  }
  this.restore();
};
CanvasRenderingContext2D.prototype.clipImage = function(image,w,h,_fn) {
  var tmpcanvas = document.createElement('canvas');
  var tmpctx = tmpcanvas.getContext('2d');
  tmpcanvas.width = w;
  tmpcanvas.height = h;

  tmpctx.drawImage(image,0,0,w,h);

  var imgData=tmpctx.getImageData(0,0,tmpcanvas.width,tmpcanvas.height);

  _fn(tmpcanvas,tmpctx);

  var imgData2=tmpctx.getImageData(0,0,tmpcanvas.width,tmpcanvas.height);

  for (var i=0;i<imgData.data.length;i+=4) {
    if (imgData.data[i+3] == 0) {
      imgData2.data[i+3] = 0;
    }
  }
  tmpctx.clearRect(0, 0, tmpcanvas.width, tmpcanvas.height);
  tmpctx.putImageData(imgData2, 0, 0);
  return tmpcanvas;
};
CanvasRenderingContext2D.prototype.clipAnything = function(_fnInit,w,h,_fn) {
  var tmpcanvas = document.createElement('canvas');
  var tmpctx = tmpcanvas.getContext('2d');
  tmpcanvas.width = w;
  tmpcanvas.height = h;

  _fnInit(tmpcanvas,tmpctx);

  var imgData=tmpctx.getImageData(0,0,tmpcanvas.width,tmpcanvas.height);

  _fn(tmpcanvas,tmpctx);

  var imgData2=tmpctx.getImageData(0,0,tmpcanvas.width,tmpcanvas.height);

  for (var i=0;i<imgData.data.length;i+=4) {
    if (imgData.data[i+3] == 0) {
      imgData2.data[i+3] = 0;
    }
  }
  tmpctx.clearRect(0, 0, tmpcanvas.width, tmpcanvas.height);
  tmpctx.putImageData(imgData2, 0, 0);
  return tmpcanvas;
};

CanvasRenderingContext2D.prototype.hatchRect = function(x1, y1, dx, dy, delta, decal, color) {
  this.rect(x1, y1, dx, dy);
  this.save();
  this.clip();
  var majorAxe = _.max([dx, dy])+decal;
  this.strokeStyle = color;

  var _this = this;

  _.each(_.range(-1*(majorAxe) , majorAxe, delta), function(n, i){
    _this.beginPath();
    _this.moveTo(n + x1, y1);
    _this.lineTo(dy + n + x1 , y1 + dy);
    _this.stroke();
  });

  this.restore();
};
CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  this.beginPath();
  this.moveTo(x + radius.tl, y);
  this.lineTo(x + width - radius.tr, y);
  this.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  this.lineTo(x + width, y + height - radius.br);
  this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  this.lineTo(x + radius.bl, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  this.lineTo(x, y + radius.tl);
  this.quadraticCurveTo(x, y, x + radius.tl, y);
  this.closePath();
};
CanvasRenderingContext2D.prototype.npcRect = function(x, y, width, height, radius, position, size, delta) {
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof position === 'undefined') {
    position = 'bottom';
  }
  if (typeof size === 'undefined') {
    size = 20;
  }
  if (typeof delta === 'undefined') {
    delta = 0;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  this.beginPath();
  this.moveTo(x + radius.tl, y);

  //TOP
  if (position == 'top') {
    this.lineTo(x + width/2 - size/2 - delta, y);
    this.lineTo(x + width/2 - delta, y - size);
    this.lineTo(x + width/2 + size/2 - delta, y);
  }
  this.lineTo(x + width - radius.tr, y);
  this.quadraticCurveTo(x + width, y, x + width, y + radius.tr);

  //RIGHT
  if (position == 'right') {
    this.lineTo(x + width, y + height/2 + size - radius.br);
    this.lineTo(x + width + size, y + height/2 + size/2 - radius.br);
    this.lineTo(x + width, y + height/2 - radius.br);
  }
  this.lineTo(x + width, y + height - radius.br);
  this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);

  //BOTTOM
  if (position == 'bottom') {
    this.lineTo(x + width/2 - size - delta + radius.bl, y + height);
    this.lineTo(x + width/2 - size/2 - delta + radius.bl, y + height + size);
    this.lineTo(x + width/2 - delta + radius.bl, y + height);
  }
  this.lineTo(x + radius.bl, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);

  //LEFT
  if (position == 'left') {
    this.lineTo(x, y + height/2 - size + radius.tl);
    this.lineTo(x - size, y + height/2 - size/2 + radius.tl);
    this.lineTo(x, y + height/2 + radius.tl);
  }
  this.lineTo(x, y + radius.tl);
  this.quadraticCurveTo(x, y, x + radius.tl, y);

  this.closePath();
};
CanvasRenderingContext2D.prototype.speRect = function(x, y, width, height, radius, b) {
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof b === 'undefined') {
    b = 5;
  }
  if (b <= radius) {
    b += radius;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius, obl: radius, otl: radius, otr: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0, obl: 0, otl: 0, otr: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  this.beginPath();
  this.moveTo(x, y);
  this.lineTo(x + width - b - radius.obl, y);
  this.quadraticCurveTo(x + width - b, y, x + width - b, y - radius.obl);
  this.lineTo(x + width - b, y - b + radius.otl);
  this.quadraticCurveTo(x + width - b, y - b, x + width - b + radius.otl, y - b);
  this.lineTo(x + width - radius.otr, y - b);
  this.quadraticCurveTo(x + width, y - b, x + width, y - b + radius.otr);
  this.lineTo(x + width, y + height - radius.br);
  this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  this.lineTo(x + radius.bl, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  this.lineTo(x, y + radius.tr);
  this.quadraticCurveTo(x, y, x + radius.tr, y);
  this.closePath();
};
CanvasRenderingContext2D.prototype.spe2Rect = function(x, y, width, height, radius, b, margin) {
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof b === 'undefined') {
    b = 5;
  }
  if (b <= radius) {
    b += radius;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius, obl: radius, otl: radius, otr: radius, obl1: radius, obr1: radius, otl1: radius, otr1: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0, obl: 0, otl: 0, otr: 0, obl1: 0, obr1: 0, otl1: 0, otr1: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  this.beginPath();
  this.moveTo(x, y);
  this.lineTo(x + width - b * 2 - margin - radius.obl1, y);
  this.quadraticCurveTo(x + width - b * 2 - margin, y, x + width - b * 2 - margin, y - radius.obl1);
  this.lineTo(x + width - b * 2 - margin, y - b + radius.otl1);
  this.quadraticCurveTo(x + width - b * 2 - margin, y - b, x + width - b * 2 - margin + radius.otl1, y - b);
  this.lineTo(x + width - b - margin - radius.otr1, y - b);
  this.quadraticCurveTo(x + width - b - margin, y - b, x + width - b - margin, y - b + radius.otr1);
  this.lineTo(x + width - b - margin, y - radius.obr1);
  this.quadraticCurveTo(x + width - b - margin, y, x + width - b - margin + radius.obr1, y);
  this.lineTo(x + width - b - radius.obl, y);
  this.quadraticCurveTo(x + width - b, y, x + width - b, y - radius.obl);
  this.lineTo(x + width - b, y - b + radius.otl);
  this.quadraticCurveTo(x + width - b, y - b, x + width - b + radius.otl, y - b);
  this.lineTo(x + width - radius.otr, y - b);
  this.quadraticCurveTo(x + width, y - b, x + width, y - b + radius.otr);
  this.lineTo(x + width, y + height - radius.br);
  this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  this.lineTo(x + radius.bl, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  this.lineTo(x, y + radius.tr);
  this.quadraticCurveTo(x, y, x + radius.tr, y);
  this.closePath();
};

CanvasRenderingContext2D.prototype.isPointInPath_old = CanvasRenderingContext2D.prototype.isPointInPath;
CanvasRenderingContext2D.prototype.isPointInPath = function(x, y) {
  this.save();
  this.setTransform(1, 0, 0, 1, 0, 0);
  var ret = this.isPointInPath_old(x, y);
  this.restore();
  return ret;
};


CanvasRenderingContext2D.prototype.Icons = function(name) {
  switch (name) {
    case 'gear':
    case 'cog':
      this.save();
      this.miterLimit=4;
      this.font="normal normal 400 normal 15px / 21.4286px ''";
      this.font="   15px ";
      this.scale(0.15625,0.15625);
      this.scale(0.15625,0.15625);
      this.save();
      this.font="   15px ";
      this.beginPath();
      this.moveTo(444.788,291.1);
      this.lineTo(487.404,315.699);
      this.bezierCurveTo(492.271,318.50800000000004,494.53,324.317,492.863,329.684);
      this.bezierCurveTo(481.793,365.326,462.89300000000003,397.526,438.174,424.27000000000004);
      this.translate(429.3476518009307,416.1164833679702);
      this.rotate(0);
      this.arc(0,0,12.016,0.745793622739321,2.09416946240084,0);
      this.rotate(0);
      this.translate(-429.3476518009307,-416.1164833679702);
      this.lineTo(380.758,401.9290000000001);
      this.translate(256.10852170897203,256.4496045834169);
      this.rotate(0);
      this.arc(0,0,191.577,0.8623569047539159,1.230785133379626,0);
      this.rotate(0);
      this.translate(-256.10852170897203,-256.4496045834169);
      this.lineTo(319.99899999999997,486.2410000000001);
      this.translate(307.9890000012822,486.2411755002582);
      this.rotate(0);
      this.arc(0,0,12.01,-0.000014612843307662239,1.3497670544300069,0);
      this.rotate(0);
      this.translate(-307.9890000012822,-486.2411755002582);
      this.bezierCurveTo(275.66599999999994,505.80900000000014,238.12299999999996,506.21500000000015,201.40299999999996,497.9660000000001);
      this.bezierCurveTo(195.91299999999995,496.7330000000001,191.99999999999997,491.8700000000001,191.99999999999997,486.2430000000001);
      this.lineTo(191.99999999999997,437.0590000000001);
      this.translate(255.8792768108392,256.46897807430184);
      this.rotate(0);
      this.arc(0,0,191.555,1.9107861206522656,2.2792571483937794,0);
      this.rotate(0);
      this.translate(-255.8792768108392,-256.46897807430184);
      this.lineTo(88.65699999999998,426.5240000000001);
      this.translate(82.65134819906926,416.11648336797026);
      this.rotate(0);
      this.arc(0,0,12.016,1.0474231911889536,2.395799030850472,0);
      this.rotate(0);
      this.translate(-82.65134819906926,-416.11648336797026);
      this.bezierCurveTo(49.106999999999985,397.52600000000007,30.20599999999999,365.3260000000001,19.13599999999999,329.6840000000001);
      this.bezierCurveTo(17.468999999999987,324.3180000000001,19.727999999999987,318.50900000000007,24.594999999999988,315.69900000000007);
      this.lineTo(67.212,291.1);
      this.translate(257.48163893314666,256.0005);
      this.rotate(0);
      this.arc(0,0,193.48,2.9591710603561343,3.324014246823453,0);
      this.rotate(0);
      this.translate(-257.48163893314666,-256.0005);
      this.lineTo(24.596000000000004,196.30200000000002);
      this.bezierCurveTo(19.729000000000003,193.49300000000002,17.470000000000002,187.68400000000003,19.137000000000004,182.317);
      this.bezierCurveTo(30.207000000000004,146.675,49.107,114.47500000000001,73.82600000000001,87.73100000000001);
      this.translate(82.65234819906928,95.88451663202983);
      this.rotate(0);
      this.arc(0,0,12.016,-2.3957990308504717,-1.047423191188952,0);
      this.rotate(0);
      this.translate(-82.65234819906928,-95.88451663202983);
      this.lineTo(131.24200000000002,110.072);
      this.translate(255.89147829102794,255.55139541658318);
      this.rotate(0);
      this.arc(0,0,191.577,-2.2792357488358777,-1.9108075202101675,0);
      this.rotate(0);
      this.translate(-255.89147829102794,-255.55139541658318);
      this.lineTo(192.00100000000003,25.759);
      this.translate(204.01099999871775,25.75882449974194);
      this.rotate(0);
      this.arc(0,0,12.01,3.1415780407464857,4.4913597080197984,0);
      this.rotate(0);
      this.translate(-204.01099999871775,-25.75882449974194);
      this.bezierCurveTo(236.33400000000006,6.191000000000001,273.87700000000007,5.785,310.59700000000004,14.034);
      this.bezierCurveTo(316.08700000000005,15.267000000000001,320.00000000000006,20.130000000000003,320.00000000000006,25.757);
      this.lineTo(320.00000000000006,74.941);
      this.translate(256.1207231891609,255.53102192569827);
      this.rotate(0);
      this.arc(0,0,191.555,-1.2308065329375277,-0.8623355051960139,0);
      this.rotate(0);
      this.translate(-256.1207231891609,-255.53102192569827);
      this.lineTo(423.3430000000001,85.476);
      this.translate(429.34865180093084,95.88351663202982);
      this.rotate(0);
      this.arc(0,0,12.016,-2.0941694624008407,-0.7457936227393223,0);
      this.rotate(0);
      this.translate(-429.34865180093084,-95.88351663202982);
      this.bezierCurveTo(462.8930000000001,114.474,481.7940000000001,146.674,492.8640000000001,182.316);
      this.bezierCurveTo(494.53100000000006,187.68200000000002,492.2720000000001,193.491,487.4050000000001,196.301);
      this.lineTo(444.788,220.9);
      this.translate(254.51336894005027,256);
      this.rotate(0);
      this.arc(0,0,193.485,-0.18241945391716144,0.18241945391716172,0);
      this.rotate(0);
      this.translate(-254.51336894005027,-256);
      this.closePath();
      this.moveTo(336,256);
      this.bezierCurveTo(336,211.888,300.112,176,256,176);
      this.bezierCurveTo(211.88799999999998,176,176,211.888,176,256);
      this.bezierCurveTo(176,300.11199999999997,211.888,336,256,336);
      this.bezierCurveTo(300.11199999999997,336,336,300.112,336,256);
      this.closePath();
      this.fill();
      this.stroke();
      this.restore();
      this.restore();
      break;
    case 'times':
    case 'close':
      this.save();
      this.strokeStyle="rgba(0,0,0,0)";
      this.miterLimit=4;
      this.font="normal normal 400 normal 15px / 21.4286px ''";
      this.font="   15px ";
      this.scale(0.20833333333333334,0.20833333333333334);
      this.translate(0.25,0);
      this.scale(0.20703125,0.20703125);
      this.save();
      this.font="   15px ";
      this.beginPath();
      this.moveTo(323.1,441);
      this.lineTo(377,387.1);
      this.bezierCurveTo(386.4,377.70000000000005,386.4,362.6,377,353.20000000000005);
      this.lineTo(279.8,256);
      this.lineTo(377,158.8);
      this.bezierCurveTo(386.4,149.4,386.4,134.3,377,124.9);
      this.lineTo(323.1,71);
      this.bezierCurveTo(313.70000000000005,61.6,298.6,61.6,289.20000000000005,71);
      this.lineTo(192,168.2);
      this.lineTo(94.8,71);
      this.bezierCurveTo(85.39999999999999,61.6,70.3,61.6,60.9,71);
      this.lineTo(7,124.9);
      this.bezierCurveTo(-2.4000000000000004,134.3,-2.4000000000000004,149.4,7,158.8);
      this.lineTo(104.2,256);
      this.lineTo(7,353.2);
      this.bezierCurveTo(-2.4000000000000004,362.59999999999997,-2.4000000000000004,377.7,7,387.09999999999997);
      this.lineTo(60.9,441);
      this.bezierCurveTo(70.3,450.4,85.4,450.4,94.8,441);
      this.lineTo(192,343.8);
      this.lineTo(289.2,441);
      this.bezierCurveTo(298.5,450.3,313.7,450.3,323.09999999999997,441);
      this.closePath();
      this.fill();
      this.stroke();
      this.restore();
      this.restore();
      break;
    case 'move':
      ctx.save();
      ctx.strokeStyle="rgba(0,0,0,0)";
      ctx.miterLimit=4;
      ctx.font="normal normal 400 normal 15px / 21.4286px ''";
      ctx.font="   15px ";
      ctx.scale(0.15625,0.15625);
      ctx.scale(0.15625,0.15625);
      ctx.save();
      ctx.font="   15px ";
      ctx.beginPath();
      ctx.moveTo(352.201,425.775);
      ctx.lineTo(273.005,504.971);
      ctx.bezierCurveTo(263.632,514.344,248.43699999999998,514.344,239.064,504.971);
      ctx.lineTo(159.868,425.775);
      ctx.bezierCurveTo(144.749,410.65599999999995,155.457,384.804,176.839,384.80499999999995);
      ctx.lineTo(228.001,384.80499999999995);
      ctx.lineTo(228,284);
      ctx.lineTo(127.196,284);
      ctx.lineTo(127.196,335.162);
      ctx.bezierCurveTo(127.196,356.544,101.345,367.25199999999995,86.225,352.133);
      ctx.lineTo(7.029,272.937);
      ctx.bezierCurveTo(-2.3439999999999994,263.564,-2.3439999999999994,248.36800000000002,7.029,238.996);
      ctx.lineTo(86.225,159.8);
      ctx.bezierCurveTo(101.344,144.681,127.196,155.389,127.196,176.77100000000002);
      ctx.lineTo(127.196,228);
      ctx.lineTo(228,228);
      ctx.lineTo(228,127.196);
      ctx.lineTo(176.77,127.196);
      ctx.bezierCurveTo(155.388,127.196,144.68,101.345,159.799,86.225);
      ctx.lineTo(238.995,7.028999999999996);
      ctx.bezierCurveTo(248.368,-2.344000000000003,263.563,-2.344000000000003,272.93600000000004,7.028999999999996);
      ctx.lineTo(352.13200000000006,86.225);
      ctx.bezierCurveTo(367.2510000000001,101.344,356.54300000000006,127.196,335.16100000000006,127.196);
      ctx.lineTo(283.9990000000001,127.196);
      ctx.lineTo(283.9990000000001,228);
      ctx.lineTo(384.8030000000001,228);
      ctx.lineTo(384.8030000000001,176.838);
      ctx.bezierCurveTo(384.8030000000001,155.456,410.6540000000001,144.748,425.77300000000014,159.867);
      ctx.lineTo(504.96900000000016,239.063);
      ctx.bezierCurveTo(514.3420000000002,248.43599999999998,514.3420000000002,263.632,504.96900000000016,273.004);
      ctx.lineTo(425.773,352.2);
      ctx.bezierCurveTo(410.654,367.31899999999996,384.802,356.611,384.803,335.229);
      ctx.lineTo(384.803,284);
      ctx.lineTo(284,284);
      ctx.lineTo(284,384.804);
      ctx.lineTo(335.23,384.804);
      ctx.bezierCurveTo(356.612,384.804,367.32000000000005,410.655,352.201,425.775);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.restore();
      break;
    default:

  }
};


var AllEvents = {
  move: function(e) {
    e = e || window.event;
    if (isMobile) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    } else {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    var xy = world.getRelativeXY();
    var area = '['+xy.x+','+xy.y+']'+world.currentMap;
    document.getElementById('savearea').innerHTML = area;
    if (world.windowDragId) {
      $('#WINDOW_'+world.windowDragId).css({top:mouse.y-world.mwindowoffy+'px',left:mouse.x-world.mwindowoffx+'px'});
      for (var i in ui.listWindow) {
        if (ui.listWindow.hasOwnProperty(i)) {
          if (ui.listWindow[i].id == world.windowDragId) {
            ui.listWindow[i].x = mouse.x-world.mwindowoffx;
            ui.listWindow[i].y = mouse.y-world.mwindowoffy;
          }
        }
      }
    } else {
      if (world.drag) {
        if (mouse.isLeftDown) {
          //new block({x:Math.round(((mouse.x-canvas.width/2)/world.zoom-world.x-world.mx-1000/2)/1000),y:Math.round(((mouse.y-canvas.height/2)/world.zoom-world.y-world.my-1000/2)/1000)})
          //On ajoute le sprite sélectionné au layer sélectionné
        } else if (mouse.isRightDown) {
          world.mx = (mouse.x-mouse.ax)/world.zoom;
          world.my = (mouse.y-mouse.ay)/world.zoom;
        } else {
          world.mx = 0;
          world.my = 0;
        }
      } else {
        if (typeof ui.currentCanvas.x != 'undefined') {
          if (mouse[ui.currentCanvas.mouseC] && ui.currentCanvas.mode == 'Move') {
            var rect = ui.currentCanvas.canvas.getBoundingClientRect();
            var t = ui.currentCanvas;
            t.viewWidth = t.canvas.width/t.zoom;
            t.viewHeight = t.canvas.height/t.zoom;
            var w = t.w - t.w%t.gw + t.gw;
            var h = t.h - t.h%t.gh + t.gh;
            var testX = ((mouse.x-rect.left)-(mouse.ax-rect.left))/t.zoom;
            var testY = ((mouse.y-rect.top)-(mouse.ay-rect.top))/t.zoom;

            if (ui.currentCanvas.limitSize) {
              if (t.viewWidth>w) {
                if ((t.x+testX)*-1<t.viewWidth/2 && (t.x+testX)+w<t.viewWidth/2) {
                  ui.currentCanvas.mx = ((mouse.x-rect.left)-(mouse.ax-rect.left))/ui.currentCanvas.zoom;
                } else {
                  if ((t.x+testX)*-1>t.viewWidth/2) {
                    ui.currentCanvas.mx = t.viewWidth/2*-1-t.x;
                  } else if ((t.x+testX)+w>t.viewWidth/2) {
                    ui.currentCanvas.mx = t.viewWidth/2-w-t.x;
                  }
                }
              } else {
                if ((t.x+testX)*-1>t.viewWidth/2 && (t.x+testX)+w>t.viewWidth/2) {
                  ui.currentCanvas.mx = ((mouse.x-rect.left)-(mouse.ax-rect.left))/ui.currentCanvas.zoom;
                } else {
                  if ((t.x+testX)*-1<t.viewWidth/2) {
                    ui.currentCanvas.mx = t.viewWidth/2*-1-t.x;
                  } else if ((t.x+testX)+w<t.viewWidth/2) {
                    ui.currentCanvas.mx = t.viewWidth/2-w-t.x;
                  }
                }
              }
              if (t.viewHeight>h) {
                if ((t.y+testY)*-1<t.viewHeight/2 && (t.y+testY)+h<t.viewHeight/2) {
                  ui.currentCanvas.my = ((mouse.y-rect.top)-(mouse.ay-rect.top))/ui.currentCanvas.zoom;
                } else {
                  if ((t.y+testY)*-1>t.viewHeight/2) {
                    ui.currentCanvas.my = t.viewHeight/2*-1-t.y;
                  } else if ((t.y+testY)+h>t.viewHeight/2) {
                    ui.currentCanvas.my = t.viewHeight/2-h-t.y;
                  }
                }
              } else {
                if ((t.y+testY)*-1>t.viewHeight/2 && (t.y+testY)+h>t.viewHeight/2) {
                  ui.currentCanvas.my = ((mouse.y-rect.top)-(mouse.ay-rect.top))/ui.currentCanvas.zoom;
                } else {
                  if ((t.y+testY)*-1<t.viewHeight/2) {
                    ui.currentCanvas.my = t.viewHeight/2*-1-t.y;
                  } else if ((t.y+testY)+h<t.viewHeight/2) {
                    ui.currentCanvas.my = t.viewHeight/2-h-t.y;
                  }
                }
              }
            } else {
              ui.currentCanvas.mx = ((mouse.x-rect.left)-(mouse.ax-rect.left))/ui.currentCanvas.zoom;
              ui.currentCanvas.my = ((mouse.y-rect.top)-(mouse.ay-rect.top))/ui.currentCanvas.zoom;
            }


          } else {
            ui.currentCanvas.mx = 0;
            ui.currentCanvas.my = 0;
          }
        }
      }
    }
    if (world.editorHover && mouse.isLeftDown) {
      world.drawTileset();

      if ((ui.selectMode == 'Selection' || ui.selectMode == 'CollisionRectangle' || ui.selectMode == 'EventRectangle') && world.selection.isClick) {
        world.selection.pointEnd = mouse.getAbsoluteXY();
        world.selection.ApointEnd = mouse.getRelativeXY();
        world.selection.UIpointEnd = {
          x: mouse.x,
          y: mouse.y
        };
      }
      if (
        Math.abs(world.selection.pointEnd.x-world.selection.pointStart.x) > 5 &&
        Math.abs(world.selection.pointEnd.y-world.selection.pointStart.y) > 5
      ) {
        world.selection.active = true;
        world.selection.tool = ui.selectMode;
      } else {
        world.selection.active = false;
        document.getElementById('selectionTileset').style.background = '#333';
      }
    }
  },
  mousedown: function(e) {
    e = e || window.event;

    if (isMobile) {
      mouse.ax = e.touches[0].clientX;
      mouse.ay = e.touches[0].clientY;
    } else {
      mouse.ax = e.clientX;
      mouse.ay = e.clientY;
    }

    if (isMobile) {
      mouse.isRightDown = true;
    } else {
      if ("which" in e)  {
        mouse.isLeftDown = e.which == 1;
        mouse.isRightDown = e.which == 3;
      } else if ("button" in e) {
        mouse.isLeftDown = e.button == 1;
        mouse.isRightDown = e.button == 2;
      }
    }

    if (world.editorHover && mouse.isLeftDown) {mouse.tmpClick = true;} else {mouse.tmpClick = false;}
    if (!world.editorHover) {
      if (typeof ui.currentCanvas.x != 'undefined') {
        world.selectionImagesOK = false;
        var t = ui.currentCanvas;
        if (mouse.isLeftDown) {t.selectZone = true;}
        t.viewWidth = t.canvas.width/t.zoom;
        t.viewHeight = t.canvas.height/t.zoom;
        var m = t.getXY({x:mouse.ax,y:mouse.ay});
        var x = ((m.x/t.zoom-(t.x+t.mx+t.viewWidth/2)) - (m.x/t.zoom-(t.x+t.mx+t.viewWidth/2))%t.gw) / t.gw;
        var y = ((m.y/t.zoom-(t.y+t.my+t.viewHeight/2)) - (m.y/t.zoom-(t.y+t.my+t.viewHeight/2))%t.gh) / t.gh;
        t.relativeAX = x;
        t.relativeAY = y;
        if (t.mode == 'Pointer') {
          t.onclick({leftClick:mouse.isLeftDown,rightClick:mouse.isRightDown},t,t.relativeAX,t.relativeAY,m.x,m.y);
        }
      }
    }
    if (world.editorHover && mouse.isLeftDown) {
      world.drawTileset();
      if (ui.selectMode == 'Selection' || ui.selectMode == 'CollisionRectangle' || ui.selectMode == 'EventRectangle') {
        world.selection.tool = ui.selectMode;
        world.selection.pointStart = mouse.getAbsoluteXY();
        world.selection.pointEnd = mouse.getAbsoluteXY();
        world.selection.ApointStart = mouse.getRelativeXY();
        world.selection.ApointEnd = mouse.getRelativeXY();
        world.selection.UIpointStart = {
          x: mouse.ax,
          y: mouse.ay
        };
        world.selection.isClick = true;
      }
    }
  },
  mouseup: function(e) {
    e = e || window.event;

    world.x += world.mx;
    world.y += world.my;
    world.mx = 0;
    world.my = 0;

    var xy = world.getRelativeXY();
    var oldxy = world.oldArea;
    if (!player.active_) {


      if (world.editorHover) {
        if (mouse.isLeftDown) {DataTool();}
        if (mouse.isRightDown) {
          editor.load([
            'Resource'
          ],function(){
            editor.inUse = false;
            window.onchangearea();
          });
        }
      } else {
        if (xy.x!=oldxy.x || xy.y!=oldxy.y) {world.oldArea=xy;window.onchangearea();}
      }
      if (ui.selectMode == 'Selection' || ui.selectMode == 'CollisionRectangle' || ui.selectMode == 'EventRectangle') {
        world.selection.isClick = false;
        try {
          var psx = checkValue(world.selection.pointStart.x,world.selection.pointEnd.x);
          var psy = checkValue(world.selection.pointStart.y,world.selection.pointEnd.y);
          var pex = checkValue(world.selection.pointStart.x,world.selection.pointEnd.x,1);
          var pey = checkValue(world.selection.pointStart.y,world.selection.pointEnd.y,1);

          var Apsx = checkValue(world.selection.ApointStart.x,world.selection.ApointEnd.x);
          var Apsy = checkValue(world.selection.ApointStart.y,world.selection.ApointEnd.y);
          var Apex = checkValue(world.selection.ApointStart.x,world.selection.ApointEnd.x,1);
          var Apey = checkValue(world.selection.ApointStart.y,world.selection.ApointEnd.y,1);

          var Mpsx = checkValue(world.selection.UIpointStart.x,world.selection.UIpointEnd.x);
          var Mpsy = checkValue(world.selection.UIpointStart.y,world.selection.UIpointEnd.y);
          var Mpex = checkValue(world.selection.UIpointStart.x,world.selection.UIpointEnd.x,1);
          var Mpey = checkValue(world.selection.UIpointStart.y,world.selection.UIpointEnd.y,1);

          world.selection.pointStart.x = psx;
          world.selection.pointStart.y = psy;
          world.selection.pointEnd.x = pex;
          world.selection.pointEnd.y = pey;

          world.selection.ApointStart.x = Apsx;
          world.selection.ApointStart.y = Apsy;
          world.selection.ApointEnd.x = Apex;
          world.selection.ApointEnd.y = Apey;

          world.selection.UIpointStart.x = Mpsx;
          world.selection.UIpointStart.y = Mpsy;
          world.selection.UIpointEnd.x = Mpex;
          world.selection.UIpointEnd.y = Mpey;
        } catch(e) {}
      }
      if (
        Math.abs(world.selection.pointEnd.x-world.selection.pointStart.x) > 5 &&
        Math.abs(world.selection.pointEnd.y-world.selection.pointStart.y) > 5
      ) {
        world.selection.active = true;
        world.selection.tool = ui.selectMode;
        if (world.selection.tool == 'CollisionRectangle' || ui.selectMode == 'EventRectangle') {

          //on découpe la sélection en fonction du quadrillage et on ajoute ça dans les resources
          //il faut créer une fonction pour mieux découper ==>
          /*world.cutDataByArea([
            {
              x:world.selection.pointStart.x,
              y:world.selection.pointStart.y
            },{
              x:world.selection.pointEnd.x,
              y:world.selection.pointStart.y
            },{
              x:world.selection.pointEnd.x,
              y:world.selection.pointEnd.y
            },{
              x:world.selection.pointStart.x,
              y:world.selection.pointEnd.y
            },
          ]);*/
          var obj = world.selection.tool == 'CollisionRectangle' ? 'COLLISION' : world.selection.tool == 'EventRectangle' ? 'EVENT' : 'COLLISION';
          var width = Math.abs(world.selection.pointEnd.x-world.selection.pointStart.x);
          var height = Math.abs(world.selection.pointEnd.y-world.selection.pointStart.y);

          if (obj == 'EVENT') {
            var input = document.createElement('input');
            //input.id = 'EditorInput';
            input.className = 'Editor-Input-type2';
            input.dataset.x = world.selection.pointStart.x+width/2;
            input.dataset.y = world.selection.pointStart.y+height/2;
            input.dataset.width = width;
            input.dataset.height = height;
            input.dataset.obj = obj;
            input.dataset.ok = 'false';
            input.style.left = (world.selection.UIpointStart.x+(width/2)*world.zoom)+'px';
            input.style.top = (world.selection.UIpointStart.y+(height/2)*world.zoom)+'px';
            var test = function(_this,e) {
              e.preventDefault();
              if (_this.dataset.ok == 'false') {
                if (_this.value != '') {

                  var obj = _this.dataset.obj;

                  var x = parseFloat(_this.dataset.x);
                  var y = parseFloat(_this.dataset.y);
                  var width = parseFloat(_this.dataset.width);
                  var height = parseFloat(_this.dataset.height);

                  var listZone = world.checkZoneToDraw({x:x,y:y},0,0,width,height);

                  var id = Math.random().toString(36).substr(2, 5)+''+Math.random().toString(36).substr(2, 5);

                  for (var i = 0; i < listZone.length; i++) {
                    var area = '['+listZone[i].x+','+listZone[i].y+']'+world.currentMap;
                    var width = Math.abs(listZone[i].endX-listZone[i].startX);
                    var height = Math.abs(listZone[i].endY-listZone[i].startY);
                    var data = [
                      new Point(listZone[i].x*1000+listZone[i].startX,listZone[i].y*1000+listZone[i].startY),
                      new Point(listZone[i].x*1000+listZone[i].endX,listZone[i].y*1000+listZone[i].startY),
                      new Point(listZone[i].x*1000+listZone[i].endX,listZone[i].y*1000+listZone[i].endY),
                      new Point(listZone[i].x*1000+listZone[i].startX,listZone[i].y*1000+listZone[i].endY)
                    ];
                    if (typeof resource.data[area] == 'undefined') {
                      resource.data[area] = {};
                    }
                    if (typeof resource.data[area][obj] == 'undefined') {
                      resource.data[area][obj] = {};
                      if (_this.value == 'START') {
                        resource.data[area][obj][0] = {data:data,name:_this.value+'__'};
                      } else {
                        resource.data[area][obj][0] = {data:data,name:_this.value+'_'+id+'_'+i};
                      }
                    } else {
                      if (_this.value == 'START') {
                        resource.data[area][obj][Object.keys(resource.data[area][obj]).length] = {data:data,name:_this.value+'__'};
                      } else {
                        resource.data[area][obj][Object.keys(resource.data[area][obj]).length] = {data:data,name:_this.value+'_'+id+'_'+i};
                      }
                    }
                  }
                }
                _this.dataset.ok = 'true';
                _this.remove();
                world.selection.pointStart = mouse.getAbsoluteXY();
                world.selection.pointEnd = mouse.getAbsoluteXY();
                world.selection.ApointStart = mouse.getRelativeXY();
                world.selection.ApointEnd = mouse.getRelativeXY();
                world.selection.isClick = false;
                world.selection.active = false;
                window.onchangearea();
              }
              return false;
            };
            input.onblur = function(e){e=e||event;test(this,e)};
            input.onkeydown = function(e){e=e||event;
              if (world.charset.replace(e.key,'') == world.charset) {e.preventDefault();return false;} ctx.font = "15px Arial";this.style.width = ctx.measureText(this.value+e.key).width+'px';};
            input.onkeyup = function(e){e=e||event;ctx.font = "15px Arial";this.style.width = ctx.measureText(this.value).width+'px';if(e.keyCode==13){test(this,e)}};
            document.body.appendChild(input);
            input.focus();
          } else {
            var listZone = world.checkZoneToDraw({x:world.selection.pointStart.x+width/2,y:world.selection.pointStart.y+height/2},0,0,width,height);

            for (var i = 0; i < listZone.length; i++) {
              var area = '['+listZone[i].x+','+listZone[i].y+']'+world.currentMap;
              var width = Math.abs(listZone[i].endX-listZone[i].startX);
              var height = Math.abs(listZone[i].endY-listZone[i].startY);
              var data = [
                new Point(listZone[i].x*1000+listZone[i].startX,listZone[i].y*1000+listZone[i].startY),
                new Point(listZone[i].x*1000+listZone[i].endX,listZone[i].y*1000+listZone[i].startY),
                new Point(listZone[i].x*1000+listZone[i].endX,listZone[i].y*1000+listZone[i].endY),
                new Point(listZone[i].x*1000+listZone[i].startX,listZone[i].y*1000+listZone[i].endY)
              ];
              if (typeof resource.data[area] == 'undefined') {
                resource.data[area] = {};
              }
              if (typeof resource.data[area][obj] == 'undefined') {
                resource.data[area][obj] = {};
                resource.data[area][obj][0] = {data:data};
              } else {
                resource.data[area][obj][Object.keys(resource.data[area][obj]).length] = {data:data};
              }
            }

            world.selection.pointStart = mouse.getAbsoluteXY();
            world.selection.pointEnd = mouse.getAbsoluteXY();
            world.selection.ApointStart = mouse.getRelativeXY();
            world.selection.ApointEnd = mouse.getRelativeXY();
            world.selection.isClick = false;
            world.selection.active = false;
            window.onchangearea();
          }



        }
      } else {
        world.selection.active = false;
        document.getElementById('selectionTileset').style.background = '#333';
      }

      if (typeof ui.currentCanvas.x != 'undefined') {
        var t = ui.currentCanvas;
        t.x += t.mx;
        t.y += t.my;
        t.selectZone = false;
        t.mx = 0;
        t.my = 0;


        var x = (t.relativeAX > t.relativeX ? t.relativeX : t.relativeAX)*t.gw;
        var y = (t.relativeAY > t.relativeY ? t.relativeY : t.relativeAY)*t.gh;
        var width = (t.relativeAX > t.relativeX ? t.relativeAX-t.relativeX : t.relativeX-t.relativeAX)*t.gw;
        var height = (t.relativeAY > t.relativeY ? t.relativeAY-t.relativeY : t.relativeY-t.relativeAY)*t.gh;

        // c'est à ce moment que l'on construit les 2 images
        world.selectionImages = world.constructImage(t.relativeAX,t.relativeAY,t.relativeX-t.relativeAX,t.relativeY-t.relativeAY,t.gw,t.gh);
        world.selectionImagesOK = true;

        world.drawX = x;
        world.drawY = y;
        world.drawWidth = width;
        world.drawHeight = height;
      }
      //On save pour de bon ==>
        for (var c in world.selectionImages) {
          if (world.selectionImages.hasOwnProperty(c)) {
            for (var i = 0; i < world.listZone.length; i++) {
              var currentZone = world.listZone[i];
              var area = '['+currentZone.x+','+currentZone.y+']'+world.currentMap;
              var tmpcanvas;
              var id = 'TMP_CANVAS_AREA_'+area+'_'+c;
              if (document.getElementById(id) && world.tmp[area+'_'+c]) {
                tmpcanvas = document.getElementById(id);
                var dataURI = tmpcanvas.toDataURL('image/png', 1.0);
                world.tmp[area+'_'+c] = false;
                resource.setAreaLayer(area,c,dataURI,{
                  x: currentZone.x*1000,
                  y: currentZone.y*1000
                });
                document.getElementById(id).remove();
              }
            }
          }
        }
    }
    mouse.isLeftDown = false;
    mouse.isRightDown = false;
    world.drag = true;
    world.windowDragId = false;
  },
  zoom: function(e) {
    if (world.editorHover) {
      e = e || window.event;
      world.zoom += e.wheelDelta/1200;
      if (world.zoom.toFixed(5) < 0.2) {
        world.zoom = 0.22;
      }
      world.oldScale = world.scale;
      world.scale *= world.zoom;
      if (window['lastmousewheel']-Date.now()>1000) {
        window['lastmousewheelb'] = true;
        editor.load([
          'Resource'
        ],function(){
          editor.inUse = false;
          window.onchangearea();
          window['lastmousewheel'] = Date.now();
        });
      }


    } else if (typeof ui.currentCanvas.zoom != 'undefined') {
      e = e || window.event;
      ui.currentCanvas.selectZone = false;
      ui.currentCanvas.zoom += e.wheelDelta/1200;
      if (ui.currentCanvas.zoom.toFixed(5) < 0.2) {
        ui.currentCanvas.zoom = 0.22;
      }
      ui.currentCanvas.oldScale = ui.currentCanvas.scale;
      ui.currentCanvas.scale *= ui.currentCanvas.zoom;
    }
  },

  onkeydown: function(e) {
    e = e || event;
    Key.onKeydown(e);
  },
  onkeyup: function(e) {
    e = e || event;
    Key.onKeyup(e);
  },

  changearea: function(area) {
    world.ObjectCollision = {};
    world.ObjectEvent = {};
    world.ObjectMap = {};
    world.ObjectMob = {};
    world.ObjectCollision[0] = player.boxCollision;
    if (player.currentEventObject != null) {
      new Polygon(player.currentEventObject,false);
    }

    var viewWidth = canvas.width/world.zoom,
        viewHeight = canvas.height/world.zoom;

    var nbAreaWidth = Math.ceil(viewWidth/1000)+1,
        nbAreaHeight = Math.ceil(viewHeight/1000)+1;

    var nbArea = nbAreaWidth*nbAreaHeight;

    var currentPos = world.getRelativeXY();

    if (area) {
      if (typeof resource.data[area] != 'undefined') {
          if (typeof resource.data[area]['COLLISION'] != 'undefined') {
            for (var o in resource.data[area]['COLLISION']) {
              if (resource.data[area]['COLLISION'].hasOwnProperty(o)) {
                world.ObjectCollision[Object.keys(world.ObjectCollision).length] = new Polygon({points:resource.data[area]['COLLISION'][o]['data'],type:'COLLISION'});
              }
            }
          }
        }
      if (typeof resource.data[area] != 'undefined') {
          if (typeof resource.data[area]['EVENT'] != 'undefined') {
            for (var o in resource.data[area]['EVENT']) {
              if (resource.data[area]['EVENT'].hasOwnProperty(o)) {
                if (typeof resource.data[area]['EVENT'][o]['name'] != 'undefined') {
                  world.ObjectEvent[Object.keys(world.ObjectEvent).length] = new Polygon({points:resource.data[area]['EVENT'][o]['data'],type:'EVENT',data:{name:resource.data[area]['EVENT'][o]['name']}});
                } else {
                  world.ObjectEvent[Object.keys(world.ObjectEvent).length] = new Polygon({points:resource.data[area]['EVENT'][o]['data'],type:'EVENT'});
                }
              }
            }
          }
        }
      if (typeof resource.data[area] != 'undefined') {
        if (typeof resource.data[area]['MAP'] != 'undefined') {
          for (var o in resource.data[area]['MAP']) {
            if (resource.data[area]['MAP'].hasOwnProperty(o)) {
              world.ObjectMap[Object.keys(world.ObjectMap).length] = {x:resource.data[area]['MAP'][o].x,y:resource.data[area]['MAP'][o].y,name:resource.data[area]['MAP'][o].name};
            }
          }
        }
      }
      bluePrint.initStartEvent(area);
    } else {
      for (var x = Math.floor(-nbAreaWidth/2)-5; x < Math.ceil(nbAreaWidth/2)+5; x++) {
        for (var y = Math.floor(-nbAreaHeight/2)-5; y < Math.ceil(nbAreaHeight/2)+5; y++) {
          var realX = x+currentPos.x,
              realY = y+currentPos.y;
          realX = realX==0?0:realX,
          realY = realY==0?0:realY;
          var area = '['+realX+','+realY+']'+world.currentMap;
          if (typeof resource.data[area] != 'undefined') {
              if (typeof resource.data[area]['COLLISION'] != 'undefined') {
                for (var o in resource.data[area]['COLLISION']) {
                  if (resource.data[area]['COLLISION'].hasOwnProperty(o)) {
                    world.ObjectCollision[Object.keys(world.ObjectCollision).length] = new Polygon({points:resource.data[area]['COLLISION'][o]['data'],type:'COLLISION'});
                  }
                }
              }
            }
          if (typeof resource.data[area] != 'undefined') {
              if (typeof resource.data[area]['EVENT'] != 'undefined') {
                for (var o in resource.data[area]['EVENT']) {
                  if (resource.data[area]['EVENT'].hasOwnProperty(o)) {
                    if (typeof resource.data[area]['EVENT'][o]['name'] != 'undefined') {
                      world.ObjectEvent[Object.keys(world.ObjectEvent).length] = new Polygon({points:resource.data[area]['EVENT'][o]['data'],type:'EVENT',data:{name:resource.data[area]['EVENT'][o]['name']}});
                    } else {
                      world.ObjectEvent[Object.keys(world.ObjectEvent).length] = new Polygon({points:resource.data[area]['EVENT'][o]['data'],type:'EVENT'});
                    }
                  }
                }
              }
            }
          if (typeof resource.data[area] != 'undefined') {
              if (typeof resource.data[area]['MAP'] != 'undefined') {
                for (var o in resource.data[area]['MAP']) {
                  if (resource.data[area]['MAP'].hasOwnProperty(o)) {
                    world.ObjectMap[Object.keys(world.ObjectMap).length] = {x:resource.data[area]['MAP'][o].x,y:resource.data[area]['MAP'][o].y,name:resource.data[area]['MAP'][o].name};
                  }
                }
              }
            }
        }
      }
    }

    var listarea = [];
    for (var x = Math.floor(-nbAreaWidth/2)-5; x < Math.ceil(nbAreaWidth/2)+5; x++) {
      for (var y = Math.floor(-nbAreaHeight/2)-5; y < Math.ceil(nbAreaHeight/2)+5; y++) {
        var realX = x+currentPos.x,
            realY = y+currentPos.y;
        realX = realX==0?0:realX,
        realY = realY==0?0:realY;
        var area = '['+realX+','+realY+']'+world.currentMap;
        listarea.push(area);
      }
    }
    var d = {
      mode: 'SELECTw',
      table: 'mobs',
      where: 'area',
      whereValue: listarea.join('","')
    };
    socket.SetMysql(d,function(data){
      if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
          var dataMob = JSON.parse(data[i].data);
          world.ObjectMob[Object.keys(world.ObjectMob).length] = new Mob({id:data[i].idMob,name:dataMob.name});
        }
      }
    });

  },

  mouseenter: function(e) {
    world.editorHover = true;
  },
  mouseleave: function(e) {
    world.editorHover = false;
  }
};

var isMobile = false;
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
    isMobile = true;
}


window['lastmousewheel'] = Date.now();
window['lastmousewheelb'] = false;
/*
window.oncontextmenu = function(e){
  e = e || window.event;
  if(typeof e.preventDefault != 'undefined') {
    e.preventDefault();
  }
  if(typeof e.stopPropagation != 'undefined') {
    e.stopPropagation();
  }
};*/
if (isMobile) {
  function window_events() {
    window.addEventListener("touchstart", AllEvents.mousedown, false);
    window.addEventListener("touchend", AllEvents.mouseup, false);
    //window.addEventListener("touchcancel", handleCancel, false);
    //window.addEventListener("touchleave", handleLeave, false);
    window.addEventListener("touchmove", AllEvents.move, false);
    window.onchangearea = AllEvents.changearea;
  };
} else {
  function window_events() {
    window.onmousemove = AllEvents.move;
    window.onmousedown = AllEvents.mousedown;
    window.onmouseup = AllEvents.mouseup;
    window.onmousewheel = AllEvents.zoom;

    window.onkeydown = AllEvents.onkeydown;
    window.onkeyup = AllEvents.onkeyup;

    window.onchangearea = AllEvents.changearea;

    canvas.onmouseenter = AllEvents.mouseenter;
    canvas.onmouseleave = AllEvents.mouseleave;
  };
}


/*

FAIT---modifier tous les trucs qui charge au début, il faut optimiser à fond le chargement de l'éditeur
==> CONSEQUENCE :

  - RESOLU:bug goToMap (il load à l'infini ==> BLOCKAGE DU SCRIPT A CE NIVEAU)

// NOTE DEVELOPPER:

      Une Area est composée de 1000*1000/80 petit carré
      [...]

      (
        [THIS FILE JS] [CHANGE LOG]
        - FAIT----------------faire apraitre le layer sélectionner dans la zone
        - FAIT----------------rangé automatiquement les layers par type
        - FAIT----------------ajouter le layer : Znormal Layer [nb]


        - FAIT----------------button select tileset
        - FAIT----------------window select tileset
        - FAIT----------------window select part of current tileset


        - FAIT----------------If selected : false draw (survol du dessin il suit le curseur) sur le layer selectionne
        - FAIT----------------Else -> nothing happend

        - FAIT----------------If selected + Clicked : true draw (on applique vraiment le dessin sur le layer seectionné)
        - FAIT----------------Else -> nothing happend

        - FAIT----------------ajouter bouton gomme + pencil
        - FAIT----------------ajouter function save (il faut juste compiler les area image en une seule)
        - ajouter function load (presque fini)
        - FAIT----------------ajouter sélection tool (on peut dessiner, remplir, effacer, couper, coller)
        - FAIT----------------ajouter fill tool

        - changer le système de sélection du tileset (permet de rendre + facile l'intégration du mode AUTO)

        - ajouter un mode AUTO à l'éditeur => gestion automatique des layers
                                           => éditer les tilesets et définir les zones qui iront dans les layer normal et znormal et (facultatif collision layer)

       - [FACULTATIF] ajouter menu context on middleclick (copier, coller, save [area cursor])


        - ajouter socket multi (complexe => {
            cursor : {x;y;click},
            currenttileset : {listZone + Image},
            action: tool
        })
      )


      (
        [AUTRE FILE JS] :

        - load area normal + znormal (distance view)
        - add player
        - add menu (connection, inscription, deconnection)

        - ajouter socket multi (simple, just [x;y;name])
      )


// IDEA (BROUILLON) :
  - save unqiuement par area, si qu'elqun est déjà entrain de save on lock

  - ajouter bouton rond afficher gridarea, tilsetarea, ...
  - ajouter gomme..

  - [+ voir les curseur des autres...]

  - player ---> manger, dormir, boire...

  - NEWS : nouvelle approche : on créé 2 canvas (NORMAL + ZNORMAL),
          mais avant on récupérère data selection et on ajoute chaque "carré" dans l'ordre selon leur Zindex
          puis on créé une image temp au moment de la sélection

  - on supprime les layers : => inutile



// BUG:
  - FAIT----------------FIXED: problème offetX et offsetY en sélectionner le tilset ===> toujours à {x:0,y:0} (HYPR MEGA SUPER IMPORTANT) [Impact: +++++++++++]
  - FAIT----------------FIXED: impossible d'importer un tilset (Error NodeJS : Request aborted) (HYPR MEGA SUPER IMPORTANT) [Impact: +++++++++++]
  - FAIT----------------FIXED: impossible de fermer les fenêtres de types layer (IMPORTANT) [Impact: ++++]
  - la gomme n'efface que sil on a dessiner sur le layer aupparavant (conséquence: problème au load, les trcus appariassents mais on peut pas directement les gommer) (IMPORTANT) [Impact: ++++]
  - problème sléection tileset (IMPORTANT) [Impact: ++++]
  - lorsque l'on dessine où que l'on gomme, le layer concerné se met au 1er plan (IMPORTANT) [Impact: ++++]
  - parfois, [select tileset] l'image n'apparait pas dans le coin supérieur droit du canvas (NOT IMPORTANT) [Impact: --]
*/


var canvas, ctx, player, world, mouse, ui, map, resource, editor, menu, maker, mob, memoryManagement, jaajList, attackList, itemList, cinematic;

var ColorName = ['blue','red','green','orange','yellow','purple','white','cyan'];
var ColorData = [
  {name:'Sapphir',color:'#00AEFF'},
  {name:'Ruby',color:'#FF0000'},
  {name:'Emerald',color:'#1DDA02'},
  {name:'Amber',color:'#FF9E00'},
  {name:'Topaz',color:'#FFFB00'},
  {name:'Amethyst',color:'#B600FF'},
  {name:'Opal',color:'#FFFFFF'},
  {name:'Zircon',color:'#00FFFF'}
];
var Key = {
  _pressed: {},
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};

function goclone(source) {
    if (Object.prototype.toString.call(source) === '[object Array]') {
        var clone = [];
        for (var i=0; i<source.length; i++) {
            clone[i] = goclone(source[i]);
        }
        return clone;
    } else if (typeof(source)=="object") {
        var clone = {};
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                clone[prop] = goclone(source[prop]);
            }
        }
        return clone;
    } else {
        return source;
    }
}
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function setClipboardText(text) {
    var id = "mycustom-clipboard-textarea-hidden-id";
    var existsTextarea = document.getElementById(id);

    if(!existsTextarea){
      //console.log("Creating textarea");
      var textarea = document.createElement("textarea");
      textarea.id = id;
      // Place in top-left corner of screen regardless of scroll position.
      textarea.style.position = 'fixed';
      textarea.style.top = 0;
      textarea.style.left = 0;

      // Ensure it has a small width and height. Setting to 1px / 1em
      // doesn't work as this gives a negative w/h on some browsers.
      textarea.style.width = '1px';
      textarea.style.height = '1px';

      // We don't need padding, reducing the size if it does flash render.
      textarea.style.padding = 0;

      // Clean up any borders.
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';

      // Avoid flash of white box if rendered for any reason.
      textarea.style.background = 'transparent';
      //textarea.style.visibility = 'hidden';
      document.querySelector("body").appendChild(textarea);
      existsTextarea = document.getElementById(id);
    }

    existsTextarea.value = text;
    existsTextarea.select();

    try {
      var status = document.execCommand('copy');
      if (!status) {
        console.error("Cannot copy text");
      } else {
        console.log("The text is now on the clipboard");
      }
    } catch (err) {
      console.log('Unable to copy.');
    }
}
function checkValue(a,b,c) {
  if (c) {
    return a>b?a:b;
  } else {
    return a>b?b:a;
  }
};
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min;
};
function isEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
};
function cleanObjectFromJSON(a) {
  for (var i in a) {
    if (a.hasOwnProperty(i)) {
      if (typeof a[i] == 'object' || typeof a[i] == 'array') {
        a[i] = cleanObjectFromJSON(a[i]);
      } else if (typeof a[i] == 'string') {
        if (!isNaN(a[i]) && a[i] != '') {
          a[i] = parseFloat(a[i]);
        } else if (a[i] == "true") {
          a[i] = true;
        } else if (a[i] == "false") {
          a[i] = false;
        }
      }
    }
  }
  return a;
};
function getTextWidth(text, font) {
  var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  var context = canvas.getContext("2d");
  context.font = font;
  var metrics = context.measureText(text);
  return metrics.width;
};
function pointInCircle(x, y, cx, cy, radius) {
  var distancesquared = (x - cx) * (x - cx) + (y - cy) * (y - cy);
  return distancesquared <= radius * radius;
};
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};
function delCookie(cname) {
  setCookie(cname, "", -1);
};
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};
function checkCookie(cname) {
  if (getCookie(cname) != "") {
    return true;
  } else {
    return false;
  }
};
var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
var STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
function annotate(fn) {
  var $inject,
    fnText,
    argDecl,
    last;

  if (typeof fn == 'function') {
    if (!($inject = fn.$inject)) {
      $inject = [];
      fnText = fn.toString().replace(STRIP_COMMENTS, '');
      argDecl = fnText.match(FN_ARGS);
      argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg) {
        arg.replace(FN_ARG, function(all, underscore, name) {
          $inject.push(name);
        });
      });
      fn.$inject = $inject;
    }
  } else {
    throw Error("not a function")
  }
  return $inject;
}
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};




function FindEllipseSegmentIntersections(r,pt0,pt1,pt2) {
  //Translate To center of Ellipse
  pt1.x-=pt0.x;
  pt1.y-=pt0.y;
  pt2.x-=pt0.x;
  pt2.y-=pt0.y;

  //Find equation of Line/Segment
  var slope = (pt1.y-pt2.y)/(pt1.x-pt2.x);
  var y = {
    a:slope,
    b:slope*-pt1.x+pt1.y,
    _fn: function(x) {
      return slope*x+(slope*-pt1.x+pt1.y);
    }
  };

  //Solve Quadratic Equation
  var d = r.x*r.y;
  var A = d/r.x+(y.a*y.a*d/r.y);
  var B = (y.a*y.b)*2*d/r.y;
  var C = y.b*y.b*d/r.y-d;
  var delta = B*B - 4 * A * C;

  //Calc Solution
  var S = [];
  if (delta < 0) {
    //No Intersection
    return [];
  } else if (delta == 0) {
    //One Point Intersection
    S.push(-B/2*A);
  } else {
    //Two Point Intersection
    S.push((-B-Math.sqrt(delta))/(2*A));
    S.push((-B+Math.sqrt(delta))/(2*A));
  }


  //Get all Points Intersections
  var Points = [];
  for (var i = 0; i < S.length; i++) {
    var angle = Math.atan2(y._fn(S[i])/10,S[i]/10);
    Points.push({
      x:pt0.x+r.x*Math.cos(angle),
      y:pt0.y+r.y*Math.sin(angle)
    });
  }

  return Points;
};


function Point(px, py) {
  this.x = px;
  this.y = py;
};
function Polygon(settings,b) {
  settings = settings || {};
  this.points = settings.points || new Array();
  this.center = settings.center || new Point(0,0);
  this.color = settings.color || 'rgba(255,0,0,0.4)';
  this.data = settings.data || {};
  this.collision = false;
  this.event = false;
  this.type = settings.type || 'COLLISION';
  if (!b) {
    if (settings.type == 'COLLISION') {
      world.ObjectCollision[Object.keys(world.ObjectCollision).length] = this;
    } else if (settings.type == 'EVENT') {
      world.ObjectEvent[Object.keys(world.ObjectEvent).length] = this;
    }

  }
};
Polygon.prototype.addPoint = function(p) {
  this.points.push(p);
};
Polygon.prototype.addAbsolutePoint = function(p) {
  this.points.push( { "x": p.x - this.center.x, "y": p.y - this.center.y } );
};
Polygon.prototype.getNumberOfSides = function() {
  return this.points.length;
};
Polygon.prototype.rotate = function(rads) {

  for (var i = 0; i < this.points.length; i++) {
    var x = this.points[i].x;
    var y = this.points[i].y;
    this.points[i].x = Math.cos(rads) * x - Math.sin(rads) * y;
    this.points[i].y = Math.sin(rads) * x + Math.cos(rads) * y;
  }

};
Polygon.prototype.draw = function(isMouseIn) {
  ctx.beginPath();
  var originX = world.x+world.mx;
  var originY = world.y+world.my;
  originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
  originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.scale(world.zoom, world.zoom);
  ctx.translate(originX, originY);
  if (this.type == 'COLLISION') {
    ctx.fillStyle = isMouseIn?'rgba(255,0,0,0.7)':'rgba(255,0,0,0.4)';
    ctx.strokeStyle = '#f00';
  } else {
    if (this.data.name == 'START__') {
      ctx.fillStyle = isMouseIn?'rgba(0,80,240,0.7)':'rgba(0,80,240,0.4)';
      ctx.strokeStyle = '#0f0';
    } else {
      ctx.fillStyle = isMouseIn?'rgba(0,255,0,0.7)':'rgba(0,255,0,0.4)';
      ctx.strokeStyle = '#0f0';
    }
  }

  ctx.beginPath();
  ctx.moveTo(this.points[0].x, this.points[0].y);
  for (var i = 1; i < this.points.length; i++) {
    ctx.lineTo(this.points[i].x + this.center.x, this.points[i].y + this.center.y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (typeof this.data['name'] != 'undefined') {
    var name = this.data['idmob'] || this.data['name'].replace(/_[^_]*$/,'').replace(/_[^_]*$/,'');
    ctx.beginPath();
    var width = Math.abs(this.points[this.points.length-2].x-this.points[0].x);
    var height = Math.abs(this.points[this.points.length-2].y-this.points[0].y);
    ctx.translate(this.points[0].x+width/2, this.points[0].y+height/2);
    ctx.font = '15px Arial';
    ctx.lineWidth = 0.5;
    ctx.rect(-ctx.measureText(name).width/2/world.zoom,-10/world.zoom,ctx.measureText(name).width/world.zoom,20/world.zoom);
    if (name == 'START') {
      ctx.fillStyle = 'rgba(0, 80, 240, 0.2)';
    } else {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
    }
    ctx.strokeStyle = '#0f0';
    ctx.fill();
    ctx.stroke();
    ctx.font = (15/world.zoom)+'px Arial';
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText(name,0,0);
  }

  ctx.setTransform(1,0,0,1,0,0);
};
Polygon.prototype.containsPoint = function(pnt) {
  var nvert = this.points.length;
  var testx = pnt.x;
  var testy = pnt.y;

  var vertx = new Array();
  for (var q = 0; q < this.points.length; q++) {
    vertx.push(this.points[q].x + this.center.x);
  }

  var verty = new Array();
  for (var w = 0; w < this.points.length; w++) {
    verty.push(this.points[w].y + this.center.y);
  }

  var i, j = 0;
  var c = false;
  for (i = 0, j = nvert - 1; i < nvert; j = i++) {
    if ( ((verty[i]>testy) != (verty[j]>testy)) &&
        (testx < (vertx[j]-vertx[i]) * (testy-verty[i]) / (verty[j]-verty[i]) + vertx[i]) )
      c = !c;
  }
  return c;
};
Polygon.prototype.intersectsWith = function(other) {
  var axis = new Point();
  var tmp, minA, maxA, minB, maxB;
  var side, i;
  var smallest = null;
  var overlap = 99999999;

  /* test polygon A's sides */
  for (side = 0; side < this.getNumberOfSides(); side++)
  {
    /* get the axis that we will project onto */
    if (side == 0)
    {
      axis.x = this.points[this.getNumberOfSides() - 1].y - this.points[0].y;
      axis.y = this.points[0].x - this.points[this.getNumberOfSides() - 1].x;
    }
    else
    {
      axis.x = this.points[side - 1].y - this.points[side].y;
      axis.y = this.points[side].x - this.points[side - 1].x;
    }

    /* normalize the axis */
    tmp = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
    axis.x /= tmp;
    axis.y /= tmp;

    /* project polygon A onto axis to determine the min/max */
    minA = maxA = this.points[0].x * axis.x + this.points[0].y * axis.y;
    for (i = 1; i < this.getNumberOfSides(); i++)
    {
      tmp = this.points[i].x * axis.x + this.points[i].y * axis.y;
      if (tmp > maxA)
        maxA = tmp;
      else if (tmp < minA)
        minA = tmp;
    }
    /* correct for offset */
    tmp = this.center.x * axis.x + this.center.y * axis.y;
    minA += tmp;
    maxA += tmp;

    /* project polygon B onto axis to determine the min/max */
    minB = maxB = other.points[0].x * axis.x + other.points[0].y * axis.y;
    for (i = 1; i < other.getNumberOfSides(); i++)
    {
      tmp = other.points[i].x * axis.x + other.points[i].y * axis.y;
      if (tmp > maxB)
        maxB = tmp;
      else if (tmp < minB)
        minB = tmp;
    }
    /* correct for offset */
    tmp = other.center.x * axis.x + other.center.y * axis.y;
    minB += tmp;
    maxB += tmp;

    /* test if lines intersect, if not, return false */
    if (maxA < minB || minA > maxB) {
      return false;
    } else {
      var o = (maxA > maxB ? maxB - minA : maxA - minB);
      if (o < overlap) {
        overlap = o;
          smallest = {x: axis.x, y: axis.y};
      }
    }
  }

  /* test polygon B's sides */
  for (side = 0; side < other.getNumberOfSides(); side++)
  {
    /* get the axis that we will project onto */
    if (side == 0)
    {
      axis.x = other.points[other.getNumberOfSides() - 1].y - other.points[0].y;
      axis.y = other.points[0].x - other.points[other.getNumberOfSides() - 1].x;
    }
    else
    {
      axis.x = other.points[side - 1].y - other.points[side].y;
      axis.y = other.points[side].x - other.points[side - 1].x;
    }

    /* normalize the axis */
    tmp = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
    axis.x /= tmp;
    axis.y /= tmp;

    /* project polygon A onto axis to determine the min/max */
    minA = maxA = this.points[0].x * axis.x + this.points[0].y * axis.y;
    for (i = 1; i < this.getNumberOfSides(); i++)
    {
      tmp = this.points[i].x * axis.x + this.points[i].y * axis.y;
      if (tmp > maxA)
        maxA = tmp;
      else if (tmp < minA)
        minA = tmp;
    }
    /* correct for offset */
    tmp = this.center.x * axis.x + this.center.y * axis.y;
    minA += tmp;
    maxA += tmp;

    /* project polygon B onto axis to determine the min/max */
    minB = maxB = other.points[0].x * axis.x + other.points[0].y * axis.y;
    for (i = 1; i < other.getNumberOfSides(); i++)
    {
      tmp = other.points[i].x * axis.x + other.points[i].y * axis.y;
      if (tmp > maxB)
        maxB = tmp;
      else if (tmp < minB)
        minB = tmp;
    }
    /* correct for offset */
    tmp = other.center.x * axis.x + other.center.y * axis.y;
    minB += tmp;
    maxB += tmp;

    /* test if lines intersect, if not, return false */
    if (maxA < minB || minA > maxB) {
      return false;
    } else {
      var o = (maxA > maxB ? maxB - minA : maxA - minB);
      if (o < overlap) {
        overlap = o;
          smallest = {x: axis.x, y: axis.y};
      }
    }
  }

  return {"overlap": overlap + 0.001, "axis": smallest};
};


function Vector(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
};
Vector.prototype = {
  negative: function() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
  },
  add: function(v) {
    if (v instanceof Vector) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    } else {
      this.x += v;
      this.y += v;
      this.z += v;
      return new Vector(this.x + v, this.y + v, this.z + v);
    }
  },
  subtract: function(v) {
    if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    else return new Vector(this.x - v, this.y - v, this.z - v);
  },
  multiply: function(v) {
    if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
    else return new Vector(this.x * v, this.y * v, this.z * v);
  },
  divide: function(v) {
    if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
    else return new Vector(this.x / v, this.y / v, this.z / v);
  },
  equals: function(v) {
    return this.x == v.x && this.y == v.y && this.z == v.z;
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
  cross: function(v) {
    return new Vector(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  },
  length: function() {
    return Math.sqrt(this.dot(this));
  },
  unit: function() {
    return this.divide(this.length());
  },
  min: function() {
    return Math.min(Math.min(this.x, this.y), this.z);
  },
  max: function() {
    return Math.max(Math.max(this.x, this.y), this.z);
  },
  toAngles: function() {
    return {
      theta: Math.atan2(this.z, this.x),
      phi: Math.asin(this.y / this.length())
    };
  },
  angleTo: function(a) {
    return Math.acos(this.dot(a) / (this.length() * a.length()));
  },
  toArray: function(n) {
    return [this.x, this.y, this.z].slice(0, n || 3);
  },
  clone: function() {
    return new Vector(this.x, this.y, this.z);
  },
  init: function(x, y, z) {
    this.x = x || 0; this.y = y || 0; this.z = z || 0;
    return this;
  }
};
Vector.cross = function(a, b, c) {
  c.x = a.y * b.z - a.z * b.y;
  c.y = a.z * b.x - a.x * b.z;
  c.z = a.x * b.y - a.y * b.x;
  return c;
};
Vector.unit = function(a, b) {
  var length = a.length();
  b.x = a.x / length;
  b.y = a.y / length;
  b.z = a.z / length;
  return b;
};
Vector.fromAngles = function(theta, phi) {
  return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
};
Vector.randomDirection = function() {
  return Vector.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
};
Vector.min = function(a, b) {
  return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
};
Vector.max = function(a, b) {
  return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
};
Vector.lerp = function(a, b, fraction) {
  return b.subtract(a).multiply(fraction).add(a);
};
Vector.fromArray = function(a) {
  return new Vector(a[0], a[1], a[2]);
};
Vector.angleBetween = function(a, b) {
  return a.angleTo(b);
};


function BluePrint() {
  this.listBox = {};
  this.listLink = {};
  this.OnceID = null;

  this.inUseFunction = false;

  this.div = null;

  this.lastX = 0;
  this.lastY = 0;
  this.isClick = false;
  this.isHover = false;
  this.isValid = ui.HoverCanvas;
  this.index = -1;
  this.PanelCurrentID = -1;

  this.timeOut1 = false;

  this.selected = {
    input: false,
    output: false
  };

  this.sizeGate = 10;

  //==> Constante
  this.OUTPUT_IF = 2;
  this.OUTPUT_FUNCTION = 1;


  //==> COLOR CODE
  this.COLOR = {
    START: '31,31,31',
    FUNCTION: '0,0,255',
    IF: '255,0,0'
  };

  this.execIF = {
    v1: '',
    operator: '',
    v2: ''
  };
};
BluePrint.prototype = {
  Functions: {

    isVisibleEvent: function(Args,name,next) {
      next();
    },
    isOnceEvent: function(Args,name,next) {
      if (typeof player.memory.EventOnce === 'undefined') {
        player.memory.EventOnce = {};
      }
      if (typeof player.memory.EventOnce[bluePrint.OnceID] === 'undefined') {
        if (bluePrint.OnceID != null) {
          memoryManagement.set('%'+bluePrint.OnceID+'%','OK','EventOnce',next);
        } else {
          next();
        }
      }
    },
    isPlayer: function(Args,name,next) {
      if (player.ExecEvent) {
        next();
      }
    },
    isNotPlayer: function(Args,name,next) {
      if (!player.ExecEvent) {
        next();
      }
    },

    Restart: function(Args,name,next) {
      player.ExecEvent = false;
    },
    CallEvent: function(Args,name,next,name,localisation) {
      bluePrint.readBluePrint(Args[0]+'_0',Args[1]);
    },
    Wait: function(Args,name,next,timeInMs) {
      setTimeout(function () {
        next();
      }, parseInt(timeInMs) || 1000);
    },
    LogConsole: function(Args,name,next,text) {
      console.log(Args[0]);
      next();
    },
    Set: function(Args,name,next,PERCENTnamePERCENT,Simon) {
      memoryManagement.set(Args[0],Args[1],name.substring(0,name.lastIndexOf('-')),next);
    },
    SaveProgressionPlayer: function(Args,name,next) {
      //just a simple mysql update ;)
      next();
    },

    Teleport: function(Args,name,next,x,y,map) {
      if (!bluePrint.inUseFunction) {
        bluePrint.inUseFunction = true;
        //proccesing...
        //You have been teleported!!
        if (Args[2] == '__BACK__') {
          world.goToMap(true,Args[2],function(){
            player.position.x = parseFloat(Args[0])
            player.position.y = parseFloat(Args[1]);
            world.x = -player.position.x-player.spriteSheet.dx/2;
            world.y = -player.position.y-player.spriteSheet.dy/2;
            setTimeout(function () {
              bluePrint.inUseFunction = false;
              next();
            },500);
          });
        } else if (Args[2] != '') {
          world.goToMap(false,Args[2],function(){
            player.position.x = parseFloat(Args[0])
            player.position.y = parseFloat(Args[1]);
            world.x = -player.position.x-player.spriteSheet.dx/2;
            world.y = -player.position.y-player.spriteSheet.dy/2;
            setTimeout(function () {
              bluePrint.inUseFunction = false;
              next();
            },500);
          });
        } else {
          player.position.x = parseFloat(Args[0])
          player.position.y = parseFloat(Args[1]);
          world.x = -player.position.x-player.spriteSheet.dx/2;
          world.y = -player.position.y-player.spriteSheet.dy/2;
          setTimeout(function () {
            bluePrint.inUseFunction = false;
            next();
          },500);
        }
      }
    },
    Achievement: function(Args,name,next,id_achievement) {
      if (document.getElementById('BluePrint_Achievement')) {
        $('#BluePrint_Achievement').remove();
        try {
          clearTimeout(bluePrint.timeOut1);
        } catch(e) {}
      }
      socket.SetMysql({
        mode: 'SELECTw',
        table: 'achievements',
        where: 'idAchievement',
        whereValue: Args[0]
      }, function(data) {
        if (data.length > 0) {
          $('#EditorJaaJContainer').append('<div id="BluePrint_Achievement" class="BluePrint-Achievement"><div class="BluePrint_Achievement_Icon"><i class="fas fa-trophy"></i></div><span class="BluePrint_Achievement_Message">'+data[0].message+'</span></div>');
          bluePrint.timeOut1 = setTimeout(function () {
            $('#BluePrint_Achievement').remove();
            next();
          }, 7100);
        }
      });
    },
    NPCdialog: function(
      Args,
      name,
      next,
      Title_Text,
        Text,
        Font,
        CenterX,
        CenterY,
        Margin,
        CutWord,
      BR_1,
      Title_Size,
        Width,
        Height,
      BR_2,
      Title_Color,
        Text_Color,
        Background_Color,
      BR_3,
      Title_Border,
        Border_Size,
        Border_Color,
        Border_Radius,
      BR_4,
      Title_Animation,
        incrementText,
        incrementEndOnClick,
        Speed,
      BR_5,
      Title_Next_Arrow,
        Display,
        Size,
        Color,
        Margin,
      BR_6,
      Title_NPC_Arrow,
        Display,
        Size,
        Position,
        Delta,
      BR_7,
      Title_Time,
        Time_A_Live
      ) {


        var id = name.substring(0,name.lastIndexOf('-'));
        var mob = '';
        for (var i in world.ObjectMob) {
          if (world.ObjectMob.hasOwnProperty(i)) {
            if (world.ObjectMob[i].id == id) {
              mob = world.ObjectMob[i];
              break;
            }
          }
        }

        var settings = {};

        if (Args[0] != '') {
          settings.text = Args[0];
        }
        if (Args[1] != '') {
          settings.font = Args[1];
        }
        if (Args[2] != '') {
          settings.centerX = Args[2];
        }
        if (Args[3] != '') {
          settings.centerY = Args[3];
        }
        if (Args[4] != '') {
          settings.margin = Args[4];
        }
        if (Args[5] != '') {
          settings.cutWord = Args[5];
        }
        if (Args[6] != '') {
          settings.width = Args[6];
        }
        if (Args[7] != '') {
          settings.height = Args[7];
        }
        if (Args[8] != '') {
          settings.color = Args[8];
        }
        if (Args[9] != '') {
          settings.fillStyle = Args[9];
        }
        if (Args[10] != '') {
          settings.lineWidth = Args[10];
        }
        if (Args[11] != '') {
          settings.strokeStyle = Args[11];
        }
        if (Args[12] != '') {
          settings.radius = Args[12];
        }
        if (Args[13] != '') {
          if (typeof settings.animation == 'undefined') {settings.animation = {};}
          settings.animation.incrementText = Args[13];
        }
        if (Args[14] != '') {
          if (typeof settings.animation == 'undefined') {settings.animation = {};}
          settings.animation.incrementEndOnClick = Args[14];
        }
        if (Args[15] != '') {
          if (typeof settings.animation == 'undefined') {settings.animation = {};}
          settings.animation.speed = Args[15];
        }
        if (Args[16] != '') {
          if (typeof settings.nextArrow == 'undefined') {settings.nextArrow = {};}
          settings.nextArrow.display = Args[16];
        }
        if (Args[17] != '') {
          if (typeof settings.nextArrow == 'undefined') {settings.nextArrow = {};}
          settings.nextArrow.size = Args[17];
        }
        if (Args[18] != '') {
          if (typeof settings.nextArrow == 'undefined') {settings.nextArrow = {};}
          settings.nextArrow.color = Args[18];
        }
        if (Args[19] != '') {
          if (typeof settings.nextArrow == 'undefined') {settings.nextArrow = {};}
          settings.nextArrow.margin = Args[19];
        }
        if (Args[20] != '') {
          if (typeof settings.npcArrow == 'undefined') {settings.npcArrow = {};}
          settings.npcArrow.display = Args[20];
        }
        if (Args[21] != '') {
          if (typeof settings.npcArrow == 'undefined') {settings.npcArrow = {};}
          settings.npcArrow.size = Args[21];
        }
        if (Args[22] != '') {
          if (typeof settings.npcArrow == 'undefined') {settings.npcArrow = {};}
          settings.npcArrow.position = Args[22];
        }
        if (Args[23] != '') {
          if (typeof settings.npcArrow == 'undefined') {settings.npcArrow = {};}
          settings.npcArrow.delta = Args[23];
        }
        if (Args[24] != '') {
          settings.timeAlive = Args[24];
        }

        if (typeof settings.npcArrow == 'undefined') {settings.npcArrow = {};}
        if (typeof mob == 'object') {
          settings.id = mob.id;
          settings.x = mob.position.x - (settings.width || 200)/2 + mob.gw/2;
          settings.y = mob.position.y - (settings.height || 100) - (settings.npcArrow.size || 20) - 5;
        }

        new NPCdialog(settings,function(){
          next();
        });

    },
    FightJaaJ: function(
        Args,
        name,
        next
      ) {


      var fightMode = parseInt(Args[0]);
      if (!(fightMode >= 0)) fightMode = 0;
      var LandScape = Args[1];

      try {
        var Items = Args[2];
      } catch(e) {
        var Items = [];
      }

      var Jaajs = Args[3];
      for (var i in Jaajs) {
        if (Jaajs.hasOwnProperty(i)) {
          try {
            Jaajs[i].EV = JSON.parse(Jaajs[i].EV);
          } catch(e) {
            Jaajs[i].EV = [0,0,0];
          }
          try {
            Jaajs[i].IV = JSON.parse(Jaajs[i].IV);
          } catch(e) {
            Jaajs[i].IV = [0,0,0];
          }
          try {
            Jaajs[i].listAttack = JSON.parse(Jaajs[i].listAttack);
          } catch(e) {
            Jaajs[i].listAttack = [0,0,0];
          }
          if (Jaajs[i].name == 'null' || Jaajs[i].name == '') {
            delete Jaajs[i].name;
          }
          if (!parseInt(Jaajs[i].lvl)) {
            Jaajs[i].lvl = 1;
          }
          Jaajs[i].exp = (new FightAlgorithm(null)).getExp(parseInt(Jaajs[i].lvl));
          delete Jaajs[i].lvl;
        }
      }


      new SystemFight(player.memory,{
        name:'lol',
        jaajs:Jaajs,
        items:Items
      },fightMode,LandScape,function(data){
        for (var i = 0; i < player.memory.jaajs.length; i++) {
          player.memory.jaajs[i].hp = data.jaajs[i].hp;
          player.memory.jaajs[i].exp = data.jaajs[i].exp;
        }
        next();
      });

    },

    Cinematic_Enable_BlackBar: function(Args,name,next) {
      cinematic.enable();
      setTimeout(function () {
        next();
      }, 1000);
    },
    Cinematic_Enable_Game: function(Args,name,next) {
      cinematic.enableGame();
      next();
    },
    Cinematic_Enable_Controlers: function(Args,name,next) {
      cinematic.enableControlers();
      next();
    },
    Cinematic_Disable_BlackBar: function(Args,name,next) {
      cinematic.disable();
      setTimeout(function () {
        next();
      }, 1000);
    },
    Cinematic_Disable_Game: function(Args,name,next) {
      cinematic.disableGame();
      next();
    },
    Cinematic_Disable_Controlers: function(Args,name,next) {
      cinematic.disableControlers();
      next();
    },
    Cinematic_MoveCameraTo: function(Args,name,next,position,x,y,timeInMs){
      cinematic.MoveCameraTo(Args[0],Args[1],Args[2],Args[3],next);
    },
    Cinematic_MoveEntityTo: function(Args,name,next,EntityID,position,x,y,timeInMs){
      cinematic.MoveEntityTo(Args[0],Args[1],Args[2],Args[3],Args[4],next);
    },
    Cinematic_addText: function(
        Args,name,next,
        Title_Text,
        x,
        y,
        text,
        anchorY,
        textBaseline,
        textAlign,
        color,
        fontSize,
        fontFamily,
        width,
        BR_1,
        Title_Global_Animation,
        cut,
        cutWord,
        time,
        BR_2,
        Title_Animation_Start,
        animation,
        animationData,
        animationTime,
        BR_3,
        Title_Animation_End,
        animationEnd,
        animationDataEnd,
        animationTimeEnd
      ) {
      var obj = {
                       x:Args[0] || null,
                       y:Args[1] || null,
                    text:Args[2] || null,
                 anchorY:Args[3] || null,
            textBaseline:Args[4] || null,
               textAlign:Args[5] || null,
                   color:Args[6] || null,
                fontSize:Args[7] || null,
              fontFamily:Args[8] || null,
                   width:Args[9] || null,

                     cut:Args[10] || null,
                 cutWord:Args[11] || null,
                    time:parseFloat(Args[12]) || null,


               animation:Args[13] || null,
           animationData:JSON.parse(Args[14].replace(/[\,]/g,'","').replace(/[\{]/g,'{"').replace(/[\:]/g,'":"').replace(/[\}]/g,'"}')) || null,
           animationTime:parseFloat(Args[15]) || null,

            animationEnd:Args[16] || null,
        animationDataEnd:JSON.parse(Args[17].replace(/[\,]/g,'","').replace(/[\{]/g,'{"').replace(/[\:]/g,'":"').replace(/[\}]/g,'"}')) || null,
        animationTimeEnd:parseFloat(Args[18]) || null
      };
      obj = cleanObjectFromJSON(obj);
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] == '' || obj[key] == 'null' || obj[key] == null) {
            obj[key] = null;
            delete obj[key];
          } else if (key.replace('animation','') == key) {
            obj[key] = obj[key]+'';
          }
        }
      }
      if (typeof obj['time'] !== 'undefined') obj['time'] = parseFloat(obj['time']);
      cinematic.addTextSubtile(obj,next);
    }
  },
  create: function() {
    var _this = this;
    this.div = ui.window.open({
      type: 'normal',
      id: 'BluePrint',
      title: 'BluePrint',
      shadowColor: '#00B9FF',
      closeb: true,
      openb: true,
      bodyStyle: 'overflow: hidden;',
      x: canvas.width/2-(canvas.width*50/100)/2,
      y: canvas.height/2-(canvas.height*70/100)/2,
      w: canvas.width*50/100,
      h: canvas.height*70/100,
      onopen: function(id) {
        var SELECT_HTML = '<option data-arguments="0">None</option>';
        for (var f in _this.Functions) {
          if (_this.Functions.hasOwnProperty(f)) {
            SELECT_HTML += '<option data-arguments="'+_this.Functions[f].length+'">'+f+'</option>';
          }
        }
        $('#'+id).append(
          '<div id="'+id+'_Panel_Function" class="BluePrint-Panel">'+
            '<h1>FUNCTION</h1>'+
            '<span class="BluePrint-Panel-Close" onclick="$(this).parent().css(\'top\',\'-100%\')"><i class="fa fa-times" aria-hidden="true"></i></span>'+
            '<select id="FunctionSelect" class="BluePrint-Select BluePrint-Center">'+SELECT_HTML+'</select><br /><br />'+
            '<div id="FunctionArguments" class="BluePrint-Center"></div><br /><br />'+
            '<button class="BluePrint-Button" id="FunctionConfirm">Confirmer</button>'+
          '</div>'+
          '<div id="'+id+'_Panel_If" class="BluePrint-Panel">'+
            '<h1>IF</h1>'+
            '<span class="BluePrint-Panel-Close" onclick="$(this).parent().css(\'top\',\'-100%\')"><i class="fa fa-times" aria-hidden="true"></i></span>'+
            '<input class="BluePrint-IF-v1" placeholder="%player.name%" />'+
            '<select class="BluePrint-Select BluePrint-IF-Select">'+
              '<option>==</option>'+
              '<option>!=</option>'+
              '<option>>=</option>'+
              '<option><=</option>'+
              '<option>></option>'+
              '<option><</option>'+
            '</select>'+
            '<input class="BluePrint-IF-v2" placeholder="Flammrock" />'+
            '<br /><br />'+
            '<button class="BluePrint-Button" id="IfConfirm">Confirmer</button>'+
          '</div>'
        );
        $('#FunctionConfirm').click(function(event){
          var _arguments = [];
          if (_this.tmpName == 'FightJaaJ' && $($('#FunctionArguments').find('input')[0]).val() == 'personnalise') {
            _arguments.push($('.BluePrint-SlectMode').val());
            _arguments.push($('.BluePrint-Landsacpe').val());
            if ($($('#FunctionArguments').find('input')[1]).val() == '0') {
              var jaajList = [];
              for (var i = 0; i < $('.BluePrint-Hide-0-Jaaj').find('.BluePrint-Hide-0-JaajObj').length; i++) {
                var obj = {};
                for (var j = 0; j < $($('.BluePrint-Hide-0').find('.BluePrint-Hide-0-JaajObj')[i]).find('.BluePrint-Input').length; j++) {
                  var current = $($($('.BluePrint-Hide-0').find('.BluePrint-Hide-0-JaajObj')[i]).find('.BluePrint-Input')[j]);
                  if (current.attr('name') != 'undefined') {
                    obj[current.attr('name')] = current.val();
                  }
                }
                jaajList.push(obj);
              }
              _arguments.push($('.BluePrint-Items0').val());
              _arguments.push(jaajList);
            } else {
              var jaajList = [];
              for (var i = 0; i < $('.BluePrint-Hide-1-Jaaj').find('.BluePrint-Hide-1-JaajObj').length; i++) {
                var obj = {};
                for (var j = 0; j < $($('.BluePrint-Hide-1').find('.BluePrint-Hide-1-JaajObj')[i]).find('.BluePrint-Input').length; j++) {
                  var current = $($($('.BluePrint-Hide-1').find('.BluePrint-Hide-1-JaajObj')[i]).find('.BluePrint-Input')[j]);
                  if (current.attr('name') != 'undefined') {
                    obj[current.attr('name')] = current.val();
                  }
                }
                jaajList.push(obj);
              }
              _arguments.push($('.BluePrint-Items1').val());
              _arguments.push(jaajList);
            }
          } else {
            for (var i = 0; i < $('#FunctionArguments').find('input').length; i++) {
              _arguments.push($($('#FunctionArguments').find('input')[i]).val() == 'null' ? '' : $($('#FunctionArguments').find('input')[i]).val());
            }
          }
          _this.listBox[_this.PanelCurrentID].data = {
            _arguments: _arguments,
            _fn: _this.tmpName
          };
          $(this).parent().css('top','-100%');
        });
        $('#FunctionSelect').change(function(event){
          var name = $(this).val();
          var length = parseFloat($(this).find(':selected').data('arguments'));
          _this.tmpName = name;
          var INPUT_HTML = '';
          if (name == 'FightJaaJ') {
            INPUT_HTML +=
              'Settings:<br />'+
              '<input type="hidden" value="personnalise" />'+
              '<input type="text" class="BluePrint-Input BluePrint-SlectMode" placeholder="ModeFight (1 for Fight versus Trainer and 0 for Fight versus a savage JaaJ)" />'+
              '<input type="text" class="BluePrint-Input BluePrint-Landsacpe" placeholder="LandScape (Go to Menu Create>LandScapes List)" />'+
              '<br /><br />'+
              '<div class="BluePrint-Hide-0" style="display: none;">'+
                '(Fight Versus Savage JaaJ)<br /><br />'+
                'Jaajs:<br />'+
                '<div class="BluePrint-Hide-0-Jaaj"></div>'+
                '<input type="button" class="BluePrint-AddJaaj" value="add Jaaj!" /><br /><br />'+
                'Items:<br />'+
                '<input type="text" class="BluePrint-Input BluePrint-Items0" placeholder="listItem (Array like : [ItemId1,ItemId2,...])" />'+
              '</div>'+
              '<div class="BluePrint-Hide-1" style="display: none;">'+
                '(Fight Versus Trainer)<br /><br />'+
                'Jaajs:<br />'+
                '<div class="BluePrint-Hide-1-Jaaj"></div>'+
                '<input type="button" class="BluePrint-AddJaaj1" value="add Jaaj!" /><br /><br />'+
                'Items:<br />'+
                '<input type="text" class="BluePrint-Input BluePrint-Items1" placeholder="listItem (Array like : [ItemId1,ItemId2,...])" />'+
              '</div>';
            $('#FunctionArguments').html(INPUT_HTML);
            $('.BluePrint-AddJaaj').click(function(){
              $('.BluePrint-Hide-0-Jaaj').append(
                '<div class="BluePrint-Hide-0-JaajObj">'+
                'Jaaj #<span class="BluePrint-Hide-0-JaajObj-id">'+($('.BluePrint-Hide-0-JaajObj').length+1)+'</span><input type="button" class="BluePrint-DeleteJaaj" value="Delete this JaaJ!" /><br />'+
                  '<input type="text" name="name" class="BluePrint-Input" placeholder="Name (null = originalName)" />'+
                  '<input type="text" name="id" class="BluePrint-Input" placeholder="jaajId" />'+
                  '<input type="text" name="evolutionLvl" class="BluePrint-Input" placeholder="evolutionId" />'+
                  '<input type="text" name="lvl" class="BluePrint-Input" placeholder="Lvl" />'+
                  '<input type="text" name="IV" class="BluePrint-Input" placeholder="IV (Array like : [NumberAttack,NumberDefense,NumberSpeed])" />'+
                  '<input type="text" name="EV" class="BluePrint-Input" placeholder="EV (Array like : [NumberAttack,NumberDefense,NumberSpeed])" />'+
                  '<input type="text" name="listAttack" class="BluePrint-Input" placeholder="listAttack (Array like : [AttackId1,AttackId2,...])" />'+
                '<br /><br /></div>'
              );
              $('.BluePrint-DeleteJaaj').click(function(){
                $(this).parent().remove();
                $('.BluePrint-Hide-0-JaajObj-id').each(function(index){
                  $(this).html(index+1);
                });
              });
            });
            $('.BluePrint-AddJaaj1').click(function(){
              $('.BluePrint-Hide-1-Jaaj').append(
                '<div class="BluePrint-Hide-1-JaajObj">'+
                'Jaaj #<span class="BluePrint-Hide-1-JaajObj-id">'+($('.BluePrint-Hide-1-JaajObj').length+1)+'</span><input type="button" class="BluePrint-DeleteJaaj" value="Delete this JaaJ!" /><br />'+
                  '<input type="text" name="name" class="BluePrint-Input" placeholder="Name (null = originalName)" />'+
                  '<input type="text" name="id" class="BluePrint-Input" placeholder="jaajId" />'+
                  '<input type="text" name="evolutionLvl" class="BluePrint-Input" placeholder="evolutionId" />'+
                  '<input type="text" name="lvl" class="BluePrint-Input" placeholder="Lvl" />'+
                  '<input type="text" name="IV" class="BluePrint-Input" placeholder="IV (Array like : [NumberAttack,NumberDefense,NumberSpeed])" />'+
                  '<input type="text" name="EV" class="BluePrint-Input" placeholder="EV (Array like : [NumberAttack,NumberDefense,NumberSpeed])" />'+
                  '<input type="text" name="listAttack" class="BluePrint-Input" placeholder="listAttack (Array like : [AttackId1,AttackId2,...])" />'+
                '<br /><br /></div>'
              );
              $('.BluePrint-DeleteJaaj').click(function(){
                $(this).parent().remove();
                $('.BluePrint-Hide-0-JaajObj-id').each(function(index){
                  $(this).html(index+1);
                });
              });
            });
            $('.BluePrint-SlectMode').change(function(){
              if ($(this).val() == '0') {
                $('.BluePrint-Hide-0').css('display','block');
                $('.BluePrint-Hide-1').css('display','none');
              } else if ($(this).val() == '1') {
                $('.BluePrint-Hide-1').css('display','block');
                $('.BluePrint-Hide-0').css('display','none');
              }
            });
          } else {
            for (var i = 3; i < length; i++) {
              var n = (annotate(bluePrint.Functions[name]))[i];
              if (n.substring(0,2) == 'BR') {
                INPUT_HTML += '<br /><br />';
              } else if (n.substring(0,6) == 'Title_') {
                INPUT_HTML += n.substring(6).replace(/_/g,' ')+':<br />';
              } else {
                INPUT_HTML += '<input type="text" class="BluePrint-Input" placeholder="'+n.replace(/_/g,' ')+'" />';
              }
            }
            $('#FunctionArguments').html(INPUT_HTML);
          }
        });
        $('#IfConfirm').click(function(event){
          _this.listBox[_this.PanelCurrentID].data = {
            _condition: {
              v1: $('.BluePrint-IF-v1').val(),
              operator: $('.BluePrint-IF-Select').val(),
              v2: $('.BluePrint-IF-v2').val()
            }
          };
          $(this).parent().css('top','-100%');
        });
        _this.cObj = ui.add.canvas({background: '#1E5CA0', border: '0',width:canvas.width*50/100,height:canvas.height*70/100},{
          id: 'BluePrintCanvas',
          in: id,
          limitSize: false,
          draw: function () {
            if ($('#'+this.in).css('display') != 'none') {
              this.clear();

              _this.drawGrid(this,32,32,0.5,'#4371B1');
              _this.drawGrid(this,64,64,1,'#4371B1');
              _this.drawGrid(this,128,128,2,'#4371B1');

              var rect = this.canvas.getBoundingClientRect();
              this.viewWidth = this.canvas.width/this.zoom;
              this.viewHeight = this.canvas.height/this.zoom;

              var m = {
                x: (mouse.x-rect.left),
                y: (mouse.y-rect.top)
              };
              var x = m.x/this.zoom-(this.x+this.mx+this.viewWidth/2);
              var y = m.y/this.zoom-(this.y+this.my+this.viewHeight/2);
              if (_this.isClick && _this.index >= 0) {
                _this.listBox[_this.index].x = x - _this.lastX;
                _this.listBox[_this.index].y = y - _this.lastY;
              }


              var addBoxFUNCTION = _this.drawButton(5,5,200,50,10,'',this,m,true);
              var addBoxIF = _this.drawButton(210,5,200,50,10,'',this,m,true);
              var saveButton = _this.drawButton(this.canvas.width-200-5,5,200,50,10,'',this,m,true);



              _this.isValid = ui.HoverCanvas;

              _this.drawLink(this);
              _this.drawBox(this);

              _this.drawButton(5,5,200,50,10,'Add Function',this,m,false,addBoxFUNCTION,function(){
                _this.add(50,350,200,75,'FUNCTION',1,_this.OUTPUT_FUNCTION);
              });
              _this.drawButton(210,5,200,50,10,'Add If',this,m,false,addBoxIF,function(){
                _this.add(50,350,200,75,'IF',1,_this.OUTPUT_IF);
              });
              _this.drawButton(this.canvas.width-200-5,5,200,50,10,'Save',this,m,false,saveButton,function(){
                _this.save();
              });

              this.ctx.setTransform(1,0,0,1,0,0);
            }
          }
        });
        //var if1 = _this.add(400,-100,200,75,'IF',1,_this.OUTPUT_IF);
        //var if2 = _this.add(800,100,200,75,'FUNCTION',1,_this.OUTPUT_FUNCTION);
        //_this.link(_this.listBox[1],_this.listBox[2],{output:2},{input:1});
      }
    });
  },

  drawGrid: function(c,gw,gh,gl,gc) {
    var ctx = c.ctx;
    var canvas = c.canvas;
    c.viewWidth = canvas.width/c.zoom;
    c.viewHeight = canvas.height/c.zoom;
    var mx = Math.round((c.x+c.mx)%gw);
    var my = Math.round((c.y+c.my)%gh);
    var xx = Math.ceil(((canvas.width/c.zoom)/(gw > canvas.width/3 ? gw/2 : gw))/2)+5;
    var yy = Math.ceil(((canvas.height/c.zoom)/(gh > canvas.height/3 ? gh/2 : gh))/2)+5;
    for (var i = -xx, len = xx; i < len; i++) {
      ctx.beginPath();
      var originX = mx;
      var originY = my;
      originX -= (mouse.ax)/(c.oldScale*c.zoom) - (mouse.ax)/c.scale;
      originY -= (mouse.ay)/(c.oldScale*c.zoom) - (mouse.ay)/c.scale;
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.scale(c.zoom, c.zoom);
      ctx.translate(originX, originY);
      ctx.translate(gw*i,0);
      ctx.moveTo(0,-canvas.height/c.zoom/2-500-gh/2);
      ctx.lineTo(0,canvas.height/c.zoom/2+500+gh/2);
      ctx.strokeStyle = gc;
      ctx.lineWidth = gl;
      ctx.stroke();
      ctx.setTransform(1,0,0,1,0,0);
    }
    for (var i = -yy, len = yy; i < len; i++) {
      ctx.beginPath();
      var originX = mx;
      var originY = my;
      originX -= (mouse.ax)/(c.oldScale*c.zoom) - (mouse.ax)/c.scale;
      originY -= (mouse.ay)/(c.oldScale*c.zoom) - (mouse.ay)/c.scale;
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.scale(c.zoom, c.zoom);
      ctx.translate(originX, originY);
      ctx.translate(0,gh*i);
      ctx.moveTo(-canvas.width/c.zoom/2-500-gw/2,0);
      ctx.lineTo(canvas.width/c.zoom/2+500+gw/2,0);
      ctx.strokeStyle = gc;
      ctx.lineWidth = gl;
      ctx.stroke();
      ctx.setTransform(1,0,0,1,0,0);
    }
    ctx.lineWidth = 1;
  },
  drawBox: function(c) {
    var ctx = c.ctx;
    var canvas = c.canvas;
    if (!mouse.isRightDown) {
      c.mode = 'Move';
    }
    if (!mouse.isLeftDown) {
      this.isClick = false;
    }
    var isAlreadyHover = this.isClick;
    this.isHover = this.isClick;
    var nb = 0;
    for (var i in this.listBox) {
      if (this.listBox.hasOwnProperty(i)) {
        var currentBox = this.listBox[i];
        var originX = c.x+c.mx;
        var originY = c.y+c.my;
        originX -= (mouse.ax)/(c.oldScale*c.zoom) - (mouse.ax)/c.scale;
        originY -= (mouse.ay)/(c.oldScale*c.zoom) - (mouse.ay)/c.scale;
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(c.zoom, c.zoom);
        ctx.translate(originX, originY);

        var rect = canvas.getBoundingClientRect();
        c.viewWidth = canvas.width/c.zoom;
        c.viewHeight = canvas.height/c.zoom;

        var m = {
          x: (mouse.x-rect.left),
          y: (mouse.y-rect.top)
        };
        var x = m.x/c.zoom-(c.x+c.mx+c.viewWidth/2);
        var y = m.y/c.zoom-(c.y+c.my+c.viewHeight/2);

        var isClick = this.isClick;

        ctx.translate(currentBox.x,currentBox.y);

        if (currentBox.type != 'START') {
          ctx.spe2Rect(0,0,currentBox.w,currentBox.h,10,30,10);
        } else {
          ctx.roundRect(0,0,currentBox.w,currentBox.h,10);
        }

        var hoverV = 1;
        var nHoverV = 0.8;
        var hovers = isAlreadyHover;
        //x > currentBox.x && y > currentBox.y && x < currentBox.x+currentBox.w && y < currentBox.y+currentBox.h
        if (ctx.isPointInPath(m.x,m.y) && !isAlreadyHover && this.isValid) {
          c.mode = 'notMove';
          isAlreadyHover = true;
          this.isHover = true;
          ctx.fillStyle = 'rgba('+this.COLOR[currentBox.type]+','+hoverV+')';
          if (mouse.isLeftDown) {
            if (this.isClick == nb || !this.isClick) {
              this.lastX = x - currentBox.x;
              this.lastY = y - currentBox.y;
              this.isClick = nb;
              isClick = true;
              this.index = i;
            }
          } else {
            isClick = false;
          }
        } else {
          ctx.fillStyle = 'rgba('+this.COLOR[currentBox.type]+','+nHoverV+')';
        }
        ctx.fill();

        if (currentBox.type == 'START') {
          ctx.font = '80px sans-serif';
          ctx.textAlign = "center";
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.fillText('START',currentBox.w/2,currentBox.h/2);
        }
        for (var j in currentBox.input) {
          if (currentBox.input.hasOwnProperty(j)) {
            this.drawGate(ctx,currentBox,'input',j,i,'output',x,y,currentBox.type=='START'?this.isClick:!this.isClick);
          }
        }
        for (var j in currentBox.output) {
          if (currentBox.output.hasOwnProperty(j)) {
            this.drawGate(ctx,currentBox,'output',j,i,'input',x,y,currentBox.type=='START'?this.isClick:!this.isClick);
          }
        }

        if (typeof currentBox.data != 'undefined') {
          if (currentBox.type == 'FUNCTION') {
            ctx.font = '25px sans-serif';
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillText(currentBox.data._fn,currentBox.w/2,currentBox.h/2);
            ctx.font = '14px sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            var args = [];
            for (var ww in currentBox.data._arguments) {
              if (currentBox.data._arguments.hasOwnProperty(ww)) {
                if (currentBox.data._arguments[ww] == "") {args.push('null');} else {args.push(currentBox.data._arguments[ww]);}
              }
            }
            ctx.fillText(args.join(', ').replace(/null/g,'""'),currentBox.w/2,currentBox.h/2+25);
          } else if (currentBox.type == 'IF') {
            ctx.font = '18px sans-serif';
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillText(currentBox.data._condition.v1+' '+currentBox.data._condition.operator+' '+currentBox.data._condition.v2,currentBox.w/2,currentBox.h/2);
            ctx.font = '14px sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
          }
        }


        //CLOSE BUTTON
        if (currentBox.type != 'START') {
          ctx.translate(currentBox.w - 30, - 30);
          ctx.beginPath();
          ctx.rect(0,0,30-5,30-5);
          if (ctx.isPointInPath(m.x,m.y) && !hovers) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            if (mouse.isLeftDown) {
              mouse.isLeftDown = false;
              this.remove(i);
            }
          } else {
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1;
          }
          ctx.beginPath();
          ctx.moveTo(5,5);
          ctx.lineTo(30-5,30-5);
          ctx.moveTo(30-5,5);
          ctx.lineTo(5,30-5);
          ctx.stroke();
          ctx.translate(-currentBox.w + 30,30);
        }
        //END CLOSE BUTTON


        //OPTION BUTTON
        if (currentBox.type != 'START') {
          ctx.translate(currentBox.w - 30 * 2 - 10, - 30);
          ctx.beginPath();
          ctx.rect(0,0,30-5,30-5);
          ctx.strokeStyle = 'rgba(0,0,0,0)';
          if (ctx.isPointInPath(m.x,m.y) && !hovers) {
            ctx.fillStyle = '#fff';
            if (mouse.isLeftDown) {
              mouse.isLeftDown = false;
              //OPEN PANEL OPTION FOR [TYPE]
              this.panel(currentBox.type,i,c,currentBox);
            }
          } else {
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
          }
          ctx.translate(2,2);
          ctx.beginPath();
          ctx.scale(2,2);
          ctx.Icons('gear');
          ctx.fill();
          ctx.stroke();
        }
        //END OPTION BUTTON

        ctx.lineWidth = 1;
        ctx.setTransform(1,0,0,1,0,0);
        nb++;
      }
    }
  },
  drawLink: function(c) {
    var ctx = c.ctx;
    var canvas = c.canvas;

    var rect = canvas.getBoundingClientRect();
    c.viewWidth = canvas.width/c.zoom;
    c.viewHeight = canvas.height/c.zoom;

    var m = {
      x: (mouse.x-rect.left),
      y: (mouse.y-rect.top)
    };
    var x = m.x/c.zoom-(c.x+c.mx+c.viewWidth/2);
    var y = m.y/c.zoom-(c.y+c.my+c.viewHeight/2);

    var alreadyHover = this.isHover;

    for (var i in this.listLink) {
      if (this.listLink.hasOwnProperty(i)) {
        var currentLink = this.listLink[i];

        var originX = c.x+c.mx;
        var originY = c.y+c.my;
        originX -= (mouse.ax)/(c.oldScale*c.zoom) - (mouse.ax)/c.scale;
        originY -= (mouse.ay)/(c.oldScale*c.zoom) - (mouse.ay)/c.scale;

        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(c.zoom, c.zoom);
        ctx.translate(originX, originY);

        var startX = currentLink.from.x+currentLink.from[(Object.keys(currentLink.fromID))[0]][parseInt(currentLink.fromID[(Object.keys(currentLink.fromID))[0]])-1].x,
            startY = currentLink.from.y+currentLink.from[(Object.keys(currentLink.fromID))[0]][parseInt(currentLink.fromID[(Object.keys(currentLink.fromID))[0]])-1].y,
            endX = currentLink.to.x+currentLink.to[(Object.keys(currentLink.toID))[0]][parseInt(currentLink.toID[(Object.keys(currentLink.toID))[0]])-1].x,
            endY = currentLink.to.y+currentLink.to[(Object.keys(currentLink.toID))[0]][parseInt(currentLink.toID[(Object.keys(currentLink.toID))[0]])-1].y;

        var d = Math.sqrt((endX-startX)*(endX-startX)+(endY-startY)*(endY-startY));

        var mouseInPath = false;
        var hover = alreadyHover;

        ctx.beginPath();
        ctx.lineWidth = 1/c.zoom;
        ctx.moveTo(startX,startY);
        ctx.quadraticCurveTo(startX+1/6*d,(endY+startY)/2,(endX+startX)/2,(endY+startY)/2);
        ctx.moveTo(endX,endY);
        ctx.quadraticCurveTo(endX-1/6*d,(endY+startY)/2,(endX+startX)/2,(endY+startY)/2);
        if (ctx.isPointInPath(m.x,m.y) && !alreadyHover && this.isValid) {
          alreadyHover = true;
          ctx.strokeStyle = 'rgba(255,255,255,0.9)';
          ctx.lineWidth = 4/c.zoom;
          mouseInPath = true;
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        }
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.setTransform(1,0,0,1,0,0);
        if (mouseInPath && mouse.isLeftDown && !this.isClick && !this.isHover && !hover && this.isValid) {
          mouse.isLeftDown = false;
          this.unlink(i);
          this.selected = {
            input: false,
            output: false
          };
        }
      }
    }
  },
  drawGate: function(ctx,Obj,type,j,i,a,x,y,m) {
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.arc(Obj[type][j].x,Obj[type][j].y,Obj.radius,0,2*Math.PI,false);
    var dx = Obj.x + Obj[type][j].x - x;
    var dy = Obj.y + Obj[type][j].y - y;
    var dist = Math.sqrt(dx*dx+dy*dy);
    var isLink = Obj[type][j].isLink ? '255,143,0' : '255,255,255';
    if (dist < Obj.radius && !m && this.isValid) {
      ctx.fillStyle = 'rgb('+isLink+')';
      if (mouse.isLeftDown) {
        mouse.isLeftDown = false;
        ctx.fillStyle = 'rgb(255,255,0)';
        var checkConnect = false;
        if (this.selected[type]) {
          if (this.selected[type].idBox == i && this.selected[type].id == parseInt(j)+1) {
            this.selected[type] = false;
          } else {
            this.selected[type] = {box:Obj,idBox:i,id:parseInt(j)+1};
            checkConnect = true;
          }
        } else {
          if (this.selected[a]) {
            if (this.selected[a].idBox != i) {
              this.selected[type] = {box:Obj,idBox:i,id:parseInt(j)+1};
              checkConnect = true;
            }
          } else {
            this.selected[type] = {box:Obj,idBox:i,id:parseInt(j)+1};
            checkConnect = true;
          }
        }
        if (checkConnect) {
          if (this.selected[type] && this.selected[a]) {
            this.link(this.selected['output'].box,this.selected['input'].box,{output:this.selected['output'].id},{input:this.selected['input'].id});
            this.selected = {
              input: false,
              output: false
            };
          }
        }
      }
    } else if (Obj[type][j].isLink) {
      ctx.fillStyle = 'rgb(255,255,0)';
    }
    if (this.selected[type]) {
      if (this.selected[type].idBox == i && this.selected[type].id == j+1) {
        ctx.fillStyle = 'rgb(255,255,0)';
      }
    }
    ctx.strokeStyle = '#ddd';
    ctx.fill();
    ctx.stroke();
  },
  drawButton: function(x,y,w,h,r,text,_this,m,check,b,callback) {
    if (check) {
      var Click = false;
      var Hover = false;
      _this.ctx.beginPath();
      _this.ctx.roundRect(x,y,w,h,r);
      if (_this.ctx.isPointInPath(m.x,m.y) && ui.HoverCanvas) {
        _this.isHover = true;
        Hover = true;
        if (mouse.isLeftDown) {
          mouse.isLeftDown = false;
          Click = true;
        }
      }
      return {Click:Click,Hover:Hover};
    } else {
      _this.ctx.beginPath();
      _this.ctx.roundRect(x,y,w,h,r);
      var fillTextColor = 'rgba(255,255,255,0.5)';
      if (b.Hover || b.Click) {
        fillTextColor = '#fff';
        _this.ctx.strokeStyle = '#222';
        _this.ctx.fillStyle = '#333';
      } else {
        _this.ctx.strokeStyle = 'rgba(22,22,22,0.5)';
        _this.ctx.fillStyle = 'rgba(33,33,33,0.5)';
      }
      _this.ctx.stroke();
      _this.ctx.fill();
      _this.ctx.font = '20px sans-serif';
      _this.ctx.textAlign = "center";
      _this.ctx.textBaseline = 'middle';
      _this.ctx.fillStyle = fillTextColor;
      _this.ctx.fillText(text,x + w/2,y + h/2);

      if (b.Click) {
        callback();
      }
    }
  },

  add: function(x,y,w,h,type,input,output) {
    var inputData = [];
    var outputData = [];
    var radius = this.sizeGate;
    var margin = 10;

    var maxGate = input > output ? input : output;
    var minHeight = maxGate * (radius + 2) * 2;
    var minWidth = 4 * radius + 200;

    h = h > minHeight ? h : minHeight;
    w = w > minWidth ? w : minWidth;

    if (type == 'START') {
      for (var j = 0; j < output; j++) {
        outputData.push({id:0,idBox:{},x:((w-(output-1)*Math.round(w/output)))/2+j*Math.round(w/output),y:((h-(output-1)*Math.round(h/output)))/2+j*Math.round(h/output)+50,isLink:false,nbLink:0});
      }
    } else {
      for (var j = 0; j < input; j++) {
        inputData.push({id:j,idBox:{},x:radius+margin,y:2*radius+((h-(input-1)*Math.round(h/input)))/2+j*Math.round(h/input),isLink:false,nbLink:0});
      }
      for (var j = 0; j < output; j++) {
        outputData.push({id:j,idBox:{},x:w-radius-margin,y:2*radius+((h-(output-1)*Math.round(h/output)))/2+j*Math.round(h/output),isLink:false,nbLink:0});
      }
    }
    var max = Object.keys(this.listBox).length;
    for (var g in this.listBox) {
      if (this.listBox.hasOwnProperty(g)) {
        if (this.listBox[g].id >= max) {max = this.listBox[g].id + 1;}
      }
    }
    this.listBox[max] = {id:max,x:x,y:y,w:w,h:h+(type!='START'?4*radius:0),radius:radius,type:type,input:inputData,output:outputData};
    return {x:x,y:y,w:w,h:h,radius:radius,type:type,input:inputData,output:outputData};
  },
  remove: function(id) {
    for (var i in this.listLink) {
      if (this.listLink.hasOwnProperty(i)) {
        var currentLink = this.listLink[i];
        if (currentLink.from.id == id) {
          this.unlink(i);
        }
        if (currentLink.to.id == id) {
          this.unlink(i);
        }
      }
    }
    this.listBox[id] = null;
    this.index = -1;
    this.isClick = false;
    delete this.listBox[id];
  },

  link: function(box1,box2,id1,id2) {
    try {
      if (!this.existLink(box1,box2,id1,id2)) {
        box1.output[id1.output-1].isLink = true;
        box2.input[id2.input-1].isLink = true;
        box1.output[id1.output-1].nbLink++;
        box2.input[id2.input-1].nbLink++;
        box1.output[id1.output-1].idBox[box2.id] = true;
        box2.input[id2.input-1].idBox[box1.id] = true;
        var max = Object.keys(this.listLink).length;
        for (var g in this.listLink) {
          if (this.listLink.hasOwnProperty(g)) {
            if (this.listLink[g].id >= max) {max = this.listLink[g].id + 1;}
          }
        }
        this.listLink[max] = {id:max,from:box1,to:box2,fromID:id1,toID:id2};
      }
    } catch (e) {}
  },
  unlink: function(id) {
    this.listLink[id]['to']['input'][this.listLink[id]['toID']['input']-1].nbLink--;
    this.listLink[id]['from']['output'][this.listLink[id]['fromID']['output']-1].nbLink--;

    delete this.listLink[id]['from']['output'][this.listLink[id]['fromID']['output']-1].idBox[this.listLink[id]['to'].id];
    delete this.listLink[id]['to']['input'][this.listLink[id]['toID']['input']-1].idBox[this.listLink[id]['from'].id];

    if (this.listLink[id]['to']['input'][this.listLink[id]['toID']['input']-1].nbLink == 0) {
      this.listLink[id]['to']['input'][this.listLink[id]['toID']['input']-1].isLink = false;
    }
    if (this.listLink[id]['from']['output'][this.listLink[id]['fromID']['output']-1].nbLink == 0) {
      this.listLink[id]['from']['output'][this.listLink[id]['fromID']['output']-1].isLink = false;
    }
    this.listLink[id] = null;
    delete this.listLink[id];
  },
  existLink: function(box1,box2,id1,id2) {
    for (var i in this.listLink) {
      if (this.listLink.hasOwnProperty(i)) {
        if (
          this.listLink[i].from.id == box1.id &&
          this.listLink[i].to.id == box2.id &&
          this.listLink[i].fromID.output == id1.output &&
          this.listLink[i].toID.input == id2.input
        ) {
          return true;
        }
      }
    }
    return false;
  },

  isEquivalent: function(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }
    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (typeof a[propName] == 'object' && typeof b[propName] == 'object') {
          var aChildrenProps = Object.getOwnPropertyNames(a[propName]);
          var bChildrenProps = Object.getOwnPropertyNames(b[propName]);
          if (aChildrenProps.length != bChildrenProps.length) {
              return false;
          }
        } else {
          if (a[propName] !== b[propName]) {
              return false;
          }
        }
    }


    // If we made it this far, objects
    // are considered equivalent
    return true;
  },
  reIndexObj: function(a) {
    //maybe use this later...
    var b = {};
    var c = Object.keys(a);
    for (var i = 0; i < Object.keys(b).length; i++) {
      b[i] = a[c[i]];
    }
    return b;
  },

  panel: function(type,id,c,box) {
    this.PanelCurrentID = id;

    if (type == 'FUNCTION' && typeof box.data != 'undefined') {
      if (typeof box.data._fn != 'undefined') {
        var name = box.data._fn;
        if (typeof this.Functions[name] !== 'undefined') {
          var length = this.Functions[name].length;
          this.tmpName = name;
          var INPUT_HTML = '';
          if (name == 'FightJaaJ') {
            INPUT_HTML +=
              'Settings:<br />'+
              '<input type="hidden" value="personnalise" />'+
              '<input type="text" class="BluePrint-Input BluePrint-SlectMode" placeholder="ModeFight (1 for Fight versus Trainer and 0 for Fight versus a savage JaaJ)" />'+
              '<input type="text" class="BluePrint-Input BluePrint-Landsacpe" placeholder="LandScape (Go to Menu Create>LandScapes List)" />'+
              '<br /><br />'+
              '<div class="BluePrint-Hide-0" style="display: none;">'+
                '(Fight Versus Savage JaaJ)<br /><br />'+
                'Jaajs:<br />'+
                '<div class="BluePrint-Hide-0-Jaaj"></div>'+
                '<input type="button" class="BluePrint-AddJaaj" value="add Jaaj!" /><br /><br />'+
                'Items:<br />'+
                '<input type="text" class="BluePrint-Input BluePrint-Items0" placeholder="listItem (Array like : [ItemId1,ItemId2,...])" />'+
              '</div>'+
              '<div class="BluePrint-Hide-1" style="display: none;">'+
                '(Fight Versus Trainer)<br /><br />'+
                'Jaajs:<br />'+
                '<div class="BluePrint-Hide-1-Jaaj"></div>'+
                '<input type="button" class="BluePrint-AddJaaj1" value="add Jaaj!" /><br /><br />'+
                'Items:<br />'+
                '<input type="text" class="BluePrint-Input BluePrint-Items1" placeholder="listItem (Array like : [ItemId1,ItemId2,...])" />'+
              '</div>';
            $('#FunctionArguments').html(INPUT_HTML);
            $('.BluePrint-AddJaaj').click(function(){
              $('.BluePrint-Hide-0-Jaaj').append(
                '<div class="BluePrint-Hide-0-JaajObj">'+
                'Jaaj #<span class="BluePrint-Hide-0-JaajObj-id">'+($('.BluePrint-Hide-0-JaajObj').length+1)+'</span><input type="button" class="BluePrint-DeleteJaaj" value="Delete this JaaJ!" /><br />'+
                  '<input type="text" name="name" class="BluePrint-Input" placeholder="Name (null = originalName)" />'+
                  '<input type="text" name="id" class="BluePrint-Input" placeholder="jaajId" />'+
                  '<input type="text" name="evolutionLvl" class="BluePrint-Input" placeholder="evolutionId" />'+
                  '<input type="text" name="lvl" class="BluePrint-Input" placeholder="Lvl" />'+
                  '<input type="text" name="IV" class="BluePrint-Input" placeholder="IV (Array like : [NumberAttack,NumberDefense,NumberSpeed])" />'+
                  '<input type="text" name="EV" class="BluePrint-Input" placeholder="EV (Array like : [NumberAttack,NumberDefense,NumberSpeed])" />'+
                  '<input type="text" name="listAttack" class="BluePrint-Input" placeholder="listAttack (Array like : [AttackId1,AttackId2,...])" />'+
                '<br /><br /></div>'
              );
              $('.BluePrint-DeleteJaaj').click(function(){
                $(this).parent().remove();
                $('.BluePrint-Hide-0-JaajObj-id').each(function(index){
                  $(this).html(index+1);
                });
              });
            });
            $('.BluePrint-AddJaaj1').click(function(){
              $('.BluePrint-Hide-1-Jaaj').append(
                '<div class="BluePrint-Hide-1-JaajObj">'+
                'Jaaj #<span class="BluePrint-Hide-1-JaajObj-id">'+($('.BluePrint-Hide-1-JaajObj').length+1)+'</span><input type="button" class="BluePrint-DeleteJaaj" value="Delete this JaaJ!" /><br />'+
                  '<input type="text" name="name" class="BluePrint-Input" placeholder="Name (null = originalName)" />'+
                  '<input type="text" name="id" class="BluePrint-Input" placeholder="jaajId" />'+
                  '<input type="text" name="evolutionLvl" class="BluePrint-Input" placeholder="evolutionId" />'+
                  '<input type="text" name="lvl" class="BluePrint-Input" placeholder="Lvl" />'+
                  '<input type="text" name="IV" class="BluePrint-Input" placeholder="IV (Array like : [NumberAttack,NumberDefense,NumberSpeed])" />'+
                  '<input type="text" name="EV" class="BluePrint-Input" placeholder="EV (Array like : [NumberAttack,NumberDefense,NumberSpeed])" />'+
                  '<input type="text" name="listAttack" class="BluePrint-Input" placeholder="listAttack (Array like : [AttackId1,AttackId2,...])" />'+
                '<br /><br /></div>'
              );
              $('.BluePrint-DeleteJaaj').click(function(){
                $(this).parent().remove();
                $('.BluePrint-Hide-0-JaajObj-id').each(function(index){
                  $(this).html(index+1);
                });
              });
            });
            $('.BluePrint-SlectMode').change(function(){
              if ($(this).val() == '0') {
                $('.BluePrint-Hide-0').css('display','block');
                $('.BluePrint-Hide-1').css('display','none');
              } else if ($(this).val() == '1') {
                $('.BluePrint-Hide-1').css('display','block');
                $('.BluePrint-Hide-0').css('display','none');
              }
            });
          } else {
            var a = 0;
            for (var i = 3; i < length; i++) {
              var n = (annotate(bluePrint.Functions[name]))[i];
              if (n.substring(0,2) == 'BR') {
                INPUT_HTML += '<br /><br />';
              } else if (n.substring(0,6) == 'Title_') {
                INPUT_HTML += n.substring(6).replace(/_/g,' ')+':<br />';
              } else {
                INPUT_HTML += '<input type="text" class="BluePrint-Input" placeholder="'+n.replace(/_/g,' ')+'" value="'+box.data._arguments[a]+'" />';
                a++;
              }
            }
            $('#FunctionArguments').html(INPUT_HTML);
          }
        }
      }
    }

    if (type == 'IF' && typeof box.data != 'undefined') {
      $('.BluePrint-IF-v1').val(box.data._condition.v1);
      $('.BluePrint-IF-Select').val(box.data._condition.operator);
      $('.BluePrint-IF-v2').val(box.data._condition.v2);
    }



    $('#'+c.opt.in+'_Panel_'+type.substring(0,1).toUpperCase()+type.substring(1).toLowerCase()).css('top','0px');
  },

  load: function(name,area,b) {
    this.listBox = {};
    this.listLink = {};
    this.OnceID = null;
    this.lastX = 0;
    this.lastY = 0;
    this.isClick = false;
    this.isHover = false;
    this.isValid = ui.HoverCanvas;
    this.index = -1;
    this.selected = {
      input: false,
      output: false
    };
    this.cObj.x = -150;
    this.cObj.y = -150;
    this.name = name;
    this.area = area;
    var _this = this;
    var tmpname = this.name;
    if (tmpname.slice(-3) == 'MOB') {
      this.area = 'Entity';
    }
    var name = tmpname.substring(0,tmpname.lastIndexOf('_'));
    if (typeof b == 'undefined') {
      this.div.style.display = 'block';
      $($('#'+bluePrint.div.id+'_Caption').find('.ui-window-caption-title')[0]).html('BluePrint - '+name);
    }
    editor.gettmp({
      data: JSON.stringify([this.area+'_BluePrint_'+this.name+'.json']),
      onend: function(data) {
        if (Object.keys(data).length != 0) {
          data = data[Object.keys(data)[0]];
          _this.listBox = Object.assign({},data.listBox);
          _this.listLink = Object.assign({},data.listLink);

          if (typeof data.OnceID !== 'undefined') {
            _this.OnceID = data.OnceID;
          }

          _this.listBox = cleanObjectFromJSON(_this.listBox);
          _this.listLink = cleanObjectFromJSON(_this.listLink);

          for (var i in _this.listBox) {
            if (_this.listBox.hasOwnProperty(i)) {

              for (var j in _this.listLink) {
                if (_this.listLink.hasOwnProperty(j)) {
                  if (_this.isEquivalent(_this.listLink[j].to,_this.listBox[i])) {
                    _this.listLink[j].to = _this.listBox[i];
                  }
                  if (_this.isEquivalent(_this.listLink[j].from,_this.listBox[i])) {
                    _this.listLink[j].from = _this.listBox[i];
                  }
                }
              }

            }
          }

        } else {
          _this.add(0,0,300,300,'START',-1,1);
        }

        if (typeof b == 'function') {b();}
      }
    });
  },
  save: function() {
    var _this = this;
    editor.save(_this.area,function(){
      var dataList = [
        editor.setDataJSON(_this.listBox),
        editor.setDataJSON(_this.listLink)
      ];
      if (_this.OnceID == null) {
        _this.OnceID = 'Once_'+Date.now().toString(32);
      }
      var data = '{"area":"'+_this.area+'","name":"BluePrint_'+_this.name+'","extension":"json","data":{"listBox":'+dataList[0]+',"listLink":'+dataList[1]+',"OnceID":"'+_this.OnceID+'"}}';
      var total = editor.lengthInUtf8Bytes(data);
      editor.send({
        currentData:data,
        index:0,
        arraydata:[data],
        onprogress: function(percent) {
          //console.log(percent);
        },
        onend: function(loaded,total) {
          if (loaded < total) {
            new toolTip('<span style="color: #f00;">Error BluePrint save!</span>',4000);
          } else {
            new toolTip('<span style="color: #0f0;">Success BluePrint save!</span>',4000);
          }
        }
      });
    });
  },

  initStartEvent: function(area) {
    this.readBluePrint('START__',area);
  },

  buildLogicPath: function() {
    var Path = {};
    var builder = function(i,node,currentPath,listBox) {
      var output = [];
      var tmpn = 0;
      for (var u in listBox[i].output) {
        if (listBox[i].output.hasOwnProperty(u)) {
          if (listBox[i].output[u].isLink) {
            for (var n in listBox[i].output[u].idBox) {
              if (listBox[i].output[u].idBox.hasOwnProperty(n)) {
                tmpn++;
                output.push([n,tmpn]);
              }
            }
          }
        }
      }
      if (output.length > 1) {
        if (typeof currentPath[node] == 'undefined') {currentPath[node] = [];}
        if (listBox[i].type != 'START') {
          currentPath[node].push([]);
          currentPath = currentPath[node][currentPath[node].length-1];
          node = 0;
        }
        for (var j = 0; j < output.length; j++) {
          if (typeof currentPath[node] == 'undefined') {currentPath[node] = [];}
          if (listBox[i].type != 'START') {
            currentPath[node].push({type:listBox[i].type+''+output[j][1],data:listBox[i].data});
          }
          builder(output[j][0],node,currentPath,listBox);
          node++;
        }
      } else {
        if (typeof currentPath[node] == 'undefined') {currentPath[node] = [];}
        if (typeof listBox[i].data != 'undefined') {
          currentPath[node].push({type:listBox[i].type+(output.length > 0?''+output[0][1]:''),data:listBox[i].data});
        }
        if (output.length > 0) {
          builder(output[0][0],node,currentPath,listBox);
        }
      }
    };
    builder(0,0,Path,this.listBox);
    return Path;

    //ALGO WHICH GET ALL PATHS POSSIBLE
    /*
    var builder = function(i,node,listBox) {
      if (typeof Path[node] == 'undefined') {Path[node] = [];}
      if (typeof listBox[i].data != 'undefined') {
        Path[node].push({type:listBox[i].type,data:listBox[i].data});
      }
      var savePath = goclone(Path[node]);
      var test = 0;
      var output = 0;
      for (var u in listBox[i].output) {
        if (listBox[i].output.hasOwnProperty(u)) {
          if (listBox[i].output[u].isLink) {
            for (var n in listBox[i].output[u].idBox) {
              if (listBox[i].output[u].idBox.hasOwnProperty(n)) {
                if (listBox[i].type=='IF') {
                  output++;
                }
                if (test > 0) {
                  node++;
                  while (typeof Path[node] != 'undefined') {
                    node++;
                  }
                  Path[node] = goclone(savePath);
                }
                test++;
                if (listBox[i].type!='START') {
                  Path[node][Path[node].length-1].type+=''+output;
                }
                builder(n,node,listBox);
              }
            }
          }
        }
      }
    };
    */
  },
  readBluePrint: function(name,area,c) {
    var _this = this;
    this.load(name,area,function(){
      var Path = _this.buildLogicPath();
      for (var i in Path) {
        if (Path.hasOwnProperty(i)) {
          _this.execPath(Path[i],0,name);
        }
      }
      if (c) {c();}
    });
  },
  execPath: function(Path,i,name) {
    var _this = this;
    if (i <= Object.keys(Path).length-1) {
      var key = Object.keys(Path)[i];
      if (typeof Path[i].type == 'undefined') {
        for (var j in Path[i]) {
          if (Path[i].hasOwnProperty(j)) {
            _this.execPath(Path[i][j],0,name);
          }
        }
      } else {
        if (Path[i].type.substring(0,8) == 'FUNCTION') {
          var ArgsTemp = goclone(Path[key].data._arguments);
          if (Path[key].data._fn != 'Set') {
            var Args = memoryManagement.get(ArgsTemp,name.substring(0,name.lastIndexOf('-')));
          } else {
            var Args = ArgsTemp;
          }
          _this.Functions[Path[key].data._fn](Args,name,function(){
            i++;
            _this.execPath(Path,i,name);
          });
        } else if (Path[i].type.substring(0,2) == 'IF') {
          if (Path[i].type.substring(2,3)=='1') {
            _this.execIF.v1 = memoryManagement.get(Path[key].data._condition.v1,name.substring(0,name.lastIndexOf('-')));
            _this.execIF.operator = Path[key].data._condition.operator;
            _this.execIF.v2 = memoryManagement.get(Path[key].data._condition.v2,name.substring(0,name.lastIndexOf('-')));
            _this.execIF.v1 = _this.execIF.v1 == 'true' ? true : _this.execIF.v1 == 'false' ? false : _this.execIF.v1;
            _this.execIF.v2 = _this.execIF.v2 == 'true' ? true : _this.execIF.v2 == 'false' ? false : _this.execIF.v2;
            switch (_this.execIF.operator) {
              case '==':
                if (_this.execIF.v1==_this.execIF.v2) {i++;_this.execPath(Path,i,name);}
                break;
              case '!=':
                if (_this.execIF.v1!=_this.execIF.v2) {i++;_this.execPath(Path,i,name);}
                break;
              case '>=':
                if (_this.execIF.v1>=_this.execIF.v2) {i++;_this.execPath(Path,i,name);}
                break;
              case '<=':
                if (_this.execIF.v1<=_this.execIF.v2) {i++;_this.execPath(Path,i,name);}
                break;
              case '>':
                if (_this.execIF.v1>_this.execIF.v2) {i++;_this.execPath(Path,i,name);}
                break;
              case '<':
                if (_this.execIF.v1<_this.execIF.v2) {i++;_this.execPath(Path,i,name);}
                break;
              default:
            }
          } else {
            switch (_this.execIF.operator) {
              case '==':
                if (_this.execIF.v1!=_this.execIF.v2) {i++;_this.execPath(Path,i,name);}
                break;
              case '!=':
                if (_this.execIF.v1==_this.execIF.v2) {i++;_this.execPath(Path,i,name);}
                break;
              case '>=':
                if (_this.execIF.v1<_this.execIF.v2) {i++;_this.execPath(Path,i,name);}
                break;
              case '<=':
                if (_this.execIF.v1>_this.execIF.v2) {i++;_this.execPath(Path,i,name);}
                break;
              case '>':
                if (_this.execIF.v1<=_this.execIF.v2) {i++;_this.execPath(Path,i,name);}
                break;
              case '<':
                if (_this.execIF.v1>=_this.execIF.v2) {i++;_this.execPath(Path,i,name);}
                break;
              default:
            }
          }
        }
      }
    }
  }

};



/*
  This was made only for the fun^^
  (Yes it's more work but it's very fun and very cool hahahahahahahahhahah )
  p.s: This comment's size is 203 bytes, sorry for you guys who are bad connection :(
*/

console.logColor = function logColor() {
  var Args = logColor.arguments;
  var a = [];
  var b = [];
  for (var i = 0; i < Args.length; i++) {
    var div = document.createElement('div');
    var e = Args[i]
    .replace(/<[0-9a-zA-Z]+[^>]*>/g,function(a){return '</span>'+a;})
    .replace(/<\/[0-9a-zA-Z]*>/g,function(a){return a+'<span>';})
    .trim()
    .slice(13,-6)
    .replace(/<\/span><\/span>/g,'<\/span>')
    .replace(/<span><span/g,'<span');
    div.innerHTML = e;
    for (var j = 0; j < div.children.length; j++) {
      var c = div.children[j].style.cssText;
      var d = div.children[j].innerText;
      a.push('%c'+d);
      b.push(c);
    }
  }
  a = a.join('');
  b.unshift(a);
  console.log.apply(b,b);
};
var consoleLogColorDefaultStyle = 'font-weight:bold;background:#000;';

console.logColor(
  '<span style="'+consoleLogColorDefaultStyle+'font-size:40px;color:#fff;">Welcome</span><span style="'+consoleLogColorDefaultStyle+'font-size:40px;"> </span>'+
  '<span style="'+consoleLogColorDefaultStyle+'font-size:40px;color:#fff;">To</span><span style="'+consoleLogColorDefaultStyle+'font-size:40px;"> </span>'+
  '<span style="'+consoleLogColorDefaultStyle+'font-size:40px;color:#00c0ff;">J</span>'+
  '<span style="'+consoleLogColorDefaultStyle+'font-size:40px;color:#00ff12;">A</span>'+
  '<span style="'+consoleLogColorDefaultStyle+'font-size:40px;color:#f6ff00;">A</span>'+
  '<span style="'+consoleLogColorDefaultStyle+'font-size:40px;color:#ba00ff;">J</span>'
);


console.logColor(
  '<span style="'+consoleLogColorDefaultStyle+'font-size:18px;color:#fff;">This Game was made only by my little fingers on my keyboard. 😝</span>'+
  '<span style="'+consoleLogColorDefaultStyle+'font-size:14px;color:#ddd;">(I hurt my little finger)</span>'
);
console.logColor(
  '<span style="'+consoleLogColorDefaultStyle+'font-size:18px;color:#fff;">On the other hand, all drawings was made by Puladex on "Paint Deluxe Edition Limited"</span>'+
  '<span style="'+consoleLogColorDefaultStyle+'font-size:14px;color:#ddd;">(it\'s just paint.exe, do not worry)</span>'
);

console.logColor('<span style="padding-top:30px;"></span>');

consoleLogColorDefaultStyle = 'background:#000;color:#0f0;font-size:15px;';


function floodFill(imageData, x, y, fillColor){
  this.Stack = [];

  this.imageData = imageData;

  this.width = imageData.width;
  this.height = imageData.height;

  this.targetColor = {
    r: this.imageData.data[(y*this.width+x)*4+0],
    g: this.imageData.data[(y*this.width+x)*4+1],
    b: this.imageData.data[(y*this.width+x)*4+2],
    a: this.imageData.data[(y*this.width+x)*4+3]
  };
  this.fillColor = fillColor;

	this.fillPixel(x, y);

	while(this.Stack.length>0){
		toFill = this.Stack.pop();
		this.fillPixel(toFill[0], toFill[1]);
	}

  return this.imageData.data;
};
floodFill.prototype = {
  fillPixel: function(x, y) {
    if(!this.alreadyFilled(x, y)) {this.fill(x, y)};

    if(!this.alreadyFilled(x,   y-1) && this.isPixel(x,   y-1)) {this.Stack.push([x,   y-1])};
    if(!this.alreadyFilled(x+1, y  ) && this.isPixel(x+1, y  )) {this.Stack.push([x+1, y  ])};
    if(!this.alreadyFilled(x,   y+1) && this.isPixel(x,   y+1)) {this.Stack.push([x,   y+1])};
    if(!this.alreadyFilled(x-1, y  ) && this.isPixel(x-1, y  )) {this.Stack.push([x-1, y  ])};
  },
  fill: function(x, y) {
    this.imageData.data[(y*this.width+x)*4+0] = this.fillColor.r;
    this.imageData.data[(y*this.width+x)*4+1] = this.fillColor.g;
    this.imageData.data[(y*this.width+x)*4+2] = this.fillColor.b;
    this.imageData.data[(y*this.width+x)*4+3] = this.fillColor.a;
  },
  isPixel: function(x, y) {
    return typeof this.imageData.data[(y*this.width+x)*4+0] != 'undefined';
  },
  alreadyFilled: function(x, y) {
    if (
      this.imageData.data[(y*this.width+x)*4+0] == this.fillColor.r &&
      this.imageData.data[(y*this.width+x)*4+1] == this.fillColor.g &&
      this.imageData.data[(y*this.width+x)*4+2] == this.fillColor.b &&
      this.imageData.data[(y*this.width+x)*4+3] == this.fillColor.a
    ) {
      return true;
    } else {
      if (
        this.imageData.data[(y*this.width+x)*4+0] == this.targetColor.r &&
        this.imageData.data[(y*this.width+x)*4+1] == this.targetColor.g &&
        this.imageData.data[(y*this.width+x)*4+2] == this.targetColor.b &&
        this.imageData.data[(y*this.width+x)*4+3] == this.targetColor.a
      ) {
        return false;
      } else {
        return true;
      }
      return false;
    }
  }
};


function componentsText(data,next) {
  this.next = next;
  this.letters = [];
  this.settings = data || {};
  var defaultOpt = {
           tmpText:'',
              text:'Sorry, we lost a piece of the script (Michel, you\'re fired!)',
             color:'#FFFFFF',
          fontSize:'20px',
        fontFamily:'arial',
               cut:'true',
           cutWord:'false',
             width:'80%',
                 x:'50%',
                 y:'-70px',
           anchorY:'TOP',
      textBaseline:'middle',
         textAlign:'center',
         animation:'false',
     animationData:{fontSize:20,speed:2},
     animationTime:1000,
      animationEnd:'false',
  animationDataEnd:{opacity:0},
  animationTimeEnd:3500,
    animationIndex:0,
              time:2000,
       currentTime:Date.now()
  };
  for (var key in defaultOpt) {
    if (defaultOpt.hasOwnProperty(key)) {
      if (typeof this.settings[key] === 'undefined') {
        this.settings[key] = defaultOpt[key]+'';
      }
      if (this.settings[key] == 'true') this.settings[key] = true;
      if (this.settings[key] == 'false') this.settings[key] = false;
    }
  }
  if (!this.settings.animation) {
    this.settings['tmpText'] = this.settings['text'];
  }

  this.settings.aTime = this.settings.animationTime/this.settings['text'].replace(/[\r\n ]|\\r|\\n/g,'').length;
  this.settings.aTimeEnd = this.settings.animationTimeEnd/this.settings['text'].replace(/[\r\n ]|\\r|\\n/g,'').length;
  this.time = Date.now();
  this.End = false;
  this.EndIndex = 0;
  return this;
};
componentsText.prototype.update = function () {
  if (this.settings.x.slice(-1) == '%') {
    this.settings.vx = parseFloat(this.settings.x.replace(/[^0-9\-]+/g,''))/100*canvas.width;
  } else {
    this.settings.vx = parseFloat(this.settings.x.replace(/[^0-9\-]+/g,''));
  }
  if (this.settings.y.slice(-1) == '%') {
    this.settings.vy = parseFloat(this.settings.y.replace(/[^0-9\-]+/g,''))/100*canvas.height;
  } else {
    this.settings.vy = parseFloat(this.settings.y.replace(/[^0-9\-]+/g,''));
  }
  if (this.settings.vx < 0) {
    this.settings.vx = canvas.width+this.settings.vx;
  }
  if (this.settings.vy < 0) {
    this.settings.vy = canvas.height+this.settings.vy;
  }
  if (this.settings.width.slice(-1) == '%') {
    this.settings.vwidth = parseFloat(this.settings.width.replace(/[^0-9\-]+/g,''))/100*canvas.width;
  } else {
    this.settings.vwidth = parseFloat(this.settings.width.replace(/[^0-9\-]+/g,''));
  }
  this.animate();
};
componentsText.prototype.draw = function () {
  this.update();
  ctx.font = this.settings.fontSize+' '+this.settings.fontFamily;
  ctx.textAlign = this.settings.textAlign;
  ctx.textBaseline = this.settings.textBaseline;
  ctx.fillStyle = this.settings.color;

  var ajustY = 0;
  var sizeHeight = parseFloat(this.settings.fontSize.replace(/\D+/g,''));

  if (this.settings.cutWord) {
    if (ctx.measureText(this.settings.text).width > this.settings.vwidth) {
      var line = 0;
      var textArray = [];
      var current = '';
      for (var i = 0; i < this.settings.tmpText.length; i++) {
        if (ctx.measureText(current+this.settings.tmpText[i]).width > this.settings.vwidth) {
          textArray.push(current);
          current = this.settings.tmpText[i];
        } else {
          current += this.settings.tmpText[i];
        }
      }
      textArray.push(current);
      var textArrayF = [];
      var current = '';
      for (var i = 0; i < this.settings.text.length; i++) {
        if (ctx.measureText(current+this.settings.text[i]).width > this.settings.vwidth) {
          textArrayF.push(current);
          current = this.settings.text[i];
        } else {
          current += this.settings.text[i];
        }
      }
      textArrayF.push(current);
      this.drawText(textArray,textArrayF);
    } else {
      this.drawText(this.settings.tmpText,this.settings.text);
    }
  } else if (this.settings.cut) {
    if (ctx.measureText(this.settings.text).width > this.settings.vwidth) {
      var textArray = (this.settings.tmpText.replace(/\\n|\\r/g,'\n')).split('\n');
      var testf = [];
      var current = '';
      for (var i = 0; i < textArray.length; i++) {
        var p = textArray[i].split(' ');
        for (var j = 0; j < p.length; j++) {
          if (ctx.measureText(current+p[j]).width > this.settings.vwidth) {
            testf.push(current);
            current = p[j];
          } else {
            current += current==''?p[j]:' '+p[j];
          }
        }
      }
      testf.push(current);
      var textArray = (this.settings.text.replace(/\\n|\\r/g,'\n')).split('\n');
      var testfreal = [];
      var current = '';
      for (var i = 0; i < textArray.length; i++) {
        var p = textArray[i].split(' ');
        for (var j = 0; j < p.length; j++) {
          if (ctx.measureText(current+p[j]).width > this.settings.vwidth) {
            testfreal.push(current);
            current = p[j];
          } else {
            current += current==''?p[j]:' '+p[j];
          }
        }
      }
      testfreal.push(current);
      this.drawText(testf,testfreal);
    } else {
      this.drawText(this.settings.tmpText,this.settings.text);
    }
  } else {
    this.drawText(this.settings.tmpText,this.settings.text);
  }
  ctx.setTransform(1,0,0,1,0,0);
};
componentsText.prototype.animate = function () {
  var _this = this;
  var test1 = this.settings['text'].replace(/[\r\n ]|\\r|\\n/g,'');
  var test2 = this.settings['tmpText'].replace(/[\r\n ]|\\r|\\n/g,'');
  if (test1 != test2 && !this.End) {
    if (Date.now() - this.settings.currentTime > this.settings.aTime) {
      this.settings.currentTime = Date.now();
      this.time = Date.now();
      var tmp = this.settings['text'].replace(/\r|\\r|\\n/g,'\n');
      while (tmp[this.settings.animationIndex] == ' ' || tmp[this.settings.animationIndex] == '\n') {
        this.settings['tmpText'] += tmp[this.settings.animationIndex] == ' ' ? ' ' : '\\n';
        this.settings.animationIndex++;
      }
      this.settings['tmpText'] += tmp[this.settings.animationIndex];
      this.letters.push(new this.Letter(tmp[this.settings.animationIndex],this.settings.animationData));
      this.settings.animationIndex++;
      this.EndIndex = this.letters.length-1;
    }
  } else if (Date.now() - this.time > this.settings.animationTime) {
    if (!this.End) {
      this.settings['tmpText'] = this.settings['text'];
    }
    this.End = true;
    if (test2 != '') {
      if (Date.now() - this.settings.currentTime > this.settings.aTimeEnd) {
        this.settings.currentTime = Date.now();
        if (this.settings.animationEnd) {
          if (typeof this.letters[this.EndIndex] !== 'undefined' && this.EndIndex >= 0) {
            this.settings.animationIndex--;
            this.letters[this.EndIndex].endUpdate(this.settings.animationIndex,this.EndIndex,this.settings.animationDataEnd,function(a,b){
              _this.letters[b] = null;
              delete _this.letters[b];
              _this.settings['tmpText'] = _this.settings['tmpText'].slice(0,-1);
              var tmp = _this.settings['tmpText'].replace(/[\r\n ]|\\r|\\n/g,' ');
              while (tmp.slice(-1) == ' ') {
                _this.settings['tmpText'] = _this.settings['tmpText'].slice(0,-1);
                tmp = tmp.slice(0,-1);
              }
            });
            this.EndIndex--;
          } else {
            var tmp = this.settings['text'].replace(/\r|\\r|\\n/g,'\n');
            for (var i = 0; i < tmp.length; i++) {
              while (tmp[i] == ' ' || tmp[i] == '\n') {
                i++;
              }
              this.letters.push(new this.Letter(tmp[i],{}));
            }
          }
        }

      }
    } else {
      this.settings.obj[this.settings.id] = null;
      delete this.settings.obj[this.settings.id];
      this.next();
    }
  }
};
componentsText.prototype.drawText = function (testf1,testfreal1) {
  var index = 0;
  var ajustY = 0;
  var sizeHeight = parseFloat(this.settings.fontSize.replace(/\D+/g,''));
  if (typeof testf1 === 'string') {
    var testf = testf1.split('\n');
  } else {
    var testf = testf1;
  }
  if (typeof testfreal1 === 'string') {
    var testfreal = testfreal1.split('\n');
  } else {
    var testfreal = testfreal1;
  }
  if (this.settings.anchorY.toUpperCase() == 'CENTER') {
    ajustY = sizeHeight/2-testfreal.length*sizeHeight/2;
  } else if (this.settings.anchorY.toUpperCase() == 'TOP') {
    ajustY = -sizeHeight/2;
  } else if (this.settings.anchorY.toUpperCase() == 'BOTTOM') {
    ajustY = sizeHeight/2-testfreal.length*sizeHeight;
  }
  for (var i = 0; i < testf.length; i++) {
    var x = 0;
    var w = ctx.measureText(testfreal[i]).width;
    for (var j = 0; j < testf[i].length; j++) {
      var letter = testf[i][j];
      if (typeof this.letters[index] !== 'undefined' && this.settings.animationData != null) {
        if (letter != ' ') {
          var animLetter = this.letters[index];
          index++;
          ctx.save();
          if (!this.End) {
            ctx.font = (sizeHeight-animLetter.fontSize)+'px '+this.settings.fontFamily;
          } else {
            ctx.font = (animLetter.fontSize == 0 ? sizeHeight : animLetter.fontSize)+'px '+this.settings.fontFamily;
          }
          ctx.fillText(letter,animLetter.x+this.settings.vx-w/2+x,animLetter.y+ajustY+this.settings.vy+i*sizeHeight);
          ctx.restore();
          animLetter.update();
        } else {
          ctx.fillText(' ',this.settings.vx-w/2+x,ajustY+this.settings.vy+i*sizeHeight);
        }
      } else {
        ctx.fillText(letter,this.settings.vx-w/2+x,ajustY+this.settings.vy+i*sizeHeight);
      }
      x += ctx.measureText(testf[i][j]).width/2+ctx.measureText(testf[i][j+1]).width/2;
    }
  }
};
componentsText.prototype.Letter = function(Letter,data) {
  this.End = false;
  this.x = 0;
  this.y = 0;
  this.fontSize = 0;
  this.speed = 1;
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      this[key] = data[key];
    }
  }
};
componentsText.prototype.Letter.prototype.update = function () {
  if (this.y != 0) {
    this.y += this.y-this.speed > 0 ? -this.speed : this.y+this.speed < 0 ? this.speed : 0;
    if (Math.round(this.y) == this.speed) {
      this.y = 0;
    }
  }
  if (this.x != 0) {
    this.x += this.x-this.speed > 0 ? -this.speed : this.x+this.speed < 0 ? this.speed : 0;
    if (Math.round(this.x) == this.speed) {
      this.x = 0;
    }
  }
  if (this.fontSize != 0) {
    this.fontSize += this.fontSize-this.speed > 0 ? -this.speed : this.fontSize+this.speed < 0 ? this.speed : 0;
    if (Math.round(this.fontSize) == this.speed) {
      this.fontSize = 0;
    }
  }
  if (this.End) {
    if (this.fontSize == 0 && this.x == 0 && this.y == 0) {
      this.c(this.obj,this.i);
    }
  }
};
componentsText.prototype.Letter.prototype.endUpdate = function (obj,i,data,c) {
  this.End = true;
  this.obj = obj;
  this.i = i;
  this.c = c || function(){};
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      this[key] = data[key];
    }
  }
};


function DataTool() {
  if (ui.selectMode == 'AddMap' && typeof world.tmp2.select == 'undefined') {
    /*
    ctx.fillStyle = '#AE00FF';
    ctx.strokeStyle = '#630092';
    */
    var xy = mouse.getAbsoluteXY();
    var axy = mouse.getRelativeXY();
    var dxy = {x:mouse.x,y:mouse.y};
    var area = '['+axy.x+','+axy.y+']'+world.currentMap;
    var nb = 0;
    if (typeof resource.data[area] == 'undefined') {
      resource.data[area] = {};
    }
    if (typeof resource.data[area]['MAP'] == 'undefined') {
      resource.data[area]['MAP'] = {0:{x:xy.x,y:xy.y,name:''}};
    } else {
      nb = Object.keys(resource.data[area]['MAP']).length;
      resource.data[area]['MAP'][Object.keys(resource.data[area]['MAP']).length] = {x:xy.x,y:xy.y,name:''};
    }
    window.onchangearea();
    var input = document.createElement('input');
    //input.id = 'EditorInput';
    input.className = 'Editor-Input';
    input.dataset.nb = nb;
    input.dataset.area = area;
    input.dataset.ok = 'false';
    input.style.left = mouse.x+'px';
    input.style.top = mouse.y+'px';
    var test = function(_this,e) {
      e.preventDefault();
      if (_this.dataset.ok == 'false') {
        if (_this.value != '') {
          var exist = false;
          for (var i in resource.data[_this.dataset.area]['MAP']) {
            if (resource.data[_this.dataset.area]['MAP'].hasOwnProperty(i)) {
              if (resource.data[_this.dataset.area]['MAP'][i].name == _this.value) {
                exist = true;
              }
            }
          }
          if (exist) {
            delete resource.data[_this.dataset.area]['MAP'][_this.dataset.nb];
          } else {
            resource.data[_this.dataset.area]['MAP'][_this.dataset.nb].name = _this.value;
          }
        } else {
          delete resource.data[_this.dataset.area]['MAP'][_this.dataset.nb];
        }
        _this.dataset.ok = 'true';
        _this.remove();
        window.onchangearea();
      }
      return false;
    };
    input.onblur = function(e){e=e||event;test(this,e)};
    input.onkeydown = function(e){e=e||event;
      if (world.charset.replace(e.key,'') == world.charset) {e.preventDefault();return false;console.log('FUCKK');} ctx.font = "15px Arial";this.style.width = ctx.measureText(this.value+e.key).width+'px';};
    input.onkeyup = function(e){e=e||event;ctx.font = "15px Arial";this.style.width = ctx.measureText(this.value).width+'px';if(e.keyCode==13){test(this,e)}};
    document.body.appendChild(input);
    input.focus();
  }
  if (ui.selectMode == 'AddMob' && resource.currentSpriteSheetSELECTED) {
    var xy = mouse.getRelativeXY();
    var area = '['+xy.x+','+xy.y+']'+world.currentMap;

    var check = false;
    var generatUniqID = function(callback) {
      var id = (Math.random().toString(36).substring(7))+''+(Math.random().toString(36).substring(7));
      var d = {
        mode: 'SELECTw',
        table: 'mobs',
        where: 'idMob',
        whereValue: id
      };
      socket.SetMysql(d,function(data){
        if (!check) {
          if (data.length == 0) {
            check = true;
            callback(id);
          } else {
            generatUniqID(callback);
          }
        }
      });
    };

    generatUniqID(function(id) {
      var d = {
        mode: 'INSERT',
        table: 'mobs',
        row: {}
      };
      var xy = mouse.getAbsoluteXY();
      var Obj = {
        name: resource.currentSpriteSheetTNAME,
        x: xy.x+500-resource.currentSpriteSheetGW/2,
        y: xy.y+500-resource.currentSpriteSheetGH/2
      };
      d.row['idMob'] = id;
      d.row['area'] = area;
      d.row['data'] = JSON.stringify(Obj);
      socket.SetMysql(d,function(data){
        window.onchangearea();
        new toolTip('<span style="color: #0f0;">Mob: Success Add!</span>',4000);
      });
    });
  }
};
var ToolPaint = {
  pencil: function(settings) {
    settings.ctx.beginPath();
    settings.ctx.translate(settings.data.dx, settings.data.dy);
    settings.ctx.drawImage(settings.image, settings.data.sx, settings.data.sy, settings.data.sw, settings.data.sh, 0, 0, settings.data.dw, settings.data.dh);
    settings.ctx.setTransform(1,0,0,1,0,0);
  },
  rubber: function(settings) {
    settings.ctx.beginPath();
    settings.ctx.translate(settings.data.dx, settings.data.dy);
    settings.ctx.clearRect(0, 0, settings.data.dw, settings.data.dh);
    settings.ctx.setTransform(1,0,0,1,0,0);
  },
  fill: function(settings) {
    if (settings.selection) {
      settings.ctx.clearRect(settings.data.xmint,settings.data.ymint,settings.data.xmaxt-settings.data.xmint,settings.data.ymaxt-settings.data.ymint);
      for (var y = 0; y < Math.ceil(Math.abs(settings.data.ymaxt-settings.data.ymint)/settings.th)+1; y++) {
        for (var x = 0; x < Math.ceil(Math.abs(settings.data.xmaxt-settings.data.xmint)/settings.tw)+1; x++) {
          var xs = 0,
              ys = 0,
              ws = settings.data.ws,
              hs = settings.data.hs;

          var xd = settings.data.xmint+ws*x,
              yd = settings.data.ymint+hs*y,
              wd = ws,
              hd = hs;

          if (xd+wd > settings.data.xmaxt) {
            ws -= (xd+wd)-settings.data.xmaxt;
            wd -= (xd+wd)-settings.data.xmaxt;
            xd = settings.data.xmaxt-wd;
          }
          if (yd+hd > settings.data.ymaxt) {
            hs -= (yd+hd)-settings.data.ymaxt;
            hd -= (yd+hd)-settings.data.ymaxt;
            yd = settings.data.ymaxt-hd;
          }

          if (wd > 0 && hd > 0) {
            settings.ctx.drawImage(settings.image, xs, ys, ws, hs, xd, yd, wd, hd);
          }
        }
      }
    } else {
      var getmouse = mouse.getAbsoluteXY();
      var x = getmouse.x<0?1000-((Math.abs(getmouse.x%1000)+500)%1000):((getmouse.x%1000)+500)%1000,
          y = getmouse.y<0?1000-((Math.abs(getmouse.y%1000)+500)%1000):((getmouse.y%1000)+500)%1000;
      var imgData = settings.ctx.getImageData(x, y, 1, 1);
      var currentPixel = {
        R: imgData.data[0],
        G: imgData.data[1],
        B: imgData.data[2],
        alpha: imgData.data[3]
      };
      var imgData = settings.ctx.getImageData(0, 0, 1000, 1000);
      var pixelTransparent = {};
      var data = new floodFill(imgData, x, y, {r:0,g:0,b:0,a:1});
      for (var u = 0; u < data.length; u+=4) {
        if (data[u+3] == 0) {
          pixelTransparent[u] = [
            data[u],data[u+1],data[u+2],data[u+3]
          ];
        }
      }
      settings.ctx.clearRect(0,0,1000,1000);
      for (var y = 0; y < Math.ceil(1000/world.drawWidth)+1; y++) {
        for (var x = 0; x < Math.ceil(1000/world.drawHeight)+1; x++) {
          settings.ctx.drawImage(settings.image, world.drawWidth*x, world.drawHeight*y, world.drawWidth, world.drawHeight);
        }
      }
      var imgData2 = settings.ctx.getImageData(0, 0, 1000, 1000);
      for (var u = 0; u < data.length; u+=4) {
        if (data[u+3] == 1) {
          data[u] = imgData2.data[u];
          data[u+1] = imgData2.data[u+1];
          data[u+2] = imgData2.data[u+2];
          data[u+3] = imgData2.data[u+3];
        } else if (typeof pixelTransparent[u] != 'undefined') {
          data[u] = pixelTransparent[u][0];
          data[u+1] = pixelTransparent[u][1];
          data[u+2] = pixelTransparent[u][2];
          data[u+3] = pixelTransparent[u][3];
        }
      }
      imgData.data = data;
      settings.ctx.putImageData(imgData,0,0);
    }
  }
};
ToolPaint.auto = function(settings) {

  var sx = settings.data.offX,
      sy = settings.data.offY,
      sw = settings.data.endX-settings.data.startX,
      sh = settings.data.endY-settings.data.startY,
      dx = settings.data.startX,
      dy = settings.data.startY,
      dw = settings.data.endX-settings.data.startX,
      dh = settings.data.endY-settings.data.startY;

  var xmint = 0,
      ymint = 0,
      xmaxt = 1000,
      ymaxt = 1000;

  var tw = world.drawWidth,
      th = world.drawHeight;

  if (world.selection.active && world.selection.tool == 'Selection') {
    var testStart = world.selection.ApointStart;
    var testEnd = world.selection.ApointEnd;
    var testAreaStart = '['+testStart.x+','+testStart.y+']';
    var testAreaEnd = '['+testEnd.x+','+testEnd.y+']';

    var arrt = settings.area.split(',');
    var art1 = parseInt(arrt[0].substring(1));
    var art2 = parseInt(arrt[1].slice(0,-1));

    var xmin = world.selection.pointStart.x<0?1000-((Math.abs(world.selection.pointStart.x%1000)+500)%1000):((world.selection.pointStart.x%1000)+500)%1000,
        ymin = world.selection.pointStart.y<0?1000-((Math.abs(world.selection.pointStart.y%1000)+500)%1000):((world.selection.pointStart.y%1000)+500)%1000;
    var xmax = world.selection.pointEnd.x<0?1000-((Math.abs(world.selection.pointEnd.x%1000)+500)%1000):((world.selection.pointEnd.x%1000)+500)%1000,
        ymax = world.selection.pointEnd.y<0?1000-((Math.abs(world.selection.pointEnd.y%1000)+500)%1000):((world.selection.pointEnd.y%1000)+500)%1000;

    if (settings.mode == 'Fill') {
      var xmint = 0,
          ymint = 0,
          xmaxt = 1000,
          ymaxt = 1000;

      if (art1 == testStart.x) {
        xmint = xmin;
      }
      if (art2 == testStart.y) {
        ymint = ymin;
      }
      if (art1 == testEnd.x) {
        xmaxt = xmax;
      }
      if (art2 == testEnd.y) {
        ymaxt = ymax;
      }

      var tw = world.drawWidth,
          th = world.drawHeight;

      if (tw > th) {
        tw = th;
        th = tw;
      }
    } else {
      if (art1 == testStart.x) {
        if (dx < xmin) {
          sx -= dx-xmin;
          sw += dx-xmin;
          dw += dx-xmin;
          dx = xmin;
        }
      }
      if (art2 == testStart.y) {
        if (dy < ymin) {
          sy -= dy-ymin;
          sh += dy-ymin;
          dh += dy-ymin;
          dy = ymin;
        }
      }
      if (art1 == testEnd.x) {
        if (dx+dw > xmax) {
          sw -= (dx+dw)-xmax;
          dw -= (dx+dw)-xmax;
          dx = xmax-dw;
        }
      }
      if (art2 == testEnd.y) {
        if (dy+dh > ymax) {
          sh -= (dy+dh)-ymax;
          dh -= (dy+dh)-ymax;
          dy = ymax-dh;
        }
      }
      if (art1 < testStart.x) {
        dw = 0;
      }
      if (art2 < testStart.y) {
        dh = 0;
      }
      if (art1 > testEnd.x) {
        dw = 0;
      }
      if (art2 > testEnd.y) {
        dh = 0;
      }
    }
  }

  var currentZoneData = {
    sx:sx,
    sy:sy,
    sw:sw,
    sh:sh,

    dx:dx,
    dy:dy,
    dw:dw,
    dh:dh
  };

  if (dw > 0 && dh > 0) {
    if (settings.mode == 'Rubber') {
      ToolPaint.rubber({
        ctx: settings.ctx,
        data: currentZoneData
      });
    } else if (settings.resourceOK) {
      if (settings.mode == 'Pencil') {
        ToolPaint.pencil({
          ctx: settings.ctx,
          data: currentZoneData,
          image: settings.image
        });
      }
    }
  }

  if (settings.mode == 'Fill') {
    if (settings.resourceOK) {
      var currentZoneDataFill = {
        ws: dw,
        hs: dh,

        xmint:xmint,
        ymint:ymint,
        xmaxt:xmaxt,
        ymaxt:ymaxt,

        th:th,
        tw:tw
      };
      ToolPaint.fill({
        ctx: settings.ctx,
        selection: (world.selection.active && world.selection.tool == 'Selection'),
        data: currentZoneDataFill,
        image: settings.image
      });
    }
  }
};


function Animation() {
  this.current = {};
  return this;
};
Animation.prototype.getID = function () {
  return '_'+Date.now().toString(36);
};
Animation.prototype.getXYspriteSheet = function(id,nb) {
  var w = this.current[id].image.width-this.current[id].image.width%this.current[id].gw;
  return {
    x: (this.current[id].gw*(nb+1))%w-this.current[id].gw,
    y: this.current[id].gh*Math.floor((this.current[id].gw*nb)/w)
  };
};
Animation.prototype.add = function (data) {
  var _this = this;
  var id = this.getID();
  this.current[id] = data;
  this.current[id].index = 0;
  this.current[id].total = 0;
  this.current[id].idobj = id;
  this.current[id].isEnd = false;
  this.current[id].image = new Image();
  this.current[id].image.OK = false;
  var tmpanim = {};
  for (var i in this.current[id].animation) {
    if (this.current[id].animation.hasOwnProperty(i)) {
      tmpanim[this.current[id].animation[i].id] = {x:this.current[id].animation[i].x,y:this.current[id].animation[i].y};
      this.current[id].total = this.current[id].total < this.current[id].animation[i].id ? this.current[id].animation[i].id : this.current[id].total;
    }
  }
  this.current[id].animation = tmpanim;
  this.current[id].time = Date.now();
  this.load(id, function(){
    if (_this.current[id].autoplay) {
      _this.play(id);
    }
  });
  return this;
};
Animation.prototype.remove = function (id) {
  this.current[id] = null;
  delete this.current[id];
  return true;
};
Animation.prototype.load = function (id,c) {
  this.current[id].image = new Image();
  this.current[id].image.OK = false;
  this.current[id].image.onload = function(){
    this.OK = true;
    c();
  }
  this.current[id].image.src = 'assets/animation/'+this.current[id].src;
};
Animation.prototype.play = function (id) {
  for (var id in this.current) {
    if (this.current.hasOwnProperty(id)) {
      if (this.current[id].image.OK) {
        this.animate(this.current[id]);
        this.draw(this.current[id]);
      }
    }
  }
};
Animation.prototype.draw = function (obj) {
  if (typeof obj !== 'undefined') {
    ctx.beginPath();
    if (obj.position == 'relative') {
      var originX = world.x+world.mx;
      var originY = world.y+world.my;
      originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
      originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.scale(world.zoom, world.zoom);
      ctx.translate(originX, originY);
    }
    ctx.translate(obj.x,obj.y);
    var s = obj.animation[obj.index];
    ctx.drawImage(obj.image, s.x*obj.gw, s.y*obj.gh, obj.gw, obj.gh, 0, 0, obj.gw, obj.gh);
    ctx.setTransform(1,0,0,1,0,0);
  }
};
Animation.prototype.animate = function(obj) {
  if (Date.now() - obj.time > obj.speed*5) {
    obj.time = Date.now();
    obj.index = obj.index >= obj.total ? 0 : obj.index+1;
    if (!obj.loop && obj.index == 0) {
      this.remove(obj.idobj);
      obj.isEnd = true;
      obj.callback();
    }
  }
};


/*
      JAAJ™

      Programmeur Flammrock
      Infographiste Puladex



      Les personnages et les situations de ce récit étant purement fictifs,
      toute ressemblance avec des personnes ou des situations existantes
      ou ayant existé ne saurait être que fortuite.

*/

function Cinematic() {
  this.transition = {};
  this.FPS = 60 / 1000;
  this.onWork = false;
  this.TextSubtile = {};
};

Cinematic.prototype.getID = function () {
  return '_'+Date.now().toString(32);
};


//Basic Function
Cinematic.prototype.enable = function () {
  var div = document.getElementById('cinematicBar').children;
  div[0].style.top = '0px';
  div[1].style.bottom = '0px';
};
Cinematic.prototype.disable = function () {
  var div = document.getElementById('cinematicBar').children;
  div[0].style.top = '-150px';
  div[1].style.bottom = '-150px';
};
Cinematic.prototype.enableControlers = function () {
  player.enableControls = true;
};
Cinematic.prototype.disableControlers = function () {
  player.enableControls = false;
};

Cinematic.prototype.MoveCameraTo = function (position,x,y,time,next) {
  var _this = this;
  var id = this.getID();
  console.log('Start Move Camare to ',x,',',y,' in ',position,' mode',' in ',time,'ms');
  if (position == 'relative') {
    var dx = parseInt(x);
    var dy = parseInt(y);
    var fx = world.x-dx;
    var fy = world.y-dy;
  } else if (position == 'absolute') {
    var fx = parseInt(x)*-1;
    var fy = parseInt(y)*-1;
    var dx = world.x-fx;
    var dy = world.y-fy;
  }
  var vx = dx / parseInt(time) / _this.FPS;
  var vy = dy / parseInt(time) / _this.FPS;
  this.transition[id] = function() {
    var tmp1 = dx > 0 ? -world.x : world.x;
    var tmp2 = dy > 0 ? -world.y : world.y;
    if (position == 'absolute' && tmp1 >= fx && tmp2 >= fy) {
      _this.transition[id] = null;
      next();
    } else if (position == 'relative' && world.x <= fx && world.y <= fy) {
      _this.transition[id] = null;
      next();
    } else {
      world.x -= vx;
      world.y -= vy;
    }
  }
};
Cinematic.prototype.MoveEntityTo = function (entityID,position,x,y,time,next) {
  var _this = this;
  var id = this.getID();

  var mob = null;
  for (var i in world.ObjectMob) {
    if (world.ObjectMob.hasOwnProperty(i)) {
      if (world.ObjectMob[i].id == entityID) {
        mob = world.ObjectMob[i];
        break;
      }
    }
  }

  if (mob != null) {
    mob.moveToPos(position,x,y,time,function(){
      next();
    });
  } else {
    console.log('Mob too far or doesn\'t exist anymore!');
  }
};

Cinematic.prototype.addTextSubtile = function (data,next) {
  var id = this.getID();
  var settings = data || {};
  settings.id = id;
  settings.obj = this.TextSubtile;
  this.TextSubtile[id] = new componentsText(settings,next);
};

Cinematic.prototype.disableGame = function () {
  world.EnableGame = false;
};
Cinematic.prototype.enableGame = function () {
  world.EnableGame = true;
};


Cinematic.prototype.showVideo = function () {
  //Later....Later... Okay no pain today haha
};


function ArcEnCiel(c) {
  if (typeof c=='undefined'){c={}}
  this.R=c.R||255;
  this.G=c.G||0;
  this.B=c.B||0;
  this.alpha=c.alpha||1;
  this.v=c.v||5;
  this.clear={
    R:this.R,
    G:this.G,
    B:this.B,
    v:this.v
  };
};
ArcEnCiel.prototype.change = function() {
  if (this.R<255 && this.G<=0 && this.B<=0) {this.R+=this.v}
  else if (this.R>=255 && this.G<255 && this.B<=0) {this.G+=this.v}
  else if (this.R>0 && this.G>=255 && this.B<=0) {this.R-=this.v}
  else if (this.R<=0 && this.G>=255 && this.B<255) {this.B+=this.v}
  else if (this.R<=0 && this.G>0 && this.B>=255) {this.G-=this.v}
  else if (this.R<255 && this.G<=0 && this.B>=255) {this.R+=this.v}
  else {this.B-=this.v}
  if(this.R>255){this.R=255}if(this.R<0){this.R=0}
  if(this.G>255){this.G=255}if(this.G<0){this.G=0}
  if(this.B>255){this.B=255}if(this.B<0){this.B=0}
  this.rgb='rgba('+Math.round(this.R)+','+Math.round(this.G)+','+Math.round(this.B)+','+this.alpha+')';
  return this.rgb;
};
ArcEnCiel.prototype.reset = function() {
  this.R=this.clear.R;
  this.G=this.clear.G;
  this.B=this.clear.B;
  this.v=this.clear.v;
};


function Player(settings) {
  settings = settings || {};
  var _this = this;
  this.position = new Vector();
  this.velocity = new Vector();
  this.direction = 'left';
  this.tmpdirection = '';
  this.nextAction = '';
  this.factor = 100;
  this.ExecEvent = false;
  this.i = 0;
  this.OK = false;
  this.skin = new Image();
  this.skin.onload = function() {
    _this.OK = true;
  };
  this.skin.src = 'assets/mob/player/skin/'+(settings.skin || 'default')+'.png';
  this.spriteSheet = {
    posx: 0,
    posy: 0,
    dx: 64,
    dy: 64
  };
  this.boxCollision = new Polygon({
    points: [
      new Point(this.position.x-this.spriteSheet.dy/4+this.spriteSheet.dx/2,this.position.y-30+this.spriteSheet.dy),
      new Point(this.position.x+this.spriteSheet.dy/4+this.spriteSheet.dx/2,this.position.y-30+this.spriteSheet.dy),
      new Point(this.position.x+this.spriteSheet.dy/4+this.spriteSheet.dx/2,this.position.y-10+this.spriteSheet.dy),
      new Point(this.position.x-this.spriteSheet.dy/4+this.spriteSheet.dx/2,this.position.y-10+this.spriteSheet.dy)
    ],type:'COLLISION'
  });
  this.active_ = false;
  this.animation = {
    up: [42,43,44,45],
    down: [60,61,62,63],
    left: [7,8,9,10],
    right: [24,25,26,27],
    speed: 20,
    current: 0
  };
  this.memory = {};
  this.time = Date.now();
  this.animation.current = this.animation[this.direction][0];
  this.isLoaded = false;
  window['player'] = this;
  this.enableControls = true;
  this.currentEventObject = null;
};
Player.prototype = {
  getXYspriteSheet: function(id) {
    var w = this.skin.width-this.skin.width%this.spriteSheet.dx;
    return {
      x: (this.spriteSheet.dx*(id+1))%w-64,
      y: this.spriteSheet.dy*Math.floor((64*id)/w)
    };
  },
  update: function() {
    this.boxCollision.points = [
      new Point(this.position.x-this.spriteSheet.dy/4+this.spriteSheet.dx/2,this.position.y-30+this.spriteSheet.dy),
      new Point(this.position.x+this.spriteSheet.dy/4+this.spriteSheet.dx/2,this.position.y-30+this.spriteSheet.dy),
      new Point(this.position.x+this.spriteSheet.dy/4+this.spriteSheet.dx/2,this.position.y-10+this.spriteSheet.dy),
      new Point(this.position.x-this.spriteSheet.dy/4+this.spriteSheet.dx/2,this.position.y-10+this.spriteSheet.dy)
    ];
    world.checkCollision();
    if (!this.boxCollision.collision.b) {
      this.velocity.init(0,0);

      if (this.enableControls) {
        if (this.nextAction != 'stop') {
          var touchMove = false;
          if (mouse.isLeftDown) {
            touchMove = true;
            this.move(mouse.getPosFromScreen());
          }
          if (Key.isDown(Key.UP)) this.move('up');
          if (Key.isDown(Key.LEFT)) this.move('left');
          if (Key.isDown(Key.DOWN)) this.move('down');
          if (Key.isDown(Key.RIGHT)) this.move('right');
          if (!Key.isDown(Key.UP) && !Key.isDown(Key.LEFT) && !Key.isDown(Key.DOWN) && !Key.isDown(Key.RIGHT) && !touchMove) {
            this.move('stop');
          }
        }
      }

      this.nextAction = '';
      this.animate();
      this.position.add(this.velocity);
      if (!cinematic.onWork) {
        world.x = -this.position.x-this.spriteSheet.dx/2;
        world.y = -this.position.y-this.spriteSheet.dy/2;
      }
    } else {
      var isMove = (this.velocity.x==0 && this.velocity.y==0 && this.velocity.z==0) ? false : true;
      if (this.boxCollision.collision.isMove && isMove) {
        this.nextAction = 'stop';
      }
      this.velocity.negative();
      this.tmpdirection = this.direction;
      this.position.add(this.velocity);
      if (!cinematic.onWork) {
        world.x = -this.position.x-this.spriteSheet.dx/2;
        world.y = -this.position.y-this.spriteSheet.dy/2;
      }
    }
    world.checkEvent();
    var xy = world.getRelativeXY();
    var oldxy = world.oldArea;
    if (xy.x!=oldxy.x || xy.y!=oldxy.y) {world.oldArea=xy;console.log('Change!');window.onchangearea('['+xy.x+','+xy.y+']'+world.currentMap);}
    this.boxCollision.points = [
      new Point(this.position.x-this.spriteSheet.dy/4+this.spriteSheet.dx/2,this.position.y-30+this.spriteSheet.dy),
      new Point(this.position.x+this.spriteSheet.dy/4+this.spriteSheet.dx/2,this.position.y-30+this.spriteSheet.dy),
      new Point(this.position.x+this.spriteSheet.dy/4+this.spriteSheet.dx/2,this.position.y-10+this.spriteSheet.dy),
      new Point(this.position.x-this.spriteSheet.dy/4+this.spriteSheet.dx/2,this.position.y-10+this.spriteSheet.dy)
    ];
  },
  move: function(d) {
    switch (d) {
      case 'up':
        if (this.tmpdirection!=d) {
          this.velocity.x = 0;
          this.velocity.y = -300/this.factor;
          this.tmpdirection = '';
        }
        this.direction = 'up';
        break;
      case 'left':
        if (this.tmpdirection!=d) {
          this.velocity.x = -300/this.factor;
          this.velocity.y = 0;
          this.tmpdirection = '';
        }
        this.direction = 'left';
        break;
      case 'down':
        if (this.tmpdirection!=d) {
          this.velocity.x = 0;
          this.velocity.y = 300/this.factor;
          this.tmpdirection = '';
        }
        this.direction = 'down';
        break;
      case 'right':
        if (this.tmpdirection!=d) {
          this.velocity.x = 300/this.factor;
          this.velocity.y = 0;
          this.tmpdirection = '';
        }
        this.direction = 'right';
        break;
      default:
        this.velocity.init(0,0);
        this.i = 0;
        this.animation.current = this.animation[this.direction][this.i];
        this.tmpdirection = '';
    }
  },
  draw: function() {
    if (this.OK) {
      ctx.beginPath();
      var originX = world.x+world.mx;
      var originY = world.y+world.my;
      originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
      originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.scale(world.zoom, world.zoom);
      ctx.translate(originX, originY);
      ctx.translate(this.position.x,this.position.y);
      var s = this.getXYspriteSheet(this.animation.current);
      ctx.drawImage(this.skin, s.x, s.y, this.spriteSheet.dx, this.spriteSheet.dy, 0, 0, this.spriteSheet.dx, this.spriteSheet.dy);
      ctx.setTransform(1,0,0,1,0,0);
    }
  },
  onEvent: function(e) {
    var _this = this;
    if (!this.ExecEvent) {
      this.ExecEvent = true;
      this.currentEventObject = goclone(e);
      var xy = world.getRelativeXY();
      bluePrint.readBluePrint(e.data.name,'['+xy.x+','+xy.y+']'+world.currentMap);
    }
  },
  animate: function() {
    if (Date.now() - this.time > this.animation.speed*5) {
      this.time = Date.now();
      if (this.velocity.x != 0 || this.velocity.y != 0) {
        this.i = this.i!=0 ? this.i%(this.animation[this.direction].length-1)==0 ? 0 : this.i+1 : this.i+1;
        this.animation.current = this.animation[this.direction][this.i];
      } else {
        this.i = 0;
        this.animation.current = this.animation[this.direction][this.i];
      }
    }
  },
  active: function(a) {
    this.active_ = a;
    this.position.init(-world.x-this.spriteSheet.dx/2,-world.y-this.spriteSheet.dy/2);
    world.zoom = 1.2;
    world.oldScale = world.scale;
    world.scale *= world.zoom;
    if (!a) {
      ui.show();
      $('body').css('background','#fff');
      var xy = world.getRelativeXY();
      var oldxy = xy;
      window.onchangearea();
    } else {
      ui.hide();
      $('body').css('background','#000');
      var xy = world.getRelativeXY();
      var oldxy = xy;
      window.onchangearea('['+xy.x+','+xy.y+']'+world.currentMap);
    }
  },
  getData: function() {
    return {
      boxCollision:this.boxCollision,
      memory:this.memory,
      animation:this.animation,
      spriteSheet:this.spriteSheet,
      skin:this.skin,
      direction:this.direction,
      position:this.position,
      velocity:this.velocity
    };
  },

  addJaaj: function(a,c) {
    //if (typeof )
  }
};
/*
{
  jaajs: [
    {name:'bitenbois',id:1,exp:0,lvl:2,hp:25,pp:100,listAttack:[{name:'toenail',power:10,type:'Normal',costPP:1}]},
    {name:'TITOUAN',id:1,exp:0,lvl:24,hp:50,pp:100,listAttack:[{name:'DESTRUCTION',power:20,type:'Normal',costPP:1}]},
    {name:'bitenbois',id:1,exp:0,lvl:24,hp:50,pp:100,listAttack:[{name:'DESTRUCTION',power:20,type:'Normal',costPP:1}]}
  ],
  items: []
}
*/


function Mob(settings) {
  settings = settings || {};
  var _this = this;
  this.position = new Vector();
  this.velocity = new Vector();
  this.area = '';
  this.mob = true;
  this.id = settings.id || false;
  this.name = settings.name || false;
  this.ready = false;
  this.FPS = 60 / 1000;
  this.animationReady = false;
  this.spriteSheet = new Image();
  this.spriteSheet.onload = function() {
    _this.ready = true;
  };
  this.direction = 'down';
  this.getAnimation();
  this.gw = 0;
  this.gh = 0;

  this.boxData = {
    collision: {},
    event: {}
  };

  this.boxCollision = {};
  this.boxEvent = {};

  this.memory = {};

  this.currentAnim = null;

  this.isClick = false;
  this.time = Date.now();

  this.getData();
};
Mob.prototype = {
  getData: function () {
    var _this = this;
    var d = {
      mode: 'SELECTw',
      table: 'mobs',
      where: 'idMob',
      whereValue: this.id
    };
    socket.SetMysql(d,function(data){
      if (data.length > 0) {
        var MobData = JSON.parse(data[0].data);
        _this.position.init(MobData.x,MobData.y);
        try {
          _this.memory = JSON.parse(data[0].memory);
        } catch (e) {
          _this.memory = {};
        }

        var d = {
          mode: 'SELECTw',
          table: 'mobs_constructor',
          where: 'name',
          whereValue: _this.name
        };
        socket.SetMysql(d,function(datac){
          var MobData_Constructor = JSON.parse(datac[0].data);
          _this.gw = MobData_Constructor.gw;
          _this.gh = MobData_Constructor.gh;
          var collisionBoxPoints = cleanObjectFromJSON(MobData_Constructor.collisionBox);
          var eventBoxPoints = cleanObjectFromJSON(MobData_Constructor.eventBox);
          _this.boxData = {
            collision: Object.assign({},collisionBoxPoints),
            event: Object.assign({},eventBoxPoints)
          };
          _this.boxCollision = new Polygon({
            points: [
              new Point(_this.position.x+collisionBoxPoints.start.x,_this.position.y+collisionBoxPoints.start.y),
              new Point(_this.position.x+collisionBoxPoints.end.x,_this.position.y+collisionBoxPoints.start.y),
              new Point(_this.position.x+collisionBoxPoints.end.x,_this.position.y+collisionBoxPoints.end.y),
              new Point(_this.position.x+collisionBoxPoints.start.x,_this.position.y+collisionBoxPoints.end.y)
            ],type:'COLLISION',data:{idmob:_this.id}
          });
          _this.boxEvent = new Polygon({
            points: [
              new Point(_this.position.x+eventBoxPoints.start.x,_this.position.y+eventBoxPoints.start.y),
              new Point(_this.position.x+eventBoxPoints.end.x,_this.position.y+eventBoxPoints.start.y),
              new Point(_this.position.x+eventBoxPoints.end.x,_this.position.y+eventBoxPoints.end.y),
              new Point(_this.position.x+eventBoxPoints.start.x,_this.position.y+eventBoxPoints.end.y)
            ],type:'EVENT',data:{idmob:_this.id,name:_this.id+'-'+_this.name+'_MOB'}
          });
          _this.spriteSheet.src = 'assets/mob/'+MobData_Constructor.spriteSheet;
        });
      }
    });
  },
  getAnimation: function () {
    var _this = this;
    var tmpanim = mobs_constructorList[this.name].animation || false;
    this.animation = {
      down:[],
      up:[],
      left:[],
      right:[],
      current:0,
      speed:30
    };
    for (var i in tmpanim) {
      if (tmpanim.hasOwnProperty(i)) {
        this.animation[tmpanim[i].direction].push({
          x:tmpanim[i].x,
          y:tmpanim[i].y
        });
      }
    }
    this.animationReady = true;
  },
  draw: function() {
    if (this.ready && this.animationReady) {
      if (this.currentAnim != null) this.currentAnim();
      this.animate();
      if (this.isClick) {
        var xy = mouse.getAbsoluteXY();
        this.position.init(xy.x+500-5,xy.y+500+30/1.5/2);
        this.boxCollision.points = [
          new Point(this.position.x+this.boxData.collision.start.x,this.position.y+this.boxData.collision.start.y),
          new Point(this.position.x+this.boxData.collision.end.x,this.position.y+this.boxData.collision.start.y),
          new Point(this.position.x+this.boxData.collision.end.x,this.position.y+this.boxData.collision.end.y),
          new Point(this.position.x+this.boxData.collision.start.x,this.position.y+this.boxData.collision.end.y)
        ];
        this.boxEvent.points = [
          new Point(this.position.x+this.boxData.event.start.x,this.position.y+this.boxData.event.start.y),
          new Point(this.position.x+this.boxData.event.end.x,this.position.y+this.boxData.event.start.y),
          new Point(this.position.x+this.boxData.event.end.x,this.position.y+this.boxData.event.end.y),
          new Point(this.position.x+this.boxData.event.start.x,this.position.y+this.boxData.event.end.y)
        ];
      }
      ctx.beginPath();
      var originX = world.x+world.mx;
      var originY = world.y+world.my;
      originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
      originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.scale(world.zoom, world.zoom);
      ctx.translate(originX, originY);
      ctx.translate(this.position.x,this.position.y);
      ctx.drawImage(this.spriteSheet, this.animation[this.direction][this.animation.current].x*this.gw, this.animation[this.direction][this.animation.current].y*this.gh, this.gw, this.gh, 0, 0, this.gw, this.gh);
      var rect = canvas.getBoundingClientRect();
      world.viewWidth = canvas.width/world.zoom;
      world.viewHeight = canvas.height/world.zoom;

      var m = {
        x: (mouse.x-rect.left),
        y: (mouse.y-rect.top)
      };
      var x = m.x/world.zoom-(world.x+world.mx+world.viewWidth/2);
      var y = m.y/world.zoom-(world.y+world.my+world.viewHeight/2);

      //Il faut dessiner un bouton pour supprimer le mob, un bouton pour le déplacer et un bouton pour éditer sa mémoire
      if (!mouse.isLeftDown && this.isClick) {
        this.isClick = false;
        var xy = mouse.getRelativeXY();
        var area = '['+xy.x+','+xy.y+']'+world.currentMap;
        var d = {
          mode: 'UPDATE',
          table: 'mobs',
          where: 'idMob',
          whereValue: this.id,
          row: {}
        };
        var xy = mouse.getAbsoluteXY();
        var Obj = {
          name: this.name,
          x: xy.x+500-5,
          y: xy.y+500+30/1.5/2
        };
        d.row['area'] = area;
        d.row['data'] = JSON.stringify(Obj);
        socket.SetMysql(d,function(data){
          window.onchangearea();
        });
      }
      if (!player.active_) {
        ctx.translate(0,-30/1.5);
        ctx.beginPath();
        ctx.rect(0,0,30/1.5,30/1.5);
        ctx.strokeStyle = 'rgba(0,0,0,0)';
        if (ctx.isPointInPath(m.x,m.y) && world.editorHover) {
          ctx.fillStyle = '#fff';
          if (mouse.isLeftDown) {
            //MOVE
            this.isClick = true;
          }
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
        }
        ctx.beginPath();
        ctx.save();
        ctx.scale(1.5,1.5);
        ctx.Icons('move');
        ctx.restore();
        ctx.fill();
        ctx.stroke();


        ctx.translate(30/1.5,0);
        ctx.beginPath();
        ctx.rect(0,0,30/1.5,30/1.5);
        ctx.strokeStyle = 'rgba(0,0,0,0)';
        if (ctx.isPointInPath(m.x,m.y) && world.editorHover) {
          ctx.fillStyle = '#fff';
          if (mouse.isLeftDown) {
            mouse.isLeftDown = false;
            //MEMORY
            var __this = this;
            new JSONeditor(this.memory,this.id,function(new_memory){
              try {
                var d = {
                  mode: 'UPDATE',
                  table: 'mobs',
                  where: 'idMob',
                  whereValue: __this.id,
                  row: {}
                };
                d.row['memory'] = JSON.stringify(new_memory);
                __this.memory = new_memory;
                socket.SetMysql(d,function(data){
                  new toolTip('<span style="color: #0f0;">Mob: Success Memory Save!</span>',4000);
                });
              } catch (e) {
                new toolTip('<span style="color: #f00;">Mob: Error Memory save!</span>',4000);
              }
            });
          }
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
        }
        ctx.beginPath();
        ctx.save();
        ctx.scale(1.5,1.5);
        ctx.Icons('gear');
        ctx.restore();
        ctx.fill();
        ctx.stroke();


        ctx.translate(30/1.5,0);
        ctx.beginPath();
        ctx.rect(0,0,30/1.5,30/1.5);
        ctx.strokeStyle = 'rgba(0,0,0,0)';
        if (ctx.isPointInPath(m.x,m.y) && world.editorHover) {
          ctx.fillStyle = '#fff';
          if (mouse.isLeftDown) {
            mouse.isLeftDown = false;
            //FULLY DELETE
            this.del();
          }
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
        }
        ctx.beginPath();
        ctx.save();
        ctx.translate(0,-2);
        ctx.scale(1,1);
        ctx.Icons('close');
        ctx.restore();
        ctx.fill();
        ctx.stroke();
      }
      ctx.setTransform(1,0,0,1,0,0);
    }
  },
  buildPath: function (x,y,position) {
    if (position == 'relative') {
      var dist = Math.sqrt(Math.sqrt(Math.pow(this.position.x-x,2)+Math.pow(this.position.y-y,2))*10/500)*2;
      var coeffy = (Math.abs(y)-Math.abs(this.position.y))/dist;
      var coeffx = (Math.abs(x)-Math.abs(this.position.x))/dist;
    } else if (position == 'absolute') {
      var dist = Math.sqrt(Math.sqrt(Math.pow(x,2)+Math.pow(y,2))*10/500)*2;
      var coeffy = (Math.abs(y))/dist;
      var coeffx = (Math.abs(x))/dist;
    }
    var tmpx = 0;
    var tmpy = 0;
    var i = 0;
    var tmppath = [];
    var realdist = 0;
    while (Math.abs(tmpx) < Math.abs(x) && Math.abs(tmpy) < Math.abs(y)) {
      if (i%2 == 0) {
        tmpx += coeffx;
        realdist += Math.abs(coeffx);
      } else {
        tmpy += coeffy;
        realdist += Math.abs(coeffy);
      }
      tmppath.push({
        x:tmpx,
        y:tmpy
      });
      i++;
    }
    return {p:tmppath,d:realdist};
  },
  moveToPos: function (position,x,y,time,next) {
    var _this = this;
    var i = 0;

    var tmpx = this.position.x;
    var tmpy = this.position.y;
    if (position == 'relative') {
      var dx = parseInt(x);
      var dy = parseInt(y);
      var dtmpx = 0;
      var dtmpy = 0;
    } else if (position == 'absolute') {
      var dx = parseInt(x)-tmpx;
      var dy = parseInt(y)-tmpy;
      var dtmpx = 0;
      var dtmpy = 0;
    }

    var delta = this.buildPath(dx,dy,position);
    var path = delta.p;
    var dist = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2))*2;

    var dex = dx < 0 ? -1 : 1;
    var dey = dy < 0 ? -1 : 1;;

    var vx = delta.d*dex / parseInt(time) / _this.FPS;
    var vy = delta.d*dey / parseInt(time) / _this.FPS;

    var savePos = {
      x:this.position.x,
      y:this.position.y
    };
    function Move(path,i) {
      if (typeof path[i] !== 'undefined') {
        _this.velocity.init(1,1);
        _this.currentAnim = function(){
          if (i%2 == 0) {
            if (Math.abs(dtmpx) < Math.abs(path[i].x)) {
              _this.position.x += vx;
              dtmpx += vx;
              if (vx < 0) {
                _this.direction = 'left';
              } else if (vx > 0) {
                _this.direction = 'right';
              }
            } else {
              i++;
              Move(path,i);
            }
          } else {
            if (Math.abs(dtmpy) < Math.abs(path[i].y)) {
              _this.position.y += vy;
              dtmpy += vy;
              if (vy < 0) {
                _this.direction = 'up';
              } else if (vy > 0) {
                _this.direction = 'down';
              }
            } else {
              i++;
              Move(path,i);
            }
          }
        };
      } else {
        _this.currentAnim = null;
        _this.velocity.init(0,0);
        _this.position.init(savePos.x,savePos.y);
        next();
      }
    }
    Move(path,i);
  },
  animate: function() {
    if (Date.now() - this.time > this.animation.speed*5) {
      this.time = Date.now();
      if (this.velocity.x != 0 || this.velocity.y != 0) {
        this.animation.current++;
        if (typeof this.animation[this.direction][this.animation.current] === 'undefined') {
          this.animation.current = 0;
        }
      } else {
        this.animation.current = 0;
      }
    }
  },
  del: function() {
    var _this = this;
    ui.NeedValid(function(){
      var d = {
        mode: 'DELETE',
        table: 'mobs',
        where: 'idMob',
        whereValue: _this.id
      };
      socket.SetMysql(d,function(data){
        if (data.success) {
          socket.sk.emit('JAAJeditorDeleteFile','assets/editor/Entity_BluePrint_'+_this.id+'-'+_this.name+'_MOB.json');
        }
      });
      for (var i in world.ObjectMob) {
        if (world.ObjectMob.hasOwnProperty(i)) {
          if (world.ObjectMob[i].id == _this.id) {
            world.ObjectMob[i] = null;
            delete world.ObjectMob[i];
            break;
          }
        }
      }
      var objTest = [world.ObjectEvent,world.ObjectCollision];
      for (var i = 0; i < objTest.length; i++) {
        var obj = objTest[i];
        ObjLoop:
        for (var e in obj) {
          if (obj.hasOwnProperty(e)) {
            if (typeof obj[e].data.idmob != 'undefined') {
              if (obj[e].data.idmob == _this.id) {
                if (i==0) {
                  world.ObjectEvent[e] = null;
                  delete world.ObjectEvent[e];
                } else {
                  world.ObjectCollision[e] = null;
                  delete world.ObjectCollision[e];
                }
                break ObjLoop;
              }
            }
          }
        }
      }

    },'Are you sure you want to delete this pnj, it seems very important (according to our algorithms very powerful)?');
  }
};


function World(settings) {
  this.x = -500;
  this.y = -500;
  this.mx = 0;
  this.my = 0;
  this.nb = 0;
  this.currentMap = '';
  this.charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
  this.gridArea = typeof settings.gridArea != 'undefined' ? settings.gridArea : false;
  this.gridTile = typeof settings.gridTile != 'undefined' ? settings.gridTile : false;
  this.currentArea = typeof settings.currentArea != 'undefined' ? settings.currentArea : false;
  this.cross = typeof settings.cross != 'undefined' ? settings.cross : false;
  this.scale = 0.7200000000000001;
  this.oldScale =  0.9;
  this.zoom = 0.8;
  this.drag = true;
  this.windowDragId = false;
  this.drawX = 0;
  this.drawY = 0;
  this.display = true;
  this.Fight = false;
  this.tmp = {};
  this.tmp2 = {};
  this.tmp3 = {};
  this.drawWidth = 0;
  this.drawHeight = 0;
  this.editorHover = true;
  this.ondrawb = false;
  this.listZone = [];
  this.selection = {
    pointStart: {x:0,y:0},
    pointEnd: {x:0,y:0},
    isClick: false,
    offset:0,
    active: false,
    color: new ArcEnCiel()
  };
  this.ObjectCollision = {};
  this.ObjectEvent = {};
  this.ObjectMob = {};
  this.selectionImages = [];
  this.selectionImagesOK = false;
  this.oldArea = this.getRelativeXY();
  this.time = 12;
  this.EnableGame = true;
  window['world'] = this;
}
World.prototype = {
  draw: function() {
    //----> True draw
    resource.draw();

    if (!player.active_) {
      //----> False draw, survol du tilset en cours...
      // (Only if Pencil Tool was selected)
      if (this.drawWidth!=0 && this.drawHeight!=0 && resource.currentTilesetOK && ui.selectMode == 'Pencil') {
        this.listZone = this.checkZoneToDraw(mouse.getAbsoluteXY(),this.drawX,this.drawY,this.drawWidth,this.drawHeight);
        for (var i = 0; i < this.listZone.length; i++) {
          var currentZone = this.listZone[i];
          //if (currentZone.isLayerSelected) {
            ctx.beginPath();
            this.viewWidth = canvas.width/this.zoom;
            this.viewHeight = canvas.height/this.zoom;
            var originX = world.x+world.mx;
            var originY = world.y+world.my;
            originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
            originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.scale(world.zoom, world.zoom);
            ctx.translate(originX, originY);

            if (world.selection.active && world.selection.tool == 'Selection') {
              var testStart = world.selection.ApointStart;
              var testEnd = world.selection.ApointEnd;
              var testAreaStart = '['+testStart.x+','+testStart.y+']'+world.currentMap;
              var testAreaEnd = '['+testEnd.x+','+testEnd.y+']'+world.currentMap;

              var area = '['+currentZone.x+','+currentZone.y+']'+world.currentMap;

              var arrt = [currentZone.x,currentZone.y];
              var art1 = currentZone.x;
              var art2 = currentZone.y;

              var xmin = world.selection.pointStart.x<0?1000-((Math.abs(world.selection.pointStart.x%1000)+500)%1000):((world.selection.pointStart.x%1000)+500)%1000,
                  ymin = world.selection.pointStart.y<0?1000-((Math.abs(world.selection.pointStart.y%1000)+500)%1000):((world.selection.pointStart.y%1000)+500)%1000;
              var xmax = world.selection.pointEnd.x<0?1000-((Math.abs(world.selection.pointEnd.x%1000)+500)%1000):((world.selection.pointEnd.x%1000)+500)%1000,
                  ymax = world.selection.pointEnd.y<0?1000-((Math.abs(world.selection.pointEnd.y%1000)+500)%1000):((world.selection.pointEnd.y%1000)+500)%1000;

              var sx = currentZone.offX+currentZone.Tx,
                  sy = currentZone.offY+currentZone.Ty,
                  sw = currentZone.endX-currentZone.startX,
                  sh = currentZone.endY-currentZone.startY,
                  dx = currentZone.x*1000+currentZone.startX,
                  dy = currentZone.y*1000+currentZone.startY,
                  dw = currentZone.endX-currentZone.startX,
                  dh = currentZone.endY-currentZone.startY;

              if (art1 == testStart.x) {
                if (dx < xmin) {
                  sx -= dx-xmin;
                  sw += dx-xmin;
                  dw += dx-xmin;
                  dx = xmin;
                }
              }
              if (art2 == testStart.y) {
                if (dy < ymin) {
                  sy -= dy-ymin;
                  sh += dy-ymin;
                  dh += dy-ymin;
                  dy = ymin;
                }
              }
              if (art1 == testEnd.x) {
                if (dx+dw > xmax) {
                  sw -= (dx+dw)-xmax;
                  dw -= (dx+dw)-xmax;
                  dx = xmax-dw;
                }
              }
              if (art2 == testEnd.y) {
                if (dy+dh > ymax) {
                  sh -= (dy+dh)-ymax;
                  dh -= (dy+dh)-ymax;
                  dy = ymax-dh;
                }
              }
              if (art1 < testStart.x) {
                dw = 0;
              }
              if (art2 < testStart.y) {
                dh = 0;
              }
              if (art1 > testEnd.x) {
                dw = 0;
              }
              if (art2 > testEnd.y) {
                dh = 0;
              }

              if (dw > 0 && dh > 0) {
                ctx.drawImage(resource.currentTilesetIMAGE, sx, sy, sw, sh, dx, dy, dw, dh);
              }
            } else {
              ctx.drawImage(resource.currentTilesetIMAGE, currentZone.offX+currentZone.Tx, currentZone.offY+currentZone.Ty, currentZone.endX-currentZone.startX, currentZone.endY-currentZone.startY, currentZone.x*1000+currentZone.startX, currentZone.y*1000+currentZone.startY, currentZone.endX-currentZone.startX, currentZone.endY-currentZone.startY);
            }


            ctx.setTransform(1,0,0,1,0,0);
          //}
        }
      } else if (ui.selectMode == 'Rubber') {
        //Multicolor transition every tick
        this.listZone = this.checkZoneToDraw(mouse.getAbsoluteXY(),0,0,ui.RubberSize,ui.RubberSize);
        var cm = mouse.getAbsoluteXY();
        ctx.beginPath();
        this.viewWidth = canvas.width/this.zoom;
        this.viewHeight = canvas.height/this.zoom;
        var originX = world.x+world.mx+500;
        var originY = world.y+world.my+500;
        originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
        originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(world.zoom, world.zoom);
        ctx.translate(originX, originY);
        ctx.translate(cm.x, cm.y);
        ctx.rect(-ui.RubberSize/2,-ui.RubberSize/2,ui.RubberSize,ui.RubberSize);
        ctx.fillStyle = ui.RubberColor.change();
        ctx.fill();
        ctx.setTransform(1,0,0,1,0,0);
      } else if (this.drawWidth!=0 && this.drawHeight!=0 && resource.currentTilesetOK && ui.selectMode == 'Fill') {
        this.listZone = this.checkZoneToDraw(mouse.getAbsoluteXY(),0,0,1,1);
      }

      if (ui.selectMode == 'AddMob' && resource.currentSpriteSheetSELECTED) {
        var xy = mouse.getAbsoluteXY();
        ctx.beginPath();
        this.viewWidth = canvas.width/this.zoom;
        this.viewHeight = canvas.height/this.zoom;
        var originX = world.x+world.mx;
        var originY = world.y+world.my;
        originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
        originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(world.zoom, world.zoom);
        ctx.translate(originX, originY);
        ctx.drawImage(resource.currentSpriteSheetIMAGE, 0, 0, resource.currentSpriteSheetGW, resource.currentSpriteSheetGH, xy.x+500-resource.currentSpriteSheetGW/2, xy.y+500-resource.currentSpriteSheetGH/2, resource.currentSpriteSheetGW, resource.currentSpriteSheetGH);
        ctx.setTransform(1,0,0,1,0,0);
      }

      if (this.cross) {
        ctx.beginPath();
        ctx.translate(canvas.width/2,canvas.height/2);
        ctx.moveTo(-10,0);
        ctx.lineTo(10,0);
        ctx.moveTo(0,10);
        ctx.lineTo(0,-10);
        ctx.strokeStyle = '#f00';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setTransform(1,0,0,1,0,0);
      }

      if (this.gridTile) {this.drawGrid(8,8,'rgba(100,100,100,0.3)');}
      if (this.gridArea) {this.drawGrid(1000,1000,'#555','AREA');}

      if (this.currentArea) {
        var xy = world.getRelativeXY();
        var mx = world.x+world.mx+(xy.x*1000);
        var my = world.y+world.my+(xy.y*1000);
        ctx.beginPath();
        var originX = mx;
        var originY = my;
        originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
        originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(world.zoom, world.zoom);
        ctx.translate(originX, originY);
        ctx.rect(0,0,1000,1000);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#f00';
        ctx.stroke();
        ctx.setTransform(1,0,0,1,0,0);
      }

      ctx.beginPath();
      var originX = world.x+world.mx;
      var originY = world.y+world.my;
      originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
      originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.scale(world.zoom, world.zoom);
      ctx.translate(originX, originY);
      ctx.translate(500,500);
      ctx.font = '220px sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(31,31,31,0.3)';
      ctx.fillText('CENTER',0,0);
      ctx.setTransform(1,0,0,1,0,0);

      if (world.selection.active) {
        ctx.beginPath();
        var originX = world.x+world.mx;
        var originY = world.y+world.my;
        originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
        originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(world.zoom, world.zoom);
        ctx.translate(originX, originY);
        ctx.translate(world.selection.pointStart.x+500,world.selection.pointStart.y+500);
        ctx.rect(0,0,world.selection.pointEnd.x-world.selection.pointStart.x,world.selection.pointEnd.y-world.selection.pointStart.y);
        if (world.selection.tool == 'Selection') {
          ctx.setLineDash([10,10]);
          ctx.lineDashOffset = world.selection.offset;
          if (world.selection.offset == 10) {
            world.selection.offset = 0;
          } else {
            world.selection.offset++;
          }
          var c = world.selection.color.change();
          ctx.strokeStyle = c;
          $('#selectionTileset').removeClass('active');
          document.getElementById('selectionTileset').style.background = c;
          ctx.lineWidth = 5;
        } else if (world.selection.tool == 'CollisionRectangle') {
          ctx.strokeStyle = '#f00';
          ctx.fillStyle = 'rgba(255,0,0,0.4)';
          ctx.fill();
        } else if (world.selection.tool == 'EventRectangle') {
          ctx.strokeStyle = '#0f0';
          ctx.fillStyle = 'rgba(0,255,0,0.4)';
          ctx.fill();
        }

        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.setLineDash([0]);
        ctx.setTransform(1,0,0,1,0,0);
      }
    }
  },
  drawGrid: function(gw,gh,gc,gt) {
    var mx = Math.round((world.x+world.mx)%gw);
    var my = Math.round((world.y+world.my)%gh);
    var xx = Math.ceil(((canvas.width/world.zoom)/(gw > canvas.width/3 ? gw/2 : gw))/2)+5;
    var yy = Math.ceil(((canvas.height/world.zoom)/(gh > canvas.height/3 ? gh/2 : gh))/2)+5;
    for (var i = -xx, len = xx; i < len; i++) {
      ctx.beginPath();
      var originX = mx;
      var originY = my;
      originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
      originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.scale(world.zoom, world.zoom);
      ctx.translate(originX, originY);
      ctx.translate(gw*i,0);
      ctx.moveTo(0,-canvas.height/world.zoom/2-500-gh/2);
      ctx.lineTo(0,canvas.height/world.zoom/2+500+gh/2);
      ctx.strokeStyle = gc;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setTransform(1,0,0,1,0,0);
    }
    for (var i = -yy, len = yy; i < len; i++) {
      ctx.beginPath();
      var originX = mx;
      var originY = my;
      originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
      originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.scale(world.zoom, world.zoom);
      ctx.translate(originX, originY);
      ctx.translate(0,gh*i);
      ctx.moveTo(-canvas.width/world.zoom/2-500-gw/2,0);
      ctx.lineTo(canvas.width/world.zoom/2+500+gw/2,0);
      ctx.strokeStyle = gc;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setTransform(1,0,0,1,0,0);
    }

    if (typeof gt != 'undefined') {
      var tt = xx>yy?xx:yy;

      for (var i = -tt; i < tt; i++) {for (var j = -tt; j < tt; j++) {
        ctx.beginPath();
        var originX = mx;
        var originY = my;
        originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
        originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(world.zoom, world.zoom);
        ctx.translate(originX, originY);
        ctx.translate(500+gw*i,500+j*gh);
        ctx.font = '100px sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(31,31,31,0.3)';
        var get = {
          x: Math.round((gw*i-world.x-world.mx-1000/2)/1000),
          y: Math.round((j*gh-world.y-world.my-1000/2)/1000)
        };
        get = {
          x: Math.abs(get.x)==0?0:get.x,
          y: Math.abs(get.y)==0?0:get.y
        };
        get.x+=world.x+world.mx>0?1:0;
        get.y+=world.y+world.my>0?1:0;
        if ('['+get.x+','+get.y+']' != '[0,0]') {
          ctx.fillText(gt+' ['+get.x+','+get.y+']',0,0);
        }
        /*if (map.datalayer['['+get.x+','+get.y+']']) {
          ctx.font = '30px sans-serif';
          ctx.textAlign = "left";
          ctx.textBaseline = 'top';
          ctx.fillStyle = 'rgba(31,31,31,0.3)';
          if (ui.AUTO) {
            ctx.fillText('AUTO',-500,-500);
          } else {
            ctx.fillText(map.datalayer['['+get.x+','+get.y+']'].text,-500,-500);
          }
        }*/
        ctx.setTransform(1,0,0,1,0,0);
      }
    }}

  },
  drawTileset: function() {
    //On dessine sur des canvas temporaire --->

    //On dessine l'image sur un canvas NORMAL et sur un ZNORMAL
    //Les 2 images sont construites au moment de la sélection
    /*
    socket.listSocketData.images[data.name] = {
      NORMAL: data.NORMAL,
      ZNORMAL: data.ZNORMAL
    };
    } else {
    socket.listSocketData[data.name] = data;
    if (typeof data.mouse != 'undefined') {
      if (typeof data.mouse.isLeftDown != 'undefined') {

      }
    }
    */
    for (var c in world.selectionImages) {
      if (world.selectionImages.hasOwnProperty(c)) {
        for (var i = 0; i < this.listZone.length; i++) {
          var currentZone = this.listZone[i];
          var area = '['+currentZone.x+','+currentZone.y+']'+world.currentMap;
          var tmpcanvas, tmpctx;
          if (document.getElementById('TMP_CANVAS_AREA_'+area+'_'+c)) {
            tmpcanvas = document.getElementById('TMP_CANVAS_AREA_'+area+'_'+c);
            tmpctx = tmpcanvas.getContext('2d');
          } else {
            tmpcanvas = document.createElement('canvas');
            tmpcanvas.id = 'TMP_CANVAS_AREA_'+area+'_'+c;
            tmpcanvas.className = 'tmpcanvas notVisible';
            document.getElementById('jaajCanvasTempDraw').appendChild(tmpcanvas);
            tmpctx = tmpcanvas.getContext('2d');
            tmpcanvas.width = 1000;
            tmpcanvas.height = 1000;
            getLayerImage = resource.getAreaLayer(area,c);
            if (getLayerImage.ready) {
              tmpctx.drawImage(getLayerImage.image, 0, 0, getLayerImage.image.width, getLayerImage.image.height);
              world.tmp[area+'_'+c] = true;
            } else if (!getLayerImage.exist) {
              world.tmp[area+'_'+c] = true;
            } else {
              world.tmp[area+'_'+c] = false;
            }
            resource.setAreaLayerEMPTY(area,c,{
              x: currentZone.x*1000,
              y: currentZone.y*1000
            });
          }

          if (!world.tmp[area+'_'+c]) {
            getLayerImage = resource.getAreaLayer(area,c);
            if (getLayerImage.ready) {
              tmpctx.drawImage(getLayerImage.image, 0, 0, getLayerImage.image.width, getLayerImage.image.height);
              world.tmp[area+'_'+c] = true;
            } else if (!getLayerImage.exist) {
              world.tmp[area+'_'+c] = true;
            } else {
              world.tmp[area+'_'+c] = false;
            }
            resource.setAreaLayerEMPTY(area,c,{
              x: currentZone.x*1000,
              y: currentZone.y*1000
            });
          } else {
            ToolPaint.auto({
              ctx: tmpctx,
              area: area,
              resourceOK: resource.currentTilesetOK,
              mode: ui.selectMode,
              data: currentZone,
              image: world.selectionImages[c]
            });
          }
        }
      }
    }
  },
  teleport: function(x,y) {
    if (x!='' && y!='') {
      if (!isNaN(x) && !isNaN(y)) {
        world.x = x*1000*-1-500;
        world.y = y*1000*-1-500;
        new toolTip('Success Teleportation!',2000);
      } else {
        new toolTip('Error: Only number To teleport!',2000);
      }
    } else {
      new toolTip('Error: No Coordinates To teleport!',2000);
    }

  },
  getRelativeXY: function() {
    var get = {
      x: Math.round((this.x+this.mx+500)/1000)*-1,
      y: Math.round((this.y+this.my+500)/1000)*-1
    };
    return {
      x: Math.abs(get.x)==0?0:get.x,
      y: Math.abs(get.y)==0?0:get.y,
    };
  },
  getRelativeXYPoint: function(point) {
    var get = {
      x: Math.round((point.x)/1000),
      y: Math.round((point.y)/1000)
    };
    return {
      x: Math.abs(get.x)==0?0:get.x,
      y: Math.abs(get.y)==0?0:get.y,
    };
  },
  checkZoneToDraw: function(position,offx,offy,w,h) {
    var x1 = position.x,
        y1 = position.y;

    var x2 = x1-w/2,
        y2 = y1-h/2;

    var x3 = x1+w/2,
        y3 = y1+h/2;

    var currentPos = this.getRelativeXY();

    var rx1 = Math.round(x2/1000)-currentPos.x,
        ry1 = Math.round(y2/1000)-currentPos.y;

    var rx2 = Math.round(x3/1000)-currentPos.x,
        ry2 = Math.round(y3/1000)-currentPos.y;

    var nbZoneX = Math.abs(rx1-rx2)+1,
        nbZoneY = Math.abs(ry1-ry2)+1;

    var nbZone = nbZoneX*nbZoneY;

    var listZoneID = [];
    var tX = 0,
        tY = 0;
    for (var x = rx1; x < rx2+1; x++) {
      tY = 0;
      for (var y = ry1; y < ry2+1; y++) {
        var startX = 0,
            startY = 0,
            endX = 1000,
            endY = 1000,
            validZone = true;
        if (x == rx1) {
          startX = Math.abs(x2+500)%1000;
          startX = x2+500>0?startX:1000-startX;
        }
        if (x == rx2) {
          endX = Math.abs(x3+500)%1000;
          endX = x3+500>0?endX:1000-endX;
          endX = endX == 1000 ? 0 : endX;
        }
        if (y == ry1) {
          startY = Math.abs(y2+500)%1000;
          startY = y2+500>0?startY:1000-startY;
        }
        if (y == ry2) {
          endY = Math.abs(y3+500)%1000;
          endY = y3+500>0?endY:1000-endY;
        }
        var xt = x+currentPos.x,
            yt = y+currentPos.y;
        /*validZone = typeof map.datalayer['['+(xt==0?0:xt)+','+(yt==0?0:yt)+']'] != 'undefined';
        var text = validZone ? map.datalayer['['+(xt==0?0:xt)+','+(yt==0?0:yt)+']'].text : '';
        if (text != '' && validZone) {
          var texts = (map.getCurrentLayer('['+(xt==0?0:xt)+','+(yt==0?0:yt)+']')).split('_');
          var type = texts[1];
          if (type == 'NORMAL' || type == 'ZNORMAL') {
            validZone = true;
          } else {
            validZone = false;
          }
        }*/

        text = '';

          validZone = true;

        listZoneID.push({Tx:offx,Ty:offy,x:xt==0?0:xt,y:yt==0?0:yt,startX:startX,startY:startY,endX:endX,endY:endY,offX:tX,offY:tY,isLayerSelected:validZone,layerSelected:text});
        tY += Math.abs(startY-endY);
      }
      tX += Math.abs(startX-endX);
    }

    return listZoneID;
  },
  constructImage: function(x,y,width,height,dw,dh) {

    //on construit un tableau de type [{x,y},{x,y}]

    if (resource.currentTilesetOK) {

      var dx = x<0?0:x,
          dy = y<0?0:y;

      var x = 0,
          y = 0;


      var coordData = [];
      for (var xi = 0; xi < width; xi++) {
        for (var yi = 0; yi < height; yi++) {
          coordData.push({x:dx+xi,y:dy+yi,zIndex:typeof resource.dataTileset[resource.currentTilesetNAME]['('+(dx+xi)+','+(dy+yi)+')'] != 'undefined' ? resource.dataTileset[resource.currentTilesetNAME]['('+(dx+x)+','+(dy+y)+')'] : 0});
        }
      }

      coordData.sort(function(a,b){
        return a.zIndex-b.zIndex;
      });

      //on fait une boucle en faisant * dw , + dw
      if (!document.getElementById('SelectionType1')) {
        var canvasNORMAL = document.createElement('canvas');
        canvasNORMAL.id = 'SelectionType1';
        document.getElementById('jaajCanvasTempDraw').appendChild(canvasNORMAL);
      } else {
        var canvasNORMAL = document.getElementById('SelectionType1');
      }

      if (!document.getElementById('SelectionType2')) {
        var canvasZNORMAL = document.createElement('canvas');
        canvasZNORMAL.id = 'SelectionType2';
        document.getElementById('jaajCanvasTempDraw').appendChild(canvasZNORMAL);
      } else {
        var canvasZNORMAL = document.getElementById('SelectionType2');
      }

      canvasNORMAL.width = width*dw;
      canvasNORMAL.height = height*dh;

      canvasZNORMAL.width = width*dw;
      canvasZNORMAL.height = height*dh;


      var ctxT = [
        canvasNORMAL.getContext('2d'),
        canvasZNORMAL.getContext('2d')
      ];

      ctxT[0].clearRect(0,0,canvasNORMAL.width,canvasNORMAL.height);
      ctxT[1].clearRect(0,0,canvasZNORMAL.width,canvasZNORMAL.height);


      for (var i = 0; i < coordData.length; i++) {
        var j = coordData[i].zIndex > 0 ? 1 : 0;
        ctxT[j].drawImage(resource.currentTilesetIMAGE,coordData[i].x*dw,coordData[i].y*dh,dw,dh,(coordData[i].x-dx)*dw,(coordData[i].y-dy)*dh,dw,dh);
      }

      socket.datasend({NORMAL:canvasNORMAL.toDataURL('image/png', 1.0),ZNORMAL:canvasZNORMAL.toDataURL('image/png', 1.0)});

      return {NORMAL:canvasNORMAL,ZNORMAL:canvasZNORMAL};

    } else {
      return {};
    }

  },
  checkEvent: function() {
    for (var i in this.ObjectEvent) {
      if (this.ObjectEvent.hasOwnProperty(i)) {
        this.ObjectEvent[i].event = {b:false,isMove:false};
        //this.ObjectEvent[i].draw();
      }
    }
    var test = false;
    for (var i in this.ObjectEvent) {
      if (this.ObjectEvent.hasOwnProperty(i)) {
        if (player.boxCollision.intersectsWith(this.ObjectEvent[i])) {
          test = true;
          player.onEvent(this.ObjectEvent[i]);
        }
      }
    }
    if (!test) {
      player.ExecEvent = false;
    }
  },
  checkCollision: function() {
    for (var i in this.ObjectCollision) {
      if (this.ObjectCollision.hasOwnProperty(i)) {
        this.ObjectCollision[i].collision = {b:false,isMove:false};
        //this.ObjectCollision[i].draw();
      }
    }

    for (var i in this.ObjectCollision) {
      if (this.ObjectCollision.hasOwnProperty(i)) {
        for (var j in this.ObjectCollision) {
          if (this.ObjectCollision.hasOwnProperty(j)) {
            if (j != i) {
              if (!this.ObjectCollision[i].collision.b) {
                this.ObjectCollision[i].collision = {b:this.ObjectCollision[i].intersectsWith(this.ObjectCollision[j])?true:false,isMove:typeof this.ObjectCollision[j].isMove != 'undefined'};
              }
            }
          }
        }
      }
    }
  },
  cutDataByArea: function(ArrayPolygon) {
    var points = ArrayPolygon;
    var polygon = new Polygon({points:points});

    //===> Démarche
    //on récupère toutes les area à partir des points du polygon,
    //on créé des polygon de 1000*1000 'AREA' en parant du point le + éloigné jusqu'au + proche
    //on test l'overlap et on retire l'area si ya pa overlap
    //ensuite on créer un polygon par area à partir du !!Polygon!!


    //BUG ==>
    function getAreaPoint(pt) {
      var get = {
        x: Math.round(((pt.x-canvas.width/2)/world.zoom-world.x-world.mx-1000/2)/1000),
        y: Math.round(((pt.y-canvas.height/2)/world.zoom-world.y-world.my-1000/2)/1000)
      };
      get = {
        x: Math.abs(get.x)==0?0:get.x,
        y: Math.abs(get.y)==0?0:get.y,
      };
      return '['+get.x+','+get.y+']';
    };

    //on récupère toutes les AREA
    var listArea = {};
    for (var i = 0; i < polygon.points.length; i++) {
      if (typeof listArea[getAreaPoint(polygon.points[i])] == 'undefined') {
        listArea[getAreaPoint(polygon.points[i])] = true;
      }
    }
    console.log(listArea);

  },
  goToMap: function(back,map,c) {
    if (back) {
      if ((this.currentMap.substring(2).split('_')).length == 1) {
        this.currentMap = '';
      } else {
        this.currentMap = this.currentMap.substring(0,this.currentMap.lastIndexOf('_'));
      }
    } else {
      this.currentMap += this.currentMap == '' ? '__'+map : '_'+map;
    }
    editor.load([
      'Resource'
    ],function(){
      editor.inUse = false;
      if (c) {c();}
      window.onchangearea();
    });
  },
  updateTime: function() {

  },
  getTimeData: function() {
    return 'day';
  }
};


var NPCdialogList = {};
function NPCdialog(settings,next) {
  settings = settings || {};
  if (typeof settings.animation == 'undefined') {
    settings.animation = {};
  }
  if (typeof settings.nextArrow == 'undefined') {
    settings.nextArrow = {};
  }
  if (typeof settings.npcArrow == 'undefined') {
    settings.npcArrow = {};
  }

  this.position = new Vector(settings.x || 0, settings.y || 0);

  this.text = settings.text || '..Heu... Je sais plus mon texte désolé.. ^^';
  this.centerX = settings.centerX || true;
  this.centerY = settings.centerX || true;
  this.cutWord = settings.cutWord || false;


  this.animation = {
    text: '',
    tmptext: '',
    stop: false,
    index: 0,
    incrementText: settings.animation.incrementText || true,
    incrementEndOnClick: settings.animation.incrementEndOnClick || true,
    speed: settings.animation.speed || 0.5
  };

  this.width = settings.width || 200;
  this.height = settings.height || 100;

  this.font = settings.font || '16px Arial';
  this.color = settings.color || '#ddd';
  this.fillStyle = settings.fillStyle || '#333';
  this.strokeStyle = settings.strokeStyle || '#222';
  this.lineWidth = settings.lineWidth || 2;
  this.radius = settings.radius || 10;
  this.margin = settings.margin || 5;


  this.npcArrow = {
    display: settings.npcArrow.display || true,
    size: settings.npcArrow.size || 20,
    position: settings.npcArrow.position || 'bottom',
    delta: settings.npcArrow.delta || 0
  };
  this.nextArrow = {
    display: settings.nextArrow.display || true,
    size: settings.nextArrow.size || 10,
    color: settings.nextArrow.color || this.color,
    margin: settings.nextArrow.margin || this.margin,
  };

  this.time = Date.now();
  this.timeAliveNow = 0;
  this.timeAlive = settings.timeAlive || 1000;


  this.lastLine = 0;
  this.tmplastLine = 0;

  if (next) {
    this.next = next;
  } else {
    this.next = function(){};
  }


  this.id = settings.id || Object.keys(NPCdialogList).length;
  if (typeof NPCdialogList[this.id] != 'undefined') {
    NPCdialogList[this.id].destroy();
  }


  NPCdialogList[this.id] = this;
};

NPCdialog.prototype = {
  update: function() {
    if (Date.now() - this.time > this.animation.speed*100 && this.animation.index < this.text.length && !this.animation.stop) {
      this.time = Date.now();

      while (this.text[this.animation.index] == ' ') {
        this.animation.text += ' ';
        this.animation.index++;
      }

      this.animation.text += this.text[this.animation.index];
      this.animation.index++;

      this.animation.tmptext = this.animation.text+this.text.substring(this.animation.index,this.animation.text.length+this.text.substring(this.animation.index).indexOf(' '));
    }
  },
  draw: function() {
    if (!this.animation.incrementText) {
      this.animation.text = this.text;
    } else {
      this.update();
    }
    ctx.beginPath();
    var originX = world.x+world.mx;
    var originY = world.y+world.my;
    originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
    originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(world.zoom, world.zoom);
    ctx.translate(originX, originY);
    ctx.translate(this.position.x,this.position.y);

    if (this.npcArrow.display) {
      ctx.npcRect(0,0,this.width,this.height,this.radius,this.npcArrow.position,this.npcArrow.size,this.npcArrow.delta);
    } else {
      ctx.roundRect(0,0,this.width,this.height,this.radius);
    }
    ctx.fillStyle = this.fillStyle;
    ctx.strokeStyle = this.strokeStyle;
    ctx.lineWidth = this.lineWidth;
    ctx.stroke();
    ctx.fill();

    ctx.font = this.font;
    ctx.textAlign = "left";
    ctx.textBaseline = 'top';
    ctx.fillStyle = this.color;
    var tmpText = [''];
    var atmpText = [''];
    var itmpText = [''];
    var nbLine = 0;
    var inbLine = 0;
    var charHeight = parseInt(ctx.font) * 1.2;

    if (this.cutWord) {
      for (var i = 0; i < this.animation.text.length; i++) {
        if (ctx.measureText(tmpText[nbLine]+''+this.animation.text[i]).width+this.margin*2 > this.width) {
          nbLine++;
          tmpText[nbLine] = this.animation.text[i];
        } else {
          tmpText[nbLine] += this.animation.text[i];
        }
      }
      for (var i = 0; i < this.text.length; i++) {
        if (ctx.measureText(itmpText[inbLine]+''+this.text[i]).width+this.margin*2 > this.width) {
          inbLine++;
          itmpText[inbLine] = this.text[i];
        } else {
          itmpText[inbLine] += this.text[i];
        }
      }
    } else {
      var currentTmpText = this.animation.tmptext.split(' ');
      var currentText = this.animation.text.split(' ');
      for (var i = 0; i < currentText.length; i++) {
        if (ctx.measureText(atmpText[nbLine]+currentTmpText[i]+' ').width+this.margin*2 > this.width) {
          nbLine++;
          tmpText[nbLine] = currentText[i]+' ';
          atmpText[nbLine] = currentTmpText[i]+' ';
        } else {
          tmpText[nbLine] += currentText[i]+' ';
          atmpText[nbLine] += currentTmpText[i]+' ';
        }
      }
      var icurrentText = this.text.split(' ');
      for (var i = 0; i < icurrentText.length; i++) {
        if (ctx.measureText(itmpText[inbLine]+icurrentText[i]+' ').width+this.margin*2 > this.width) {
          inbLine++;
          itmpText[inbLine] = icurrentText[i]+' ';
        } else {
          itmpText[inbLine] += icurrentText[i]+' ';
        }
      }
    }

    if (this.animation.index >= this.text.length) {
      if (this.timeAliveNow == 0) {this.timeAliveNow = Date.now();}
      if (mouse.isLeftDown || Date.now()-this.timeAliveNow >= this.timeAlive) {
        mouse.isLeftDown = false;
        this.destroy();
        this.next();
      }
    } else {
      if (mouse.isLeftDown) {
        mouse.isLeftDown = false;
        this.lastLine = this.tmplastLine;
        this.animation.stop = false;
      }
    }

    var j = 0;
    for (var i = this.lastLine; i < tmpText.length; i++) {
      if (this.margin*2+charHeight*j > this.height) {
        this.tmplastLine = i;
        if (this.nextArrow.display) {
          ctx.beginPath();
          ctx.moveTo(this.width-this.nextArrow.size-this.nextArrow.margin,this.height-this.nextArrow.size-this.nextArrow.margin);
          ctx.lineTo(this.width-this.nextArrow.margin,this.height-this.nextArrow.size/2-this.nextArrow.margin);
          ctx.lineTo(this.width-this.nextArrow.size-this.nextArrow.margin,this.height-this.nextArrow.margin);
          ctx.fillStyle = this.nextArrow.margin;
          ctx.fill();
        }
        this.animation.stop = true;
        break;
      }
      ctx.beginPath();
      var nbLine = Math.floor((this.height-this.margin*2)/charHeight);
      var delta = itmpText.length - this.lastLine;
      if (this.centerX) {
        if (this.centerY) {
          if (delta < nbLine) {
            ctx.fillText(tmpText[i],this.width/2-ctx.measureText(itmpText[i]).width/2,this.height/2-charHeight*delta/2+charHeight*j);
          } else {
            ctx.fillText(tmpText[i],this.width/2-ctx.measureText(itmpText[i]).width/2,this.margin+charHeight*j);
          }
        } else {
          ctx.fillText(tmpText[i],this.width/2-ctx.measureText(itmpText[i]).width/2,this.margin+charHeight*j);
        }
      } else {
        if (this.centerY) {
          if (delta < nbLine) {
            ctx.fillText(tmpText[i],this.margin,this.height/2-charHeight*delta/2+charHeight*j);
          } else {
            ctx.fillText(tmpText[i],this.margin,this.margin+charHeight*j);
          }
        } else {
          ctx.fillText(tmpText[i],this.margin,this.margin+charHeight*j);
        }
      }
      j++;
    }





    ctx.setTransform(1,0,0,1,0,0);
  },
  destroy: function() {
    NPCdialogList[this.id] = null;
    delete NPCdialogList[this.id];
  }
};


function Menu() {
  this.default();
  this.Ressources = {};
};

Menu.prototype.default = function () {
  this.menuHeight = 175;
  this.MenuName = ['main'];
  this.r = 50;
  this.fullMenu = false;
  this.fullMenuOK = false;
  this.currentAnim = null;

  this.v1 = 1;
  this.v2 = canvas.width>canvas.height?canvas.width:canvas.height;

  this.c1 = null;
  this.appli = false;

  this.page = [];
  this.pageArg = null;
  this.temp = {};


  this.MenuContextJaajList = false;
  this.MenuContextJaajList_X = 0;
  this.MenuContextJaajList_Y = 0;
  this.MenuContextJaajList_Index = 0;

  //Menu Context Disable
  this.Enable_Select = false;
  this.Enable_See = true;


  this.disableBack = false;
  this.invokeSystemFightFullmenuDraw = false;
};

Menu.prototype.draw = function () {
  var _this = this;
  if (this.currentAnim != null) this.currentAnim();
  this.hexabackground(0,canvas.height-this.menuHeight);

  var mainMenu = [
    {
      x:100,
      y:canvas.height-110,
      size:90,
      lineWidth:6,
      fill:'#FFD500',
      stroke:'#D3B000',
      disable_fill:'#CCAA00',
      disable_stroke:'#A09900',
      text:'BAG',
      textColor:'#111',
      disable_textColor:'#000',
      fontSize:'50',
      onclick:function(){
        _this.MenuName.push('bag');
      }
    },
    {
      x:canvas.width-240,
      y:canvas.height-70,
      size:50,
      lineWidth:6,
      fill:'#04f',
      stroke:'#02d',
      disable_fill:'#02d',
      disable_stroke:'#00b',
      text:'Quests',
      textColor:'#111',
      disable_textColor:'#000',
      fontSize:'30',
      onclick:function(){
        _this.MenuName.push('quests');
      }
    },
    {
      x:canvas.width-100,
      y:canvas.height-110,
      size:90,
      lineWidth:6,
      fill:'#0f0',
      stroke:'#0d0',
      disable_fill:'#0c0',
      disable_stroke:'#0a0',
      text:'JAAJs',
      textColor:'#111',
      disable_textColor:'#000',
      fontSize:'50',
      onclick:function(){
        _this.MenuName.push('jaajs');
      }
    }
  ];
  var j = 0;
  for (var i = 0; i < mainMenu.length; i++) {
    if (this.drawHexaButton(mainMenu[i],this.round)) {
      j++;
    }
  }
  switch (this.MenuName[1]) {
    case 'quests':
      j++;
      break;
    case 'bag':
      j++;
      menu.drawFullMenu();
      menu.selectItem(function(jaaj){
        menu.c1 = function(){
          menu.appli = false;
          _this.MenuName.pop();
          if (jaaj == null) {
            console.log('Cancel!');
          } else {

          }
        };
        menu.hideFullMenu();
      },'view',-1);
      break;
    case 'jaajs':
      j++;
      menu.drawFullMenu();
      menu.selectJaaj(function(jaaj){
        menu.c1 = function(){
          menu.appli = false;
          _this.MenuName.pop();
          if (jaaj == null) {
            //console.log('Cancel!');
          } else {
            //lol
          }
        };
        menu.hideFullMenu();
      },'view',-1);
      break;
    default:

  }
  if (j == 0) {
    player.enableControls = true;
  }


  this.drawFullMenu();
  if (this.MenuContextJaajList) {
    this.drawJaajListMenuContext();
  }
};
Menu.prototype.drawFullMenu = function () {
  var _this = this;
  if (this.fullMenu) {
    this.fullhexabackground();
    if (this.fullMenuOK) {
      if (!this.disableBack) {
        this.drawHexaButton({
          x:canvas.width/2,
          y:canvas.height-70,
          size:60,
          lineWidth:5,
          fill:'#444',
          stroke:'#111',
          disable_fill:'#444',
          disable_stroke:'#111',
          text:'Back',
          textColor:'#ddd',
          disable_textColor:'#ddd',
          fontSize:'30',
          onclick:function(){
            _this.hideFullMenu();
          }
        });
      }
      if (this.page.length > 0) {
        this['draw'+this.page[this.page.length-1]](this.pageArg);
      }
    }
  }
};
Menu.prototype.drawHexaButton = function (button) {
  var round = 0;
  ctx.hexagone(button.x,button.y-button.size,button.size);
  var isPointInPath = ctx.isPointInPath(mouse.x,mouse.y);
  var fill = button.fill;
  var disable = typeof button.disable === 'undefined' ? false : button.disable;

  if (isPointInPath && round%2==0 && !disable) {
    player.enableControls = false;
    fill = button.stroke;
  }

  ctx.lineWidth = button.lineWidth;
  ctx.fillStyle = disable ? fill : round%2==0 ? fill : button.disable_fill;
  ctx.fill();
  ctx.strokeStyle = disable ? button.stroke : round%2==0 ? button.stroke : button.disable_stroke;
  ctx.stroke();

  if (ctx.isPointInPath(mouse.x,mouse.y) && round%2==0 && !disable) {
    if (mouse.isLeftDown) {
      mouse.isLeftDown = false;
      button.onclick(typeof button.data !== 'undefined' ? button.data : null);
    }
    if (this.MenuAnimTemp != button.text) {
      this.MenuAnim = 0;
    }
    this.MenuAnimTemp = button.text;
    ctx.hexagone(button.x,button.y-(button.size+this.MenuAnim),button.size+this.MenuAnim);
    ctx.globalAlpha = 1-this.MenuAnim/50;
    ctx.strokeStyle = button.stroke;
    ctx.stroke();
    this.MenuAnim = this.MenuAnim < 50 ? this.MenuAnim+1 : 0;
    ctx.globalAlpha = 1;
  }



  ctx.beginPath();
  ctx.font = button.fontSize+'px Londrina';
  ctx.textAlign = "center";
  ctx.textBaseline = 'middle';
  ctx.fillStyle = disable ? button.textColor : round%2==0 ? button.textColor : button.disable_textColor;
  ctx.fillText(button.text,button.x,button.y);

  return isPointInPath;
};
Menu.prototype.drawJaajList = function () {
  if (player.isLoaded) {
    var x = 0, y = 0;
    var w = 300, h = 70, m = 30;
    var clickv = false;
    var memory = world.objFight != null ? world.objFight.a.jaajs : player.memory.jaajs;
    for (var i = 0; i < memory.length; i++) {
      var jaaj = memory[i];
      var id = jaaj.id;
      var calc = (new FightAlgorithm(jaaj)).calcStat();
      if (typeof jaaj.hp === 'undefined') {
        jaaj.hp = calc.hp;
      }
      var click = false;
      ctx.translate(canvas.width/2-w/2-(w+m)/2*(i%2 == 0 ? 1 : -1),y+canvas.height/2-((h+m)*memory.length)/2);
      ctx.roundRect(0,0,w,h,{tl: 5, tr: 30, br: 5, bl: 30});
      if (i == this.selectJaajForbidenIndex) {
        ctx.fillStyle = '#00d';
        ctx.strokeStyle = '#115';
      } else if (jaaj.hp <= 0) {
        ctx.fillStyle = '#d00';
        ctx.strokeStyle = '#511';
      } else if (ctx.isPointInPath(mouse.x,mouse.y) && !this.MenuContextJaajList) {
        if (mouse.isLeftDown) {
          mouse.isLeftDown = false;
          click = true;
          clickv = true;
        }
        ctx.fillStyle = '#111';
        ctx.strokeStyle = '#000';
      } else {
        ctx.fillStyle = '#222';
        ctx.strokeStyle = '#111';
      }
      ctx.lineWidth = 5;
      ctx.fill();
      ctx.stroke();
      var xw = 0;
      if (typeof this.temp[i] === 'undefined') {
        this.temp[i] = new Image();
        this.temp[i].OK = false;
        this.temp[i].onload = function(){
          this.OK = true;
        };
        this.temp[i].src = 'assets/jaajs/'+jaajList[id][jaaj.evolutionLvl || 0].imagePath;
      } else if (this.temp[i].OK) {
        xw = this.temp[i].width*(h-10)/this.temp[i].height;
        ctx.drawImage(this.temp[i],5,5,xw,h-10);
      }
      ctx.beginPath();
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 2;
      ctx.roundRect(xw+5,h/2-20/2,w-5-(xw+5),20,9);
      ctx.fill();
      ctx.stroke();
      if (jaaj.hp > 0) {
        ctx.beginPath();
        var delta = jaaj.hp*(w-5-(xw+5))/calc.hp;
        ctx.fillStyle = '#0f0';
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.roundRect(xw+5,h/2-20/2,delta,20,9);
        ctx.fill();
        ctx.stroke();
      }
      if (i%2 != 0 && i > 0) {
        y += (h+m);
      }
      ctx.setTransform(1,0,0,1,0,0);
      if (click) {
        this.showMenuContextJaajList(mouse.x,mouse.y,i);
      }
    }
    if (!clickv && mouse.isLeftDown && (mouse.x < this.MenuContextJaajList_X || mouse.x > this.MenuContextJaajList_X + 300) && (mouse.y < this.MenuContextJaajList_Y || mouse.y > this.MenuContextJaajList_Y + 50*2)) {
      mouse.isLeftDown = false;
      this.MenuContextJaajList = false;
    }
  }
};
Menu.prototype.drawJaajListMenuContext = function () {
  var _this = this;
  var buttonList = [
    {
      text:'Select',
      c:function(){
        _this.c1(_this.MenuContextJaajList_Index);
      },
      enable:this.Enable_Select
    },{
      text:'See',
      c:function(){
        //Hello
      },
      enable:this.Enable_See
    }
  ];
  ctx.translate(this.MenuContextJaajList_X,this.MenuContextJaajList_Y);
  ctx.beginPath();
  ctx.hexagone(0,-10,10);
  ctx.fillStyle = '#dd0';
  ctx.fill();
  ctx.beginPath();
  ctx.rect(0,0,300,buttonList.length*50);
  ctx.fillStyle = '#ddd';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.5;
  ctx.fill();
  ctx.stroke();
  for (var i = 0; i < buttonList.length; i++) {
    var button = buttonList[i];
    ctx.beginPath();
    ctx.rect(0,0,300,50);
    if (!button.enable) {
      ctx.fillStyle = '#bbb';
    } else {
      if (ctx.isPointInPath(mouse.x,mouse.y)) {
        if (mouse.isLeftDown) {
          mouse.isLeftDown = false;
          this.MenuContextJaajList = false;
          button.c();
        }
        ctx.fillStyle = '#ddd';
      } else {
        ctx.fillStyle = '#fff';
      }
    }
    ctx.fill();
    ctx.font = '30px sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#222';
    ctx.fillText(button.text,150,25);
    ctx.translate(0,50);
  }
  ctx.setTransform(1,0,0,1,0,0);
};
Menu.prototype.drawJaajInfo = function (i) {

};
Menu.prototype.drawItemList = function (i) {
  if (player.isLoaded) {
    var memory = world.objFight != null ? world.objFight.a.items : player.memory.items;
    if (Object.keys(memory).length > 0) {
      var x = 0.2*canvas.width;
      var y = 0.2*canvas.height;
      for (var item in memory) {
        if (memory.hasOwnProperty(item)) {

          this.drawItem(item,memory[item],x,y);
          x += 50;

        }
      }
    } else {
      ctx.font = '150px Londrina';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(33,33,33,0.5)';
      ctx.fillText('THE BAG IS EMPTY!',canvas.width/2,canvas.height/2);
    }
  }
};
Menu.prototype.drawItem = function (itemID,Nb,x,y) {
  var currentItem = itemList[itemID];
  if (typeof this.Ressources[itemID] === 'undefined') {
    this.Ressources[itemID] = new Image();
    this.Ressources[itemID].OK = false;
    this.Ressources[itemID].onload = function(){
      this.OK = true;
    };
    this.Ressources[itemID].src = currentItem.Image;
  }
  var size = 130;
  ctx.save();
  ctx.hexagone(x,y-size,size);

  var mouseover = ctx.isPointInPath(mouse.x,mouse.y);

  if (mouseover) {
    ctx.fillStyle = '#933';
    ctx.strokeStyle = '#f00';
  } else {
    ctx.fillStyle = '#333';
    ctx.strokeStyle = '#222';
  }

  ctx.fill();
  ctx.stroke();



  ctx.clip();



  if (this.Ressources[itemID].OK) {
    var factor = 1;
    if (mouseover) {
      factor = 2;
    }
    ctx.globalAlpha = 0.3;
    var w = this.Ressources[itemID].width > this.Ressources[itemID].height ? size*factor : this.Ressources[itemID].width*size*factor/this.Ressources[itemID].height;
    var h = this.Ressources[itemID].width > this.Ressources[itemID].height ? this.Ressources[itemID].height*size*factor/this.Ressources[itemID].width : size*factor;
    ctx.drawImage(this.Ressources[itemID],x-w/2,y-h/2,w,h);
    ctx.globalAlpha = 1;
  }

  ctx.font = '40px Londrina';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ddd';
  ctx.fillText(currentItem.name,x,y);
  ctx.font = '30px Londrina';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ddd';
  ctx.fillText(Nb,x,y+45);

  ctx.restore();
};


Menu.prototype.hexabackground = function (x,y) {
  ctx.save();
  var w = 0, h = 0, r = this.r;
  var tr = r;
  var nb = (canvas.width/tr)*(this.menuHeight/tr)+20;
  var center = {
    x: canvas.width/2,
    y: canvas.height/2-this.menuHeight*2
  };

  function Point(x,y) {
    this.x = x || 0;
    this.y = y || 0;
  };

  for (var i = 0; i < nb; i++) {
    var dx = x+w*(r*2-r/4)+(h%2?(r*2-r/4)/2:0)-r/2;
    var dy = y+h*(r+r/2)-this.menuHeight;
    ctx.setTransform(1,0,0,1,0,0);

    var angle = Math.atan2(dy,dx);

    ctx.beginPath();
    var EllipseX = canvas.width/2;
    var EllipseY = canvas.height/2-this.menuHeight/2;
    var radiusX = canvas.width/2;
    var radiusY = canvas.height/2-this.menuHeight/2;
    ctx.ellipse(EllipseX, EllipseY, radiusX, radiusY, 0, 0, 2*Math.PI, false);
    var isPointInPath = ctx.isPointInPath(dx,dy-this.menuHeight/2);

    var nr = new Point(radiusX,radiusY);
    var pt0 = new Point(EllipseX,EllipseY);

    var pt1 = new Point(EllipseX,EllipseY);
    var pt2 = new Point(dx,dy);

    var lol = FindEllipseSegmentIntersections(nr,pt0,pt1,pt2);

    if (lol.length > 1) {
      var point = {
        x:lol[0].y>lol[1].y?lol[0].x:lol[1].x,
        y:lol[0].y>lol[1].y?lol[0].y:lol[1].y
      };
    } else if (lol.length > 0) {
      var point = {
        x:lol[0].x,
        y:lol[0].y
      };
    } else {
      var point = {
        x:0,
        y:0
      };
    }

    var dist = Math.sqrt(Math.pow(point.x-dx,2)+Math.pow(point.y-dy,2));
    ctx.beginPath();
    ctx.hexagone(dx,dy-this.menuHeight/2,r);



    var a = isPointInPath ? 0 : 1;

    if (a > 0) {
      a = dist*1/(radiusY);
    }
    ctx.fillStyle = 'rgba(213,244,255,'+a+')';

    //var l = dist*20/(canvas.width);
    //l = l < 1 ? 1 : l;
    l=1;
    ctx.lineWidth = l;
    ctx.fill();
    w++;
    if (dx > canvas.width) {
      w = 0;
      h++;
    }
    if (dy-r*3 > canvas.height) {
      break;
    }
  }
  //console.log(i);

  ctx.restore();
};
Menu.prototype.fullhexabackground = function () {
  var w = 0, h = 0, r = this.r;
  var nb = (canvas.width/r)*(canvas.height/r)+20;
  var center = {
    x: canvas.width/2,
    y: canvas.height/2
  };


  for (var i = 0; i < nb; i++) {
    var dx = w*(r*2-r/4)+(h%2?(r*2-r/4)/2:0)-r/2;
    var dy = -r+h*(r+r/2);
    ctx.setTransform(1,0,0,1,0,0);


    var dist = Math.sqrt(Math.pow(center.x-dx,2)+Math.pow(center.y-dy,2));
    ctx.beginPath();
    ctx.hexagone(dx,dy,r);

    var a = 1-dist*1/this.v1;

    ctx.fillStyle = 'rgba(213,244,255,'+(a>0.8?0.8:a)+')';

    //var l = dist*20/(canvas.width);
    //l = l < 1 ? 1 : l;
    l=1;
    ctx.lineWidth = l;
    ctx.fill();
    w++;
    if (dx > canvas.width) {
      w = 0;
      h++;
    }
    if (dy-r*3 > canvas.height) {
      break;
    }
  }
};


Menu.prototype.showFullMenu = function () {
  var _this = this;
  this.v1 = 1;
  this.v2 = canvas.width>canvas.height?canvas.width:canvas.height;
  this.fullMenu = true;
  this.currentAnim = function() {
    var test = 1-_this.v2/2*1/_this.v1;
    _this.v1 += 100;
    if (test > 0.7) {
      _this.fullMenuOK = true;
      _this.currentAnim = null;
    }
  };
};
Menu.prototype.hideFullMenu = function () {
  var _this = this;
  this.fullMenuOK = false;
  this.v2 = canvas.width>canvas.height?canvas.width:canvas.height;
  this.currentAnim = function() {
    var test = 1-_this.v2/2*1/_this.v1;
    _this.v1 -= 100;
    if (_this.v1 < 1) {
      _this.v1 = 1;
      _this.fullMenu = false;
      _this.currentAnim = null;
      _this.c1(null);
    }
  };
};
Menu.prototype.showMenuContextJaajList = function (x,y,i) {
  this.MenuContextJaajList = true;
  this.MenuContextJaajList_X = x;
  this.MenuContextJaajList_Y = y;
  this.MenuContextJaajList_Index = i;
};

Menu.prototype.selectJaaj = function (c,fn,i) {
  var _this = this;
  if (!this.appli) {
    this.appli = true;
    this.c1 = c;
    this.selectJaajForbidenIndex = typeof i !== 'undefined' ? i : null;
    this.temp = {};
    this.page.push('JaajList');
    if (fn == 'fight') {
      this.Enable_Select = true;
    } else {
      this.Enable_Select = false;
    }
    this.showFullMenu();
  }
};
Menu.prototype.selectItem = function (c,fn) {
  var _this = this;
  if (!this.appli) {
    this.appli = true;
    this.c1 = c;
    this.temp = {};
    this.page.push('ItemList');
    this.Enable_Select = true;
    this.showFullMenu();
  }
};



Menu.prototype.disable = function () {

};


function SystemFight(a,b,c,d,e) {
  this.menuHeight = 0.3*canvas.height;
  this.fightMode = c;

  this.callback = e || function(){};

  this.status = 'START';

  this.a = new FightTrainer(goclone(a),400,canvas.height-this.menuHeight+50,false,1);
  this.b = new FightTrainer(b,canvas.width-400,canvas.height-this.menuHeight-300,true,c);

  this.round = -1;

  menu.disable();

  var d = d.split(';');
  this.background = new Image();
  this.background.OK = false;
  this.background.onload = function() {
    this.OK = true;
  };
  this.background.src = 'assets/battle/'+d[0]+'/'+world.getTimeData()+'_'+d[1]+'.jpg';


  this.startAnim = true;
  this.animRadius = 0;
  this.currentAnim = this.BeginningTransitionUpdate;
  this.currentAnim2 = null;
  this.place = false;

  this.Action = false;

  this.fullMenu = false;
  this.fullMenuOK = false;

  this.v1 = 1;
  this.v2 = canvas.width>canvas.height?canvas.width:canvas.height;

  this.rects = [];
  this.MenuName = ['main'];
  this.MenuAnim = 0;
  this.MenuAnimTemp = '';

  this.messageData = {
    OK: false,
    text: ''
  };
  this.messageAnim = null;

  this.tempb = false;

  this.indexReward = null;
  this.v1Reward = -300;
  this.ImageReward = new Image();
  this.ImageReward.OK = false;
  this.ImageReward.onload = function(){
    this.OK = true;
  };

  this.startFight();
};
SystemFight.prototype.startFight = function () {
  player.enableControls = false;
  player.move('stop');
  this.Transition();
  if (!this.fightMode) {
    this.b.Init();
  }
};


SystemFight.prototype.draw = function () {
  if (this.startAnim) {
    this.currentAnim();
  }
  if (this.currentAnim2 != null) this.currentAnim2();
  if (this.place) {
    this.drawBackground();
    this.FixObjectOnImage();
    this.b.draw();
    this.a.draw();

    this.drawMenu();

    this.drawMessage();

    if (this.fullMenu) {
      this.fullhexabackground();
      this.drawReward();
    }
  }
  if (this.animRadius > 0) {
    ctx.beginPath();
    ctx.arc(canvas.width/2,canvas.height/2,this.animRadius,0,2*Math.PI,false);
    ctx.fillStyle = '#000';
    ctx.fill();
  }
  for (var i = 0; i < this.rects.length; i++) {
    var rect = this.rects[i];
    ctx.beginPath();
    ctx.rect(rect.x,rect.y,rect.w,rect.h);
    ctx.fillStyle = '#000';
    ctx.fill();
  }
};
SystemFight.prototype.drawMenu = function () {
  var _this = this;

  if (menu.currentAnim != null) menu.currentAnim();
  menu.hexabackground(0,canvas.height-menu.menuHeight);

  if (this.MenuName.length > 1 && this.MenuName[1] != 'bag' && this.MenuName[1] != 'jaajs') {
    this.drawHexaButton({
      x:canvas.width/2,
      y:canvas.height-70,
      size:60,
      lineWidth:5,
      fill:'#444',
      stroke:'#111',
      disable_fill:'#444',
      disable_stroke:'#111',
      text:'Back',
      textColor:'#ddd',
      disable_textColor:'#ddd',
      fontSize:'30',
      onclick:function(){
        _this.MenuName.pop();
      }
    },this.round);
  } else if (this.MenuName[0] != 'main') {
    this.drawHexaButton({
      x:canvas.width/2,
      y:canvas.height-70,
      size:60,
      lineWidth:5,
      fill:'#444',
      stroke:'#111',
      disable_fill:'#444',
      disable_stroke:'#111',
      text:'Back',
      textColor:'#ddd',
      disable_textColor:'#ddd',
      fontSize:'30',
      onclick:function(){
        _this.MenuName = ['main'];
      }
    },this.round);
  }


  switch (this.MenuName[0]) {
    case 'main':
      var mainMenu = [
        {
          x:100,
          y:canvas.height-110,
          size:90,
          lineWidth:10,
          fill:'#f00',
          stroke:'#d00',
          disable_fill:'#c00',
          disable_stroke:'#a00',
          text:'FIGHT!',
          textColor:'#111',
          disable_textColor:'#000',
          fontSize:'50',
          onclick:function(){
            _this.MenuName = ['fight'];
          }
        },
        {
          x:canvas.width-240,
          y:canvas.height-70,
          size:50,
          lineWidth:6,
          fill:'#0f0',
          stroke:'#0d0',
          disable_fill:'#0c0',
          disable_stroke:'#0a0',
          text:'JAAJs',
          textColor:'#111',
          disable_textColor:'#000',
          fontSize:'35',
          onclick:function(){
            _this.MenuName.push('jaajs');
          }
        },
        {
          x:canvas.width-100,
          y:canvas.height-110,
          size:90,
          lineWidth:6,
          fill:'#FFD500',
          stroke:'#D3B000',
          disable_fill:'#CCAA00',
          disable_stroke:'#A09900',
          text:'BAG',
          textColor:'#111',
          disable_textColor:'#000',
          fontSize:'50',
          onclick:function(){
            _this.MenuName.push('bag');
          }
        }
      ];
      for (var i = 0; i < mainMenu.length; i++) {
        this.drawHexaButton(mainMenu[i],this.round);
      }
      break;
    case 'run':

      break;
    case 'fight':
      var jaajList = this.a.jaajs;

      var color = function(i) {
        var c = attackList[jaajList[_this.a.index].listAttack[i]].data.Type.split(';');
        var tc = [];
        for (var j = 0; j < c.length; j++) {
          tc.push(typeDataList[c[j]].color);
        }
        return tc.join(';');
      };
      var text = function(i) {
        return attackList[jaajList[_this.a.index].listAttack[i]].name;
      };
      var Attack = function(i) {
        var rindex = i;
        _this.Action = true;
        _this.tempb = true;
        _this.round++;
        var text = _this.a.jaajs[_this.a.index].name+' used '+attackList[jaajList[_this.a.index].listAttack[rindex]].name;
        if (_this.messageData.text != text) _this.showMessage(text,function(){
          _this.a.attackJaaj(jaajList[_this.a.index].listAttack[rindex],function(){
            _this.b.damageJaaj(jaajList[_this.a.index],jaajList[_this.a.index].listAttack[rindex],function(code){
              if (code) {
                if (code == 0) {
                  _this.b.callBackJaaj(function(){
                    _this.fightDefeat();
                  });
                } else if (code == 1) {
                  _this.a.callBackJaaj(function(){
                    _this.fightVictory();
                  });
                }
              } else {
                setTimeout(function () {
                  _this.Action = false;
                  _this.tempb = false;
                }, 300);
              }
            });
          });
        });
      };
      var FightListButton = [
        {
          x:80,
          y:canvas.height-210,
          size:80,
          lineWidth:5,
          fill:'#444',
          stroke:'#111',
          disable_fill:'#111',
          disable_stroke:'#000',
          text:text,
          textColor:'#000',
          disable_textColor:'#444',
          fontSize:'30',
          onclick:Attack,
          calcHoverFill: true
        },
        {
          x:200,
          y:canvas.height-90,
          size:80,
          lineWidth:5,
          fill:'#444',
          stroke:'#111',
          disable_fill:'#111',
          disable_stroke:'#000',
          text:text,
          textColor:'#000',
          disable_textColor:'#444',
          fontSize:'30',
          onclick:Attack,
          calcHoverFill: true
        },
        {
          x:canvas.width-80,
          y:canvas.height-210,
          size:80,
          lineWidth:5,
          fill:'#444',
          stroke:'#111',
          disable_fill:'#111',
          disable_stroke:'#000',
          text:text,
          textColor:'#000',
          disable_textColor:'#444',
          fontSize:'30',
          onclick:Attack,
          calcHoverFill: true
        },
        {
          x:canvas.width-200,
          y:canvas.height-90,
          size:80,
          lineWidth:5,
          fill:'#444',
          stroke:'#111',
          disable_fill:'#111',
          disable_stroke:'#000',
          text:text,
          textColor:'#000',
          disable_textColor:'#444',
          fontSize:'30',
          onclick:Attack,
          calcHoverFill: true
        }
      ];
      var EmptyButton = {
        x:0,
        y:0,
        size:80,
        lineWidth:5,
        fill:'#000',
        stroke:'#111',
        disable_fill:'#111',
        disable_stroke:'#000',
        text:'EMPTY',
        textColor:'#aaa',
        disable_textColor:'#bbb',
        fontSize:'30',
        disable:true,
        onclick:function(){}
      };
      for (var i = 0; i < FightListButton.length; i++) {
        ctx.save();
        if (typeof jaajList[this.a.index].listAttack[i] !== 'undefined') {
          FightListButton[i].text = text(i);
          FightListButton[i].fill = color(i);
          FightListButton[i].data = i;
          this.drawHexaButton(FightListButton[i],this.round);
        } else {
          EmptyButton.x = FightListButton[i].x;
          EmptyButton.y = FightListButton[i].y;
          this.drawHexaButton(EmptyButton,this.round);
        }
        ctx.restore();
      }
      break;
    default:

  }
  switch (this.MenuName[1]) {
    case 'bag':
      menu.drawFullMenu();
      menu.selectItem(function(jaaj){
        menu.c1 = function(){
          menu.appli = false;
          _this.MenuName.pop();
          if (jaaj == null) {
            console.log('Cancel!');
          } else {

          }
        };
        menu.hideFullMenu();
      },'fight',this.a.index);
      break;
    case 'run':

      break;
    case 'jaajs':
      menu.drawFullMenu();
      menu.selectJaaj(function(jaaj){
        menu.c1 = function(){
          menu.appli = false;
          _this.MenuName.pop();
          if (jaaj == null) {
            //console.log('Cancel!');
          } else {
            _this.a.callBackJaaj(function(){
              setTimeout(function () {
                _this.a.sendJaaj(jaaj);
                _this.Action = true;
                _this.tempb = false;
                _this.round++;
              }, 300);
            });
          }
        };
        menu.hideFullMenu();
      },'fight',this.a.index);
      break;
    default:

  }
  if (menu.invokeSystemFightFullmenuDraw) {
    //Force to Draw, it's an invoke outside of this Class
    menu.drawFullMenu();
  }
  if (this.round>=0) {
    if (this.round%2==0) {
      //PLAYER
      if (!this.Action) {
        var text = 'What will '+this.a.jaajs[this.a.index].name+' do ?';
        if (this.messageData.text != text) this.showMessage(text,function(){},true);
      }
    } else if (!this.tempb && this.b.current != null) {
      //IA
      if (!this.b.current.isDead) {
        this.tempb = true;
        setTimeout(function () {
          if (_this.b.current != null) {
            if (!_this.b.current.isDead) {
              var currentJaaj = null;
              currentJaaj = _this.b.jaajs[_this.b.index];
              var randomIndex = getRandomIntInclusive(0, currentJaaj.listAttack.length-1);
              var text = _this.b.jaajs[_this.b.index].name+' used '+attackList[currentJaaj.listAttack[randomIndex]].name;
              if (_this.messageData.text != text) _this.showMessage(text,function(){
                _this.b.attackJaaj(currentJaaj.listAttack[randomIndex],function(){
                  _this.a.damageJaaj(currentJaaj,currentJaaj.listAttack[randomIndex],function(code){
                    if (code) {
                      if (code == 0) {
                        _this.b.callBackJaaj(function(){
                          _this.fightDefeat();
                        });
                      } else if (code == 1) {
                        _this.a.callBackJaaj(function(){
                          _this.fightVictory();
                        });
                      }
                    } else {
                      setTimeout(function () {
                        _this.round++;
                        //_this.MenuName = ['main'];
                      }, 300);
                    }
                  });
                });
              });
            } else {
              _this.tempb = false;
            }
          } else {
            _this.tempb = false;
          }
        }, 1000);
      }
    }
  }

  if (menu.MenuContextJaajList) {
    menu.drawJaajListMenuContext();
  }

};
SystemFight.prototype.drawHexagone = function (x,y,r) {
  ctx.save();
  var w = 0, h = 0;
  var nb = (canvas.width/(r*2-r/4))*(this.menuHeight*4/(r+r/2))+20;
  var center = {
    x: canvas.width/2,
    y: canvas.height/2-this.menuHeight/2
  };
  var ratio = canvas.width/canvas.height<1?canvas.height/canvas.width:canvas.width/canvas.height;
  for (var i = 0; i < nb; i++) {
    var dx = x+w*(r*2-r/4)+(h%2?(r*2-r/4)/2:0)-r/2;
    var dy = y+h*(r+r/2);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.beginPath();
    ctx.ellipse(canvas.width/2, canvas.height/2-this.menuHeight/2, canvas.width/2, canvas.height/2-this.menuHeight/2, 0, 0, 2*Math.PI, false);
    var isPointInPath = ctx.isPointInPath(dx,dy-this.menuHeight/2);
    ctx.hexagone(dx,dy-this.menuHeight/2,r)
    //var dist = Math.sqrt(Math.pow(center.x-dx,2)+Math.pow(center.y-dy,2));
    var dist = Math.sqrt(Math.pow(center.x-dx,2)*Math.pow(Math.cos(ratio),2)+Math.pow(center.y-dy,2)*Math.pow(Math.sin(ratio),2));
    var c = 255-dist*255/(canvas.height*0.8);
    //c = c > 150 ? 150 : c < 50 ? 50 : c;
    var a = isPointInPath ? 0 : 1;
    ctx.fillStyle = 'rgba('+c+','+c+','+c+','+a+')';
    var l = dist*20/(canvas.width);
    l = l < 1 ? 1 : l;
    ctx.lineWidth = l;
    ctx.fill();
    w++;
    if (x+w*(r*2-r/4)-r*2 > canvas.width) {
      w = 0;
      h++;
    }
  }

  ctx.restore();
};
SystemFight.prototype.drawHexaButton = function (button,round) {
  ctx.hexagone(button.x,button.y-button.size,button.size);

  var fill = button.fill;
  var stroke = button.stroke;
  var disable = typeof button.disable === 'undefined' ? false : button.disable;

  if ((button.fill.split(';')).length > 1 || button.calcHoverFill) {
    var c = hexToRgb((fill.split(';'))[0]);
    c.r -= c.r > 30 ? 30 : -30;
    c.g -= c.g > 30 ? 30 : -30;
    c.b -= c.b > 30 ? 30 : -30;
    stroke = 'rgb('+c.r+','+c.g+','+c.b+')';
  }


  if (ctx.isPointInPath(mouse.x,mouse.y) && round%2==0 && !disable) {
    fill = stroke;
    if ((button.fill.split(';')).length > 1) {
      ctx.lineWidth = button.lineWidth;
      var imagetemp = ctx.clipAnything(function(a,b){
        b.hexagone(button.size-button.size/7,0,button.size);
        b.fillStyle = '#000';
        b.fill();
      },(button.size-button.size/7)*3,(button.size-button.size/7)*3,function(a,b){
        var c = button.fill.split(';');
        var r = 2*Math.PI/c.length;
        for (var i = 0; i < c.length; i++) {
          b.beginPath();
          b.moveTo(button.size-button.size/7,button.size);
          b.arc(button.size-button.size/7,button.size,button.size*2,r*i,r*(i+1),false);
          b.closePath();
          var cm = hexToRgb(c[i]);
          cm.r -= cm.r > 30 ? 30 : -30;
          cm.g -= cm.g > 30 ? 30 : -30;
          cm.b -= cm.b > 30 ? 30 : -30;
          b.fillStyle = 'rgb('+cm.r+','+cm.g+','+cm.b+')';
          b.fill();
        }
      });
      ctx.drawImage(imagetemp,button.x-button.size+button.size/7,button.y-button.size,(button.size-button.size/7)*3,(button.size-button.size/7)*3);
      ctx.strokeStyle = '#000';
      ctx.stroke();
    } else {
      ctx.fillStyle = disable ? fill : round%2==0 ? fill : button.disable_fill;
      ctx.fill();
      ctx.strokeStyle = disable ? stroke : round%2==0 ? stroke : button.disable_stroke;
      ctx.stroke();
    }
  } else {
    ctx.lineWidth = button.lineWidth;
    if ((button.fill.split(';')).length > 1) {
      var imagetemp = ctx.clipAnything(function(a,b){
        b.hexagone(button.size-button.size/7,0,button.size);
        b.fillStyle = '#000';
        b.fill();
      },(button.size-button.size/7)*3,(button.size-button.size/7)*3,function(a,b){
        var c = button.fill.split(';');
        var r = 2*Math.PI/c.length;
        for (var i = 0; i < c.length; i++) {
          b.beginPath();
          b.moveTo(button.size-button.size/7,button.size);
          b.arc(button.size-button.size/7,button.size,button.size*2,r*i,r*(i+1),false);
          b.closePath();
          b.fillStyle = c[i];
          b.fill();
        }
      });
      ctx.drawImage(imagetemp,button.x-button.size+button.size/7,button.y-button.size,(button.size-button.size/7)*3,(button.size-button.size/7)*3);
      ctx.strokeStyle = '#000';
      ctx.stroke();
    } else {
      ctx.fillStyle = disable ? fill : round%2==0 ? fill : button.disable_fill;
      ctx.fill();
      ctx.strokeStyle = disable ? stroke : round%2==0 ? stroke : button.disable_stroke;
      ctx.stroke();
    }
  }





  if (ctx.isPointInPath(mouse.x,mouse.y) && round%2==0 && !disable) {
    ctx.lineWidth = button.lineWidth;
    if (mouse.isLeftDown) {
      mouse.isLeftDown = false;
      button.onclick(typeof button.data !== 'undefined' ? button.data : null);
    }
    if (this.MenuAnimTemp != button.text) {
      this.MenuAnim = 0;
    }
    this.MenuAnimTemp = button.text;

    ctx.hexagone(button.x,button.y-(button.size+this.MenuAnim),button.size+this.MenuAnim);
    ctx.globalAlpha = 1-this.MenuAnim/50;
    if ((button.fill.split(';')).length > 1) {
      ctx.strokeStyle = '#000';
    } else {
      ctx.strokeStyle = stroke;
    }
    ctx.stroke();
    this.MenuAnim = this.MenuAnim < 50 ? this.MenuAnim+1 : 0;
    ctx.globalAlpha = 1;
  }



  ctx.beginPath();
  ctx.font = button.fontSize+'px Londrina';
  ctx.textAlign = "center";
  ctx.textBaseline = 'middle';
  ctx.fillStyle = disable ? button.textColor : round%2==0 ? button.textColor : button.disable_textColor;
  ctx.fillText(button.text,button.x,button.y);
};
SystemFight.prototype.drawMessage = function () {
  var nb = (canvas.width*0.4/(50*2-50/4));
  for (var i = 0; i < (canvas.width*0.4/(50*2-50/4)); i++) {
    ctx.hexagone((i*(50*2-50/4))-25,100,50);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
  if (this.messageData.OK) {
    if (this.messageAnim != null) this.messageAnim();
      if (this.messageData.OK) {
      var text = this.messageData.rowtext.split('\n');
      var l = 0;
      for (var i = 0; i < text.length; i++) {
        var currentText = text[i];
        ctx.beginPath();
        ctx.font = '60px Londrina';
        ctx.textAlign = "left";
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#111';

        if (10+ctx.measureText(currentText).width > (nb*(50*2-50/4))-50) {
          var temptext = [];
          var temptext2 = '';
          for (var j = 0; j < currentText.length; j++) {
            if (10+ctx.measureText(temptext2+''+currentText[j]).width > (nb*(50*2-50/4))-50) {
              temptext.push(temptext2);
              temptext2='';
              j--;
            } else {
              temptext2+=''+currentText[j];
            }
          }
          if (temptext2 != '') {
            temptext.push(temptext2);
          }
          for (var j = 0; j < temptext.length; j++) {
            ctx.fillText(temptext[j],10,150+l*60);
            l++;
          }
        } else {
          ctx.fillText(text[i],10,150+l*60);
          l++;
        }
      }

    }
  }
};
SystemFight.prototype.drawBackground = function () {
  if (this.background.OK) {
    ctx.beginPath();
    var w = canvas.width>canvas.height?canvas.width:this.background.width*canvas.height/this.background.height;
    var h = canvas.width>canvas.height?this.background.height*canvas.width/this.background.width:canvas.height;
    var x = canvas.width/2-w/2;
    var y = canvas.height-h;
    ctx.drawImage(this.background,x,y,w,h);
  }
};
SystemFight.prototype.drawReward = function () {
  if (this.indexReward != null) {
    var w = 0.4*canvas.width;
    var h = 180;
    var m = 60;

    ctx.translate(canvas.width/2-w/2,canvas.height/2-h/2-this.v1Reward);

    ctx.globalAlpha = 1-this.v1Reward*(this.v1Reward<0?-1:1)/300;

    ctx.beginPath();

    ctx.moveTo(m,0);
    ctx.lineTo(0,m);

    ctx.moveTo(m,h);
    ctx.lineTo(0,h-m);

    ctx.moveTo(w-m,0);
    ctx.lineTo(w,m);

    ctx.moveTo(w-m,h);
    ctx.lineTo(w,h-m);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (this.ImageReward.OK) {
      var w1 = 70;
      var h1 = w1*this.ImageReward.height/this.ImageReward.width;
      var x1 = m/2+5;
      var y1 = h/2-h1/2;
      ctx.drawImage(this.ImageReward,x1,y1,w1,h1);
    }


    var x2 = x1+w1+10;
    var y2 = h/2-31;

    ctx.beginPath();
    ctx.roundRect(x2,y2,w-x2-10-m,30,15);
    ctx.fillStyle = '#ddd';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fill();

    var w2 = (w-x2-10-m)*this.a.jaajs[this.indexReward].hp/this.a.jaajs[this.indexReward].calcStat.hp;
    ctx.roundRect(x2,y2,w2,30,15);
    ctx.fillStyle = '#0f0';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fill();

    ctx.font = '20px Londrina';
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#222';
    ctx.fillText(this.a.jaajs[this.indexReward].hp+' / '+this.a.jaajs[this.indexReward].calcStat.hp,x2+(w-x2-10-m)/2,y2+30/2);


    y2 = h/2+1;

    ctx.beginPath();
    ctx.roundRect(x2,y2,w-x2-10-m,30,15);
    ctx.fillStyle = '#ddd';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fill();


    w2 = (w-x2-10-m)*this.a.jaajs[this.indexReward].exp/this.a.jaajs[this.indexReward].calcStat.exp;
    ctx.beginPath();
    ctx.roundRect(x2,y2,w2,30,15);
    ctx.fillStyle = '#08f';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fill();

    ctx.font = '20px Londrina';
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#222';
    ctx.fillText(this.a.jaajs[this.indexReward].exp+' / '+this.a.jaajs[this.indexReward].calcStat.exp,x2+(w-x2-10-m)/2,y2+30/2);



    ctx.font = '30px Londrina';
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ddd';
    ctx.fillText('LEVEL '+this.a.jaajs[this.indexReward].lvl,w/2,m/2);

    ctx.globalAlpha = 1;

    ctx.setTransform(1,0,0,1,0,0);
  }
};
SystemFight.prototype.fullhexabackground = function () {
  var w = 0, h = 0, r = 50;
  var nb = (canvas.width/r)*(canvas.height/r)+20;
  var center = {
    x: canvas.width/2,
    y: canvas.height/2
  };


  for (var i = 0; i < nb; i++) {
    var dx = w*(r*2-r/4)+(h%2?(r*2-r/4)/2:0)-r/2;
    var dy = -r+h*(r+r/2);
    ctx.setTransform(1,0,0,1,0,0);


    var dist = Math.sqrt(Math.pow(center.x-dx,2)+Math.pow(center.y-dy,2));
    ctx.beginPath();
    ctx.hexagone(dx,dy,r);

    var a = 1-dist*1/this.v1;

    ctx.fillStyle = 'rgba(22,22,22,'+(a>0.9?1:a)+')';

    //var l = dist*20/(canvas.width);
    //l = l < 1 ? 1 : l;
    l=1;
    ctx.lineWidth = l;
    ctx.fill();
    w++;
    if (dx > canvas.width) {
      w = 0;
      h++;
    }
    if (dy-r*3 > canvas.height) {
      break;
    }
  }
};


SystemFight.prototype.Transition = function (callback) {
  this.rects = [];
  this.index = 0;
  this.side = 0;
  this.d = 200;
  world.objFight = this;
  world.Fight = true;
  this.c = callback || function(){};
};
SystemFight.prototype.endTransition = function (c) {
  var _this = this;
  this.currentAnim2 = function() {
    _this.animRadius+=50;
    if (_this.animRadius > canvas.width && _this.animRadius > canvas.height) {
      _this.currentAnim2 = null;
      c();
    }
  }
};
SystemFight.prototype.BeginningTransitionUpdate = function () {
  if (!this.place || this.status == 'END') {
    if (typeof this.rects[this.index] == 'undefined') {
      switch (this.side) {
        case 0:
          this.rects[this.index] = {
            x: this.d*Math.floor(this.index/4),
            y: this.d*Math.floor(this.index/4),
            w: 0,
            h: this.d,
            k: 'w'
          };
          break;
        case 1:
          this.rects[this.index] = {
            x: canvas.width-this.d-this.d*Math.floor(this.index/4),
            y: this.d*Math.floor(this.index/4),
            w: this.d,
            h: 0,
            k: 'h'
          };
          break;
        case 2:
          this.rects[this.index] = {
            x: canvas.width-this.d-this.d*Math.floor(this.index/4),
            y: canvas.height-this.d-this.d*Math.floor(this.index/4),
            w: 0,
            h: this.d,
            k: 'w'
          };
          break;
        case 3:
          this.rects[this.index] = {
            x: this.d*Math.floor(this.index/4),
            y: canvas.height-this.d-this.d*Math.floor(this.index/4),
            w: this.d,
            h: 0,
            k: 'h'
          };
          break;
        default:

      }
    }
    for (var i = 0; i < this.rects.length; i++) {
      var rect = this.rects[i];
      var dd = rect.k == 'w' ? canvas.width-2*this.d*Math.floor(i/4) : canvas.height-2*this.d*Math.floor(i/4);
      if (Math.abs(rect[rect.k])+150 < dd) {
        rect[rect.k]+=this.side>=2?-200:200;
      } else {
        if (Math.abs(rect[rect.k]) < dd) {
          rect[rect.k]+=this.side>=2?-200:200;
        }
        if (i+1 == this.rects.length) {
          if (this.d*Math.floor((i+1)/4) > canvas.width/2 || this.d*Math.floor((i+1)/4) > canvas.height/2) {
            this.currentAnim = this.EndingTransitionUpdate;
            if (this.status == 'START') {
              world.display = false;
              this.place = true;
            } else {
              world.display = true;
              this.place = false;
            }

          } else {
            this.index++;
            this.side++;
            if (this.side>3) {this.side=0;}
          }
        }
      }
    }
  }
  return '';
};
SystemFight.prototype.EndingTransitionUpdate = function () {
  this.animRadius = 0;
  if (this.rects.length > 0) {
    var currentRect = this.rects[this.rects.length-1];
    if (Math.abs(currentRect[currentRect.k]) > 0) {
      currentRect[currentRect.k] -= currentRect[currentRect.k] < 0 ? -100 : 100;
      if (Math.abs(currentRect[currentRect.k]) < 150 && this.rects.length > 1) {
        var nextRect = this.rects[this.rects.length-2];
        nextRect[nextRect.k] -= nextRect[nextRect.k] < 0 ? -100 : 100;
      }
    } else {
      this.rects.pop();
    }
  } else {
    this.currentAnim = function(){};
    if (this.status == 'START') {
      this.beforeFight();
    } else {
      world.objFight = null;
      world.Fight = false;
      this.callback(this.a);
    }
  }
  return '';
};
SystemFight.prototype.beforeFight = function () {
  var _this = this;
  this.a.showJaajBalls();
  if (this.fightMode) {
    this.b.showJaajBalls();
  }
  var msg = this.fightMode ? 'You are challenged by\n'+(this.b.data.name || this.b.rowdata.name)+'!' : 'Wild '+(this.b.jaajs[0].name || this.b.jaajs[0].name)+' appeared!';
  this.showMessage(msg,function(){
    _this.showMessage('GO! '+_this.a.jaajs[0].name+'!',function(){
      _this.a.Init(function(){
        _this.round++;
      });
      if (this.fightMode) {
        _this.b.Init();
      }
    });
  });
};
SystemFight.prototype.showFullMenu = function (c) {
  var _this = this;
  this.v1 = 1;
  this.v2 = canvas.width>canvas.height?canvas.width:canvas.height;
  this.fullMenu = true;
  this.currentAnim2 = function() {
    var test = 1-_this.v2/2*1/_this.v1;
    _this.v1 += 150;
    if (test > 0.97) {
      _this.fullMenuOK = true;
      _this.currentAnim2 = null;
      c();
    }
  };
};


SystemFight.prototype.showMessage = function (text,c,keep) {
  var _this = this;
  this.messageData.text = text;
  this.messageData.rowtext = '';
  this.messageData.index = 0;
  this.messageData.wait = 0;
  this.messageData.tmp = 0;
  this.messageData.keep = typeof keep === 'undefined' ? false : keep;
  this.messageData.speed = 3;
  this.messageData.OK = true;
  this.messageAnim = function () {
    if (_this.messageData.rowtext==_this.messageData.text) {
      _this.messageData.tmp++;
      if (!this.messageData.keep) {
        if (mouse.isLeftDown || _this.messageData.tmp > 50) {
          mouse.isLeftDown=false;
          _this.messageAnim = null;
          _this.messageData = {
            OK: false
          };
          c();
        }
      }
    } else {
      if (mouse.isLeftDown) {
        mouse.isLeftDown=false;
        _this.messageData.rowtext=_this.messageData.text;
      } else {
        if (_this.messageData.wait < _this.messageData.speed) {
          _this.messageData.wait++;
        } else {
          _this.messageData.wait = 0;
          if (_this.messageData.text[_this.messageData.index]==' ') {
            _this.messageData.rowtext+=_this.messageData.text[_this.messageData.index];
            _this.messageData.index++;
          }
          _this.messageData.rowtext+=_this.messageData.text[_this.messageData.index];
          _this.messageData.index++;
        }
      }
    }
  };
};
SystemFight.prototype.FixObjectOnImage = function () {
  if (this.background.OK) {
    var w = canvas.width>canvas.height?canvas.width:this.background.width*canvas.height/this.background.height;
    var h = canvas.width>canvas.height?this.background.height*canvas.width/this.background.width:canvas.height;
    var x = canvas.width-0.23*w;
    var y = canvas.height-0.26*h;
    this.b.x = x;
    this.b.y = y;
    this.b.factor = w/this.background.width*0.8;
    /*
    ctx.beginPath();
    ctx.arc(x,y,w/100,0,2*Math.PI,false);
    ctx.fillStyle = '#f00';
    ctx.fill();
    */


    var w = canvas.width>canvas.height?canvas.width:this.background.width*canvas.height/this.background.height;
    var h = canvas.width>canvas.height?this.background.height*canvas.width/this.background.width:canvas.height;
    var x = 0.23*w;
    var y = canvas.height-0.15*h;
    this.a.x = x;
    this.a.y = y;
    this.a.factor = w/this.background.width;
    /*
    ctx.beginPath();
    ctx.arc(x,y,w/100,0,2*Math.PI,false);
    ctx.fillStyle = '#f00';
    ctx.fill();
    */
  }
};


SystemFight.prototype.fightVictory = function () {
  var _this = this;
  menu.default();
  this.status = 'END';
  this.round += this.round%2==0 ? 1 : 0;
  this.MenuName = ['main'];
  this.a.showTrainer();
  if (this.fightMode) {
    this.b.showTrainer();
  }
  setTimeout(function () {
    _this.showFullMenu(function(){
      _this.giveReward();
    });
  }, 1000);
};
SystemFight.prototype.fightDefeat = function () {
  player.memory.jaajs = this.a.jaajs;
  player.memory.items = this.a.items;
  menu.default();
  this.status = 'END';
  this.round += this.round%2==0 ? 1 : 0;
  this.MenuName = ['main'];
  //on tp le joueur dans le dernier centre jaaj visiter sinon on le tp chez lui
};
SystemFight.prototype.giveReward = function () {
  var _this = this;
  var availableExp = 0;
  if (this.fightMode) {
    for (var i = 0; i < this.b.jaajs.length; i++) {
      availableExp += this.b.jaajs[i].calcStat.gainExp;
    }
  } else {
    availableExp = this.b.jaajs[0].calcStat.gainExp;
  }

  var nb = 0;
  for (var i = 0; i < this.a.jaajs.length; i++) {
    nb += this.a.jaajs[i].fight ? 1 : 0;
  }
  var availableShareExp = availableExp / nb;
  this.updateJaaj(0,availableShareExp,function(){
    _this.endTransition(function(){
        world.display = true;
        _this.place = false;
        _this.currentAnim = function(){
          _this.animRadius -= 80;
          if (_this.animRadius <= 0) {
            _this.currentAnim = null;
            world.objFight = null;
            world.Fight = false;
            player.enableControls = true;
            _this.callback(_this.a);
          }
        }
      /*
      _this.currentAnim = _this.BeginningTransitionUpdate;
      _this.startAnim = true;
      _this.Transition();*/
    });
  });
};
SystemFight.prototype.updateJaaj = function (index,exp,c) {
  var _this = this;
  if (typeof this.a.jaajs[index] !== 'undefined') {
    if (this.a.jaajs[index].fight) {
      this.testv = 0;
      this.v1Reward = -300;
      this.ImageReward.OK = false;
      this.ImageReward.src = 'assets/jaajs/'+jaajList[this.a.jaajs[index].id][this.a.jaajs[index].evolutionLvl || 0].imagePath;
      this.indexReward = index;
      this.currentAnim2 = function() {
        _this.v1Reward+=5;
        if (_this.v1Reward >= 0) {
          _this.currentAnim2 = function(){
            _this.testv++;
            _this.a.jaajs[_this.indexReward].exp++;
            if (_this.a.jaajs[_this.indexReward].exp >= _this.a.jaajs[_this.indexReward].calcStat.exp) {
              _this.a.jaajs[_this.indexReward].lvl++;
              _this.a.jaajs[_this.indexReward].calcStat.exp = (new FightAlgorithm(null)).getExp(_this.a.jaajs[_this.indexReward].lvl);
            }
            if (_this.testv >= exp) {
              setTimeout(function () {
                _this.currentAnim2 = function(){
                  _this.v1Reward+=5;
                  if (_this.v1Reward >= 300) {
                    _this.currentAnim2 = null;
                    index++;
                    _this.updateJaaj(index,exp,c);
                  }
                };
              }, 500);
            }
          };
        }
      };
    } else {
      index++;
      this.updateJaaj(index,exp,c);
    }
  } else {
    c();
  }
};











function FightTrainer(data,x,y,inv,m) {
  this.data = data;

  this.animationAttack = null;
  this.m = m;

  if (this.m) {
    this.jaajs = data.jaajs;
    this.items = data.items;
  } else {
    this.jaajs = [data.jaajs[getRandomIntInclusive(0,Object.keys(data.jaajs).length-1)]];
  }


  this.statUpdateDrawTiUpV1 = 0;
  this.statUpdateDrawTiUp = 0;
  this.statUpdateDrawTiDownV1 = 0;
  this.statUpdateDrawTiDown = 0;

  for (var i = 0; i < this.jaajs.length; i++) {
    var id = this.jaajs[i].id;
    if (typeof this.jaajs[i].name === 'undefined') {
      this.jaajs[i].name = jaajList[id][this.jaajs[i].evolutionLvl || 0].name;
    }
    this.jaajs[i].Type = jaajList[id][this.jaajs[i].evolutionLvl || 0].Type;
    this.jaajs[i].AlgoFight = new FightAlgorithm(this.jaajs[i]);
    this.jaajs[i].calcStat = this.jaajs[i].AlgoFight.calcStat();
    if (typeof this.jaajs[i].hp === 'undefined') {
      this.jaajs[i].hp = this.jaajs[i].calcStat.hp;
    }
  }


  this.x = x;
  this.y = y;
  this.inv = inv;
  this.invValue = this.inv ? -1 : 1;

  this.factor = inv ? 0.7 : 1;

  this.index = 0;
  this.current = null;
  this.currentTransition = 0;

  this.wait = 10;
  this.trainerPos = 0;

  this.jaajBallsPos = canvas.width;

  this.currentAnim = null;
  this.currentAnim2 = null;
  this.currentAnim3 = null;

  this.showBalls = false;
  this.showData = false;

  this.tempx = 0;
  this.tempy = 0;
  this.tempalpha = 0;

  this.tempbool = false;
};
FightTrainer.prototype.Init = function (c) {
  if (this.m) {
    var _this = this;
    this.currentAnim2 = function() {
      if (_this.wait > 0) {
        _this.wait--;
      } else {
        _this.currentAnim2 = null;
        _this.showJaajData();
        _this.hideTrainer(function(){
          _this.sendJaaj(_this.index);
          if (typeof c === 'function') c();
        });
      }
    };
  } else {
    this.sendJaaj(0);
    if (typeof c === 'function') c();
  }
};


FightTrainer.prototype.draw = function () {
  if (this.currentAnim != null) this.currentAnim();
  if (this.currentAnim2 != null) this.currentAnim2();
  this.drawPlace();
  this.drawJaaj();
  if (this.m) this.drawJaajBalls();
  this.drawJaajData();
  if (this.m) this.drawTrainer();
  if (this.currentAnim3 != null) this.currentAnim3();
};
FightTrainer.prototype.drawJaajBalls = function () {
  if (this.jaajBallsPos > 0 && this.showBalls) {
    this.jaajBallsPos-=30;
    if (this.jaajBallsPos<0) {
      this.jaajBallsPos = 0;
    }
  }
  if (this.showData && this.jaajBallsPos < canvas.width) {
    this.jaajBallsPos+=30;
    if (this.jaajBallsPos>canvas.width) {
      this.jaajBallsPos = canvas.width;
    }
  }
  ctx.beginPath();
  var x = 0, y = 0;
  ctx.translate(this.inv?-this.jaajBallsPos:this.jaajBallsPos,0);
  if (!this.inv) {
    x = this.x+400+30;
    y = this.y-80;
    ctx.translate(this.x+400,this.y-80);
    ctx.moveTo(canvas.width-(this.x+400),0);
    ctx.lineTo(0,0);
    ctx.lineTo(0,-10);
    ctx.lineTo(-20,0);
    ctx.lineTo(0,0);
  } else {
    x = this.x-400-30;
    y = this.y-200;
    ctx.translate(0,this.y-200);
    ctx.moveTo(0,0);
    ctx.lineTo(this.x-400,0);
    ctx.lineTo(this.x-400,-10);
    ctx.lineTo(this.x-400+20,0);
  }
  ctx.lineTo(0,0);
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';
  ctx.lineJoin = 'miter';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fill();

  ctx.setTransform(1,0,0,1,0,0);
  ctx.translate(this.inv?-this.jaajBallsPos:this.jaajBallsPos,0);
  ctx.translate(x,y-20);
  for (var i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(0,0,10,0,2*Math.PI,false);
    ctx.strokeStyle = '#000';
    ctx.stroke();
    if (i+1 <= this.jaajs.length) {
      ctx.fillStyle = '#f00';
      ctx.fill();
    }
    ctx.translate(this.inv?-30:30,0);
  }
  ctx.setTransform(1,0,0,1,0,0);
};
FightTrainer.prototype.drawJaajData = function () {
  if (this.current != null && this.current.image.OK && this.current.display) {


    var w = this.current.image.width*this.factor;
    var h = this.current.image.height*this.factor;
    var x = this.x-w/2;
    var y = this.y-h*0.9;

    if (this.inv) {
      x += -450;
      y += -60+h/2;
    } else {
      x += w+50;
      y += 140+h/2;
    }

    /*
    var x = this.inv?this.x-800:this.x+400;
    var y = this.inv?this.y-100:this.y-80;*/

    ctx.save();



    ctx.translate(x,y);

    ctx.beginPath();
    if (this.inv) {
      ctx.moveTo(400,-20);
      ctx.lineTo(420,20);
      ctx.lineTo(20,0);
    } else {
      ctx.moveTo(0,-20);
      ctx.lineTo(-20,20);
      ctx.lineTo(380,0);
    }
    ctx.fillStyle = '#111';
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(0,-100,400,100,{tl: 40, tr: 10, br: 40, bl: 10});
    ctx.fillStyle = '#ddd';
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 5;
    ctx.fill();
    ctx.stroke();

    ctx.translate(20,-80);


      ctx.beginPath();
      ctx.font = '30px Londrina';
      ctx.textAlign = "left";
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#222';
      ctx.fillText(typeof this.current.data.name !== 'undefined' ? this.current.data.name : typeof this.current.rowData.name !== 'undefined' ? this.current.rowData.name : 'Unknown Jaaj! (jaajDex Error)',0,0);



      ctx.beginPath();
      ctx.font = '30px Londrina';
      ctx.textAlign = "right";
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#222';
      ctx.fillText(typeof this.current.data.lvl !== 'undefined' ? 'Lvl '+this.current.data.calcStat.lvl : 'Lvl 0',370,0);


    ctx.beginPath();
    ctx.roundRect(0,30,40,30,{tl: 12, tr: 0, br: 0, bl: 12});
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(40,30,320,30,{tl: 0, tr: 12, br: 12, bl: 0});
    ctx.fillStyle = '#111';
    ctx.fill();
    if (typeof this.current.rowData.hp != 'undefined') {
      ctx.beginPath();
      ctx.roundRect(42,32,this.current.data.hp*316/this.current.data.calcStat.hp,26,{tl: 0, tr: 12, br: 12, bl: 0});
      ctx.fillStyle = '#0f0';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.font = '30px Londrina';
    ctx.textAlign = "left";
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#FFCD00';
    ctx.fillText('HP',8,28);

    /*
    316-42   hp        ?
    100      maxhp     316-42*/


    ctx.setTransform(1,0,0,1,0,0);

    ctx.restore();
  }
};
FightTrainer.prototype.drawPlace = function () {
  ctx.beginPath();
  ctx.ellipse(this.x,this.y,300*this.factor,100*this.factor,0,2*Math.PI,false);
  ctx.fillStyle = '#75DB72';
  ctx.fill();
};
FightTrainer.prototype.drawJaaj = function () {
  var _this = this;
  if (this.current != null && this.current.image.OK && this.current.display) {
    var w = this.current.image.width*this.factor;
    var h = this.current.image.height*this.factor;
    var x = this.x-w/2+(this.inv?-this.tempx:this.tempx);
    var y = this.y-h*0.9+(this.inv?-this.tempy:this.tempy);
    var inv = this.inv ? -this.current.rowData.orientation : this.current.rowData.orientation;

    if (this.currentTransition > 0) {
      if (!this.current.isDead) this.currentTransition-=3;
      var cc=document.createElement('canvas');
      cc.width=w;
      cc.height=h;
      var cctx=cc.getContext("2d");
      var img=this.current.image;
      cctx.drawImage(img,0,0,w,h);
      var imgData=cctx.getImageData(0,0,cc.width,cc.height);
      for (var i=0;i<imgData.data.length;i+=4) {
        imgData.data[i]=255;
        imgData.data[i+1]=255;
        imgData.data[i+2]=255;
        imgData.data[i+3]=imgData.data[i+3]!=0?this.currentTransition*255/100:0;
      }
      cctx.putImageData(imgData,0,0);
    }

    ctx.translate(x,y);
    if (inv == -1) {
      ctx.scale(-1,1);
    }
    ctx.globalAlpha = this.tempalpha != 0 ? 0 : 1;

    if (this.statUpdateDrawTiDown > 0) {
      if (this.statUpdateDrawTiDownV1%20==0) this.statUpdateDrawTiDownV1 = 0;
      this.statUpdateDrawTiDownV1++;

      var newImage = ctx.clipImage(this.current.image,w,h,function(a,b){
        b.beginPath();
        b.rect(0,0,a.width,a.height);
        b.fillStyle = '#08f';
        b.fill();


        for (var i = 0; i < a.height/20; i++) {
          b.beginPath();
          b.triangleLine(0,_this.statUpdateDrawTiDownV1%20,a.width*1.5,Math.PI/3,50);
          b.lineWidth = 10;
          b.lineJoin = 'miter';
          b.strokeStyle = '#00f';
          b.stroke();
          b.translate(0,20);
        }
      });
      ctx.drawImage(newImage,0,0,w*inv,h);

    } else if (this.statUpdateDrawTiUp > 0) {
      if (this.statUpdateDrawTiUpV1%20==0) this.statUpdateDrawTiUpV1 = 0;
      this.statUpdateDrawTiUpV1--;

      var newImage = ctx.clipImage(this.current.image,w,h,function(a,b){
        b.beginPath();
        b.rect(0,0,a.width,a.height);
        b.fillStyle = '#FF5500';
        b.fill();


        for (var i = 0; i < a.height/20; i++) {
          b.beginPath();
          b.triangleLine(0,_this.statUpdateDrawTiUpV1%20,a.width*1.5,Math.PI/3,50);
          b.lineWidth = 10;
          b.lineJoin = 'miter';
          b.strokeStyle = '#FF1F00';
          b.stroke();
          b.translate(0,20);
        }
      });
      ctx.drawImage(newImage,0,0,w*inv,h);

    } else {
      ctx.drawImage(this.current.image,0,0,w*inv,h);
      if (this.currentTransition > 0) {
        ctx.drawImage(cc,0,0,cc.width*inv,cc.height);
      }
    }




    ctx.globalAlpha = 1;
    ctx.setTransform(1,0,0,1,0,0);
  }
};
FightTrainer.prototype.drawTrainer = function () {
  if (Math.abs(this.trainerPos) < canvas.width/2) {
    ctx.beginPath();
    ctx.rect(this.trainerPos+this.x-(200*this.factor)/2,this.y-200*this.factor,200*this.factor,200*this.factor);
    ctx.fillStyle = '#0ff';
    ctx.fill();
  }
};
FightTrainer.prototype.drawMessage = function () {

};


FightTrainer.prototype.showJaajBalls = function () {
  if (!this.showBalls) {
    this.jaajBallsPos = canvas.width;
    this.showBalls = true;
    this.showData = false;
  }
};
FightTrainer.prototype.showJaajData = function () {
  if (!this.showData) {
    this.showBalls = false;
    this.showData = true;
  }
};
FightTrainer.prototype.hideTrainer = function (c) {
  var _this = this;
  this.currentAnim2 = function() {
    _this.trainerPos+=this.inv?20:-20;
    if (Math.abs(_this.trainerPos) >= canvas.width/2) {
      _this.currentAnim2 = null;
      c();
    }
  };
};
FightTrainer.prototype.showTrainer = function (c) {
  var _this = this;
  this.showJaajBalls();
  this.currentAnim2 = function() {
    _this.trainerPos-=this.inv?20:-20;
    if (Math.abs(_this.trainerPos) <= 0) {
      _this.currentAnim2 = null;
      _this.trainerPos = 0;
      if (typeof c === 'function') c();
    }
  };
};


FightTrainer.prototype.sendJaaj = function (index) {
  var _this = this;
  this.index = index;
  this.jaajs[index].fight = true;
  var id = this.jaajs[index].id;
  //this.loadJaaj(id,function(data){


  this.current = {
    data: this.jaajs[index],
    rowData: jaajList[id][0],
    image: new Image(),
    display: true,
    isDead: false
  };
  this.currentTransition = 100;
  this.current.image.OK = false;
  this.current.image.onload = function() {
    this.OK = true;
  };
  this.current.image.src = 'assets/jaajs/'+jaajList[id][this.jaajs[index].evolutionLvl || 0].imagePath;
  this.current.rowData.name = jaajList[id][this.jaajs[index].evolutionLvl || 0].name;
  //});
};
FightTrainer.prototype.callBackJaaj = function (c) {
  var _this = this;
  if (this.currentAnim == null) {
    this.currentTransition = 0;
    this.tempbool = false;
    this.currentAnim = function(){
      _this.callBackJaaj(c);
    };
  } else {
    if (this.currentTransition < 100) {
      this.currentTransition+=10;
    } else if (!this.tempbool) {
      this.tempbool = true;
      this.currentAnim = null;
      this.current = null;
      c();
    }
  }
};
FightTrainer.prototype.attackJaaj = function (attackData,c) {
  var _this = this;
  if (this.currentAnim == null) {
    this.tempx = 0;
    this.tempy = 0;
    this.tempc = false;
    this.OK1 = false;
    this.OK2 = false;
    this.currentAnim = function(){
      _this.attackJaaj(attackData,c)
    };
  } else {
    if (this.tempx < 60 && !this.OK1) {
      this.tempx += 8;
    } else if (this.tempx > 0 && this.OK1 && this.OK2) {
      this.tempx -= 4;
      if (this.tempx < 0) {
        this.tempx = 0;
      }
    } else {
      this.OK1 = true;
    }
    if (this.tempy > -30 && !this.OK2) {
      this.tempy -= 2;
    } else if (this.tempy < 0 && this.OK1 && this.OK2) {
      this.tempy += 1;
      if (this.tempy > 0) {
        this.tempy = 0;
      }
    } else {
      this.OK2 = true;
    }
    if (this.OK1 && this.OK2 && !this.tempc) {
      this.tempc = true;
      c();
    }
    if (this.tempx == 0 && this.tempy == 0) {
      this.currentAnim = null;
    }
  }
};
FightTrainer.prototype.damageJaaj = function (Obj,attackData,c) {
  //Simple flash Animation + Up or Down Stat Animation
  var _this = this;
  var objDamage = Obj.AlgoFight.calcDamage(attackList[attackData].data,_this.jaajs[_this.index]);
  var damage = objDamage.Damage;
  if (damage > 0) {
    this.tempalpha = 1;
    setTimeout(function () {
      _this.tempalpha = 0;
      setTimeout(function () {
        updateStat();
        if (objDamage.CoeffType == 0) {
          world.objFight.showMessage("It's not effective!",Next2);
        } else if (objDamage.CoeffType < 1) {
          world.objFight.showMessage("It's not very effective!",Next2);
        } else if (objDamage.CoeffType > 1) {
          world.objFight.showMessage("It's super effective!",Next2);
        } else {
          Next2();
        }
        function Next2() {
          function Next() {
            if (_this.jaajs[_this.index].hp <= 0) {
              _this.jaajs[_this.index].hp = 0;
              _this.deadJaaj(c);
            } else {
              _this.currentAnim = function () {
                _this.statUpdateDrawTiDown--;
                _this.statUpdateDrawTiUp--;
                if (_this.statUpdateDrawTiDown <= 0 && _this.statUpdateDrawTiUp <= 0) {
                  _this.currentAnim = null;
                  c();
                }
              }
            }
          };
          if (attackList[attackData].data.animation.enable && attackList[attackData].spriteSheet != '') {
            _this.animationAttack = (new Animation()).add({
              position: 'absolute',
              x:_this.x-attackList[attackData].gw/2,
              y:_this.y-attackList[attackData].gh/2,
              animation: attackList[attackData].animation,
              src: attackList[attackData].spriteSheet,
              gw: attackList[attackData].gw,
              gh: attackList[attackData].gh,
              speed: attackList[attackData].data.animation.speed,
              loop: false,
              callback: Next
            });
            _this.currentAnim3 = function(){
              _this.animationAttack.play();
              if (_this.animationAttack.isEnd) {
                _this.currentAnim3 = null;
                _this.animationAttack.callback();
              }
            };
          } else {
            Next();
          }
        }
      }, 50);
    }, 50);
  } else {
    updateStat();
    if (objDamage.CoeffType == 0) {
      world.objFight.showMessage("It's not effective!",Next2);
    } else if (objDamage.CoeffType < 1) {
      world.objFight.showMessage("It's not very effective!",Next2);
    } else if (objDamage.CoeffType > 1) {
      world.objFight.showMessage("It's super effective!",Next2);
    }
    function Next2() {
      _this.currentAnim = function () {
        _this.statUpdateDrawTiDown--;
        _this.statUpdateDrawTiUp--;
        if (_this.statUpdateDrawTiDown <= 0 && _this.statUpdateDrawTiUp <= 0) {
          _this.currentAnim = null;
          c();
        }
      }
    }
  }

  function updateStat() {
    var objDamage = Obj.AlgoFight.calcDamage(attackList[attackData].data,_this.jaajs[_this.index]);
    var h = objDamage.Damage;
    var a = attackList[attackData].data.adverse.attack;
    var d = attackList[attackData].data.adverse.defense;
    var s = attackList[attackData].data.adverse.speed;
    if (a > 0 || d > 0 || s > 0) {
      _this.statUpdateDrawTiUp = 100;
    }
    if (a < 0 || d < 0 || s < 0) {
      _this.statUpdateDrawTiDown = 100;
    }
    _this.jaajs[_this.index].hp -= h;
    _this.jaajs[_this.index].attack += a;
    _this.jaajs[_this.index].defense += d;
    _this.jaajs[_this.index].speed += s;
  };
};
FightTrainer.prototype.deadJaaj = function (c) {
  var _this = this;
  if (this.currentAnim == null) {
    this.statUpdateDrawTiUpV1 = 0;
    this.statUpdateDrawTiUp = 0;
    this.statUpdateDrawTiDownV1 = 0;
    this.statUpdateDrawTiDown = 0;
    this.current.isDead = true;
    this.currentTransition = 0;
    this.tempbool = false;
    this.currentAnim = function(){
      _this.deadJaaj(c);
    };
  } else {
    if (this.currentTransition < 100) {
      this.currentTransition+=4;
    } else if (!this.tempbool) {
      this.tempbool = true;
      this.currentAnim = null;
      this.current = null;
      if (typeof this.jaajs[this.index+1] != 'undefined') {
        this.index++;
        setTimeout(function () {
          if (!_this.inv) {
            menu.invokeSystemFightFullmenuDraw = true;
            menu.disableBack = true;
            menu.selectJaaj(function(jaaj){
              menu.c1 = function(){
                menu.appli = false;
                if (jaaj == null) {
                  //console.log('Cancel!');
                } else {
                  menu.invokeSystemFightFullmenuDraw = false;
                  menu.disableBack = false;
                  _this.sendJaaj(jaaj);
                  setTimeout(function () {
                    c();
                  }, 500);
                }
              };
              menu.hideFullMenu();
            },'fight');
          } else {
            _this.sendJaaj(_this.index);
            setTimeout(function () {
              c();
            }, 500);
          }
        }, 1000);
      } else if (!this.inv) {
        //DEFEAT
        c(0);
      } else {
        //VICTORY
        c(1);
      }
    }
  }
};


FightTrainer.prototype.showMessage = function (c) {

};












function FightAlgorithm(data) {
  this.data = data;
  if (data != null) {
    var row = jaajList[data.id][0];
    this.data.lvl = this.getLvl();
    this.data.IV_Attack = data.IV[0];
    this.data.IV_Defense = data.IV[1];
    this.data.IV_Speed = data.IV[2];
    this.data.EV_Attack = data.EV[0];
    this.data.EV_Defense = data.EV[1];
    this.data.EV_Speed = data.EV[2];
    this.data.BaseHp = row.hp;
    this.data.BaseAttack = row.attack;
    this.data.BaseDefense = row.defense;
    this.data.BaseSpeed = row.speed;
  }
  return this;
};
FightAlgorithm.prototype.getHP = function () {
  var data = this.data;
  return Math.floor ( 2 * data.BaseHp * data.lvl / 100 + 10 + data.lvl );
};
FightAlgorithm.prototype.getAttack = function () {
  var data = this.data;
  return Math.floor ( Math.floor ( ( 2 * data.BaseAttack + data.IV_Attack + data.EV_Attack / 4 ) * data.lvl / 100 + 5 ) * 1 );
};
FightAlgorithm.prototype.getDefense = function () {
  var data = this.data;
  return Math.floor ( Math.floor ( ( 2 * data.BaseDefense + data.IV_Defense + data.EV_Defense / 4 ) * data.lvl / 100 + 5 ) * 1 );
};
FightAlgorithm.prototype.getSpeed = function () {
  var data = this.data;
  return Math.floor ( Math.floor ( ( 2 * data.BaseSpeed + data.IV_Speed + data.EV_Speed / 4 ) * data.lvl / 100 + 5 ) * 1 );
};
FightAlgorithm.prototype.getGainExp = function () {
  var data = this.data;
 return Math.floor ( Math.min ( 255 , Math.floor ( Math.sqrt ( Math.max ( 0, data.exp + 300 ) ) + 1 ) ) / 4 );
};
FightAlgorithm.prototype.getLvl = function () {
  var data = this.data;
  return Math.round ( Math.exp ( Math.log ( data.exp ) / 3 ) ) + 1;
};
FightAlgorithm.prototype.getExp = function (lvl) {
  return Math.pow ( lvl , 3 );
};
FightAlgorithm.prototype.calcStat = function () {
  return {
    hp:this.getHP(),
    exp:this.getExp(this.data.lvl+1),
    lvl:this.data.lvl,
    gainExp:this.getGainExp(),
    attack:this.getAttack(),
    defense:this.getDefense(),
    speed:this.getSpeed()
  };
};
FightAlgorithm.prototype.calcDamage = function (jaajAttack,jaajObj) {
  var data = this.data;
  var CoeffType = this.calcTypeCoefficient(jaajAttack.Type,jaajObj.Type);
  var Modifier = getRandomIntInclusive(85,100) / 100 * CoeffType; //Weather (Rain,fire) ; Critical ; Type...
  return {
    Damage:Math.ceil( ( ( ( ( 2 * data.lvl ) / 5 + 2 ) * jaajAttack.adverse.power * this.getAttack() / jaajObj.calcStat.defense ) / 50 ) * Modifier ),
    CoeffType:CoeffType
  };
};
FightAlgorithm.prototype.calcTypeCoefficient = function (a,b) {
  a = a.split(';');
  b = b.split(';');
  var coeff = 1;
  for (var i = 0; i < a.length; i++) {
    for (var j = 0; j < b.length; j++) {
      if (typeof typeDataList[a[i]] !== 'undefined') {
        if (typeof typeDataList[a[i]][b[i]] !== 'undefined') {
          coeff *= typeDataList[a[i]][b[i]];
        }
      }
    }
  }
  return coeff;
};


function MemoryManagement() {
  this.id = '';
  this.memoryObject = {};
  this.object = null;
  this.regex = /%[a-zA-Z0-9\.:;]+%/g;
};
MemoryManagement.prototype = {
  set: function(key,value,idMemory,next) {
    var _this = this;
    this.id = idMemory;
    this.memoryObject = player.memory;
    this.isC = false;

    if (typeof this.memoryObject[this.id] == 'undefined') {
      this.memoryObject[this.id] = {};
    }

    this.memoryObject = this.memoryObject[this.id];

      var pathMemory = key.slice(1,-1);
      var refMemoryMob = false;
      if ('%'+pathMemory+'%' == key) {
        if (pathMemory.replace(/\./g,'') == pathMemory) {
          if (value == '_DELETE_') {
            delete this.memoryObject[pathMemory];
          } else {
            this.memoryObject[pathMemory] = (value+'').replace(this.regex,this.replaceByValue);
          }
          this.isC = true;
        } else {
          var currentObjMemory = this.memoryObject;
          var globalPriority = false;
          pathMemory = pathMemory.split('.');
          for (var i = 0; i < pathMemory.length; i++) {
            if ((i == 0 && pathMemory[i] == 'global') || (i == 0 && this.id == 'player' && pathMemory[i] == 'data')) {
              if (pathMemory[i] == 'global') {
                globalPriority = true;
                for (var i in world.ObjectMob) {
                  if (world.ObjectMob.hasOwnProperty(i)) {
                    if (world.ObjectMob[i].id == this.id) {
                      currentObjMemory = world.ObjectMob[i].memory;
                      refMemoryMob = world.ObjectMob[i].memory;
                      break;
                    }
                  }
                }
              } else if (pathMemory[i] == 'data') {
                currentObjMemory = player;
              }
            }

            if (i>=pathMemory.length-1) {
              if (typeof currentObjMemory[pathMemory[i]] == 'undefined') {
                if (value == '_DELETE_') {
                  delete currentObjMemory[pathMemory[i]]
                } else {
                  currentObjMemory[pathMemory[i]] = (value+'').replace(this.regex,this.replaceByValue);
                }
              } else {
                if (value == '_DELETE_') {
                  delete currentObjMemory[pathMemory[i]]
                } else {
                  currentObjMemory[pathMemory[i]] = (value+'').replace(this.regex,this.replaceByValue);
                }
              }
            } else {
              if (typeof currentObjMemory[pathMemory[i]] == 'undefined') {
                currentObjMemory[pathMemory[i]] = {};
              }
              currentObjMemory = currentObjMemory[pathMemory[i]];
            }



          }
          this.isC = true;

        }

      }
      if (this.isC) {
        if (refMemoryMob) {
          var d = {
            mode: 'UPDATE',
            table: 'mobs',
            where: 'idMob',
            whereValue: this.id,
            row: {}
          };
          d.row['memory'] = JSON.stringify(refMemoryMob);
          socket.SetMysql(d,function(data){next();});
        } else {
          var d = {
            mode: 'UPDATE',
            table: 'editormembre',
            where: 'mail',
            whereValue: player.mail,
            row: {}
          };
          d.row['memory'] = JSON.stringify(player.memory);
          socket.SetMysql(d,function(data){next();});
        }
      }
  },
  get: function(object,idMemory) {
    var _this = this;
    this.id = idMemory;
    this.object = object;
    if (this.id == 'player') {
      this.memoryObject = player.memory;
    } else {
      for (var i in world.ObjectMob) {
        if (world.ObjectMob.hasOwnProperty(i)) {
          if (world.ObjectMob[i].id == this.id) {
            this.memoryObject = world.ObjectMob[i].memory;
            break;
          }
        }
      }
    }


      if (typeof object == 'object') {
        for (var i in object) {
          if (object.hasOwnProperty(i)) {
            if (object[i] != '' && object[i] != null && typeof object[i] == 'string') {
              object[i] = (object[i]+'').replace(this.regex,this.replaceByValue);
            }
          }
        }
        return object;
      } else if (typeof object == 'string') {
        return (object+'').replace(this.regex,this.replaceByValue);
      } else {
        return object;
      }
    
  },
  replaceByValue: function(m) {
    var pathMemory = m.slice(1,-1);
    var globalPriority = false;
    var currentObjMemory = memoryManagement.memoryObject;
    if (typeof player.memory[memoryManagement.id] != 'undefined') {
      var localMemory = player.memory[memoryManagement.id];
    } else {
      var localMemory = memoryManagement.memoryObject;
    }

    //OTHER MEMORY BY ID
    if (pathMemory.toLowerCase().substring(0,6) == 'player') {
      memoryManagement.id = 'player';
      currentObjMemory = player.memory;
      localMemory = player.memory;
      var tmp = pathMemory.split('.');
      tmp[0] = '';
      pathMemory = tmp.join('.').substring(1);
    } else if (pathMemory.toLowerCase().substring(0,3) == 'id:') {
      var tmp = pathMemory.split('.');
      var id = tmp[0].substring(3);
      memoryManagement.isValid = false;
      if (id == 'player') {
        memoryManagement.memoryObject = player.memory;
        memoryManagement.id = id;
        memoryManagement.isValid = true;
      } else {
        for (var i in world.ObjectMob) {
          if (world.ObjectMob.hasOwnProperty(i)) {
            if (world.ObjectMob[i].id == id) {
              memoryManagement.memoryObject = world.ObjectMob[i].memory;
              memoryManagement.id = id;
              memoryManagement.isValid = true;
              break;
            }
          }
        }
      }
      if (memoryManagement.isValid) {
        tmp[0] = '';
        pathMemory = tmp.join('.').substring(1);
        currentObjMemory = memoryManagement.memoryObject;
        if (typeof player.memory[memoryManagement.id] != 'undefined') {
          localMemory = player.memory[this.id];
        } else {
          localMemory = memoryManagement.memoryObject;
        }
      }
    }

    //RANDOM ===>
    if (pathMemory.toLowerCase().substring(0,6) == 'random') {
      if (pathMemory.replace(/\:/g,'') == pathMemory) {
        return Math.random();
      } else {
        try {
          var minmax = pathMemory.substring(7).split(';');
          var min = parseInt(minmax[0]);
          var max = parseInt(minmax[1]);
          return getRandomIntInclusive(min,max);
        } catch (e) {
          return Math.random();
        }
      }
    }

    if (pathMemory.replace(/\./g,'') == pathMemory) {
      if (typeof localMemory[pathMemory] != 'undefined') {
        return localMemory[pathMemory];
      } else {
        if (typeof currentObjMemory[pathMemory] != 'undefined') {
          return currentObjMemory[pathMemory];
        } else {
          return '...';
        }
      }
    } else {
      pathMemory = pathMemory.split('.');
      for (var i = 0; i < pathMemory.length; i++) {
        if ((i == 0 && pathMemory[i] == 'global') || (i == 0 && memoryManagement.id == 'player' && pathMemory[i] == 'data')) {
          if (pathMemory[i] == 'global') {
            globalPriority = true;
          } else if (pathMemory[i] == 'data') {
            currentObjMemory = player;
            localMemory = player;
          }
        } else {
          var valueLocal = false;
          var valueGlobal = false;

          //LOCAL MEMORY ===>
          if (typeof localMemory[pathMemory[i]] != 'undefined') {
            if (i>=pathMemory.length-1) {
              valueLocal = localMemory[pathMemory[i]];
            } else {
              localMemory = localMemory[pathMemory[i]];
            }
          }

          //GLOBAL MEMORY ===>
          if (typeof currentObjMemory[pathMemory[i]] != 'undefined') {
            if (i>=pathMemory.length-1) {
              valueGlobal = currentObjMemory[pathMemory[i]];
            } else {
              currentObjMemory = currentObjMemory[pathMemory[i]];
            }
          }

          if (globalPriority) {
            if (valueGlobal) {
              return valueGlobal;
            } else if (valueLocal) {
              return valueLocal;
            }
          } else {
            if (valueLocal) {
              return valueLocal;
            } else if (valueGlobal) {
              return valueGlobal;
            }
          }

        }
      }
    }
    return '...';
  }
};


if (!checkCookie('JAAJeditorUsername')) {
  document.location = 'needConnection';
}
function Resource() {
  this.listTilesets = [];
  this.dataSpriteSheet = [];
  this.currentTilesetIMAGE = {};
  this.currentTilesetURI = '';
  this.currentTilesetOK = false;
  this.currentTilesetNAME = '';
  this.currentTilesetFNAME = '';

  this.currentSpriteSheetIMAGE = {};
  this.currentSpriteSheetURI = '';
  this.currentSpriteSheetOK = false;
  this.currentSpriteSheetNAME = '';
  this.currentSpriteSheetCANVAS = '';
  this.currentSpriteSheetSELECTED = false;

  this.data = {};
  this.dataTileset = {};

  this.tmpDecalLoad = 0;

  //les curseurs c'est just un kiff
  this.ArrayCursors = ColorName;
  this.ArrayCursorsHexa = ColorData;
  this.Cursors = {
    blue: {
      ready: false,
      image: new Image()
    },
    red: {
      ready: false,
      image: new Image()
    },
    green: {
      ready: false,
      image: new Image()
    },
    orange: {
      ready: false,
      image: new Image()
    },
    yellow: {
      ready: false,
      image: new Image()
    },
    purple: {
      ready: false,
      image: new Image()
    },
    white: {
      ready: false,
      image: new Image()
    },
    cyan: {
      ready: false,
      image: new Image()
    }
  };
  for (var color in this.Cursors) {
    if (this.Cursors.hasOwnProperty(color)) {
      this.Cursors[color].image.src = 'assets/editor/cursor/'+color+'.png';
      (function(color,obj){
        obj[color].image.onload = function() {
          obj[color].ready = true;
        };
      })(color,this.Cursors);
    }
  }

  window['resource'] = this;
};
Resource.prototype = {
  getJaajs: function(callback) {
    var _callback = callback || function(){};
    var _this = this;
    $.ajax({
      type: "POST",
      url: '/jaajCommand',
      data: 'getJaajs',
      processData: false,
      contentType: false,
      success: function(data) {
        if (!data) {
          new toolTip('<span style="color: #f00;">Error</span> Jaajs Recovery!',4000);
          return false;
        }
        _this.listJaajs = data.files;
        new toolTip('Jaajs Recovery <span style="color: #0f0;">Successfully</span>!',4000);
        _callback(_this.listJaajs);
      },
      error: function(data) {
        new toolTip('<span style="color: #f00;">Error</span> Jaajs Recovery!',4000);
      },
      dataType: 'json'
    });
  },
  setSpriteSheet: function(filename,data) {
    var _this = this;
    data = data || {};
    this.currentSpriteSheetNAME = filename;
    this.currentSpriteSheetURI = 'assets/mob/'+filename;
    this.currentSpriteSheetIMAGE = new Image();
    this.currentSpriteSheetIMAGE.onload = function() {
      _this.currentSpriteSheetOK = true;
      if (data.select) {
        _this.currentSpriteSheetSELECTED = true;
        _this.currentSpriteSheetGW = data.gw;
        _this.currentSpriteSheetGH = data.gh;
        _this.currentSpriteSheetTNAME = data.name;
      }
    };
    this.currentSpriteSheetIMAGE.src = this.currentSpriteSheetURI;
  },
  getSpriteSheets: function(callback) {
    var _callback = callback || function(){};
    var _this = this;
    $.ajax({
      type: "POST",
      url: '/jaajCommand',
      data: 'getSpriteSheets',
      processData: false,
      contentType: false,
      success: function(data) {
        if (!data) {
          new toolTip('<span style="color: #f00;">Error</span> SpriteSheets Recovery!',4000);
          return false;
        }
        _this.listSpriteSheets = data.files;
        new toolTip('SpriteSheets Recovery <span style="color: #0f0;">Successfully</span>!',4000);
        _callback(_this.listSpriteSheets);
      },
      error: function(data) {
        new toolTip('<span style="color: #f00;">Error</span> SpriteSheets Recovery!',4000);
      },
      dataType: 'json'
    });
  },
  setAnimationSpriteSheet: function(filename,data) {
    var _this = this;
    data = data || {};
    this.currentSpriteSheetNAME = filename;
    this.currentSpriteSheetURI = 'assets/animation/'+filename;
    this.currentSpriteSheetIMAGE = new Image();
    this.currentSpriteSheetIMAGE.onload = function() {
      _this.currentSpriteSheetOK = true;
      if (data.select) {
        _this.currentSpriteSheetSELECTED = true;
        _this.currentSpriteSheetGW = data.gw;
        _this.currentSpriteSheetGH = data.gh;
        _this.currentSpriteSheetTNAME = data.name;
      }
    };
    this.currentSpriteSheetIMAGE.src = this.currentSpriteSheetURI;
  },
  getAnimationSpriteSheets: function(callback) {
    var _callback = callback || function(){};
    var _this = this;
    $.ajax({
      type: "POST",
      url: '/jaajCommand',
      data: 'getAnimationSpriteSheets',
      processData: false,
      contentType: false,
      success: function(data) {
        if (!data) {
          new toolTip('<span style="color: #f00;">Error</span> Animation SpriteSheets Recovery!',4000);
          return false;
        }
        _this.listSpriteSheets = data.files;
        new toolTip('Animation SpriteSheets Recovery <span style="color: #0f0;">Successfully</span>!',4000);
        _callback(_this.listSpriteSheets);
      },
      error: function(data) {
        new toolTip('<span style="color: #f00;">Error</span> Animation SpriteSheets Recovery!',4000);
      },
      dataType: 'json'
    });
  },
  getItemImage: function(callback) {
    var _callback = callback || function(){};
    var _this = this;
    $.ajax({
      type: "POST",
      url: '/jaajCommand',
      data: 'getItemImage',
      processData: false,
      contentType: false,
      success: function(data) {
        if (!data) {
          new toolTip('<span style="color: #f00;">Error</span> Items Image Recovery!',4000);
          return false;
        }
        _this.listSpriteSheets = data.files;
        new toolTip('Items Image Recovery <span style="color: #0f0;">Successfully</span>!',4000);
        _callback(_this.listSpriteSheets);
      },
      error: function(data) {
        new toolTip('<span style="color: #f00;">Error</span> Items Image Recovery!',4000);
      },
      dataType: 'json'
    });
  },


  getTilesets: function(callback) {
    var _this = this;
    $.ajax({
      type: "POST",
      url: '/jaajCommand',
      data: 'getTilesets',
      processData: false,
      contentType: false,
      success: function(data) {
        _this.listTilesets = data.files;
        _this.currentTileset = _this.listTilesets[0];
        editor.gettmp({
          data: JSON.stringify(data.jsonFiles),
          onend: function(data) {
            if (!data) {
              new toolTip('<span style="color: #f00;">Error</span> Tilesets Recovery!',4000);
              return false;
            }
            for (var i in data) {
              if (data.hasOwnProperty(i)) {
                _this.dataTileset['TILESET_'+i.substring('FIXED_'.length,i.length-('_Tileset.json'.length))] = data[i];
              }
            }
            new toolTip('Tilesets Recovery <span style="color: #0f0;">Successfully</span>!',4000);
            if (callback) {callback(_this.listTilesets);}
          }
        });

      },
      error: function(data) {
        new toolTip('<span style="color: #f00;">Error</span> Tilesets Recovery!',4000);
      },
      dataType: 'json'
    });
  },
  getAreaLayer: function(area,type) {

      if (typeof this.data[area] != 'undefined') {
        return typeof this.data[area][type] != 'undefined' ? this.data[area][type] : {ready:false,exist:false};
      } else {
        this.data[area] = {};
        return {ready:false,exist:false};
      }

  },
  setAreaLayer: function(area,type,dataURI,pos) {
    (function(_this,area,type,dataURI,pos){
      if (typeof _this.data[area] == 'undefined') {
      _this.data[area] = {};
      }
      if (type == 'NORMAL' || type == 'ZNORMAL') {
        _this.data[area][type] = {
          ready: false,
          exist: true,
          empty: false,
          image: new Image,
          posX: pos.x,
          posY: pos.y
        };
        _this.data[area][type].image.src = dataURI;
        _this.data[area][type].image.onload = function() {
          resource.data[area][type].ready = true;
        };
      } else {
        _this.data[area][type] = {
          data: dataURI,
          posX: pos.x,
          posY: pos.y
        };
      }
      _this.tidy(area);
      return true;
    })(this,area,type,dataURI,pos);
  },
  setAreaLayerEMPTY: function(area,type,pos) {


      if (typeof this.data[area] == 'undefined') {
        this.data[area] = {};
      }
      if (typeof this.data[area][type] == 'undefined') {
        this.data[area][type] = {
          ready: true,
          exist: true,
          empty: true,
          image: new Image,
          posX: pos.x,
          posY: pos.y
        };
      }
      return true;

  },
  draw: function() {
    var viewWidth = canvas.width/world.zoom,
        viewHeight = canvas.height/world.zoom;

    var nbAreaWidth = Math.ceil(viewWidth/1000)+1,
        nbAreaHeight = Math.ceil(viewHeight/1000)+1;

    var nbArea = nbAreaWidth*nbAreaHeight;

    var currentPos = world.getRelativeXY();

    this.tmpDecalLoad = this.tmpDecalLoad%1000==0?0:this.tmpDecalLoad;
    for (var x = Math.floor(-nbAreaWidth/2)-5; x < Math.ceil(nbAreaWidth/2)+5; x++) {
      for (var y = Math.floor(-nbAreaHeight/2)-5; y < Math.ceil(nbAreaHeight/2)+5; y++) {
        var realX = x+currentPos.x,
            realY = y+currentPos.y;
        realX = realX==0?0:realX,
        realY = realY==0?0:realY;
        var area = '['+realX+','+realY+']'+world.currentMap;
        if (typeof this.data[area] != 'undefined') {
          if (typeof this.data[area].inLoad != 'undefined' && typeof this.data[area].noData == 'undefined') {
            if (this.data[area].inLoad) {
              this.drawLoadLayer(realX,realY);
            }
          }
          this.drawLayer(area,'NORMAL');
        }
      }
    }
    this.tmpDecalLoad++;
    var allEntity = [];
    for (var name in socket.listSocketData) {
      if (socket.listSocketData.hasOwnProperty(name)) {
        var data = socket.listSocketData[name];
        if (typeof data.data != 'undefined') {
          if (typeof data.data.player != 'undefined') {
            if (player.OK) {
              allEntity.push(data.data.player);
            }
          } else {
            if (typeof world.ObjectCollision[name] != 'undefined') {
              world.ObjectCollision[name] = null;
              delete world.ObjectCollision[name];
            }
          }
        }
      }
    }
    if (player.active_) {
      allEntity.push({currentPlayer:player,position:player.position});
    }

    for (var u in world.ObjectMob) {
      if (world.ObjectMob.hasOwnProperty(u)) {
        if (world.ObjectMob[u].ready) {
          allEntity.push(world.ObjectMob[u]);
        }
      }
    }

    allEntity.sort(function(a,b){
      return a.position.y-b.position.y;
    });
    for (var i = 0; i < allEntity.length; i++) {
      var currentEntity = allEntity[i];
      if (typeof currentEntity.currentPlayer != 'undefined') {
        currentEntity.currentPlayer.draw();
      } else if (typeof currentEntity.mob != 'undefined') {
        currentEntity.draw();
      } else {
        if (typeof world.ObjectCollision[name] == 'undefined') {
          world.ObjectCollision[name] = new Polygon({points:currentEntity.boxCollision.points,type:'COLLISION',isMove: false},true);
        } else {
          world.ObjectCollision[name].points = currentEntity.boxCollision.points;
          world.ObjectCollision[name].isMove = (currentEntity.velocity.x==0 && currentEntity.velocity.y==0 && currentEntity.velocity.z==0) ? false : true;
        }
        ctx.beginPath();
        var originX = world.x+world.mx;
        var originY = world.y+world.my;
        originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
        originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(world.zoom, world.zoom);
        ctx.translate(originX, originY);
        ctx.translate(currentEntity.position.x,currentEntity.position.y);
        var s = player.getXYspriteSheet(currentEntity.animation.current);
        ctx.drawImage(player.skin, s.x, s.y, currentEntity.spriteSheet.dx, currentEntity.spriteSheet.dy, 0, 0, currentEntity.spriteSheet.dx, currentEntity.spriteSheet.dy);
        ctx.font = (50/world.zoom)+'px sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(31,31,31,0.5)';
        ctx.fillText(data.name.substring(0,data.name.lastIndexOf('#')),currentEntity.spriteSheet.dx/2,-20/world.zoom);
        ctx.setTransform(1,0,0,1,0,0);
      }
    }/*
    for (var name in socket.listSocketData) {
      if (socket.listSocketData.hasOwnProperty(name)) {
        var data = socket.listSocketData[name];
        if (typeof data.data != 'undefined') {
          if (typeof data.data.player != 'undefined') {
            if (player.OK) {
              if (typeof world.ObjectCollision[name] == 'undefined') {
                world.ObjectCollision[name] = new Polygon({points:data.data.player.boxCollision.points,type:'COLLISION',isMove: false},true);
              } else {
                world.ObjectCollision[name].points = data.data.player.boxCollision.points;
                world.ObjectCollision[name].isMove = (data.data.player.velocity.x==0 && data.data.player.velocity.y==0 && data.data.player.velocity.z==0) ? false : true;
              }
              ctx.beginPath();
              var originX = world.x+world.mx;
              var originY = world.y+world.my;
              originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
              originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
              ctx.translate(canvas.width/2, canvas.height/2);
              ctx.scale(world.zoom, world.zoom);
              ctx.translate(originX, originY);
              ctx.translate(data.data.player.position.x,data.data.player.position.y);
              var s = player.getXYspriteSheet(data.data.player.animation.current);
              ctx.drawImage(player.skin, s.x, s.y, data.data.player.spriteSheet.dx, data.data.player.spriteSheet.dy, 0, 0, data.data.player.spriteSheet.dx, data.data.player.spriteSheet.dy);
              ctx.font = (50/world.zoom)+'px sans-serif';
              ctx.textAlign = "center";
              ctx.textBaseline = 'middle';
              ctx.fillStyle = 'rgba(31,31,31,0.5)';
              ctx.fillText(data.name.substring(0,data.name.lastIndexOf('#')),data.data.player.spriteSheet.dx/2,-20/world.zoom);
              ctx.setTransform(1,0,0,1,0,0);
            }
          } else {
            if (typeof world.ObjectCollision[name] != 'undefined') {
              world.ObjectCollision[name] = null;
              delete world.ObjectCollision[name];
            }
          }
        }
      }
    }*/
    for (var x = Math.floor(-nbAreaWidth/2)-5; x < Math.ceil(nbAreaWidth/2)+5; x++) {
      for (var y = Math.floor(-nbAreaHeight/2)-5; y < Math.ceil(nbAreaHeight/2)+5; y++) {
        var realX = x+currentPos.x,
            realY = y+currentPos.y;
        realX = realX==0?0:realX,
        realY = realY==0?0:realY;
        var area = '['+realX+','+realY+']'+world.currentMap;
        if (typeof this.data[area] != 'undefined') {
          this.drawLayer(area,'ZNORMAL');
        }
      }
    }
  },
  drawLayer: function(area,i) {
    if (this.data[area].hasOwnProperty(i)) {
      var k = this.data[area][i];
      var tmpcanvas, tmpctx, dataURI;
      if (k.ready && (!document.getElementById('TMP_CANVAS_AREA_'+area+'_'+i) || ui.selectMode != 'Rubber')) {
        ctx.beginPath();
        var originX = world.x+world.mx;
        var originY = world.y+world.my;
        originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
        originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(world.zoom, world.zoom);
        ctx.translate(originX, originY);
        ctx.translate(k.posX,k.posY);
        ctx.drawImage(k.image, 0, 0, k.image.width, k.image.height);
        ctx.setTransform(1,0,0,1,0,0);
      }
      if (document.getElementById('TMP_CANVAS_AREA_'+area+'_'+i)) {
        tmpcanvas = document.getElementById('TMP_CANVAS_AREA_'+area+'_'+i);
        ctx.beginPath();
        var originX = world.x+world.mx;
        var originY = world.y+world.my;
        originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
        originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(world.zoom, world.zoom);
        ctx.translate(originX, originY);
        ctx.translate(k.posX,k.posY);
        ctx.drawImage(tmpcanvas, 0, 0);
        ctx.setTransform(1,0,0,1,0,0);
      }
    }
  },
  drawLoadLayer: function(x,y) {
    ctx.beginPath();
    var originX = world.x+world.mx;
    var originY = world.y+world.my;
    originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
    originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(world.zoom, world.zoom);
    ctx.translate(originX, originY);
    ctx.lineWidth = 5;
    ctx.hatchRect(x*1000,y*1000, 1000, 1000, 50, this.tmpDecalLoad, 'red');
    ctx.lineWidth = 1;
    ctx.font = '100px sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f00';
    ctx.strokeStyle = '#000';
    ctx.fillText('LOADING..',x*1000+500,y*1000+500);
    ctx.strokeText('LOADING..',x*1000+500,y*1000+500);
    ctx.setTransform(1,0,0,1,0,0);
  },
  pointMapDraw: function(point) {
    ctx.beginPath();
    var originX = world.x+world.mx;
    var originY = world.y+world.my;
    originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
    originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(world.zoom, world.zoom);
    ctx.translate(originX, originY);
    ctx.translate(point.x+500, point.y+500);
    var xy = mouse.getAbsoluteXY();
    var c1 = '#AE00FF';
    var c2 = '#630092';
    var c3 = 'rgba(174, 0, 255, 0.2)';
    if (typeof point.select != 'undefined') {
      var axy = mouse.getRelativeXY();
      var area = '['+axy.x+','+axy.y+']'+world.currentMap;
      if (area == world.tmp3.area) {
        point.x = xy.x;
        point.y = xy.y;
      }
      if (!mouse.isLeftDown) {
        point.select = null;
        point.delete = true;
        delete point.select;
        if (area == world.tmp3.area) {
          world.tmp2 = Object.assign({},point);
          for (var i in resource.data[area]['MAP']) {
            if (resource.data[area]['MAP'].hasOwnProperty(i)) {
              if (resource.data[area]['MAP'][i].name == point.name) {
                resource.data[area]['MAP'][i].x = point.x;
                resource.data[area]['MAP'][i].y = point.y;
                world.tmp2 = {};
                world.tmp3 = {};
                break;
              }
            }
          }
        }
      }
    }
    if (pointInCircle(xy.x, xy.y, point.x, point.y, 10/world.zoom) && point.name != '') {
      c1 = '#53007A';
      c2 = '#000';
      c3 = 'rgba(174, 0, 255, 0.7)';
      if (mouse.isLeftDown && world.editorHover) {
        if (ui.selectMode == 'AddMap') {
          if (typeof world.tmp2.select == 'undefined') {
            point.select = true;
            world.tmp2 = Object.assign({},point);
            var axy = mouse.getRelativeXY();
            var area = '['+axy.x+','+axy.y+']'+world.currentMap;
            world.tmp3.area = area;
          }
        } else {
          mouse.isLeftDown = false;
          world.goToMap(typeof point.back != 'undefined',point.name);
        }
      }
    }
    ctx.arc(0,0,10/world.zoom,0,2*Math.PI,false);
    ctx.fillStyle = c1;
    ctx.strokeStyle = c2;
    ctx.fill();
    ctx.stroke();
    ctx.font = '15px Arial';
    ctx.lineWidth = 0.5;
    ctx.rect(-ctx.measureText(point.name).width/2/world.zoom,-50/world.zoom,ctx.measureText(point.name).width/world.zoom,20/world.zoom);
    ctx.fillStyle = c3;
    ctx.strokeStyle = c1;
    ctx.fill();
    ctx.stroke();
    ctx.font = (15/world.zoom)+'px Arial';
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText(point.name,0,-40/world.zoom);
    ctx.setTransform(1,0,0,1,0,0);
  },
  tidy: function(area) {
    if (typeof this.data[area] != 'undefined') {
      var currentArea = Object.assign({}, this.data[area]);
      var keysSorted = Object.keys(currentArea).sort(function(a,b){
        var atype = (a.split('_'))[1],
            anb = (a.split('_'))[2],
            av = 0,
            btype = (b.split('_'))[1],
            bnb = (b.split('_'))[2],
            bv = 0;

        av = (atype == 'NORMAL' ? 5 : atype == 'ZNORMAL' ? 4 : atype == 'COLLISION' ? 3 : atype == 'ENTITY' ? 2 : atype == 'EVENT' ? 1 : 0);
        bv = (btype == 'NORMAL' ? 5 : btype == 'ZNORMAL' ? 4 : btype == 'COLLISION' ? 3 : btype == 'ENTITY' ? 2 : btype == 'EVENT' ? 1 : 0);

        if (av!=bv) {
          return bv - av;
        } else {
          return anb - bnb;
        }
      });
      var tmpobj = {};
      for (var i = 0; i < keysSorted.length; i++) {
        tmpobj[keysSorted[i]] = Object.assign({}, this.data[area][keysSorted[i]]);
      }
      this.data[area] = Object.assign({}, tmpobj);
    }
  },
  reIndex: function(area) {
    if (typeof this.data[area] != 'undefined') {
      var currentArea = Object.assign({}, this.data[area]);
      var tmpObj = {};
      var lengthNormalLayer = 0;
      var lengthZNormalLayer = 0;
      var lengthCollisionLayer = 0;
      var lengthEntityLayer = 0;
      var lengthEventLayer = 0;
      for (var i in currentArea) {
        if (currentArea.hasOwnProperty(i)) {
          if (i.substring(0,'LAYER'.length)=='LAYER') {
            var n = i.split('_');
            var type = n[1];
            var nb = n[2];
            var nbs = n[2];
            if (type=='NORMAL') {
              lengthNormalLayer++;
              nb = lengthNormalLayer;
            } else if (type=='ZNORMAL') {
              lengthZNormalLayer++;
              nb = lengthZNormalLayer;
            } else if (type=='COLLISION') {
              lengthCollisionLayer++;
              nb = lengthCollisionLayer;
            } else if (type=='ENTITY') {
              lengthEntityLayer++;
              nb = lengthEntityLayer;
            } else if (type=='EVENT') {
              lengthEventLayer++;
              nb = lengthEventLayer;
            }
            tmpObj['LAYER_'+type+'_'+nb] = Object.assign({}, this.data[area]['LAYER_'+type+'_'+nbs]);
          }
        }
      }
      this.data[area] = Object.assign({}, tmpObj);
    }
  }
};


function Mouse() {
  this.x = 0;
  this.y = 0;
  this.ax = 0;
  this.ay = 0;
  this.tx = 0;
  this.ty = 0;
  this.isMove = false;
  this.isLeftDown = false;
  this.isRightDown = false;
  window['mouse'] = this;
};
Mouse.prototype.getRelativeXY = function () {
  var get = {
    x: Math.round(((this.x-canvas.width/2)/world.zoom-world.x-world.mx-1000/2)/1000),
    y: Math.round(((this.y-canvas.height/2)/world.zoom-world.y-world.my-1000/2)/1000)
  };
  return {
    x: Math.abs(get.x)==0?0:get.x,
    y: Math.abs(get.y)==0?0:get.y,
    isLeftDown: this.isLeftDown,
    isRightDown: this.isRightDown,
    isMove: this.isMove
  };
};
Mouse.prototype.getAbsoluteXY = function () {
  var get = {
    x: Math.round(((this.x-canvas.width/2)/world.zoom-world.x-world.mx-1000/2)),
    y: Math.round(((this.y-canvas.height/2)/world.zoom-world.y-world.my-1000/2))
  };
  return {
    x: Math.abs(get.x)==0?0:get.x,
    y: Math.abs(get.y)==0?0:get.y,
    isLeftDown: this.isLeftDown,
    isRightDown: this.isRightDown,
    isMove: this.isMove
  };
};
Mouse.prototype.getPosFromScreen = function() {
  var radian = Math.atan2(this.x-canvas.width/2, this.y-canvas.height/2);
  var angle = Math.degrees(radian);
  angle = angle < 0 ? 360-angle*-1 : angle;

  if (angle > 45 && angle < 135) {
    return 'right';
  }
  if (angle > 135 && angle < 225) {
    return 'up';
  }
  if (angle > 225 && angle < 315) {
    return 'left';
  }
  return 'down';
};


function UI(id) {
  this.id = id;
  this.div = false;
  this.currentCanvas = {};
  this.listWindow = [];
  this.listCanvas = [];
  this.custom = {};
  this.selectMode = 'Pencil';
  this.HoverCanvas = false;
  this._fncallback = {};
};
UI.prototype = {
  create: function(id) {
    this.id = id;
    if (!document.getElementById(this.id)) {
      this.div = document.createElement('div');
      this.div.id = this.id;
    } else {
      this.div = document.getElementById(this.id);
    }
    this.div.innerHTML =
      '<div style="position: fixed; top: 0; left: 0; display: inline-block;" id="UI-topLeft"></div>'+
      '<div style="position: fixed; bottom: 0; right: 0; display: inline-block;" id="UI-bottomRight"></div>'+
      '<div style="position: fixed; bottom: 0; left: 0; display: inline-block;" id="UI-bottomLeft"></div>'+
      '<div style="position: fixed; top: 0; right: 0;" id="UI-topRight"></div>'+
      '<div style="position: fixed; top: 50%; left: 0; transform: translateY(-50%);" id="UI-MiddleLeft"></div>'+
      '<div style="position: fixed; top: 50%; right: 0; transform: translateY(-50%);" id="UI-MiddleRight"></div>';
    if (!document.getElementById(this.id)) {
      document.body.appendChild(this.div);
    }
    window['ui'] = this;
  },
  selectTool: function(tool,id,force) {
    if (force) {
      ui.selectMode = tool;
      $('.btntools').removeClass('active');
      $(id).addClass('active');
    } else {
      if ($(id).hasClass('active')) {
        ui.selectMode = '';
        $('.btntools').removeClass('active');
      } else {
        ui.selectMode = tool;
        $('.btntools').removeClass('active');
        $(id).addClass('active');
      }
    }
  },
  window: {
    open: function(settings) {
      var x = typeof settings.x != 'undefined' ? settings.x : 10;
      var y = typeof settings.y != 'undefined' ? settings.y : 10;
      var w = typeof settings.w != 'undefined' ? settings.w : 400;
      var h = typeof settings.h != 'undefined' ? settings.h : 200;

      for (var i in ui.listWindow) {
        if (ui.listWindow.hasOwnProperty(i)) {
          if (ui.listWindow[i].x == x) {x += 30;}
          if (ui.listWindow[i].y == y) {y += 30;}
        }
      }

      var id,idb;
      if (typeof settings.id != 'undefined') {
        id = 'WINDOW_'+settings.id;
        idb = settings.id;
      } else {
        idb = Math.random().toString(36).substring(7);
        id = 'WINDOW_'+idb;
      }

      var closeb = typeof settings.closeb != 'undefined' ? settings.closeb : false;
      var closeText = 'ui.window.close(\''+idb+'\');';
      if (closeb) {
        closeText = '$(this).parent().parent().css(\'display\',\'none\');';
      }

      if (!document.getElementById(id)) {
        var div = document.createElement('div');
        div.innerHTML = '<div id="'+id+'_Caption" class="ui-window-caption"><div class="ui-window-caption-title">'+(settings.title ? settings.title : 'Undefined_Window')+'</div><div class="ui-window-caption-close" onclick="'+closeText+'"><i class="fa fa-times" aria-hidden="true"></i></div></div><div id="'+id+'_Body" class="ui-window-body" style="height: calc(100% - 40px);'+(settings.bodyStyle || '')+'"></div>';
        ui.listWindow.push({x:x,y:y,id:idb,zIndex:99999999,zIndexD:99999999});
        if (settings.openb) {div.style.display = 'none';}
        div.id = id;
        div.onmousedown = function() {
          world.drag = false;
          for (var i in ui.listWindow) {
            if (ui.listWindow.hasOwnProperty(i)) {
              if (ui.listWindow[i].id == this.id.replace(/^WINDOW_/,'')) {
                ui.listWindow[i].zIndex = ui.listWindow[i].zIndexD;
                $('#WINDOW_'+ui.listWindow[i].id).css({zIndex:ui.listWindow[i].zIndex});
              } else {
                ui.listWindow[i].zIndex--;
                $('#WINDOW_'+ui.listWindow[i].id).css({zIndex:ui.listWindow[i].zIndex});
              }
            }
          }
        };
        div.onmouseup = function() {
          world.drag = true;
        };
        div.onmouseenter = function() {
          world.editorHover = false;
        };
        div.onmouseleave = function() {
          world.editorHover = true;
        };


        ui.div.appendChild(div);
        for (var i in ui.listWindow) {
          if (ui.listWindow.hasOwnProperty(i)) {
            if (ui.listWindow[i].id == id.replace(/^WINDOW_/,'')) {
              ui.listWindow[i].zIndex = ui.listWindow[i].zIndexD;
              $('#WINDOW_'+ui.listWindow[i].id).css({zIndex:ui.listWindow[i].zIndex});
            } else {
              ui.listWindow[i].zIndex--;
              $('#WINDOW_'+ui.listWindow[i].id).css({zIndex:ui.listWindow[i].zIndex});
            }
          }
        }
        var captiondiv = document.getElementById(id+'_Caption');
        captiondiv.onmousedown = function() {
          world.windowDragId = idb;
          world.mwindowoffx = mouse.x-parseInt($('#WINDOW_'+world.windowDragId)[0].offsetLeft);
          world.mwindowoffy = mouse.y-parseInt($('#WINDOW_'+world.windowDragId)[0].offsetTop);
        };
        captiondiv.onmouseup = function() {
          world.windowDragId = false;
        };
        $('#'+id).addClass('window');
        $('#'+id).css({
          top: y+'px',
          left: x+'px',
          width: w+'px',
          height: h+'px',
          border: '1px solid '+settings.shadowColor
        });
        if (settings.onopen) {settings.onopen(id+'_Body');}
      } else {
        document.getElementById(id).style.display = 'block';
      }
      return div;
    },
    close: function(id) {
      if (document.getElementById('WINDOW_'+id)) {
        $('#WINDOW_'+id).remove();
        for (var i in ui.listWindow) {
          if (ui.listWindow.hasOwnProperty(i)) {
            if (ui.listWindow[i].id == id) {
              delete ui.listWindow[i];
            }
          }
        }
      }
    }
  },
  add: {
    button: function(style, opt) {
      function e(style, opt) {
        this.style = style;
        this.opt = opt;
        if (!document.getElementById(this.opt.id)) {
          this.div = document.createElement('button');
          this.div.id = this.opt.id;
          this.div.innerHTML = typeof this.opt.icon != 'undefined' ? '<i class="'+this.opt.icon+'" aria-hidden="true"></i>&nbsp;'+this.opt.text : this.opt.text;
          if (typeof this.opt.position != 'undefined') {
            var p = document.getElementById('UI-'+this.opt.position);
            if (this.opt.in) {
              if (document.getElementById(this.opt.in)) {
                document.getElementById(this.opt.in).appendChild(this.div);
              } else {
                var tmp = document.createElement('div');
                tmp.id = this.opt.in;
                tmp.style.display = 'inline-block';
                p.appendChild(tmp);
                tmp.appendChild(this.div);
              }
            } else {
              p.appendChild(this.div);
            }
          } else {
            if (this.opt.in) {
              if (document.getElementById(this.opt.in)) {
                document.getElementById(this.opt.in).appendChild(this.div);
              } else {
                var tmp = document.createElement('div');
                tmp.id = this.opt.in;
                tmp.style.display = 'inline-block';
                ui.div.appendChild(tmp);
                tmp.appendChild(this.div);
              }
            } else {
              ui.div.appendChild(this.div);
            }
          }
          $(this.div).addClass('btnHover '+(typeof this.opt.class != 'undefined' ? this.opt.class.join(' ') : ''));
          $(this.div).css(this.style);
          $(this.div).click(this.opt.onClick);
          this.div.onmouseenter = this.opt.onMouseEnter || function(){};
          this.div.onmouseleave = this.opt.onMouseLeave || function(){};
        }
        this.modify = {
          current: this,
          style: function(s) {
            $(this.current.div).css(s);
          },
          opt: function(o) {

          },
        }
      };
      return new e(style,opt);
    },
    input: function(style, opt) {
      function e(style, opt) {
        this.style = style;
        this.opt = opt;
        if (!document.getElementById(this.opt.id)) {
          this.div = document.createElement('div');
          this.div.onmouseenter = this.opt.onMouseEnter || function(){};
          this.div.onmouseleave = this.opt.onMouseLeave || function(){};
          if (this.opt.text) {
            this.text = document.createElement('span');
            this.text.innerHTML = this.opt.text;
            this.div.appendChild(this.text);
          }
          this.input = document.createElement('input');
          this.input.value = typeof this.opt.value != 'undefined' ? this.opt.value : '';
          this.input.onmouseenter = this.opt.onMouseEnter || function(){};
          this.input.onmouseleave = this.opt.onMouseLeave || function(){};
          this.input.onfocus = this.opt.onFocus || function(){};
          this.input.onkeyup = this.opt.onKeyUp || function(){};
          this.input.id = this.opt.id;
          this.div.appendChild(this.input);
          if (typeof this.opt.position != 'undefined') {
            var p = document.getElementById('UI-'+this.opt.position);
            if (this.opt.in) {
              if (document.getElementById(this.opt.in)) {
                document.getElementById(this.opt.in).appendChild(this.div);
              } else {
                var tmp = document.createElement('div');
                tmp.id = this.opt.in;
                tmp.style.display = 'inline-block';
                p.appendChild(tmp);
                tmp.appendChild(this.div);
              }
            } else {
              p.appendChild(this.div);
            }
          } else {
            if (this.opt.in) {
              if (document.getElementById(this.opt.in)) {
                document.getElementById(this.opt.in).appendChild(this.div);
              } else {
                var tmp = document.createElement('div');
                tmp.id = this.opt.in;
                tmp.style.display = 'inline-block';
                ui.div.appendChild(tmp);
                tmp.appendChild(this.div);
              }
            } else {
              ui.div.appendChild(this.div);
            }
          }
          $(this.div).css({display: 'inline-block'});
          if (this.style.div) {
            $(this.div).css(this.style.div);
          }
          $(this.text).addClass('UI-input-span');
          $(this.input).addClass((typeof this.opt.class != 'undefined' ? this.opt.class.join(' ') : ''));
          $(this.input).click(this.opt.onClick);
          if (this.style.input) {
            $(this.input).css(this.style.input);
          }
          if (this.style.text) {
            $(this.text).css(this.style.text);
          }
        }
        this.modify = {
          current: this,
          style: function(s) {
            $(this.current.div).css(s);
          },
          opt: function(o) {

          },
        }
      };
      return new e(style,opt);
    },
    select: function(style, opt) {
      function e(style, opt) {
        this.style = style;
        this.opt = opt;
        if (!document.getElementById(this.opt.id)) {
          this.div = document.createElement('select');
          this.div.id = this.opt.id;
          this.div.onchange = this.opt.onchange || function() {};
          this.choicesHTML = '';
          for (var i = 0; i < this.opt.choices.length; i++) {
            var v = this.opt.choices[i];
            if (this.opt.choices[i].length > 30) {
              v = this.opt.choices[i].substring(0,27)+'...';
            }
            this.choicesHTML += '<option value="'+this.opt.choices[i]+'">'+v+'</option>';
          }
          this.div.innerHTML = this.choicesHTML;
          if (typeof this.opt.position != 'undefined') {
            var p = document.getElementById('UI-'+this.opt.position);
            if (this.opt.in) {
              if (document.getElementById(this.opt.in)) {
                document.getElementById(this.opt.in).appendChild(this.div);
              } else {
                var tmp = document.createElement('div');
                tmp.id = this.opt.in;
                tmp.style.display = 'inline-block';
                p.appendChild(tmp);
                tmp.appendChild(this.div);
              }
            } else {
              p.appendChild(this.div);
            }
          } else {
            if (this.opt.in) {
              if (document.getElementById(this.opt.in)) {
                document.getElementById(this.opt.in).appendChild(this.div);
              } else {
                var tmp = document.createElement('div');
                tmp.id = this.opt.in;
                tmp.style.display = 'inline-block';
                ui.div.appendChild(tmp);
                tmp.appendChild(this.div);
              }
            } else {
              ui.div.appendChild(this.div);
            }
          }
          $(this.div).addClass('btnHover '+(typeof this.opt.class != 'undefined' ? this.opt.class.join(' ') : ''));
          $(this.div).css(this.style);
          $(this.div).click(this.opt.onClick);
        }
        this.modify = {
          current: this,
          style: function(s) {
            $(this.current.div).css(s);
          },
          opt: function(o) {

          },
        }
      };
      return new e(style,opt);
    },
    canvas: function(style, opt) {
      function e(style, opt, obj) {
        obj = obj || {};
        this.style = obj.style || style;
        this.opt = obj.opt || opt;
        if (!document.getElementById(this.opt.id)) {
          this.canvas = document.createElement('canvas');
          this.canvas.id = this.opt.id;
          this.in = typeof this.opt.in != 'undefined' ? this.opt.in : '';
          this.canvas.setAttribute("nb", typeof obj.nb != 'undefined' ? obj.nb : ui.listCanvas.length);
          this.canvas.onmouseenter = function(e) {
            ui.currentCanvas = ui.listCanvas[$(e.target).attr('nb')];
            ui.HoverCanvas = true;
          };
          this.canvas.onmouseleave = function(e) {
            ui.currentCanvas = {};
            ui.HoverCanvas = false;
          };
          this.limitSize = typeof this.opt.limitSize != 'undefined' ? this.opt.limitSize : true;
          this.mode = 'Move';
          this.mouseC = this.opt.mouseC || 'isRightDown';
          this.onclick = this.opt.onclick || function(){};
          if (typeof this.opt.position != 'undefined') {
            var p = document.getElementById('UI-'+this.opt.position);
            if (this.opt.in) {
              if (document.getElementById(this.opt.in)) {
                document.getElementById(this.opt.in).appendChild(this.canvas);
              } else {
                var tmp = document.createElement('div');
                tmp.id = this.opt.in;
                tmp.style.display = 'inline-block';
                p.appendChild(tmp);
                tmp.appendChild(this.canvas);
              }
            } else {
              p.appendChild(this.canvas);
            }
          } else {
            if (this.opt.in) {
              if (document.getElementById(this.opt.in)) {
                document.getElementById(this.opt.in).appendChild(this.canvas);
              } else {
                var tmp = document.createElement('div');
                tmp.id = this.opt.in;
                tmp.style.display = 'inline-block';
                ui.div.appendChild(tmp);
                tmp.appendChild(this.canvas);
              }
            } else {
              ui.div.appendChild(this.canvas);
            }
          }
          $(this.canvas).addClass((typeof this.opt.class != 'undefined' ? this.opt.class.join(' ') : ''));
          $(this.canvas).css(this.style);
          this.ctx = this.canvas.getContext('2d');
          if (this.style.width) {
            this.canvas.width = this.style.width;
          }
          if (this.style.height) {
            this.canvas.height = this.style.height;
          }
          this.w = 0;
          this.h = 0;
          this.scale = obj.scale || 1;
          this.oldScale = obj.oldScale || 1;
          this.zoom = obj.zoom || 1;
          this.viewWidth = this.canvas.width/this.zoom;
          this.viewHeight = this.canvas.height/this.zoom;
          this.relativeX = -1;
          this.relativeY = -1;
          this.relativeAX = -1;
          this.relativeAY = -1;
          this.selectZone = false;
          this.data = {};
          this.x = obj.x || 0;
          this.y = obj.y || 0;
          this.mx = obj.mx || 0;
          this.my = obj.my || 0;
          this.nb = obj.nb || ui.listCanvas.length;
          this.canvas.dataset.nb = this.nb;
          this.gw = 16;
          this.gh = 16;
        }
      };
      e.prototype.drawGrid = function (w,h,gw,gh,gc) {
        this.viewWidth = this.canvas.width/this.zoom;
        this.viewHeight = this.canvas.height/this.zoom;
        w = w - w%gw + gw;
        h = h - h%gh + gh;
        wi = w/gw;
        hi = h/gh;
        var originX = this.x+this.mx;
        var originY = this.y+this.my;
        originX -= (mouse.ax)/(this.oldScale*this.zoom) - (mouse.ax)/this.scale;
        originY -= (mouse.ay)/(this.oldScale*this.zoom) - (mouse.ay)/this.scale;
        for (var i = 0, len = wi+(wi%2==0?1:0); i < len; i++) {
          this.ctx.beginPath();
          this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
          this.ctx.scale(this.zoom, this.zoom);
          this.ctx.translate(originX, originY);
          this.ctx.translate(gw*i,0);
          this.ctx.moveTo(0,0);
          this.ctx.lineTo(0,h);
          this.ctx.strokeStyle = gc;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
          this.ctx.setTransform(1,0,0,1,0,0);
        }
        for (var i = 0, len = hi+(hi%2==0?1:0); i < len; i++) {
          this.ctx.beginPath();
          this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
          this.ctx.scale(this.zoom, this.zoom);
          this.ctx.translate(originX, originY);
          this.ctx.translate(0,gh*i);
          this.ctx.moveTo(0,0);
          this.ctx.lineTo(w,0);
          this.ctx.strokeStyle = gc;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
          this.ctx.setTransform(1,0,0,1,0,0);
        }
      };
      e.prototype.draw = opt.draw;
      e.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      };
      e.prototype.getXY = function (obj) {
        var rect = this.canvas.getBoundingClientRect();
        return {
          x: obj.x - rect.left,
          y: obj.y - rect.top
        };
      };
      var cr = true;
      var nb = 0;
      for (var i = 0; i < ui.listCanvas.length; i++) {
        if (ui.listCanvas[i].opt.id == opt.id) {
          cr = false;
          nb = i;
        }
      }

      if (cr) {
        var c = new e(style,opt);
        ui.listCanvas.push(c);
      } else {
        var c = new e(style,opt,ui.listCanvas[nb]);
        ui.listCanvas[nb] = c;
      }
      return c;
    }
  },
  show: function() {
    this.div.style.display = 'block';
  },
  hide: function() {
    this.div.style.display = 'none';
  },
  NeedValid: function(callback,speech,valid) {
    if (typeof callback === 'string') {
      $('#UI-NeedValid-'+callback).animate({opacity:0},500,function(){
        $(this).remove();
      });
      if (valid) {
        this._fncallback[callback]();
      }
    } else {
      var id = '_UI_'+Date.now().toString(32);
      this._fncallback[id] = callback;
      $('#'+this.id).append(
        '<div id="UI-NeedValid-'+id+'">'+
          '<div class="UI-NeedLock" onclick="ui.NeedValid(\''+id+'\',null,false);"></div>'+
          '<div class="UI-NeedWindow" style="width:35vw;height:220px;">'+
            '<span style="color:#f00;font-size:27px;">'+speech+'</span>'+
            '<div style="position:absolute;right:5px;bottom:5px;">'+
              '<button class="btnHover btn_delete btn" onclick="ui.NeedValid(\''+id+'\',null,true);">DELETE!</button>'+
              '<button class="btnHover btn_cancel btn" onclick="ui.NeedValid(\''+id+'\',null,false);">Cancel</button>'+
            '</div>'+
          '</div>'+
        '</div>'
      )
    }
  }
};


function toolTip(msg,time) {
  if (!document.getElementById('UI-ToolTip')) {
    var toolTipdiv = document.createElement('div');
    toolTipdiv.id = 'UI-ToolTip';
    ui.div.appendChild(toolTipdiv);
  }
  this.message = msg;
  this.id = 'toolTip_'+Math.random().toString(36).substring(7);
  this.create();
  (function(t,time){setTimeout(function(){
    t.destroy();
  },time);})(this,time);
};
toolTip.prototype = {
  create: function() {
    var toolTip = document.createElement('div');
    toolTip.id = this.id;
    toolTip.innerHTML = '<span>'+this.message+'</span>';
    toolTip.className = 'toolTip';
    document.getElementById('UI-ToolTip').appendChild(toolTip);
  },
  destroy: function() {
    if (document.getElementById(this.id)) {
      $('#'+this.id).addClass('toolTipo');
      $('#'+this.id).css({opacity:'0'});
      (function(id){setTimeout(function(){
        $('#'+id).remove();
      },550);})(this.id);
    }
  }
};


var Components = {
  Bubble: function(settings) {
    settings = settings || {};
    this.id = 'BUBBLE_'+Math.random().toString(36).substring(7);
    this.target = settings.target || '';
    this.posX = settings.posX || 'Right';
    this.posY = settings.posY || 'Middle';

    this.a = settings.a || {
      posX: 'Left',
      posY: 'Middle',
      rotate: 0,
      scale: 1,
      tx: 0,
      ty: 0
    };

    if (this.target != '' && document.getElementById(this.target)) {
      this.div = document.createElement('div');
      this.div.id = this.id;
      this.targetdiv = document.getElementById(this.target);
      this.div.className = (typeof settings.class != 'undefined' ? settings.class.join(' ') : '')+' COMPONENTS-Bubble';
      this.div.innerHTML = (settings.innerHTML || '')+'<div id="B'+this.id+'" class="Bubble-arrow"></div>';
      if (typeof settings.in != 'undefined') {
        if (document.getElementById(settings.in)) {
          document.getElementById(settings.in).appendChild(this.div);
        } else {
          ui.div.appendChild(this.div);
        }
      } else {
        ui.div.appendChild(this.div);
      }
      this.div.onmouseenter = settings.onMouseEnter || function(){};
      this.div.onmouseleave = settings.onMouseLeave || function(){};
    } else {
      return false;
    }
  },
  Slide: function(style, opt) {
    function e(style, opt) {
      this.style = style;
      this.opt = opt;
      if (!document.getElementById(this.opt.id)) {
        this.div = document.createElement('input');
        this.div.id = this.opt.id;
        this.div.type = 'range';
        this.div.value = typeof this.opt.value != 'undefined' ? this.opt.value : 0;
        this.div.min = typeof this.opt.min != 'undefined' ? this.opt.min : 0;
        this.div.max = typeof this.opt.max != 'undefined' ? this.opt.max : 100;
        this.div.step = typeof this.opt.step != 'undefined' ? this.opt.step : 1;
        this.div.name = typeof this.opt.name != 'undefined' ? this.opt.name : 'SlideName_'+Math.random().toString(36).substring(7);;
        if (typeof this.opt.position != 'undefined') {
          var p = document.getElementById('UI-'+this.opt.position);
          if (this.opt.in) {
            if (document.getElementById(this.opt.in)) {
              document.getElementById(this.opt.in).appendChild(this.div);
            } else {
              var tmp = document.createElement('div');
              tmp.id = this.opt.in;
              tmp.style.display = 'inline-block';
              p.appendChild(tmp);
              tmp.appendChild(this.div);
            }
          } else {
            p.appendChild(this.div);
          }
        } else {
          if (this.opt.in) {
            if (document.getElementById(this.opt.in)) {
              document.getElementById(this.opt.in).appendChild(this.div);
            } else {
              var tmp = document.createElement('div');
              tmp.id = this.opt.in;
              tmp.style.display = 'inline-block';
              ui.div.appendChild(tmp);
              tmp.appendChild(this.div);
            }
          } else {
            ui.div.appendChild(this.div);
          }
        }
        $(this.div).parent().append('<output for="'+this.div.name+'" onforminput="value = '+this.div.name+'.valueAsNumber;"></output>');
        $(this.div).addClass('btnHover '+(typeof this.opt.class != 'undefined' ? this.opt.class.join(' ') : ''));
        $(this.div).css(this.style);
        this.div.onmouseenter = this.opt.onMouseEnter || function(){};
        this.div.onmouseleave = this.opt.onMouseLeave || function(){};
        this.div.onchange = this.opt.onChange || function(){};
        this.div.onmousemove = this.opt.onMouseMove || function(){};
      }
      this.modify = {
        current: this,
        style: function(s) {
          $(this.current.div).css(s);
        },
        opt: function(o) {

        },
      }
    };
    return new e(style,opt);
  }
};
Components.Bubble.prototype = {
  show: function(nn) {
    var t=0,l=0,arrt=0,arrl=0;
    var arr = document.getElementById('B'+this.id);

    if (this.posX == 'Middle') {
      l = $(this.targetdiv).width()/2-$(this.div).width()/2+5;
    } else if (this.posX == 'Left') {
      l = -$(this.div).width()-30;
    } else if (this.posX == 'Right') {
      l = $(this.targetdiv).width()+30;
    }
    if (this.posY == 'Middle') {
      t = $(this.targetdiv).height()/2-$(this.div).height()/2+5;
    } else if (this.posY == 'Top') {
      t = -$(this.div).height()-30;
    } else if (this.posY == 'Bottom') {
      t = $(this.targetdiv).height()+30;
    }

    if (this.a.posX == 'Middle') {
      arrl = 'calc(50% - 3px)';
      arr.style.left = arrl;
    } else if (this.a.posX == 'Left') {
      arrl = '-10px';
      arr.style.left = arrl;
    } else if (this.a.posX == 'Right') {
      arrl = '10px';
      arr.style.right = arrl;
    }
    if (this.a.posY == 'Middle') {
      arrt = 'calc(50% - 9px)';
      arr.style.top = arrt;
    } else if (this.a.posY == 'Top') {
      arrt = '-10px';
      arr.style.top = arrt;
    } else if (this.a.posY == 'Bottom') {
      arrt = '10px';
      arr.style.bottom = arrt;
    }

    arr.style.transform = 'rotate('+this.a.rotate+'deg) scale('+this.a.scale+') translate('+this.a.ty+'px,'+this.a.tx+'px)';

    /*
    this.div.style.top = (($(this.targetdiv).offset()).top+t)+'px';
    this.div.style.left = (($(this.targetdiv).offset()).left+l)+'px';
    */
    this.div.style.top = (this.targetdiv.offsetTop+t)+'px';
    this.div.style.left = (this.targetdiv.offsetLeft+l)+'px';

    if (typeof nn == 'undefined') {
      this.div.className = this.div.className.replace(/inactive/g,'');
      this.div.className += ' active';
    }

    return this;
  },
  hide: function() {
    this.div.className = this.div.className.replace(/active/g,'');
    this.div.className += ' inactive';
    return this;
  }
};


function JSONeditor(obj,id,next) {
  /*this.object = cleanObjectFromJSON(JSON.parse('{'+
    '"name": "Jeremy Dorn",'+
    '"age": 25,'+
    '"favorite_color": "#ffa500",'+
    '"gender": "male",'+
    '"location": {'+
      '"city": "San Francisco",'+
      '"state": "CA",'+
      '"citystate": "San Francisco, CA"'+
    '},'+
    '"pets": ['+
      '{'+
        '"type": "dog",'+
        '"name": "Walter"'+
      '}'+
    '],'+
    '"fgdfgd": {}'+
  '}'));*/
  this.object = cleanObjectFromJSON(obj);
  this.next = next || function(){};
  this.id = id;
  this.width = canvas.width*70/100;
  this.create();
};
JSONeditor.prototype = {
  create: function() {
    var _this = this;
    this.window = ui.window.open({
      type: 'normal',
      id: 'JSONeditor_'+this.id,
      title: 'JSONeditor - '+this.id,
      shadowColor: '#9C5C00',
      bodyStyle: 'overflow: auto; background: #eee;',
      x: canvas.width/2-(canvas.width*70/100)/2,
      y: canvas.height/2-(canvas.height*70/100)/2,
      w: canvas.width*70/100,
      h: canvas.height*70/100,
      onopen: function(id) {
        _this.idBody = id;
        _this.idObjDiv = 'JSONeditor_Container_'+_this.id;
        ui.add.button({position:'fixed',zIndex:9999,marginLeft:(_this.width-170)+'px',marginTop: '5px'},{
          id: 'JSONeditor_validate_'+id,
          text: 'Validate!',
          icon: 'fas fa-check',
          in: id,
          class: ['btn_orange','btn','btn-w'],
          onClick: function(){
            _this.validate();
          }
        });
        $('#'+id).append('<div id="'+_this.idObjDiv+'" class="JSONeditor_Container">Loading..</div>');
        $('#'+_this.idObjDiv).html(_this.load(_this.object));
        $('#'+_this.idObjDiv+', .JSONeditor_ObjectCollapseIn').sortable();
        _this.start_event();
      }
    });
  },
  start_event: function() {
    var _this = this;
    $('.JSONeditor_Add').off('click').click(function(){
      $(this).before(_this.constructor_html('keyname','value','string'));
      _this.start_event();
    });
    $('.JSONeditor_Input').off('keydown keyup').on('keydown keyup',function(e){
      e = e || event;
      $(this).css('width',(getTextWidth($(this).val()+(e.type=='keydown'?e.key.length==1?e.key:'':''),'18px Verdana')+3)+'px');
    });
    $('.JSONeditor_Select').off('change').on('change',function(){
      var value = 'undefined';
      switch ($(this).val()) {
        case 'string':
          value = 'Hello!';
          break;
        case 'number':
          value = 42;
          break;
        case 'boolean':
          value = true;
          break;
        case 'object':
          value = '[object Object]';
          break;
        default:
      }
      $(this).parent().html(
        _this.constructor_html($(this).prev().val(),value,$(this).val(),true)+
        ($(this).val()=='object'?'<div class="JSONeditor_ObjectCollapseIn">'+
          '<button class="JSONeditor_Add"><i class="fas fa-plus" style="color: #0f0;"></i>Add Item!</button>'+
        '</div>':'')
      );
      _this.start_event();
    });
  },
  load: function(object) {
    var HTML = '';
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        if (typeof object[key] == 'object') {
          HTML += this.constructor_html(key,object[key],typeof object[key]);
          HTML += '<div class="JSONeditor_ObjectCollapseIn">'+this.load(object[key]);
          HTML += '</div></div>';
        } else {
          HTML += this.constructor_html(key,object[key],typeof object[key]);
        }
      }
    }
    HTML += '<button class="JSONeditor_Add"><i class="fas fa-plus" style="color: #0f0;"></i>Add Item!</button>';
    return HTML;
  },
  validate: function() {
    this.next(this.getJSON(function(id){
      ui.window.close(id.replace(/^WINDOW_/g,'').replace(/_Body$/g,''));
    }));
  },
  constructor_html: function(key,value,type,b) {
    var color = this.color_type(type);
    return ''+
    (typeof b=='undefined'?'<div class="JSONeditor_row">':'')+
      '<div class="JSONeditor_remove" onclick="$(this).parent().remove()"><i class="fas fa-times"></i></div><input class="JSONeditor_Input" style="width: '+(getTextWidth(key,'18px Verdana')+3)+'px; color: #222;" value="'+key+'"/>'+
      '<select class="JSONeditor_Select">'+
        '<option'+(type=='string'?' selected':'')+'>string</option>'+
        '<option'+(type=='number'?' selected':'')+'>number</option>'+
        '<option'+(type=='boolean'?' selected':'')+'>boolean</option>'+
        '<option'+(type=='object'?' selected':'')+'>object</option>'+
      '</select> : '+
      (type=='string'?'<span style="color: '+color+';">"</span>':'')+'<input class="JSONeditor_Input" style="width: '+getTextWidth(value,'18px Verdana')+'px; color: '+color+';" value="'+value+'"/>'+(type=='string'?'<span style="color: '+color+';">"</span>':'')+
    (typeof b=='undefined'?type!='object'?'</div>':'':'');
  },
  color_type: function(type) {
    var color = '#000';
    switch (type) {
      case 'string':
        color = '#0f0';
        break;
      case 'number':
        color = '#f00';
        break;
      case 'object':
        color = '#fa0';
        break;
      case 'boolean':
        color = '#00f';
        break;
      case 'null':
        color = '#999';
        break;
      default:
        color = '#000';
    }
    return color;
  },
  getJSON: function(callback) {
    try {
      var Json = JSON.parse(('{'+this.constructJSON('#'+this.idObjDiv)+'}').replace(/,}/g,'}'));
      callback(this.idBody);
      return Json;
    } catch (e) {
      callback(this.idBody);
      return {};
    }
  },
  constructJSON: function(div) {
    var rawJSON = '';
    var children = $(div).children();
    for (var child in children) {
      if (children.hasOwnProperty(child)) {
        if (!isNaN(child)) {
          if ($(children[child]).hasClass('JSONeditor_row')) {
            var key = $($(children[child]).children()[1]).val();
            var type = $($(children[child]).children()[2]).val();
            var value = $($(children[child]).children()[3]).val();
            if (value=='') {
              value = '"'+$($(children[child]).children()[4]).val()+'"';
            }
            if (type=='object') {
              rawJSON += '"'+key+'":{';
              rawJSON += this.constructJSON($(children[child]).children()[4]);
              rawJSON += '},';
            } else {
              rawJSON += '"'+key+'":'+value+',';
            }
          }
        }
      }
    }
    return rawJSON;
  }
};


function Maker() {

};
Maker.prototype = {
  List: {
    /* Sub Menu */
      _Mob_Edit: {
        Dataload: function(_this,c) {
          var __this = this;
          if (typeof __this.id != 'undefined') {
            var d = {
              mode: 'SELECTw',
              table: 'mobs_constructor',
              where: 'id',
              whereValue: __this.id
            };
            socket.SetMysql(d,function(data){
              if (data.length > 0) {
                try {
                  var MobData = JSON.parse(data[0].data);
                  __this.AnimationEdit = {
                    enable: true,
                    rawData: Object.assign({},MobData.animation)
                  };
                  __this.BoxEdit = {
                    Type: '',
                    Collision: Object.assign({},MobData.collisionBox),
                    Event: Object.assign({},MobData.eventBox)
                  };
                  __this.name = data[0].name;
                  __this.gw = MobData.gw;
                  __this.gh = MobData.gh;
                  if (MobData.spriteSheet != '') {
                    resource.setSpriteSheet(MobData.spriteSheet);
                  }
                  new toolTip('<span style="color: #0f0;">Mob: Success Load!</span>',4000);
                  c(_this,__this);
                } catch(e) {
                  $('#'+_this.idBody).html('Error load..<br />Please contact the Administrator.');
                  new toolTip('<span style="color: #f00;">Mob: Error Load (bad JSON data)!</span>',4000);
                }
              } else {
                c(_this,__this);
              }
            });
          }
        },
        Datasave: function(_this) {
          var __this = this;
          __this.name = $('#'+_this.idBody+'_CANVAS_SPRITESHEET_name').val();
          if (typeof __this.id != 'undefined') {
            if (__this.name != '') {
              var d = {
                mode: 'SELECTw',
                table: 'mobs_constructor',
                where: 'name',
                whereValue: __this.name
              };
              socket.SetMysql(d,function(data){
                if (data.length == 0) {
                  if (__this.id == null) {
                    var d = {
                      mode: 'INSERT',
                      table: 'mobs_constructor',
                      row: {}
                    };
                    var Obj = {
                      spriteSheet: typeof __this.filenameSpriteSheet != 'undefined' ? __this.filenameSpriteSheet : '',
                      gw: resource.currentSpriteSheetCANVAS.gw,
                      gh: resource.currentSpriteSheetCANVAS.gh,
                      animation: Object.assign({},__this.AnimationEdit.rawData),
                      collisionBox: Object.assign({},__this.BoxEdit.Collision),
                      eventBox: Object.assign({},__this.BoxEdit.Event)
                    };
                    d.row['name'] = __this.name;
                    d.row['data'] = JSON.stringify(Obj);
                    socket.SetMysql(d,function(data){
                      new toolTip('<span style="color: #0f0;">Mob: Success Save!</span>',4000);
                    });
                  } else {
                    var d = {
                      mode: 'UPDATE',
                      table: 'mobs_constructor',
                      where: 'id',
                      whereValue: __this.id,
                      row: {}
                    };
                    var Obj = {
                      spriteSheet: typeof __this.filenameSpriteSheet != 'undefined' ? __this.filenameSpriteSheet : '',
                      gw: resource.currentSpriteSheetCANVAS.gw,
                      gh: resource.currentSpriteSheetCANVAS.gh,
                      animation: Object.assign({},__this.AnimationEdit.rawData),
                      collisionBox: Object.assign({},__this.BoxEdit.Collision),
                      eventBox: Object.assign({},__this.BoxEdit.Event)
                    };
                    d.row['name'] = __this.name;
                    d.row['data'] = JSON.stringify(Obj);
                    socket.SetMysql(d,function(data){
                      new toolTip('<span style="color: #0f0;">Mob: Success Save!</span>',4000);
                    });
                  }
                } else {
                  //new toolTip('<span style="color: #f00;">Mob: Error!<br />This name already exist!</span>',4000);
                  var d = {
                    mode: 'UPDATE',
                    table: 'mobs_constructor',
                    where: 'id',
                    whereValue: __this.id,
                    row: {}
                  };
                  var Obj = {
                    spriteSheet: typeof __this.filenameSpriteSheet != 'undefined' ? __this.filenameSpriteSheet : '',
                    gw: resource.currentSpriteSheetCANVAS.gw,
                    gh: resource.currentSpriteSheetCANVAS.gh,
                    animation: Object.assign({},__this.AnimationEdit.rawData),
                    collisionBox: Object.assign({},__this.BoxEdit.Collision),
                    eventBox: Object.assign({},__this.BoxEdit.Event)
                  };
                  d.row['name'] = __this.name;
                  d.row['data'] = JSON.stringify(Obj);
                  socket.SetMysql(d,function(data){
                    new toolTip('<span style="color: #0f0;">Mob: Success Save!</span>',4000);
                  });
                }
              });
            } else {
              new toolTip('<span style="color: #f00;">Mob: Error!<br />Please give a name for this mob!</span>',4000);
            }
          }
        },
        setHTML: function(_this,args) {
          var __this = this;
          if (typeof args.id != 'undefined') {
            __this.id = args.id;
            __this.name = '#NoName';
            __this.gw = 32;
            __this.gh = 32;
            __this.AnimationEdit = {
              enable: true,
              rawData: {}
            };
            __this.BoxEdit = {
              Type: '',
              Collision: {},
              Event: {}
            };
            resource.currentSpriteSheetOK = false;

            $('#'+_this.idBody).html('Loading..');

            __this.Dataload(_this,function(_this,__this){
              $('#'+_this.idBody).html('');
              /* Save Button */
              ui.add.button({position:'fixed',zIndex:9999,marginLeft:(_this.width-400)+'px',marginTop: '-5px'},{
                id: 'Create_MobCreator-Edit_Save',
                text: 'Save',
                icon: 'far fa-save',
                in: _this.idBody,
                class: ['btn_yellow','btn','btn-w'],
                onClick: function(){
                  __this.Datasave(_this);
                }
              });
              ui.add.button({position:'fixed',zIndex:9999,marginLeft:(_this.width-400-$('#Create_MobCreator-Edit_Save').width()-25)+'px',marginTop: '-5px'},{
                id: 'Create_MobCreator-Edit_Back',
                text: 'Back',
                icon: 'fas fa-arrow-left',
                in: _this.idBody,
                class: ['btn_yellow','btn','btn-w'],
                onClick: function(){
                  _this.loadPage('Mob');
                }
              });
              $('#'+_this.idBody).append('<span style="font-size: 32px;">Mob Creator - Edit</span><br /><br />');
              ui.add.input({
                input: {
                  width: '50%',
                  height: '26px'
                },
                text: {
                  background: '#ddd',
                  color: '#222'
                }
              },{
                id: _this.idBody+'_CANVAS_SPRITESHEET_name',
                text: 'Name',
                value:  __this.name,
                in: _this.idBody,
                class: ['UI-input']
              });
              var HTML =
              '<br /><br />'+
              '<p>When you import a SpriteSheet, this last one is automatically available in our server with the button "Select a SpriteSheet!"</p><br />'+
              '<input style="display: none;" type="file" accept="image/*" name="uploads[]" id="fileUpload2">'+
              '<div class="UI-Create_Button UI-Create_Button-importSpriteSheet"><div class="UI-Create_ButtonPercentBox"></div><span style="z-index: 999;"><i class="fa fa-download"></i> Import a SpriteSheet! (From your computer)</span></div>'+
              '<div class="UI-Create_Button UI-Create_Button-selectSpriteSheet"><span><i class="fas fa-folder-open"></i> Select a SpriteSheet! (From our server)</span></div><br /><br />';
              $('#'+_this.idBody).append(HTML);
              ui.add.input({
                div: {
                  marginLeft: '15px',
                  marginBottom: '10px'
                },
                input: {
                  width: '100px',
                  height: '26px'
                },
                text: {
                  background: '#ddd',
                  color: '#222'
                }
              },{
                id: _this.idBody+'_CANVAS_SPRITESHEET_x',
                text: 'x',
                value:  __this.gw,
                in: _this.idBody,
                class: ['UI-input'],
                onMouseEnter: function() {
                  if (!resource.currentSpriteSheetOK) {
                    $(this).addClass('forbidden');
                    $(this).val('');
                  }
                },
                onMouseLeave: function() {
                  $(this).removeClass('forbidden');
                },
                onFocus: function() {
                  if (!resource.currentSpriteSheetOK) {
                    $(this).blur();
                  }
                },
                onKeyUp: function(event) {
                  if (isNaN(event.key) || $(this).val().length > 3) {
                    event.preventDefault();
                    return false;
                  }
                  resource.currentSpriteSheetCANVAS.gw = parseFloat($(this).val());
                },
                onKeyDown: function(event) {
                  if (isNaN(event.key) || $(this).val().length > 3) {
                    event.preventDefault();
                    return false;
                  }
                  resource.currentSpriteSheetCANVAS.gh = parseFloat($(this).val());
                }
              });
              ui.add.input({
                input: {
                  width: '100px',
                  height: '26px',
                },
                text: {
                  background: '#ddd',
                  color: '#222'
                }
              },{
                id: _this.idBody+'_CANVAS_SPRITESHEET_y',
                text: 'y',
                value: __this.gh,
                in: _this.idBody,
                class: ['UI-input'],
                onMouseEnter: function() {
                  if (!resource.currentSpriteSheetOK) {
                    $(this).addClass('forbidden');
                    $(this).val('');
                  }
                },
                onMouseLeave: function() {
                  $(this).removeClass('forbidden');
                },
                onFocus: function() {
                  if (!resource.currentSpriteSheetOK) {
                    $(this).blur();
                  }
                },
                onKeyUp: function(event) {
                  if (isNaN(event.key) || $(this).val().length > 3) {
                    event.preventDefault();
                    return false;
                  }
                  resource.currentSpriteSheetCANVAS.gh = parseFloat($(this).val());
                },
                onKeyDown: function(event) {
                  if (isNaN(event.key) || $(this).val().length > 3) {
                    event.preventDefault();
                    return false;
                  }
                  resource.currentSpriteSheetCANVAS.gh = parseFloat($(this).val());
                }
              });
              $('#'+_this.idBody).append('<br />');
              ui.add.button({},{
                id: 'Create_MobCreator-Edit_Up',
                text: 'Up',
                icon: 'fas fa-arrow-up',
                in: _this.idBody,
                class: ['btn_red','btn','MobCreator-Edit-Animation'],
                onClick: function(){
                  $('.MobCreator-Edit-Animation').removeClass('active');
                  $(this).addClass('active');
                  __this.AnimationEdit.color = 'rgba(250,99,99,0.5)';
                  __this.AnimationEdit.direction = 'up';
                  __this.AnimationEdit.enable = true;
                }
              });
              ui.add.button({},{
                id: 'Create_MobCreator-Edit_Left',
                text: 'Left',
                icon: 'fas fa-arrow-left',
                in: _this.idBody,
                class: ['btn_green','btn','MobCreator-Edit-Animation'],
                onClick: function(){
                  $('.MobCreator-Edit-Animation').removeClass('active');
                  $(this).addClass('active');
                  __this.AnimationEdit.color = 'rgba(0,255,4,0.5)';
                  __this.AnimationEdit.direction = 'left';
                  __this.AnimationEdit.enable = true;
                }
              });
              ui.add.button({},{
                id: 'Create_MobCreator-Edit_Right',
                text: 'Right',
                icon: 'fas fa-arrow-right',
                in: _this.idBody,
                class: ['btn_blue','btn','MobCreator-Edit-Animation'],
                onClick: function(){
                  $('.MobCreator-Edit-Animation').removeClass('active');
                  $(this).addClass('active');
                  __this.AnimationEdit.color = 'rgba(122,255,237,0.5)';
                  __this.AnimationEdit.direction = 'right';
                  __this.AnimationEdit.enable = true;
                }
              });
              ui.add.button({},{
                id: 'Create_MobCreator-Edit_Down',
                text: 'Down',
                icon: 'fas fa-arrow-down',
                in: _this.idBody,
                class: ['btn_pink','btn','MobCreator-Edit-Animation'],
                onClick: function(){
                  $('.MobCreator-Edit-Animation').removeClass('active');
                  $(this).addClass('active');
                  __this.AnimationEdit.color = 'rgba(255,0,220,0.5)';
                  __this.AnimationEdit.direction = 'down';
                  __this.AnimationEdit.enable = true;
                }
              });
              $('#'+_this.idBody).append('<br />');
              ui.add.button({},{
                id: 'Create_MobCreator-Edit_Collision',
                text: 'Collision box',
                icon: 'far fa-square',
                in: _this.idBody,
                class: ['btn_red','btn','MobCreator-Edit-Animation'],
                onClick: function(){
                  $('.MobCreator-Edit-Animation').removeClass('active');
                  $(this).addClass('active');
                  __this.AnimationEdit.enable = false;
                  __this.BoxEdit.Type = 'Collision';
                }
              });
              ui.add.button({},{
                id: 'Create_MobCreator-Edit_Event',
                text: 'Event box',
                icon: 'far fa-square',
                in: _this.idBody,
                class: ['btn_green','btn','MobCreator-Edit-Animation'],
                onClick: function(){
                  $('.MobCreator-Edit-Animation').removeClass('active');
                  $(this).addClass('active');
                  __this.AnimationEdit.enable = false;
                  __this.BoxEdit.Type = 'Event';
                }
              });

              resource.currentSpriteSheetCANVAS = ui.add.canvas({marginLeft: '15px', border: '1px solid #333',width:(canvas.width*50/100)*90/100,height:(canvas.height*70/100)*80/100},{
                id: _this.idBody+'_CANVAS_SPRITESHEET',
                in: _this.idBody,
                draw: function () {
                  if ($('#'+this.in).css('display') != 'none') {
                    this.clear();
                    if (resource.currentSpriteSheetOK) {
                      __this.filenameSpriteSheet = resource.currentSpriteSheetNAME;
                    }
                    if (__this.AnimationEdit.enable) {
                      if (resource.currentSpriteSheetOK) {
                        this.ctx.beginPath();
                        var originX = this.x+this.mx;
                        var originY = this.y+this.my;
                        originX -= (mouse.ax)/(this.oldScale*this.zoom) - (mouse.ax)/this.scale;
                        originY -= (mouse.ay)/(this.oldScale*this.zoom) - (mouse.ay)/this.scale;
                        this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
                        this.ctx.scale(this.zoom, this.zoom);
                        this.ctx.translate(originX, originY);
                        this.ctx.drawImage(resource.currentSpriteSheetIMAGE,0,0,resource.currentSpriteSheetIMAGE.width,resource.currentSpriteSheetIMAGE.height);
                        this.ctx.rect(0,0,resource.currentSpriteSheetIMAGE.width - resource.currentSpriteSheetIMAGE.width%this.gw + this.gw,resource.currentSpriteSheetIMAGE.height - resource.currentSpriteSheetIMAGE.height%this.gh + this.gh);

                        this.w = resource.currentSpriteSheetIMAGE.width;
                        this.h = resource.currentSpriteSheetIMAGE.height;

                        this.ctx.strokeStyle = '#fff';
                        this.ctx.lineWidth = 3;
                        this.ctx.stroke();
                        this.ctx.setTransform(1,0,0,1,0,0);
                      }

                      var nb = {
                        up: 0,
                        left: 0,
                        right: 0,
                        down: 0
                      };
                      for (var k in __this.AnimationEdit.rawData) {
                        if (__this.AnimationEdit.rawData.hasOwnProperty(k)) {
                          var current = __this.AnimationEdit.rawData[k];
                          this.ctx.beginPath();
                          var originX = current.x*this.gw+this.x+this.mx;
                          var originY = current.y*this.gh+this.y+this.my;
                          originX -= (mouse.ax)/(this.oldScale*this.zoom) - (mouse.ax)/this.scale;
                          originY -= (mouse.ay)/(this.oldScale*this.zoom) - (mouse.ay)/this.scale;
                          this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
                          this.ctx.scale(this.zoom, this.zoom);
                          this.ctx.translate(originX, originY);
                          this.ctx.rect(0,0,this.gw,this.gh);
                          this.ctx.fillStyle = current.color;
                          this.ctx.fill();
                          this.ctx.font = '25px sans-serif';
                          this.ctx.textAlign = "center";
                          this.ctx.textBaseline = 'middle';
                          this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
                          this.ctx.fillText(nb[current.direction],this.gw/2,this.gh/2);
                          nb[current.direction]++;
                          this.ctx.setTransform(1,0,0,1,0,0);
                        }
                      }

                      if (ui.HoverCanvas && typeof __this.AnimationEdit.color != 'undefined') {
                        this.ctx.beginPath();
                        this.viewWidth = this.canvas.width/this.zoom;
                        this.viewHeight = this.canvas.height/this.zoom;
                        var m = this.getXY({x:mouse.x,y:mouse.y});
                        var x = ((m.x/this.zoom-(this.x+this.mx+this.viewWidth/2)) - (m.x/this.zoom-(this.x+this.mx+this.viewWidth/2))%this.gw) / this.gw;
                        var y = ((m.y/this.zoom-(this.y+this.my+this.viewHeight/2)) - (m.y/this.zoom-(this.y+this.my+this.viewHeight/2))%this.gh) / this.gh;
                        var ax = x, ay = y;
                        if (mouse.isLeftDown) {
                          mouse.isLeftDown = false;
                          if (typeof __this.AnimationEdit.rawData['['+ax+','+ay+']'] != 'undefined') {
                            if (__this.AnimationEdit.rawData['['+ax+','+ay+']'].direction == __this.AnimationEdit.direction) {
                              delete __this.AnimationEdit.rawData['['+ax+','+ay+']'];
                            } else {
                              __this.AnimationEdit.rawData['['+ax+','+ay+']'] = {x:ax,y:ay,direction: __this.AnimationEdit.direction, color: __this.AnimationEdit.color};
                            }
                          } else {
                            __this.AnimationEdit.rawData['['+ax+','+ay+']'] = {x:ax,y:ay,direction: __this.AnimationEdit.direction, color: __this.AnimationEdit.color};
                          }
                        }
                        if (ax >= 0 && ay >= 0 && ax <= Math.floor(this.w/this.gw) && ay <= Math.floor(this.h/this.gh)) {
                          var originX = ax*this.gw+this.x+this.mx;
                          var originY = ay*this.gh+this.y+this.my;
                          originX -= (mouse.ax)/(this.oldScale*this.zoom) - (mouse.ax)/this.scale;
                          originY -= (mouse.ay)/(this.oldScale*this.zoom) - (mouse.ay)/this.scale;
                          this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
                          this.ctx.scale(this.zoom, this.zoom);
                          this.ctx.translate(originX, originY);
                          this.ctx.rect(0,0,this.gw,this.gh);
                          this.ctx.fillStyle = __this.AnimationEdit.color;
                          this.ctx.fill();
                          this.ctx.setTransform(1,0,0,1,0,0);
                        }
                      }

                      this.drawGrid(this.w,this.h,this.gw,this.gh,'#fff');
                    } else {
                      var getXYspriteSheet = function(id,width,height,gw,gh) {
                        var w = width-width%gw;
                        return {
                          x: (gw*(id+1))%w-gw,
                          y: gh*Math.floor((gh*id)/w)
                        };
                      };
                      if (resource.currentSpriteSheetOK) {
                        this.ctx.beginPath();
                        var originX = this.x+this.mx;
                        var originY = this.y+this.my;
                        originX -= (mouse.ax)/(this.oldScale*this.zoom) - (mouse.ax)/this.scale;
                        originY -= (mouse.ay)/(this.oldScale*this.zoom) - (mouse.ay)/this.scale;
                        this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
                        this.ctx.scale(this.zoom, this.zoom);
                        this.ctx.translate(originX, originY);

                        var nb_width = Math.ceil((resource.currentSpriteSheetIMAGE.width-resource.currentSpriteSheetIMAGE.width%this.gw)/this.gw)+1;
                        var nb_height = Math.ceil((resource.currentSpriteSheetIMAGE.height-resource.currentSpriteSheetIMAGE.height%this.gh)/this.gh)+1;
                        var nb = nb_width*nb_height-1;

                        this.ctx.save();
                        this.ctx.globalAlpha = 0.1;
                        for (var n = 0; n < nb; n++) {
                          var xy = getXYspriteSheet(n,resource.currentSpriteSheetIMAGE.width,resource.currentSpriteSheetIMAGE.height,this.gw,this.gh);
                          this.ctx.drawImage(resource.currentSpriteSheetIMAGE,xy.x,xy.y,this.gw,this.gh,0,0,this.gw,this.gh);
                        }
                        this.ctx.restore();

                        this.ctx.beginPath();
                        this.ctx.rect(0,0,this.gw,this.gh);
                        this.ctx.strokeStyle = '#fff';
                        this.ctx.lineWidth = 3;
                        this.ctx.stroke();

                        this.w = this.gw;
                        this.h = this.gh;

                        this.viewWidth = this.canvas.width/this.zoom;
                        this.viewHeight = this.canvas.height/this.zoom;
                        var m = this.getXY({x:mouse.x,y:mouse.y});
                        var x = m.x/this.zoom-(this.x+this.mx+this.viewWidth/2);
                        var y = m.y/this.zoom-(this.y+this.my+this.viewHeight/2);
                        if (ui.HoverCanvas && mouse.isLeftDown && typeof __this.BoxEdit[__this.BoxEdit.Type].isClick == 'undefined') {
                          delete __this.BoxEdit[__this.BoxEdit.Type].isEnd;
                          __this.BoxEdit[__this.BoxEdit.Type].isClick = true;
                          __this.BoxEdit[__this.BoxEdit.Type].end = false;
                          __this.BoxEdit[__this.BoxEdit.Type].start = {
                            x: x,
                            y: y
                          };
                        }
                        if (!mouse.isLeftDown && typeof __this.BoxEdit[__this.BoxEdit.Type].isClick != 'undefined') {
                          delete __this.BoxEdit[__this.BoxEdit.Type].isClick;
                          __this.BoxEdit[__this.BoxEdit.Type].isEnd = true;
                          __this.BoxEdit[__this.BoxEdit.Type].end = {
                            x: x,
                            y: y
                          };
                        }
                        if (typeof __this.BoxEdit[__this.BoxEdit.Type].start != 'undefined') {
                          this.ctx.setTransform(1,0,0,1,0,0);
                          this.ctx.beginPath();
                          var endX = x;
                          var endY = y;
                          if (typeof __this.BoxEdit[__this.BoxEdit.Type].isEnd != 'undefined') {
                            endX = __this.BoxEdit[__this.BoxEdit.Type].end.x;
                            endY = __this.BoxEdit[__this.BoxEdit.Type].end.y;
                          }
                          var originX = __this.BoxEdit[__this.BoxEdit.Type].start.x+this.x+this.mx;
                          var originY = __this.BoxEdit[__this.BoxEdit.Type].start.y+this.y+this.my;
                          originX -= (mouse.ax)/(this.oldScale*this.zoom) - (mouse.ax)/this.scale;
                          originY -= (mouse.ay)/(this.oldScale*this.zoom) - (mouse.ay)/this.scale;
                          this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
                          this.ctx.scale(this.zoom, this.zoom);
                          this.ctx.translate(originX, originY);
                          this.ctx.rect(0,0,endX-__this.BoxEdit[__this.BoxEdit.Type].start.x,endY-__this.BoxEdit[__this.BoxEdit.Type].start.y);
                          if (__this.BoxEdit.Type == 'Event') {
                            this.ctx.fillStyle = 'rgba(0,255,0,0.5)';
                            this.ctx.strokeStyle = '#0f0';
                          } else {
                            this.ctx.fillStyle = 'rgba(255,0,0,0.5)';
                            this.ctx.strokeStyle = '#f00';
                          }
                          this.ctx.lineWidth = 1;
                          this.ctx.fill();
                          this.ctx.stroke();
                          this.ctx.setTransform(1,0,0,1,0,0);
                        }


                        this.ctx.setTransform(1,0,0,1,0,0);
                      }
                    }
                  }
                }
              });
              resource.currentSpriteSheetCANVAS.gw = __this.gw;
              resource.currentSpriteSheetCANVAS.gh = __this.gh;
              __this.startEvent(_this);
            });
          } else {
            _this.loadPage('Mob');
          }
        },
        startEvent: function(_this) {
          $('#fileUpload2').off('change').on('change',function(event){
            event.preventDefault();
            new toolTip('Importation en cours..',4000);
            var files = $(this).get(0).files;
            if (files.length > 0) {
              var _this = this;
              var spriteList = [];
              var listExt = {
                png:'',
                jpg:'',
                jpeg:'',
                gif:'',
                bmp:'',
                webp:'',
                svg:''
              };
              var j = 0, xhr = {}, nb = 0;
              for (var i = 0; i < files.length; i++) {
                (function(file,_this){
                  var reader = new FileReader();
                  reader.onload = function(){
                    var dataURL = reader.result;
                    var name = file.name.slice(0,file.name.lastIndexOf('.'));
                    name = 'SPRITESHEET_'+(name.length > 16 ? name.substring(0,16) : name)+'.'+Math.random().toString(36).substring(7);
                    var ext = file.name.slice(file.name.lastIndexOf('.')+1).toLowerCase();
                    if (name != '' && ext != '' && typeof listExt[ext] != 'undefined') {
                      spriteList.push({
                        name: name+'.'+ext,
                        data: dataURL
                      });
                      nb++;
                    }
                    j++;
                    if (j > files.length-1) {
                      var dataJSON = JSON.stringify(spriteList);
                      xhr = new XMLHttpRequest();
                      xhr.open("POST", "/saveImageSpriteSheet", true);
                      $(_this).next('div').find('.UI-Create_ButtonPercentBox').addClass('process');
                      xhr.onloadend = function (e) {
                        setTimeout(function () {
                          $(_this).next('div').find('.UI-Create_ButtonPercentBox').removeClass('process');
                          $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('width','100%');
                          setTimeout(function () {
                            $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('transition','width 0s ease');
                            setTimeout(function () {
                              $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('width','0%');
                              setTimeout(function () {
                                $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('transition','width 0.5s ease');
                              },100);
                            },100);
                          },500);
                        },500);
                        var data = e.target.response;
                        try {
                          data = JSON.parse(data);
                        } catch(e) {
                          data = false;
                        }
                        if (data) {
                          var t = nb - data.nb;
                          if (t == 0) {
                            new toolTip('<span style="color: #0f0;">Success importation!</span>',4000);
                          } else {
                            new toolTip('<span style="color: #f00;">Warning importation:<br />only <b>'+Math.abs(t)+'</b> SpriteSheet was imported!</span>',4000);
                          }
                        } else {
                          new toolTip('<span style="color: #f00;">Error importation!</span>',4000);
                        }
                      }
                      xhr.send(dataJSON);
                    }
                  };
                  reader.readAsDataURL(file);
                })(files[i],_this);
              }
            }
          });
          $('.UI-Create_Button-importSpriteSheet').off('click').click(function(){
            event.preventDefault();
            $('#fileUpload2').click();
            return false;
          });
          $('.UI-Create_Button-selectSpriteSheet').off('click').click(function(){
            event.preventDefault();
            resource.getSpriteSheets(function(files){
              ui.window.open({
                type: 'normal',
                id: _this.id.replace(/WINDOW_/g,'')+'_SelectSpriteSheetS',
                title: 'Select a SpriteSheet',
                shadowColor: '#FFFF00',
                bodyStyle: 'background: #222;',
                x: canvas.width/2-(canvas.width*50/100)/2,
                y: canvas.height/2-(canvas.height*70/100)/2,
                w: canvas.width*50/100,
                h: canvas.height*70/100,
                onopen: function(id) {
                  for (var i in files) {
                    if (files.hasOwnProperty(i)) {
                      $('#'+id).append('<div class="UI-Create_SelectSpriteSheet-ContainerImage" onclick="ui.window.close(\''+id.replace(/^WINDOW_/g,'').replace(/_Body$/g,'')+'\');resource.setSpriteSheet(\''+files[i]+'\');"><div class="UI-Create_SelectSpriteSheet-Image" style="background: url(assets/mob/'+files[i]+') center no-repeat; background-size: contain;"></div></div>');
                    }
                  }
                }
              });
            });
            return false;
          });
        }
      },

      _Attack_Edit: {
        Dataload: function(_this,c) {
          var __this = this;
          if (typeof __this.id != 'undefined') {
            var d = {
              mode: 'SELECTw',
              table: 'jaajsattack',
              where: 'id',
              whereValue: __this.id
            };
            socket.SetMysql(d,function(data){
              if (data.length > 0) {
                try {
                  var AttackData = JSON.parse(data[0].data);
                  __this.AnimationEdit = {
                    enable: true,
                    rawData: Object.assign({},AttackData.animation)
                  };
                  __this.name = AttackData.data.name;
                  __this.gw = AttackData.gw;
                  __this.gh = AttackData.gh;
                  __this.AttackData = AttackData.data;
                  if (AttackData.spriteSheet != '') {
                    resource.setAnimationSpriteSheet(AttackData.spriteSheet);
                  }
                  new toolTip('<span style="color: #0f0;">Attack: Success Load!</span>',4000);
                  c(_this,__this);
                } catch(e) {
                  $('#'+_this.idBody).html('Error load..<br />Please contact the Administrator.');
                  new toolTip('<span style="color: #f00;">Mob: Error Load (bad JSON data)!</span>',4000);
                }
              } else {
                c(_this,__this);
              }
            });
          }
        },
        Datasave: function(_this) {
          var __this = this;
          //__this.name = $('#'+_this.idBody+'_CANVAS_SPRITESHEET_name').val();
          if (typeof __this.id != 'undefined') {
            if (__this.name != '') {
              if (__this.id == null) {
                var d = {
                  mode: 'INSERT',
                  table: 'jaajsattack',
                  row: {}
                };
                var Obj = {
                  name:__this.data.name,
                  spriteSheet: typeof __this.filenameSpriteSheet != 'undefined' ? __this.filenameSpriteSheet : '',
                  gw: resource.currentSpriteSheetCANVAS.gw,
                  gh: resource.currentSpriteSheetCANVAS.gh,
                  animation: Object.assign({},__this.AnimationEdit.rawData),
                  data: Object.assign({},__this.data)
                };
                d.row['data'] = JSON.stringify(Obj);
                socket.SetMysql(d,function(data){
                  new toolTip('<span style="color: #0f0;">Attack: Success Save!</span>',4000);
                });
              } else {
                var d = {
                  mode: 'UPDATE',
                  table: 'jaajsattack',
                  where: 'id',
                  whereValue: __this.id,
                  row: {}
                };
                var Obj = {
                  name:__this.data.name,
                  spriteSheet: typeof __this.filenameSpriteSheet != 'undefined' ? __this.filenameSpriteSheet : '',
                  gw: resource.currentSpriteSheetCANVAS.gw,
                  gh: resource.currentSpriteSheetCANVAS.gh,
                  animation: Object.assign({},__this.AnimationEdit.rawData),
                  data: Object.assign({},__this.data)
                };
                d.row['data'] = JSON.stringify(Obj);
                socket.SetMysql(d,function(data){
                  new toolTip('<span style="color: #0f0;">Attack: Success Save!</span>',4000);
                });
              }
            } else {
              new toolTip('<span style="color: #f00;">Attack: Error!<br />Please give a name for this mob!</span>',4000);
            }
          }
        },
        setHTML: function(_this,args) {
          var __this = this;
          if (typeof args.id != 'undefined') {
            __this.id = args.id;
            __this.name = '#NoName';
            __this.gw = 32;
            __this.gh = 32;
            __this.AnimationEdit = {
              enable: true,
              color: 'rgba(20,240,20,0.3)',
              rawData: {}
            };
            resource.currentSpriteSheetOK = false;

            $('#'+_this.idBody).html('Loading..');

            __this.Dataload(_this,function(_this,__this){
              $('#'+_this.idBody).html('');
              /* Save Button */
              ui.add.button({position:'fixed',zIndex:9999,marginLeft:(_this.width-400)+'px',marginTop: '-5px'},{
                id: 'Create_AttackCreator-Edit_Save',
                text: 'Save',
                icon: 'far fa-save',
                in: _this.idBody,
                class: ['btn_yellow','btn','btn-w'],
                onClick: function(){
                  __this.Datasave(_this);
                }
              });
              ui.add.button({position:'fixed',zIndex:9999,marginLeft:(_this.width-400-$('#Create_AttackCreator-Edit_Save').width()-25)+'px',marginTop: '-5px'},{
                id: 'Create_AttackCreator-Edit_Back',
                text: 'Back',
                icon: 'fas fa-arrow-left',
                in: _this.idBody,
                class: ['btn_yellow','btn','btn-w'],
                onClick: function(){
                  _this.loadPage('Attacks List');
                }
              });
              $('#'+_this.idBody).append('<span style="font-size: 32px;">Attacks List - Edit</span><br /><br />');


              if (typeof __this.AttackData !== 'undefined') {
                __this.data = __this.AttackData;
              } else {
                __this.data = {
                  name: 'Name Of Attack, Ex: Toenail',
                  owner: {
                    power: 0,
                    attack: 0,
                    defense: 0,
                    speed: 0
                  },
                  adverse: {
                    power: 0,
                    attack: 0,
                    defense: 0,
                    speed: 0
                  },
                  animation: {
                    enable:true,
                    speed:10
                  }
                };
              }
              ui.add.button({},{
                id: 'Create_JaajCreator-Edit_DataObject',
                text: 'Edit Data Attack',
                icon: 'fas fa-database',
                in: _this.idBody,
                class: ['btn_yellow','btn','btn-w'],
                onClick: function(){
                  new JSONeditor(__this.data,'_'+new Date().valueOf().toString(32),function(data){
                    __this.data = data;
                  });
                }
              });

              var HTML =
              '<br /><br />'+
              '<p>When you import a SpriteSheet Animation, this last one is automatically available in our server with the button "Select a SpriteSheet Animation!"</p><br />'+
              '<input style="display: none;" type="file" accept="image/*" name="uploads[]" id="fileUpload2">'+
              '<div class="UI-Create_Button UI-Create_Button-importSpriteSheet"><div class="UI-Create_ButtonPercentBox"></div><span style="z-index: 999;"><i class="fa fa-download"></i> Import a SpriteSheet Animation! (From your computer)</span></div>'+
              '<div class="UI-Create_Button UI-Create_Button-selectSpriteSheet"><span><i class="fas fa-folder-open"></i> Select a SpriteSheet Animation! (From our server)</span></div><br /><br />';
              $('#'+_this.idBody).append(HTML);
              ui.add.input({
                div: {
                  marginLeft: '15px',
                  marginBottom: '10px'
                },
                input: {
                  width: '100px',
                  height: '26px'
                },
                text: {
                  background: '#ddd',
                  color: '#222'
                }
              },{
                id: _this.idBody+'_CANVAS_SPRITESHEET_x',
                text: 'x',
                value:  __this.gw,
                in: _this.idBody,
                class: ['UI-input'],
                onMouseEnter: function() {
                  if (!resource.currentSpriteSheetOK) {
                    $(this).addClass('forbidden');
                    $(this).val('');
                  }
                },
                onMouseLeave: function() {
                  $(this).removeClass('forbidden');
                },
                onFocus: function() {
                  if (!resource.currentSpriteSheetOK) {
                    $(this).blur();
                  }
                },
                onKeyUp: function(event) {
                  if (isNaN(event.key) || $(this).val().length > 3) {
                    event.preventDefault();
                    return false;
                  }
                  resource.currentSpriteSheetCANVAS.gw = parseFloat($(this).val());
                },
                onKeyDown: function(event) {
                  if (isNaN(event.key) || $(this).val().length > 3) {
                    event.preventDefault();
                    return false;
                  }
                  resource.currentSpriteSheetCANVAS.gh = parseFloat($(this).val());
                }
              });
              ui.add.input({
                input: {
                  width: '100px',
                  height: '26px',
                },
                text: {
                  background: '#ddd',
                  color: '#222'
                }
              },{
                id: _this.idBody+'_CANVAS_SPRITESHEET_y',
                text: 'y',
                value: __this.gh,
                in: _this.idBody,
                class: ['UI-input'],
                onMouseEnter: function() {
                  if (!resource.currentSpriteSheetOK) {
                    $(this).addClass('forbidden');
                    $(this).val('');
                  }
                },
                onMouseLeave: function() {
                  $(this).removeClass('forbidden');
                },
                onFocus: function() {
                  if (!resource.currentSpriteSheetOK) {
                    $(this).blur();
                  }
                },
                onKeyUp: function(event) {
                  if (isNaN(event.key) || $(this).val().length > 3) {
                    event.preventDefault();
                    return false;
                  }
                  resource.currentSpriteSheetCANVAS.gh = parseFloat($(this).val());
                },
                onKeyDown: function(event) {
                  if (isNaN(event.key) || $(this).val().length > 3) {
                    event.preventDefault();
                    return false;
                  }
                  resource.currentSpriteSheetCANVAS.gh = parseFloat($(this).val());
                }
              });
              __this.AnimationEdit.color = 'rgba(20,240,20,0.3)';
              resource.currentSpriteSheetCANVAS = ui.add.canvas({marginLeft: '15px', border: '1px solid #333',width:(canvas.width*50/100)*90/100,height:(canvas.height*70/100)*80/100},{
                id: _this.idBody+'_CANVAS_SPRITESHEET',
                in: _this.idBody,
                draw: function () {
                  if ($('#'+this.in).css('display') != 'none') {
                    this.clear();
                    if (resource.currentSpriteSheetOK) {
                      __this.filenameSpriteSheet = resource.currentSpriteSheetNAME;
                    }
                    if (__this.AnimationEdit.enable) {
                      if (resource.currentSpriteSheetOK) {
                        this.ctx.beginPath();
                        var originX = this.x+this.mx;
                        var originY = this.y+this.my;
                        originX -= (mouse.ax)/(this.oldScale*this.zoom) - (mouse.ax)/this.scale;
                        originY -= (mouse.ay)/(this.oldScale*this.zoom) - (mouse.ay)/this.scale;
                        this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
                        this.ctx.scale(this.zoom, this.zoom);
                        this.ctx.translate(originX, originY);
                        this.ctx.drawImage(resource.currentSpriteSheetIMAGE,0,0,resource.currentSpriteSheetIMAGE.width,resource.currentSpriteSheetIMAGE.height);
                        this.ctx.rect(0,0,resource.currentSpriteSheetIMAGE.width - resource.currentSpriteSheetIMAGE.width%this.gw + this.gw,resource.currentSpriteSheetIMAGE.height - resource.currentSpriteSheetIMAGE.height%this.gh + this.gh);

                        this.w = resource.currentSpriteSheetIMAGE.width;
                        this.h = resource.currentSpriteSheetIMAGE.height;

                        this.ctx.strokeStyle = '#fff';
                        this.ctx.lineWidth = 3;
                        this.ctx.stroke();
                        this.ctx.setTransform(1,0,0,1,0,0);
                      }

                      var nb = 0;
                      for (var k in __this.AnimationEdit.rawData) {
                        if (__this.AnimationEdit.rawData.hasOwnProperty(k)) {
                          var current = __this.AnimationEdit.rawData[k];
                          this.ctx.beginPath();
                          var originX = current.x*this.gw+this.x+this.mx;
                          var originY = current.y*this.gh+this.y+this.my;
                          originX -= (mouse.ax)/(this.oldScale*this.zoom) - (mouse.ax)/this.scale;
                          originY -= (mouse.ay)/(this.oldScale*this.zoom) - (mouse.ay)/this.scale;
                          this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
                          this.ctx.scale(this.zoom, this.zoom);
                          this.ctx.translate(originX, originY);
                          this.ctx.rect(0,0,this.gw,this.gh);
                          this.ctx.fillStyle = __this.AnimationEdit.color;
                          this.ctx.fill();
                          this.ctx.font = '25px sans-serif';
                          this.ctx.textAlign = "center";
                          this.ctx.textBaseline = 'middle';
                          this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
                          this.ctx.fillText(nb,this.gw/2,this.gh/2);
                          nb++;
                          this.ctx.setTransform(1,0,0,1,0,0);
                        }
                      }

                      if (ui.HoverCanvas && typeof __this.AnimationEdit.color != 'undefined') {
                        this.ctx.beginPath();
                        this.viewWidth = this.canvas.width/this.zoom;
                        this.viewHeight = this.canvas.height/this.zoom;
                        var m = this.getXY({x:mouse.x,y:mouse.y});
                        var x = ((m.x/this.zoom-(this.x+this.mx+this.viewWidth/2)) - (m.x/this.zoom-(this.x+this.mx+this.viewWidth/2))%this.gw) / this.gw;
                        var y = ((m.y/this.zoom-(this.y+this.my+this.viewHeight/2)) - (m.y/this.zoom-(this.y+this.my+this.viewHeight/2))%this.gh) / this.gh;
                        var ax = x, ay = y;
                        if (mouse.isLeftDown) {
                          mouse.isLeftDown = false;
                          if (typeof __this.AnimationEdit.rawData['['+ax+','+ay+']'] != 'undefined') {
                            delete __this.AnimationEdit.rawData['['+ax+','+ay+']'];
                          } else {
                            __this.AnimationEdit.rawData['['+ax+','+ay+']'] = {x:ax,y:ay,id:nb};
                          }
                        }
                        if (ax >= 0 && ay >= 0 && ax <= Math.floor(this.w/this.gw) && ay <= Math.floor(this.h/this.gh)) {
                          var originX = ax*this.gw+this.x+this.mx;
                          var originY = ay*this.gh+this.y+this.my;
                          originX -= (mouse.ax)/(this.oldScale*this.zoom) - (mouse.ax)/this.scale;
                          originY -= (mouse.ay)/(this.oldScale*this.zoom) - (mouse.ay)/this.scale;
                          this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
                          this.ctx.scale(this.zoom, this.zoom);
                          this.ctx.translate(originX, originY);
                          this.ctx.rect(0,0,this.gw,this.gh);
                          this.ctx.fillStyle = __this.AnimationEdit.color;
                          this.ctx.fill();
                          this.ctx.setTransform(1,0,0,1,0,0);
                        }
                      }

                      this.drawGrid(this.w,this.h,this.gw,this.gh,'#fff');
                    } else {
                      var getXYspriteSheet = function(id,width,height,gw,gh) {
                        var w = width-width%gw;
                        return {
                          x: (gw*(id+1))%w-gw,
                          y: gh*Math.floor((gh*id)/w)
                        };
                      };
                      if (resource.currentSpriteSheetOK) {
                        this.ctx.beginPath();
                        var originX = this.x+this.mx;
                        var originY = this.y+this.my;
                        originX -= (mouse.ax)/(this.oldScale*this.zoom) - (mouse.ax)/this.scale;
                        originY -= (mouse.ay)/(this.oldScale*this.zoom) - (mouse.ay)/this.scale;
                        this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
                        this.ctx.scale(this.zoom, this.zoom);
                        this.ctx.translate(originX, originY);

                        var nb_width = Math.ceil((resource.currentSpriteSheetIMAGE.width-resource.currentSpriteSheetIMAGE.width%this.gw)/this.gw)+1;
                        var nb_height = Math.ceil((resource.currentSpriteSheetIMAGE.height-resource.currentSpriteSheetIMAGE.height%this.gh)/this.gh)+1;
                        var nb = nb_width*nb_height-1;

                        this.ctx.save();
                        this.ctx.globalAlpha = 0.1;
                        for (var n = 0; n < nb; n++) {
                          var xy = getXYspriteSheet(n,resource.currentSpriteSheetIMAGE.width,resource.currentSpriteSheetIMAGE.height,this.gw,this.gh);
                          this.ctx.drawImage(resource.currentSpriteSheetIMAGE,xy.x,xy.y,this.gw,this.gh,0,0,this.gw,this.gh);
                        }
                        this.ctx.restore();

                        this.ctx.beginPath();
                        this.ctx.rect(0,0,this.gw,this.gh);
                        this.ctx.strokeStyle = '#fff';
                        this.ctx.lineWidth = 3;
                        this.ctx.stroke();

                        this.w = this.gw;
                        this.h = this.gh;

                        this.viewWidth = this.canvas.width/this.zoom;
                        this.viewHeight = this.canvas.height/this.zoom;


                        this.ctx.setTransform(1,0,0,1,0,0);
                      }
                    }
                  }
                }
              });
              resource.currentSpriteSheetCANVAS.gw = __this.gw;
              resource.currentSpriteSheetCANVAS.gh = __this.gh;
              __this.startEvent(_this);
            });
          } else {
            _this.loadPage('Attacks List');
          }
        },
        startEvent: function(_this) {
          $('#fileUpload2').off('change').on('change',function(event){
            event.preventDefault();
            new toolTip('Importation en cours..',4000);
            var files = $(this).get(0).files;
            if (files.length > 0) {
              var _this = this;
              var spriteList = [];
              var listExt = {
                png:'',
                jpg:'',
                jpeg:'',
                gif:'',
                bmp:'',
                webp:'',
                svg:''
              };
              var j = 0, xhr = {}, nb = 0;
              for (var i = 0; i < files.length; i++) {
                (function(file,_this){
                  var reader = new FileReader();
                  reader.onload = function(){
                    var dataURL = reader.result;
                    var name = file.name.slice(0,file.name.lastIndexOf('.'));
                    name = 'ANIMATIONSPRITESHEET_'+(name.length > 16 ? name.substring(0,16) : name)+'.'+Math.random().toString(36).substring(7);
                    var ext = file.name.slice(file.name.lastIndexOf('.')+1).toLowerCase();
                    if (name != '' && ext != '' && typeof listExt[ext] != 'undefined') {
                      spriteList.push({
                        name: name+'.'+ext,
                        data: dataURL
                      });
                      nb++;
                    }
                    j++;
                    if (j > files.length-1) {
                      var dataJSON = JSON.stringify(spriteList);
                      xhr = new XMLHttpRequest();
                      xhr.open("POST", "/saveImageAnimationSpriteSheet", true);
                      $(_this).next('div').find('.UI-Create_ButtonPercentBox').addClass('process');
                      xhr.onloadend = function (e) {
                        setTimeout(function () {
                          $(_this).next('div').find('.UI-Create_ButtonPercentBox').removeClass('process');
                          $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('width','100%');
                          setTimeout(function () {
                            $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('transition','width 0s ease');
                            setTimeout(function () {
                              $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('width','0%');
                              setTimeout(function () {
                                $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('transition','width 0.5s ease');
                              },100);
                            },100);
                          },500);
                        },500);
                        var data = e.target.response;
                        try {
                          data = JSON.parse(data);
                        } catch(e) {
                          data = false;
                        }
                        if (data) {
                          var t = nb - data.nb;
                          if (t == 0) {
                            new toolTip('<span style="color: #0f0;">Success importation!</span>',4000);
                          } else {
                            new toolTip('<span style="color: #f00;">Warning importation:<br />only <b>'+Math.abs(t)+'</b> Animation SpriteSheet was imported!</span>',4000);
                          }
                        } else {
                          new toolTip('<span style="color: #f00;">Error importation!</span>',4000);
                        }
                      }
                      xhr.send(dataJSON);
                    }
                  };
                  reader.readAsDataURL(file);
                })(files[i],_this);
              }
            }
          });
          $('.UI-Create_Button-importSpriteSheet').off('click').click(function(){
            event.preventDefault();
            $('#fileUpload2').click();
            return false;
          });
          $('.UI-Create_Button-selectSpriteSheet').off('click').click(function(){
            event.preventDefault();
            resource.getAnimationSpriteSheets(function(files){
              ui.window.open({
                type: 'normal',
                id: _this.id.replace(/WINDOW_/g,'')+'_SelectSpriteSheetS',
                title: 'Select a Animation SpriteSheet',
                shadowColor: '#FFFF00',
                bodyStyle: 'background: #222;',
                x: canvas.width/2-(canvas.width*50/100)/2,
                y: canvas.height/2-(canvas.height*70/100)/2,
                w: canvas.width*50/100,
                h: canvas.height*70/100,
                onopen: function(id) {
                  for (var i in files) {
                    if (files.hasOwnProperty(i)) {
                      $('#'+id).append('<div class="UI-Create_SelectSpriteSheet-ContainerImage" onclick="ui.window.close(\''+id.replace(/^WINDOW_/g,'').replace(/_Body$/g,'')+'\');resource.setAnimationSpriteSheet(\''+files[i]+'\');"><div class="UI-Create_SelectSpriteSheet-Image" style="background: url(assets/animation/'+files[i]+') center no-repeat; background-size: contain;"></div></div>');
                    }
                  }
                }
              });
            });
            return false;
          });
        }
      },

      _Item_Edit: {
        Dataload: function(_this,c) {
          var __this = this;
          if (typeof __this.id != 'undefined') {
            var d = {
              mode: 'SELECTw',
              table: 'jaajsitem',
              where: 'id',
              whereValue: __this.id
            };
            socket.SetMysql(d,function(data){
              if (data.length > 0) {
                try {
                  __this.ItemData = JSON.parse(data[0].data);
                  new toolTip('<span style="color: #0f0;">Item: Success Load!</span>',4000);
                  c(_this,__this);
                } catch(e) {
                  $('#'+_this.idBody).html('Error load..<br />Please contact the Administrator.');
                  new toolTip('<span style="color: #f00;">Item: Error Load (bad JSON data)!</span>',4000);
                }
              } else {
                c(_this,__this);
              }
            });
          }
        },
        Datasave: function(_this) {
          var __this = this;
          //__this.name = $('#'+_this.idBody+'_CANVAS_SPRITESHEET_name').val();
          if (typeof __this.id != 'undefined') {
            if (__this.name != '') {
              if (__this.id == null) {
                var d = {
                  mode: 'INSERT',
                  table: 'jaajsitem',
                  row: {}
                };
                __this.data.Image = $('#UI-ImageItem').attr('src');
                d.row['data'] = JSON.stringify(Object.assign({},__this.data));
                socket.SetMysql(d,function(data){
                  new toolTip('<span style="color: #0f0;">Item: Success Save!</span>',4000);
                });
              } else {
                var d = {
                  mode: 'UPDATE',
                  table: 'jaajsitem',
                  where: 'id',
                  whereValue: __this.id,
                  row: {}
                };
                __this.data.Image = $('#UI-ImageItem').attr('src');
                d.row['data'] = JSON.stringify(Object.assign({},__this.data));
                socket.SetMysql(d,function(data){
                  new toolTip('<span style="color: #0f0;">Item: Success Save!</span>',4000);
                });
              }
            } else {
              new toolTip('<span style="color: #f00;">Item: Error!<br />Please give a name for this Item!</span>',4000);
            }
          }
        },
        setHTML: function(_this,args) {
          var __this = this;
          if (typeof args.id != 'undefined') {
            __this.id = args.id;
            __this.name = '#NoName';

            $('#'+_this.idBody).html('Loading..');

            __this.Dataload(_this,function(_this,__this){
              $('#'+_this.idBody).html('');
              /* Save Button */
              ui.add.button({position:'fixed',zIndex:9999,marginLeft:(_this.width-400)+'px',marginTop: '-5px'},{
                id: 'Create_AttackCreator-Edit_Save',
                text: 'Save',
                icon: 'far fa-save',
                in: _this.idBody,
                class: ['btn_yellow','btn','btn-w'],
                onClick: function(){
                  __this.Datasave(_this);
                }
              });
              ui.add.button({position:'fixed',zIndex:9999,marginLeft:(_this.width-400-$('#Create_AttackCreator-Edit_Save').width()-25)+'px',marginTop: '-5px'},{
                id: 'Create_AttackCreator-Edit_Back',
                text: 'Back',
                icon: 'fas fa-arrow-left',
                in: _this.idBody,
                class: ['btn_yellow','btn','btn-w'],
                onClick: function(){
                  _this.loadPage('Items List');
                }
              });
              $('#'+_this.idBody).append('<span style="font-size: 32px;">Item List - Edit</span><br /><br />');

              if (typeof __this.ItemData !== 'undefined') {
                __this.data = __this.ItemData;
              } else {
                __this.data = {
                  name: 'Name Of Item, Ex: Paper useless',
                  owner: {
                    hp: 0,
                    power: 0,
                    attack: 0,
                    defense: 0,
                    speed: 0
                  },
                  adverse: {
                    hp: 0,
                    power: 0,
                    attack: 0,
                    defense: 0,
                    speed: 0
                  }
                };
              }
              ui.add.button({},{
                id: 'Create_JaajCreator-Edit_DataObject',
                text: 'Edit Data Item',
                icon: 'fas fa-database',
                in: _this.idBody,
                class: ['btn_yellow','btn','btn-w'],
                onClick: function(){
                  new JSONeditor(__this.data,'_'+new Date().valueOf().toString(32),function(data){
                    __this.data = data;
                  });
                }
              });

              var HTML =
              '<br /><br />'+
              '<p>When you import a Item Image, this last one is automatically available in our server with the button "Select a Item Image!"</p><br />'+
              '<input style="display: none;" type="file" accept="image/*" name="uploads[]" id="fileUpload2">'+
              '<div class="UI-Create_Button UI-Create_Button-importSpriteSheet"><div class="UI-Create_ButtonPercentBox"></div><span style="z-index: 999;"><i class="fa fa-download"></i> Import a Item Image! (From your computer)</span></div>'+
              '<div class="UI-Create_Button UI-Create_Button-selectSpriteSheet"><span><i class="fas fa-folder-open"></i> Select a Item Image! (From our server)</span></div><br /><br />'+
              '<img id="UI-ImageItem" src="'+(__this.data.Image || '')+'" />';
              $('#'+_this.idBody).append(HTML);

              __this.startEvent(_this);
            });
          } else {
            _this.loadPage('Attacks List');
          }
        },
        startEvent: function(_this) {
          $('#fileUpload2').off('change').on('change',function(event){
            event.preventDefault();
            new toolTip('Importation en cours..',4000);
            var files = $(this).get(0).files;
            if (files.length > 0) {
              var _this = this;
              var spriteList = [];
              var listExt = {
                png:'',
                jpg:'',
                jpeg:'',
                gif:'',
                bmp:'',
                webp:'',
                svg:''
              };
              var j = 0, xhr = {}, nb = 0;
              for (var i = 0; i < files.length; i++) {
                (function(file,_this){
                  var reader = new FileReader();
                  reader.onload = function(){
                    var dataURL = reader.result;
                    var name = file.name.slice(0,file.name.lastIndexOf('.'));
                    name = 'ITEMIMAGE_'+(name.length > 16 ? name.substring(0,16) : name)+'.'+Math.random().toString(36).substring(7);
                    var ext = file.name.slice(file.name.lastIndexOf('.')+1).toLowerCase();
                    if (name != '' && ext != '' && typeof listExt[ext] != 'undefined') {
                      spriteList.push({
                        name: name+'.'+ext,
                        data: dataURL
                      });
                      nb++;
                    }
                    j++;
                    if (j > files.length-1) {
                      var dataJSON = JSON.stringify(spriteList);
                      xhr = new XMLHttpRequest();
                      xhr.open("POST", "/saveImageItemImage", true);
                      $(_this).next('div').find('.UI-Create_ButtonPercentBox').addClass('process');
                      xhr.onloadend = function (e) {
                        setTimeout(function () {
                          $(_this).next('div').find('.UI-Create_ButtonPercentBox').removeClass('process');
                          $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('width','100%');
                          setTimeout(function () {
                            $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('transition','width 0s ease');
                            setTimeout(function () {
                              $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('width','0%');
                              setTimeout(function () {
                                $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('transition','width 0.5s ease');
                              },100);
                            },100);
                          },500);
                        },500);
                        var data = e.target.response;
                        try {
                          data = JSON.parse(data);
                        } catch(e) {
                          data = false;
                        }
                        if (data) {
                          var t = nb - data.nb;
                          if (t == 0) {
                            new toolTip('<span style="color: #0f0;">Success importation!</span>',4000);
                          } else {
                            new toolTip('<span style="color: #f00;">Warning importation:<br />only <b>'+Math.abs(t)+'</b> Item Image was imported!</span>',4000);
                          }
                        } else {
                          new toolTip('<span style="color: #f00;">Error importation!</span>',4000);
                        }
                      }
                      xhr.send(dataJSON);
                    }
                  };
                  reader.readAsDataURL(file);
                })(files[i],_this);
              }
            }
          });
          $('.UI-Create_Button-importSpriteSheet').off('click').click(function(){
            event.preventDefault();
            $('#fileUpload2').click();
            return false;
          });
          $('.UI-Create_Button-selectSpriteSheet').off('click').click(function(){
            event.preventDefault();
            resource.getItemImage(function(files){
              ui.window.open({
                type: 'normal',
                id: _this.id.replace(/WINDOW_/g,'')+'_SelectSpriteSheetS',
                title: 'Select a Item Image',
                shadowColor: '#FFFF00',
                bodyStyle: 'background: #222;',
                x: canvas.width/2-(canvas.width*50/100)/2,
                y: canvas.height/2-(canvas.height*70/100)/2,
                w: canvas.width*50/100,
                h: canvas.height*70/100,
                onopen: function(id) {
                  for (var i in files) {
                    if (files.hasOwnProperty(i)) {
                      $('#'+id).append('<div class="UI-Create_SelectSpriteSheet-ContainerImage" onclick="ui.window.close(\''+id.replace(/^WINDOW_/g,'').replace(/_Body$/g,'')+'\');$(\'#UI-ImageItem\').attr(\'src\',\'assets/item/'+files[i]+'\');"><div class="UI-Create_SelectSpriteSheet-Image" style="background: url(assets/item/'+files[i]+') center no-repeat; background-size: contain;"></div></div>');
                    }
                  }
                }
              });
            });
            return false;
          });
        }
      },

      _Jaaj_Edit: {
        modelHTML: function(param,i) {
          return '<div class="UI-Create_Mob_Button" data-i="'+i+'" data-name="'+param.name+'"><span>'+(param.name == null ? '[Click Here to Edit]' : param.name)+'</span></div>';
        },
        Dataload: function(_this,c) {
          var __this = this;
          if (typeof __this.id != 'undefined') {
            var d = {
              mode: 'SELECTw',
              table: 'jaajs',
              where: 'id',
              whereValue: __this.id
            };
            socket.SetMysql(d,function(data){
              if (data.length > 0) {
                try {
                  var currentJaaj = data[0];
                  __this.evolutionData = JSON.parse(currentJaaj.evolutionData);
                  new toolTip('<span style="color: #0f0;">Jaaj: Success Load!</span>',4000);
                  c(_this,__this);
                } catch (e) {
                  $('#'+_this.idBody).html('Error load..<br />Please contact the Administrator.');
                  new toolTip('<span style="color: #f00;">Mob: Error Load (bad JSON data)!</span>',4000);
                }
              } else {
                c(_this,__this);
              }
            });
          }
        },
        setHTML: function(_this,args) {
          var __this = this;
          if (typeof args.id != 'undefined') {
            __this.args = args;
            __this.id = args.id;
            __this.evolutionData = {};
            $('#'+_this.idBody).html('Loading..');
            __this.Dataload(_this,function(_this,__this){
              var HTML = '<span style="font-size: 32px;">Jaaj Editor</span><br />';
              for (var i in __this.evolutionData) {
                if (__this.evolutionData.hasOwnProperty(i)) {
                  HTML += __this.modelHTML(__this.evolutionData[i],i);
                }
              }
              HTML += '<div class="UI-Create_Mob_Add"><span><i class="fa fa-plus"></i> Add a Evolution!</span></div>';
              $('#'+_this.idBody).html(HTML);
              __this.startEvent(_this);
            });
          } else {
            _this.loadPage('Jaajs List');
          }
        },
        startEvent: function(_this) {
          var __this = this;

          $('.UI-Create_Mob_Add').off('click').click(function(){
            $(__this.modelHTML({name:null},null)).insertBefore($(this));
            __this.startEvent(_this);
          });
          $('.UI-Create_Mob_Button').off('click').click(function(){
            _this.loadPage(' Jaaj Edit Evolution',{args:__this.args,evolutionData:__this.evolutionData,i:$(this).data('i')});
          });
        }
      },
      _Jaaj_Edit_Evolution: {
        Datasave: function(_this) {
          var __this = this;
          __this.data['imagePath'] = resource.jaajSrc;
          __this.evolutionData[__this.i] = __this.data;
          if (__this.args.id == null) {
            //INSERT
            var d = {
              mode: 'INSERT',
              table: 'jaajs',
              row: {}
            };
            d.row['evolutionData'] = JSON.stringify(__this.evolutionData);
            socket.SetMysql(d,function(data){
              new toolTip('<span style="color: #0f0;">Jaaj: Success Save!</span>',4000);
            });
          } else {
            //UPDATE
            var d = {
              mode: 'UPDATE',
              table: 'jaajs',
              where: 'id',
              whereValue: __this.args.id,
              row: {}
            };
            d.row['evolutionData'] = JSON.stringify(__this.evolutionData);
            socket.SetMysql(d,function(data){
              new toolTip('<span style="color: #0f0;">Jaaj: Success Save!</span>',4000);
            });
          }
        },
        setHTML: function(_this,data) {
          var __this = this;
          __this.args = data.args;
          __this.evolutionData = data.evolutionData;
          __this.i = data.i;
          if (__this.evolutionData == null) {
            __this.evolutionData = {};
          } else {
            try {
              __this.evolutionData = JSON.parse(data.evolutionData);
            } catch (e) {}
          }
          if (__this.i == null) {
            __this.i = Object.keys(__this.evolutionData).length;
          }
          $('#'+_this.idBody).html('');
          /* Save Button */
          ui.add.button({position:'fixed',zIndex:9999,marginLeft:(_this.width-400)+'px',marginTop: '-5px'},{
            id: 'Create_JaajCreator-Edit_Save',
            text: 'Save',
            icon: 'far fa-save',
            in: _this.idBody,
            class: ['btn_yellow','btn','btn-w'],
            onClick: function(){
              __this.Datasave(_this);
            }
          });
          ui.add.button({position:'fixed',zIndex:9999,marginLeft:(_this.width-400-$('#Create_JaajCreator-Edit_Save').width()-25)+'px',marginTop: '-5px'},{
            id: 'Create_JaajCreator-Edit_Back',
            text: 'Back',
            icon: 'fas fa-arrow-left',
            in: _this.idBody,
            class: ['btn_yellow','btn','btn-w'],
            onClick: function(){
              _this.loadPage(' Jaaj Edit',__this.args);
            }
          });
          $('#'+_this.idBody).append('<span style="font-size: 32px;">Jaaj Evolution Editor</span>');
          if (typeof __this.evolutionData[__this.i] !== 'undefined') {
            __this.data = __this.evolutionData[__this.i];
          } else {
            if (__this.i == 0) {
              __this.data = {
                name: 'Name Of Jaaj, Ex: Bitenbois',
                lvlLMinToNextEvolution: 'Minimum Lvl to Next Evolution if the Next Evolution exist',
                hp: 'Health Point',
                Type: 'Type of Jaaj, please see the list of available type in the TypeList\'s menu',
                orientation: '1 or -1',
                attack: 0,
                speed: 0,
                defense: 0
              };
            } else {
              __this.data = {
                name: 'Name Of Jaaj, Ex: Bitenbois',
                lvlLMinToNextEvolution: 'Minimum Lvl to Next Evolution if the Next Evolution exist',
                Type: 'Type of Jaaj, please see the list of available type in the TypeList\'s menu',
                orientation: '1 or -1',
              };
            }
          }
          /*
          for (var i in __this.data) {
            if (__this.data.hasOwnProperty(i)) {
              var value = '';
              if (typeof __this.evolutionData[__this.i] != 'undefined') {
                if (typeof __this.evolutionData[__this.i][i] != 'undefined') {
                  value = __this.evolutionData[__this.i][i];
                }
              }
              ui.add.input({
                div: {
                  margin: '5px'
                },
                input: {
                  width: '50%',
                  height: '26px'
                },
                text: {
                  background: '#ddd',
                  color: '#222'
                }
              },{
                id: _this.idBody+'_FORM_'+i,
                text: i,
                value:  value,
                in: _this.idBody,
                class: ['UI-input']
              });
            }
          }
          */
          ui.add.button({},{
            id: 'Create_JaajCreator-Edit_DataObject',
            text: 'Edit Data (Name,Force,Intelligence..)',
            icon: 'fas fa-database',
            in: _this.idBody,
            class: ['btn_yellow','btn','btn-w'],
            onClick: function(){
              new JSONeditor(__this.data,'_'+new Date().valueOf().toString(32),function(data){
                __this.data = data;
              });
            }
          });
          var src = '';
          if (typeof __this.evolutionData[__this.i] != 'undefined') {
            if (typeof __this.evolutionData[__this.i]['imagePath'] != 'undefined') {
              src = __this.evolutionData[__this.i]['imagePath'];
              resource.jaajSrc = src;
            }
          }
          $('#'+_this.idBody).append(
            '<br /><br />'+
            '<br /><br />'+
            '<p>When you import a Jaaj\'s image, this last one is automatically available in our server with the button "Select a Jaaj!"</p><br />'+
            '<input style="display: none;" type="file" accept="image/*" name="uploads[]" id="fileUpload2">'+
            '<div class="UI-Create_Button UI-Create_Button-importSpriteSheet"><div class="UI-Create_ButtonPercentBox"></div><span style="z-index: 999;"><i class="fa fa-download"></i> Import a Jaaj! (From your computer)</span></div>'+
            '<div class="UI-Create_Button UI-Create_Button-selectSpriteSheet"><span><i class="fas fa-folder-open"></i> Select a Jaaj! (From our server)</span></div><br /><br />'+
            '<img class="UI-Create-ImageJaaj" src="assets/jaajs/'+src+'" />'
          );
          __this.startEvent(_this);
        },
        startEvent: function(_this) {
          $('#fileUpload2').off('change').on('change',function(event){
            event.preventDefault();
            new toolTip('Importation en cours..',4000);
            var files = $(this).get(0).files;
            if (files.length > 0) {
              var _this = this;
              var jaajList = [];
              var listExt = {
                png:'',
                jpg:'',
                jpeg:'',
                gif:'',
                bmp:'',
                webp:'',
                svg:''
              };
              var j = 0, xhr = {}, nb = 0;
              for (var i = 0; i < files.length; i++) {
                (function(file,_this){
                  var reader = new FileReader();
                  reader.onload = function(){
                    var dataURL = reader.result;
                    var name = file.name.slice(0,file.name.lastIndexOf('.'));
                    name = 'JAAJ_'+(name.length > 16 ? name.substring(0,16) : name)+'.'+Math.random().toString(36).substring(7);
                    var ext = file.name.slice(file.name.lastIndexOf('.')+1).toLowerCase();
                    if (name != '' && ext != '' && typeof listExt[ext] != 'undefined') {
                      jaajList.push({
                        name: name+'.'+ext,
                        data: dataURL
                      });
                      nb++;
                    }
                    j++;
                    if (j > files.length-1) {
                      var dataJSON = JSON.stringify(jaajList);
                      xhr = new XMLHttpRequest();
                      xhr.open("POST", "/saveImageJaaj", true);
                      $(_this).next('div').find('.UI-Create_ButtonPercentBox').addClass('process');
                      xhr.onloadend = function (e) {
                        setTimeout(function () {
                          $(_this).next('div').find('.UI-Create_ButtonPercentBox').removeClass('process');
                          $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('width','100%');
                          setTimeout(function () {
                            $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('transition','width 0s ease');
                            setTimeout(function () {
                              $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('width','0%');
                              setTimeout(function () {
                                $(_this).next('div').find('.UI-Create_ButtonPercentBox').css('transition','width 0.5s ease');
                              },100);
                            },100);
                          },500);
                        },500);
                        var data = e.target.response;
                        try {
                          data = JSON.parse(data);
                        } catch(e) {
                          data = false;
                        }
                        if (data) {
                          var t = nb - data.nb;
                          if (t == 0) {
                            new toolTip('<span style="color: #0f0;">Success importation!</span>',4000);
                          } else {
                            new toolTip('<span style="color: #f00;">Warning importation:<br />only <b>'+Math.abs(t)+'</b> Jaaj was imported!</span>',4000);
                          }
                        } else {
                          new toolTip('<span style="color: #f00;">Error importation!</span>',4000);
                        }
                      }
                      xhr.send(dataJSON);
                    }
                  };
                  reader.readAsDataURL(file);
                })(files[i],_this);
              }
            }
          });
          $('.UI-Create_Button-importSpriteSheet').off('click').click(function(){
            event.preventDefault();
            $('#fileUpload2').click();
            return false;
          });
          $('.UI-Create_Button-selectSpriteSheet').off('click').click(function(){
            event.preventDefault();
            resource.getJaajs(function(files){
              ui.window.open({
                type: 'normal',
                id: _this.id.replace(/WINDOW_/g,'')+'_SelectSpriteSheetS',
                title: 'Select a Jaaj',
                shadowColor: '#FFFF00',
                bodyStyle: 'background: #222;',
                x: canvas.width/2-(canvas.width*50/100)/2,
                y: canvas.height/2-(canvas.height*70/100)/2,
                w: canvas.width*50/100,
                h: canvas.height*70/100,
                onopen: function(id) {
                  for (var i in files) {
                    if (files.hasOwnProperty(i)) {
                      $('#'+id).append('<div class="UI-Create_SelectSpriteSheet-ContainerImage" onclick="ui.window.close(\''+id.replace(/^WINDOW_/g,'').replace(/_Body$/g,'')+'\');$(\'.UI-Create-ImageJaaj\').attr(\'src\',\'assets/jaajs/'+files[i]+'\');resource.jaajSrc = \''+files[i]+'\';"><div class="UI-Create_SelectSpriteSheet-Image" style="background: url(assets/jaajs/'+files[i]+') center no-repeat; background-size: contain;"></div></div>');
                    }
                  }
                }
              });
            });
            return false;
          });
        }
      },
    /* End: Sub Menu */

    Achievement: {
      modelHTML: function(param) {
        return '<div style="position: relative;">'+
          '<div class="UI-Create_Achievement_Info">'+
            '<div class="UI-Create_Achievement_Info-NB UI-Create_Achievement_Info-d" style="margin-left: 5px;">'+param.id+'</div>'+
            '<div class="UI-Create_Achievement_Info-ID UI-Create_Achievement_Info-d" style="float: right; margin-right: 5px;">#<input class="UI-Create_Achievement_input UI-Create_Achievement_input-EVENT" data-id="'+param.id+'" data-info="'+param.idAchievement+'" data-row="idAchievement" value="'+(param.idAchievement == null ? 'AN_ID_HERE' : param.idAchievement)+'"/><div style="display: none; font-size: 16px; font-family: \'Raleway\', sans-serif;"></div></div>'+
          '</div>'+
          '<div class="UI-Create_Achievement_Delete"><i class="fa fa-times"></i></div>'+
          '<div class="UI-Create_Achievement">'+
            '<div class="UI-Create_Achievement_Icon">'+
              '<i class="fas fa-trophy"></i>'+
            '</div>'+
            '<span class="UI-Create_Achievement_Message"><input class="UI-Create_Achievement_input UI-Create_Achievement_input-EVENT" data-id="'+param.id+'" data-info="'+param.message+'" data-row="message" value="'+(param.message == null ? 'PUT YOUR ACHIEVEMENT MESSAGE HERE!' : param.message)+'"/><div style="display: none; font-size: 16px; font-family: \'Raleway\', sans-serif;"></div></span>'+
          '</div>'+
        '</div>';
      },
      setHTML: function(_this) {
        var __this = this;
        var HTML = '<span style="font-size: 32px;">Achievement</span>';
        socket.SetMysql({
          mode: 'SELECT',
          table: 'achievements'
        },function(data){
          for (var i = 0; i < data.length; i++) {
            HTML += __this.modelHTML(data[i]);
          }
          HTML += '<div class="UI-Create_Achievement_Add"><span><i class="fa fa-plus"></i> Add an Achievement!</span></div>';
          $('#'+_this.idBody).html(HTML);
          __this.startEvent(_this);
        });
      },
      startEvent: function(_this) {
        var __this = this;
        function InputAchievementID(event) {
          if (event.keyCode == 13 && event.type=="keyup") {
            var value = $(this).val();
            var idM = $(this).data('id');
            var avalue = $(this).data('info');
            var row = $(this).data('row');
            if (value != '') {
              if (idM == '') {
                socket.SetMysql({
                  mode: 'SELECTw',
                  table: 'achievements',
                  where: row,
                  whereValue: value
                }, function(data) {
                  if (data.length == 0) {
                    var d = {
                      mode: 'INSERT',
                      table: 'achievements',
                      where: row,
                      whereValue: avalue,
                      row: {}
                    };
                    d.row[row] = value;
                    socket.SetMysql(d,function(data){new toolTip('<span style="color: #0f0;">Success Create!</span>',4000);_this.loadPage('Achievement');});
                  } else {
                    new toolTip('<span style="color: #f00;">This ID Already Exist!</span>',4000);
                  }
                });
              } else {
                socket.SetMysql({
                  mode: 'SELECTw',
                  table: 'achievements',
                  where: row,
                  whereValue: value
                }, function(data) {
                  if (data.length == 0) {
                    var d = {
                      mode: 'UPDATE',
                      table: 'achievements',
                      where: 'id',
                      whereValue: idM,
                      row: {}
                    };
                    d.row[row] = value;
                    socket.SetMysql(d,function(data){new toolTip('<span style="color: #0f0;">Success Create!</span>',4000);_this.loadPage('Achievement');});
                  } else {
                    new toolTip('<span style="color: #f00;">This ID Already Exist!</span>',4000);
                  }
                });
              }
            }
          } else {
            $(this).next('div').html($(this).val().replace(/ /g,'&nbsp;')+'A');
            $(this).width($(this).next('div').width());
          }
        };
        $('.UI-Create_Achievement_input-EVENT').off('keyup').keyup(InputAchievementID);
        $('.UI-Create_Achievement_input-EVENT').off('keydown').keydown(InputAchievementID);
        $('.UI-Create_Achievement_Delete').off('click').click(function(){
          var _this = this;
          if ($(this).parent().find('.UI-Create_Achievement_Info-NB').text() != '') {
            socket.SetMysql({
              mode: 'DELETE',
              table: 'achievements',
              where: 'id',
              whereValue: $(this).parent().find('.UI-Create_Achievement_Info-NB').text()
            },function(data){
              new toolTip('<span style="color: #0f0;">Success!</span>',4000);
              $(_this).parent().remove();
            });
          } else {
            $(this).parent().remove();
          }
        });
        $('.UI-Create_Achievement_Add').off('click').click(function(){
          $(__this.modelHTML({id:'',idAchievement:null,message:null})).insertBefore($(this));
          __this.startEvent(_this);
        });
      }
    },
    Mob: {
      modelHTML: function(param) {
        return '<div class="UI-Create_Mob_Button" data-id="'+param.id+'" data-name="'+param.name+'"><span>'+(param.name == null ? '[Click Here to Edit]' : param.name)+'</span></div>';
      },
      setHTML: function(_this) {
        var __this = this;
        var HTML = '<span style="font-size: 32px;">Mob Creator</span>';
        socket.SetMysql({
          mode: 'SELECT',
          table: 'mobs_constructor'
        },function(data){
          for (var i = 0; i < data.length; i++) {
            HTML += __this.modelHTML(data[i]);
          }
          HTML += '<div class="UI-Create_Mob_Add"><span><i class="fa fa-plus"></i> Add a Mob!</span></div>';
          $('#'+_this.idBody).html(HTML);
          __this.startEvent(_this);
        });
      },
      startEvent: function(_this) {
        var __this = this;
        $('.UI-Create_Mob_Button').off('click').click(function(){
          _this.loadPage(' Mob Edit',{id:$(this).data('id')});
        });
        $('.UI-Create_Mob_Add').off('click').click(function(){
          $(__this.modelHTML({name:null,id:null})).insertBefore($(this));
          __this.startEvent(_this);
        });
      }
    },
    Jaajs_List: {
      modelHTML: function(param) {
        var imagePath = '';
        if (param.evolutionData != null) {
          try {
            var evolutionData = JSON.parse(param.evolutionData);
            if (typeof evolutionData[0] != 'undefined') {
              imagePath = evolutionData[0].imagePath;
            }
          } catch (e) {}
        }
        if (imagePath == '') {
          return '<div class="UI-Create_Jaaj" data-id="'+param.id+'" style="border: 1px solid #ff0; background: #ff0;"></div>'
        } else {
          return '<div class="UI-Create_Jaaj" data-id="'+param.id+'" style="border: 1px solid #ff0; background: url(assets/jaajs/'+imagePath+') no-repeat center; background-size: contain;"></div>'
        }
      },
      setHTML: function(_this) {
        var __this = this;
        var HTML = '<span style="font-size: 32px;">Jaaj Creator</span><br />';
        socket.SetMysql({
          mode: 'SELECT',
          table: 'jaajs'
        },function(data){
          for (var i = 0; i < data.length; i++) {
            HTML += __this.modelHTML(data[i]);
          }
          HTML += '<div class="UI-Create_Mob_Add"><span><i class="fa fa-plus"></i> Add a Jaaj!</span></div>';
          $('#'+_this.idBody).html(HTML);
          __this.startEvent(_this);
        });
      },
      startEvent: function(_this) {
        var __this = this;
        $('.UI-Create_Mob_Add').off('click').click(function(){
          $(__this.modelHTML({id:null,evolutionData:null})).insertBefore($(this));
          __this.startEvent(_this);
        });
        $('.UI-Create_Jaaj').off('click').click(function(){
          _this.loadPage(' Jaaj Edit',{id:$(this).data('id')});
        });
      }
    },
    Attacks_List: {
      modelHTML: function(param) {
        return '<div class="UI-Create_Mob_Button" data-id="'+param.id+'" data-name="'+param.name+'"><div style="position: absolute; top: 50%; left: 5px; color: #f00; transform: translateY(-50%)">'+(param.name == null ? '' : 'ID:'+param.id)+'</div><span>'+(param.name == null ? '[Click Here to Edit]' : param.name)+'</span></div>';
      },
      setHTML: function(_this) {
        var __this = this;
        var HTML = '<span style="font-size: 32px;">Attacks List</span>';
        socket.SetMysql({
          mode: 'SELECT',
          table: 'jaajsattack'
        },function(data){
          for (var i = 0; i < data.length; i++) {
            var param = data[i];
            param.name = (JSON.parse(param.data)).name;
            HTML += __this.modelHTML(param);
          }
          HTML += '<div class="UI-Create_Mob_Add"><span><i class="fa fa-plus"></i> Add a Attack!</span></div>';
          $('#'+_this.idBody).html(HTML);
          __this.startEvent(_this);
        });
      },
      startEvent: function(_this) {
        var __this = this;
        $('.UI-Create_Mob_Button').off('click').click(function(){
          _this.loadPage(' Attack Edit',{id:$(this).data('id')});
        });
        $('.UI-Create_Mob_Add').off('click').click(function(){
          $(__this.modelHTML({name:null,id:null})).insertBefore($(this));
          __this.startEvent(_this);
        });
      }
    },
    Types_List: {
      Datasave: function() {
        var __this = this;
        var d = {
          mode: 'UPDATE',
          table: 'jaajstype',
          where: 'id',
          whereValue: '1',
          row: {}
        };
        d.row['data'] = JSON.stringify(__this.data);
        socket.SetMysql(d,function(data){
          new toolTip('<span style="color: #0f0;">Type: Success Save!</span>',4000);
        });
      },
      tableConstuctor: function(obj){
        var HTML = '<table>';

        var arrayType = [];

        //BUILD HEADER
        HTML += '<tr><td><b>Type<b/></td>';
        for (var type in obj) {
          if (obj.hasOwnProperty(type)) {
            HTML += '<td style="background: '+(obj[type].color || '#fff')+';"><b>'+type+'</b></td>';
            arrayType.push(type);
          }
        }
        HTML += '</tr>';

        //BUILD BODY
        for (var type in obj) {
          if (obj.hasOwnProperty(type)) {
            HTML += '<tr><td style="background: '+(obj[type].color || '#fff')+';"><b>'+type+'</b></td>';
            for (var i = 0; i < arrayType.length; i++) {
              if (typeof obj[type][arrayType[i]] !== 'undefined') {
                var nb = parseFloat(obj[type][arrayType[i]]);
                HTML += '<td'+(nb > 1 ? ' style="background:#0f0"' : nb == 0 ? ' style="background:#000;color:#fff;"' : nb < 1 ? ' style="background:#f00"' : '')+'>'+obj[type][arrayType[i]]+'</td>';
              } else {
                HTML += '<td>1.0</td>';
              }
            }
            HTML += '</tr>';
          }
        }

        return HTML+'</table>';
      },
      setHTML: function(_this) {
        var __this = this;
        $('#'+_this.idBody).html('loading............');
        socket.SetMysql({
          mode: 'SELECT',
          table: 'jaajstype'
        },function(data){
          __this.data = JSON.parse(data[0].data);
          $('#'+_this.idBody).html('');
          ui.add.button({position:'fixed',zIndex:9999,marginLeft:(_this.width-400)+'px',marginTop: '-5px'},{
            id: 'Create_TypeCreator-Edit_Save',
            text: 'Save',
            icon: 'far fa-save',
            in: _this.idBody,
            class: ['btn_yellow','btn','btn-w'],
            onClick: function(){
              __this.Datasave(_this);
            }
          });
          $('#'+_this.idBody).append('<span style="font-size: 32px;">Types List</span><br /><br />');
          ui.add.button({},{
            id: 'Create_JaajCreator-Edit_DataObject',
            text: 'Edit Data Type',
            icon: 'fas fa-database',
            in: _this.idBody,
            class: ['btn_yellow','btn','btn-w'],
            onClick: function(){
              new JSONeditor(__this.data,'_'+new Date().valueOf().toString(32),function(data){
                __this.data = data;
                $('#__tableIDType').html(__this.tableConstuctor(data));
              });
            }
          });
          $('#'+_this.idBody).append('<br /><br /><div class="TableContainer" id="__tableIDType" style="overflow-x: auto; width: 100%;"></div><br /><br />');
          $('#__tableIDType').html(__this.tableConstuctor(__this.data));
          ui.add.button({},{
            id: 'Create_JaajCreator-Edit_AddDataObject',
            text: 'Add Type',
            icon: 'fas fa-add',
            in: _this.idBody,
            class: ['btn_yellow','btn','btn-w'],
            onClick: function(){
              new JSONeditor({
                "Name Of Type, ex: Normal": {
                  color: '#fff'
                }
              },'_'+new Date().valueOf().toString(32),function(data){
                __this.data[Object.keys(data)[0]] = data[Object.keys(data)[0]];
                $('#__tableIDType').html(__this.tableConstuctor(__this.data));
              });
            }
          });
        });
      }
    },
    Items_List: {
      modelHTML: function(param) {
        return '<div class="UI-Create_Mob_Button" data-id="'+param.id+'" data-name="'+param.name+'"><div style="position: absolute; top: 50%; left: 5px; color: #f00; transform: translateY(-50%)">'+(param.name == null ? '' : 'ID:'+param.id)+'</div><span>'+(param.name == null ? '[Click Here to Edit]' : param.name)+'</span></div>';
      },
      setHTML: function(_this) {
        var __this = this;
        var HTML = '<span style="font-size: 32px;">Items List</span>';
        socket.SetMysql({
          mode: 'SELECT',
          table: 'jaajsitem'
        },function(data){
          for (var i = 0; i < data.length; i++) {
            var param = data[i];
            param.name = (JSON.parse(param.data)).name;
            HTML += __this.modelHTML(param);
          }
          HTML += '<div class="UI-Create_Mob_Add"><span><i class="fa fa-plus"></i> Add a Item!</span></div>';
          $('#'+_this.idBody).html(HTML);
          __this.startEvent(_this);
        });
      },
      startEvent: function(_this) {
        var __this = this;
        $('.UI-Create_Mob_Button').off('click').click(function(){
          _this.loadPage(' Item Edit',{id:$(this).data('id')});
        });
        $('.UI-Create_Mob_Add').off('click').click(function(){
          $(__this.modelHTML({name:null,id:null})).insertBefore($(this));
          __this.startEvent(_this);
        });
      }
    },


    //Paint
    __Image: {},
    //Noel, nouvelle année, promo etc....
    __Event: {},
    __System_Fight: {}
  },
  create: function() {
    var _this = this;
    this.window = ui.window.open({
      type: 'normal',
      id: 'Create',
      title: 'Create',
      shadowColor: '#FFFF00',
      closeb: true,
      bodyStyle: 'overflow: hidden; background: #222;',
      x: canvas.width/2-(canvas.width*70/100)/2,
      y: canvas.height/2-(canvas.height*80/100)/2,
      w: canvas.width*70/100,
      h: canvas.height*80/100,
      onopen: function(id) {
        _this.id = id;
        _this.width = canvas.width*70/100;
        _this.idBody = id+'_CreateBody';
        var MENU_HTML = '';
        var MENU_NB = 0;
        for (var i = 0; i < Object.keys(_this.List).length; i++) {
          if (Object.keys(_this.List)[i].substring(0,1) != '_') {
            MENU_HTML += '<div class="UI-Create-btn '+(MENU_NB==0?'active':'')+'" data-page="'+Object.keys(_this.List)[i].replace(/_/g,' ')+'"><span>'+Object.keys(_this.List)[i].replace(/_/g,' ')+'</span></div>'
            MENU_NB++;
          } else if (Object.keys(_this.List)[i].substring(1,2) == '_') {
            MENU_HTML += '<div class="UI-Create-btn inactive" data-page="'+Object.keys(_this.List)[i].replace(/_/g,' ')+'"><span>'+Object.keys(_this.List)[i].substring(2).replace(/_/g,' ')+'</span></div>'
          }
        }
        $('#'+id).append(
          '<div class="UI-Create-Container-Btn">'+
            MENU_HTML+
          '</div>'+
          '<div id="'+id+'_CreateBodyC" class="UI-Create-Body">'+
            '<div id="'+id+'_CreateBody" style="margin: 13px 50px;"></div>'+
          '</div>'
        );
        $('#'+id+'_CreateBodyC').off('mousewheel touchmove').on('mousewheel touchmove',function(event){
          if (ui.HoverCanvas) {
            event.preventDefault();
          }
        });
        $('.UI-Create-btn').click(function(){
          $('.UI-Create-btn').removeClass('active');
          $(this).addClass('active');
          _this.loadPage($(this).data('page'));
        });
        _this.loadPage('Achievement');
      }
    });
  },
  loadPage: function(name,args) {
    args = args || {};
    var nameObj = name.replace(/ /g,'_');
    if (typeof this.List[nameObj] != 'undefined') {
      this.List[nameObj].setHTML(this,args);
    } else {
      return false;
    }
  }
};


function Editor() {
  this.dataList = [];
  this.dataJSON = '';
  this.total = 0;
  this.loadCount = 0;
  this.loaded = 0;
  this.percent = 0;
  this.xhrsave = {};
  this.xhrload = {};
  this.inUse = false;
  window['editor'] = this;
};
Editor.prototype = {
  setDataJSON: function(object,n) {
    var json = n ? '' : '{';
    try {
      var nb = Object.keys(object).length;
      var k = 0;
      for (var i in object) {
        if (object.hasOwnProperty(i)) {
          var s = k+1>=nb ? '' : ',';
          if (typeof object[i] == 'object') {
            if (typeof object[i].src != 'undefined') {
              json += '"'+i+'":{"src":"'+object[i].src+'"}'+s;
            } else {
              json += '"'+i+'":{'+editor.setDataJSON(object[i],1)+'}'+s;
            }
          } else {
            json += '"'+i+'":"'+object[i]+'"'+s;
          }
        }
        k++;
      }
    } catch (e) {}
    json += n ? '' : '}';
    return json;
  },
  getDataJSON: function(dataName,b) {
    var viewWidth = canvas.width/world.zoom,
        viewHeight = canvas.height/world.zoom;

    var nbAreaWidth = Math.ceil(viewWidth/1000)+1,
        nbAreaHeight = Math.ceil(viewHeight/1000)+1;

    var nbArea = (nbAreaWidth*nbAreaHeight)+2;

    var currentPos = world.getRelativeXY();

    var listZone = [];

    for (var x = Math.floor(-nbAreaWidth/2); x < Math.ceil(nbAreaWidth/2)+2; x++) {
      for (var y = Math.floor(-nbAreaHeight/2); y < Math.ceil(nbAreaHeight/2)+2; y++) {
        var realX = x+currentPos.x,
            realY = y+currentPos.y;

        realX = realX==0?0:realX,
        realY = realY==0?0:realY;

        var area = '['+realX+','+realY+']'+world.currentMap;

        listZone.push(area);
      }
    }

    var listFileJSON = [];
    for (var i = 0; i < listZone.length; i++) {
      for (var j = 0; j < dataName.length; j++) {
        if (typeof window[dataName[j].toLowerCase()].data[listZone[i]] == 'undefined') {
          listFileJSON.push({name:listZone[i]+'_'+dataName[j]+'.json',area:listZone[i]});
          window[dataName[j].toLowerCase()].data[listZone[i]] = {inLoad:true};
        }
      }
    }

    if (listFileJSON.length==0) {
      return false;
    } else {
      if (b) {
        return listFileJSON;
      } else {
        return JSON.stringify(listFileJSON);
      }
    }
  },

  lengthInUtf8Bytes: function(str) {
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
  },

  send: function(settings) {
    this.xhrsave[settings.index] = new XMLHttpRequest();
    this.xhrsave[settings.index].open("POST", "/saveObjectJson", true);
    this.xhrsave[settings.index].upload.onprogress = function (e) {
      if (e.lengthComputable) {
        editor.percent = Math.floor(((parseInt(editor.loaded)+parseInt(e.loaded)) / parseInt(editor.total)) * 100);
        settings.onprogress(editor.percent+'%');
      }
    }
    this.xhrsave[settings.index].upload.onloadstart = function (e) {
        //console.log('start:0%');
    }
    this.xhrsave[settings.index].upload.onloadend = function (e) {
      editor.loaded += parseInt(e.loaded);
      settings.index++;
      if (settings.index < settings.arraydata.length) {
        settings.currentData = settings.arraydata[settings.index];
        editor.send(settings);
      } else {
        settings.onend(editor.loaded,editor.total);
      }
    }
    this.xhrsave[settings.index].send(settings.currentData);
  },
  get: function(settings) {
    var xhrl = [];
    for (var i = 0; i < settings.data.length; i++) {
      (function(i){
        xhrl[i] = new XMLHttpRequest();
        xhrl[i].open("POST", "/getObjectJson", true);
        xhrl[i].onloadend = function (e) {
          var data = e.target.response;
          try {
            data = JSON.parse(data);
          } catch(e) {
            data = false;
          }
          editor.loadCount++;
          settings.onend(data,editor.loadCount,settings.data.length,settings.data[i]);
        };
        xhrl[i].send(JSON.stringify([settings.data[i].name]));
      })(i);
    }
  },
  gettmp: function(settings) {
    var xhrl = new XMLHttpRequest();
    xhrl.open("POST", "/getObjectJson", true);
    xhrl.onloadend = function (e) {
      var data = e.target.response;
      try {
        data = JSON.parse(data);
      } catch(e) {
        data = false;
      }
      editor.loadCount++;
      settings.onend(data);
    };
    xhrl.send(settings.data);
  },

  save: function(area,c) {
    if (!this.inUse) {
      this.reset();
      this.dataList = [
        this.setDataJSON(resource.data[area])
        //this.setDataJSON(map.data[area])
      ];
      this.dataList[0] = '{"area":"'+area+'","name":"Resource","extension":"json","data":'+this.dataList[0]+'}';
      //this.dataList[1] = '{"area":"'+area+'","name":"Map","extension":"json","data":'+this.dataList[1]+'}';
      for (var i = 0, len = this.dataList.length; i < len; i++) {
        this.total += this.lengthInUtf8Bytes(this.dataList[i]);
      }
      this.send({
        area: area,
        currentData:this.dataList[0],
        index:0,
        arraydata:this.dataList,
        onprogress: function(percent) {
          //console.log(percent);
        },
        onend: function(loaded,total) {
          if (typeof c != 'function') {
            if (loaded < total) {
              new toolTip('<span style="color: #f00;">Error save!</span>',4000);
            } else {
              new toolTip('<span style="color: #0f0;">Success save!</span>',4000);
            }
          }
          editor.inUse = false;
          window.onchangearea();
          if (typeof c == 'function') {c();}
        }
      });
    }
  },
  load: function(dataName,callback) {
    function next() {
      socket.SetMysql({
        mode: 'SELECT',
        table: 'jaajs'
      },function(data){
        var tmp_jaajList = data;
        jaajList = {};
        for (var i = 0; i < tmp_jaajList.length; i++) {
          jaajList[tmp_jaajList[i].id] = JSON.parse(tmp_jaajList[i].evolutionData);
        }
        socket.SetMysql({
          mode: 'SELECT',
          table: 'jaajsattack'
        },function(data){
          var tmp_attackList = data;
          attackList = {};
          for (var i = 0; i < tmp_attackList.length; i++) {
            attackList[tmp_attackList[i].id] = JSON.parse(tmp_attackList[i].data);
          }
          socket.SetMysql({
            mode: 'SELECT',
            table: 'jaajstype'
          },function(data){
            typeDataList = JSON.parse(data[0].data);
            socket.SetMysql({
              mode: 'SELECT',
              table: 'mobs_constructor'
            },function(data){
              mobs_constructorList = {};
              for (var i in data) {
                if (data.hasOwnProperty(i)) {
                  mobs_constructorList[data[i].name] = JSON.parse(data[i].data);
                }
              }
              socket.SetMysql({
                mode: 'SELECT',
                table: 'jaajsitem'
              },function(data){
                var tmp_itemList = data;
                itemList = {};
                for (var i = 0; i < tmp_itemList.length; i++) {
                  itemList[tmp_itemList[i].id] = JSON.parse(tmp_itemList[i].data);
                }
                if (callback) callback();
              });
            });
          });
        });
      });
    };
    if (!this.inUse) {
      this.reset();
      this.dataJSON = this.getDataJSON(dataName,true);
      if (!this.dataJSON) {
        next();
      } else {
        this.get({
          data: this.dataJSON,
          onend: function(data,index,total,name) {
            if (!data) {
              delete resource.data[name.area].inLoad;
              resource.data[name.area].inError = true;
              return new toolTip('<span style="color: #f00;">Impossible to load DATA from server!</span>');
              if (index >= total) {next();}
            } else if (Object.keys(data).length == 0) {
              delete resource.data[name.area].inLoad;
              resource.data[name.area].noData = true;
              if (index >= total) {next();}
            } else {
              for (var i in data) {
                if (data.hasOwnProperty(i)) {
                  (function(data,i,next){
                    var isplit = [i.substring(0,i.lastIndexOf('_')),i.substring(i.lastIndexOf('_')+1,i.length-1)];
                    var area = isplit[0];
                    var object = (isplit[isplit.length-1].split('.'))[0].toLowerCase();
                    for (var j in data[i]) {
                      if (data[i].hasOwnProperty(j)) {
                        if (typeof data[i][j].ready != 'undefined') {
                          (function(object,data,i,j){
                            data[i][j].ready = false;
                            data[i][j].exist = true;
                            data[i][j].empty = false;
                            var src = data[i][j].image.src;
                            data[i][j].image = new Image;
                            data[i][j].image.src = src;
                            data[i][j].image.onload = function() {
                              data[i][j].ready = true;
                              if (typeof window[object].data[area] == 'undefined') {
                                window[object].data[area] = {};
                              }
                              window[object].data[area][j] = Object.assign({},data[i][j]);
                            }
                          })(object,data,i,j);
                        } else {
                          if (typeof window[object].data[area] == 'undefined') {
                            window[object].data[area] = {};
                          }
                          if (j == 'MAP') {
                            for (var f in data[i][j]) {
                              if (data[i][j].hasOwnProperty(f)) {
                                data[i][j][f].x = parseFloat(data[i][j][f].x);
                                data[i][j][f].y = parseFloat(data[i][j][f].y);
                              }
                            }
                          }
                          if (j == 'COLLISION' || j == 'EVENT') {
                            var datatmp1 = [], datatmp2 = [];
                            for (var f in data[i][j]) {
                              if (data[i][j].hasOwnProperty(f)) {
                                datatmp1.push(data[i][j][f]);
                              }
                            }
                            data[i][j] = datatmp1;
                            for (var g = 0; g < datatmp1.length; g++) {
                              datatmp2 = [];
                              for (var f in datatmp1[g]['data']) {
                                if (datatmp1[g]['data'].hasOwnProperty(f)) {
                                  datatmp1[g]['data'][f].x = parseFloat(datatmp1[g]['data'][f].x);
                                  datatmp1[g]['data'][f].y = parseFloat(datatmp1[g]['data'][f].y);
                                  datatmp2.push(datatmp1[g]['data'][f]);
                                }
                              }
                              if (typeof datatmp1[g]['name'] != 'undefined') {
                                data[i][j][g] = {data:datatmp2,name:datatmp1[g]['name']};
                              } else {
                                data[i][j][g] = {data:datatmp2};
                              }
                            }
                            window[object].data[area][j] = Object.assign([],data[i][j]);
                          } else {
                            window[object].data[area][j] = Object.assign({},data[i][j]);
                          }
                        }
                      }
                    }
                    if (i == (Object.keys(data))[(Object.keys(data)).length-1]) {
                      delete resource.data[name.area].inLoad;
                      if (index >= total) {next();}
                    }
                  })(data,i,next);
                }
              }
            }
          }
        });
      }
    }
  },

  reset: function() {
    this.dataList = [];
    world.ObjectCollision = {};
    world.ObjectEvent = {};
    world.ObjectMap = {};
    this.dataJSON = '';
    this.total = 0;
    this.loaded = 0;
    this.percent = 0;
    this.loadCount = 0;
    this.xhrsave = {};
    this.xhrload = {};
    this.inUse = true;
  }
};


function create() {
  console.logColor(
    '<span style="'+consoleLogColorDefaultStyle+'">'+
      'All DOM Elements are Loaded....'+
    '</span>'
  );
  if (checkCookie('JAAJeditorUsername')) {
    canvas = document.getElementById('jaajCanvas');
    ctx = canvas.getContext('2d');

    world = new World({
      gridArea: true,
      gridTile: true,
      cross: true,
      currentArea: true
    });
    mouse = new Mouse();
    resource = new Resource();
    editor = new Editor();
    player = new Player();
    socket = new Socket({mail:getCookie('JAAJeditorMail'),password:getCookie('JAAJeditorPassword'),name:getCookie('JAAJeditorUsername'),color:getCookie('JAAJeditorColor')});
    maker = new Maker();
    memoryManagement = new MemoryManagement();
    menu = new Menu();
    cinematic = new Cinematic();

    ui = new UI();

    console.logColor(
      '<span style="'+consoleLogColorDefaultStyle+'">'+
        'All Class are Loaded....'+
      '</span>'
    );

    ui.create('UI');

    //----> deconnect
    ui.add.button({},{
      id: 'deco',
      text: isMobile ? '' : 'Log out',
      icon: 'fa fa-sign-out-alt',
      class: ['btn_go','btn'],
      position: 'bottomRight',
      onClick: function(){
        delCookie("JAAJeditorUsername");
        delCookie("JAAJeditorColor");
        delCookie("JAAJeditorPassword");
        delCookie("JAAJeditorMail");
        document.location = 'needConnection';
      }
    });


    //----> testPlay
    ui.add.button({},{
      id: 'testplay',
      text: isMobile ? '' : 'Test',
      icon: 'fa fa-play',
      class: ['btn_play','btn'],
      position: 'topRight',
      onClick: function(){
        //on cache la grille, l'UI, on bloque certain event, on ajoute un event (Keyboard)...
        player.active(true);
      }
    });
    //----> testStop
    ui.add.button({
      position: 'fixed',
      top: 0,
      right: 0
    },{
      id: 'teststop',
      in: 'z',
      text: isMobile ? '' : 'Stop',
      icon: 'fa fa-stop',
      class: ['btn_go','btn'],
      onClick: function(){
        //on cache la grille, l'UI, on bloque certain event, on ajoute un event (Keyboard)...
        player.active(false);
      }
    });

    //----> Import Tileset
    ui.add.button({},{
      id: 'importTileset',
      text: isMobile ? '<div class="uploadTileset"></div>' : 'Import Tileset<div class="uploadTileset"></div>',
      icon: 'fa fa-download',
      class: ['btn_importtileset','btn'],
      position: 'topRight',
      onClick: function(){
        $('#fileUpload').click();
      }
    });
    $('#fileUpload').on('change',function(event){
      event.preventDefault();
      new toolTip('Importation en cours..',4000);
      var files = $(this).get(0).files;
      if (files.length > 0) {

        var tilesetList = [];
        var listExt = {
          png:'',
          jpg:'',
          jpeg:'',
          gif:'',
          bmp:'',
          webp:'',
          svg:''
        };
        var j = 0, xhr = {}, nb = 0;
        for (var i = 0; i < files.length; i++) {
          (function(file){
            var reader = new FileReader();
            reader.onload = function(){
              var dataURL = reader.result;
              var name = file.name.slice(0,file.name.lastIndexOf('.'));
              name = 'TILESET_'+(name.length > 16 ? name.substring(0,16) : name)+'.'+Math.random().toString(36).substring(7);
              var ext = file.name.slice(file.name.lastIndexOf('.')+1).toLowerCase();
              if (name != '' && ext != '' && typeof listExt[ext] != 'undefined') {
                tilesetList.push({
                  name: name+'.'+ext,
                  data: dataURL
                });
                nb++;
              }
              j++;
              if (j > files.length-1) {
                var dataJSON = JSON.stringify(tilesetList);
                xhr = new XMLHttpRequest();
                xhr.open("POST", "/saveImage", true);
                xhr.onloadend = function (e) {
                  var data = e.target.response;
                  try {
                    data = JSON.parse(data);
                  } catch(e) {
                    data = false;
                  }
                  if (data) {
                    var t = nb - data.nb;
                    if (t == 0) {
                      new toolTip('<span style="color: #0f0;">Success importation!</span>',4000);
                    } else {
                      new toolTip('<span style="color: #f00;">Warning importation:<br />only <b>'+Math.abs(t)+'</b> tileset was imported!</span>',4000);
                    }
                  } else {
                    new toolTip('<span style="color: #f00;">Error importation!</span>',4000);
                  }
                }
                xhr.send(dataJSON);
              }
            };
            reader.readAsDataURL(file);
          })(files[i]);
        }


        /*
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          formData.append('uploads[]', file, file.name);
        }
        $.ajax({
          url: '/jaajTilesetUpload',
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: function(data){
            new toolTip('<span style="color: #0f0;">Success</span> Importation!',4000);
            resource.getTilesets();
          },
          error: function(data) {
            new toolTip('<span style="color: #f00;">Error</span> Importation!',4000);
          },
          xhr: function() {
            var xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', function(evt) {
              if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                percentComplete = parseInt(percentComplete * 100);
                $('.uploadTileset').width(percentComplete + '%');
                if (percentComplete === 100) {
                  $('.uploadTileset').width('0%');
                }
              }
            }, false);
            return xhr;
          }
        });
        */

      }
    })

    //----> Save
    ui.add.button({},{
      id: 'save',
      text: 'Save&nbsp;<span id="savearea">[0,0]</span>',
      icon: 'far fa-floppy',
      class: ['btn_save','btn'],
      position: 'topRight',
      onClick: function(){
        var xy = world.getRelativeXY();
        var area = '['+xy.x+','+xy.y+']'+world.currentMap;
        editor.save(area);
      }
    });

    //----> Change log
    ui.add.button({},{
      id: 'ChangeLog',
      text: isMobile ? '' : 'Change log (not done!)',
      icon: 'fa fa-calendar',
      class: ['btn_save','btn'],
      position: 'bottomLeft',
      onClick: function(){
        //On ouvre une fenêtre avec tous les logs
      }
    });

    //----> Tool [PENCIL,RUBBER,FILL..etc]
    ui.add.button({},{
      id: 'selectionTileset',
      text: '<img style="width: 32px; height: 32px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIdSURBVGhD7Zg9S1xBGIV3lRU/IyEGEgwEFCTY2QgRESuLSKoQQsyPsEhKQRCLxE67pFDMokFrW/9BSCNbWC1aCkoIppNdn3c9kct17rI2yxvuPHCYO2cOl/e47oAWIpFI69Tr9WKtVjtiDcLZgeVYe1BVdiZkvum9T3g+u3GzIbOi94+hP7LvwNmi5TIhM6igcRHQlnJd6GfgPK0vlmd9hCoJP6Rz9En556gqP6lLzbdjuUzINIrAb1muoMCCDReLeCF/RQg8aNT434sYhA7QprauoMMIs9nttyArB9C2j+bd2rqD2R6iorZhCHRQ5BT9kuUK5nqJrtCyrDAUiddvO4hFvBGLeCOXRfotCF6LvLfhWMuysiH0Fa1p6wrmeoYO0WtZOYC2T/n0hrR1B7O9QCVtwxDopIj9kX8syxXMN4vsO9L8V59MvH7bQSzijVjEG/krQqAPGReyXMFc71Tku6xsCK2ij9q6gg5DzLbLOi0rB9B4HI1q6wo+iSKaZb4BWWEIlQhdohNZrmCuV8xo35ENWWHIxOu3HcQi3rh3EYJ/Wd6mhX97m/E8GcokRWZYcXv3dPo8KbJv0GPF7f1zgcw6a0tFegnVLByCo4pygzxf3bjZkDm0POuYrKaQa/x3hHVKVhDOty3XFEKLZPfTwt9DHxSz3FIo90+c/0DzlmVfQp+T52mR3UUzyvfzbD/9UK6MJiwXiURapVC4Bo9YjaZmjo2nAAAAAElFTkSuQmCC">',
      class: ['btntools','btn_pencilTileset','btn','btntool'],
      position: 'MiddleLeft',
      onClick: function(){
        //selection
        ui.selectTool('Selection','#selectionTileset');
      }
    });
    ui.RubberColor = new ArcEnCiel({
      alpha: 0.5
    });
    ui.RubberSize = 100-100%8;
    ui.add.button({},{
      id: 'pencilTileset',
      text: '',
      icon: 'fa fa-pencil-alt',
      class: ['btntools','btn_pencilTileset','btn','btntool','active'],
      position: 'MiddleLeft',
      onClick: function(){
        //pencil
        ui.selectTool('Pencil','#pencilTileset');
      }
    });
    ui.add.button({},{
      id: 'rubberTileset',
      text: '',
      in: 'ContainerRubberTileset',
      icon: 'fa fa-eraser',
      class: ['btntools','btn_rubberTileset','btn','btntool'],
      position: 'MiddleLeft',
      onClick: function(){
        //rubber
        if (!document.getElementById('SelectionType1')) {
          var canvasNORMAL = document.createElement('canvas');
          canvasNORMAL.id = 'SelectionType1';
          canvasNORMAL.width = 1;
          canvasNORMAL.height = 1;
          document.getElementById('jaajCanvasTempDraw').appendChild(canvasNORMAL);
        } else {
          var canvasNORMAL = document.getElementById('SelectionType1');
        }

        if (!document.getElementById('SelectionType2')) {
          var canvasZNORMAL = document.createElement('canvas');
          canvasZNORMAL.id = 'SelectionType2';
          canvasZNORMAL.width = 1;
          canvasZNORMAL.height = 1;
          document.getElementById('jaajCanvasTempDraw').appendChild(canvasZNORMAL);
        } else {
          var canvasZNORMAL = document.getElementById('SelectionType2');
        }

        if (typeof world.selectionImages.NORMAL == 'undefined') {
          world.selectionImages = {NORMAL:canvasNORMAL,ZNORMAL:canvasZNORMAL};
        }
        ui.selectTool('Rubber','#rubberTileset');
      },
      onMouseEnter: function() {
        ui.RubberBubble.show();
      }
    });
    document.getElementById('ContainerRubberTileset').onmouseleave = function() {
      ui.RubberBubble.hide();
    };
    ui.RubberBubble = new Components.Bubble({
      target: 'rubberTileset',
      in: 'ContainerRubberTileset',
      posX: 'Right',
      posY: 'Middle',
      a: {
        posX: 'Left',
        posY: 'Middle',
        rotate: 90,
        scale: 2,
        tx: 2,
        ty: 2
      }
    });
    ui.RubberBubble.show(true);
    new Components.Slide({
      position: 'absolute',
      top: 'calc(50% - 5px)',
      left: '50%',
      transform: 'translate(-50%,-50%)'
    },{
      in: ui.RubberBubble.id,
      value: ui.RubberSize,
      min: 8,
      max: 1000-1000%8,
      step: 8,
      name: 'rubberSlide',
      onChange: function() {
        ui.RubberSize = this.value;
      },
      onMouseMove: function() {
        ui.RubberSize = this.value;
      }
    });
    function slideValue() {
      el = $(this);
      width = el.width();
      newPoint = (el.val() - el.attr("min")) / (el.attr("max") - el.attr("min"));
      offset = -1.3;
      if (newPoint < 0) { newPlace = 0; }
      else if (newPoint > 1) { newPlace = width; }
      else { newPlace = width * newPoint + offset; offset -= newPoint; }
      el
        .next("output")
        .css({
          left: newPlace,
          marginLeft: offset + "%"
        })
        .text(el.val());
    };
    ui.add.button({},{
      id: 'fillTileset',
      text: '<img style="width: 32px; height: 32px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAARVSURBVGhD7ZlbqJRVGIZ3Wm6TMMGtgnblTSIGihAI3ogoiCClCV6EdjJTU7cilqAXiqUVRkGWiKE3HvKqm9QNgQiaaGqQpKEISocL9cIDiqXM9Lxr3qUOzp7+/59/DsI88LLW+ta3vvW97D2z/5nd0abNE0ShUJiPbqMlDrUmNDiiWCzORpvQPtYbGPt47z1UYF3UCN3hUKtAQy+gteiMmoyw7kHPOmcRCiYiWkPzzdDEQPQFuuve1NwddAjJWDTxPiozEVEcmmeGy0ej827mHtqFJqNOpwRYd6OKJiLah8ab4dLB6IKb+BmN9lYZxFeEThNArmisGS781Jf/hMp+AhHiK0OHKeCMaJwZLvvDd491qAz2V3k/NcFKI8xw19O+7K5DZRBfXWopO6XyhQ+Y9nXZ+sAlN0pXFgc5FCC+xvFcoN5FtIjpAF+RLxQ/4IuWOqTYMsXqAbWvonVMu3xdPlB0ui+4gV5yTH9TNiqmvXpA7VtoLdPnQiN5QMEdLi4zbzus19AA1jPQVhTfFGqGWvc91fxvNI/pU742OxTpS7HfQmVgfojhFVT2AiU+HE1CC9Bm9vX89QNS/knG8+hf5lUhR+xFRxxS7EeGkb4qGxRZXypXDvHLaAt6lWXZm0FvkNtJ7oeMiZ4A0Cz0l2O3Gd51qXRwuKKJSpB7Ce1Hm9Fy9Dqail5mezwahZ5x3e06Uw1yRDfT5xm/0cJxne0fGkwCBxKbSAo1d7v2DIeqQp4IfzQZ9XoMbzCMJ9AwxatCUm4mqHWY4aTEPHzIYpwbNhNArohmXkRnHT+HhiteETb1Pp4b1HvHpQOE9MRworSbDPJFMMOyi/mvjp9iePyPKBtzlJAn1PwHfcx0IuNr6FhpJx2cE/Enow94Fx3fEZp/FIKnw6kWhf7ECveqX7M7jk8JBiIE7oUTLQ59zne/euDU+mgwECF2XRutCg3/7lG/rnpb19PFNcVglG0Eh3scbDnobT9Dv9gj4zH1zHSn14uDCcF6JIEr2mglZAKFT6iMemgNPTLqkWi5558FExFiYwnGH1fToZcHJiKsP/HeR2ih5197+yHEW8IMPRxAj31XQOxN729DvRsR7DXVDHdXNCGI6xlMOZ+j6kYE+00xw529mhDsbXTeGvT/RgQ5DTXDXfp4XfXplv19ztUTdjIjgryGmEliQpD3i/MnoORGBLl1NUPtgwyJPmeQe9NnhqB0RgT5dTFDzTQmhpZOFa97nd6I4EyuZtKYEOTr0UTnTnmdzYjgXC5mqHEQhX9JJIX8KT7b43V2I4KD41BmM5xNbUJwZqbPf+e1vqHU+quQkAUOZzLDmQf/4UoL58a4xhX0FjrudW3/q6RAKjPkZjYR4fwulwuw1uN97d9KUiiRGXJqNiEo1Qe9Qa3taDUa6K3aoVhVM+z1MNTn2/a8oVG9m/0ZOn8EYt8zPBkmIjQ8iMaXom/Rl2gasdq/hG7Tpk2bEh0d/wHFGkvhYI6tnwAAAABJRU5ErkJggg==">',
      class: ['btntools','btn_fillTileset','btn','btntool'],
      position: 'MiddleLeft',
      onClick: function(){
        //fill
        ui.selectTool('Fill','#fillTileset');
      }
    });
    /*
    var righttool = document.createElement('div');
    righttool.id = 'righttool';
    righttool.style.display = 'flex';
    righttool.style.flexDirection = 'column';
    document.getElementById('UI-MiddleRight').appendChild(righttool);*/
    ui.add.button({},{
      id: 'CollisionRectangle',
      text: '',
      icon: 'far fa-square',
      class: ['btntools','btn_fillTileset','btn','btntooldata'],
      //in: 'righttool',
      position: 'MiddleRight',
      onClick: function(){
        ui.selectTool('CollisionRectangle','#CollisionRectangle');
      }
    });
    /*ui.add.button({},{
      id: 'CollisionPolygon',
      text: '',
      icon: 'fa-star-o',
      class: ['btntools','btn','btntooldata'],
      position: 'MiddleRight',
      onClick: function(){
        ui.selectMode = 'CollisionPolygon';
        $('.btntools').removeClass('active');
        $('#CollisionPolygon').addClass('active');
      }
    });*/
    ui.add.button({},{
      id: 'EventRectangle',
      text: '',
      icon: 'far fa-square',
      class: ['btntools','btn','btntooldataevent'],
      //in: 'righttool',
      position: 'MiddleRight',
      onClick: function(){
        ui.selectTool('EventRectangle','#EventRectangle');
      }
    });
    ui.add.button({},{
      id: 'AddMap',
      text: '',
      icon: 'far fa-map',
      class: ['btntools','btn','btntool-map'],
      //in: 'righttool',
      position: 'MiddleRight',
      onClick: function(){
        ui.selectTool('AddMap','#AddMap');
      }
    });
    //----> Add Mob
    ui.add.button({},{
      id: 'AddMob',
      text: '',
      icon: 'fas fa-users',
      class: ['btntools','btn','btntool-mobs'],
      //in: 'righttool',
      position: 'MiddleRight',
      onClick: function(){
        ui.selectTool('AddMob','#AddMob');
        ui.window.open({
          type: 'normal',
          id: 'AddMob_SelectMobS',
          title: 'Select a Mob',
          shadowColor: '#FFFF00',
          bodyStyle: 'background: #222;',
          x: canvas.width/2-(canvas.width*50/100)/2,
          y: canvas.height/2-(canvas.height*70/100)/2,
          w: canvas.width*50/100,
          h: canvas.height*70/100,
          onopen: function(id) {
            $('#'+id).html('Loading..');
            var d = {
              mode: 'SELECT',
              table: 'mobs_constructor'
            };
            socket.SetMysql(d,function(data){
              if (data.length > 0) {
                try {
                  var getXYspriteSheet = function(id,width,height,gw,gh) {
                    var w = width-width%gw;
                    return {
                      x: (gw*(id+1))%w-gw,
                      y: gh*Math.floor((gh*id)/w)
                    };
                  };

                  var HTML = '';
                  for (var i = 0; i < data.length; i++) {
                    var MobData = JSON.parse(data[i].data);
                    HTML +=
                    '<div class="SelectMob-Container" style="width: '+MobData.gw+'px; height: '+MobData.gh+'px;">'+
                      '<div onclick="ui.selectTool(\'AddMob\',\'#AddMob\',true);ui.window.close(\''+id.replace(/^WINDOW_/g,'').replace(/_Body$/g,'')+'\');resource.setSpriteSheet(\''+MobData.spriteSheet+'\',{select:true,gw:'+MobData.gw+',gh:'+MobData.gh+',name:\''+data[i].name+'\'});" class="SelectMob-Sprite" style="background: url(assets/mob/'+MobData.spriteSheet+') no-repeat; background-position: 0px 0px;"></div>'+
                    '</div>';
                  }

                  $('#'+id).html(HTML);

                  new toolTip('<span style="color: #0f0;">Mob: Success Load!</span>',4000);
                } catch(e) {
                  $('#'+id).html('Error load..<br />Please contact the Administrator.');
                  new toolTip('<span style="color: #f00;">Mob: Error Load (bad JSON data)!</span>',4000);
                }
              }
            });
          }
        });
      }
    });

    //----> Teleport
    ui.add.input({
      div: {
        marginLeft: '5px'
      },
      text: {
        borderTopLeftRadius: '5px',
        borderBottomLeftRadius: '5px'
      },
      input: {
        width: '30px',
        transform: 'translateY(-1px)',
        height: '26px'
      }
    },{
      id: 'teleportx',
      text: 'x',
      in: 'teleportcontainer',
      class: ['UI-input'],
      position: 'topLeft',
      onClick: function(){}
    });
    ui.add.input({
      input: {
        width: '30px',
        transform: 'translateY(-1px)',
        height: '26px'
      }
    },{
      id: 'teleporty',
      text: 'y',
      in: 'teleportcontainer',
      class: ['UI-input'],
      position: 'topLeft',
      onClick: function(){}
    });
    ui.add.button({
      margin: '0',
      borderTopLeftRadius: '0px',
      borderBottomLeftRadius: '0px',
      height: '38px'
    },{
      id: 'teleportbtn',
      text: 'GO!',
      in: 'teleportcontainer',
      class: ['btn_go','btn'],
      position: 'topLeft',
      onClick: function(){world.teleport($('#teleportx').val(),$('#teleporty').val());$('#teleportx').val('');$('#teleporty').val('');}
    });

    //----> Create
    ui.add.button({},{
      id: 'Create',
      text: isMobile ? '' : 'Create',
      icon: 'fas fa-cubes',
      class: ['btn_create','btn'],
      position: 'topLeft',
      onClick: function(){
        maker.create();
      }
    });

    //----> Select Tileset
    ui.add.button({},{
      id: 'selectTileset',
      text: isMobile ? '' : 'Select Tileset',
      icon: 'fa fa-file',
      class: ['btn_selectTileset','btn'],
      position: 'topLeft',
      onClick: function(){
        resource.getTilesets(function(tilesets){
          ui.window.open({
            type: 'normal',
            id: 'SelectTileset',
            title: 'Select Tileset',
            shadowColor: '#7AFFED',
            closeb: true,
            x: canvas.width/2-(canvas.width*50/100)/2,
            y: canvas.height/2-(canvas.height*70/100)/2,
            w: canvas.width*50/100,
            h: canvas.height*70/100,
            onopen: function(id) {

              document.getElementById(id).innerHTML +=
                  '<div id="'+id+'_PAGE_1" class="ui-window-page active"></div>'+
                  '<div id="'+id+'_PAGE_2" class="ui-window-page"></div>'+
                  '<div id="'+id+'_PAGE_3" class="ui-window-page"></div>';

              var html_tileset = '<div class="UI-ContainerTileset">';
              for (var i = 0; i < tilesets.length; i++) {
                var name = tilesets[i].substring('TILESET_'.length,tilesets[i].lastIndexOf('.'));
                name = name.substring(0,name.lastIndexOf('.'));
                html_tileset +=
                '<div class="UI-Tileset">'+
                  '<div class="UI-Tileset-Image" style="background: url(assets/tilesets/'+tilesets[i]+') no-repeat center; background-size: 100%;"></div>'+
                  '<div class="UI-Tileset-Title"><tt>'+(name.length > 10 ? name.substring(0,10)+'...' : name)+'</tt></div>'+
                  '<div class="UI-Tileset-ContainerButton">'+
                    '<div class="UI-Tileset-Button UI-Tileset-Button-Select" data-name="'+tilesets[i]+'" data-idp="'+id+'" data-fname="'+name+'"><tt>SELECT</tt></div>'+
                    '<div class="UI-Tileset-Button UI-Tileset-Button-Edit" data-name="'+tilesets[i]+'" data-idp="'+id+'" data-fname="'+name+'"><tt>EDIT</tt></div>'+
                  '</div>'+
                '</div>';
              }
              html_tileset += '</div>';
              document.getElementById(id+'_PAGE_1').innerHTML += html_tileset;

              document.getElementById(id+'_PAGE_2').innerHTML += '<div class="UI-Tileset-Button UI-Tileset-Button-Back" data-idp="'+id+'"><tt>RETOUR</tt></div><tt class="titlel" style="font-size: 30px; position: absolute; top: 5px; left: 50%; transform: translateX(-50%);"></tt><div style="margin-bottom: 20px;"></div>';
              var t = ui.add.canvas({marginLeft: (((canvas.width*50/100)-((canvas.width*50/100)*90/100))/2-10)+'px', border: '1px solid #333',width:(canvas.width*50/100)*90/100,height:(canvas.height*70/100)*80/100},{
                id: 'selectTilesetCanvas',
                in: id+'_PAGE_2',
                draw: function () {
                  if ($('#'+this.in).css('display') != 'none') {
                    this.clear();
                    if (resource.currentTilesetOK) {
                      this.ctx.beginPath();
                      var originX = this.x+this.mx;
                      var originY = this.y+this.my;
                      originX -= (mouse.ax)/(this.oldScale*this.zoom) - (mouse.ax)/this.scale;
                      originY -= (mouse.ay)/(this.oldScale*this.zoom) - (mouse.ay)/this.scale;
                      this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
                      this.ctx.scale(this.zoom, this.zoom);
                      this.ctx.translate(originX, originY);
                      this.ctx.drawImage(resource.currentTilesetIMAGE,0,0,resource.currentTilesetIMAGE.width,resource.currentTilesetIMAGE.height);
                      this.ctx.rect(0,0,resource.currentTilesetIMAGE.width - resource.currentTilesetIMAGE.width%this.gw + this.gw,resource.currentTilesetIMAGE.height - resource.currentTilesetIMAGE.height%this.gh + this.gh);

                      this.w = resource.currentTilesetIMAGE.width;
                      this.h = resource.currentTilesetIMAGE.height;

                      this.ctx.strokeStyle = '#f00';
                      this.ctx.lineWidth = 3;
                      this.ctx.stroke();
                      this.ctx.setTransform(1,0,0,1,0,0);
                    }

                      this.ctx.beginPath();
                      this.viewWidth = this.canvas.width/this.zoom;
                      this.viewHeight = this.canvas.height/this.zoom;

                      var ax = this.relativeAX, ay = this.relativeAY;
                      var rect = this.canvas.getBoundingClientRect();
                      this.viewWidth = this.canvas.width/t.zoom;
                      this.viewHeight = this.canvas.height/t.zoom;
                      if (this.selectZone) {
                        var m = {
                          x: (mouse.x-rect.left),
                          y: (mouse.y-rect.top)
                        };
                        var x = ((m.x/this.zoom-(this.x+this.mx+this.viewWidth/2)) - (m.x/this.zoom-(this.x+this.mx+this.viewWidth/2))%this.gw + (this.relativeAX>this.relativeX?0:this.gw)) / this.gw;
                        var y = ((m.y/this.zoom-(this.y+this.my+this.viewHeight/2)) - (m.y/this.zoom-(this.y+this.my+this.viewHeight/2))%this.gh + (this.relativeAY>this.relativeY?0:this.gh)) / this.gh;
                        this.relativeX = x - ((this.relativeX - this.relativeAX)<0?1:0);
                        this.relativeY = y - ((this.relativeY - this.relativeAY)<0?1:0);
                      }
                      ax += (this.relativeX - this.relativeAX)<0?1:0;
                      ay += (this.relativeY - this.relativeAY)<0?1:0;

                      var originX = ax*this.gw+this.x+this.mx;
                      var originY = ay*this.gh+this.y+this.my;
                      originX -= (mouse.ax)/(this.oldScale*this.zoom) - (mouse.ax)/this.scale;
                      originY -= (mouse.ay)/(this.oldScale*this.zoom) - (mouse.ay)/this.scale;
                      this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
                      this.ctx.scale(this.zoom, this.zoom);
                      this.ctx.translate(originX, originY);
                      this.ctx.rect(0,0,this.relativeX*this.gw-this.relativeAX*this.gw,this.relativeY*this.gh-this.relativeAY*this.gh);
                      this.ctx.fillStyle = 'rgba(10,50,245,0.5)';
                      this.ctx.fill();
                      this.ctx.setTransform(1,0,0,1,0,0);


                    this.drawGrid(this.w,this.h,this.gw,this.gh,'#333');
                  }
                }
              });

              document.getElementById(id+'_PAGE_3').innerHTML += '<div class="UI-Tileset-Button UI-Tileset-Button-Back" data-idp="'+id+'"><tt>BACK</tt></div><div class="UI-Tileset-Button UI-Tileset-Button-Save" data-idp="'+id+'"><tt>SAVE</tt></div><tt class="titlel" style="font-size: 30px; position: absolute; top: 5px; left: 50%; transform: translateX(-50%);"></tt><div style="margin-bottom: 20px;"></div>'
              var u = ui.add.canvas({marginLeft: (((canvas.width*50/100)-((canvas.width*50/100)*90/100))/2-10)+'px', border: '1px solid #333',width:(canvas.width*50/100)*90/100,height:(canvas.height*70/100)*80/100},{
                id: 'selectTilesetCanvasEdit',
                in: id+'_PAGE_3',
                mouseC: 'isLeftDown',
                draw: function () {
                  if ($('#'+this.in).css('display') != 'none') {
                    this.clear();
                    if (resource.currentTilesetOK) {
                      this.ctx.beginPath();
                      var originX = this.x+this.mx;
                      var originY = this.y+this.my;
                      originX -= (mouse.ax)/(this.oldScale*this.zoom) - (mouse.ax)/this.scale;
                      originY -= (mouse.ay)/(this.oldScale*this.zoom) - (mouse.ay)/this.scale;
                      this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
                      this.ctx.scale(this.zoom, this.zoom);
                      this.ctx.translate(originX, originY);
                      this.ctx.drawImage(resource.currentTilesetIMAGE,0,0,resource.currentTilesetIMAGE.width,resource.currentTilesetIMAGE.height);
                      this.ctx.rect(0,0,resource.currentTilesetIMAGE.width - resource.currentTilesetIMAGE.width%this.gw + this.gw,resource.currentTilesetIMAGE.height - resource.currentTilesetIMAGE.height%this.gh + this.gh);

                      this.w = resource.currentTilesetIMAGE.width;
                      this.h = resource.currentTilesetIMAGE.height;

                      this.ctx.strokeStyle = '#f00';
                      this.ctx.lineWidth = 3;
                      this.ctx.stroke();
                      this.ctx.setTransform(1,0,0,1,0,0);
                    }

                      this.ctx.beginPath();
                      this.viewWidth = this.canvas.width/this.zoom;
                      this.viewHeight = this.canvas.height/this.zoom;

                      var ax = this.relativeAX, ay = this.relativeAY;
                      var rect = this.canvas.getBoundingClientRect();
                      this.viewWidth = this.canvas.width/t.zoom;
                      this.viewHeight = this.canvas.height/t.zoom;

                        var m = {
                          x: (mouse.x-rect.left),
                          y: (mouse.y-rect.top)
                        };
                        var x = ((m.x/this.zoom-(this.x+this.mx+this.viewWidth/2)) - (m.x/this.zoom-(this.x+this.mx+this.viewWidth/2))%this.gw + (this.relativeAX>this.relativeX?0:this.gw)) / this.gw;
                        var y = ((m.y/this.zoom-(this.y+this.my+this.viewHeight/2)) - (m.y/this.zoom-(this.y+this.my+this.viewHeight/2))%this.gh + (this.relativeAY>this.relativeY?0:this.gh)) / this.gh;
                        this.relativeX = x - ((this.relativeX - this.relativeAX)<0?1:0);
                        this.relativeY = y - ((this.relativeY - this.relativeAY)<0?1:0);

                      ax += (this.relativeX - this.relativeAX)<0?1:0;
                      ay += (this.relativeY - this.relativeAY)<0?1:0;

                      if (resource.currentTilesetOK) {
                        var ylen = this.h/this.gh-this.h%this.gh+this.gh,
                            xlen = this.w/this.gw-this.w%this.gw+this.gw;
                        for (var y_ = 0; y_ < ylen; y_++) {
                          for (var x_ = 0; x_ < xlen-15; x_++) {
                            this.ctx.beginPath();
                            var originX = this.x+this.mx;
                            var originY = this.y+this.my;
                            originX -= (mouse.ax)/(this.oldScale*this.zoom) - (mouse.ax)/this.scale;
                            originY -= (mouse.ay)/(this.oldScale*this.zoom) - (mouse.ay)/this.scale;
                            this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
                            this.ctx.scale(this.zoom, this.zoom);
                            this.ctx.translate(originX, originY);
                            this.ctx.translate(x_*this.gw, y_*this.gh);
                            if (typeof resource.dataTileset[resource.currentTilesetNAME]['('+x_+','+y_+')'] != 'undefined') {
                              if (resource.dataTileset[resource.currentTilesetNAME]['('+x_+','+y_+')'] == 0) {
                                this.ctx.arc(this.gw/2,this.gh/2,this.gw/2-5,0,2*Math.PI,false);
                                this.ctx.lineWidth = 0.5;
                                this.ctx.strokeStyle = '#333';
                                this.ctx.stroke();
                              } else {
                                this.ctx.font = '10px sans-serif';
                                this.ctx.textAlign = "center";
                                this.ctx.textBaseline = 'middle';
                                this.ctx.fillStyle = '#333';
                                this.ctx.fillText(resource.dataTileset[resource.currentTilesetNAME]['('+x_+','+y_+')'],this.gw/2,this.gh/2);
                              }
                            } else {
                              this.ctx.arc(this.gw/2,this.gh/2,this.gw/2-5,0,2*Math.PI,false);
                              this.ctx.lineWidth = 0.5;
                              this.ctx.strokeStyle = '#333';
                              this.ctx.stroke();
                            }
                            this.ctx.setTransform(1,0,0,1,0,0);
                          }
                        }
                      }

                    this.drawGrid(this.w,this.h,this.gw,this.gh,'#333');
                  }
                },
                onclick: function(e, _this, x, y) {
                  if (typeof resource.dataTileset[resource.currentTilesetNAME]['('+x+','+y+')'] == 'undefined') {
                    resource.dataTileset[resource.currentTilesetNAME]['('+x+','+y+')'] = 0;
                  }
                  if (e.leftClick) {
                    resource.dataTileset[resource.currentTilesetNAME]['('+x+','+y+')'] += 1;
                  } else if (e.rightClick) {
                    resource.dataTileset[resource.currentTilesetNAME]['('+x+','+y+')'] -= 1;
                  }
                }
              });


              ui.add.button({
                position: 'absolute',
                zIndex: '999',
                top: (document.getElementById(u.id).offsetTop+26)+'px',
                left: (((canvas.width*50/100)-((canvas.width*50/100)*90/100))/2-10)+'px'
              },{
                id: 'moveMode',
                text: '<i style="transform: rotate(45deg);" class="fa fa-arrows-alt"></i>',
                in: id+'_PAGE_3',
                class: ['btn_canvasTilesetEdit','btn','btn-transparent','active'],
                onClick: function(){
                  $('.btn_canvasTilesetEdit').removeClass('active');
                  $('#moveMode').addClass('active');
                  (ui.listCanvas[$(this).parent().find('canvas').attr('data-nb')]).mode = 'Move';
                }
              });
              ui.add.button({
                position: 'absolute',
                zIndex: '999',
                top: (document.getElementById(u.id).offsetTop+26)+'px',
                left: ((((canvas.width*50/100)-((canvas.width*50/100)*90/100))/2-10)+45)+'px'
              },{
                id: 'pointerMode',
                text: '<i class="fa fa-mouse-pointer"></i>',
                in: id+'_PAGE_3',
                class: ['btn_canvasTilesetEdit','btn','btn-transparent'],
                onClick: function(){
                  $('.btn_canvasTilesetEdit').removeClass('active');
                  $('#pointerMode').addClass('active');
                  (ui.listCanvas[$(this).parent().find('canvas').attr('data-nb')]).mode = 'Pointer';
                }
              });

              $('.UI-Tileset-Button-Select').click(function(){
                $('#'+this.dataset.idp+'_PAGE_1').removeClass('active');
                $('#'+this.dataset.idp+'_PAGE_3').removeClass('active');
                $('#'+this.dataset.idp+'_PAGE_2').addClass('active');
                $('#'+this.dataset.idp+'_PAGE_2').find('.titlel').html(this.dataset.fname);
                resource.currentTilesetURI = 'assets/tilesets/'+this.dataset.name;
                resource.currentTilesetNAME = this.dataset.name;
                resource.currentTilesetFNAME = this.dataset.name;
                if (typeof resource.dataTileset[resource.currentTilesetNAME] == 'undefined') {
                  resource.dataTileset[resource.currentTilesetNAME] = {};
                }
                resource.currentTilesetOK = false;
                resource.currentTilesetIMAGE = new Image();
                resource.currentTilesetIMAGE.src = resource.currentTilesetURI;
                resource.currentTilesetIMAGE.onload = function() {
                  resource.currentTilesetOK = true;
                  if (typeof ui.currentCanvas.x != 'undefined') {
                    ui.currentCanvas.w = resource.currentTilesetIMAGE.width;
                    ui.currentCanvas.h = resource.currentTilesetIMAGE.height;
                    ui.currentCanvas.x = -ui.currentCanvas.canvas.width/ui.currentCanvas.zoom/2;
                    ui.currentCanvas.y = -ui.currentCanvas.canvas.height/ui.currentCanvas.zoom/2;
                    ui.currentCanvas.mx = 0;
                    ui.currentCanvas.my = 0;
                    ui.currentCanvas.zoom = 1;
                    ui.currentCanvas.scale = 1;
                    ui.currentCanvas.oldScale = 1;
                  }
                };
              });
              $('.UI-Tileset-Button-Edit').click(function(){
                $('#'+this.dataset.idp+'_PAGE_1').removeClass('active');
                $('#'+this.dataset.idp+'_PAGE_2').removeClass('active');
                $('#'+this.dataset.idp+'_PAGE_3').addClass('active');
                $('#'+this.dataset.idp+'_PAGE_3').find('.titlel').html('Edit: '+this.dataset.fname);
                resource.currentTilesetURI = 'assets/tilesets/'+this.dataset.name;
                resource.currentTilesetNAME = this.dataset.name;
                resource.currentTilesetFNAME = this.dataset.name;
                if (typeof resource.dataTileset[resource.currentTilesetNAME] == 'undefined') {
                  resource.dataTileset[resource.currentTilesetNAME] = {};
                }
                resource.currentTilesetOK = false;
                resource.currentTilesetIMAGE = new Image();
                resource.currentTilesetIMAGE.src = resource.currentTilesetURI;
                resource.currentTilesetIMAGE.onload = function() {
                  resource.currentTilesetOK = true;
                  if (typeof ui.currentCanvas.x != 'undefined') {
                    ui.currentCanvas.w = resource.currentTilesetIMAGE.width;
                    ui.currentCanvas.h = resource.currentTilesetIMAGE.height;
                    ui.currentCanvas.x = -ui.currentCanvas.canvas.width/ui.currentCanvas.zoom/2;
                    ui.currentCanvas.y = -ui.currentCanvas.canvas.height/ui.currentCanvas.zoom/2;
                    ui.currentCanvas.mx = 0;
                    ui.currentCanvas.my = 0;
                    ui.currentCanvas.zoom = 1;
                    ui.currentCanvas.scale = 1;
                    ui.currentCanvas.oldScale = 1;
                  }
                };
              });
              $('.UI-Tileset-Button-Back').click(function(){
                $('#'+this.dataset.idp+'_PAGE_2').removeClass('active');
                $('#'+this.dataset.idp+'_PAGE_3').removeClass('active');
                $('#'+this.dataset.idp+'_PAGE_1').addClass('active');
                resource.currentTilesetOK = false;
              });

              $('.UI-Tileset-Button-Save').click(function(){
                if (typeof resource.dataTileset[resource.currentTilesetNAME] == 'undefined') {
                  new toolTip('No Data to Save',1000);
                  return;
                }
                var data = '{"name":"'+resource.currentTilesetFNAME.substring('TILESET_'.length)+'_Tileset","extension":"json","data":'+JSON.stringify(resource.dataTileset[resource.currentTilesetNAME])+'}';
                editor.send({
                  currentData:data,
                  index:0,
                  arraydata:[data],
                  onprogress: function(percent) {
                    //console.log(percent);
                  },
                  onend: function(loaded,total) {
                    if (loaded < total) {
                      new toolTip('<span style="color: #f00;">Error Tileset save!</span>',4000);
                    } else {
                      new toolTip('<span style="color: #0f0;">Success Tileset save!</span>',4000);
                    }
                  }
                });
              });

            }
          });
        });
      }
    });


    console.logColor(
      '<span style="'+consoleLogColorDefaultStyle+'">'+
        'The UI is Loaded....'+
      '</span>'
    );

    //----> Start Events
    window_events();

    console.logColor(
      '<span style="'+consoleLogColorDefaultStyle+'">'+
        'All Events Listeners are Start....'+
      '</span>'
    );

    var el, newPoint, newPlace, offset;
    $("input[type='range']").change(slideValue).trigger('change');
    $("input[type='range']").mousemove(slideValue);

    new toolTip('<span style="color: #0f0;"><b>You</b> have joined the Editor!</span>',5000);
    setTimeout(function () {
      new toolTip('Welcome to <b>JAAJ Editor V0.0.5 Beta</b>!',4000);
      setTimeout(function () {
        new toolTip('Hold right click to move!',5000);
        setTimeout(function () {
          new toolTip('Developper: <span style="color: #f00;">Flammrock</span>(Lemmy)',5000);
        },2000);
      },2000);



      /*
      {
        jaajs: [
          {id:1,evolutionLvl:0,exp:0,IV:[0,0,0],EV:[0,0,0],listAttack:[{name:'toenail',power:10,type:'Normal',costPP:1}]},
          {name:'TITOUAN',id:1,evolutionLvl:0,exp:13824,IV:[0,0,0],EV:[0,0,0],listAttack:[{name:'DESTRUCTION',power:20,type:'Normal',costPP:1}]},
          {id:1,evolutionLvl:0,exp:13824,IV:[0,0,0],EV:[0,0,0],listAttack:[{name:'DESTRUCTION',power:20,type:'Normal',costPP:1}]}
        ],
        items: []
      }*/
      /*
      menu.selectJaaj(function(jaaj){
        //Action = true;
        if (jaaj == null) {
          console.log('Cancel!');
        } else {
          console.log(jaaj);
        }
      },'fight');*/

    },2000);


    editor.load([
      'Resource'
    ],function(){
      console.logColor(
        '<span style="'+consoleLogColorDefaultStyle+'">'+
          'All Local Region Ressources (Images,Events,Mobs,Textures...) are loaded....'+
        '</span>'
      );
      editor.inUse = false;
      window.onchangearea();
      bluePrint = new BluePrint();
      bluePrint.create();

      if (player.memory == null) {
        player.memory = {};
      }
      if (typeof player.memory.items === 'undefined') {
        player.memory.items = {};
      }
      if (typeof player.memory.jaajs === 'undefined') {
        player.memory.jaajs = [];
      }
      player.memory.items = {1:5};
      /*
      player.active(true);
      cinematic.disableGame();
      cinematic.addTextSubtile({
                 text:'JAAJ™',
                width:'100%',
             fontSize:'250px',
           fontFamily:'Londrina',
                    x:'50%',
                    y:'50%',
              anchorY:'center',
         textBaseline:'middle',
            textAlign:'center',
            animation:true,
        animationData:{fontSize:250,speed:5},
        animationTime:3500,

            animationEnd:true,
        animationDataEnd:{fontSize:250,speed:5},
        animationTimeEnd:500,


                 time:2000,
      });*/
      console.logColor(
        '<span style="'+consoleLogColorDefaultStyle+'">'+
          'BluePrint Constructor is Start....'+
        '</span>'
      );
      setTimeout(function () {
        console.logColor(
          '<span style="'+consoleLogColorDefaultStyle+'">'+
            'The Editor is completely loaded, so good creation and enjoy it :D'+
          '</span>'
        );




        /*
        new SystemFight(player.memory,{
          jaajs:[{evolutionLvl:1,id:1,exp:(new FightAlgorithm(null)).getExp(24),IV:[0,0,0],EV:[0,0,0],listAttack:[1]}]
        },0,'forest;01',function(data){
          console.log(data);
        });
        */

        /*
        new SystemFight(player.memory,{
          name: 'Nick',
          jaajs: [
            {evolutionLvl:1,id:1,exp:(new FightAlgorithm(null)).getExp(24),IV:[0,0,0],EV:[0,0,0],listAttack:[{name:'toenail',power:10,type:'Normal',costPP:1}]},
            {evolutionLvl:0,id:1,exp:(new FightAlgorithm(null)).getExp(3),IV:[0,0,0],EV:[0,0,0],listAttack:[{name:'DESTRUCTION',power:20,type:'Normal',costPP:1}]}
          ],
          items: []
        },1,'forest;01',function(data){
          console.log(data);
        });
        */


      }, 2000);
    });

    socket.connect(function(){
      console.logColor(
        '<span style="'+consoleLogColorDefaultStyle+'">'+
          getCookie('JAAJeditorUsername')+', You are connected to our servers!'+
        '</span>'
      );
      update();
    });
  }
};


function Socket(settings) {
  this.listSocketData = {resource:{},images:{}};
  this.id = Math.random().toString(36).substring(7);
  this.color = settings.color || resource.ArrayCursors[getRandomIntInclusive(0, resource.ArrayCursors.length-1)];
  this.name = settings.name || 'No Name';
  this.mail = settings.mail || 'NoMail';
  this.password = settings.password || 'NoPassword';
  this.tmp1 = false;
  this.isEndMySQL = false;
  this.minTime = 50;
  this.date = Date.now();
};
Socket.prototype = {
  connect: function(callback) {
    this.sk = io.connect('http://127.0.0.1:3000/');
    this.sk.on('disconnect', this.disconnect);
    this.sk.on('JAAJeditorOnConnect', this.onconnect);
    this.sk.on('JAAJeditorOnDisconnect', this.ondisconnect);
    this.sk.on('JAAJeditorOnDataSend', this.ondatasend);
    this.sk.on('JAAJeditorOnSetMysql', this.onSetMysql);
    this.sk.on('JAAJeditorOnIsValidSession', this.isValidSession);
    this.sk.emit('JAAJeditorConnect',{name:this.name+'#'+this.id,color:this.color});
    this.sk.emit('JAAJeditorIsValidSession',{mail:this.mail,password:this.password});
    $('body').css('cursor','url(assets/editor/cursor/'+this.color+'.png), default');
    callback();
  },
  disconnect: function() {},

  onconnect: function(data) {
    new toolTip('<span style="color: #0f0;"><b>'+data.name+'</b> joined the Editor!</span>',2000);
    socket.listSocketData[data.name] = {name:data.name,color:data.color};
  },
  ondisconnect: function(name) {
    new toolTip('<span style="color: #f00;"><b>'+name+'</b> left the Editor!</span>',2000);
    if (typeof socket.listSocketData[name] != 'undefined') {
      delete socket.listSocketData[name];
    }
  },

  onSetMysql: function(data) {
    //error or success
    data = data || {};
    if (typeof data.error != 'undefined') {
      new toolTip('<span style="color: #f00;">Error Mysql!</span>',4000);
    } else {
      if (typeof data.idCallback != 'undefined') {
        if (typeof socket[data.idCallback] == 'function') {
          if (typeof data.results != 'undefined') {
            socket[data.idCallback](data.results);
          } else {
            socket[data.idCallback](data);
          }
          delete socket[data.idCallback];
        }
      }
    }
  },
  SetMysql: function(data,c) {
    data = data || {};
    if (c) {
      data.idCallback = (Math.random().toString(36).substring(7))+''+(Math.random().toString(36).substring(7))+''+(Math.random().toString(36).substring(7))+''+(Math.random().toString(36).substring(7));
      socket[data.idCallback] = c;
    }
    socket.sk.emit('JAAJeditorSetMysql',data);
  },

  ondatasend: function(data) {
    if (typeof data.data.NORMAL != 'undefined') {
      socket.listSocketData.images[data.name] = {
        NORMAL: {image: new Image,OK:false},
        ZNORMAL: {image: new Image,OK:false}
      };
      socket.listSocketData.images[data.name].NORMAL.image.src = data.data.NORMAL;
      socket.listSocketData.images[data.name].ZNORMAL.image.src = data.data.ZNORMAL;
      socket.listSocketData.images[data.name].NORMAL.image.onload = function() {
        socket.listSocketData.images[data.name].NORMAL.OK = true;
      };
      socket.listSocketData.images[data.name].ZNORMAL.image.onload = function() {
        socket.listSocketData.images[data.name].ZNORMAL.OK = true;
      };
    } else {
      socket.listSocketData[data.name] = data;
      if (typeof data.data.tileset != 'undefined') {
        if (typeof socket.listSocketData.resource[data.name] == 'undefined') {
          socket.listSocketData.resource[data.name] = {
            drawWidth: data.data.tileset.drawWidth,
            drawHeight: data.data.tileset.drawHeight,
            drawX: data.data.tileset.drawX,
            drawY: data.data.tileset.drawY,
            currentTilesetOK: false,
            currentTilesetURI: data.data.tileset.resource.currentTilesetURI,
            currentTilesetNAME: data.data.tileset.resource.currentTilesetNAME,
            currentTilesetFNAME: data.data.tileset.resource.currentTilesetFNAME,
          };
          var s = socket.listSocketData.resource[data.name];
          s.currentTilesetIMAGE = new Image();
          s.currentTilesetIMAGE.src = s.currentTilesetURI;
          s.currentTilesetIMAGE.onload = function(){
            s.currentTilesetOK = true;
          };
        } else {
          var s = socket.listSocketData.resource[data.name];
          s.drawWidth = data.data.tileset.drawWidth;
          s.drawHeight = data.data.tileset.drawHeight;
          s.drawX = data.data.tileset.drawX;
          s.drawY = data.data.tileset.drawY;
        }
      } else {
        socket.listSocketData.resource[data.name] = null;
        delete socket.listSocketData.resource[data.name];
      }
    }
  },
  datasend: function(data) {
    if (Date.now() - socket.date > socket.minTime) {
      socket.date = Date.now();
      socket.sk.emit('JAAJeditorData',data);
      for (var name in socket.listSocketData) {
        if (socket.listSocketData.hasOwnProperty(name)) {
          socket.draw(socket.listSocketData[name]);
        }
      }
    }
  },

  isValidSession: function(data){
    if (data.notValid) {
      document.location = 'needConnection.html';
    } else {
      player.name = socket.name;
      player.color = socket.color;
      player.mail = socket.mail;
      player.password = socket.password;
      try {
        player.memory = JSON.parse(data.memory);
        player.isLoaded = true;
      } catch (e) {
        player.memory = {};
      }
    }
  },

  draw: function(data) {
    if (typeof data.data != 'undefined') {
      if (typeof data.data.mouse != 'undefined') {
        if (typeof resource.Cursors != 'undefined') {
          return false;
        }
        if (typeof resource.Cursors[data.color] != 'undefined') {
          return false;
        }
        if (typeof resource.Cursors[data.color].ready != 'undefined') {
          return false;
        }
        if (resource.Cursors[data.color].ready) {
          ctx.beginPath();
          var originX = world.x+world.mx;
          var originY = world.y+world.my;
          originX -= (mouse.ax)/(world.oldScale*world.zoom) - (mouse.ax)/world.scale;
          originY -= (mouse.ay)/(world.oldScale*world.zoom) - (mouse.ay)/world.scale;
          ctx.translate(canvas.width/2, canvas.height/2);
          ctx.scale(world.zoom, world.zoom);
          ctx.translate(originX, originY);
          ctx.translate(data.data.mouse.x+500,data.data.mouse.y+500);
          if (typeof this.listSocketData.resource[data.name] != 'undefined') {
            var s = this.listSocketData.resource[data.name];
            if (s.currentTilesetOK) {
              ctx.drawImage(s.currentTilesetIMAGE,s.drawX,s.drawY,s.drawWidth,s.drawHeight,-s.drawWidth/2,-s.drawHeight/2,s.drawWidth,s.drawHeight);
            }
          }
          ctx.drawImage(resource.Cursors[data.color].image,0,0,resource.Cursors[data.color].image.width/world.zoom,resource.Cursors[data.color].image.height/world.zoom);
          ctx.font = (50/world.zoom)+'px sans-serif';
          ctx.textAlign = "center";
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(31,31,31,0.5)';
          ctx.fillText(data.name.substring(0,data.name.lastIndexOf('#')),0,-20/world.zoom);
          ctx.setTransform(1,0,0,1,0,0);


          if (data.data.mouse.isLeftDown && data.data.mouse.isMove) {
            if (typeof this.listSocketData.images[data.name] != 'undefined') {
              if (typeof this.listSocketData.images[data.name].NORMAL != 'undefined') {
                var listZone = world.checkZoneToDraw(data.data.mouse,this.listSocketData.resource[data.name].drawX,this.listSocketData.resource[data.name].drawY,this.listSocketData.resource[data.name].drawWidth,this.listSocketData.resource[data.name].drawHeight);
                for (var c in this.listSocketData.images[data.name]) {
                  if (this.listSocketData.images[data.name].hasOwnProperty(c)) {
                    for (var i = 0; i < listZone.length; i++) {
                      var currentZone = listZone[i];
                      var area = '['+currentZone.x+','+currentZone.y+']'+world.currentMap;
                      var tmpcanvas, tmpctx;
                      if (document.getElementById('TMP_CANVAS_AREA_'+area+'_'+c)) {
                        tmpcanvas = document.getElementById('TMP_CANVAS_AREA_'+area+'_'+c);
                        tmpctx = tmpcanvas.getContext('2d');
                      } else {
                        tmpcanvas = document.createElement('canvas');
                        tmpcanvas.id = 'TMP_CANVAS_AREA_'+area+'_'+c;
                        tmpcanvas.className = 'tmpcanvas notVisible';
                        document.getElementById('jaajCanvasTempDraw').appendChild(tmpcanvas);
                        tmpctx = tmpcanvas.getContext('2d');
                        tmpcanvas.width = 1000;
                        tmpcanvas.height = 1000;
                        getLayerImage = resource.getAreaLayer(area,c);
                        if (getLayerImage.ready) {
                          tmpctx.drawImage(getLayerImage.image, 0, 0, getLayerImage.image.width, getLayerImage.image.height);
                          world.tmp[area+'_'+c] = true;
                        } else if (!getLayerImage.exist) {
                          world.tmp[area+'_'+c] = true;
                        } else {
                          world.tmp[area+'_'+c] = false;
                        }
                        resource.setAreaLayerEMPTY(area,c,{
                          x: currentZone.x*1000,
                          y: currentZone.y*1000
                        });
                      }

                      if (!world.tmp[area+'_'+c]) {
                        getLayerImage = resource.getAreaLayer(area,c);
                        if (getLayerImage.ready) {
                          tmpctx.drawImage(getLayerImage.image, 0, 0, getLayerImage.image.width, getLayerImage.image.height);
                          world.tmp[area+'_'+c] = true;
                        } else if (!getLayerImage.exist) {
                          world.tmp[area+'_'+c] = true;
                        } else {
                          world.tmp[area+'_'+c] = false;
                        }
                        resource.setAreaLayerEMPTY(area,c,{
                          x: currentZone.x*1000,
                          y: currentZone.y*1000
                        });
                      } else {
                        ToolPaint.auto({
                          ctx: tmpctx,
                          area: area,
                          resourceOK: this.listSocketData.images[data.name][c].OK,
                          mode: data.data.selectMode,
                          data: currentZone,
                          image: this.listSocketData.images[data.name][c].image
                        });
                      }
                    }
                  }
                }
              }
            }
          }








        }
      }
    }
  }
};


function update() {
  window.requestAnimationFrame(update);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var nb = 0;
  for (var id in cinematic.transition) {
    if (cinematic.transition.hasOwnProperty(id)) {
      if (cinematic.transition[id] != null) {
        cinematic.transition[id]();
        nb++;
      } else {
        delete cinematic.transition[id];
      }
    }
  }
  if (nb > 0) {
    cinematic.onWork = true;
  } else {
    cinematic.onWork = false;
  }

  if (world.EnableGame) {

      if (world.display) {
        world.draw();
        if (world.editorHover) {
          if (mouse.tx == mouse.x && mouse.ty == mouse.y) {
            mouse.isMove = false;
          } else {
            mouse.isMove = true;
          }
          mouse.tx = mouse.x;
          mouse.ty = mouse.y;
        } else {
          mouse.isMove = false;
        }

        if (typeof world.tmp2.delete != 'undefined') {
          world.tmp2 = {};
        }

        if (player.active_) {
          for (var i in NPCdialogList) {
            if (NPCdialogList.hasOwnProperty(i)) {
              NPCdialogList[i].draw();
            }
          }

          player.update();
          ctx.setTransform(1,0,0,1,0,0);
          ctx.font = '20px sans-serif';
          ctx.textAlign = "left";
          ctx.textBaseline = 'top';
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillText('x: '+player.position.x+', y: '+player.position.y+', map: '+(world.currentMap==''?'Default':world.currentMap),10,10);
          ctx.setTransform(1,0,0,1,0,0);
          menu.draw();
          socket.datasend(null);
        } else {
          for (var i = 0; i < ui.listCanvas.length; i++) {
            ui.listCanvas[i].draw();
          }
          var xy = mouse.getAbsoluteXY();
          var axy = mouse.getRelativeXY();
          var area = '['+axy.x+','+axy.y+']'+world.currentMap;

          var types = ['Event','Collision'];
          var alreadyIn = {nobj:false,i:false};
          for (var t = 0; t < types.length; t++) {
            var nobj = 'Object'+types[t];
            for (var i in world[nobj]) {
              if (world[nobj].hasOwnProperty(i)) {
                if (i!=0 || types[t]!='Collision') {
                  if (typeof world[nobj][i].containsPoint == 'undefined') {
                    world[nobj][i] = new Polygon({points:world[nobj][i].points,type:types[t].toUpperCase()},true);
                  }
                  var isMouseIn = world[nobj][i].containsPoint({x:xy.x+500,y:xy.y+500});
                  if (isMouseIn && !alreadyIn.i) {
                    alreadyIn = {nobj:nobj,i:i};
                  }
                }
              }
            }
          }
          var types = ['Collision','Event','Map'];
          for (var t = 0; t < types.length; t++) {
            var nobj = 'Object'+types[t];
            for (var i in world[nobj]) {
              if (world[nobj].hasOwnProperty(i)) {
                if (t>1) {
                  resource.pointMapDraw(world[nobj][i]);
                } else {
                  if (ui.selectMode.replace(types[t],'') != ui.selectMode) {
                    if (i!=0 || types[t]!='Collision') {
                      if (typeof world[nobj][i].containsPoint == 'undefined') {
                        world[nobj][i] = new Polygon({points:world[nobj][i].points,type:types[t].toUpperCase()},true);
                      }
                      if (alreadyIn.nobj == nobj && alreadyIn.i == i) {
                        world[nobj][i].draw(true);
                        if (mouse.isRightDown && world.editorHover) {
                          mouse.isRightDown = false;
                          if (resource.data[area][types[t].toUpperCase()] != 'undefined') {
                            for (var j in resource.data[area][types[t].toUpperCase()]) {
                              if (resource.data[area][types[t].toUpperCase()].hasOwnProperty(j)) {
                                if (isEquivalent(resource.data[area][types[t].toUpperCase()][j]['data'],world[nobj][i].points)) {
                                  resource.data[area][types[t].toUpperCase()][j] = null;
                                  delete resource.data[area][types[t].toUpperCase()][j];
                                }
                              }
                            }
                          }
                          world[nobj][i] = null;
                          delete world[nobj][i];
                        }
                        if (mouse.isLeftDown && world.editorHover && types[t] == 'Event') {
                          mouse.isLeftDown = false;
                          bluePrint.load(world[nobj][i].data['name'],area);
                        }
                      } else {
                        world[nobj][i].draw();
                      }
                    }
                  } else {
                    if (i!=0 || types[t]!='Collision') {
                      world[nobj][i].draw();
                    }
                  }
                }
              }
            }
            if (types[t] == 'Map' && world.currentMap != '') {
              resource.pointMapDraw({x:0,y:0,name:'__BACK__',back: true});
            }
          }

          if (world.drawWidth!=0 && world.drawHeight!=0 && resource.currentTilesetOK && ui.selectMode == 'Pencil') {
            if (mouse.tmpClick) {
              mouse.isMove = true;
            }
            //console.log(mouse.isMove);
            socket.datasend({
              mouse: mouse.getAbsoluteXY(),
              selectMode: ui.selectMode,
              tileset: {
                drawWidth: world.drawWidth,
                drawHeight: world.drawHeight,
                drawX: world.drawX,
                drawY: world.drawY,
                resource: {
                  currentTilesetOK: false,
                  currentTilesetURI: resource.currentTilesetURI,
                  currentTilesetNAME: resource.currentTilesetNAME,
                  currentTilesetFNAME: resource.currentTilesetFNAME,
                }
              }
            });
            if (mouse.tmpClick) {
              mouse.tmpClick = false;
              mouse.isMove = false;
            }
          } else {
            socket.datasend({
              mouse: mouse.getAbsoluteXY(),
              selectMode: ui.selectMode
            });
          }

          //del later ====>
          for (var i in NPCdialogList) {
            if (NPCdialogList.hasOwnProperty(i)) {
              NPCdialogList[i].draw();
            }
          }

          if (typeof world.tmp2.delete != 'undefined') {
            world.tmp2 = {};
          }
        }
      }


      if (world.Fight) {
        world.objFight.draw();
      }
  }

  for (var i in cinematic.TextSubtile) {
    if (cinematic.TextSubtile.hasOwnProperty(i)) {
      cinematic.TextSubtile[i].draw();
    }
  }
};


