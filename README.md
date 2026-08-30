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

## PPO 马里奥：model 结构与定义

笔记：[PPO 算法](_posts/2026-08-29-ppo.md)。网络定义来自 [Super-mario-bros-PPO-pytorch](https://github.com/vietnh1009/Super-mario-bros-PPO-pytorch) 的 `src/model.py`。

**作用：** 这是 Actor-Critic，看马里奥画面，同时做两件事——决定按哪个键（策略），以及估计这屏值多少分（价值）。采集时用它进关；更新时用新旧输出算概率比、GAE 和损失。没有这个网络，PPO 没有策略可改，也没有基线可减。

| 部分 | 作用 |
|------|------|
| 四层 CNN + Linear 512 | 从 4 帧画面抽出「马里奥在哪、前面有没有坑/怪」 |
| actor 头 | 输出各按键 logits → softmax 成 π(a\|s)，采样、算 log-prob 和 clip 比值 |
| critic 头 | 输出标量 V(s)，给 GAE 打优势、给价值损失当预测 |
| 共享骨干 | 两个头看同一套视觉特征，省参数，策略和价值对画面的理解一致 |

输入是叠好的 4 帧灰度图，形状 `(B, 4, 84, 84)`。四层 CNN 抽特征后分成两个头。

```
(B, 4, 84, 84)
    → Conv 4×32, stride 2, ReLU
    → flatten → Linear 512
    ├─ actor_linear  → (B, num_actions)   # 默认 SIMPLE_MOVEMENT，约 7 个键
    └─ critic_linear → (B, 1)
```

```python
import torch.nn as nn
import torch.nn.functional as F


class PPO(nn.Module):
    def __init__(self, num_inputs, num_actions):
        super(PPO, self).__init__()
        self.conv1 = nn.Conv2d(num_inputs, 32, 3, stride=2, padding=1)
        self.conv2 = nn.Conv2d(32, 32, 3, stride=2, padding=1)
        self.conv3 = nn.Conv2d(32, 32, 3, stride=2, padding=1)
        self.conv4 = nn.Conv2d(32, 32, 3, stride=2, padding=1)
        self.linear = nn.Linear(32 * 6 * 6, 512)
        self.critic_linear = nn.Linear(512, 1)
        self.actor_linear = nn.Linear(512, num_actions)
        self._initialize_weights()

    def _initialize_weights(self):
        for module in self.modules():
            if isinstance(module, nn.Conv2d) or isinstance(module, nn.Linear):
                nn.init.orthogonal_(module.weight, nn.init.calculate_gain("relu"))
                nn.init.constant_(module.bias, 0)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = F.relu(self.conv3(x))
        x = F.relu(self.conv4(x))
        x = self.linear(x.view(x.size(0), -1))
        return self.actor_linear(x), self.critic_linear(x)
```

`forward` 返回 `(logits, value)`。训练时用 `Categorical(logits=logits)` 采样按键，并算 `log_prob`；`value` 给 GAE 和价值损失用。卷积核 3、stride 2、padding 1，84×84 四次下采样后是 6×6，所以全连接入口是 `32 * 6 * 6`。
