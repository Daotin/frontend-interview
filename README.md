# 前端面试题库

一个简单的前端面试题库网站，支持分类查看和随机抽题。

## 特性

- 支持多个分类的题目展示
- 随机抽取当前分类的题目
- 显示/隐藏答案
- 移动端适配
- 键盘快捷键支持（空格显示/隐藏答案，回车下一题）

## 本地开发

1. 克隆仓库

```bash
git clone https://github.com/你的用户名/frontend-interview.git
```

2. 使用任意 HTTP 服务器运行，例如：

```bash
# Python 3
python -m http.server 3000
```

3. 访问 `http://localhost:3000`

## 添加新题目

1. 在 `questions` 目录下对应分类中创建 `.md` 文件
2. 使用三级标题（###）标记题目
3. 运行 `node scripts/generate-index.js` 更新索引

## 在线访问

访问 https://你的用户名.github.io/frontend-interview