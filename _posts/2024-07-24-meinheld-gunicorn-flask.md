---
layout: post
title: Meinheld + Gunicorn + Flask 备忘
date: 2024-07-24
category: 编程
tags: [Flask, Gunicorn, Meinheld, Cython, Annoy]
---

整理自学习空间「meinheld+gunicore+flask」。基础部署见 [用 Gunicorn 和 Nginx 部署 Flask](/notes/2023/10/21/flask-gunicorn-nginx/)。

## 踩坑

Python 3.9 之后 `collections.Iterable` 被移到 `collections.abc`。老包（含部分 Meinheld / 依赖）会因此报错。

安装 pydensecrf 时要用较新的 Cython（例如 `Cython>=0.22`）：

```bash
sudo pip install cython
sudo pip install pydensecrf
```

Meinheld 要求：

- Python 2.6+ 或 Python 3.5+
- `greenlet >= 0.4.5`

## 参考

- [Flask + Gunicorn（协程）高并发](https://www.cnblogs.com/lixueren-wy/articles/16914830.html)

## 顺手记下的 Annoy

近似最近邻库 Annoy，当时和向量检索一起看：

- [Python Annoy（51CTO）](https://blog.51cto.com/u_16213301/10325442)
- [ANNOY 算法介绍（知乎）](https://zhuanlan.zhihu.com/p/454511736)
