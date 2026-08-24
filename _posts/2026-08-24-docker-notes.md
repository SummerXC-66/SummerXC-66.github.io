---
layout: post
title: Docker 常用命令与踩坑记录
date: 2026-08-24
category: 工具
tags: [Docker, 容器, PyTorch, WSL2]
---

Windows 安装 Docker 踩坑记录：把 Python 环境跑在容器里实现多版本并存，并用作 PyCharm 的解释器。

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
