---
layout: post
title: Git 基础命令速查
date: 2026-07-10
category: 工具
tags: [工具]
---

整理常用的 Git 命令，方便日常查阅。

## 仓库初始化

```bash
git init
git clone https://github.com/user/repo.git
```

## 日常操作

| 命令 | 说明 |
|------|------|
| `git status` | 查看工作区状态 |
| `git add .` | 暂存所有修改 |
| `git commit -m "msg"` | 提交 |
| `git push` | 推送到远程 |
| `git pull` | 拉取远程更新 |

## 分支管理

```bash
git branch feature-x      # 创建分支
git checkout feature-x    # 切换分支
git merge feature-x       # 合并分支
```

## 撤销操作

- `git checkout -- file` — 撤销工作区修改
- `git reset HEAD file` — 取消暂存
- `git log --oneline` — 查看提交历史

## 心得

Git 是版本控制的基石，多练习 `status`、`log`、`diff` 这几个命令，遇到问题先查状态再操作。
