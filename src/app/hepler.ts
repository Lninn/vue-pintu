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

type Element = typeof CONFIG[number]

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
    const nodes = this.createNodes()

    for (const node of nodes) {
      this.container.appendChild(node)
    }
  }

  createNodes() {
    const nodes: HTMLDivElement[] = []

    for (const item of CONFIG) {
      const element = this.createSelectElement(item)
      nodes.push(element)
    }

    return nodes
  }

  createSelectElement(element: Element) {
    const box = document.createElement('div')
    box.setAttribute('class', 'form-control')

    const label = document.createElement('span')
    label.innerText = element.label

    const value = document.createElement('span')
    value.innerText = element.value.toString()

    const select = document.createElement('select')
    select.setAttribute('name', element.key)
    select.setAttribute('value', element.value + '')
    
    const action = this.actionMap[element.key as ActionType]
    if (action) {
      select.addEventListener('change', (e) => {
        const currentElement = e.target as HTMLSelectElement

        const valueElement = currentElement.previousElementSibling as HTMLSpanElement
        valueElement.innerText = currentElement.value
        
        action(select.value)
      })
    }

    for (const option of element.options) {
      const optionElement = document.createElement('option')
      optionElement.setAttribute('value', option.value + '')
      optionElement.innerHTML = option.label
      select.appendChild(optionElement)
    }

    box.appendChild(
      label,
    )
    box.appendChild(
      value,
    )
    box.appendChild(
      select,
    )

    return box
  }
}
