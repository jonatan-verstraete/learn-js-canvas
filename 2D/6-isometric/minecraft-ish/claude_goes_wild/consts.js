// Optimized constants
const gridSize = {
  tile: 20,
  x: 80,
  y: 80,
  z: 30,
};

const tileWidth = gridSize.tile;
const tileHeight = gridSize.tile / 2;

const lighting = {
  x: -500,
  y: -30,
  z: gridSize.z,
  l: 0.5,
};

let spX = Xmid;
let spY = gridSize.y;

const noiseEff = {
  sx: 1,
  sy: 1,
  df: 20,
};

let zoff = 10;

const terrain = {
  waterlevel: gridSize.z * 0.3 > 3 ? gridSize.z * 0.3 : 3,
  sx: 40,
  sy: 40,
  sz: 0,
};

// Rotation angles
let gThetaX = 0;
let gThetaY = 0;
let gThetaZ = 0;
