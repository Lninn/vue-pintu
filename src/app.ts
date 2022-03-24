const ROW_COUNT = 3;
const COL_COUNT = 3;

const FIXED_INDEX = 0;

type Pos = { row: number; col: number }

/**
 * Item Identity
 * 
 * 0 固定位置
 * 1 可移动位置
 */
type ItemTag = 0 | 1

type Item = {
  id: number,
 
  color: string,
  readonly tag: ItemTag
}

type Items = Item[][]

const createItems = () => {
  const items: Items = []

  for (let i = 0; i < ROW_COUNT; i++) {
    items[i] = []

    for (let j = 0; j < COL_COUNT; j++) {
      let color = getRandomColor()
      const no = i * ROW_COUNT + j
      const isFixed = no === FIXED_INDEX

      items[i][j] = {
        id: no,
        color: isFixed ? '#ffffff' : color,
        tag: isFixed ? 0 : 1
      }
    }
  }

  return items
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function findFixedItemPos(items: Items) {
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items[i].length; j++) {
      const item = items[i][j]
      if (item.tag === 0) {
        return { row: i, col: j }
      }
    }
  }

  return undefined
}


function swapItem(items: Items, from: Pos, to: Pos) {
  const fromItem = items[from.row][from.col]
  const toItem = items[to.row][to.col]

  items[from.row][from.col] = toItem
  items[to.row][to.col] = fromItem
}


function fixCol(col: number) {
  if (col <= 0) {
    return 0
  }

  if (col >= COL_COUNT - 1) {
    return COL_COUNT - 1
  }
  
  return col
}

function fixRow(row: number) {
  if (row <= 0) {
    return 0
  }

  if (row >= ROW_COUNT - 1) {
    return ROW_COUNT - 1
  }

  return row
}


class Pintu {
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D

  itemWidth!: number
  items!: Items

  constructor() {
    this.initialize()

    this.bindEvents()
    
    this.itemInited()

    this.itemsInited()
  }
  
  initialize() {
    const container = document.querySelector("#app");
    if (!container) return;

    const appWidth = container.clientWidth;

    const canvas = document.createElement("canvas");

    canvas.width = appWidth;
    canvas.height = appWidth;

    canvas.style.width = appWidth + 'px';
    canvas.style.height = appWidth + 'px';

    this.canvas = canvas
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    container.appendChild(canvas);
  }

  itemInited() {
    this.itemWidth = this.canvas.width / COL_COUNT
  }

  itemsInited() {
    this.items = createItems()
  }

  bindEvents() {
    const canvas = this.canvas

    canvas.addEventListener('click', this.handleClick.bind(this))
  }

  handleClick(e: MouseEvent) {
    const CELL_SIZE = this.itemWidth

    const { clientX, clientY } = e

    const { left, top } = this.canvas.getBoundingClientRect()

    const offsetX = clientX - left
    const offsetY = clientY - top

    const row = Math.floor(offsetY / CELL_SIZE)
    const col = Math.floor(offsetX / CELL_SIZE)

    const pos = findFixedItemPos(this.items)

    if (pos?.row === row && pos.col === col) return
    
    if (row === pos?.row && Math.abs(col - pos?.col) === 1) {
      swapItem(this.items, pos, { row, col })
    } else if (col === pos?.col && Math.abs(row - pos?.row) === 1) {
      swapItem(this.items, pos, { row, col })
    }

    this.drawItems()
  }


  drawItems() {
    const CELL_SIZE = this.itemWidth

    for (let i = 0; i < ROW_COUNT; i++) {
      for (let j = 0; j < COL_COUNT; j++) {
        const item = this.items[i][j]
        this.ctx.fillStyle = item.color
        this.ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE)
  
        this.ctx.fillStyle = '#ffffff'
        this.ctx.font = '100px Arial'
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        this.ctx.fillText(item.id.toString(), j * CELL_SIZE + CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE / 2)
      }
    }
  }
}

const pintuIns = new Pintu()
pintuIns.drawItems()
