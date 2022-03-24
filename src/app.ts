import * as core from './core'

const start = () => {
  const container = document.querySelector("#app");
  if (!container) return;

  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 600;
  canvas.style.width = "500px";
  canvas.style.height = "500px";

  container.appendChild(canvas);

  let ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx = ctx as CanvasRenderingContext2D;

  core.setCtx(ctx);
  core.start(ctx);
};

const app = {
  start,
};

export default app;
