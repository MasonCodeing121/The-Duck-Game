// ─── Canvas Setup ────────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
canvas.width  = 600;
canvas.height = 600;
const ctx = canvas.getContext('2d');
ctx.lineCap  = 'round';
ctx.lineJoin = 'round';

// ─── Multiplayer ─────────────────────────────────────────────────────────────
const SERVER_URL = 'https://cutter-rpg-server.onrender.com';
const socket     = io(SERVER_URL);

let mySocketId   = null;
let otherPlayers = {};
let currentRoom  = null;

const netStatus = document.getElementById('net-status');
const roomInput = document.getElementById('roomInput');
const roomOverlay = document.getElementById('room-overlay');

socket.on('connect', () => {
  mySocketId = socket.id;
  netStatus.textContent = 'online';
  netStatus.className   = 'connected';
});
socket.on('disconnect', () => {
  netStatus.textContent = 'offline';
  netStatus.className   = 'error';
});
socket.on('connect_error', () => {
  netStatus.textContent = 'server unreachable';
  netStatus.className   = 'error';
});
socket.on('update-players', (players) => {
  otherPlayers = players;
});

function joinRoom(name) {
  currentRoom = name;
  socket.emit('join-room', name);
}

// Emit local player state to server (called each frame while in game)
let _emitTick = 0;
function emitMove() {
  if (!currentRoom) return;
  _emitTick++;
  if (_emitTick % 3 !== 0) return;
  socket.emit('move', {
    x: ducks.x, y: ducks.y, d: ducks.d,
    r1: ducks.r1, r2: ducks.r2, r3: ducks.r3,
    r4: ducks.r4, r5: ducks.r5, r6: ducks.r6,
    walking: ducks.walking
  });
}

// ─── Math Helpers (p5 uses degrees by default) ───────────────────────────────
const DEG = Math.PI / 180;
function sin(d)            { return Math.sin(d * DEG); }
function cos(d)            { return Math.cos(d * DEG); }
function atan2(y, x)       { return Math.atan2(y, x) / DEG; }
function dist(x1,y1,x2,y2){ return Math.sqrt((x2-x1)**2+(y2-y1)**2); }
function lerp(a, b, t)     { return a + (b - a) * t; }
function random(a, b)      { return b === undefined ? Math.random()*a : Math.random()*(b-a)+a; }
function round(n)          { return Math.round(n); }

// ─── Drawing State ────────────────────────────────────────────────────────────
let _fill      = [0, 0, 0];
let _stroke    = [0, 0, 0];
let _lineWidth = 1;
let _doFill    = true;
let _doStroke  = true;
let _textSize  = 12;
let _textFont  = 'sans-serif';
let _textAlignH = 'center';
let _textAlignV = 'middle';
let _stateStack = [];

function _colorStr(c) {
  if (c.length === 1) return `rgb(${c[0]},${c[0]},${c[0]})`;
  if (c.length === 2) return `rgba(${c[0]},${c[0]},${c[0]},${c[1]/255})`;
  if (c.length === 3) return `rgb(${c[0]},${c[1]},${c[2]})`;
  return `rgba(${c[0]},${c[1]},${c[2]},${c[3]/255})`;
}

function fill(...args)   { _fill = args;   _doFill   = true; }
function noFill()        { _doFill   = false; }
function stroke(...args) { _stroke = args; _doStroke = true; }
function noStroke()      { _doStroke = false; }
function strokeWeight(w) { _lineWidth = w; }

function _applyFill()   { if (_doFill)   { ctx.fillStyle   = _colorStr(_fill);   ctx.fill(); } }
function _applyStroke() { if (_doStroke) { ctx.strokeStyle = _colorStr(_stroke); ctx.lineWidth = _lineWidth; ctx.stroke(); } }

function push() {
  ctx.save();
  _stateStack.push({
    fill: [..._fill], stroke: [..._stroke],
    lineWidth: _lineWidth, doFill: _doFill, doStroke: _doStroke,
    textSize: _textSize, textFont: _textFont,
    textAlignH: _textAlignH, textAlignV: _textAlignV
  });
}
function pop() {
  ctx.restore();
  const s = _stateStack.pop();
  _fill = s.fill; _stroke = s.stroke;
  _lineWidth = s.lineWidth; _doFill = s.doFill; _doStroke = s.doStroke;
  _textSize = s.textSize; _textFont = s.textFont;
  _textAlignH = s.textAlignH; _textAlignV = s.textAlignV;
}

function translate(x, y) { ctx.translate(x, y); }
function rotate(d)       { ctx.rotate(d * DEG); }
function scale(x, y)     { ctx.scale(x, y === undefined ? x : y); }

function background(...args) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = _colorStr(args);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function ellipse(x, y, w, h) {
  if (h === undefined) h = w;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.abs(w/2), Math.abs(h/2), 0, 0, Math.PI * 2);
  _applyFill(); _applyStroke();
}

function rect(x, y, w, h, r) {
  const rx = x - w/2, ry = y - h/2;
  ctx.beginPath();
  if (r) { ctx.roundRect(rx, ry, w, h, r); } else { ctx.rect(rx, ry, w, h); }
  _applyFill(); _applyStroke();
}

function line(x1, y1, x2, y2) {
  if (!_doStroke) return;
  ctx.beginPath();
  ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = _colorStr(_stroke);
  ctx.lineWidth   = _lineWidth;
  ctx.stroke();
}

function triangle(x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3);
  ctx.closePath(); _applyFill(); _applyStroke();
}

function quad(x1, y1, x2, y2, x3, y3, x4, y4) {
  ctx.beginPath();
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3); ctx.lineTo(x4,y4);
  ctx.closePath(); _applyFill(); _applyStroke();
}

function _updateFont() { ctx.font = `${_textSize}px "${_textFont}"`; }
function textSize(s)   { _textSize = s; _updateFont(); }
function textFont(f)   { _textFont = f; _updateFont(); }
function textAlign(h, v) {
  const hmap = { center:'center', left:'left', right:'right' };
  const vmap = { center:'middle', top:'top', bottom:'bottom', baseline:'alphabetic' };
  _textAlignH = hmap[String(h).toLowerCase()] || 'center';
  _textAlignV = v ? (vmap[String(v).toLowerCase()] || 'middle') : 'middle';
}

function text(str, x, y) {
  ctx.font         = `${_textSize}px "${_textFont}"`;
  ctx.textAlign    = _textAlignH;
  ctx.textBaseline = _textAlignV;
  const lines = String(str).split('\n');
  const lineH = _textSize * 1.35;
  for (let i = 0; i < lines.length; i++) {
    const ly = y + i * lineH;
    if (_doFill)   { ctx.fillStyle   = _colorStr(_fill);   ctx.fillText(lines[i], x, ly); }
    if (_doStroke) { ctx.strokeStyle = _colorStr(_stroke); ctx.lineWidth = _lineWidth; ctx.strokeText(lines[i], x, ly); }
  }
}

const CLOSE = 'CLOSE';
let _firstVertex = true;
function beginShape()    { ctx.beginPath(); _firstVertex = true; }
function vertex(x, y)   { if (_firstVertex) { ctx.moveTo(x,y); _firstVertex=false; } else { ctx.lineTo(x,y); } }
function bezierVertex(cp1x,cp1y,cp2x,cp2y,x,y) { ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x,y); }
function endShape(mode)  { if (mode===CLOSE) ctx.closePath(); _applyFill(); _applyStroke(); }

function arc(x, y, w, h, startDeg, stopDeg) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.abs(w/2), Math.abs(h/2), 0, startDeg*DEG, stopDeg*DEG);
  _applyFill(); _applyStroke();
}

// ─── Input Tracking ───────────────────────────────────────────────────────────
let mouseX = 0, mouseY = 0;
let clicked = false;
let keys    = [];

canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouseX = (e.clientX - r.left) * (canvas.width  / r.width);
  mouseY = (e.clientY - r.top)  * (canvas.height / r.height);
});
canvas.addEventListener('click', () => { clicked = true; });
window.addEventListener('keydown', e => { keys[e.keyCode] = true;  e.preventDefault(); });
window.addEventListener('keyup',   e => { keys[e.keyCode] = false; });

// ─── Frame Counter ────────────────────────────────────────────────────────────
let frameCount = 0;

// ─── Game State ───────────────────────────────────────────────────────────────
var scene = "menu";
var cam   = { x: 0, y: 0 };
var dirts = [];
var ducks = {
  x:0, y:150, d:-49, speed:2,
  r1:0, r2:0, r3:0, r4:0, r5:0, r6:0, r7:0,
  walking:false, pancakes:0, stamina:100,
  U:false, D:false, R:false, L:false,
};

function dirt() {
  noStroke();
  for (var i = 0; i < dirts.length; i++) {
    fill(181,145,103,dirts[i].opacity);
    ellipse(dirts[i].x, dirts[i].y, dirts[i].opacity/50, dirts[i].opacity/50);
    dirts[i].opacity -= 2;
    if (dirts[i].opacity < 0) { dirts.splice(i,1); }
  }
}

// Draw the local duck (uses global ducks.rX state)
function duck(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(0, 50);
  ellipse(0, 17, 30, 20);
  stroke(247,180,37); strokeWeight(13);
  line(ducks.r3*5,   ducks.r4*2,   ducks.r3*5  + ducks.r1*(-ducks.r6*3), 13+ducks.r4*2  +ducks.r2*(-ducks.r6*3));
  line(ducks.r3*-5,  ducks.r4*-2,  ducks.r3*-5 + ducks.r1*(ducks.r6*3),  13+ducks.r4*-2 +ducks.r2*(ducks.r6*3));
  stroke(255); strokeWeight(22);
  line(ducks.r1*10,   ducks.r2*5,   ducks.r1*10,  -20+ducks.r2*5);
  line(ducks.r1*-10, -ducks.r2*5,   ducks.r1*10,   ducks.r2*5);
  stroke(247,180,37); strokeWeight(13);
  line(ducks.r1*24, -16+ducks.r2*9, ducks.r1*25, -16+ducks.r2*10);
  if (ducks.d % 360) {
    strokeWeight(11 + ducks.r5*11);
    if (ducks.r5*11 > 2) { stroke(255); } else { noStroke(); }
    line(ducks.r1*10, ducks.r2*5, ducks.r1*10, -20+ducks.r2*5);
  }
  pop();
}

// Draw another player's duck using their synced state
function drawOtherDuck(x, y, p, label) {
  push();
  translate(x, y);
  noStroke();
  fill(0, 40);
  ellipse(0, 17, 30, 20);
  stroke(200, 120, 37); strokeWeight(13);
  line(p.r3*5,   p.r4*2,   p.r3*5  + p.r1*(-p.r6*3), 13+p.r4*2  +p.r2*(-p.r6*3));
  line(p.r3*-5,  p.r4*-2,  p.r3*-5 + p.r1*(p.r6*3),  13+p.r4*-2 +p.r2*(p.r6*3));
  stroke(200, 230, 255); strokeWeight(22);
  line(p.r1*10,   p.r2*5,   p.r1*10,  -20+p.r2*5);
  line(p.r1*-10, -p.r2*5,   p.r1*10,   p.r2*5);
  stroke(200, 120, 37); strokeWeight(13);
  line(p.r1*24, -16+p.r2*9, p.r1*25, -16+p.r2*10);
  noStroke();
  // name tag
  push();
  translate(0, -38);
  fill(0, 140);
  rect(0, 0, label.length * 7 + 12, 16, 4);
  fill(255);
  noStroke();
  textSize(10);
  textFont("Courier");
  text(label, 0, 0);
  pop();
  pop();
}

// Render all remote players at their world positions
function renderOtherPlayers() {
  for (const [id, p] of Object.entries(otherPlayers)) {
    if (id === mySocketId) continue;
    const shortId = id.slice(0, 6);
    drawOtherDuck(p.x, p.y, p, shortId);
  }
}

function blocked(x, y) {
  for (var i = 0; i < obstacles.length; i++) {
    if (dist(x,y,obstacles[i].x,obstacles[i].y) < obstacles[i].r) return true;
  }
  return false;
}

function honk() {
  ducks.r1 = sin(ducks.d);
  ducks.r2 = cos(ducks.d);
  ducks.r3 = sin(ducks.d + 90);
  ducks.r4 = cos(ducks.d + 90);
  ducks.r5 = sin(ducks.d + 270);
  if (ducks.walking) {
    ducks.r6 = cos(90 + frameCount*10);
    dirts.push({ x: ducks.x+random(-10,10), y: ducks.y+random(10,20), opacity:255 });
    ducks.r7 = sin(ducks.d + 90);
  } else {
    ducks.r6 = lerp(ducks.r6, 0, 0.1);
  }
  ducks.walking = keys[87]||keys[83]||keys[65]||keys[68] ? true : false;
  if (keys[87]) { var ny=ducks.y-ducks.speed; if(!blocked(ducks.x,ny)) ducks.y=ny; ducks.U=true;  } else { ducks.U=false; }
  if (keys[83]) { var ny=ducks.y+ducks.speed; if(!blocked(ducks.x,ny)) ducks.y=ny; ducks.D=true;  } else { ducks.D=false; }
  if (keys[65]) { var nx=ducks.x-ducks.speed; if(!blocked(nx,ducks.y)) ducks.x=nx; ducks.L=true;  } else { ducks.L=false; }
  if (keys[68]) { var nx=ducks.x+ducks.speed; if(!blocked(nx,ducks.y)) ducks.x=nx; ducks.R=true;  } else { ducks.R=false; }
  if (ducks.U) { if (ducks.L) { ducks.d=lerp(ducks.d,-180,0.1); } else { ducks.d=lerp(ducks.d,180,0.1); } }
  if (ducks.D) { ducks.d=lerp(ducks.d,0,0.1);   }
  if (ducks.L) { ducks.d=lerp(ducks.d,-90,0.1); }
  if (ducks.R) { ducks.d=lerp(ducks.d,90,0.1);  }
  if (keys[32]) {
    if (ducks.stamina > 1) { ducks.speed=4; } else { ducks.speed=2; }
    if (ducks.stamina > 0) { ducks.stamina-=0.2; }
  } else {
    ducks.speed=2;
    if (ducks.stamina < 100) { ducks.stamina+=0.3; }
  }
}

function ducklol(x, y, r, sz) {
  push();
  translate(x,y); rotate(r); scale(sz/400);
  stroke(0,0,0); strokeWeight(10);
  fill(0,0,0); ellipse(0,57,186,100);
  strokeWeight(176); line(0,0,0,267);
  stroke(255); strokeWeight(166); line(0,0,0,265);
  noStroke(); fill(255,217,0); ellipse(0,57,186,100);
  fill(0,0,0); ellipse(-63,3,20,20); ellipse(63,3,20,20);
  noFill(); stroke(0,0,0); strokeWeight(10);
  arc(0,38,182,67,33,146);
  pop();
}

var carrott   = { ang:0, sz:1 };
var obstacles = [
  { x:180, y:260, r:120 },
  { x:616, y:300, r:140 }
];

function carrot() {
  carrott.ang = atan2(ducks.x, ducks.y-30);
  push();
  scale(carrott.sz);
  stroke(0); strokeWeight(3);
  beginShape(); vertex(50,31);  endShape(CLOSE);
  beginShape(); vertex(-9,-67); endShape();
  beginShape(); vertex(4,-72);  endShape();
  beginShape(); vertex(15,-72); endShape();
  noStroke();
  fill(255,164,61);
  beginShape();
  vertex(50,31); bezierVertex(30,51,-30,51,-50,31);
  bezierVertex(-50,31,-89,-46,-50,-70);
  bezierVertex(-50,-70,-12,-95,50,-70);
  bezierVertex(89,-46,50,31,50,31);
  endShape(CLOSE);
  fill(232,156,75);
  beginShape(); vertex(50,-41); bezierVertex(51,-20,-30,-18,-41,-32); bezierVertex(-30,-21,51,-25,50,-41); endShape(CLOSE);
  beginShape(); vertex(42,-6);  bezierVertex(2,-3,-49,-12,-61,-32);   bezierVertex(-50,2,18,-3,42,-6);   endShape(CLOSE);
  fill(118,194,113); beginShape(); vertex(-9,-67); bezierVertex(30,-195,-112,-235,-23,-75); endShape();
  fill(132,204,126); beginShape(); vertex(4,-72);  bezierVertex(95,-195,-38,-262,-15,-71);  endShape();
  fill(104,179,97);  beginShape(); vertex(15,-72); bezierVertex(120,-195,20,-222,3,-68);    endShape();
  fill(179,157,117);
  ellipse(-28,39,30,20); ellipse(-5,48,27,20); ellipse(33,43,27,20); ellipse(55,46,30,20);
  fill(207,195,157);
  ellipse(-45,39,30,20); ellipse(-24,48,27,20); ellipse(16,47,27,20); ellipse(48,39,30,20);
  pop();
  if (dist(ducks.x,ducks.y,0,30) < 65+carrott.sz*30) {
    ducks.x += sin(carrott.ang)*ducks.speed*1.1;
    ducks.y += cos(carrott.ang)*ducks.speed*1.1;
  }
}

var yy = 0;
var tree = function() {
  push(); translate(100,yy); fill(145,107,61); noStroke();
  beginShape();
  vertex(127,yy+193); vertex(148,yy+201); vertex(160,yy+209); vertex(161,yy+213);
  vertex(161,yy+203); vertex(162,yy+233); vertex(166,yy+296); vertex(167,yy+314);
  vertex(154,yy+336); vertex(141,yy+346); vertex(124,yy+351); vertex(103,yy+355);
  vertex(167,yy+355); vertex(184,yy+352); vertex(186,yy+364); vertex(179,yy+375);
  vertex(210,yy+364); vertex(213,yy+363); vertex(217,yy+359); vertex(223,yy+355);
  vertex(229,yy+357); vertex(290,yy+357); vertex(264,yy+344); vertex(251,yy+325);
  vertex(244,yy+311); vertex(234,yy+212); vertex(236,yy+201);
  endShape(CLOSE);
  strokeWeight(2); stroke(71,43,26,100);
  line(178,yy+275,180,yy+314); line(206,yy+246,207,yy+342); line(183,yy+210,187,yy+281);
  for (var i=-87; i<28; i+=39) { fill(196,159,78); rect(181,yy+i+304,47,11); }
  noStroke(); fill(71,43,26,100);
  beginShape(); vertex(238,yy+195); vertex(236,yy+200); endShape(CLOSE);
  beginShape();
  vertex(246,yy+315); vertex(270,yy+356); vertex(224,yy+355);
  vertex(235,yy+305); vertex(226,yy+246); vertex(238,yy+257);
  endShape(CLOSE);
  beginShape(); vertex(146,yy+355); vertex(181,yy+318); vertex(185,yy+351); endShape(CLOSE);
};

var treehouse = function() {
  fill(196,163,92); stroke(181,143,62);
  quad(74,yy+186,75,yy+191,232,yy+202,232,yy+196);
  quad(232,yy+202,232,yy+196,298,yy+171,298,yy+171);
  quad(106,yy+179,77,yy+186,232,yy+197,216,yy+180);
  quad(298,yy+170,284,yy+167,223,yy+184,232,yy+196);
  fill(194,155,70);
  quad(110,yy+80,109,yy+177,224,yy+185,224,yy+81);
  quad(224,yy+185,225,yy+81,284,yy+66,284,yy+165);
  noStroke(); triangle(221,yy+87,104,yy+80,163,yy+41);
  for (var xx=-5; xx<99; xx+=21) {
    strokeWeight(2.0); stroke(166,134,53);
    line(110,yy+xx+81,222,yy+xx+88); line(284,yy+xx+72,225,yy+xx+89);
  }
  line(225,yy+64,140,yy+58);
  stroke(161,112,48); strokeWeight(4); fill(209,164,96);
  quad(147,yy+177,148,yy+99,189,yy+102,189,yy+181);
  ellipse(178,yy+148,1,5);
  fill(157,198,199); quad(245,yy+153,271,yy+146,271,yy+104,245,yy+112);
  strokeWeight(2.5); line(258,yy+110,259,yy+149); line(246,yy+133,271,yy+126);
  fill(0,0,0,25); noStroke();
  quad(284,yy+80,284,yy+168,225,yy+184,225,yy+95);
  quad(172,yy+44,186,yy+49,120,yy+88,79,yy+100);
  fill(150,102,35); stroke(150,102,35);
  triangle(82,yy+95,109,yy+93,113,yy+74);
  strokeWeight(9); line(113,yy+78,158,yy+47);
  fill(161,112,52); stroke(161,112,52); strokeWeight(3);
  quad(155,yy+45,237,yy+103,297,yy+72,207,yy+19);
  line(156,yy+45,81,yy+95); pop();
};

var treeleaves = [];
for (var i = 0; i < 155; i++) {
  treeleaves.push({ xx:random(39,127), zz:random(50,121), ww:random(10,50), jj:random(10,50) });
}

var house = function(x,y) {
  noStroke(); push(); fill(0); rect(51,302,290,110);
  for (var i=0; i<10; i++) {
    fill(110,55,0); rect(50,i*12+250,300,11,20);
    fill(0,40);    rect(50,i*12+250,300,11/2,20,20,0,0);
  }
  fill(150); rect(50,250,300,15);
  fill(0,30); rect(-25,250,150,15);
  fill(50);  rect(-76,251,15,5,2);
  fill(100); rect(-76,242,7,15,2);
  fill(0);
  ellipse(-55,370,35,35); ellipse(310-140,370,35,35);
  fill(150);
  ellipse(-55,370,25,25); ellipse(310-140,370,25,25);
  fill(0,30);
  arc(-55,370,25,25,90,270); arc(310-140,370,25,25,90,270);
  pop();
};

var door = function(x,y) {
  noStroke(); push(); translate(x-200,y-320);
  fill(133,53,0);  rect(175,285,50,80,5);
  fill(0,200,255); rect(176,266,30,26,5);
  fill(0,30);      rect(162,285,25,80,5);
  fill(0);         rect(181,327,10,5,5);
  pop();
};

var windoww = function(x,y) {
  noStroke(); push(); translate(x,y);
  fill(133,53,0);  rect(0,0,50,40,5);
  fill(0,200,255); rect(-1,0,40,30,5);
  fill(0,40);      rect(-13,0,25,40,5);
  pop();
};

var pankakes = [];
function pancakes(x,y) {
  push(); translate(x,y); strokeWeight(3); noStroke();
  fill(207,207,207); ellipse(0,0,50,15); ellipse(0,3,40,15);
  fill(255,253,209); ellipse(0,-3,41,15);
  fill(219,175,134); ellipse(0,-5,41,15);
  fill(255,253,209); ellipse(0,-8,41,15);
  fill(219,175,134); ellipse(0,-10,41,15);
  fill(255,253,209); ellipse(0,-13,41,15);
  fill(219,175,134); ellipse(0,-15,41,15);
  fill(255,253,209); ellipse(0,-18,41,15);
  fill(219,175,134); ellipse(0,-21,41,15);
  fill(255,253,209); quad(-10,-22,0,-18,9,-22,0,-26);
  pop();
}

function pancakecola(x,y) {
  push(); translate(x,y); strokeWeight(3); stroke(0);
  ellipse(0,-1,50,10); ellipse(-8,0,35,18); ellipse(8,0,35,18); ellipse(0,-3,41,15);
  noStroke(); fill(207,207,207); ellipse(0,0,50,15); ellipse(0,3,40,15);
  for (var i=0; i<ducks.pancakes; i++) {
    push(); translate(0,-4*i);
    fill(255,253,209); ellipse(0,-3,41,15);
    fill(219,175,134); ellipse(0,-5,41,15);
    fill(255,253,209); quad(-10,-7,0,-3,9,-7,0,-11);
    pop();
  }
  pop();
}

function serve_pancakes(strv,beef) {
  if (pankakes.length < strv) {
    pankakes.push({ x:random(-1000,1000), y:random(-1000,1000) });
  }
  for (var i=0; i<pankakes.length; i++) {
    switch(beef) {
      case "back":
        if (pankakes[i].y < ducks.y+13) {
          pancakes(pankakes[i].x,pankakes[i].y);
          if (dist(ducks.x,ducks.y,pankakes[i].x,pankakes[i].y) < 40) { ducks.pancakes++; pankakes.splice(i,1); }
        }
        break;
      case "front":
        if (pankakes[i].y > ducks.y+13) {
          pancakes(pankakes[i].x,pankakes[i].y);
          if (dist(ducks.x,ducks.y,pankakes[i].x,pankakes[i].y) < 40) { ducks.pancakes++; pankakes.splice(i,1); }
        }
        break;
    }
  }
}

var shake = 0, shake_time = 0;

var jurassic_grassusses = [];
function grass(x,y) {
  push(); translate(x,y); strokeWeight(2); stroke(0); fill(153,199,166);
  beginShape();
  vertex(-22,2);
  bezierVertex(-22,0,-24,-9,-33,-14); bezierVertex(-33,-14,-24,-14,-20,-8);
  bezierVertex(-20,-8,-20,-14,-25,-23); bezierVertex(-25,-23,-19,-19,-16,-13);
  bezierVertex(-16,-13,-14,-18,-16,-29); bezierVertex(-10,-18,-11,-17,-9,-10);
  bezierVertex(-9,-10,-9,-14,-3,-21); bezierVertex(-3,-21,-4,-12,-2,-6);
  bezierVertex(-2,-6,-2,-18,8,-26); bezierVertex(8,-26,2,-13,5,-4);
  bezierVertex(5,-4,5,-8,8,-16); bezierVertex(8,-16,8,-9,12,-4);
  bezierVertex(12,-4,12,-10,17,-20); bezierVertex(17,-20,17,-9,19,-3);
  bezierVertex(19,-3,19,-8,27,-15); bezierVertex(27,-15,22,-4,23,2);
  endShape(); pop();
}

for (var i=0; i<100; i++) {
  jurassic_grassusses.push({ x:random(-1000,1000), y:random(-1000,1000) });
}
for (var i=0; i<jurassic_grassusses.length; i++) {
  if (dist(jurassic_grassusses[i].x,jurassic_grassusses[i].y,0,0) < 300) { jurassic_grassusses.splice(i,1); }
}

var intro_timer = 1000;
var scene2b     = "menu";

function game() {
  background(149,191,161);
  shake_time--;
  push();
  translate(cam.x+300+shake, cam.y+400+shake);
  noStroke(); fill(169,214,182); rect(0,0,2000,2000);
  for (var i=0; i<jurassic_grassusses.length; i++) { grass(jurassic_grassusses[i].x,jurassic_grassusses[i].y); }

  function drawLeaves(tx,ty,sc) {
    for (var j=0; j<treeleaves.length; j++) {
      noStroke(); push(); translate(tx,ty); if(sc) scale(sc);
      fill(69,138,35);  ellipse(treeleaves[j].xx,treeleaves[j].zz-50,treeleaves[j].ww,treeleaves[j].jj);
      fill(61,128,26);  ellipse(treeleaves[j].xx,treeleaves[j].zz,   treeleaves[j].ww,treeleaves[j].jj);
      pop();
    }
  }
  drawLeaves(99,44,null); drawLeaves(141,-17,1.3); drawLeaves(248,56,1.2); drawLeaves(251,14,null);

  serve_pancakes(20,"back");
  dirt();

  // Collect all ducks (local + remote) and sort by Y for depth
  var allDucks = [{ isLocal:true, x:ducks.x, y:ducks.y }];
  for (const [id,p] of Object.entries(otherPlayers)) {
    if (id !== mySocketId) allDucks.push({ isLocal:false, id, p, x:p.x, y:p.y });
  }
  allDucks.sort((a,b) => a.y - b.y);

  // Render carrot then each duck in Y order
  carrot();
  for (var i=0; i<allDucks.length; i++) {
    var d = allDucks[i];
    if (d.isLocal) { duck(ducks.x, ducks.y); }
    else { drawOtherDuck(d.p.x, d.p.y, d.p, d.id.slice(0,6)); }
  }

  drawLeaves(99,44,null); drawLeaves(141,-17,1.3); drawLeaves(248,56,1.2); drawLeaves(251,14,null);
  tree(); treehouse();
  push(); translate(616,222); house(0,-18); door(87,358); windoww(-16,302); pop();
  textSize(30); textFont("Courier"); fill(0); noStroke();
  text("Welcome to The Duck Game!",-173,240);
  serve_pancakes(20,"front");

  // Player count badge
  var totalPlayers = Object.keys(otherPlayers).length;
  if (totalPlayers > 1) {
    noStroke(); fill(0,160);
    rect(-270,350,120,22,5);
    textSize(12); fill(255); textFont("Courier");
    text("Players: "+totalPlayers, -270, 350);
  }

  pop();

  // Offer pancake prompt
  if (dist(ducks.x,ducks.y,0,30) < 80+carrott.sz*30) {
    fill(0,50); noStroke(); rect(300,550,265,40,5);
    textSize(24); fill(0); textFont("Courier");
    text('"E" offer pancakes',300,550);
    if (keys[69]) {
      if (frameCount%20<1 && ducks.pancakes>0) {
        ducks.pancakes--; carrott.sz+=0.02; shake_time=30;
      }
    }
  }
  honk();
  emitMove();

  noStroke(); fill(255,153,0);
  push(); translate(300,400); rotate(-carrott.ang+180);
  ellipse(0,84,10,10); ellipse(2,80,10,10); ellipse(-2,80,10,10);
  ellipse(0,89,5,5);   ellipse(-6,77,5,5);  ellipse(6,77,5,5);
  pop();
  stroke(0); fill(185,231,235);
  quad(20,580,20,570,20+ducks.stamina,570,25+ducks.stamina,580);
  textSize(30); fill(0,0,0); noStroke();
  text(ducks.pancakes,50,548);
  pancakecola(50,522);
  textSize(16); fill(0,0,0); textFont("Courier");
  text("STAMINA",62+ducks.stamina,575);
  cam.x = lerp(cam.x,-ducks.x,0.1);
  cam.y = lerp(cam.y,-ducks.y,0.1);
  if (!(ducks.x>-1000&&ducks.x<1000&&ducks.y>-1000&&ducks.y<1000)) {
    fill(0,50); noStroke(); rect(300,300,601,601);
  }
  if (shake_time>0) { shake=random(-2,2); }
}

function menu() {
  background(123,86,245);
  textSize(50); fill(0); text("The",150,46); fill(255); text("The",150,48);
  textSize(103); fill(0); text("Duck",150,98); fill(255); text("Duck",150,100);
  fill(0); text("Game",150,168); fill(255); text("Game",150,170);
  textSize(190); fill(0); text("🦆",350,118); fill(255); text("🦆",350,120);
  textSize(20); fill(0); text("click duck to start",147,224); fill(255); text("click duck to start",147,226);
  textSize(25);
  fill(0);   text("HTML/CSS by 8bitCAP",101,581); text("by ƬӨΣKПΣΣ",101,571);
  fill(255); text("HTML/CSS by 8bitCAP",101,583); text("by ƬӨΣKПΣΣ",101,573);
  push(); translate(310,301); rotate(-34);
  if (dist(mouseX,mouseY,310,301) < 35) {
    scale(1.2);
    if (clicked && scene===scene2b) { intro_timer=110; scene2b="how"; }
  }
  textSize(113); fill(0); text("?",0,-2); fill(255); text("?",0,0);
  pop();
  if (dist(mouseX,mouseY,381,407) < 75) {
    if (clicked && scene===scene2b) { intro_timer=110; scene2b="game"; }
    push(); translate(385,414); rotate(-30); _drawBigDuck(); pop();
  } else {
    push(); translate(399,438); rotate(-30); _drawBigDuck(); pop();
  }
}

function _drawBigDuck() {
  stroke(0,0,0); strokeWeight(10); fill(0,0,0); ellipse(0,57,186,100);
  strokeWeight(176); line(0,0,0,267);
  stroke(255); strokeWeight(166); line(0,0,0,265);
  noStroke(); fill(255,217,0); ellipse(0,57,186,100);
  fill(0,0,0); ellipse(-63,3,20,20); ellipse(63,3,20,20);
  noFill(); stroke(0,0,0); strokeWeight(10); arc(0,38,182,67,33,146);
}

function how() {
  background(103,81,245);
  push(); translate(77,551);
  if (dist(mouseX,mouseY,77,551) < 40) {
    scale(1.2);
    if (clicked && scene===scene2b) { intro_timer=110; scene2b="menu"; }
  }
  textSize(35); fill(0); text("Menu",0,-2); fill(255); text("Menu",0,0);
  textSize(120); fill(255); text("⇦",-5,4);
  pop();
  textSize(50); fill(255); text("how?",300,44);
  textSize(27); fill(255);
  text("1. Be duck\n\n2. Collect pancakes,\n3. Feed said pancakes to carrot,\n4. Watch carrot\ngrow\n5. Repeat\n\n[W]\n[A][S][D]\nto move\n\n[space] to sprint",300,329);
  fill(255); textSize(15);
  text("the following steps are optional:",308,190);
}

function draw() {
  intro_timer += 2;
  textAlign('center','center');

  switch(scene) {
    case "game":
      game();
      var dc = dist(ducks.x,ducks.y,-5,48);
      textFont("Comic Sans MS"); textSize(15); fill(0); noStroke();
      text("Meters from carrot: "+round(dc/50),93,46);
      text("Carrot size: "+round(carrott.sz),93,29);
      break;
    case "menu": menu(); break;
    case "how":  how();  break;
  }

  if (intro_timer < 420) {
    push(); translate(300,300);
    for (var i=0; i<14; i++) { rotate(28); ducklol(0,350+sin(intro_timer)*300,0,500); }
    ducklol(0,350+sin(intro_timer)*300,0,1000);
    pop();
    if (intro_timer >= 268 && intro_timer < 272) {
      scene = scene2b;
      // When entering the game, join the room
      if (scene === "game") {
        const roomName = roomInput.value.trim() || 'duck-game';
        roomOverlay.style.display = 'none';
        joinRoom(roomName);
      }
      // Show overlay again if going back to menu
      if (scene === "menu") {
        roomOverlay.style.display = 'flex';
      }
    }
  }

  clicked = false;
  frameCount++;
  requestAnimationFrame(draw);
}

// ─── Kick off ─────────────────────────────────────────────────────────────────
textAlign('center','center');
textFont("Courier");
requestAnimationFrame(draw);
