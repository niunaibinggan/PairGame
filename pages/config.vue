<template>
  <div class="root">
    <h3 class="root__title-set">
      <input type="text"
             v-model="questions.title"
             placeholder="请输入标题">
    </h3>

    <ul class="root__warpper">
      <li class="root__item"
          v-for="(item, index) in questions.left"
          :key="item.id">
        <span class="root__delete"
              v-if="questions.left.length > 3"
              @click="deleteIem(index)">+</span>

        <span class="root__item-common"
              :class="{'root__item-selected' : (selectedType==='left' && current === index)}"
              :ref="`left${index}`"
              @click="selectItem('left', index)">
          <span class="root__delete-inner"
                v-if="selectedType==='left' && current === index"
                @click="deleteContent('left', index)">+</span>
          <input v-if="item.type!== 'image'"
                 type="text"
                 placeholder="请输入内容"
                 class="root__item-input"
                 v-model="item.text"
                 @focus="focusInput('left',index,item.text)"
                 @blur="blurInput('left',index, item.text)">

          <span class="root__item-upload"
                v-if="!item.isFocus && item.type!== 'text'">
            {{item.text ? "替换图片": '使用图片'}}
            <Upload @upload="upload"
                    class="root__upload-set"
                    type="left"
                    :current="index"></Upload>
          </span>

          <el-image v-if="item.type=== 'image' && item.text"
                    class="root__upload-image"
                    :src="item.text"
                    fit="contain"></el-image>
        </span>

        <span class="root__item-common"
              :class="{'root__item-selected' : (selectedType==='right' && current === index)}"
              :ref="`right${index}`"
              @click="selectItem('right', index)">
          <span class="root__delete-inner"
                v-if="selectedType==='right' && current === index"
                @click="deleteContent('right', index)">+</span>
          <input v-if="questions.right[index].type!== 'image'"
                 type="text"
                 placeholder="请输入内容"
                 class="root__item-input"
                 v-model="questions.right[index].text"
                 @focus="focusInput('right',index,item.text)"
                 @blur="blurInput('right',index, item.text)">

          <span class="root__item-upload"
                v-if="!questions.right[index].isFocus && questions.right[index].type!== 'text'">
            {{questions.right[index].text ? "替换图片": '使用图片'}}
            <Upload @upload="upload"
                    class="root__upload-set"
                    type="right"
                    :current="index"></Upload>
          </span>

          <el-image v-if="questions.right[index].type=== 'image' && questions.right[index].text"
                    class="root__upload-image"
                    :src="questions.right[index].text"
                    fit="contain"></el-image>
        </span>
      </li>
    </ul>

    <div class="root__bottom">
      <div class="root__bottom-contnet">

        <span class="root__add"
              @click="addQuestion">
          添加卡片({{questions.left.length }}/{{target}})
        </span>

        <span class="root__submit"
              @click="submitConfig">完成</span>
        <span class="root__default"
              @click="defalutConfig">导入范例</span>
      </div>
    </div>
  </div>
</template>

<script>
  import save from '~/components/game/save'
  import Upload from "~/components/Upload"
  export default {
    components: { Upload },
    data () {
      return {
        questions: {
          left: [
            { id: 0, text: '', type: '', isFocus: false },
            { id: 1, text: '', type: '', isFocus: false },
            { id: 2, text: '', type: '', isFocus: false },
          ],
          right: [
            { id: 0, text: '', type: '', isFocus: false },
            { id: 1, text: '', type: '', isFocus: false },
            { id: 2, text: '', type: '', isFocus: false },
          ],
          title: ''
        },
        target: 12,
        current: -1,
        selectedType: '',
        isFocus: false
      }
    },
    methods: {
      selectItem (type, index) {
        this.current = index
        this.selectedType = type
      },
      upload (data) {
        this.questions[data.type][data.current].type = "image"
        this.questions[data.type][data.current].text = data.content
      },
      deleteIem (index) {
        this.questions.left.splice(index, 1)
        this.questions.right.splice(index, 1)
        this.current = -1
      },
      deleteContent (type, index) {
        this.questions[type][index].text = ''
        setTimeout(() => {
          this.questions[type][index].type = ''
        }, 300);
        this.selectedType = ''
      },
      focusInput (type, index, content) {
        this.questions[type][index].isFocus = true
        this.questions[type][index].type = 'text'
      },
      blurInput (type, index, content) {
        this.questions[type][index].isFocus = false
        this.questions[type][index].type = content ? 'text' : ''
      },
      addQuestion () {
        if (this.questions.left.length >= this.target) {
          this.$message({
            message: `最多添加${this.target}道题目`,
            type: 'warning'
          })
          return
        }
        let createId = this.questions.left[this.questions.left.length - 1].id + 1
        this.questions.left.push({ id: createId, text: '' })
        this.questions.right.push({ id: createId, text: '' })

      },
      async submitConfig () {
        const leftVerify = this.questions.left.every(item => item.text)
        if (!leftVerify) {
          this.$message({
            message: '题目不能为空！',
            type: 'warning'
          })
          return
        }

        const rightVerify = this.questions.right.every(item => item.text)

        if (!rightVerify) {
          this.$message({
            message: `答案不能为空！`,
            type: 'warning'
          })
          return
        }

        if (!this.questions.title) {
          this.$message({
            message: `请填写标题！`,
            type: 'warning'
          })
          return
        }

        const leftEqualArr = this.questions.left.map(item => item.text.replace(/\s+/g, ""))
        const leftFilter = Array.from(new Set(leftEqualArr))

        const rightEqualArr = this.questions.right.map(item => item.text.replace(/\s+/g, ""))
        const rightFilter = Array.from(new Set(rightEqualArr))

        if ((leftEqualArr.length !== leftFilter.length) || (rightEqualArr.length !== rightFilter.length)) {
          this.$message({
            message: `同侧内容不能重复`,
            type: 'warning'
          })
          return
        }

        let setQuestion = this.questions
        try {
          const thumbnail = await save(setQuestion)
          await this.$testsave(thumbnail, JSON.stringify(setQuestion))
        } catch (error) {
          localStorage.setItem('questionsConfig', JSON.stringify(setQuestion))
        }
        this.$router.replace('/')

      },
      defalutConfig () {
        this.questions = {
          left: [
            { id: 0, text: '苹果', type: 'text', isFocus: false },
            { id: 1, text: '1+20', type: 'text', isFocus: false },
            { id: 2, text: '30+14', type: 'text', isFocus: false },
          ],
          right: [
            { id: 0, text: 'apple', type: 'text', isFocus: false },
            { id: 1, text: '21', type: 'text', isFocus: false },
            { id: 2, text: '44', type: 'text', isFocus: false },
          ],
          title: '请将相对应的连接起来'
        }
      },
    }
  }
</script>
<style>
  .root {
    min-width: 720px;
    margin: 0 auto;
    padding: 0 30px;
    font-family: "Microsoft Yahei";
  }

  .root__title-set {
    font-size: 16px;
    color: #5f5c5c;
    margin: 3% 0 2%;
    text-align: center;
    width: 100%;
  }

  .root__title-set input {
    color: #152c2c;
    border: none;
    border: 1px solid #cccccc;
    margin-left: 5px;
    padding: 10px 0 10px 10px;
    width: 30%;
    font-size: 16px;
  }

  .root__warpper {
    min-width: 400px;
    margin: 0 auto;
    padding: 10px;
    height: 480px;
    overflow: scroll;
  }

  .root__item {
    width: 320px;
    border: 1px solid #ccc;
    border-radius: 4px;
    float: left;
    margin-right: 10px;
    padding: 13px;
    margin-bottom: 10px;
    position: relative;
  }

  .root__item:hover {
    border: 1px solid #0ff;
    cursor: pointer;
  }

  .root__item-common {
    width: 140px;
    height: 110px;
    border: 1px solid #ccc;
    border-radius: 4px;
    float: left;
    margin-right: 12px;
    position: relative;
  }

  .root__item-upload {
    position: absolute;
    right: 5px;
    top: 5px;
    padding: 4px 8px;
    background: #ccc;
    color: #fff;
    border-radius: 100px;
    cursor: pointer;
    font-size: 12px;
    overflow: hidden;
    z-index: 4;
  }
  .root__upload-set {
    width: 80px;
    height: 30px;
    position: absolute !important;
    right: 0;
    top: 0;
  }
  .root__upload-set label {
    cursor: pointer;
  }

  .root__item-common:nth-last-of-type(1) {
    margin-right: 0;
  }

  .root__item-input {
    width: 138px;
    padding: 5px;
    text-align: center;
    margin-top: 38px;
    border: none;
    font-size: 14px;
  }
  .root__delete {
    display: none;
    position: absolute;
    right: -10px;
    top: -10px;
    width: 20px;
    height: 20px;
    border-radius: 100px;
    background: #fff;
    border: 1px solid #ccc;
    text-align: center;
    line-height: 16px;
    transform: rotate(45deg);
  }

  .root__delete-inner {
    position: absolute;
    right: -10px;
    top: -10px;
    width: 20px;
    height: 20px;
    border-radius: 100px;
    background: #fff;
    border: 1px solid #ccc;
    text-align: center;
    line-height: 16px;
    transform: rotate(45deg);
  }

  .root__item:hover .root__delete {
    display: block;
  }

  .root__item-selected {
    border: 1px solid #0ff;
  }

  .root__upload-image {
    width: 137px;
    height: 108px;
  }

  .root__bottom {
    position: fixed;
    width: 100%;
    height: 40px;
    min-width: 450px;
    bottom: 10px;
    left: 0;
    text-align: center;
  }
  .root__bottom-contnet {
    max-width: 1000px;
    margin: 0 auto;
  }

  .root__add {
    display: inline-block;
    padding: 8px 20px;
    background: #ffb647;
    font-size: 12px;
    border-radius: 110px;
    color: #fff;
    cursor: pointer;
  }
  .root__add:hover {
    background: #ffa721;
  }

  .root__default {
    float: right;
    padding: 8px 20px;
    background: #cccccc;
    font-size: 12px;
    border-radius: 4px;
    color: #5f6c65;
    cursor: pointer;
    margin-right: 20px;
  }
  .root__submit {
    float: right;
    padding: 8px 20px;
    background: #0ed04b;
    font-size: 12px;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
  }
</style>