type ActionType = 'level' | 'sound' | 'stepCount' | 'restart' | 'showNo'

interface TextElement extends Pick<Object, 'hasOwnProperty'> {
  key: string
  label: string
  value: string
}

interface ButtonElement extends Pick<Object, 'hasOwnProperty'> {
  key: string
  label: string
}

interface SelectElement extends Pick<Object, 'hasOwnProperty'> {
  key: string
  label: string
  value: string
  options: {
    value: string
    label: string
  }[]
}

type Element = TextElement | ButtonElement | SelectElement

const CONFIG: Element[] = [
  {
    key: 'restart',
    label: '重新开始',
  },
  {
    key: 'showNo',
    label: '显示数字',
  },
  {
    key: 'stepCount',
    value: '0',
    label: '步数',
  },
  {
    key: 'level',
    value: '1',
    label: '难度',
    options: [
      {
        value: '1',
        label: '简单',
      },
      {
        value: '2',
        label: '正常',
      },
      {
        value: '3',
        label: '难度',
      }
    ]
  },
  {
    key: 'sound',
    value: '0',
    label: '声音',
    options: [
      {
        value: '0',
        label: '正常',
      },
      {
        value: '1',
        label: '静音',
      },
    ],
  },
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
    const nodes = this.createNodes()

    for (const node of nodes) {
      if(node) {
        this.container.appendChild(node)
      }
    }
  }

  appendNode(container: HTMLDivElement, node: any) {
    if(Array.isArray(node)) {
      for (const n of node) {
        container.appendChild(n)
      }
    } else {
      container.appendChild(node)
    }
  }

  createNodes() {
    const nodes: any[] = []

    for (const elemet of CONFIG) {
      const box = document.createElement('div')
      box.setAttribute('class', 'form-control')

      this.appendNode(
        box,
        this.createNode(elemet)
      )

      nodes.push(box)
    }

    return nodes
  }

  createNode(element: Element) {
    if (element.hasOwnProperty('value')) {
      if (element.hasOwnProperty('options')) {
        return this.createSelectNode(element as SelectElement)
      }

      return this.createTextNode(element as TextElement)
    }

    return this.createButtonNode(element)
  }

  createTextNode(element: TextElement) {
    const label = document.createElement('span')
    label.innerText = element.label

    const value = document.createElement('span')
    value.innerText = element.value.toString()
    value.dataset.key = element.key

    this.container.addEventListener(element.key, () => {
      const target = document.querySelector(`[data-key="${element.key}"]`) as HTMLSpanElement
      target.innerText = String(+target.innerText + 1)
    })

    return [
      label,
      value
    ]
  }

  createButtonNode(element: ButtonElement) {
    const button = document.createElement('button')
    button.innerText = element.label
    const self = this

    const action = this.actionMap[element.key as ActionType]
    if (action) {
      button.addEventListener('click', () => {
        action.apply(self, [element.key])
      })
    }

    return [button]
  }

  createSelectNode(element: SelectElement) {
    const label = document.createElement('span')
    label.innerText = element.label

    const value = document.createElement('span')
    value.innerText = element.value.toString()
    value.dataset.key = element.key

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

    return [
      label,
      value,
      select
    ]
  }

  public clearLabelByKey(key: ActionType) {
    const target = document.querySelector(`[data-key="${key}"]`) as HTMLSpanElement
    target.innerText = '0'
  }
}
