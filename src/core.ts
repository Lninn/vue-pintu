const ROW_COUNT = 3;
const COL_COUNT = 3;

const CELL_SIZE = 30;

const FIXED_INDEX = 0;

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

function findFixedItem(items: Items) {
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items[i].length; j++) {
      const item = items[i][j]
      if (item.tag === 0) {
        return item
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


const actions: any = {}
function registerAction(key: string, action: Function) {
  if (!actions.hasOwnProperty(key)) {
    actions[key] = action
  }
}

registerAction('d', function() {
  const fixedItem = findFixedItem(items)

  // TODO 判断是否可移动


  console.log('d',fixedItem)
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

export {
  start
}
