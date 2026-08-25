---
layout: post
title: Ubuntu 环境配置与踩坑记录
date: 2026-08-24
category: 工具
tags: [工具]
---

Windows + Ubuntu 双系统，侧重 Ubuntu 20.04：桌面、无线网、NVIDIA 驱动，以及 CUDA / cuDNN / TensorRT。

## 一、桌面

合盖不挂起等扩展：

```bash
sudo apt install lightdm
sudo apt-get install gnome-shell-extensions
```

Ubuntu 18.04 触控板右键失灵：装 **gnome-tweak**，到 **Keyboard & Mouse → Mouse click emulation**，勾选 **AREA**。

亮度：

```bash
sudo add-apt-repository ppa:apandada1/brightness-controller
sudo apt-get update
sudo apt-get install brightness-controller-simple
```

或 `xrandr --output DP-4 --brightness 0.8`（输出名用 `xrandr` 查看）。

闪屏：

```bash
sudo add-apt-repository ppa:bumblebee/stable
sudo apt-get update
sudo apt-get install bumblebee bumblebee-nvidia
sudo reboot
```

系统杂音（Pipewire），装完重启：

```bash
sudo add-apt-repository ppa:pipewire-debian/pipewire-upstream
sudo apt install pipewire
sudo apt install gstreamer1.0-pipewire libpipewire-0.3-{0,dev,modules} \
  libspa-0.2-{bluetooth,dev,jack,modules} \
  pipewire{,-{audio-client-libraries,pulse,media-session,bin,locales,tests}}
```

蓝牙：

```bash
sudo apt-get install blueman bluez* libbluetooth-dev
sudo apt install pavucontrol pulseaudio-module-bluetooth
sudo pactl load-module module-bluetooth-discover
```

`/etc/bluetooth/main.conf` 里打开 `[Policy]`，把 `AutoEnable` 改成 `true`。若 `pactl` 报 connection refused：

```bash
sudo apt-get --purge --reinstall install pulseaudio-module-bluetooth
```

然后重启。

## 二、无线网

```bash
sudo apt-get install bcmwl-kernel-source
sudo apt install net-tools wireless-tools network-manager
```

## 三、NVIDIA 驱动

拉黑 nouveau：

```bash
sudo gedit /etc/modprobe.d/blacklist-nouveau.conf
```

写入：

```
blacklist nouveau
options nouveau modeset=0
```

重装前先卸旧驱动：

```bash
sudo apt purge *nvidia*
sudo apt autoremove
```

`nvidia-smi` 报无法与驱动通信时，按本机版本重装 DKMS 模块：

```bash
cd /usr/src
sudo apt-get install dkms
sudo dkms install -m nvidia -v 525.105.17
```

## 四、CUDA 前切换 gcc

装 CUDA 11.x 时常要 gcc-7。数字越大优先级越高：

```bash
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-7 9
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-9 1
sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-7 9
sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-9 1
```

装完后改回 gcc-9 / g++-9 优先：把上面的 `9` / `1` 对调即可。`update-alternatives --display gcc` 查看当前选择。

## 五、CUDA 11.6

从 [CUDA Toolkit Archive](https://developer.nvidia.com/cuda-toolkit-archive) 下载。依赖：

```bash
sudo apt-get install freeglut3-dev build-essential libx11-dev libxmu-dev libxi-dev libgl1-mesa-glx libglu1-mesa libglu1-mesa-dev
```

写入 `~/.bashrc` 后 `source ~/.bashrc`：

```bash
export PATH=/usr/local/cuda-11.6/bin${PATH:+:${PATH}}
export LD_LIBRARY_PATH=/usr/local/cuda-11.6/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
```

## 六、cuDNN 8.4.0

```bash
sudo cp cudnn-linux-x86_64-8.4.0.27_cuda11.6-archive/include/cudnn*.h /usr/local/cuda/include
sudo cp -p cudnn-linux-x86_64-8.4.0.27_cuda11.6-archive/lib/libcudnn* /usr/local/cuda/lib64
sudo chmod a+r /usr/local/cuda/include/cudnn*.h /usr/local/cuda/lib64/libcudnn*
```

看版本：

```bash
cat /usr/local/cuda/include/cudnn_version.h | grep CUDNN_MAJOR -A 2
```

若 `ldconfig` 报 `libcudnn_*.so.8 is not a symbolic link`，对实际文件建软链（版本号按本机改）：

```bash
sudo ldconfig -v
sudo ln -sf /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_ops_infer.so.8.4.0 \
  /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_ops_infer.so.8
```

`adv_train`、`cnn_train`、`adv_infer`、`ops_train`、`cnn_infer` 同样处理。不要删带完整版本号的实体文件。

## 七、TensorRT

解压 tar 后把 `lib` 加入环境（路径按本机改）：

```bash
export LD_LIBRARY_PATH=/opt/TensorRT-8.4.1.5/lib:$LD_LIBRARY_PATH
```

卸载 apt 包：

```bash
sudo apt-get purge "nv-tensorrt-repo*"
sudo apt-get purge "libnvinfer*"
```

## 八、pip 国内源

| 源 | 地址 |
|----|------|
| 清华大学 | https://pypi.tuna.tsinghua.edu.cn/simple/ |
| 阿里云 | https://mirrors.aliyun.com/pypi/simple/ |
| 中国科学技术大学 | https://pypi.mirrors.ustc.edu.cn/simple/ |
| 腾讯云 | https://mirrors.cloud.tencent.com/pypi/simple/ |
