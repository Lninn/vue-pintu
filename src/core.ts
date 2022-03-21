const ROW_COUNT = 3;
const COL_COUNT = 3;

const CELL_SIZE = 30;

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

const items = createItems()

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



function drawItems(ctx: CanvasRenderingContext2D, items: Items) {
  for (let i = 0; i < ROW_COUNT; i++) {
    for (let j = 0; j < COL_COUNT; j++) {
      const item = items[i][j]
      ctx.fillStyle = item.color
      ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    }
  }
}


function swapItem(items: Items, from: Pos, to: Pos) {
  const fromItem = items[from.row][from.col]
  const toItem = items[to.row][to.col]

  items[from.row][from.col] = toItem
  items[to.row][to.col] = fromItem
}


const actions: any = {}
function registerAction(key: string, action: Function) {
  if (!actions.hasOwnProperty(key)) {
    actions[key] = action
  }
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

function runItemAction(getNextPos: Function) {
  const pos = findFixedItemPos(items)
  if (!pos) return
  
  const nextPos = getNextPos(pos)

  swapItem(items, pos, nextPos)

  reDraw()
}

registerAction('d', function() {
  runItemAction((pos: Pos) => ({
    row: pos.row,
    col: fixCol(pos.col + 1),
  }))
})

registerAction('a', function() {
  runItemAction((pos: Pos) => ({
    row: pos.row,
    col: fixCol(pos.col - 1),
  }))
})

registerAction('w', function() {
  runItemAction((pos: Pos) => ({
    row: fixRow(pos.row - 1),
    col: pos.col,
  }))
})

registerAction('s', function() {
  runItemAction((pos: Pos) => ({
    row: fixRow(pos.row + 1),
    col: pos.col,
  }))
})


function handleKeyDown(e: KeyboardEvent) {
  const key = e.key

  if (actions.hasOwnProperty(key)) {
    actions[key]()
  }
}
window.addEventListener('keydown', handleKeyDown)

function start(ctx: CanvasRenderingContext2D) {
  drawItems(ctx, items)
}

let __ctx: CanvasRenderingContext2D
function setCtx(ctx: CanvasRenderingContext2D) {
  __ctx = ctx
}

function reDraw() {
  __ctx.clearRect(0, 0, __ctx.canvas.width, __ctx.canvas.height)
  drawItems(__ctx, items)
}

export {
  start,
  setCtx
}
