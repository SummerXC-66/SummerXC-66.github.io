---
layout: post
title: 内网服务器搭建：Docker、Samba 与 pip 镜像
date: 2021-07-14
category: 工具
tags: [Docker, Samba, pip, 内网, 服务器]
---

整理自 `my/服务器搭建/`。原文作者李毅，2021-07-14 由夏川抄录并补充注意事项。语雀原文：[服务器搭建](https://www.yuque.com/docs/share/d6ef296d-339d-4816-a042-f88315040022)。

日常 Docker 命令见 [Docker 常用命令与踩坑记录](/notes/2026/08/24/docker-notes/)。这里记的是内网文件交换和 pip 镜像。

## 一、换源并安装 Docker

```bash
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bk
sudo sed -i s@/archive.ubuntu.com/@/mirrors.aliyun.com/@g /etc/apt/sources.list
sudo apt-get update

wget -qO- https://get.docker.com/ | sh
sudo service docker start
```

## 二、Samba 共享容器

默认按 **192.168.8.*** 网段配置。路由器不改网段的话，要改镜像里的 `/etc/samba/smb.conf`。

```bash
sudo mkdir -p /home/share_dir/external
sudo mkdir -p /home/share_dir/internal
sudo chmod 777 /home/share_dir -R
docker run --name samba -p 445:445 -v /home/share_dir:/share gdyshi/samba
```

跑起来后会有三个共享：

| 共享 | 谁能用 | 用途 | 权限 |
|------|--------|------|------|
| `file_send` | 局域网外电脑 | 外网文件拷进服务器 | 读写 |
| `file_recv` | 局域网内电脑 | 再拷到内网电脑 | 只读 |
| `internal` | 局域网内电脑 | 内网互拷 | — |

Windows 上 `Win + R`，打开 `\\服务器IP` 即可看到。

### 主机上不要再跑系统 Samba

若 `dpkg -l | grep samba` 能看到系统包，卸掉再启动容器，避免抢 445 端口：

```bash
sudo apt remove samba-common
sudo apt remove samba-dsdb-modules
sudo apt-get --purge remove samba
sudo apt-get --purge remove samba-common
sudo docker restart samba
```

### 路由器改到 8 网段

1. 打开 `http://192.168.1.1/` 或 `http://192.168.2.1/`
2. LAN 口 IP 从 `192.168.1.*` 改成 `192.168.8.*`
3. DHCP 地址池同样改到 `192.168.8.*`
4. 重启服务器后执行 `sudo docker restart samba`
5. `ifconfig` 看本机 IP，例如 `192.168.8.101`

### 日常

```bash
sudo docker restart samba   # 重启服务器后记得拉起
docker ps
sudo service samba stop     # 停系统 samba（若还在）
sudo netstat -tunpl | grep 445
ifconfig
```

## 三、局域网 pip 镜像

```bash
sudo mkdir /home/pipmirror
docker run --name pip-source -p 8083:80 -v /home/pipmirror:/srv/pypi gdyshi/pip-source
```

更新包（耗时长，可晚上跑）：

```bash
docker exec -it pip-source bash
python /bandersnatch/src/runner.py 3600
```

客户端 `extra-index-url`：

```ini
[global]
extra-index-url = http://SERVER_IP:8083/simple/
```

- Linux：`~/.pip/pip.conf`
- Windows：`%APPDATA%/pip/pip.ini`（没有就新建）

## 四、TensorFlow 2 Docker（备忘）

参考：[TensorFlow 安装](https://www.tensorflow.org/install?hl=zh-cn)

```bash
docker pull tensorflow/tensorflow:latest
docker run -it -p 8888:8888 tensorflow/tensorflow:latest-jupyter
```

Ubuntu 系统镜像容器一节原文标注「文档更新中」，当时没有正文。
