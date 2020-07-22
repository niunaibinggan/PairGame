<template>
  <div class="root">
    <div class="container"
         ref="container"></div>

    <div class="answer-panel"
         :style="panelStyle">
      <ul class="ansewer-list"
          v-if="setAnswer.length">
        <li class="answer-item"
            v-for="(item,index) in errorAnswerLeft"
            :key="item.id">
          <span class="answer-item__icon-error"></span>
          <span class="answer-item__image">
            <span class="answer-item__image-text"
                  v-if="item.type === 'text'"
                  :style="item.fontStyle">{{item.text}}</span>
            <el-image v-if="item.type=== 'image'"
                      class="answer-item__image-img"
                      :src="item.text"
                      fit="contain"></el-image>
          </span>
          <span class="answer-item__line"></span>
          <span class="answer-item__image">
            <span class="answer-item__image-text"
                  v-if="errorAnswerRight[index].type === 'text'"
                  :style="errorAnswerRight[index].fontStyle">{{errorAnswerRight[index].text}}</span>
            <el-image v-if="errorAnswerRight[index].type=== 'image'"
                      class="answer-item__image-img"
                      :src="errorAnswerRight[index].text"
                      fit="contain"></el-image>
          </span>
        </li>
        <li class="answer-item"
            v-for="item in setAnswer"
            :key="item">
          <span class="answer-item__icon-right"></span>
          <span class="answer-item__image">
            <span class="answer-item__image-text"
                  v-if="getItem('left',item).type === 'text'"
                  :style="getItem('left',item).fontStyle">{{getItem('left',item).text}}</span>
            <el-image v-if="getItem('left',item).type=== 'image'"
                      class="answer-item__image-img"
                      :src="getItem('left',item).text"
                      fit="contain"></el-image>
          </span>
          <span class="answer-item__line"></span>
          <span class="answer-item__image">
            <span class="answer-item__image-text"
                  v-if="getItem('right',item).type === 'text'"
                  :style="getItem('right',item).fontStyle">{{getItem('right',item).text}}</span>
            <el-image v-if="getItem('right',item).type=== 'image'"
                      class="answer-item__image-img"
                      :src="getItem('right',item).text"
                      fit="contain"></el-image>
          </span>
        </li>

      </ul>
    </div>

    <div v-if="visibleModel"
         :class="isAllRight ?  'answer-model__right' :'answer-model__error'"
         :style="modleStyle"></div>
  </div>

</template>

<script>
  import Hilo from 'hilojs'
  import AssetsFectory from '~/components/game/asset'
  import StageFectory from '~/components/game/stage'
  import ExportScence from '~/components/game/exportScence'
  import SubmitButton from '~/components/game/submitButton'
  import Panel from '~/components/game/panel'
  // import ResultModel from '~/components/game/resultModel'
  import ResetButton from '~/components/game/resetButton'
  import AnswerPanel from '~/components/game/AnswerPanel'
  import debounce from 'lodash.debounce'
  export default {
    data () {
      return {
        gameMain: null,
        stage: null,
        assets: null,
        questions: {},
        isAllRight: false,
        questionsPanelCanvas: null,
        questionsResetCanvas: null,
        questionsSubmitCanvas: null,
        resultCanvas: null,
        setAlpha: 1,
        setAnswer: [],
        selectedQuestionsId: null,
        panelStyle: {},
        fontStyle: {},
        modleStyle: {},
        answerCanvas: null,
        visibleModel: false,
        errorAnswerLeft: [],
        exportScence: null
      }
    },
    async mounted () {
      let questions
      // 获取问题
      try {
        questions = await this.$testload()
      } catch (error) {
        questions = localStorage.getItem('questionsConfig')
      }

      if (!questions) return this.$router.replace('/config')

      this.questions = JSON.parse(questions)

      this.shuffle(this.questions.left.concat(this.questions.right))

      // 预加载图片
      const Assets = AssetsFectory()
      this.assets = new Assets()
      await this.assets.load()

      // 初始化舞台
      this.gameMain = StageFectory()
      this.stage = this.gameMain.stage
      this.$refs['container'].appendChild(this.stage.canvas)
      const oCanvas = document.querySelector('canvas')

      const { bg, titleBg } = this.assets


      // 准备场景
      this.exportScence = new ExportScence({
        x: 0,
        y: 0,
        questions: this.questions,
        images: { bg, titleBg },
        title: this.questions.title,
        ticker: this.gameMain.ticker,
      })

      // 插入背景
      this.stage.addChild(this.exportScence)

      this.questionsPanelCanvas = this.createPanel()
      this.answerCanvas = this.createAnswer()
      this.questionsSubmitCanvas = this.createSubmitButton()
      this.questionsPanelCanvas.on(Hilo.event.POINTER_START, (e) => {
        this.setAnswer = this.questionsPanelCanvas.setAnswer
      })

      this.calculationPanel()
      this.initWindowOnSize()

    },
    methods: {
      createAnswer () {
        const answerPanel = new AnswerPanel({
          x: 150,
          y: 150,
          text: `${this.setAnswer.length} / ${this.questions.left.length}`,
          questionsLength: this.questions.left.length,
          image: this.assets.answerPanelBg,
          questionsPanelCanvas: this.questionsPanelCanvas
        })
        this.stage.addChild(answerPanel)
        return answerPanel
      },
      createPanel () {
        const { selectedBlock, selectedBlockError, selectedBlockRight, bgBlock, selectedBlockErrorLine } = this.assets
        // 插入题目 两个板块之间的距离 300 每个背景板的长度 499 106
        const panel = new Panel({
          x: 0,
          y: 0,
          questions: this.questions.concat,
          alpha: this.setAlpha,
          stage: this.stage,
          images: { selectedBlock, selectedBlockError, selectedBlockRight, bgBlock, selectedBlockErrorLine }
        })

        this.stage.addChild(panel)

        return panel
      },
      createSubmitButton () {
        // 准备按钮 canvas 1920 1080 , subButton 329 96
        const subBtn = new SubmitButton({
          x: (1920 - 329) / 2,
          y: (1080 - 96) / 2 + 430,
          images: this.assets.submitButton,
          rect: [0, 0, 329, 96],
          visible: true,
          alpha: this.setAlpha,
        })

        subBtn.on(Hilo.event.POINTER_START, (e) => {
          this.setAnswer = this.questionsPanelCanvas.setAnswer
          this.isAllRight = (this.setAnswer.length === this.questions.left.length)
          if (!this.isAllRight) {
            this.errorAnswerLeft = this.questions.left.filter(item => !this.setAnswer.includes(item.id))
            this.errorAnswerRight = this.questions.right.filter(item => !this.setAnswer.includes(item.id))
          }
          this.visibleModel = true

          this.exportScence.timeStart = false

          this.exportScence.timeCount = 0

          setTimeout(() => {
            this.questionsResetCanvas = this.createRestButtons()
            this.questionsSubmitCanvas.visible = false
            this.visibleModel = false
            // 移除显示结果panel
            // this.stage.removeChild(this.questionsPanelCanvas)
            this.questionsPanelCanvas.visible = false
            // this.questionsPanelCanvas = null
          }, 2000)

        })
        this.stage.addChild(subBtn)

        return subBtn
      },
      createRestButtons () {
        // 重置按钮
        const repeatX = (1920 - 329) / 2

        const resetButtons = new ResetButton({
          x: repeatX,
          y: (1920 - 96) / 2 + 10,
          images: [this.assets.resetBtn],
          rect: [0, 0, 329, 96],
          visible: true,
          alpha: this.setAlpha
        })

        resetButtons.on(Hilo.event.POINTER_START, (e) => {
          this.resetHandel()
        })
        this.stage.addChild(resetButtons)

        return resetButtons
      },
      resetHandel () {
        this.questionsResetCanvas.visible = false
        this.stage.removeChild(this.answerCanvas)
        this.questionsSubmitCanvas.visible = true
        // 重置基础信息
        this.setAnswer = []
        this.errorAnswerLeft = []
        this.errorAnswerRight = []

        this.shuffle(this.questions.left.concat(this.questions.right))
        // 重置后创建
        this.questionsPanelCanvas = this.createPanel()
        this.answerCanvas = this.createAnswer()

        this.questionsPanelCanvas.on(Hilo.event.POINTER_START, (e) => {
          this.setAnswer = this.questionsPanelCanvas.setAnswer
        })
        this.exportScence.timeCount = 0

        this.exportScence.timeStart = true

      },
      shuffle (arr) {
        for (var i = arr.length - 1; i >= 0; i--) {
          var randomIndex = Math.floor(Math.random() * (i + 1));
          var itemAtIndex = arr[randomIndex];
          arr[randomIndex] = arr[i];
          arr[i] = itemAtIndex;
        }
        this.questions.concat = arr
      },
      initWindowOnSize () {
        if (!window) return
        window.onresize = debounce(() => {
          this.calculationPanel()
        }, 100)
      },
      calculationPanel () {
        const oCanvas = document.getElementsByTagName('canvas')[0]

        this.panelStyle = {
          width: Math.round(oCanvas.getBoundingClientRect().width / 4.2) + 'px',
          height: Math.round(oCanvas.getBoundingClientRect().height / 1.6) + 'px',
          left: Math.round(oCanvas.getBoundingClientRect().width / 12) + 'px',
          top: Math.round(oCanvas.getBoundingClientRect().height / 4) + 'px',
        }

        const scaleBase = Math.round(oCanvas.getBoundingClientRect().width) / 1920

        this.questions.left.forEach((item, index) => {
          item.fontSize = {
            fontSize: '18px',
            // top: `${50 - Math.floor(this.getByte(item.text) / 10)}%`,
            top: '20%',
            transform: `translate(-50%, -50%) scale(${scaleBase})`,
          }

          this.questions.right[index].fontSize = {
            fontSize: '18px',
            top: `${50 - Math.floor(this.getByte(item.text) / 10)}%`,
            transform: `translate(-50%, -50%) scale(${scaleBase})`,
          }
        })

        console.log(this.questions)

        this.fontStyle = {
          fontSize: '18px',
          transform: `translate(-50%, -50%) scale(${scaleBase})`,
          // top: `${50 - Math.floor(this.getByte(item.text) / 10)}%`
        }

        this.modleStyle = {
          width: oCanvas.getBoundingClientRect().width + 'px',
          height: oCanvas.getBoundingClientRect().height + 'px'
        }
      },
      getItem (type, id) {
        const current = this.questions.left.findIndex(item => item.id === id)
        return this.questions[type][current]
      },
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
  }
</script>

<style>
  .root {
    position: relative;
  }

  .answer-panel {
    position: absolute;
  }
  .ansewer-list {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 5%;
  }
  .answer-item {
    width: 100%;
    height: 23.5%;
    margin-bottom: 5%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
  }

  .answer-item:nth-last-of-type(1) {
    margin-bottom: 0;
  }

  .answer-item__icon-right {
    width: 12%;
    height: 20%;
    background: url("../static/panel__right__icon.png") no-repeat center center;
    background-size: 50%;
  }

  .answer-item__icon-error {
    width: 12%;
    height: 20%;
    background: url("../static/panel__error__icon.png") no-repeat center center;
    background-size: 50%;
  }

  .answer-item__image {
    width: 30%;
    height: 85%;
    background: url("../static/panel__block__bg.png") no-repeat center center;
    background-size: 100%;
    text-align: center;
    position: relative;
  }

  .answer-item__line {
    width: 20%;
    height: 85%;
    background: url("../static/panel__line.png") no-repeat center center;
    background-size: 100%;
  }

  .answer-item__image:nth-last-of-type(1) {
    margin-right: 3%;
  }

  .answer-item__image-text {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 200%;
    height: 50%;
    text-align: center;
    padding-left: 2%;
    font-weight: bold;
    color: #975f21;
  }

  .answer-item__image-img {
    margin: 0 auto;
    width: 90%;
    height: 98%;
    position: relative;
    left: 2%;
  }

  .answer-model__error {
    position: absolute;
    left: 0;
    top: 0;
    background: url("../static/answer__error.png") no-repeat center center;
    background-size: 100% 100%;
  }

  .answer-model__right {
    position: absolute;
    left: 0;
    top: 0;
    background: url("../static/answer.png") no-repeat center center;
    background-size: 100% 100%;
  }
  canvas {
    left: 0;
  }
</style>
