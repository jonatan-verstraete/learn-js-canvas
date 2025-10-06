const __s = 700;
const __x = Xmax / 2 + __s;
const __y = Ymax / 2 - __s;

let base = [0, 0, Xmax, Ymax];
let frames = 0

const isVisible = ({ x, y }) => {
  if (
    x > base[0] + offsetX &&
    y > base[1] + offsetY &&
    x < base[2] + offsetX &&
    y < base[3] + offsetY
  ) {
    return true;
  }
};

const Seeder = {
  s: 0,
  inc: 0,
  get() {
    // mulberry32 // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    //this.inc++
    // return str((posInt(tan(this.inc))))[4]
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  },
};

// triangle
const getPts = () => {
  const s = __s * scale;
  const _x = __x + s;
  const _y = __y + s;

  base = [
    offsetX * scale,
    offsetX * scale,
    (offsetX + Xmax) * scale,
    (offsetY + Ymax) * scale,
  ];

  // return [
  //   { x: _x, y: _y },
  //   { x: _x + s, y: _y + s },
  //   { x: _x + s, y: _y - s },
  //   { x: _x - s, y: _y - s },
  // ]

  return [
    { x: _x, y: _y },
    { x: _x + s / 2, y: _y + s },
    { x: _x - s / 2, y: _y + s },
  ];
};
// will be overwritten in the ondraw once we changed the viewbox
let PTS = getPts();

let col = 0;
const getColor = (p) => {
  return hsl(p.dis % 360);
};

let current = PTS.random();
const draw = () => {
  const res = [];
  let prev;
  for (const _____void_____ of range(1000)) {
    const target = PTS.random();
    // const target = PTS[Math.round(Seeder.get() * 1000) % 3];

    let dis = distanceTo(current, target);

    // if (prev) {
    //   let a = 50;
    //   let b = a/3;

    //   // b = a/2
    //   // dis /= sin(tan(prev.x) * prev.dis) * cos(tan(prev.y) * dis)
    //   // dis -= cos(prevDis/a) * b

    //   current.x += sin(prev.x/a) *  (prev.dis/b)
    //   current.y += cos(prev.y/a) *  (prev.dis/b)
    // }

      // WAW: this generates high res noise! pi/3, but why?
    // dis += frames/10
    // current = posTowards(current, target, dis / (PI / 3));
    current = posTowards(current, target, dis / 2);
    current.dis = dis;



    // current = posTowards(current, target, dis / 2 + 1 * tan(dis));

    res.push(current);
    prev = { ...current };
  }

  for (const p of res.filter(isVisible)) {
    circle(p.x, p.y, 0.9, getColor(p));
  }
};

let animateId = 0;
const animate = async () => {
  clear("#ffffff06")
  draw();
  frames++
  animateId = requestAnimationFrame(animate);
};

ctx.invert();

animate();
