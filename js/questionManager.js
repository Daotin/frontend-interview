class QuestionManager {
  constructor() {
    this.categories = [];
    this.currentCategory = null;
    this.questions = null;
    this.currentQuestion = null;
    this.searchTimeout = null;
    this.favorites = this.loadFavorites();
  }

  // 加载收藏的题目
  loadFavorites() {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
  }

  // 保存收藏的题目
  saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  // 检查题目是否已收藏
  isFavorite(questionId) {
    return this.favorites.some((fav) => fav.id === questionId);
  }

  // 切换收藏状态
  toggleFavorite() {
    if (!this.currentQuestion) return;

    const favoriteBtn = document.getElementById('toggle-favorite');
    const isFavorited = this.isFavorite(this.currentQuestion.id);

    if (isFavorited) {
      this.favorites = this.favorites.filter((fav) => fav.id !== this.currentQuestion.id);
      favoriteBtn.textContent = '♡';
    } else {
      this.favorites.push({
        id: this.currentQuestion.id,
        category: this.currentCategory,
        title: this.currentQuestion.title,
        content: this.currentQuestion.content,
        answer: this.currentQuestion.answer,
        path: this.currentQuestion.path,
      });
      favoriteBtn.textContent = '♥';
    }

    favoriteBtn.classList.toggle('active', !isFavorited);
    this.saveFavorites();
  }

  // 显示收藏列表
  showFavorites() {
    const modal = document.getElementById('favorites-modal');
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = '';

    this.favorites.forEach((fav) => {
      const item = document.createElement('div');
      item.className = 'favorite-item';
      item.innerHTML = `
        <div class="favorite-item-header">
          <div class="title-section">
            <span class="category-tag">${fav.category}</span>
            ${fav.content}
          </div>
          <div class="actions">
            <button class="action-btn remove-favorite" data-id="${fav.id}" title="删除">✕</button>
          </div>
        </div>
        <div class="answer">${marked.parse(fav.answer)}</div>
      `;
      favoritesList.appendChild(item);

      // 点击题目切换答案显示状态
      item.addEventListener('click', (e) => {
        // 如果点击的是删除按钮，不切换答案显示状态
        if (!e.target.closest('.action-btn')) {
          const answer = item.querySelector('.answer');
          answer.classList.toggle('show');
        }
      });
    });

    modal.classList.remove('hidden');

    // 绑定删除按钮事件
    const removeButtons = modal.querySelectorAll('.remove-favorite');
    removeButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        const id = e.target.dataset.id;
        this.favorites = this.favorites.filter((fav) => fav.id !== id);
        this.saveFavorites();
        e.target.closest('.favorite-item').remove();

        // 如果当前显示的是这个题目，更新收藏按钮状态
        if (this.currentQuestion && this.currentQuestion.id === id) {
          const favoriteBtn = document.getElementById('toggle-favorite');
          favoriteBtn.classList.remove('active');
          favoriteBtn.textContent = '♡';
        }
      });
    });
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

      // 初始化搜索功能
      this.initializeSearch();

      // 初始化收藏功能
      this.initializeFavorites();

      // 加载第一个分类的题目
      if (this.categories.length > 0) {
        await this.setCategory(this.categories[0]);
      }
    } catch (error) {
      console.error('初始化失败:', error);
    }
  }

  // 初始化收藏功能
  initializeFavorites() {
    // 收藏按钮点击事件
    const favoriteBtn = document.getElementById('toggle-favorite');
    favoriteBtn.addEventListener('click', () => this.toggleFavorite());

    // 查看收藏列表按钮点击事件
    const showFavoritesBtn = document.getElementById('show-favorites');
    showFavoritesBtn.addEventListener('click', () => this.showFavorites());

    // 关闭收藏列表弹窗
    const closeModalBtn = document.querySelector('.close-modal');
    const modal = document.getElementById('favorites-modal');
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

    // 点击弹窗外部关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
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
    // 找到所有的三级标题位置
    const titleMatches = Array.from(markdown.matchAll(/^###\s+[^\n]+/gm));
    if (!titleMatches.length || questionNumber > titleMatches.length) {
      return { content: '', answer: '' };
    }

    // console.log(titleMatches);

    // 获取当前题目的三级标题
    const currentMatch = titleMatches[questionNumber - 1];
    const nextMatch = titleMatches[questionNumber];

    // 获取标题
    const title = currentMatch[0];

    // 计算答案的起始位置（标题后面）
    const contentStartIndex = currentMatch.index + currentMatch[0].length;

    // 如果有下一个三级标题，则截取到那里；否则截取到文件末尾
    const contentEndIndex = nextMatch ? nextMatch.index : markdown.length;

    // 获取这一部分的所有内容
    const answer = markdown.slice(contentStartIndex, contentEndIndex).trim();

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
    const favoriteBtn = document.getElementById('toggle-favorite');

    // 添加分类标签到题目内容
    const categoryTag = `<span class="category-tag">${this.currentCategory}</span>`;
    questionContent.innerHTML = categoryTag + this.currentQuestion.content;
    answerContent.innerHTML = this.currentQuestion.answer || '暂无答案';
    answerSection.classList.add('hidden');

    // 更新收藏按钮状态
    const isFavorited = this.isFavorite(this.currentQuestion.id);
    favoriteBtn.classList.toggle('active', isFavorited);
    favoriteBtn.textContent = isFavorited ? '♥' : '♡';
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

  initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', () => {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        const query = searchInput.value.trim().toLowerCase();
        if (query.length >= 2) {
          this.performSearch(query);
        } else {
          searchResults.classList.add('hidden');
        }
      }, 300);
    });

    // 点击其他地方时隐藏搜索结果
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.search-box')) {
        searchResults.classList.add('hidden');
      }
    });
  }

  performSearch(query) {
    const searchResults = document.getElementById('search-results');
    const results = [];

    // 在所有分类中搜索
    for (const category in this.questions) {
      const questions = this.questions[category];
      const matchedQuestions = questions.filter((q) => q.title.toLowerCase().includes(query));

      matchedQuestions.forEach((q) => {
        results.push({
          ...q,
          category,
        });
      });
    }

    // 显示搜索结果
    searchResults.innerHTML = '';
    if (results.length > 0) {
      results.forEach((result) => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.innerHTML = `
          <span class="category-tag">${result.category}</span>
          ${result.title}
        `;
        div.addEventListener('click', () => this.loadQuestionFromSearch(result));
        searchResults.appendChild(div);
      });
      searchResults.classList.remove('hidden');
    } else {
      searchResults.innerHTML = '<div class="search-result-item">未找到相关题目</div>';
      searchResults.classList.remove('hidden');
    }
  }

  async loadQuestionFromSearch(question) {
    // 更新分类
    await this.setCategory(question.category);

    // 加载具体题目
    try {
      const [filePath, questionNumber] = question.path.split('#');
      const response = await fetch(filePath);
      const markdown = await response.text();

      const parts = this.parseMarkdown(markdown, parseInt(questionNumber));

      this.currentQuestion = {
        ...question,
        ...parts,
      };

      this.updateQuestionDisplay();

      // 隐藏搜索结果
      document.getElementById('search-results').classList.add('hidden');
      document.getElementById('search-input').value = '';
    } catch (error) {
      console.error('加载题目失败:', error);
    }
  }
}
