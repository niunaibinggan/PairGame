import Hilo from 'hilojs'

export default function () {

  return Hilo.Class.create({
    Mixes: Hilo.EventMixin,
    queue: null,
    bg: null,
    titleBg: null,
    submitButton: null,
    errorModel: null,
    rightModel: null,
    resetBtn: null,
    selectedBlock: null,
    selectedBlockError: null,
    selectedBlockRight: null,
    bgBlock: null,
    selectedBlockErrorLine: null,
    answerPanelBg: null,

    async load () {
      const resources = [
        { id: 'bg', src: require('~/static/bg.png') },
        { id: 'titleBg', src: require('~/static/title.png') },
        { id: 'submit', src: require('~/static/submit.png') },
        { id: 'errorModel', src: require('~/static/answer__error.png') },
        { id: 'rightModel', src: require('~/static/answer.png') },
        { id: 'resetBtn', src: require('~/static/again_button.png') },

        { id: 'selectedBlock', src: require('~/static/selected.png') },
        { id: 'selectedBlockError', src: require('~/static/error__bg.png') },
        { id: 'selectedBlockErrorLine', src: require('~/static/error__line.png') },
        { id: 'selectedBlockRight', src: require('~/static/right__bg.png') },
        { id: 'bgBlock', src: require('~/static/block.jpg') },
        { id: 'answerPanelBg', src: require('~/static/panel__bg.png') },

      ]
      this.queue = new Hilo.LoadQueue()
      this.queue.add(resources)
      this.queue.on('load', this.onProcess.bind(this))
      return await new Promise((resolve, reject) => {
        this.queue.on('complete', (e) => {
          this.onComplete(e)
          resolve(this)
        })
        this.queue.on('error', (e) => {
          this.onError(e)
          reject(e)
        })
        this.queue.start()
      })
    },
    onProcess (e) {
      this.fire('load', e)
    },
    onError (e) {
      this.fire('error', e)
    },
    onComplete (e) {
      this.bg = this.queue.get('bg').content
      this.titleBg = this.queue.get('titleBg').content
      this.submitButton = this.queue.get('submit').content
      this.rightModel = this.queue.get('rightModel').content
      this.errorModel = this.queue.get("errorModel").content
      this.resetBtn = this.queue.get("resetBtn").content

      this.selectedBlock = this.queue.get("selectedBlock").content
      this.selectedBlockError = this.queue.get("selectedBlockError").content
      this.selectedBlockRight = this.queue.get("selectedBlockRight").content
      this.bgBlock = this.queue.get("bgBlock").content
      this.selectedBlockErrorLine = this.queue.get("selectedBlockErrorLine").content
      this.answerPanelBg = this.queue.get("answerPanelBg").content

      this.queue.off('complete')
      this.fire('complete')
    },
  })
}
