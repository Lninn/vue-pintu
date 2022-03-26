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

const PADDING = 36

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

interface Actions {
  onReStart: () => void
  onLevelChange: (level: string) => void
  onFileChange: (file: any) => void
  onAudioPlay: (txt: string) => any
}


class Control {
  private stepEl: HTMLSpanElement | null = null
  private stepCount: number = 0

  actions: Actions

  constructor(actions: Actions) {
    this.actions = actions

    this.initialize()
  }

  private initialize() {
    const step = document.getElementById('step')
    if (!step) return

    this.stepEl = step as HTMLSpanElement

    const reStart = document.getElementById('re-start')
    if (!reStart) return

    reStart.onclick = () => {
      this.actions.onReStart()

      this.stepCount = 0
      this.drawStep()
    }

    const diff = document.getElementById('diff')
    if (!diff) return

    diff.onchange = (e: any) => {
      const level = e.target.value
      this.actions.onLevelChange(level)

      this.stepCount = 0
      this.drawStep()
    }

    const file = document.getElementById('file')
    if (!file) return

    const self = this
    file.onchange = (e: any) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = createImage;
      reader.readAsDataURL(file);

      function createImage() {
        const img = new Image();
        img.onload = () => {
          self.actions.onFileChange(img)
        };
        img.src = reader.result as any;
      }
    };

    const audio = document.getElementById('audio')
    if (!audio) return
  
    audio.onclick = () => {
      const txt = audio.innerHTML
      if (txt === '音效') {
        audio.innerHTML = '静音'
        this.actions.onAudioPlay('静音')
      } else {
        audio.innerHTML = '音效'
        this.actions.onAudioPlay('音效')
      }
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
  img: HTMLImageElement | null = null

  status: string = 'playing'

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
        self.status = 'playing'
        self.itemsInited(self.diffLevel)
        self.draw()
      },
      onLevelChange(level: string) {
        self.diffLevel = level
        self.itemInited()
        self.itemsInited(level)
        self.draw()
      },
      onFileChange(img: any) {
        self.img = img

        self.itemsInited(self.diffLevel)
        self.draw()
      },
      onAudioPlay(txt: string) {
        if (txt === '音效') {
          self.audio.volume = 60 / 100
        } else {
          self.audio.volume = 0
        }
      }
    })
  }

  initialize() {
    const container = document.querySelector("#app");
    if (!container) return;

    const appWidth = document.documentElement.clientWidth

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
    const cWidth = this.canvas.width - PADDING * 2

    const { COL_COUNT } = tableCount[this.diffLevel]
    this.itemWidth = cWidth / COL_COUNT
  }

  itemsInited(level: string) {
    const items = createItems(level)
    shuffle(items)

    this.items = items
  }

  bindEvents() {
    const canvas = this.canvas

    canvas.addEventListener('click', this.handleClick.bind(this))
  }

  handleClick(e: MouseEvent) {
    if (this.status === 'end') return

    const CELL_SIZE = this.itemWidth

    const { clientX, clientY } = e

    const { left, top } = this.canvas.getBoundingClientRect()

    const offsetX = clientX - left - PADDING
    const offsetY = clientY - top - PADDING

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

      this.draw()

      this.playAudio()

      this.check()
    }
  }

  check() {
    const noList = []
    const str = '1,2,3,4,5,6,7,8,0'
    const { ROW_COUNT, COL_COUNT } = tableCount[this.diffLevel]

    for (let i = 0; i < ROW_COUNT; i++) {
      for (let j = 0; j < COL_COUNT; j++) {
        const item = this.items[i][j]
        noList.push(item.id)
      }
    }

    if (noList.toString() === str) {
      this.status = 'end'
      
      this.draw()
    }
  }


  playAudio() {
    this.audio.pause()
    this.audio.currentTime = 0

    this.audio.play()
  }


  draw() {
    if (this.status === 'playing') {
      this.drawItems()
    } else {
      this.drawEnd()
    }
  }

  drawItems() {
    const CELL_SIZE = this.itemWidth
    const { ROW_COUNT, COL_COUNT } = tableCount[this.diffLevel]

    for (let i = 0; i < ROW_COUNT; i++) {
      for (let j = 0; j < COL_COUNT; j++) {
        const item = this.items[i][j]
        this.ctx.fillStyle = item.color

        if (this.img) {
          if (item.tag === 0) {
            this.ctx.fillRect(j * CELL_SIZE + PADDING, i * CELL_SIZE + PADDING, CELL_SIZE, CELL_SIZE)
          } else {
            // TODO
            const imgWidth = this.img.width / ROW_COUNT
            const imgHeight = this.img.height / COL_COUNT
            this.ctx.drawImage(
              this.img,
              j * imgWidth,
              i * imgHeight,
              imgWidth,
              imgHeight,
              j * CELL_SIZE + PADDING,
              i * CELL_SIZE + PADDING,
              CELL_SIZE,
              CELL_SIZE
            )
          }
        } else {
          this.ctx.fillRect(j * CELL_SIZE + PADDING, i * CELL_SIZE + PADDING, CELL_SIZE, CELL_SIZE)
        }

        if (!this.img && item.tag === 1) {
          this.ctx.fillStyle = '#ffffff'
          this.ctx.font = '60px Arial'
          this.ctx.textAlign = 'center'
          this.ctx.textBaseline = 'middle'
          this.ctx.fillText(item.id.toString(), j * CELL_SIZE + CELL_SIZE / 2 + PADDING, i * CELL_SIZE + CELL_SIZE / 2 + PADDING)
        }
      }
    }
  }

  drawEnd() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.fillStyle = getRandomColor()
    this.ctx.font = '60px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height / 2)
  }
}


const pintuIns = new Pintu()
pintuIns.draw()


console.log(pintuIns)
