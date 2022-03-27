const PADDING = 36

const tableCount: any = {
  "1": {
    ROW_COUNT: 3,
    COL_COUNT: 3,
  },
  "2": {
    ROW_COUNT: 4,
    COL_COUNT: 4
  },
  "3": {
    ROW_COUNT: 5,
    COL_COUNT: 5
  }
}

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

function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
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

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function swapItem(items: Items, from: Pos, to: Pos) {
  const fromItem = items[from.row][from.col]
  const toItem = items[to.row][to.col]

  items[from.row][from.col] = toItem
  items[to.row][to.col] = fromItem
}

function shuffle(items: Items) {
  const s = 0
  const e = 2

  function shuffleItem() {
    const r1 = randomIntFromInterval(s, e)
    const c1 = randomIntFromInterval(s, e)

    const r2 = randomIntFromInterval(s, e)
    const c2 = randomIntFromInterval(s, e)

    const tmp = items[r1][c1]
    items[r1][c1] = items[r2][c2]
    items[r2][c2] = tmp
  }

  function recover() {
    const fixedPos = findFixedItemPos(items)

    if (!fixedPos) return

    if (fixedPos.row === 0 && fixedPos.col === 0) return

    const tmp = items[0][0]
    items[0][0] = items[fixedPos.row][fixedPos.col]
    items[fixedPos.row][fixedPos.col] = tmp
  }

  for (let i = 0; i < 10; i++) {
    shuffleItem()
  }

  recover()
}


type PinState = {
  fixedNo: number,
  level: string,
  items: Items,
  itemWidth: number
}

export class Pintu {
  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D

  private img: HTMLImageElement

  private status: string = 'playing'

  private state: PinState

  onMove: (() => void) | null = null

  constructor(img: HTMLImageElement) {
    this.img = img

    this.initialize()
    this.bindEvents()

    this.state = createState(
      // TODO
      '1',
      this.canvas.width
    )
  }

  // controlInit() {
  //   const self = this

  //   this.control = new Control({
  //     onReStart() {
  //       self.status = 'playing'
  //       self.itemsInited(self.diffLevel)
  //       self.draw()
  //     },
  //     onLevelChange() {
  //       self.diffLevel = level
  //       self.itemInited()
  //       self.itemsInited(level)
  //       self.draw()
  //     },
  //     onFileChange(img: any) {
  //       self.img = img

  //       self.itemsInited(self.diffLevel)
  //       self.draw()
  //     },
  //     onAudioPlay(txt: string) {
  //       if (txt === '音效') {
  //         self.audio.volume = 60 / 100
  //       } else {
  //         self.audio.volume = 0
  //       }
  //     }
  //   })
  // }

  private initialize() {
    const container = document.querySelector("#app");
    if (!container) return;

    const appWidth = document.documentElement.clientWidth

    const canvas = document.createElement("canvas");

    const isVertical = this.img.height > this.img.width
    const compareWidth = isVertical ? this.img.width : this.img.height
    const useWidth = compareWidth > appWidth ? appWidth : compareWidth

    canvas.width = useWidth;
    canvas.height = useWidth;

    canvas.style.width = useWidth + 'px';
    canvas.style.height = useWidth + 'px';

    this.canvas = canvas
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    container.appendChild(canvas);
  }

  private  bindEvents() {
    const canvas = this.canvas

    canvas.addEventListener('click', this.handleClick.bind(this))
  }

  private handleClick(e: MouseEvent) {
    if (this.status === 'end') return

    const state = this.state

    const CELL_SIZE = state.itemWidth

    const { clientX, clientY } = e

    const { left, top } = this.canvas.getBoundingClientRect()

    const offsetX = clientX - left - PADDING
    const offsetY = clientY - top - PADDING

    const row = Math.floor(offsetY / CELL_SIZE)
    const col = Math.floor(offsetX / CELL_SIZE)

    const pos = findFixedItemPos(state.items)

    if (pos?.row === row && pos.col === col) return

    let run = true
    if (row === pos?.row && Math.abs(col - pos?.col) === 1) {
      swapItem(state.items, pos, { row, col })
    } else if (col === pos?.col && Math.abs(row - pos?.row) === 1) {
      swapItem(state.items, pos, { row, col })
    } else {
      run = false
    }

    if (run) {
      if (this.onMove) this.onMove()

      this.draw()

      this.check()
    }
  }

  private check() {
    const noList = []
    const state = this.state

    const str = Array.from({
      length: state.items.flat().length
    }).map((_, idx) => idx).join(',')

    const { ROW_COUNT, COL_COUNT } = tableCount[state.level]

    for (let i = 0; i < ROW_COUNT; i++) {
      for (let j = 0; j < COL_COUNT; j++) {
        const item = state.items[i][j]
        noList.push(item.id)
      }
    }

    if (noList.toString() === str) {
      this.status = 'end'
      
      this.draw()
    }
  }


  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (this.status === 'playing') {
      this.drawItems()
    } else {
      this.drawEnd()
    }
  }

  private drawItems() {
    const state = this.state

    const CELL_SIZE = state.itemWidth
    const { ROW_COUNT, COL_COUNT } = tableCount[state.level]

    for (let i = 0; i < ROW_COUNT; i++) {
      for (let j = 0; j < COL_COUNT; j++) {
        const item = state.items[i][j]
        this.ctx.fillStyle = item.color

        const __x = item.id % ROW_COUNT
        const __y = Math.floor(item.id / COL_COUNT)

        if (this.img) {
          const isDrawImage = this.status === 'end' ? true : item.tag === 1

          if(isDrawImage) {
            const imgWidth = this.img.width / ROW_COUNT
            const imgHeight = this.img.height / COL_COUNT
            
            this.ctx.drawImage(
              this.img,
              __x * imgWidth,
              __y * imgHeight,
              imgWidth,
              imgHeight,
              j * CELL_SIZE + PADDING,
              i * CELL_SIZE + PADDING,
              CELL_SIZE,
              CELL_SIZE
            )
          } else {
            this.ctx.fillRect(j * CELL_SIZE + PADDING, i * CELL_SIZE + PADDING, CELL_SIZE, CELL_SIZE)
          }
        } else {
          this.ctx.fillRect(j * CELL_SIZE + PADDING, i * CELL_SIZE + PADDING, CELL_SIZE, CELL_SIZE)
        }

        this.drawText(
          item.id.toString(),
          j * CELL_SIZE + CELL_SIZE / 2 + PADDING,
          i * CELL_SIZE + CELL_SIZE / 2 + PADDING,
          '#fff'
        )
      }
    }
  }

  private drawEnd() {
    this.drawItems()

    this.drawText(
      '游戏结束', this.canvas.width / 2, this.canvas.height / 2, getRandomColor()
    )
  }

  private drawText(text: string, x: number, y: number, fillStyle: string) {
    this.ctx.fillStyle = fillStyle
    this.ctx.font = '18px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(text, x, y)
  }

  public handleLevelChange(level: string) {
    const state = createState(level, this.canvas.width)
    this.state = state

    console.log(state);

    this.draw()
  }
}

function createState(level: string, canvasWidth: number) {
  const items: Items = []
  
  const { ROW_COUNT, COL_COUNT } = tableCount[level]

  const fixedNo =  ROW_COUNT * COL_COUNT - 1

  for (let i = 0; i < ROW_COUNT; i++) {
    items[i] = []

    for (let j = 0; j < COL_COUNT; j++) {
      let color = getRandomColor()
      const no = i * ROW_COUNT + j
      const isFixed = no === fixedNo

      items[i][j] = {
        id: no,
        color: isFixed ? '#ffffff' : color,
        tag: isFixed ? 0 : 1
      }
    }
  }

  shuffle(items)

  const itemWidth = (canvasWidth - PADDING * 2) / COL_COUNT

  const newState: PinState = {
    fixedNo,
    level,
    items,
    itemWidth
  }
 
  return newState
}
