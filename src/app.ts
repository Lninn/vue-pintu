const tableCount: any = {
  "1": {
    ROW_COUNT: 3,
    COL_COUNT: 3,
  },
  "2": {
    ROW_COUNT: 4,
    COL_COUNT: 4
  }
}

const FIXED_INDEX = 0;

const AUDIO_URL = 'https://img.tukuppt.com/newpreview_music/09/00/74/5c8949da6e66559783.mp3'

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

const createItems = (level: string) => {
  const items: Items = []

  const { ROW_COUNT, COL_COUNT } = tableCount[level]

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


function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
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


class Control {
  private stepEl: HTMLSpanElement | null = null
  private stepCount: number = 0


  onReStart: () => void = () => { }
  onLevelChange: (level: string) => void

  constructor({
    onReStart,
    onLevelChange
  }:{
    onReStart: () => void
    onLevelChange: (level: string) => void
  }) {
    this.onReStart = onReStart
    this.onLevelChange = onLevelChange
    this.initialize()
  }

  private initialize() {
    const step = document.getElementById('step')
    if (!step) return

    this.stepEl = step as HTMLSpanElement

    const reStart = document.getElementById('re-start')
    if (!reStart) return

    reStart.onclick = () => {
      this.onReStart()

      this.stepCount = 0
      this.drawStep()
    }

    const diff = document.getElementById('diff')
    if (!diff) return

    diff.onchange = (e: any) => {
      const level = e.target.value
      this.onLevelChange(level)

      this.stepCount = 0
      this.drawStep()
    }
  }

  recordStep() {
    this.stepCount++

    this.drawStep()
  }

  drawStep() {
    if (this.stepEl) {
      this.stepEl.innerHTML = this.stepCount.toString()
    }
  }
}


class Pintu {
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D

  itemWidth!: number
  items!: Items

  audio: HTMLAudioElement = new Audio(AUDIO_URL)

  control!: Control

  diffLevel: string = '1'

  constructor() {
    this.initialize()

    this.bindEvents()
    
    this.itemInited()

    this.itemsInited(this.diffLevel)

    this.controlInit()
  }

  controlInit() {
    const self = this

    this.control = new Control({
      onReStart() {
        self.itemsInited(self.diffLevel)
        self.drawItems()
      },
      onLevelChange(level: string) {
        self.diffLevel = level
        self.itemInited()
        self.itemsInited(level)
        self.drawItems()
      }
    })
  }
  
  initialize() {
    const container = document.querySelector("#app");
    if (!container) return;

    const appWidth =document.documentElement.clientWidth

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
    const { COL_COUNT } = tableCount[this.diffLevel]
    this.itemWidth = this.canvas.width / COL_COUNT
  }

  itemsInited(level:string) {
    const items = createItems(level)
    shuffle(items)

    this.items = items
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
    
    let run = true
    if (row === pos?.row && Math.abs(col - pos?.col) === 1) {
      swapItem(this.items, pos, { row, col })
    } else if (col === pos?.col && Math.abs(row - pos?.row) === 1) {
      swapItem(this.items, pos, { row, col })
    } else {
      run = false
    }

    if (run) {
      this.control.recordStep()

      this.drawItems()

      this.playAudio()

      this.check()
    }
  }

  check() {
    const noList = []
    const str = '1,2,3,4,5,6,7,8,0'
    const { ROW_COUNT, COL_COUNT } = tableCount[this.diffLevel]

    for (let i = 0; i < ROW_COUNT; i++) {
      for(let j = 0; j < COL_COUNT; j++) {
        const item = this.items[i][j]
          noList.push(item.id)
      }
    }

    if (noList.toString() === str) {
      alert('win')
    }
  }


  playAudio() {
    this.audio.pause()
    this.audio.currentTime = 0

    this.audio.play()
  }


  drawItems() {
    const CELL_SIZE = this.itemWidth
    const { ROW_COUNT, COL_COUNT } = tableCount[this.diffLevel]

    for (let i = 0; i < ROW_COUNT; i++) {
      for (let j = 0; j < COL_COUNT; j++) {
        const item = this.items[i][j]
        this.ctx.fillStyle = item.color
        this.ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE)
  
        this.ctx.fillStyle = '#ffffff'
        this.ctx.font = '60px Arial'
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        this.ctx.fillText(item.id.toString(), j * CELL_SIZE + CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE / 2)
      }
    }
  }
}


const pintuIns = new Pintu()
pintuIns.drawItems()


console.log(pintuIns)
