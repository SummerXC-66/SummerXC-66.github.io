# 我的学习记录

个人学习笔记站点，基于 GitHub Pages + Jekyll 构建，用于保存和浏览学习记录。

## 功能

- 卡片式笔记列表，支持搜索和分类筛选
- 深色 / 浅色主题切换
- Markdown 编写笔记，自动渲染
- 响应式设计，手机端也能舒适阅读

## 快速开始

### 1. 部署到 GitHub Pages

```bash
# 初始化 git 仓库
git init
git add .
git commit -m "初始化学习记录站点"

# 在 GitHub 创建仓库后（推荐命名为 你的用户名.github.io）
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
git branch -M main
git push -u origin main
```

然后在 GitHub 仓库 **Settings → Pages** 中：
- Source: **Deploy from a branch**
- Branch: **main** / **/ (root)**

几分钟后访问 `https://你的用户名.github.io`

### 2. 添加新笔记

在 `_posts/` 目录创建文件，命名格式 `YYYY-MM-DD-标题.md`：

```markdown
---
layout: post
title: 笔记标题
date: 2026-07-11
category: 编程
tags: [Python, 基础]
---

正文内容...
```

推送后 GitHub Pages 会自动重新构建发布。

### 3. 本地预览（可选）

```bash
bundle install
bundle exec jekyll serve
# 访问 http://localhost:4000
```

## 目录结构

```
├── _config.yml        # 站点配置
├── _layouts/          # 页面模板
├── _posts/            # 学习笔记（Markdown）
├── assets/            # CSS、JS 静态资源
├── index.html         # 首页
├── notes.html         # 全部笔记
└── about.html         # 关于页面
```

## 自定义

- 修改 `_config.yml` 中的 `title`、`description`、`categories`
- 编辑 `assets/css/style.css` 调整样式
- 在 `_config.yml` 的 `navigation` 中添加导航项
