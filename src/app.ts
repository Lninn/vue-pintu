function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function shuffleArray(array: any[]) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

interface Rect {
  id: string;
  color: string;
}

type InnerRect = Rect & { x: number; y: number; width: number; height: number };

type Position = { x: number; y: number };

class Coordinates {
  mouse: Position;
  mouseDown: Position;
  hasMouseDown: boolean;

  canvas: HTMLCanvasElement;

  player?: Pintu;

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

    this.bindEvents();
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

  bindEvents() {
    document.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  handleMouseDown(event: MouseEvent) {
    this.updateMouse(event);

    if (!this.player) return;

    this.player.findRect();

    if (this.player.moveIndex !== -1) {
      const { x, y } = this.player.recordsMap.get(
        this.player.moveIndex
      ) as Position;

      this.mouseDown.x = this.mouse.x - x * RECT_WIDTH;
      this.mouseDown.y = this.mouse.y - y * RECT_HEIGHT;
      this.hasMouseDown = true;

      this.player.resetRects();
    }
  }

  handleMouseMove(event: MouseEvent) {
    this.updateMouse(event);
  }

  handleMouseUp(event: MouseEvent) {
    this.updateMouse(event);

    if (!this.player) return;

    this.hasMouseDown = false;

    const targetRect = this.player.rects[this.player.targetIndex];

    const { x, y } = this.player.recordsMap.get(
      this.player.targetIndex
    ) as Position;

    const newTargetRect: InnerRect = {
      ...targetRect,
      width: RECT_WIDTH,
      height: RECT_HEIGHT,
      x: x * RECT_WIDTH,
      y: y * RECT_HEIGHT,
    };

    const status = mouseDownInRect(newTargetRect, this.mouse);

    if (this.player.moveIndex !== -1) {
      if (status) {
        this.player.move();
      } else {
        this.player.recover();
      }
    }
  }
}

// Pintu

const ROW_COUNT = 3;
const COL_COUNT = 3;
const RECT_WIDTH = 120;
const RECT_HEIGHT = 120;

type Payload = number | Position;
class PintuMap {
  result: Record<string, Payload> = {};

  constructor() {}

  set(key: Payload, value: Payload) {
    const setKey = JSON.stringify(key);
    this.result[setKey] = value;
  }

  get(key: Payload) {
    const getKey = JSON.stringify(key);
    return this.result[getKey];
  }
}

class Pintu {
  rects: Rect[] = [];
  coordinates: Coordinates;
  ctx: CanvasRenderingContext2D;

  targetIndex: number = 0;
  moveIndex: number = -1;
  recordsMap: PintuMap = new PintuMap();

  constructor(coordinates: Coordinates, ctx: CanvasRenderingContext2D) {
    this.coordinates = coordinates;
    this.ctx = ctx;

    this.initial();
  }

  initial() {
    const rects: Rect[] = [];

    for (let i = 0; i < ROW_COUNT; i++) {
      for (let j = 0; j < COL_COUNT; j++) {
        const no = i * ROW_COUNT + j;
        const position: Position = { x: j, y: i };

        const color = getRandomColor();
        const rect: Rect = {
          id: no.toString(),
          color,
        };

        rects.push(rect);

        this.recordsMap.set(position, no);
        this.recordsMap.set(no, position);
      }
    }

    shuffleArray(rects);

    this.rects = rects;
  }

  findRect() {
    for (let i = 0; i < this.rects.length; i++) {
      const { x, y } = this.recordsMap.get(i) as Position;

      const rect: InnerRect = {
        ...this.rects[i],
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
        x: x * RECT_WIDTH,
        y: y * RECT_HEIGHT,
      };

      if (mouseDownInRect(rect, this.coordinates.mouse)) {
        this.moveIndex = i;
        return;
      }
    }
  }

  resetRects() {
    // const topRectIndex = this.state.rects.findIndex((rect) => rect.tag === 1);
    // if (topRectIndex !== -1) {
    //   const [rect] = this.state.rects.splice(topRectIndex, 1);
    //   this.state.rects.push(rect);
    // }
  }

  handleKeyDown(key: string) {
    let position = this.recordsMap.get(this.targetIndex);

    if (!position) return;
    const newPosition = { ...(position as Position) };

    switch (key) {
      case "w":
        newPosition.y -= 1;
        break;
      case "d":
        newPosition.x += 1;
        break;
      case "s":
        newPosition.y += 1;
        break;
      case "a":
        newPosition.x -= 1;
        break;
    }

    const newIndex = this.recordsMap.get(newPosition) as number;

    if (newIndex === undefined) return;

    const tmp = this.rects[this.targetIndex];
    this.rects[this.targetIndex] = this.rects[newIndex];
    this.rects[newIndex] = tmp;

    this.targetIndex = newIndex;
  }

  move() {
    console.log("move");
  }

  recover() {}

  check() {
    return this.rects.every((rect, idx) => rect.id === idx + "");
  }

  update() {
    const moveRect = this.rects[this.moveIndex];

    if (this.coordinates.hasMouseDown && moveRect) {
      // moveRect.x = this.coordinates.mouse.x - this.coordinates.mouseDown.x;
      // moveRect.y = this.coordinates.mouse.y - this.coordinates.mouseDown.y;
    }
  }

  drawRect(rect: Rect, x: number, y: number) {
    this.ctx.fillStyle = rect.color;
    this.ctx.fillRect(x, y, RECT_WIDTH, RECT_HEIGHT);

    this.ctx.fillStyle = "#ffffff";

    const fontSize = 35;
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillText(rect.id, x, y + fontSize);
  }

  drawRects() {
    for (let i = 0; i < ROW_COUNT; i++) {
      for (let j = 0; j < COL_COUNT; j++) {
        const no = i * ROW_COUNT + j;

        if (no !== this.targetIndex) {
          const rect = this.rects[no];

          this.drawRect(rect, j * RECT_WIDTH, i * RECT_HEIGHT);
        }
      }
    }
  }
}

const mouseDownInRect = (
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
  canvas.width = 1024 * 2;
  canvas.height = 1024 * 2;
  canvas.style.width = "3000px";
  canvas.style.height = "3000px";

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
