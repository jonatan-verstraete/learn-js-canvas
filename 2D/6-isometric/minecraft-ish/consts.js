

const gridSize= {
    tile: 20,
    x: 80,
    y: 80,
    z: 30
}

const tileWidth= gridSize.tile,   
tileHeight= gridSize.tile/2,
// the hihgest number could be assigned to key points, it's scaled so doenst matter what value. def 360
// generationMaxValue=  30,
// lighting, position and (not actually) lightness. def {* * 3 1}
lighting= {
  x: -500, 
  y: -30,
  z: gridSize.z,
  l: 0.5,
};

/** UI interactive variables */
// the current posisiton of the map
let spX = Xmid,
spY = gridSize.y ;

// store grid in a map
const gridMap = new Map()


const noiseEff = {
    // noise scale: the height of the noise, def 1
    sx: 1,
    sy: 1,
    // defuse?: how much we de-contrast the noise, def 50-1500, depending on size
    df: 18,
    df: 20,
    // detail
    // df2: 16,
}
let zoff = 10


const terrain = {
  waterlevel: gridSize.z*0.3 > 3 ? gridSize.z * 0.3 : 3,
  sx: 40,
  sy: 40,
  sz: 0,
  lighting: {
    x: 50, 
    y: -30,
    z: 3,
    // l: 2,
  },
}
