import Hilo from 'hilojs'
import Text from './text'
export default class AnswerPanel extends Hilo.Container {
  constructor(properties) {
    super(properties)
    this.text = properties.text
    this.initAnswerPanel(properties)
  }
  text = ''
  initAnswerPanel (properties) {
    // 整体背景
    new Hilo.Bitmap({
      x: 0,
      y: 0,
      image: properties.image,
      rect: [0, 0, 472, 810],
      visible: true
    }).addTo(this)

    // 标题
    const textContainer = new Text({
      text: this.text,
      fontSize: 65,
      bold: true,
      textAlign: 'center',
      height: 110,
      visible: true,
      alpha: 1,
      reTextWidth: 472,
      x: 0,
      y: 30,
      color: '#ffffff',
    }).addTo(this)

    properties.questionsPanelCanvas.on(Hilo.event.POINTER_START, (e) => {
      const setAnswer = properties.questionsPanelCanvas.setAnswer
      textContainer.text = `${setAnswer.length} / ${properties.questionsLength}`
    })
  }
}
