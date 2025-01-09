const fs = require('fs');
const path = require('path');

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

      // 找到所有的三级标题位置
      const titleMatches = Array.from(content.matchAll(/###\s+[^\n]+/g));
      if (!titleMatches.length) return;

      // 遍历每个标题（除了最后一个）
      for (let i = 0; i < titleMatches.length; i++) {
        const currentMatch = titleMatches[i];
        const nextMatch = titleMatches[i + 1];

        const title = currentMatch[0].replace(/^###\s+/, '').trim();

        // 获取当前标题到下一个标题之间的内容作为答案
        let answerEndIndex = nextMatch ? nextMatch.index : content.length;
        let questionContent = content.slice(currentMatch.index, answerEndIndex).trim();

        // 添加到索引
        index[category].push({
          id: `${category.toLowerCase()}-${file.replace('.md', '')}-${i + 1}`,
          title: title,
          path: `questions/${category.toLowerCase()}/${file}#${i + 1}`,
        });
      }
    });
  });

  // 写入index.json
  const indexPath = path.join(questionsPath, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log('索引生成完成！');
  console.log('发现的分类：', categories.join(', '));
}

generateIndex();
