---
layout: post
title: VLA 仿真环境：ROS 2、MoveIt、MuJoCo
date: 2025-09-27
category: 具身大模型算法
tags: [VLA, ROS2, MoveIt, Gazebo, MuJoCo, LeRobot]
---

整理自学习空间备份库「VLA 仿真」。Humble 的安装与工作空间见 [Ubuntu 安装 ROS 2 与常用操作](/notes/2026/08/24/ros2-notes/)。这里只记仿真栈和踩坑。

## 一、确认 ROS 2 源

```bash
apt-cache policy | grep ros-humble
```

没有输出时再补源：

```bash
sudo apt update && sudo apt install curl gnupg2 lsb-release
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \
  -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(lsb_release -cs) main" \
  | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
sudo apt update
```

旧写法 `curl .../ros.asc | sudo apt-key add -` 也能加钥，但不推荐。

## 二、仿真依赖

**libGL 报错（conda 环境）：**

```bash
conda install -c conda-forge mesa-libgl-cos6-x86_64 glfw
```

**Gazebo：**

```bash
sudo apt install libgazebo-dev
```

**MoveIt!：**

```bash
sudo apt install ros-humble-moveit ros-humble-tf2-ros \
  ros-humble-moveit-setup-assistant ros-humble-gazebo-ros-pkgs
```

**UR 官方 ROS 2 驱动：**

```bash
sudo apt update
sudo apt install ros-humble-ur-robot-driver \
  ros-humble-ur-description ros-humble-ur-moveit-config
```

原稿第 3 步「安装 em」没有写下包名，需要时再补 `empy` 一类依赖。

pip 源可用阿里云：`https://mirrors.aliyun.com/pypi/simple/`。

## 三、MuJoCo 仿 UR5e 与 OpenGL

原笔记有一张仿真截图，导出时已省略。OpenGL 渲染常见处理：

```bash
sudo apt install mesa-vulkan-drivers
sudo apt-get install -y mesa-utils libgl1-mesa-glx libosmesa6-dev
sudo apt install libglu1-mesa-dev freeglut3-dev mesa-common-dev
sudo apt install pkg-config

export LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6
```

采集脚本示例（LeRobot 模仿学习）：

```bash
pip install opencv-python==3.4.18.65 -i https://mirrors.aliyun.com/pypi/simple/
python ./imitation_learning_lerobot/scripts/collect_data_teleoperation.py \
  --env.type=pick_box --handler.type=keyboard
```

参考仓库：[imitation_learning_lerobot](https://gitee.com/chaomingsanhua/imitation_learning_lerobot)
