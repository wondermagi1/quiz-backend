<template>
  <div>
    <div style="margin-bottom:20px;">
      <span>题目</span>
      <el-input v-model="searchKey" clearable placeholder="题目关键词" style="width:200px;margin:0 10px;" @input="currentPage = 1"></el-input>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="success" @click="openCreateDialog">添加题目</el-button>
    </div>

    <el-table :data="pagedQuestions" style="width:100%" row-key="id" empty-text="没有找到符合条件的题目">
      <el-table-column prop="id" label="序号" width="82">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="题目" min-width="300">
        <template slot-scope="scope">
          <span>{{ scope.row.question }}</span>
        </template>
      </el-table-column>
      <el-table-column label="选项" min-width="360">
        <template slot-scope="scope">
          <span>{{ scope.row.options.join('，') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="答案" min-width="180">
        <template slot-scope="scope">
          <span>{{ answerText(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button type="danger" @click="removeQuestion(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:20px;">
      <span>显示 {{ pageStart }}–{{ pageEnd }} 条，共 {{ filteredQuestions.length }} 条</span>
      <el-pagination
        :current-page.sync="currentPage"
        :page-size="pageSize"
        :total="filteredQuestions.length"
        layout="prev, pager, next"
        background>
      </el-pagination>
    </div>

    <el-dialog :title="editingId === null ? '题目' : '编辑题目'" :visible.sync="dialogVisible" width="40%" @closed="resetForm">
      <el-form ref="questionForm" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="题目内容" prop="question">
          <el-input v-model="form.question" type="textarea" :rows="2" maxlength="120" show-word-limit placeholder="输入题目内容"></el-input>
        </el-form-item>
        <div>
          <el-form-item v-for="(option, index) in form.options" :key="index" :label="'选项' + String.fromCharCode(65 + index) + ':'" :prop="'options.' + index" :rules="optionRules">
            <el-input v-model="form.options[index]" :placeholder="'输入选项 ' + String.fromCharCode(65 + index)"></el-input>
          </el-form-item>
        </div>
        <div>
          <el-form-item label="题目分类" prop="category">
            <el-select v-model="form.category" filterable allow-create default-first-option placeholder="选择或输入分类" style="width: 100%">
              <el-option v-for="category in categories" :key="category" :label="category" :value="category"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="正确答案" prop="answer">
            <el-select v-model="form.answer" placeholder="选择正确选项" style="width: 100%">
              <el-option v-for="(option, index) in form.options" :key="index" :label="String.fromCharCode(65 + index) + ' · ' + (option || '未填写')" :value="String.fromCharCode(65 + index)"></el-option>
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="saving" @click="saveQuestion">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const seedQuestions = [
  ['中国的首都是哪座城市？', ['上海', '北京', '广州', '深圳'], 'B', '地理常识'],
  ['世界上面积最大的海洋是？', ['大西洋', '印度洋', '北冰洋', '太平洋'], 'D', '地理常识'],
  ['埃菲尔铁塔位于哪个国家？', ['意大利', '法国', '西班牙', '德国'], 'B', '地理常识'],
  ['日本的首都是哪座城市？', ['大阪', '京都', '东京', '横滨'], 'C', '地理常识'],
  ['世界上最长的河流通常被认为是？', ['尼罗河', '亚马孙河', '长江', '密西西比河'], 'A', '地理常识'],
  ['澳大利亚的首都是？', ['悉尼', '墨尔本', '堪培拉', '珀斯'], 'C', '地理常识'],
  ['赤道穿过以下哪个国家？', ['埃及', '巴西', '蒙古', '瑞典'], 'B', '地理常识'],
  ['珠穆朗玛峰位于中国与哪个国家的边界？', ['印度', '尼泊尔', '不丹', '巴基斯坦'], 'B', '地理常识'],
  ['地球上最大的大陆是？', ['非洲大陆', '北美洲', '亚欧大陆', '南美洲'], 'C', '地理常识'],
  ['长城主要修建于中国古代哪个时期？', ['秦朝', '唐朝', '宋朝', '清朝'], 'A', '历史文化'],
  ['《史记》的作者是？', ['司马光', '司马迁', '班固', '陈寿'], 'B', '历史文化'],
  ['中国历史上第一个统一的中央集权王朝是？', ['周朝', '秦朝', '汉朝', '唐朝'], 'B', '历史文化'],
  ['唐朝著名诗人李白被后人称为？', ['诗圣', '诗佛', '诗仙', '诗鬼'], 'C', '历史文化'],
  ['活字印刷术由谁发明？', ['蔡伦', '毕昇', '张衡', '沈括'], 'B', '历史文化'],
  ['“三顾茅庐”的故事与哪位历史人物有关？', ['曹操', '刘备', '孙权', '诸葛亮'], 'B', '历史文化'],
  ['“但愿人长久，千里共婵娟”出自哪位词人？', ['李清照', '辛弃疾', '苏轼', '柳永'], 'C', '历史文化'],
  ['《红楼梦》的作者通常认为是？', ['施耐庵', '吴承恩', '曹雪芹', '罗贯中'], 'C', '历史文化'],
  ['人体最大的器官是？', ['肝脏', '皮肤', '肺', '心脏'], 'B', '科学知识'],
  ['水的化学分子式是？', ['CO₂', 'O₂', 'H₂O', 'NaCl'], 'C', '科学知识'],
  ['光在真空中的传播速度约为每秒？', ['3万千米', '30万千米', '300万千米', '3000千米'], 'B', '科学知识'],
  ['地球围绕什么天体公转？', ['月球', '火星', '太阳', '木星'], 'C', '科学知识'],
  ['植物进行光合作用主要吸收哪种气体？', ['氧气', '氮气', '二氧化碳', '氢气'], 'C', '科学知识'],
  ['声音不能在哪种环境中传播？', ['空气', '水', '钢铁', '真空'], 'D', '科学知识'],
  ['人体正常体温通常约为多少摄氏度？', ['35℃', '37℃', '39℃', '40℃'], 'B', '科学知识'],
  ['太阳系中最大的行星是？', ['土星', '地球', '木星', '海王星'], 'C', '科学知识'],
  ['下列哪种动物属于哺乳动物？', ['鲨鱼', '青蛙', '海豚', '企鹅'], 'C', '科学知识'],
  ['二进制中，数字 10 表示十进制的多少？', ['1', '2', '10', '12'], 'B', '计算机基础'],
  ['HTML 主要用于描述网页的什么？', ['结构', '数据库', '网络协议', '操作系统'], 'A', '计算机基础'],
  ['CSS 的主要用途是？', ['管理服务器', '设置网页样式', '编写数据库', '传输文件'], 'B', '计算机基础'],
  ['HTTP 状态码 404 通常表示？', ['请求成功', '服务器错误', '资源未找到', '需要登录'], 'C', '计算机基础'],
  ['以下哪一个是 JavaScript 的基本数据类型？', ['Boolean', 'Element', 'Document', 'Browser'], 'A', '计算机基础'],
  ['CPU 的中文名称是？', ['随机存储器', '中央处理器', '图形处理器', '固态硬盘'], 'B', '计算机基础'],
  ['常见 IPv4 地址由多少位二进制数组成？', ['16 位', '32 位', '64 位', '128 位'], 'B', '计算机基础'],
  ['以下哪种方式通常适合为账号密码增加安全性？', ['重复使用同一密码', '使用简单数字密码', '启用双重验证', '将密码公开保存'], 'C', '生活常识'],
  ['发现电器插头或电线冒烟时，首先应当？', ['用手触摸检查', '立即断电并远离', '泼水处理', '继续使用'], 'B', '生活常识'],
  ['一周有多少小时？', ['24 小时', '120 小时', '168 小时', '240 小时'], 'C', '生活常识']
].map((item, index) => ({
  id: index + 1,
  question: item[0],
  options: item[1],
  answer: item[2],
  category: item[3]
}))

const storageKey = 'quiz-question-bank-v1'

function loadQuestions() {
  try {
    const saved = window.localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : seedQuestions
  } catch (error) {
    return seedQuestions
  }
}

export default {
  name: 'QuestionView',
  data() {
    return {
      searchKey: '',
      selectedCategory: '',
      currentPage: 1,
      pageSize: 8,
      dialogVisible: false,
      editingId: null,
      saving: false,
      questions: loadQuestions(),
      form: this.createEmptyForm(),
      formRules: {
        question: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
        category: [{ required: true, message: '请选择或输入题目分类', trigger: 'change' }],
        answer: [{ required: true, message: '请选择正确答案', trigger: 'change' }]
      },
      optionRules: [{ required: true, message: '请填写选项', trigger: 'blur' }]
    }
  },
  computed: {
    categories() {
      return Array.from(new Set(this.questions.map(question => question.category)))
    },
    filteredQuestions() {
      const keyword = this.searchKey.trim().toLocaleLowerCase()
      return this.questions.filter(question => {
        const matchesKeyword = !keyword || question.question.toLocaleLowerCase().includes(keyword) || question.category.toLocaleLowerCase().includes(keyword)
        return matchesKeyword && (!this.selectedCategory || question.category === this.selectedCategory)
      })
    },
    pagedQuestions() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredQuestions.slice(start, start + this.pageSize)
    },
    pageStart() {
      return this.filteredQuestions.length ? (this.currentPage - 1) * this.pageSize + 1 : 0
    },
    pageEnd() {
      return Math.min(this.currentPage * this.pageSize, this.filteredQuestions.length)
    }
  },
  watch: {
    questions: {
      deep: true,
      handler(questions) {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(questions))
        } catch (error) {
          this.$message.warning('浏览器存储空间不足，本次改动仅在当前页面有效')
        }
      }
    },
    filteredQuestions() {
      const lastPage = Math.max(1, Math.ceil(this.filteredQuestions.length / this.pageSize))
      if (this.currentPage > lastPage) this.currentPage = lastPage
    }
  },
  methods: {
    handleSearch() {
      this.currentPage = 1
    },
    answerText(question) {
      const answerIndex = question.answer.charCodeAt(0) - 65
      return question.options[answerIndex] || question.answer
    },
    createEmptyForm() {
      return { question: '', options: ['', '', '', ''], answer: '', category: '' }
    },
    openCreateDialog() {
      this.editingId = null
      this.form = this.createEmptyForm()
      this.dialogVisible = true
    },
    openEditDialog(question) {
      this.editingId = question.id
      this.form = {
        question: question.question,
        options: question.options.slice(),
        answer: question.answer,
        category: question.category
      }
      this.dialogVisible = true
    },
    saveQuestion() {
      this.$refs.questionForm.validate(valid => {
        if (!valid) return
        const duplicateOptions = new Set(this.form.options).size !== this.form.options.length
        if (duplicateOptions) {
          this.$message.warning('四个选项请填写不同内容')
          return
        }
        this.saving = true
        const savedQuestion = {
          question: this.form.question.trim(),
          options: this.form.options.map(option => option.trim()),
          answer: this.form.answer,
          category: this.form.category.trim()
        }
        if (this.editingId === null) {
          const id = Math.max(0, ...this.questions.map(question => question.id)) + 1
          this.questions.unshift({ id, ...savedQuestion })
          this.currentPage = 1
          this.$message.success('题目已添加')
        } else {
          const question = this.questions.find(item => item.id === this.editingId)
          Object.assign(question, savedQuestion)
          this.$message.success('题目已更新')
        }
        this.saving = false
        this.dialogVisible = false
      })
    },
    removeQuestion(question) {
      this.$confirm('删除后无法恢复，确定删除这道题目吗？', '删除题目', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.questions = this.questions.filter(item => item.id !== question.id)
        this.$message.success('题目已删除')
      }).catch(() => {})
    },
    resetForm() {
      if (this.$refs.questionForm) this.$refs.questionForm.clearValidate()
      this.editingId = null
      this.form = this.createEmptyForm()
    }
  }
}
</script>

