---
layout: post
title: Cython 入门与计算加速
date: 2026-08-24
category: 编程
tags: [Cython, Python, PyInstaller, 性能]
---

Cython 是快速生成 Python 扩展模块的工具，语法介于 Python 与 C 之间。计算遇到瓶颈时，不必整段用 C 重写，即可把 C 级速度嵌进现有 Python 程序。

> 过早优化是万恶之源。Cython 适合计算密集型；IO 密集更宜多线程 / 多进程。下一步可看 OpenMP 多核加速。

## 一、依赖与打包准备

清华源安装依赖：

```bash
pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
```

参考：[Python 相关说明](https://www.python100.com/html/SL9B92Z7IV43.html)

Windows 下用 PyInstaller 发布：

```bash
pip install pyinstaller
pip uninstall typing
pip install --ignore-installed greenlet -i https://pypi.tuna.tsinghua.edu.cn/simple/
```

| 命令 | 效果 |
|------|------|
| `pyinstaller -F` | 打成单文件，无图形可视化界面 |
| `pyinstaller`（不加 `-F`） | 打包后带图形可视化界面 |

## 二、安装与编译

```bash
pip install cython
python setup.py build_ext --inplace
python setup.py install
```

编译后得到 `.so`。`.pyx` 是 Cython 使用的 Python C 扩展源文件，代码需符合 Cython 规范。也可直接：

```bash
cython func.pyx
```

`setup.py` 示例：

```python
from distutils.core import setup
from Cython.Build import cythonize

setup(
    name="Hello pyx",
    ext_modules=cythonize("hello.pyx"),
)
```

带注解 HTML（`annotate=True`）便于看哪些行还停留在 Python 层：

```python
from distutils.core import setup
from Cython.Build import cythonize

setup(
    ext_modules=cythonize(["func.pyx"], annotate=True)
)
```

## 三、`.pyx` 示例

声明 C 数学库，用 `cdef` 固定类型：

```cython
import numpy as np
cimport cython

cdef extern from "math.h":
    float cosf(float theta)
    float sinf(float theta)
    float acosf(float theta)

def spherical_distance(float lon1, float lat1, float lon2, float lat2):
    cdef float radius = 3956
    cdef float pi = 3.14159265
    cdef float x = pi / 180.0
    cdef float a, b, theta, distance
    a = (90.0 - lat1) * x
    b = (90.0 - lat2) * x
    theta = (lon2 - lon1) * x
    distance = acosf(cosf(a) * cosf(b)) + (sinf(a) * sinf(b) * cosf(theta))
    return radius * distance

def f_compute(double a, double x, int N):
    cdef int i
    cdef double s = 0
    cdef double dx = (x - a) / N
    for i in range(N):
        s += ((a + i * dx) ** 2 - (a + i * dx))
    return s * dx
```

内存视图遍历二维数组（原稿写成 `warparound`，正确装饰器是 `wraparound`）：

```cython
@cython.wraparound(False)
def foo(M):
    cdef double[:, :] M_view = M
    cdef int rows = M.shape[0]
    cdef int cols = M.shape[1]
    cdef Py_ssize_t c, r
    for c in range(rows):
        for r in range(cols):
            dosomething(M_view[c, r])
```

## 四、适用场景

| 场景 | 建议 |
|------|------|
| 数值 / 浮点计算 | Cython 往往能明显提速；多线程有时反而变慢 |
| IO 密集 | Cython 收益有限，更适合多线程 / 多进程 |
| 计算遇到瓶颈 | 再考虑 Cython，或封装 C 模块 |

不要到处套 Cython。先把逻辑写对，瓶颈出现再优化。

## 五、给 pydensecrf 等包编译

部分科学计算包（例如 `pydensecrf`）要用较新 Cython，否则扩展编不过：

```bash
pip install "cython>=0.22"
pip install pydensecrf
```

这和 Meinheld / Gunicorn 那条线上的依赖踩坑是同一类问题：先把 Cython 升上去，再装需要编译的包。
