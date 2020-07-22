import Hilo from 'hilojs'
import Text from './text'
export default class ExportScence extends Hilo.Container {
  constructor(properties) {
    super(properties)

    this.initBackground(properties)

    this.initTime(properties)
  }

  timeCount = 0
  timeStart = true

  initBackground (properties) {
    // 整体背景
    new Hilo.Bitmap({
      x: 0,
      y: 0,
      image: properties.images.bg,
      rect: [0, 0, 1920, 1080],
      visible: true
    }).addTo(this, -1)

    // 时间背景
    new Hilo.Bitmap({
      x: 0,
      y: 0,
      image: properties.images.titleBg,
      rect: [0, 0, 1920, 146,],
      visible: true
    }).addTo(this)

    // 标题
    new Text({
      text: properties.title,
      fontSize: this.getByte(properties.title) < 30 ? 65 : 65 - Math.round(this.getByte(properties.title) / 12) * 5,
      bold: true,
      textAlign: 'center',
      height: 110,
      visible: true,
      alpha: 1,
      reTextWidth: 1400,
      x: (1920 - 1600) / 2 - 100,
      y: this.getByte(properties.title) < 30 ? 50 : 50 + (65 - (65 - Math.round(this.getByte(properties.title) / 12) * 5)) / 2,
      color: '#ffffff',
    }).addTo(this)
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

  initTime (properties) {
    const time = new Text({
      text: this.getTime(this.timeCount),
      fontSize: 55,
      bold: true,
      textAlign: 'center',
      height: 110,
      visible: true,
      alpha: 1,
      reTextWidth: 230,
      x: (1920 - 360),
      y: 55,
      color: '#975f21',
    }).addTo(this)

    properties.ticker.interval(() => {
      if (this.timeStart) {
        this.timeCount++
        time.text = this.getTime(this.timeCount)
      }
    }, 1000)

    // properties.submit.on(Hilo.event.POINTER_START, (e) => {
    //   this.timeStart = false
    //   // textContainer.text = `${setAnswer.length} / ${properties.questionsLength}`
    // })
  }

  getTime (time = 0) {
    let m = Math.floor(time / 60) + ''
    m = m.padStart(2, '0')
    let s = time % 60 + ''
    s = s.padStart(2, '0')
    return `${m} : ${s}`
  }
}
