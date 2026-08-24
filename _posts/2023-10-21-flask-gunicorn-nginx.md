---
layout: post
title: 用 Gunicorn 和 Nginx 部署 Flask
date: 2023-10-21
category: 工具
tags: [Flask, Gunicorn, Nginx, 部署]
---

整理自学习空间「用 gunicorn 和 Nginx 部署 Flask」。环境是 Ubuntu 22.04 + Python 3.10。公网地址已改成占位符。

另有一条 Ubuntu 备忘：关掉某个端口可用 `sudo ufw deny 8888`。

## 一、安装

```bash
sudo pip3 install gunicorn
sudo apt install nginx
```

## 二、Nginx 配置

检查主配置：

```bash
cd /etc/nginx
sudo vim nginx.conf
```

站点配置写在 `conf.d`：

```bash
cd /etc/nginx/conf.d
sudo vim default.conf
```

示例：

```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;  # HOST 的外网域名或 IP
    location / {
        proxy_pass http://127.0.0.1:6666;  # 指向 gunicorn
    }
}
```

原笔记里 `proxy_pass` 写成了 `http://0.0.0.0:6666`。反向代理一般指向本机回环地址即可。

## 三、启动 Gunicorn

原命令（日志重定向少了一个 `>`，使用时建议补上）：

```bash
nohup gunicorn -w 2 -b 0.0.0.0:6666 manage:app > 2023.10.21.log 2>&1 &
```

`-w 2` 是 2 个 worker，`-b 0.0.0.0:6666` 监听 6666，入口是 `manage:app`。

## 四、启停 Nginx

```bash
sudo systemctl start nginx
sudo systemctl restart nginx
sudo systemctl stop nginx
```

协程 worker、Meinheld 相关踩坑见 [Meinheld + Gunicorn + Flask](/notes/2024/07/24/meinheld-gunicorn-flask/)。
