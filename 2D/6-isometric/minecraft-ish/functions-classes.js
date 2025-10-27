class Material {
  constructor(val) {
    this.ocean = { ...hsl(230, 50, 40, 0.7, true), type: "water" };
    this.water = { ...hsl(210, 60, 50, 0.6, true), type: "water" };
    this.shallow = { ...hsl(195, 60, 60, 0.5, true), type: "water" };
    this.sand = { ...hsl(50, 30, 70, 1, true), type: "sand" };
    this.grass = { ...hsl(120, 50, 45, 1, true), type: "land" };
    this.earth = { ...hsl(45, 50, 30, 1, true), type: "land" };
    this.rock = { ...hsl(20, 0, 40, 1, true), type: "platau" };
    this.snow = { ...hsl(0, 0, 90, 1, true), type: "snow" };
    this.bedrock = { ...hsl(0, 0, 20, 1, true), type: "snow" };
    this.air = { ...hsl(210, 60, 90, 0.0, true), type: "air" };
    this.caveAir = { ...hsl(210, 60, 90, 0.2, true), type: "air" };

    this.white = { ...hsl(0, 0, 100, 1, true), type: "white" };
    this.black = { ...hsl(0, 0, 0, 1, true), type: "black" };

    this.val = val;
    this.mat = null;
  }
  // returns an elemnt
  getByVal(val, type) {
    if (type === "air") return this.air;
    if (type === "cave") return this.caveAir;

    if (val > 250) return this.snow;
    if (val > 200) return this.rock;
    if (val > 190) return this.earth;
    if (val > 160) return this.grass;
    if (val > 120) return this.sand;
    if (val > 110) return this.shallow;
    if (val > 100) return this.water;
    if (val >= 0) return this.ocean;
    return this.white;
  }
  continentalness(height, scale = 1) {
    height /= scale;
    // mountain cliff
    if (height > 0.8) {
      return scaleNum(height, 0, 1, 0.8, 1) * scale;
      // high ground
    } else if (height > 0.5) {
      return scaleNum(height, 0, 1, 0.5, 0.9) * scale;
      // flat grass
    } else if (height > 0.4) {
      return scaleNum(height, 0, 1, 0.35, 0.4) * scale;
      // water level
    } else if (height < 0.4) {
      return scaleNum(height, 0, 1, 0, 0.1) * scale;
    }
    return height * scale;
  }
}

/** Number seeder */
class NumSeeder {
  constructor(seed = 0) {
    this.s = seed;
    this.inc = 0; //randint(10000)
    log("-- seeding:", seed);
  }
  get() {
    // mulberry32 // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    //this.inc++
    // return str((posInt(tan(this.inc))))[4]
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

function rotateX(x, y, z, theta = gThetaX) {
  const X = x;
  const Y = y * cos(theta) - z * sin(theta);
  const Z = y * sin(theta) + z * cos(theta);
  return { x: X, y: Y, z: Z };
}

function rotateY(x, y, z, theta = gThetaY) {
  const Y = y;
  const X = x * cos(theta) + z * sin(theta);
  const Z = z * cos(theta) + x * sin(theta);
  return { x: X, y: Y, z: Z };
}

function rotateZ(x, y, z, theta = gThetaZ) {
  const X = x * cos(theta) - y * sin(theta);
  const Y = x * sin(theta) + y * cos(theta);
  const Z = z;
  return { x: X, y: Y, z: Z };
}

function nameConvert(x, y, z) {
  if (typeof x === "object") {
    return x.x + ";" + x.y + ";" + x.z;
  }
  return x + ";" + y + ";" + z;
}

// window.onkeydown = (e)=> {
//   if(pause) return
//   const ev = e.key
//   if(ev === 'ArrowLeft') {
//     gThetaX += gThetaInc
//   } else if(ev === 'ArrowRight') {
//     gThetaX -= gThetaInc
//   } else if(ev === 'ArrowDown') {
//     gThetaY += gThetaInc
//   } else if(ev === 'ArrowUp') {
//     gThetaY -= gThetaInc
//   }
// }

/** main cube class */
class Cube {
  constructor(x, y, z, v) {
    this.init(x, y, z, v)
  }
  init(x, y, z, v, material = null) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.v = v;

    this.projx = x;
    this.projy = y;
    this.projz = z;
    this.mat = material;
    this.id = nameConvert(x, y, z)

  }
  project() {
    // project point in space
    if (gThetaY != 0) {
      const { x, y, z } = rotateY(this.x, this.y, this.z);
      this.projx = x;
      this.projy = y;
      this.projz = z;
    }
    if (gThetaX != 0) {
      const { x, y, z } = rotateX(this.x, this.y, this.z);
      this.projx = x;
      this.projy = y;
      this.projz = z;
    }
  }
  draw() {
    drawBLock(this);
  }
}

function testPerlin() {
  /* low      high        df      zoff*/
  // -0.147   0.559       50      z/
  // -1       0.875       2       z/
  // -0.1&.2  0.559       2000    z/ & keep. values are inversly proprotional with zoff
  // 2000 'low:' -0.948 'high:' 0.952 'df:' 1500

  function run(count = 10, df = 100) {
    let xl = (yl = count);
    const rawValues = [];
    for (let y = 0; y < yl; y++) {
      for (let x = 0; x < xl; x++) {
        let value = noise.simplex3(x / df, y / df, zoff);
        //
        //value = (1 + value) * 1.1 * 128;
        rawValues.push(toFixed(value));
      }
    }
    // to scale numbers to a scale
    const sorted = rawValues.sort((a, b) => a - b);
    const low = sorted[0];
    const high = sorted[sorted.length - 1];
    log(count, "low:", low, "high:", high, "df:", df);
  }

  // 278.25, 3.261
  //  'high:' 278.339 'low:' 3.261
  const a = [
    () => run(1200, 50),
    () => run(1200, 100),
    () => run(1200, 200),
    () => run(2000, 500),
    () => run(2000, 1000),
    () => run(2000, 1500),
  ];

  window.onkeydown = async () => {
    if (a.key === "t") return;
    for (let i of a) {
      await sleep();
      i();
      zoff += 0.05;
    }
  };
}
