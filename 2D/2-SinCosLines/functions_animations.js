/** Main */
class Animate {
  constructor({
    amp = 150,
    freq = 300,
    space = 0,
    noiseY = 0,
    noiseX = 0,
    cursive = 0,
    direction = -1,
    amount = 1,
    startPointY = Ymax - 400,
    flowMid = startPointY / 2,
    adder = 0,
    horizon = 5000,
    loopLength = 10000,
    linesAmount = 5000,
    innerCircle = true,
    radius = 100,
    circleHeigth = 1,
    circleWidth = 1,
    ballOnly = false,
    speed = 0.01,
    color = 100,
    gradient = true,
    gradientReachMin = 0,
    gradientReachMax = 360,
    gradientCount = 1,
    gradientSpeed = 1,
    movingGradient = false,
    saturation = 40,
    transparency = 0.2,
    grayscale = false,
    clearColor = undefined
  } = {}) {
    this.amp = amp;
    this.freq = freq;
    this.space = space;
    this.noiseY = noiseY;
    this.noiseX = noiseX;
    this.cursive = cursive;
    this.direction = direction;
    this.transparency = transparency;
    this.amount = amount;
    this.startPointY = startPointY;
    this.flowMid = flowMid;
    this.adder = adder;
    this.loopLength = loopLength;
    this.linesAmount = linesAmount;
    this.innerCircle = innerCircle;
    this.radius = radius;
    this.circleHeigth = circleHeigth;
    this.circleWidth = circleWidth;
    this.ballOnly = ballOnly;
    this.horizon = horizon;
    this.speed = speed;
    this.color = color;
    this.saturation = grayscale ? 0 : saturation;
    this.gradient = gradient;
    this.gradientReachMin = gradientReachMin;
    this.gradientReachMax = gradientReachMax;
    this.gradientSpeed = gradientSpeed;
    this.movingGradient = movingGradient;
    this.currentGradient = 0;
    this.clearColor = clearColor

    this.colorModulus = Math.round(
      this.linesAmount / (gradientReachMax * gradientCount)
    );
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    //ctx.shadowColor = "#ff00002f"
    ctx.strokeStyle = `hsla(${this.color},${saturation}%,50%,${transparency})`;
    ctx.lineWidth = 0.3;

    this.a = 0;
    this.b = 0;
    this.randomness = 0;

    // storing the inital values so we can reset them when needed
    this.origValues = {};
    for (let prop in this) {
      if (this.hasOwnProperty(prop) && prop != "origValues") {
        this.origValues[prop] = this[prop];
      }
    }
  }

  reset() {
    for (let prop in this.origValues) {
      this[prop] = this.origValues[prop];
    }
  }

  async zoomer({ adder = 0.01 } = {}) {
    let sum = 1;
    for (let i = 0; i < 100; i++) {
      if (sum > 1 || sum < -1) {
        adder *= -1;
      }

      sum += adder;
      ctx.scale(sum, sum);

      await sleep(.1);
      await pauseHalt();
    }
  }

  async lightHorizon(horizontal = false) {
    this.adder = 15;
    return await this.#main(() => {
      ctx.moveTo(Xmid, Ymid);
      if (horizontal) {
        ctx.lineTo(Math.tan(this.randomness) * this.randomness, this.a);
      } else {
        ctx.lineTo(this.a, Math.tan(this.randomness) * this.randomness);
      }
    });
  }

  async lightBall(ball_only = false) {
    if (ball_only) this.ballOnly = true;
    this.adder = 5;
    return await this.#main(() => {
      if (!this.ballOnly) {
        ctx.moveTo(this.a, Math.tan(this.randomness) * this.a);
      } else {
        ctx.moveTo(this.a, this.a);
        // ?
      }
      const angle = (Math.PI * 2 * this.i - Math.PI * 2 * this.x) / this.a;

      const a1 = Math.cos(angle) * this.radius * this.circleHeigth;
      const a2 = Math.sin(angle) * this.radius * this.circleWidth;
      ctx.lineTo(Xmid - (this.ballOnly ? -a1 : a1), Ymid + a2);
    });
  }

  async lineShow() {
    this.transparency = 1;
    this.adder = 5;
    this.radius = 150;

    return await this.#main(() => {
      const angle = (Math.PI * 2 * this.i - Math.PI * 2 * this.x) / this.b;

      const a1 = Math.cos(angle) * this.radius * this.circleHeigth;
      const a2 = Math.sin(angle) * this.radius * this.circleWidth;
      const a3 =
        Math.cos(angle) * (this.radius * Math.cosh(this.i)) * this.circleWidth;
      const a4 =
        Math.sin(angle) * (this.radius * Math.sin(this.i)) * this.circleWidth;

      ctx.lineTo(Xmid + a1, Ymid - a3);
      ctx.lineTo(Xmid - a2, Ymid - a4);
    });
  }

  async mergingTriagles(someWhatReversed = false) {
    this.transparency = 0.8;
    this.movingGradient = true;

    return await this.#main(() => {
      const angle = (Math.PI * 2 * this.i - Math.PI * 2 * this.x) / this.a;

      const a1 = Math.tanh(angle) * this.radius * this.circleHeigth; //- this.i
      const a2 = Math.sin(angle) * this.radius * this.circleWidth; //+ this.i
      const a3 =
        Math.tanh(angle) * (this.radius * Math.sin(this.i)) * this.circleWidth; // - this.i
      const a4 =
        Math.cos(angle) * (this.radius * Math.cos(this.i)) * this.circleWidth; //- this.i

      ctx.moveTo(Xmid - a3, Ymid - a1);
      ctx.lineTo(Xmid - a4, Ymid + (someWhatReversed ? a2 : -a2));
    });
  }

  async commnunicatingLines() {
    this.transparency = 0.8;
    this.movingGradient = true;
    this.radius = 150;
    return await this.#main(() => {
      const angle = (Math.PI * 2 * this.i - Math.PI * 2 * this.x) / this.a;

      const a1 = Math.tanh(angle) * this.radius;
      const a2 = Math.tanh(angle) * this.radius;
      const a3 = Math.tanh(angle) * (this.radius * Math.sin(this.i));
      const a4 = Math.cos(angle) * (this.radius * Math.cos(this.i));

      ctx.moveTo(Xmid + a3, Ymid + a1);
      ctx.lineTo(Xmid + a4, Ymid + a2);
    });
  }

  async squaredShapes(ball_only = false) {
    if (ball_only) this.ballOnly = true;
    ctx.lineWidth = 1;
    this.transparency = 0.8;
    this.movingGradient = true;
    this.radius = 150;
    this.linesAmount = 5000;
    this.gradient = true;

    return await this.#main(() => {
      const angle = (Math.PI * 2 * this.i - Math.PI * 2 * this.x) / this.a;

      const a1 = Math.tanh(angle) * this.radius * Math.cos(this.i);
      const a2 = Math.sin(angle) * this.radius * Math.sin(this.i);
      const a3 = Math.tanh(angle) * this.radius * Math.sin(this.i);
      const a4 = Math.cos(angle) * this.radius * Math.cos(this.i);

      ctx.moveTo(Xmid - a1, Ymid - a4);
      ctx.lineTo(Xmid - a3, Ymid - a2);
    });
  }

  async foldingWave(moveout = 0) {
    this.adder = moveout;
    this.amp = 100;
    //ctx.strokeStyle = "#00000002";
    return await this.#main(() => {
      ctx.moveTo(this.b, this.randomness);
      ctx.lineTo(this.a, this.b);
    });
  }

  async waveCilinderTwin(flag = false) {
    return await this.#main(() => {
      ctx.lineTo(this.randomness, this.b);
      ctx.lineTo(this.b, this.a);
      ctx.lineTo(this.a, this.randomness);
    });
  }

  async negativeFieldWave(flag = false) {
    return await this.#main(() => {
      ctx.moveTo(this.randomness, this.a);
      ctx.lineTo(Math.tan(this.b) * this.b, this.a);
    });
  }

  async rotatingDisc(flag = false) {
    return await this.#main(() => {
      ctx.moveTo(this.randomness, this.b);
      ctx.lineTo(Math.tan(this.b) * this.b, this.a);
    });
  }

  async fieldWaves(flag = false) {
    this.amp = 300;
    ctx.lineWidth = 5;
    return await this.#main(() => {
      const m = Math.cos(Math.PI * 1.59) * this.randomness;

      ctx.moveTo(Xmin - 100, Ymax + 100 - this.a);
      ctx.lineTo(this.a * m, this.a * m + this.i * 20);
      //ctx.lineTo(this.a+this.randomness * m, this.b * m)
    });
  }

  async windowCleaner(flag = false) {
    this.amp = 500;
    return await this.#main(() => {
      ctx.moveTo(Xmid, Ymid + this.i);
      ctx.lineTo(this.randomness, this.a);
    });
  }

    async windowCleaner2025(flag = false) {
    this.amp = 1;
    return await this.#main(() => {
      ctx.moveTo(Xmid, Ymid + this.i);
      ctx.lineTo(this.randomness, this.a);
    });
  }

  async dancingColors(flag = false) {
    ctx.lineWidth = 1;
    return await this.#main(() => {
      ctx.moveTo(Xmid, Ymid * this.i);
      ctx.lineTo(Math.sin(this.a) * this.a, Math.sin(this.i) + this.b);
    });
  }

  async linesMovement(flag = false) {
    class PointC {
      constructor(speed = 2) {
        this.x = randint(Xmax);
        this.y = randint(Ymax);
        this.speed = {
          x: randfloat(-speed, speed),
          y: randfloat(-speed, speed),
        };
      }
      move() {
        this.x += this.speed.x;
        this.y += this.speed.y;
        if (this.x > Xmax) this.x = Xmin;
        if (this.y > Ymax) this.y = Ymin;
      }
    }

    class Points {
      constructor(amount = 200) {
        this.triangles = false;
        this.reach = 100;
        this.points = [...new Array(amount)].map((i) => new PointC());
      }
      showMovement() {
        this.points.forEach((i) => i.move());

        function closeTo(a, b, r) {
          const disX = inRange(a.x, b.x, r, true);
          const disY = inRange(a.y, b.y, r, true);
          if (disX && disY) return { x: disX, y: disY };
          return false;
        }

        this.points.forEach((i, idx, arr) => {
          let conn = [];

          this.points.forEach((j) => {
            const dis = closeTo(i, j, this.reach);

            if (dis) {
              if (!this.triangles) {
                // ctx.strokeStyle = `#ffffff${ hex(round(4095 - (posInt(dis.x) +posInt(dis.y)/2))) }`
                // log(ctx.strokeStyle)
                ctx.beginPath();
                ctx.moveTo(i.x, i.y);
                ctx.lineTo(j.x, j.y);
                ctx.stroke();
              } else if (conn.length === 3) {
                ctx.beginPath();
                ctx.moveTo(i.x, i.y);
                conn.forEach((c) => {
                  ctx.lineTo(c.x, c.y);
                });
                ctx.fill();
                conn = [];
              } else {
                conn.push(j);
              }
            }
          });
          // square(i.x, i.y)
        });
      }
    }

    const points = new Points();
    this.transparency = 0.5;

    return await this.#main(async () => {
      clear(this.clearColor);
      points.showMovement();
      await sleep(0.1);
      await pauseHalt();
    });
  }

  async test(flag = false) {
    this.amp = 80;
    this.freq = 100;
    this.linesAmount = 1000;
    this.transparency = 100;
    return await this.#main(async () => {
      const m = Math.cos(Math.PI * 1.56) * this.randomness;

      ctx.moveTo(this.i * tan(m) * 2, this.a * tan(m));
      ctx.lineTo(Math.tanh(this.a) * m * 10, this.b);
    });
  }

  /** main */
  async #main(func) {
    for (let x = 0; x < this.loopLength; x += 1) {
      clear(this.clearColor);
      if (
        this.adder == false &&
        (this.flowMid > this.horizon || this.flowMid < -this.horizon)
      ) {
        this.adder *= -1;
      }
      this.flowMid += this.adder;

      for (let gi = 0; gi < this.amount; gi += 1) {
        for (let i = 0; i < this.linesAmount; i += 1) {
          ctx.beginPath();

          if (this.gradient && !this.grayscale) {
            if (i % this.colorModulus == 0) {
              if (this.movingGradient && x % this.gradientSpeed == 0) {
                this.currentGradient += 1;
              }
              ctx.strokeStyle = `hsla(${(
                i / this.colorModulus + this.currentGradient &
                this.gradientReachMax
              ).toFixed(0)},${this.saturation}%,50%,${this.transparency})`;
            }
          }
          this.i = i;
          this.gi = gi;
          this.x = x;
          // fack "this"
          this.a = i - this.flowMid + randint(this.noiseX);
          this.b =
            this.startPointY -
            gi * this.space -
            Math.cos(
              (i + x * this.direction - gi * this.cursive) *
                (Math.PI / this.freq)
            ) *
              this.amp +
            randint(this.noiseY);
          this.randomness =
            this.startPointY -
            10 -
            gi * this.space -
            Math.sin(
              (i - x * this.direction - gi * this.cursive) *
                (Math.PI / this.freq)
            ) *
              this.amp +
            randint(this.noiseY);

          await func();
          ctx.stroke();
        }
      }
      await pauseHalt();
      await sleep(this.speed);
    }
    return true;
  }

  #sketch() {
    /**::: spot light */

    ctx.moveTo(Xmid, Ymid);
    //ctx.lineTo(Math.sin(a) * b, a);
    ctx.lineTo(a, Math.tan(randomness) * randomness);
    //ctx.lineTo(b, Math.cos(a) * a)

    ctx.lineTo(randomness, b);

    /** ::: invisible rectangle */
    // ctx.moveTo(Xmax, Ymin)
    // ctx.lineTo(Math.sin(b) * b, a);

    //ctx.lineTo(Xmax, Ymax)
    //ctx.lineTo(a, randomness);

    //ctx.lineTo(Xmin, Ymax)
    //ctx.lineTo(a, randomness);

    //ctx.lineTo(Xmin, Ymin)
    //ctx.moveTo(Xmax, Ymin)

    /** ______ waves */
    // ctx.lineTo(b,a)
    // ctx.lineTo(a, b)

    /** ______ wave cilinder */

    // ctx.moveTo(b, randomness)
    // ctx.lineTo(a, b)

    /** ______ wave cilinder twins */
    // ctx.lineTo(randomness, b)
    // ctx.lineTo(b, a)
    // ctx.lineTo(a, randomness)

    /** ______ specials B */
    //ctx.moveTo(randomness, b);

    /** 1. lines cilinder */
    //ctx.lineTo(Math.cos(b) * b * 2 , b)

    /** 1.2 lines cilinder randomness */
    //ctx.lineTo(Math.tan(randomness ) - randomness  , randomness * a)

    /** 1.3 lines cilinder a */
    //ctx.lineTo(Math.cosh(a) * a , a)

    /** 1.4 lines cilinder a + randomness */
    //ctx.lineTo(Math.tan(a) * randomness, randomness)

    /** 2 lines around a */
    //ctx.lineTo(Math.tan(randomness) * a, a)

    /** 2.2 clean lines around a + b */
    //ctx.lineTo(Math.tan(b) * b, a)

    //ctx.lineTo(Math.cos(a), a)

    //ctx.lineTo(a, randomness);
  }
}
