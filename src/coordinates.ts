import { mouseDownInRect } from "./app";
import { RECT_HEIGHT, RECT_WIDTH } from "./constant";
import { Pintu } from "./pintu";
import { InnerRect, Position } from "./type";

export class Coordinates {
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
