import { Pintu } from "./pintu"
import { Manager } from './hepler'

const IMAGE = 'https://cdn.pixabay.com/photo/2022/01/17/06/38/altai-6943982_960_720.jpg'
const AUDIO_URL = 'https://img.tukuppt.com/newpreview_music/09/00/74/5c8949da6e66559783.mp3'

interface Actions {
  onReStart: () => void
  onLevelChange: (level: string) => void
  onFileChange: (file: any) => void
  onAudioPlay: (txt: string) => any
}

export class AudioEffect {
  private audio: HTMLAudioElement | null = null

  constructor() {
    this.reset()
  }

  public play() {
    if (this.audio) {
      this.audio.currentTime = 0

      this.audio.play()
    }
  }

  public toggle(value: string) {
    if(value === '0') {
      this.reset()
    } else {
      this.clear()
    }
  }

  reset() {
    this.audio = new Audio()
    this.audio.src = AUDIO_URL
  }

  clear() {
    this.audio = null
  }
}


export class Control {
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

const getImagae = (url: string) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = url
    img.onload = () => {
      resolve(img)
    }
    img.onerror = () => {
      resolve(null)
    }
  })
}

function logTime(time: number) {
  const loadTIme = document.getElementById('load-time')
  if (!loadTIme) return

  loadTIme.innerHTML = time.toString() + 'ms'
}

const main = async () => {
  const begin = new Date()

  const img = await getImagae(IMAGE) as HTMLImageElement
  if (!img) return

  logTime(
    new Date().getTime() - begin.getTime()
  )

  const audioEffect = new AudioEffect()

  const pintuIns = new Pintu(img)

  pintuIns.onMove = () => {
    audioEffect.play()

    const event = new Event('stepCount')
    document.dispatchEvent(event)
  }

  new Manager({
    actionMap: {
      level(value: string) {
        pintuIns.handleLevelChange(value)
      },
      sound(value: string) {
        audioEffect.toggle(value)
      }
    },
  })

  pintuIns.draw()
}

main()
