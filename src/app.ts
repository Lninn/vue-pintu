import { CANVAS_SCLAE } from "./constant";
import { Coordinates } from "./coordinates";
import { Pintu } from "./pintu";
import { InnerRect } from "./type";

export const mouseDownInRect = (
  rect: InnerRect,
  mousePosition: { x: number; y: number }
) => {
  return (
    mousePosition.x >= rect.x &&
    mousePosition.x <= rect.x + rect.width &&
    mousePosition.y >= rect.y &&
    mousePosition.y <= rect.y + rect.height
  );
};

const renderCanvas = () => {
  const container = document.querySelector("#app");
  if (!container) return;

  const canvas = document.createElement("canvas");
  canvas.width = 650 * CANVAS_SCLAE;
  canvas.height = 650 * CANVAS_SCLAE;
  canvas.style.width = "800px";
  canvas.style.height = "800px";

  container.appendChild(canvas);

  let ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx = ctx as CanvasRenderingContext2D;

  const coordinates = new Coordinates(canvas);
  const player = new Pintu(coordinates, ctx);

  coordinates.player = player;

  const handleKeyDown = (event: KeyboardEvent) => {
    player.handleKeyDown(event.key);

    if (player.check()) {
      console.log("You Win!");
    }
  };
  document.addEventListener("keydown", handleKeyDown);

  function mainLoop() {
    // clear the canvas
    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    player.update();

    player.drawRects();

    requestAnimationFrame(mainLoop); // get next frame
  }

  // start the app
  requestAnimationFrame(mainLoop);

  player.drawRects();
};

const start = () => {
  renderCanvas();
};

const app = {
  start,
};

export default app;
