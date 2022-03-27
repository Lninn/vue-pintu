import { Pintu } from "./pintu"
import { Manager } from './hepler'

const IMAGE = 'https://cdn.pixabay.com/photo/2022/01/17/06/38/altai-6943982_960_720.jpg'
const AUDIO_URL = 'https://img.tukuppt.com/newpreview_music/09/00/74/5c8949da6e66559783.mp3'

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

    const canvas = pintuIns.getCanvas()

    const event = new Event('stepCount', {
      bubbles: true,
    })
    canvas.dispatchEvent(event)
  }

  new Manager({
    actionMap: {
      level(value: string) {
        pintuIns.handleLevelChange(value)
      },
      sound(value: string) {
        audioEffect.toggle(value)
      },
      restart() {
        pintuIns.handleRestart()
        const self = this as unknown as Manager

        self.clearLabelByKey('stepCount')
      },
      showNo() {
        pintuIns.toggleShowNo()
      },
      stepCount() {
        console.log('stepCount');
      },
      changeImage() {
        const self = this as unknown as Manager

        self.getImageFromLocalDevice().then((img: HTMLImageElement | null) => {
          if (img) {
            pintuIns.handleImageChange(img)
          }
        })
      }
    },
  })

  pintuIns.draw()
}

main()
