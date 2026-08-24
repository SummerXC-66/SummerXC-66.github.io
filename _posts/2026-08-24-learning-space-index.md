---
layout: post
title: 学习空间笔记整理目录
date: 2026-08-24
category: 其他
tags: [整理, a_learning_space, 目录]
---

从 `my/a_learning_spacev1` 的 SQLite（`instance/blog.db`，以及备份库里多出来的一篇）和 `my/服务器搭建/` 抽出正文，按主题拆成独立笔记，方便之后推到本站。

用户表、哈希密码、测试评论、空计划 / 日记没有导出。

## 已整理

| 原标题 | 笔记 | 日期 |
|--------|------|------|
| Pytorch学习 | [PyTorch 学习资料整理](/notes/2023/09/22/pytorch-learning/) | 2023-09-22 |
| 用 gunicorn 和 Nginx 部署 Flask | [用 Gunicorn 和 Nginx 部署 Flask](/notes/2023/10/21/flask-gunicorn-nginx/) | 2023-10-21 |
| Cam开发 | [Cam 开发：音频读取与设备联网备忘](/notes/2023/10/21/cam-dev/) | 2023-10-21 |
| Ubuntu 常用命令 | 并入 Flask 部署文（`ufw deny`） | 2023-12-10 |
| Diffusion | [Diffusion 资料](/notes/2024/02/06/diffusion/) | 2024-02-06 |
| 一键自动化训练 Yolo | [一键自动化训练 YOLO 的流程大纲](/notes/2024/02/27/yolo-auto-train/) | 2024-02-27 |
| socket 通信问题 | [Socket 粘包与丢包](/notes/2024/04/14/socket-sticky-packet/) | 2024-04-14 |
| meinheld+gunicore+flask | [Meinheld + Gunicorn + Flask 备忘](/notes/2024/07/24/meinheld-gunicorn-flask/) | 2024-07-24 |
| 其他资源 | [文档与课程资源入口](/notes/2024/08/04/misc-resources/) | 2024-08-04 |
| VLA 仿真（备份库） | [VLA 仿真环境](/notes/2025/09/27/vla-simulation/) | 2025-09-27 |
| 服务器搭建 txt | [内网服务器搭建](/notes/2021/07/14/intranet-server-setup/) | 2021-07-14 |

主库 12 篇博客；备份库多 1 篇「VLA 仿真」（约 734KB，多半是嵌入图）。计划 / 日报表只有测试标题，没有可用正文。

## 未收入

| 原标题 | 原因 |
|--------|------|
| das / justtry / dsa / rrr | 测试稿 |
| Attack | 只有一张嵌入图，没有文字 |
| 嵌入的截图 | 体积大，正文里改成「已省略」 |
| Wi-Fi 密码、公网 IP | 已改成 `YOUR_*` / `SERVER_IP` |

## 发布

这些文件已在 `_posts/`，格式和本站其他笔记一样。确认内容后：

```bash
cd /home/summer/Desktop/summer/mygit
git add _posts/2021-07-14-intranet-server-setup.md \
        _posts/2023-09-22-pytorch-learning.md \
        _posts/2023-10-21-flask-gunicorn-nginx.md \
        _posts/2023-10-21-cam-dev.md \
        _posts/2024-02-06-diffusion.md \
        _posts/2024-02-27-yolo-auto-train.md \
        _posts/2024-04-14-socket-sticky-packet.md \
        _posts/2024-07-24-meinheld-gunicorn-flask.md \
        _posts/2024-08-04-misc-resources.md \
        _posts/2025-09-27-vla-simulation.md \
        _posts/2026-08-24-learning-space-index.md
git commit -m "整理学习空间笔记为独立 Markdown"
git push
```

需要的话我可以再帮你提交并推送。
