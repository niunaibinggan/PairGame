import AssetsFectory from '~/components/game/asset'
import StageFectory from '~/components/game/stage'
import ExportScence from '~/components/game/exportScence'
import SubmitButton from '~/components/game/submitButton'
import Panel from '~/components/game/panel'
import AnswerPanel from '~/components/game/AnswerPanel'
import Hilo from 'hilojs'

export default async function init (questions) {
  // const  // 接入hilo动画引擎
  const Assets = AssetsFectory()

  const assets = new Assets()
  await assets.load()

  // 初始化舞台
  const gameMain = StageFectory()

  const { stage, ticker } = gameMain

  const { bg, titleBg } = assets

  function shuffle (arr) {
    for (var i = arr.length - 1; i >= 0; i--) {
      var randomIndex = Math.floor(Math.random() * (i + 1));
      var itemAtIndex = arr[randomIndex];
      arr[randomIndex] = arr[i];
      arr[i] = itemAtIndex;
    }
    return arr
  }

  const shuffleQuestion = shuffle(questions.left.concat(questions.right))

  // 准备场景
  const exportScence = new ExportScence({
    x: 0,
    y: 0,
    questions: questions,
    images: { bg, titleBg },
    title: questions.title,
    ticker,
  })
  exportScence.timeStart = false
  stage.addChild(exportScence)

  const { searchButon, selectedBlock, selectedBlockError, selectedBlockRight, bgBlock, selectedBlockErrorLine } = assets

  // 插入题目 两个板块之间的距离 300 每个背景板的长度 499 106
  const panel = new Panel({
    x: 0,
    y: 0,
    questions: shuffleQuestion,
    stage,
    images: { selectedBlock, selectedBlockError, selectedBlockRight, bgBlock, selectedBlockErrorLine }
  })
  stage.addChild(panel)

  const answerPanel = new AnswerPanel({
    x: 150,
    y: 150,
    text: `0 / ${questions.left.length}`,
    questionsLength: questions.left.length,
    image: assets.answerPanelBg,
    questionsPanelCanvas: panel
  })
  stage.addChild(answerPanel)

  const subBtn = new SubmitButton({
    x: (1920 - 329) / 2,
    y: (1080 - 96) / 2 + 430,
    images: assets.submitButton,
    rect: [0, 0, 329, 96],
    visible: true,
  })

  stage.addChild(subBtn)

  const buttons = new Hilo.Container({
    x: 300,
    y: 980,
    width: 160,
    height: 50,
    visible: true,
    isSearch: false
  })

  new Hilo.Bitmap({
    visible: true,
    image: searchButon,
    rect: [0, 0, 160, 50]
  }).addTo(buttons)

  stage.addChild(buttons)


  return new Promise((re) => {
    ticker.nextTick(() => {
      setTimeout(() => {
        re(stage.canvas.toDataURL('image/png'))
      }, 900)
    })
  })
}
