class QuestionManager {
  constructor() {
    this.categories = [];
    this.currentCategory = null;
    this.questions = null;
    this.currentQuestion = null;
  }

  async initialize() {
    try {
      // 加载总的题目索引
      const response = await fetch('questions/index.json');
      this.questions = await response.json();

      // 从索引中获取分类
      this.categories = Object.keys(this.questions);

      // 初始化分类按钮
      this.initializeCategoryButtons();

      // 初始化题目点击事件
      this.initializeQuestionCardClick();

      // 加载第一个分类的题目
      if (this.categories.length > 0) {
        await this.setCategory(this.categories[0]);
      }
    } catch (error) {
      console.error('初始化失败:', error);
    }
  }

  initializeCategoryButtons() {
    const nav = document.getElementById('category-nav');
    nav.innerHTML = '';

    this.categories.forEach((category) => {
      const button = document.createElement('button');
      button.textContent = category;
      button.addEventListener('click', () => this.setCategory(category));
      nav.appendChild(button);
    });
  }

  async setCategory(category) {
    // 更新按钮状态
    const buttons = document.querySelectorAll('#category-nav button');
    buttons.forEach((button) => {
      button.classList.toggle('active', button.textContent === category);
    });

    this.currentCategory = category;

    // 随机选择一道题目
    await this.getRandomQuestion();
  }

  async getRandomQuestion() {
    if (!this.currentCategory || !this.questions[this.currentCategory]) {
      return null;
    }

    const categoryQuestions = this.questions[this.currentCategory];
    if (categoryQuestions.length === 0) {
      const questionContent = document.getElementById('question-content');
      questionContent.innerHTML = `<p>该分类暂无题目</p>`;
      return null;
    }

    const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
    const question = categoryQuestions[randomIndex];

    try {
      // 解析路径和题目序号
      const [filePath, questionNumber] = question.path.split('#');

      // 加载题目内容
      const response = await fetch(filePath);
      const markdown = await response.text();

      // 解析markdown内容
      const parts = this.parseMarkdown(markdown, parseInt(questionNumber));

      // 更新当前题目
      this.currentQuestion = {
        ...question,
        ...parts,
      };

      // 更新页面显示
      this.updateQuestionDisplay();

      return this.currentQuestion;
    } catch (error) {
      console.error('加载题目失败:', error);
      return null;
    }
  }

  parseMarkdown(markdown, questionNumber) {
    // 找到所有的三级标题
    const titleMatches = Array.from(markdown.matchAll(/###\s+[^\n]+/g));
    if (!titleMatches.length || questionNumber > titleMatches.length) {
      return { content: '', answer: '' };
    }

    // 获取指定的题目
    const currentMatch = titleMatches[questionNumber - 1];
    const nextMatch = titleMatches[questionNumber];

    // 获取标题
    const title = currentMatch[0];

    // 获取答案（从当前标题后到下一个标题前，或文件末尾）
    const answerStartIndex = currentMatch.index + currentMatch[0].length;
    const answerEndIndex = nextMatch ? nextMatch.index : markdown.length;
    const answer = markdown.slice(answerStartIndex, answerEndIndex).trim();

    return {
      content: marked.parse(title),
      answer: marked.parse(answer),
    };
  }

  updateQuestionDisplay() {
    if (!this.currentQuestion) return;

    const questionContent = document.getElementById('question-content');
    const answerContent = document.getElementById('answer-content');
    const answerSection = document.getElementById('answer-section');

    questionContent.innerHTML = this.currentQuestion.content;
    answerContent.innerHTML = this.currentQuestion.answer;
    answerSection.classList.add('hidden');
  }

  toggleAnswer() {
    const answerSection = document.getElementById('answer-section');
    answerSection.classList.toggle('hidden');
  }

  initializeQuestionCardClick() {
    const questionCard = document.getElementById('question-card');
    questionCard.addEventListener('click', (event) => {
      // 如果点击的是答案区域，不触发切换
      if (!event.target.closest('#answer-section')) {
        this.toggleAnswer();
      }
    });
  }
}
