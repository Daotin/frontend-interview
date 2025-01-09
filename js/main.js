document.addEventListener('DOMContentLoaded', () => {
  // 创建问题管理器实例
  const questionManager = new QuestionManager();

  // 初始化问题管理器
  questionManager.initialize();

  // 绑定按钮事件
  document.getElementById('toggle-answer').addEventListener('click', () => {
    questionManager.toggleAnswer();
  });

  document.getElementById('next-question').addEventListener('click', () => {
    questionManager.getRandomQuestion();
  });

  // 添加键盘快捷键
  document.addEventListener('keydown', (event) => {
    // 空格键显示/隐藏答案
    if (event.code === 'Space') {
      event.preventDefault();
      questionManager.toggleAnswer();
    }
    // 回车键下一题
    else if (event.code === 'Enter') {
      event.preventDefault();
      questionManager.getRandomQuestion();
    }
  });
});
