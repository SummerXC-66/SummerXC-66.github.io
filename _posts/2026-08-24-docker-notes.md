---
layout: post
title: Docker 常用命令与踩坑记录
date: 2026-08-24
category: 工具
tags: [Docker, 容器, PyTorch, WSL2, Samba, pip]
---

Windows 安装 Docker 踩坑记录：把 Python 环境跑在容器里实现多版本并存，并用作 PyCharm 的解释器。后半段补了内网 Samba 共享、局域网 pip 镜像和 TensorFlow Jupyter 容器。

## 一、参考资料

- [WSL2 安装（Bilibili）](https://www.bilibili.com/video/BV11L411g7U1/?spm_id_from=333.337.search-card.all.click&vd_source=c26ced531759a0017aabbc16b9c4f06f)
- [Docker 文档](https://docker.easydoc.net/doc/81170005/cCewZWoN/lTKfePfP)
- [PyTorch 官方镜像标签](https://hub.docker.com/r/pytorch/pytorch/tags)

## 二、常用命令

| 操作 | 命令 |
|------|------|
| 查看已有镜像 | `docker images` |
| 查看已有容器 | `docker ps -a` |
| 查看正在运行的容器 | `docker ps` |
| 启动并进入容器 | `docker start -i <containerID>` |
| 退出容器 | `exit` |
| 停止正在运行的容器 | `docker stop <containerID>` |
| 删除容器 | `docker rm <containerID>` |
| 删除镜像 | `docker rmi <imageNAME或imageID>` |
| 复制文件进容器 | `docker cp <本地路径> <containerID>:<容器路径>` |

启动 Docker 服务：

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

## 三、docker run 参数说明

示例：

```bash
docker run -v /usr/ToolsAPIDir:/ToolsAPIDir1 -d -p 5005:5004 -it toolsapi:v8 python3 tools_api.py
```

| 参数 | 说明 |
|------|------|
| `-v 本地目录:容器目录` | 挂载主机目录到容器；本地路径必须是绝对路径 |
| `-d` | 后台运行容器 |
| `-p 5005:5004` | 主机 5005 端口映射到容器 5004 端口 |
| `-it` | 以交互模式运行 |
| `python3 tools_api.py` | 启动命令，可覆盖 Dockerfile 中的 `CMD` |

## 四、PyTorch GPU 容器

拉取镜像并启动：

```bash
docker pull pytorch/pytorch:1.10.0-cuda11.3-cudnn8-devel
docker images

# 后台交互启动，指定 GPU 0
docker run -it -d --gpus "device=0" pytorch/pytorch:1.10.0-cuda11.3-cudnn8-devel /bin/bash

# Windows 路径挂载示例
docker run -it -v E:\OCR\ocr-xc:/home/ocr-xc --gpus "device=0" pytorch/pytorch:1.10.0-cuda11.3-cudnn8-devel /bin/bash
```

Ubuntu 22.04 路径挂载示例：

```bash
docker run -it -v /home/xiachuan/Desktop/XC:/workspace/XC --gpus "device=0" pytorch/pytorch:1.10.0-cuda11.3-cudnn8-devel
```

进入已有容器并检查 CUDA / cuDNN：

```bash
docker ps
docker start -i 3541ad0c6678
nvcc -V
dpkg -l | grep cudnn
```

把本地目录拷进容器（Windows 示例）：

```bash
docker cp E:\OCR\ocr-xc 3541ad0c6678:/home
```

## 五、docker-compose

```bash
docker-compose start python      # 启动
docker-compose stop python       # 停止
docker-compose restart python    # 重启
docker-compose stop python && docker-compose rm python   # 停止并删除
```

## 六、OpenCV（cv2）依赖

Dockerfile 中安装系统库：

```dockerfile
RUN apt-get update
RUN apt-get install ffmpeg libsm6 libxext6 -y
```

或在容器内安装无 GUI 版本：

```bash
pip install opencv-python-headless
```

## 七、其他：解压 rar

```bash
unrar x -r filename.rar ~/Path
```

- `x`：保留原先全部路径
- `-r`：递归解压子目录
- `e`：全部文件解压到同一文件夹，不保留 rar 中的路径

## 八、内网 Samba 共享容器

整理自 2021 年内网服务器笔记（李毅 / 夏川）。默认按 **192.168.8.*** 网段；路由器不改网段时，要改镜像里的 `/etc/samba/smb.conf`。

机器上还没装 Docker 时：

```bash
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bk
sudo sed -i s@/archive.ubuntu.com/@/mirrors.aliyun.com/@g /etc/apt/sources.list
sudo apt-get update
wget -qO- https://get.docker.com/ | sh
sudo service docker start
```

拉起共享：

```bash
sudo mkdir -p /home/share_dir/external
sudo mkdir -p /home/share_dir/internal
sudo chmod 777 /home/share_dir -R
docker run --name samba -p 445:445 -v /home/share_dir:/share gdyshi/samba
```

| 共享 | 谁能用 | 用途 | 权限 |
|------|--------|------|------|
| `file_send` | 局域网外电脑 | 外网文件拷进服务器 | 读写 |
| `file_recv` | 局域网内电脑 | 再拷到内网电脑 | 只读 |
| `internal` | 局域网内电脑 | 内网互拷 | — |

Windows 上 `Win + R`，打开 `\\服务器IP`。主机上若已有系统 Samba，先卸掉再 `sudo docker restart samba`，避免抢 445：

```bash
sudo apt-get --purge remove samba samba-common
sudo docker restart samba
```

路由器 LAN / DHCP 改到 `192.168.8.*` 后重启服务器，再执行一次 `sudo docker restart samba`。日常：`docker ps`、`sudo netstat -tunpl | grep 445`、`ifconfig`。

## 九、局域网 pip 镜像

```bash
sudo mkdir /home/pipmirror
docker run --name pip-source -p 8083:80 -v /home/pipmirror:/srv/pypi gdyshi/pip-source
```

更新包（耗时长，可晚上跑）：

```bash
docker exec -it pip-source bash
python /bandersnatch/src/runner.py 3600
```

客户端：

```ini
[global]
extra-index-url = http://SERVER_IP:8083/simple/
```

Linux 写 `~/.pip/pip.conf`，Windows 写 `%APPDATA%/pip/pip.ini`（没有就新建）。公网源对照见 [Ubuntu 环境配置](/notes/2026/08/24/ubuntu-setup/) 第二十一节。

## 十、TensorFlow Jupyter 容器

参考：[TensorFlow 安装](https://www.tensorflow.org/install?hl=zh-cn)

```bash
docker pull tensorflow/tensorflow:latest
docker run -it -p 8888:8888 tensorflow/tensorflow:latest-jupyter
```
