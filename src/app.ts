function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

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

type Position = { x: number; y: number };

class Coordinates {
  mouse: Position;
  mouseDown: Position;
  hasMouseDown: boolean;

  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.mouse = {
      x: 0,
      y: 0,
    };
    this.mouseDown = {
      x: 0,
      y: 0,
    };
    this.hasMouseDown = false;
  }

  updateMouse(event: MouseEvent) {
    const bounds = this.canvas.getBoundingClientRect();
    // get the mouse coordinates, subtract the canvas top left and any scrolling
    this.mouse.x = event.pageX - bounds.left - scrollX;
    this.mouse.y = event.pageY - bounds.top - scrollY;

    this.mouse.x /= bounds.width;
    this.mouse.y /= bounds.height;

    // then scale to canvas coordinates by multiplying the normalized coords with the canvas resolution

    this.mouse.x *= this.canvas.width;
    this.mouse.y *= this.canvas.height;
  }

  handleMouseDown(moveRect: Rect) {
    this.mouseDown.x = this.mouse.x - moveRect.x;
    this.mouseDown.y = this.mouse.y - moveRect.y;

    this.hasMouseDown = true;
  }
}

// Pintu

const ROW_COUNT = 3;
const COL_COUNT = 3;
const RECT_WIDTH = 150;
const RECT_HEIGHT = 150;

interface State {
  rects: Rect[];

  moveRect?: Rect;
  recoverRect?: Rect;

  targetRect?: Rect;
}

const INIT_STATE: State = {
  rects: [],

  moveRect: undefined,
  recoverRect: undefined,

  targetRect: undefined,
};

class Pintu {
  state: State = INIT_STATE;
  coordinates: Coordinates;

  constructor(coordinates: Coordinates) {
    this.coordinates = coordinates;

    this.initial();
  }

  updateState(newState: State) {
    this.state = newState;
  }

  initial() {
    const rects: Rect[] = [];

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

    const targetRect = rects.shift() as Rect;

    this.updateState({
      rects,

      targetRect,
    });
  }

  findRect() {
    for (const rect of this.state.rects) {
      if (mouseDownInRect(rect, this.coordinates.mouse)) {
        this.state.moveRect = rect;
        this.state.moveRect.tag = 1;

        this.state.recoverRect = { ...rect };
        return;
      }
    }

    if (this.state.moveRect) {
      this.state.moveRect.tag = 0;
      this.state.moveRect = undefined;
    }
  }

  resetRects() {
    const topRectIndex = this.state.rects.findIndex((rect) => rect.tag === 1);
    if (topRectIndex !== -1) {
      const [rect] = this.state.rects.splice(topRectIndex, 1);
      this.state.rects.push(rect);
    }
  }

  getNextRect(key: string) {
    if (!this.state.targetRect) return;

    const point = {
      x: this.state.targetRect.x / RECT_WIDTH,
      y: this.state.targetRect.y / RECT_HEIGHT,
    };

    switch (key) {
      case "w":
        point.y -= 1;
        break;
      case "d":
        point.x += 1;
        break;
      case "s":
        point.y += 1;
        break;
      case "a":
        point.x -= 1;
        break;
    }

    if (!this.state.moveRect || !this.state.recoverRect) return;

    this.state.moveRect.x = point.x * RECT_WIDTH;
    this.state.moveRect.y = point.y * RECT_HEIGHT;
    this.state.recoverRect.x = point.x * RECT_WIDTH;
    this.state.recoverRect.y = point.y * RECT_HEIGHT;

    this.move();
  }

  move() {
    if (!this.state.moveRect) return;

    mergeRectPosition(this.state.moveRect, this.state.targetRect!);
    this.state.targetRect = this.state.recoverRect;
  }

  recover() {
    if (!this.state.moveRect) return;

    mergeRectPosition(this.state.moveRect, this.state.recoverRect!);
  }
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

  const coordinates = new Coordinates(canvas);
  const player = new Pintu(coordinates);

  const handleMouseDown = (event: MouseEvent) => {
    coordinates.updateMouse(event);

    player.findRect();

    if (player.state.moveRect) {
      coordinates.handleMouseDown(player.state.moveRect);

      player.resetRects();
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    coordinates.updateMouse(event);
  };

  const handleMouseUp = (event: MouseEvent) => {
    coordinates.updateMouse(event);

    coordinates.hasMouseDown = false;

    const status = mouseDownInRect(player.state.targetRect!, coordinates.mouse);

    if (player.state.moveRect) {
      if (status) {
        player.move();
      } else {
        player.recover();
      }
    }
  };

  document.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  const handleKeyDown = (event: KeyboardEvent) => {
    player.getNextRect(event.key);
  };
  document.addEventListener("keydown", handleKeyDown);

  function mainLoop() {
    // clear the canvas
    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    drawRects();

    if (coordinates.hasMouseDown && player.state.moveRect) {
      player.state.moveRect.x = coordinates.mouse.x - coordinates.mouseDown.x;
      player.state.moveRect.y = coordinates.mouse.y - coordinates.mouseDown.y;
    }

    requestAnimationFrame(mainLoop); // get next frame
  }

  // start the app
  requestAnimationFrame(mainLoop);

  const drawRect = (rect: Rect) => {
    if (!ctx) return;

    ctx.fillStyle = rect.color;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

    ctx.fillStyle = "#ffffff";

    const fontSize = 50;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillText(rect.id, rect.x, rect.y + fontSize);
  };

  const drawRects = () => {
    if (!ctx) return;

    player.state.rects.forEach((rect) => {
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
