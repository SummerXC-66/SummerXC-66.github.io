---
layout: post
title: Ubuntu 环境配置与踩坑记录
date: 2026-08-24
category: 工具
tags: [Ubuntu, CUDA, cuDNN, TensorRT, 驱动]
---

Windows + Ubuntu 双系统下的环境配置笔记，侧重 Ubuntu 20.04：无线网、显卡、CUDA / cuDNN / TensorRT。

> 另有一条标题备忘：【tf-trt 环境配置】tensorflow + cuda + cudnn + tensorrt 安装记录。

比较两个文件：

```bash
cmp 文件1 文件2
```

合盖不挂起等桌面扩展：

```bash
sudo apt install lightdm
sudo apt-get install gnome-shell-extensions
```

Ubuntu 18.04 触控板右键失灵：软件中心搜索 **gnome-tweak**，安装后到 **Keyboard & Mouse → Mouse click emulation**，勾选 **AREA**。

## 一、无线 Wi-Fi

```bash
sudo apt-get install bcmwl-kernel-source
sudo apt install net-tools wireless-tools network-manager
```

## 二、输入法

参考：[CSDN 输入法配置](https://blog.csdn.net/do_you_ac_today/article/details/123279735)

## 三、显卡驱动（GeForce 3060，驱动 515）

参考：[显卡驱动安装](https://blog.csdn.net/weixin_39894932/article/details/110489917)

依赖库：

```bash
sudo apt-get install libprotobuf-dev libleveldb-dev libsnappy-dev libopencv-dev libhdf5-serial-dev protobuf-compiler
sudo apt-get install --no-install-recommends libboost-all-dev
sudo apt-get install libopenblas-dev liblapack-dev libatlas-base-dev
sudo apt-get install libgflags-dev libgoogle-glog-dev liblmdb-dev
```

拉黑 nouveau：

```bash
sudo gedit /etc/modprobe.d/blacklist-nouveau.conf
```

写入：

```
blacklist nouveau
options nouveau modeset=0
```

卸载 NVIDIA 驱动：

```bash
sudo apt purge *nvidia*
sudo apt autoremove
```

## 四、亮度无法调节

```bash
sudo add-apt-repository ppa:apandada1/brightness-controller
sudo apt-get update
sudo apt-get install brightness-controller-simple
```

或用 `xrandr`：

```bash
xrandr --output DP-4 --brightness 0.8
sudo apt --fix-broken install
```

## 五、闪屏

```bash
sudo add-apt-repository ppa:bumblebee/stable
sudo apt-get update
sudo apt-get install bumblebee bumblebee-nvidia
sudo reboot
```

## 六、换源

```bash
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak
sudo chmod 777 /etc/apt/sources.list
sudo gedit /etc/apt/sources.list
```

## 七、安装 CUDA 前切换 gcc

安装 gcc-7 后系统会有多个 gcc，用优先级指定默认版本（数字越大优先级越高）：

```bash
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-7 9
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-9 1
sudo update-alternatives --display gcc

sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-7 9
sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-9 1
sudo update-alternatives --display g++
```

恢复为 gcc-9 / g++-9 优先：

```bash
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-7 1
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-9 9
sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-7 1
sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-9 9
```

## 八、Firefox 不支持 HTML5 播放

```bash
sudo apt-get install ubuntu-restricted-extras
sudo apt install ffmpeg
```

## 九、安装 CUDA 11.6

从 [CUDA Toolkit Archive](https://developer.nvidia.com/cuda-toolkit-archive) 下载。依赖：

```bash
sudo apt-get install freeglut3-dev build-essential libx11-dev libxmu-dev libxi-dev libgl1-mesa-glx libglu1-mesa libglu1-mesa-dev
```

写入 `~/.bashrc`：

```bash
export PATH=/usr/local/cuda-11.6/bin${PATH:+:${PATH}}
export LD_LIBRARY_PATH=/usr/local/cuda-11.6/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
```

```bash
source ~/.bashrc
```

## 十、安装 cuDNN 8.4.0

```bash
sudo cp cudnn-linux-x86_64-8.4.0.27_cuda11.6-archive/include/cudnn*.h /usr/local/cuda/include
sudo cp -p cudnn-linux-x86_64-8.4.0.27_cuda11.6-archive/lib/libcudnn* /usr/local/cuda/lib64
sudo chmod a+r /usr/local/cuda/include/cudnn*.h /usr/local/cuda/lib64/libcudnn*
```

查看版本：

```bash
cat /usr/local/cuda/include/cudnn.h | grep CUDNN_MAJOR -A 2
cat /usr/local/cuda/include/cudnn_version.h | grep CUDNN_MAJOR -A 2
```

## 十一、PyCUDA

```bash
# 下载 pycuda-2021.1.tar.gz 后
tar xfz pycuda-2021.1.tar.gz
cd pycuda-2021.1
python3 configure.py --cuda-root=/usr/local/cuda
sudo make install
pip3 install cuda-python -i https://pypi.tuna.tsinghua.edu.cn/simple/
```

## 十二、安装 / 卸载 TensorRT

下载 TensorRT 8.4.1 tar 包后，把库路径加入环境变量（路径按实际解压位置改）：

```bash
export LD_LIBRARY_PATH=/tensorrt/TensorRT-8.2.1.8/lib:$LD_LIBRARY_PATH
```

卸载：

```bash
sudo apt-get purge "nv-tensorrt-repo*"
sudo apt-get purge "libnvinfer*"
```

## 十三、PyQt / Atom

```bash
sudo apt-get install python3-pyqt5
sudo apt-get install qt5-default qttools5-dev-tools
sudo snap install atom --classic
```

## 十四、蓝牙连接

参考：[蓝牙连接](https://blog.csdn.net/weixin_48120620/article/details/126229978)

```bash
sudo apt-get install blueman bluez*
sudo apt-get install libbluetooth-dev
sudo apt install python3-pip
pip3 install PyBluez
sudo apt install blueman
sudo apt install pavucontrol
sudo apt install pulseaudio-module-bluetooth
sudo pactl load-module module-bluetooth-discover
```

编辑 `/etc/bluetooth/main.conf`：去掉 `[Policy]` 和 `AutoEnable` 前的注释，并把 `AutoEnable=false` 改成 `AutoEnable=true`。

若 `sudo pactl load-module module-bluetooth-discover` 报 connection refused：

```bash
sudo apt-get --purge --reinstall install pulseaudio-module-bluetooth
```

然后重启。

## 十五、ImageTk / matplotlib

```bash
sudo apt-get install python3-pil python3-pil.imagetk
```

## 十六、ESP32：加速 git clone

```bash
git clone https://github.com.cnpmjs.org/espressif/esp-adf.git
```

## 十七、Basler 相机网口

```bash
sudo ifconfig enp3s0 192.168.4.4 netmask 255.255.255.0
ping 192.168.4.5
```

## 十八、cuDNN「不是符号链接」

报错形如：

```
/sbin/ldconfig.real: /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_ops_infer.so.8 is not a symbolic link
```

`libcudnn.so.8`、`libcudnn_adv_train.so.8` 等同类库也会出现。先刷新缓存，再建立软链接（版本号按本机实际文件改）：

```bash
sudo ldconfig -v
sudo ln -sf /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_adv_train.so.8.4.0 /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_adv_train.so.8
sudo ln -sf /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_ops_infer.so.8.4.0 /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_ops_infer.so.8
sudo ln -sf /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_cnn_train.so.8.4.0 /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_cnn_train.so.8
sudo ln -sf /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_adv_infer.so.8.4.0 /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_adv_infer.so.8
sudo ln -sf /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_ops_train.so.8.4.0 /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_ops_train.so.8
sudo ln -sf /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_cnn_infer.so.8.4.0 /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudnn_cnn_infer.so.8
```

误删后可从备份目录拷回 `.so.8.4.0` 再重新 `ln -sf`。删除软链接时不要误删带完整版本号的实体文件。

## 十九、系统杂音（Pipewire）

```bash
sudo add-apt-repository ppa:pipewire-debian/pipewire-upstream
sudo apt install pipewire
sudo apt install gstreamer1.0-pipewire libpipewire-0.3-{0,dev,modules} \
  libspa-0.2-{bluetooth,dev,jack,modules} \
  pipewire{,-{audio-client-libraries,pulse,media-session,bin,locales,tests}}
```

装完后重启。

## 二十、找不到 OpenSSL

```bash
sudo apt-get install libssl-dev
```

## 二十一、PyPI 国内镜像

| 源 | 地址 |
|----|------|
| 清华大学 | https://pypi.tuna.tsinghua.edu.cn/simple/ |
| 阿里云 | http://mirrors.aliyun.com/pypi/simple/ |
| 中国科学技术大学 | http://pypi.mirrors.ustc.edu.cn/simple/ |
| 华中科技大学 | http://pypi.hustunique.com/ |
| 豆瓣 | http://pypi.douban.com/simple/ |
| 腾讯云 | http://mirrors.cloud.tencent.com/pypi/simple |

## 二十二、nvidia-smi 无法与驱动通信

报错：`NVIDIA-SMI has failed because it couldn't communicate with the NVIDIA driver.`

```bash
cd /usr/src
sudo apt-get install dkms
sudo dkms install -m nvidia -v 450.57
# 或按本机驱动版本：
sudo dkms install -m nvidia -v 525.105.17
```

## 二十三、关掉某个端口

```bash
sudo ufw deny 8888
```
