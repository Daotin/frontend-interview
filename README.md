# 前端面试题库

一个简单的前端面试题库网站，支持分类查看和随机抽题，搜索和收藏功能。

## 特性

- 支持多个分类的题目展示
- 随机抽取当前分类的题目
- 显示/隐藏答案
- 移动端适配
- 题目搜索功能（支持模糊匹配）
- 题目收藏功能（本地存储）
- 键盘快捷键支持
  - 空格：显示/隐藏答案
  - 回车：下一题
- 收藏题目功能（本地存储）
  - 点击题目右上角的心形图标收藏/取消收藏
  - 点击"查看收藏"按钮查看收藏的题目
  - 点击收藏列表中的题目可显示/隐藏答案
  - 支持删除收藏的题目

## 本地开发

1. 克隆仓库

```bash
git clone https://github.com/Daotin/frontend-interview.git
```

2. 使用任意 HTTP 服务器运行，例如：

```bash
# Python 3
python -m http.server 3000
```

3. 访问 `http://localhost:3000`

## 添加新题目

1. 在 `questions` 目录下对应分类中创建或编辑 `.md` 文件
2. 使用三级标题（###）标记题目
3. 运行 `node scripts/generate-index.js` 更新索引

## 题目格式示例

```markdown
### 1. 这是题目标题

题目描述和内容...

### 2. 另一个题目

题目描述和内容...
```

## 在线访问

访问 https://daotin.github.io/frontend-interview
