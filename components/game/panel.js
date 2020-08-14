import Hilo from 'hilojs'
import Text from './text'
export default class ResultPanel extends Hilo.Container {
  constructor(properties) {
    super(properties)
    this.initPanel(properties)
  }

  blockRect = [0, 0, 150, 150]
  blockSelected = [0, 0, 163, 162]
  blockSelectedError = [0, 0, 170, 172]
  blockSelectedRight = [0, 0, 178, 176]
  blockSelectedErrorLine = [0, 0, 477, 144]

  setAnswer = []
  selectedQuestionsId = null

  currentSelected = [...new Array(2)]

  lineContainer = null

  target = 6

  initPanel (properties) {
    const columns = Math.ceil(properties.questions.length / this.target)
    const rows = properties.questions.length % this.target

    const distance = 30

    const panel = new Hilo.Container({
      x: 700,
      y: 190,
      width: 1050,
      height: 700,
    }).addTo(this)

    this.lineContainer = new Hilo.Container({
      x: 0,
      y: (700 - (columns * this.blockRect[2] + (columns - 1) * distance)) / 2,
    }).addTo(panel)

    const panelContainer = new Hilo.Container({
      x: 0,
      y: (700 - (columns * this.blockRect[2] + (columns - 1) * distance)) / 2,
    }).addTo(panel)

    properties.questions.forEach((item, index) => {

      const id = { realId: index, questionId: item.id }

      const { bgBlock } = properties.images

      // 模块上下居中
      let x
      const y = Math.floor(index / this.target) * (this.blockRect[3] + distance)

      if (!rows) {
        x = (index % this.target) * (this.blockRect[2] + distance)
      } else {
        if (Math.ceil((index + 1) / this.target) !== columns) {
          x = (index % this.target) * (this.blockRect[2] + distance)
        } else {
          x = ((1050 - (rows * this.blockRect[2] + (rows - 1) * distance)) / 2) + (index % this.target) * (this.blockRect[2] + distance)
        }
      }

      const blockContainer = new Hilo.Container({
        id,
        x,
        y,
        visible: true,
        alpha: 1
      }).addTo(panelContainer)

      new Hilo.Bitmap({
        id,
        image: bgBlock,
        rect: this.blockRect,
        visible: true,
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0,
      }).addTo(blockContainer)

      let fontSize = 38

      let fontSizeY = 60

      if (this.getByte(item.text) > 6 && this.getByte(item.text) < 22) {
        fontSize = 38 - (this.getByte(item.text) / 5) * 5
        fontSizeY = 65 - fontSize / 2 + 10
      }

      else if (this.getByte(item.text) >= 22 && this.getByte(item.text) < 35) {
        fontSize = 38 - (this.getByte(item.text) / 13) * 5
        fontSizeY = 35 - fontSize / 2
      }
      else if (this.getByte(item.text) >= 35) {
        fontSize = 38 - (this.getByte(item.text) / 15) * 5
        fontSizeY = 25 - fontSize / 2
      }

      if (item.type === 'text') {
        new Text({
          id,
          text: item.text,
          lineHeight: this.getByte(item.text) < 6 ? 0 : fontSize + 9,
          fontSize,
          bold: true,
          textAlign: 'center',
          height: 110,
          visible: true,
          alpha: 1,
          reTextWidth: this.blockRect[2],
          x: 0,
          y: fontSizeY,
          color: '#975f21',
        }).addTo(blockContainer)
      }

      if (item.type === 'image') {
        // 渲染图片
        const img = new Image()
        img.src = item.text
        img.onload = (e) => {
          const realImageWidth = e.path[0].width
          const realImageHeight = e.path[0].height
          const baseScale = 0.9
          const scale = realImageWidth > realImageHeight ? this.blockRect[2] / realImageWidth : this.blockRect[3] / realImageHeight

          new Hilo.Bitmap({
            id,
            x: (this.blockRect[2] - realImageWidth * scale * baseScale) / 2,
            y: (this.blockRect[3] - realImageHeight * scale * baseScale) / 2,
            width: realImageWidth * scale * baseScale,
            height: realImageHeight * scale * baseScale,
            image: item.text,
            visible: true,
          }).addTo(blockContainer)
        }
      }

      blockContainer.on(Hilo.event.POINTER_START, (e) => {
        if (this.currentSelected.every(item => item)) return
        // 选中框
        this.createSelectedBlock({ realId: index, questionId: item.id }, e, blockContainer, properties)
      })
    })
  }

  createSelectedBlock (id, e, target, properties) {
    const { selectedBlock, selectedBlockError, selectedBlockRight, selectedBlockErrorLine } = properties.images

    const block = new Hilo.Bitmap({
      id,
      image: selectedBlock,
      rect: this.blockSelected,
      visible: true,
      scaleX: 0.8,
      scaleY: 0.8,
      x: (this.blockRect[2] - this.blockSelected[2] * 0.8) / 2,
      y: (this.blockRect[3] - this.blockSelected[3] * 0.8) / 2,
      alpha: 0,
    }).addTo(target)

    Hilo.Tween.to(
      block,
      {
        alpha: this.currentSelected[0] && this.currentSelected[0].realId === id.realId ? 0 : 1,
        scaleX: 1,
        scaleY: 1,
        x: (this.blockRect[2] - this.blockSelected[2]) / 2,
        y: (this.blockRect[3] - this.blockSelected[3]) / 2
      },
      { duration: 150 }
    )

    const rightBlock = new Hilo.Bitmap({
      id: 'rightBlock',
      image: selectedBlockRight,
      rect: this.blockSelectedRight,
      visible: true,
      scaleX: 0.5,
      scaleY: 0.5,
      x: (this.blockRect[2] - this.blockSelectedRight[2] * 0.5) / 2,
      y: (this.blockRect[3] - this.blockSelectedRight[3] * 0.5) / 2,
      alpha: 0,
    }).addTo(target)

    const errorBlock = new Hilo.Bitmap({
      id,
      image: selectedBlockError,
      rect: this.blockSelectedError,
      visible: true,
      scaleX: 0.8,
      scaleY: 0.8,
      x: (this.blockRect[2] - this.blockSelectedError[2] * 0.8) / 2,
      y: (this.blockRect[3] - this.blockSelectedError[3] * 0.8) / 2,
      alpha: 0,
    }).addTo(target)


    if (!this.currentSelected[0]) {
      this.currentSelected[0] = Object.assign(e.eventTarget.id,
        {
          errorCon: e.eventTarget.parent.getChildAt(4),
          rightCon: e.eventTarget.parent.getChildAt(3),
          parent: e.eventTarget.parent,
          currentCon: e.eventTarget.parent.getChildAt(2),
          block,
        }
      )
    } else if (this.currentSelected[0] && (e.eventTarget.id.realId !== this.currentSelected[0].realId)) {
      this.currentSelected[1] = Object.assign(e.eventTarget.id,
        {
          errorCon: e.eventTarget.parent.getChildAt(4),
          rightCon: e.eventTarget.parent.getChildAt(3),
          parent: e.eventTarget.parent,
          currentCon: e.eventTarget.parent.getChildAt(2),
          block
        })
    }

    const that = this
    if (this.currentSelected.every(item => item)) {

      if (this.currentSelected[0].questionId === this.currentSelected[1].questionId) {
        this.setAnswer.unshift(this.currentSelected[0].questionId)
        this.selectedQuestionsId = this.currentSelected[0].questionId
        this.currentSelected.forEach(item => {
          Hilo.Tween.to(
            item.rightCon,
            {
              alpha: 1, scaleX: 1.2, scaleY: 1.2,
              x: (this.blockRect[2] - this.blockSelectedRight[2] * 1.2) / 2,
              y: (this.blockRect[3] - this.blockSelectedRight[3] * 1.2) / 2
            },
            {
              delay: 150,
              duration: 150,
              onComplete () {
                Hilo.Tween.to(
                  item.parent,
                  { alpha: 0 },
                  {
                    duration: 150,
                    onComplete () {
                      that.currentSelected = that.currentSelected.map(item => item = undefined)
                    }
                  }
                )
              }
            }
          )
        })

      } else {
        const line1 = this.currentSelected[0].parent
        const line2 = this.currentSelected[1].parent

        if (line1.x === line2.x) {
          // 创建闪电
          new Hilo.Bitmap({
            image: selectedBlockErrorLine,
            width: Math.abs(line1.y - line2.y),
            height: 144,
            rect: [0, 0, 477 / 2, 144],
            visible: true,
            x: line1.x + this.blockRect[2] / 4 + 144,
            y: Math.min(...this.currentSelected.map(item => item.parent.y)) + this.blockRect[3] / 4,
            alpha: 0.3,
            rotation: 90,
          }).addTo(this.lineContainer)
        }

        if (line1.y === line2.y) {
          // 创建闪电
          new Hilo.Bitmap({
            image: selectedBlockErrorLine,
            width: Math.abs(line1.x - line2.x),
            height: 144,
            rect: [0, 0, 477 / 2, 144],
            visible: true,
            x: Math.min(...this.currentSelected.map(item => item.parent.x)) + this.blockRect[2] / 4,
            y: line1.y - this.blockRect[2] / 4,
            alpha: 0.3,
          }).addTo(this.lineContainer)
        }

        if (line1.x !== line2.x && line1.y !== line2.y) {
          const startX = line1.x > line2.x ? line2.x : line1.x
          const startY = line1.y > line2.y ? line2.y : line1.y

          new Hilo.Bitmap({
            image: selectedBlockErrorLine,
            width: Math.abs(line1.x - line2.x),
            height: 144,
            rect: [0, 0, 477 / 2, 144],
            visible: true,
            x: startX + this.blockRect[2] / 4,
            y: (startX !== line1.x ? line1.y : line2.y) - this.blockRect[3] / 4,
            alpha: 0.3,
          }).addTo(this.lineContainer)

          new Hilo.Bitmap({
            image: selectedBlockErrorLine,
            width: Math.abs(line1.y - line2.y) * 1.4,
            height: 144,
            rect: [0, 0, 477 / 2, 144],
            visible: true,
            x: startX + this.blockRect[2] / 4 + 144,
            y: startY,
            alpha: 0.3,
            rotation: 90,
          }).addTo(this.lineContainer)

        }
        Hilo.Tween.to(
          that.currentSelected[0].errorCon,
          {
            alpha: .7, scaleX: 1, scaleY: 1,
            x: (this.blockRect[2] - this.blockSelectedRight[2]) / 2,
            y: (this.blockRect[3] - this.blockSelectedRight[3]) / 2
          },
          {
            delay: 150,
            duration: 150,
            onComplete () {
              that.currentSelected[0].block.alpha = 0
              block.alpha = 0
              that.currentSelected[0] = undefined
              that.currentSelected[1] = undefined
              that.selectedQuestionsId = null
              that.lineContainer.removeAllChildren()
            }
          }
        )
      }
    }
  }

  getByte (str = '') {
    let len = 0
    for (var i = 0; i < str.length; i++) {
      var c = str.charAt(i);
      if (escape(c).length > 4) {
        len += 2;
      } else if (c != "\r") { len++; }
    }
    return len
  }
}
