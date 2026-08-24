---
layout: post
title: Python 服务部署：Flask、Gunicorn、Nginx、Meinheld
date: 2026-08-24
category: 部署
tags: [Python, Flask, Gunicorn, Nginx, Meinheld, 部署]
---

Ubuntu 上把 Flask 应用接到公网：Gunicorn 跑 WSGI，Nginx 做反代；高并发可换 Meinheld 协程 worker。环境曾是 Ubuntu 22.04 + Python 3.10。

## 一、安装

```bash
sudo pip3 install gunicorn
sudo apt install nginx
```

## 二、Nginx 反代

主配置 `/etc/nginx/nginx.conf`，站点写在 `/etc/nginx/conf.d/default.conf`：

```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;  # 域名或公网 IP
    location / {
        proxy_pass http://127.0.0.1:6666;  # 指向 Gunicorn
    }
}
```

`proxy_pass` 用本机回环地址即可，不要写成 `0.0.0.0`。

```bash
sudo systemctl start nginx
sudo systemctl restart nginx
sudo systemctl stop nginx
```

## 三、Gunicorn

`-w` 是 worker 数，`-b` 是监听地址，入口是 `模块:app`：

```bash
nohup gunicorn -w 2 -b 0.0.0.0:6666 manage:app > app.log 2>&1 &
```

| 部分 | 说明 |
|------|------|
| `nohup` … `&` | 退出终端后继续跑 |
| `-w 2` | 2 个 worker |
| `-b 0.0.0.0:6666` | 对外监听 6666 |
| `manage:app` | Flask 应用对象 |

关掉对应端口：`sudo ufw deny 8888`（按实际端口改）。

## 四、Meinheld（协程 worker）

Meinheld 要求 Python 2.6+ / 3.5+，以及 `greenlet >= 0.4.5`。

Python 3.9 之后 `collections.Iterable` 挪到 `collections.abc`，老版本 Meinheld 或其依赖会 ImportError，升级包或自行改导入即可。

参考：[Flask + Gunicorn（协程）高并发](https://www.cnblogs.com/lixueren-wy/articles/16914830.html)

## 五、普通 Python 脚本后台跑

不经过 Gunicorn 时：

```bash
nohup python3 -u app.py > app.log 2>&1 &
```

| 部分 | 说明 |
|------|------|
| `-u` | 关闭输出缓冲，日志立刻可见 |
| `> app.log` | 标准输出写入日志 |
| `2>&1` | 标准错误进同一文件 |

查看和结束：`ps a` / `ps axjf`，再 `kill -9 <PID>`。
