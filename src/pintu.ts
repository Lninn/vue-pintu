import {  mouseDownInRect } from "./app";
import { CANVAS_SCLAE } from "./constant";
import { Coordinates } from "./coordinates";
import { Position, Rect, InnerRect } from "./type";

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


const ROW_COUNT = 3;
const COL_COUNT = 3;
const RECT_WIDTH = 200 * CANVAS_SCLAE;
const RECT_HEIGHT = 200 * CANVAS_SCLAE;

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

export class Pintu {
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
