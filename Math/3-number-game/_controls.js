const zoomFactor = 1.03;
const dragSensitivity = 1.2;

let offsetX = 0;
let offsetY = 0;
let scale = 1;

let dragStartX = 0;
let dragStartY = 0;

let timeOutId;

let dragging = false;
let isZooming = false;
let zoom = 0;

const onDraw = () => {
  clearTimeout(timeOutId);
  cancelAnimationFrame(animateId);
  timeOutId = setTimeout(() => {
    current = {
      x: __x + offsetX * scale,
      y: __y + offsetY * scale,
    };
    PTS = getPts();
    clear();
    animate();
  }, 500);
};

const onMove = (e) => {
  // e.preventDefault()
  if (!dragging) return;
  const dx = (e.clientX - dragStartX) * dragSensitivity;
  const dy = (e.clientY - dragStartY) * dragSensitivity;
  offsetX += dx * -1;
  offsetY += dy * -1;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  onDraw();
};

// const onZoom = (delta) => {
//   if (isZooming) zoom = delta;
//   if (delta > 0) {
//     scale /= zoomFactor;
//   } else {
//     scale *= zoomFactor;
//   }
//   onDraw();
// };

const onZoom = (delta, mouseX, mouseY) => {
  // Convert mouse screen coords to world coords
  const worldX = mouseX / scale + offsetX;
  const worldY = mouseY / scale + offsetY;

  if (delta > 0) {
    scale /= zoomFactor; // zoom out
  } else {
    scale *= zoomFactor; // zoom in
  }

  // After zooming, we want the world point under the mouse to stay under the mouse.
  // So we re-calculate offsetX/Y to lock that point.
  offsetX = worldX - mouseX / scale;
  offsetY = worldY - mouseY / scale;
  onDraw();
};

cnv.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    onZoom(Math.sign(e.deltaY), e.offsetX, e.offsetY);
  },
  { passive: false }
);
cnv.addEventListener("mousedown", (e) => {
  dragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
});

cnv.addEventListener("mousemove", onMove);
cnv.addEventListener("mouseup", () => {
  dragging = false;
});

addEventListener("keydown", (e) => {
  e.preventDefault();
  if (e.code === "Space") {
    pause = !pause;
  }
});
