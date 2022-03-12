export interface Rect {
  id: string;
  color: string;
}

export type InnerRect = Rect & { x: number; y: number; width: number; height: number };

export type Position = { x: number; y: number };
