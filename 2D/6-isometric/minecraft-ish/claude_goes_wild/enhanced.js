/**
 * 🎮 MINECRAFT-STYLE ISOMETRIC TERRAIN EXPLORER
 * 
 * Features:
 * - Arrow keys to move camera through landscape
 * - Space bar to pause terrain animation
 * - Full cube rendering with proper shading
 * - Minecraft-style terrain generation
 * - Performance HUD
 */

// ============================================
// ENHANCED MATERIAL SYSTEM (Minecraft-style)
// ============================================

class EnhancedMaterial {
  constructor() {
    // Water colors - more vivid blue
    this.deepWater = { ...hsl(220, 80, 35, 1, true), type: "water", id: 0 };
    this.water = { ...hsl(220, 70, 45, 1, true), type: "water", id: 1 };
    this.shallow = { ...hsl(200, 65, 60, 1, true), type: "water", id: 2 };

    // Sand - bright yellow
    this.sand = { ...hsl(50, 70, 75, 1, true), type: "sand", id: 3 };
    this.darkSand = { ...hsl(45, 60, 65, 1, true), type: "sand", id: 4 };

    // Grass - vibrant green
    this.grass = { ...hsl(110, 60, 50, 1, true), type: "land", id: 5 };
    this.darkGrass = { ...hsl(100, 55, 40, 1, true), type: "land", id: 6 };

    // Rock/mountain - gray stone
    this.rock = { ...hsl(0, 0, 55, 1, true), type: "rock", id: 7 };
    this.darkRock = { ...hsl(0, 0, 40, 1, true), type: "rock", id: 8 };
    this.lightRock = { ...hsl(0, 0, 70, 1, true), type: "rock", id: 9 };

    // Peak - white snow
    this.snow = { ...hsl(0, 0, 95, 1, true), type: "snow", id: 10 };
    this.ice = { ...hsl(200, 20, 90, 1, true), type: "snow", id: 11 };
  }

  getByVal(val) {
    if (val < 20) return this.deepWater;
    if (val < 40) return this.water;
    if (val < 60) return this.shallow;
    if (val < 85) return this.darkSand;
    if (val < 110) return this.sand;
    if (val < 140) return this.darkGrass;
    if (val < 170) return this.grass;
    if (val < 200) return this.darkRock;
    if (val < 220) return this.rock;
    if (val < 240) return this.lightRock;
    if (val < 250) return this.ice;
    return this.snow;
  }
}

// ============================================
// ENHANCED TERRAIN RENDERER (Minecraft-style)
// ============================================

class EnhancedTerrainRenderer {
  constructor() {
    this.heights = new Uint16Array(gridSize.x * gridSize.y);
    this.materials = new Uint8Array(gridSize.x * gridSize.y);
    this.screenCoords = [];
    this.lastZoff = -1;

    // Camera/movement state - internal grid offset
    this.gridOffsetX = 0;
    this.gridOffsetY = 0;
    this.zoom = 1;
    this.rotation = 0;

    // Keys state
    this.keys = {};
    this.paused = false;
    this.overlaysVisible = true;

    this.precomputeScreenCoords();
    this.setupControls();
  }

  precomputeScreenCoords() {
    for (let y = 0; y < gridSize.y; y++) {
      for (let x = 0; x < gridSize.x; x++) {
        const x0 = ((x - y) * tileWidth) / 2;
        const y0 = ((x + y) * tileHeight) / 2;
        this.screenCoords.push({ x0, y0, x, y, idx: y * gridSize.x + x });
      }
    }
  }

  setupControls() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;
      
      if (e.key === " ") {
        e.preventDefault();
        this.paused = !this.paused;
      }
      
      if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        this.toggleOverlays();
      }
    });
  updateCamera() {
    // Move internal grid offset (affects noise sampling)
    const moveSpeed = 0.5;
    
    if (this.keys["arrowup"]) this.gridOffsetY -= moveSpeed;
    if (this.keys["arrowdown"]) this.gridOffsetY += moveSpeed;
    if (this.keys["arrowleft"]) this.gridOffsetX -= moveSpeed;
    if (this.keys["arrowright"]) this.gridOffsetX += moveSpeed;

    // Camera rotation with Q and E keys
    if (this.keys["q"]) this.rotation -= 0.02;
    if (this.keys["e"]) this.rotation += 0.02;

    // Zoom with + and - keys
    if (this.keys["="] || this.keys["+"]) {
      this.zoom = Math.min(3, this.zoom + 0.02);
    }
    if (this.keys["-"] || this.keys["_"]) {
      this.zoom = Math.max(0.3, this.zoom - 0.02);
    }
  } // Fixed camera - arrows move the grid's internal position
    const moveSpeed = 8;
    
    if (this.keys["arrowup"]) this.offsetY += moveSpeed;
    if (this.keys["arrowdown"]) this.offsetY -= moveSpeed;
    if (this.keys["arrowleft"]) this.offsetX += moveSpeed;
    if (this.keys["arrowright"]) this.offsetX -= moveSpeed;

    // Zoom with + and - keys
    if (this.keys["="] || this.keys["+"] || this.keys["pageup"]) {
      this.zoom = Math.min(3, this.zoom + 0.02);
    }
    if (this.keys["-"] || this.keys["_"] || this.keys["pagedown"]) {
  generateHeightmapFast() {
    const { df } = noiseEff;
    const inv_df = 1 / df;

    for (let y = 0; y < gridSize.y; y++) {
      for (let x = 0; x < gridSize.x; x++) {
        // Apply grid offset to noise sampling
        const offsetX = x + this.gridOffsetX;
        const offsetY = y + this.gridOffsetY;
        
        // Continentalness - large scale landmass distribution
        const continental = noise.perlin3(
          offsetX * inv_df * 0.15,
          offsetY * inv_df * 0.15,
          zoff * 0.05
        );
        
        // Base terrain - medium scale terrain features
        const baseNoise = noise.perlin3(
          offsetX * inv_df * 0.4,
          offsetY * inv_df * 0.4,
          zoff * 0.1
        );
        
        // Detail layer - small scale variation
        const detailNoise = noise.perlin3(
          offsetX * inv_df * 1.2,
          offsetY * inv_df * 1.2,
          zoff * 0.15
        ) * 0.25;
        
        // Mountain ridges - creates dramatic peaks
        const ridgeNoise1 = Math.abs(noise.perlin3(
          offsetX * inv_df * 0.6,
          offsetY * inv_df * 0.6,
          zoff * 0.12
        ));
        const ridgeNoise2 = Math.abs(noise.perlin3(
          offsetX * inv_df * 0.3,
          offsetY * inv_df * 0.3,
          zoff * 0.08
        ));
        
        // Mountain mask - determines where mountains appear
        const mountainMask = Math.pow(Math.max(0, continental + 0.2), 2);
        const ridges = (1 - ridgeNoise1) * 0.6 + (1 - ridgeNoise2) * 0.4;
        const mountains = ridges * mountainMask;
        
        // Valleys - carved by erosion-like noise
        const valleyNoise = noise.perlin3(
          offsetX * inv_df * 0.25,
          offsetY * inv_df * 0.25,
          zoff * 0.07
        );
        const valleys = Math.min(0, valleyNoise) * 0.3;
        
        // Combine all layers with varied weights
        let combined = 
          continental * 0.35 + 
          baseNoise * 0.25 + 
          detailNoise * 0.15 + 
          mountains * 0.4 + 
          valleys * 0.15;
        
        // Apply subtle terracing for Minecraft style
        combined = Math.floor(combined * 12) / 12;
        
        // Map to height with dramatic distribution
        let height = ((combined + 1) / 2);
        
        // Apply exponential curve for more variation
        if (height < 0.35) {
          // Deep ocean
          height = height * 0.3;
  getMaterialId(height) {
    // Minecraft-style material thresholds with better distribution
    if (height < 25) return 0;   // deepWater
    if (height < 42) return 1;   // water
    if (height < 48) return 2;   // shallow
    if (height < 52) return 4;   // darkSand
    if (height < 58) return 3;   // sand
    if (height < 85) return 6;   // darkGrass
    if (height < 120) return 5;  // grass - plains
    if (height < 160) return 8;  // darkRock - foothills
    if (height < 190) return 7;  // rock - mountains
    if (height < 220) return 9;  // lightRock - high mountains
    if (height < 240) return 11; // ice - peaks
    return 10;                   // snow - highest peaks
  }       height = 0.77 + Math.pow((height - 0.8) * 5, 1.5) * 0.3;
        }
        
        // Convert to 0-255 range
        height = height * 255;
        
        // Clamp and round
        height = Math.max(0, Math.min(255, height));
        const rv = Math.round(height);

        const idx = y * gridSize.x + x;
        this.heights[idx] = rv;

        // Material assignment
        const matId = this.getMaterialId(rv);
        this.materials[idx] = matId;
      }
    }
  }     const matId = this.getMaterialId(rv);
        this.materials[idx] = matId;
  render() {
    // Update camera
    this.updateCamera();

    // Regenerate heightmap when needed (grid moved or time changed)
    if (
      (Math.abs(this.lastZoff - zoff) > 0.02 && !this.paused) ||
      this.lastZoff === -1
    ) {
      this.generateHeightmapFast();
      this.lastZoff = zoff;
    }

    let blocksDrawn = 0;
    const SEA_LEVEL = 42;
    
    // Rotation matrix for camera rotation
    const cosR = Math.cos(this.rotation);
    const sinR = Math.sin(this.rotation);

    // Render blocks with rotation and culling
    for (const { x0, y0, x, y, idx } of this.screenCoords) {
      const z = this.heights[idx];
      
      // Skip underwater terrain (only render water surface)
      if (z < SEA_LEVEL) {
        // Only render water at sea level
        const rotatedX = x0 * cosR - y0 * sinR;
        const rotatedY = x0 * sinR + y0 * cosR;
        const screenX = (rotatedX + spX) * this.zoom;
        const screenY = (rotatedY + spY) * this.zoom;
        
        // Frustum culling
        if (
          screenX > cnv.width + 100 ||
          screenX < -100 ||
          screenY > cnv.height + 100 ||
          screenY < -100
        ) {
          continue;
        }
        
        const waterMat = this.getMaterialById(1);
        this.drawBlock(screenX, screenY, SEA_LEVEL, waterMat, true);
        blocksDrawn++;
        continue;
      }
      
      // Apply rotation
      const rotatedX = x0 * cosR - y0 * sinR;
      const rotatedY = x0 * sinR + y0 * cosR;
      
      const screenX = (rotatedX + spX) * this.zoom;
      const screenY = (rotatedY + spY) * this.zoom;

      // Frustum culling - don't render off-screen blocks
      const zHeight = (z / 255) * gridSize.z * 0.6 * tileHeight;
      if (
        screenX > cnv.width + 100 ||
        screenX < -100 ||
        screenY > cnv.height + 200 ||
        screenY < -200 - zHeight
      ) {
        continue;
      }

      const matId = this.materials[idx];
      const mat = this.getMaterialById(matId);

      // Render terrain block
      this.drawBlock(screenX, screenY, z, mat, false);
      blocksDrawn++;
    }

    return blocksDrawn;
  } }

    let blocksDrawn = 0;
    const SEA_LEVEL = 50;

    // Render blocks with fixed camera, moving grid
    for (const { x0, y0, x, y, idx } of this.screenCoords) {
      // Apply zoom and grid offset (not camera offset)
      const screenX = (x0 + spX + this.offsetX) * this.zoom;
      const screenY = (y0 + spY + this.offsetY) * this.zoom;

      // Frustum check
      if (
        screenX > cnv.width + 100 ||
  drawBlock(x0, y0, z, mat, isWater = false) {
    // Scale z to visual height with better proportions
    const normalizedZ = (z / 255) * gridSize.z * 0.7;
    const zileHeight = normalizedZ * tileHeight;
    const th = tileHeight;
    const hw = tileWidth / 2;
    const hh = tileHeight / 2;

    // Enhanced lighting based on height and material
    const heightRatio = normalizedZ / (gridSize.z * 0.7);
    
    // Base brightness - higher altitudes get more light
    let baseLightness = 40 + heightRatio * 40;
    
    if (isWater) {
      baseLightness = Math.min(55, baseLightness + 5);
    }

    // TOP FACE - brightest (sun from above)
    const topLight = Math.min(90, baseLightness + 30);
    const top = hsl(mat.v, mat.s, topLight, mat.a);
    
    // LEFT FACE - darker (shade from left)
    const leftLight = Math.max(15, baseLightness - 25);
    const left = hsl(mat.v, mat.s, leftLight, mat.a);
    
    // RIGHT FACE - medium (partial shade)
    const rightLight = Math.max(20, baseLightness - 15);
    const right = hsl(mat.v, mat.s, rightLight, mat.a);

    // Don't render side faces for water (flat surface)
    const renderSides = !isWater && zileHeight > 2;

    // TOP FACE (diamond)
    ctx.fillStyle = top;
    ctx.beginPath();
    ctx.moveTo(x0, y0 - zileHeight);
    ctx.lineTo(x0 + hw, y0 + hh - zileHeight);
    ctx.lineTo(x0, y0 + th - zileHeight);
    ctx.lineTo(x0 - hw, y0 + hh - zileHeight);
    ctx.closePath();
    ctx.fill();
    
    if (!isWater) {
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    if (renderSides) {
      // LEFT FACE (side)
      ctx.fillStyle = left;
      ctx.beginPath();
      ctx.moveTo(x0 - hw, y0 + hh - zileHeight);
      ctx.lineTo(x0, y0 + th - zileHeight);
      ctx.lineTo(x0, y0 + th);
      ctx.lineTo(x0 - hw, y0 + hh);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // RIGHT FACE (side)
      ctx.fillStyle = right;
      ctx.beginPath();
      ctx.moveTo(x0 + hw, y0 + hh - zileHeight);
      ctx.lineTo(x0, y0 + th - zileHeight);
      ctx.lineTo(x0, y0 + th);
      ctx.lineTo(x0 + hw, y0 + hh);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
    // LEFT FACE (side)
    ctx.fillStyle = left;
    ctx.beginPath();
    ctx.moveTo(x0 - hw, y0 + hh - zileHeight);
    ctx.lineTo(x0, y0 + th - zileHeight);
    ctx.lineTo(x0, y0 + th);
    ctx.lineTo(x0 - hw, y0 + hh);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // RIGHT FACE (side)
    ctx.fillStyle = right;
    ctx.beginPath();
    ctx.moveTo(x0 + hw, y0 + hh - zileHeight);
    ctx.lineTo(x0, y0 + th - zileHeight);
    ctx.lineTo(x0, y0 + th);
    ctx.lineTo(x0 + hw, y0 + hh);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}
    // Update HUD
    document.getElementById("fps").textContent = ms.toFixed(1) + "ms";
    document.getElementById("avg").textContent = times.average().toFixed(1) + "ms";
    document.getElementById("blocks").textContent = blocksDrawn;
    document.getElementById("pos-x").textContent = renderer.gridOffsetX.toFixed(1);
    document.getElementById("pos-y").textContent = renderer.gridOffsetY.toFixed(1);
    document.getElementById("pos-z").textContent = renderer.zoom.toFixed(2) + "x";

    // Debug info
    const debugInfo = document.getElementById("debug-info");
    if (debugInfo) {
      debugInfo.innerHTML = `
Grid: ${gridSize.x}×${gridSize.y}×${gridSize.z}<br>
Offset: (${renderer.gridOffsetX.toFixed(1)}, ${renderer.gridOffsetY.toFixed(1)})<br>
Rotation: ${(renderer.rotation * 180 / Math.PI).toFixed(1)}°<br>
Zoff: ${zoff.toFixed(3)}<br>
Paused: ${renderer.paused ? "YES" : "NO"}<br>
Zoom: ${renderer.zoom.toFixed(2)}x<br>
Fps: ${(1000 / ms).toFixed(1)}<br>
Min: ${Math.min(...times).toFixed(1)}ms<br>
Max: ${Math.max(...times).toFixed(1)}ms
      `;
    }tx.fillRect(0, 0, cnv.width, cnv.height);

    // Only increment zoff if NOT paused
    if (!renderer.paused) {
      zoff += 0.02; // Slower animation for more stable view
    }
    renderer.updateCamera();

    blocksDrawn = renderer.render();

    const ms = performance.now() - t;
    times.push(ms);
    if (times.length > 60) times.shift();

    // Update HUD
    document.getElementById("fps").textContent = ms.toFixed(1) + "ms";
    document.getElementById("avg").textContent = times.average().toFixed(1) + "ms";
    document.getElementById("blocks").textContent = blocksDrawn;
    document.getElementById("pos-x").textContent = renderer.offsetX.toFixed(0);
    document.getElementById("pos-y").textContent = renderer.offsetY.toFixed(0);
    document.getElementById("pos-z").textContent = renderer.zoom.toFixed(2) + "x";

    // Debug info
    const debugInfo = document.getElementById("debug-info");
    if (debugInfo) {
      debugInfo.innerHTML = `
Grid: ${gridSize.x}×${gridSize.y}×${gridSize.z}<br>
Zoff: ${zoff.toFixed(3)}<br>
Paused: ${renderer.paused ? "YES" : "NO"}<br>
Zoom: ${renderer.zoom.toFixed(2)}x<br>
Fps: ${(1000 / ms).toFixed(1)}<br>
Min: ${Math.min(...times).toFixed(1)}ms<br>
Max: ${Math.max(...times).toFixed(1)}ms
      `;
    }

    await pauseHalt();
    requestAnimationFrame(animate);
  };

  animate();
};

window.onload = main;
