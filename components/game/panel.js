import Hilo from 'hilojs'
import Text from './text'
export default class ResultPanel extends Hilo.Container {
  constructor(properties) {
    super(properties)

    this.leftQuestions = properties.questions.concat

    this.rightQuestions = properties.questions.right

    this.leftContainerY = 360 - this.leftQuestions.length * 20

    this.rightContainerY = 360 - this.rightQuestions.length * 20

    this.setAnswer = [...Array(this.rightQuestions.length)]

    // this.stage = properties.stage

    this.creatContainer()

    this.submitButton(properties)

    this.initPanel(properties)
  }

  leftQuestions = []
  rightQuestions = []

  leftContainer = null
  rightContainer = null

  answerContainer = null
  rectRight = [0, 0, 471, 87]
  rectLeft = [0, 0, 356, 86]
  leftContainerY = 0
  rightContainerY = 0
  alpha = 1
  timer = null

  targetPosition = []
  selectPosition = []

  setAnswer = []

  submitButton (properties) {
    properties.subBtn.on(Hilo.event.POINTER_START, (e) => {
      const that = this
      this.setAnswer.forEach((item, index) => {
        if (item.questionId !== this.rightQuestions[index].id) {
          Hilo.Tween.to(
            that.leftContainer.getChildAt(item.realId),
            { x: that.selectPosition[item.realId].x, y: that.selectPosition[item.realId].y },
            { duration: 300 }
          )

          this.setAnswer[index] = undefined
        }
      })
    })
  }

  creatContainer () {
    this.rightContainer = new Hilo.Container({
      x: 900,
      y: this.rightContainerY,
    }).addTo(this)

    this.answerContainer = new Hilo.Container({
      x: 0,
      y: 0,
    }).addTo(this.rightContainer)

    this.leftContainer = new Hilo.Container({
      x: 250,
      y: this.leftContainerY,
    }).addTo(this)
  }

  initPanel (properties) {
    this.commonPanel({
      type: 'left',
      target: this.leftQuestions,
      targetContainer: this.leftContainer,
      rect: this.rectLeft,
      images: { leftBg: properties.leftBg }
    })
    this.commonPanel({
      type: 'right',
      target: this.rightQuestions,
      targetContainer: this.rightContainer,
      rect: this.rectRight,
      images: { leftBg: properties.leftBg, rightBg: properties.rightBg }
    })

    // 获取选项的初始位置
    this.selectPosition = this.leftContainer.children.map(item => {
      return { x: item.x, y: item.y }
    })

    // 启动定时器
    this.timer = setInterval(() => {
      this.answerContainer.children.forEach(item => {
        Hilo.Tween.to(
          item,
          { alpha: 0.3 },
          {
            duration: 500,
            onComplete () {
              item.alpha = .3
              Hilo.Tween.to(
                item,
                { alpha: 0 },
                { duration: 800, }
              )
            }
          }
        )
      })
    }, 1300)
  }

  commonPanel (data) {
    const { type, target, targetContainer, rect, images } = data
    target.forEach((item, index) => {
      const questionsItem = new Hilo.Container({
        id: { realId: index, questionId: item.id },
        x: 0,
        y: 0 + index * (170 - target.length * 10)
      }).addTo(targetContainer)

      new Hilo.Bitmap({
        x: type === 'left' ? 0 : this.rectLeft[2] - 12,
        y: 0,
        rect: rect,
        image: type == 'left' ? images.leftBg : images.rightBg,
        alpha: this.alpha
      }).addTo(questionsItem)

      if (type === 'right') {
        new Hilo.Bitmap({
          id: { realId: index, questionId: item.id },
          x: 0,
          y: 1 + index * (170 - target.length * 10),
          rect: this.rectLeft,
          image: images.leftBg,
          alpha: 0,
        }).addTo(this.answerContainer)
      }

      new Text({
        id: { realId: index, questionId: item.id },
        text: item.text,
        fontSize: 50,
        bold: true,
        textAlign: 'center',
        visible: true,
        alpha: 1,
        reTextWidth: type === 'left' ? rect[2] - 20 : rect[2] - 80,
        height: rect[3] - 10,
        x: type === 'left' ? 0 : this.rectLeft[2] - 12,
        y: 10,
        color: '#fff',
      }).addTo(questionsItem)

      if (type === 'left') this.drag(questionsItem)
    })
  }

  drag (target) {
    Hilo.util.copy(target, Hilo.drag)

    target.startDrag([-120, -this.leftContainerY, 1920, 1080])

    target.on('dragStart', (e) => {
      clearInterval(this.timer)
      this.timer = null
    })

    target.on('dragMove', (e) => {

      const includeArr = this.findItemIndex(e.target.x, e.target.y, 'arr')

      if (includeArr.length) {
        this.answerContainer.children.forEach(item => {
          item.alpha = includeArr.includes(item.id.realId) ? 0.3 : 0
        })
      } else {
        this.answerContainer.children.map(item => item.alpha = 0)
      }
    })

    target.on('dragEnd', (e) => {

      this.answerContainer.children.map(item => item.alpha = 0)

      const targetIndex = e.target.id.realId

      const existIndex = this.setAnswer.findIndex(item => item && item.realId === targetIndex)

      const currentTarget = this.findItemIndex(e.target.x, e.target.y)

      const isSelected = currentTarget !== -1

      const x = isSelected ? this.targetPosition[currentTarget].x : this.selectPosition[targetIndex].x

      const y = isSelected ? this.targetPosition[currentTarget].y : this.selectPosition[targetIndex].y

      if (isSelected && this.setAnswer[currentTarget]) {

        const preIndex = this.setAnswer[currentTarget].realId

        Hilo.Tween.to(
          this.leftContainer.getChildAt(preIndex),
          { x: this.selectPosition[preIndex].x, y: this.selectPosition[preIndex].y },
          { duration: 200 }
        )
      }

      if (existIndex !== -1) this.setAnswer[existIndex] = undefined

      const that = this
      Hilo.Tween.to(
        target,
        { x, y },
        {
          duration: 300,
          onComplete () {
            if (isSelected) {
              that.setAnswer[currentTarget] = e.target.id
            }
          }
        }
      )
    })
  }

  findItemIndex (dragX, dragY, type) {

    const distanceContainerX = 650

    const distanceContainerY = Math.abs(this.leftContainerY - this.rightContainerY)

    this.targetPosition = this.answerContainer.children.map(item => {
      return { x: item.x + distanceContainerX, y: item.y + distanceContainerY }
    })

    const filterArr = this.targetPosition.filter((item, index) => {
      if ((item.x + this.rectLeft[2] > dragX) && (item.x - this.rectLeft[2] < dragX)
        && (item.y + this.rectLeft[3] > dragY) && (item.y - this.rectLeft[3] < dragY)) {
        item.index = index
        item.distanceY = Math.round(Math.abs(item.y - dragY))
        return item
      }
    })

    if (!filterArr.length) return type === 'arr' ? [] : -1

    if (type === 'arr') {
      return filterArr.map(item => item.index)
    }

    const minDistance = Math.min(...filterArr.map(item => item.distanceY))

    return filterArr[filterArr.findIndex(item => item.distanceY === minDistance)].index
  }
}
