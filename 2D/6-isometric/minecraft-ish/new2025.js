class Grid {
  constructor() {
    this.cubes = new Map()
  }

  getCube(x, y, z, val) {
    const key = nameConvert(x, y, z)
    const existing = this.cubes.get(key)
    if (existing) {
      if (existing.v === val) {
        return existing
      }
      existing.init(x, y, z, val)
      return existing
    }
    const cube = new Cube(x, y, z, val)
    this.cubes.set(key, cube)
    return cube
  }
  copyCube(key, existingId) {
    if (!this.cubes.has(key)) {
      this.cubes.set(key, this.cubes.get(existingId))
    }
  }

  #generate() {
    const { df, df2 } = noiseEff;

    for (let y = 0; y < gridSize.y; y++) {
      for (let x = 0; x < gridSize.x; x++) {
        const perlVal =
          ((1 + noise.perlin3(x / df, y / df, zoff)) / 2) * gridSize.z;
        // continentalness (high steep mountains)
        const CON = material.continentalness(perlVal, gridSize.z);
        // peaks & valleys (high contrast)
        const PV =
          ((1 + noise.perlin3(x / (df / 2), y / (df / 2), zoff)) / 2) * gridSize.z;
        // erosion (wide speader area), low df
        const ERO =
          ((1 + noise.perlin3(x / (df * 2), y / (df * 2), zoff)) / 2) * gridSize.z;

        const rv = Math.round((PV + ERO + CON) / 3);
        const res = this.getCube(x, y, rv, rv);
        res.mat = material.getByVal(rv * (360 / gridSize.z));

        // filling the complete horizontal reach of every x,y
        for (let z = 0; z < gridSize.z; z++) {
          let val = 240;
          let type = null;
          if (z > rv && z > terrain.waterlevel) {
            type = "air";
          } else if (z === rv) {
            this.copyCube(nameConvert(x, y, rv), res.id);
            continue;
          } else if (z > rv && z <= terrain.waterlevel) {
            // under sealevel
            if (res.mat.type === material.water.type) val = 0;
            else continue
          }
          //log(val, isair)
          const n = this.getCube(x, y, z, val);
          n.mat = material.getByVal(val, type);
        }
      }
    }
  }

  draw() {
    this.#generate()
    for (const [k, v] of this.cubes) {
      v.draw()
    }
  }
}


const lightDisMap = new Map()
function drawBLock(pt) {
  const { projx: x, projy: y, projz: z, v, mat: cl } = pt;

  const lightkey = nameConvert(x, y, z)
  const existingLight = lightDisMap.get(lightkey)

  const lightDis = existingLight??
    distanceToZ(
      {
        x: x * tileWidth,
        y: y * tileHeight,
        z: (z * (tileHeight + tileWidth)) / 2,
      },
      lighting
    ) / 10;

    if(!existingLight){
      lightDisMap.set(lightkey, lightDis)
    }

  // global light value
  const glv =
    cl.type === "air"
      ? cl.l
      : (((lightDis * z * lighting.l) / gridSize.tile) * cl.l) / 50;
  //const glv = cl.l

  const top = hsl(cl.v, cl.s, glv, cl.a),
    left = hsl(cl.v, cl.s, glv * 0.6, cl.a),
    right = hsl(cl.v, cl.s, glv * 0.8, cl.a);
  const th = tileHeight;
  let zileHeight = (z + (cl.type === material.water.type ? 0.5 : 0)) * th;

  ctx.save();
  ctx.translate(((x - y) * tileWidth) / 2, ((x + y) * th) / 2);

  const topy = th / 2 - zileHeight;
  // bottom
  // ctx.fillStyle = bottom;
  // ctx.beginPath();
  // ctx.moveTo(0, topy + th / 2);
  // ctx.lineTo(tileWidth / 2, topy + th);
  // ctx.lineTo(0, topy + th * 1.5);
  // ctx.lineTo(-tileWidth / 2, topy + th);
  // ctx.closePath();
  // ctx.fill();

  // top
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.moveTo(0, -zileHeight);
  ctx.lineTo(tileWidth / 2, topy);
  ctx.lineTo(0, th - zileHeight);
  ctx.lineTo(-tileWidth / 2, topy);
  ctx.closePath();
  ctx.fill();
  // left

  ctx.fillStyle = left;

  ctx.beginPath();
  ctx.moveTo(-tileWidth / 2, topy);
  ctx.lineTo(0, th - zileHeight);
  ctx.lineTo(0, th - zileHeight + th);
  ctx.lineTo(-tileWidth / 2, topy + th);
  ctx.closePath();
  ctx.fill();

  // left
  ctx.fillStyle = right;
  ctx.beginPath();
  ctx.moveTo(tileWidth / 2, topy);
  ctx.lineTo(0, th - zileHeight);
  ctx.lineTo(0, th - zileHeight + th);
  ctx.lineTo(tileWidth / 2, th / 2 - zileHeight + th);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

const main = () => {
  noise.seed(12);
  ctx.background("#111");
  //ctx.scale(0.8, 0.8)
  //grid.generate()
  //ctx.clearRect(-Xmax, -Ymax, Xmax, Ymax)
  window.onclick = () => {
    pause = true;
  };
  zoff = 1;

  let times = []

  const animate = async () => {
    const t = Date.now()
    clear();

    ctx.translate(spX, spY);
    grid.draw();
    ctx.translate(-spX, -spY);

    zoff += 0.05;
    // await pauseHalt();
    // await sleep(0.5);
    const n = Date.now() - t
    times.push(n)
    console.log(n, times.average())
    requestAnimationFrame(animate)
  };
  animate();
};

const material = new Material();
const grid = new Grid();

window.onload = () => main();

/*
TODO real-time:
- DONE* fix shes/light on blocks related to lighting
  * Z not working

TODO
- put all vars in changeable state/object: settings = {...}

TODO background:
- roation around own axis using arrows
- fix materals e.g. all type of rock




*/
