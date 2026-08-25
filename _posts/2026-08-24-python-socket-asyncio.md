---
layout: post
title: Python Socket 与异步 IO 笔记
date: 2026-08-24
category: 编程
tags: [编程]
---

整理端口、Socket、asyncio / aiohttp，以及多客户端服务端相关笔记与资料。

## 一、端口号

计算机端口共 **65535** 个（一般用 1–65535，0 通常不用）。

| 范围 | 类型 | 说明 |
|------|------|------|
| 0–1023 | 系统 / 公认端口 | 仅系统特许进程可用 |
| 1024–65535 | 用户端口 | 应用程序使用 |
| 1024–5000 | 临时端口 | 一般程序通讯常用 1024–4999 |
| 5001–65535 | 服务器（非特权）端口 | 用户自定义服务端口 |

## 二、依赖安装

```bash
sudo apt-get install libevent-dev
sudo apt-get install python-dev
sudo pip install gevent
sudo pip install greenlet
```

## 三、asyncio 基础

`asyncio` 可在单线程里做并发 IO。用在客户端收益有限；用在服务端（例如 Web，HTTP 本身是 IO）可用「单线程 + 协程」撑高并发。

它实现了 TCP、UDP、SSL 等协议。`aiohttp` 是基于 asyncio 的 HTTP 框架。Python 3.5 起有 `async` / `await`，回调写法更直观。和 gevent 的使用感受接近。

| 概念 | 说明 |
|------|------|
| `event_loop` | 事件循环，像一个池，装着 `async` 协程，放进循环才能跑 |
| `coroutine` | 用 `async` 定义的函数，调用不立刻执行，返回协程对象，需注册到事件循环 |
| `task` | 对协程的再封装，带任务状态 |
| `future` | 将来完成或未完成的任务结果，与 task 无本质差别 |
| `async` / `await` | 3.5 起定义协程、挂起阻塞异步调用 |

`asyncio.create_task()` 在 Python 3.7 引入，用来创建 Task。

相关时间线：

- `asyncio`：Python 3.4
- `async` / `await`：Python 3.5
- 另可关注 `uvloop`

安装 aiohttp（官方还建议装编码检测 `cchardet` 和 DNS 加速 `aiodns`）：

```bash
pip3 install aiohttp
pip3 install cchardet aiodns
```

## 四、UDP 与其它协议备忘

UDP 面向无连接：数据报带源/目的端口，无需建连，可广播。单个数据报不超过 **64KB**，不保证到达顺序，不可靠。常用于多点通信和实时业务，例如语音、广播视频、QQ、TFTP、大型网游。相对 TCP，更看重速度与流畅。

其它关键词（原稿备忘）：MQTT（物联网传输协议）、NAS、单线程监听多端口。

## 五、多客户端：ThreadingTCPServer

多线程客户端向服务器传数据，服务端接收。用 `socketserver` 按类实现：

```python
import socketserver

class Myserver(socketserver.BaseRequestHandler):  # 必须继承 BaseRequestHandler
    def handle(self):  # 必须实现 handle
        conn = self.request
        print(conn)  # 这里的 conn 就是 socket 里的连接
        msg = conn.recv(1024)
        print(msg.decode("utf-8"))
        conn.close()

server = socketserver.ThreadingTCPServer(("127.0.0.1", 9002), Myserver)
server.serve_forever()  # 持续处理请求直到 shutdown
```

## 六、学习资料

### 异步与协程

- [使用 asyncio 的 Python 简单套接字客户端/服务器](https://javaroad.cn)
- [Python 的异步 IO：Asyncio（51CTO）](https://blog.51cto.com)
- [15 案例：异步操作 MySQL（Bilibili）](https://www.bilibili.com)
- [Python 高级编程和异步 IO 并发编程（B 站）](https://www.bilibili.com)

### 多客户端 Socket

- [【Python】socket-Part7-实现多客户端「并发」（知乎）](https://zhuanlan.zhihu.com)
- [Python 实现一个服务端、多个客户端接入（CSDN）](https://blog.csdn.net)
- [Python 编程(十六)：ThreadingTCPServer（知乎）](https://zhuanlan.zhihu.com)

### epoll / 多路复用

- [How To Use Linux epoll with Python](https://scotdoyle.com)
- [python socket 使用 epoll 模型（酷 python）](https://coolpython.net)
- [python 之 socket 编程（博客园）](https://www.cnblogs.com)
- [Linux 底层原理 —— epoll 与多路复用（CSDN）](https://blog.csdn.net)
- [python IO 多路复用之 epoll 详解（脚本之家）](https://www.jb51.net)
- [python 并发编程 多路复用 IO 模型（脚本之家）](https://www.jb51.net)
- [Python 多路复用 selector 模块（脚本之家）](https://www.jb51.net)
- [python epoll 实现异步 socket（CSDN）](https://blog.csdn.net)

### 视频

- [Web 服务器编程（Bilibili）](https://www.bilibili.com)
- [HTTP 协议：用网络调试助手充当 HTTP 服务器](https://www.bilibili.com)
- [IO 多路复用（select、poll 和 epoll）](https://www.bilibili.com)
- [Bilibili 课程 p11](https://www.bilibili.com/video/BV1bU4y137D1/?p=11&spm_id_from=pageDriver&vd_source=c26ced531759a0017aabbc16b9c4f06f)

### 其它

- [「NAS」我的搭建 NAS 全过程（知乎）](https://www.zhihu.com)
- 单线程同时监听多个端口（Windows / C++，CSDN）

## 七、粘包与丢包

Socket 缓冲区是字节流，先进先出，发送和取出都可以自定义大小。

- 缓冲区没取完，数据会堆在里面。
- `recv(1024)` 只表示**最多**取 1024 字节，实际长度不确定，可能读半包。
- 连续发两条，底层也可能拼成一次发送，对端一次 `recv` 就粘在一起。

所以会同时遇到**丢包**（没取干净或取少了）和**粘包**（多条粘成一条）。

处理思路：

1. **发送间隔**：两条之间停一下，例如 `time.sleep(0.5)`。只适合不追求吞吐的调试。
2. **确认重传**：发完等对端确认，确认后再发下一条，否则重发。
3. **减小单次收发**：buffer 越小，一次粘多条的概率越低。实践里常见 `1024`～`10240`。

更稳的做法是自己定帧：长度前缀或分隔符，接收端按协议拼包，而不是依赖「一次 recv 刚好一条」。

## 八、设备侧联网（Cam / 嵌入式）

采集设备连热点、再把数据推到服务器时，大致是这类字段（密码和 IP 用占位符）：

```c
const char *ssid = "YOUR_WIFI_SSID";
const char *password = "YOUR_WIFI_PASSWORD";
const char *host = "YOUR_SERVER_IP";
const int port = 8888;
```

端口暂时不用：`sudo ufw deny 8888`。
