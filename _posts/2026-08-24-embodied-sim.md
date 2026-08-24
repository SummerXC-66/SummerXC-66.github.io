---
layout: post
title: 具身仿真：Isaac Sim、MuJoCo、Gazebo
date: 2026-08-24
category: 具身大模型算法
tags: [Isaac Sim, Isaac Lab, MuJoCo, Gazebo, MoveIt, LeRobot, 仿真]
---

具身策略要在仿真里采数据、验动作。三套常见栈：Isaac Sim（GPU 场景与训练）、MuJoCo（轻量物理 / 模仿学习）、Gazebo + MoveIt（ROS 2 机械臂）。

| 栈 | 适合 | 备注 |
|----|------|------|
| **Isaac Sim / Isaac Lab** | 大规模并行、传感器、RL / IL 训练 | NVIDIA GPU，和 ROS 可桥接 |
| **MuJoCo** | 接触物理、键盘遥操作采集 | 依赖少，渲染要处理好 OpenGL |
| **Gazebo + MoveIt** | 规划、UR 驱动、ROS 2 联调 | 先装好 Humble |

## 一、Isaac Sim / Isaac Lab

Isaac Sim 是 NVIDIA 的机器人仿真器，Isaac Lab 在它上面做强化学习、模仿学习和具身评测。VLA / 操作策略常用这套出域随机化、相机和并行环境。

- 安装与版本：看 [Isaac Sim 文档](https://docs.isaacsim.omniverse.nvidia.com/) 和 [Isaac Lab](https://isaac-sim.github.io/IsaacLab/)
- 驱动和 CUDA 要和本机显卡匹配，不要和系统里另一套 ROS / conda OpenGL 硬叠在同一环境
- 和 ROS 2 联调走官方 bridge，不要在 conda 里硬编 ROS

本机还没有逐步安装记录，装好后把版本号、启动命令和常用环境补在本节即可。

## 二、MuJoCo（UR5e）与 OpenGL

渲染报错时先补系统库：

```bash
sudo apt install mesa-vulkan-drivers
sudo apt-get install -y mesa-utils libgl1-mesa-glx libosmesa6-dev
sudo apt install libglu1-mesa-dev freeglut3-dev mesa-common-dev
sudo apt install pkg-config
export LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6
```

conda 里 libGL 失败：

```bash
conda install -c conda-forge mesa-libgl-cos6-x86_64 glfw
```

键盘遥操作采集（LeRobot）：

```bash
pip install opencv-python==3.4.18.65 -i https://mirrors.aliyun.com/pypi/simple/
python ./imitation_learning_lerobot/scripts/collect_data_teleoperation.py \
  --env.type=pick_box --handler.type=keyboard
```

仓库：[imitation_learning_lerobot](https://gitee.com/chaomingsanhua/imitation_learning_lerobot)

## 三、Gazebo、MoveIt 与 UR（ROS 2 Humble）

在已 source 的 Humble 环境下：

```bash
apt-cache policy | grep ros-humble   # 没有输出就先配 ROS 2 源

sudo apt install libgazebo-dev
sudo apt install ros-humble-moveit ros-humble-tf2-ros \
  ros-humble-moveit-setup-assistant ros-humble-gazebo-ros-pkgs
sudo apt update
sudo apt install ros-humble-ur-robot-driver \
  ros-humble-ur-description ros-humble-ur-moveit-config
```

pip 可用 `https://mirrors.aliyun.com/pypi/simple/`。缺 `em` / `empy` 时再补。
