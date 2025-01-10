const fs = require('fs');
const path = require('path');

function isThirdLevelTitle(line) {
  // 确保是精确的三级标题（前面只能有空格，必须是三个#）
  const trimmed = line.trimStart();
  return trimmed.startsWith('### ') && !trimmed.startsWith('#### ');
}

function generateIndex() {
  const questionsPath = path.join(__dirname, '..', 'questions');
  const index = {};

  // 获取questions目录下的所有子目录作为分类
  const categories = fs
    .readdirSync(questionsPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => {
      // 首字母大写
      const name = dirent.name;
      return name.charAt(0).toUpperCase() + name.slice(1);
    });

  // 为每个分类初始化空数组
  categories.forEach((category) => {
    index[category] = [];
  });

  // 遍历每个分类目录
  categories.forEach((category) => {
    const categoryPath = path.join(questionsPath, category.toLowerCase());

    // 读取目录中的所有.md文件
    const files = fs.readdirSync(categoryPath).filter((file) => file.endsWith('.md'));

    // 处理每个文件
    files.forEach((file) => {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // 将内容按行分割
      const lines = content.split('\n');
      const questions = [];
      let currentQuestionIndex = -1;

      // 遍历每一行
      lines.forEach((line, index) => {
        if (isThirdLevelTitle(line)) {
          currentQuestionIndex++;
          questions.push({
            title: line.trim().substring(4).trim(),
            index: currentQuestionIndex + 1,
          });
        }
      });

      // 添加到索引
      questions.forEach((question) => {
        index[category].push({
          id: `${category.toLowerCase()}-${file.replace('.md', '')}-${question.index}`,
          title: question.title,
          path: `questions/${category.toLowerCase()}/${file}#${question.index}`,
        });
      });
    });
  });

  // 写入index.json
  const indexPath = path.join(questionsPath, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log('索引生成完成！');
  console.log('发现的分类：', categories.join(', '));
}

generateIndex();
