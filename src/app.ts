type Tag = 0 | 1;

interface Rect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  tag: Tag;
}

const mouseDownInRect = (
  rect: Rect,
  mousePosition: { x: number; y: number }
) => {
  return (
    mousePosition.x >= rect.x &&
    mousePosition.x <= rect.x + rect.width &&
    mousePosition.y >= rect.y &&
    mousePosition.y <= rect.y + rect.height
  );
};

const mergeRectPosition = (rect1: Rect, rect2: Rect) => {
  rect1.x = rect2.x;
  rect1.y = rect2.y;
};

const renderCanvas = () => {
  const container = document.querySelector("#app");
  if (!container) return;

  const canvas = document.createElement("canvas");
  canvas.width = 1024 * 2;
  canvas.height = 1024 * 2;
  canvas.style.width = "3000px";
  canvas.style.height = "3000px";

  container.appendChild(canvas);

  let ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx = ctx as CanvasRenderingContext2D;

  const mouse: any = {
    x: 0,
    y: 0, // coordinates
  };
  const mouseDown = {
    x: 0,
    y: 0,
  };

  let moveRect: Rect | null = null;
  let recoverRect: Rect | null = null;

  let hasMouseDown: boolean = false;

  let targetRect: Rect | null = null;

  const mousePositionSet = (event: MouseEvent) => {
    const bounds = canvas.getBoundingClientRect();
    // get the mouse coordinates, subtract the canvas top left and any scrolling
    mouse.x = event.pageX - bounds.left - scrollX;
    mouse.y = event.pageY - bounds.top - scrollY;

    mouse.x /= bounds.width;
    mouse.y /= bounds.height;

    // then scale to canvas coordinates by multiplying the normalized coords with the canvas resolution

    mouse.x *= canvas.width;
    mouse.y *= canvas.height;
  };

  const handleMouseDown = (event: MouseEvent) => {
    mousePositionSet(event);

    findRect();

    if (moveRect) {
      mouseDown.x = mouse.x - moveRect.x;
      mouseDown.y = mouse.y - moveRect.y;

      hasMouseDown = true;

      resetRects();
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    mousePositionSet(event);
  };

  const handleMouseUp = (event: MouseEvent) => {
    mousePositionSet(event);

    hasMouseDown = false; // set the button up

    const status = mouseDownInRect(targetRect!, mouse);

    if (moveRect) {
      if (status) {
        mergeRectPosition(moveRect, targetRect!);
        targetRect = recoverRect;
      } else {
        mergeRectPosition(moveRect, recoverRect!);
      }
    }
  };

  document.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  function mainLoop() {
    // clear the canvas
    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    drawRects();

    if (hasMouseDown && moveRect) {
      moveRect.x = mouse.x - mouseDown.x;
      moveRect.y = mouse.y - mouseDown.y;
    }

    requestAnimationFrame(mainLoop); // get next frame
  }

  // start the app
  requestAnimationFrame(mainLoop);

  const rects: Rect[] = [];
  (window as any).rects = rects;

  const findRect = () => {
    for (const rect of rects) {
      if (mouseDownInRect(rect, mouse)) {
        moveRect = rect;
        moveRect.tag = 1;

        recoverRect = { ...rect };
        return;
      }
    }
  };

  const resetRects = () => {
    const topRectIndex = rects.findIndex((rect) => rect.tag === 1);
    if (topRectIndex !== -1) {
      const [rect] = rects.splice(topRectIndex, 1);
      rects.push(rect);
    }
  };

  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const ROW_COUNT = 3;
  const COL_COUNT = 3;
  const RECT_WIDTH = 200;
  const RECT_HEIGHT = 200;

  function shuffleRects(rects: Rect[]) {
    const array = Array.from(
      {
        length: ROW_COUNT * COL_COUNT,
      },
      (_, idx) => idx
    );

    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));

      var temp = { ...rects[i] };

      rects[i].x = rects[j].x;
      rects[i].y = rects[j].y;

      rects[j].x = temp.x;
      rects[j].y = temp.y;
    }

    return array;
  }

  for (let i = 0; i < ROW_COUNT; i++) {
    for (let j = 0; j < COL_COUNT; j++) {
      const color = getRandomColor();

      const rect: Rect = {
        id: `${i}-${j}`,
        x: j * RECT_WIDTH,
        y: i * RECT_HEIGHT,
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
        color,
        tag: 0,
      };

      rects.push(rect);
    }
  }

  shuffleRects(rects);

  targetRect = rects.shift() as Rect;

  const drawRect = (rect: Rect) => {
    if (!ctx) return;

    ctx.fillStyle = rect.color;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

    ctx.fillStyle = "#000000";

    const fontSize = 50;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillText(rect.id, rect.x, rect.y + fontSize);
  };

  const drawRects = () => {
    if (!ctx) return;

    rects.forEach((rect) => {
      drawRect(rect);
    });
  };

  drawRects();
};

const start = () => {
  renderCanvas();
};

const app = {
  start,
};

export default app;
