type ActionType = 'level' | 'sound'

const CONFIG = [
  {
    key: 'level',
    value: 1,
    label: '难度',
    options: [
      {
        value: 1,
        label: '简单',
      },
      {
        value: 2,
        label: '正常',
      },
      {
        value: 3,
        label: '难度',
      }
    ]
  },
  {
    key: 'sound',
    value: 0,
    label: '声音',
    options: [
      {
        value: 0,
        label: '正常',
      },
      {
        value: 1,
        label: '静音',
      },
    ],
  }
]

type ActionCallback = (payload: string) => void
type ActionMap = Record<ActionType, ActionCallback>

export class Manager {
  actionMap: ActionMap
  container: HTMLDivElement

  constructor({
    actionMap
  }:{
    actionMap: ActionMap | undefined
  }) {
    if (!actionMap) {
      throw new Error('actionMap is required')
    }

    this.actionMap = actionMap
    this.container = document.getElementById('app') as HTMLDivElement

    this.initilize()
  }

  initilize() {
    const elements = this.createElements()
    for (const element of elements) {
      this.container.appendChild(element)
    }
  }

  createElements() {
    const elements = []

    for (const item of CONFIG) {
      const select = document.createElement('select')
      select.setAttribute('name', item.key)
      select.setAttribute('value', item.value + '')
      select.setAttribute('class', 'form-control')

      const action = this.actionMap[item.key as ActionType]
      if (action) {
        select.addEventListener('change', () => {
          action(select.value)
        })
      }

      for (const option of item.options) {
        const optionElement = document.createElement('option')
        optionElement.setAttribute('value', option.value + '')
        optionElement.innerHTML = option.label
        select.appendChild(optionElement)
      }

      elements.push(select)
    }

    return elements
  }
}
