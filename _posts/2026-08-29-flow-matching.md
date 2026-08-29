---
layout: post
title: Flow Matching 数学推导
date: 2026-08-29
category: 算法
tags: [算法, 生成模型, Flow Matching]
---

Flow Matching 把「噪声 → 数据」写成对速度场的回归：训练不解 ODE，采样再积分。

论文：[Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747)

## 一、目标

先验 $p_0=\mathcal{N}(0,I)$ 要变成数据 $q$。用速度场 $u_t$ 推粒子：

$$
\frac{dx}{dt}=u_t(x),\qquad x_0\sim p_0
$$

走到 $t=1$ 时期望 $x_1\sim q$。$p_t$ 与 $u_t$ 由连续性方程配对：$\partial_t p_t+\nabla\cdot(p_t u_t)=0$。

若已知 $u_t$，回归即可：

$$
\mathcal{L}_{\mathrm{FM}}=\mathbb{E}_{t,\,x\sim p_t}\left\|v_\theta(t,x)-u_t(x)\right\|^2
$$

边缘 $p_t$、$u_t$ 没有闭式，这个损失算不出。

## 二、条件路径

先给单个数据点 $x_1\sim q$ 一条好写的路径 $p_t(x\mid x_1)$（从噪声到该点），边缘是混合

$$
p_t(x)=\int p_t(x\mid x_1)\,q(x_1)\,dx_1
$$

生成它的边缘速度是条件速度的后验平均：

$$
u_t(x)=\int u_t(x\mid x_1)\,\frac{p_t(x\mid x_1)\,q(x_1)}{p_t(x)}\,dx_1
$$

条件速度 $u_t(x\mid x_1)$ 有闭式，边缘 $u_t(x)$ 仍没有。

## 三、为什么可以回归条件速度

条件损失

$$
\mathcal{L}_{\mathrm{CFM}}=\mathbb{E}_{t,\,x_1,\,x\sim p_t(\cdot\mid x_1)}\left\|v_\theta(t,x)-u_t(x\mid x_1)\right\|^2
$$

与 $\mathcal{L}_{\mathrm{FM}}$ **同梯度**。展开 $\|a-b\|^2$：$\|u\|^2$ 不含 $\theta$；$\|v_\theta\|^2$ 两边相同（全概率）；交叉项把上面的后验平均代回去，也相同。所以差一个与 $\theta$ 无关的常数。

训练只回归可算的 $u_t(x\mid x_1)$，学到的仍是生成边缘路径的 $u_t$。

## 四、直线路径

最常用：独立抽 $x_0\sim p_0$、$x_1\sim q$，走直线

$$
x_t=(1-t)x_0+t x_1,\qquad u=x_1-x_0
$$

损失就是

$$
\mathcal{L}=\mathbb{E}_{t,x_0,x_1}\left\|v_\theta(t,x_t)-(x_1-x_0)\right\|^2
$$

（高斯仿射流对 $t$ 求导，也会得到同一类速度；$\sigma\to 0$ 时退化为 $x_1-x_0$。）

## 五、训练与采样

训练：抽 $t,x_0,x_1$，在 $x_t$ 上回归 $x_1-x_0$。

采样：从 $x_0\sim p_0$ 积 $\dot x=v_\theta(t,x)$ 到 $t=1$。欧拉：$x\leftarrow x+\Delta t\cdot v_\theta(t,x)$。

**一句话：** 边缘速度算不出，条件速度算得出，两者对 $\theta$ 的梯度相同；直线路径下目标就是 $x_1-x_0$。
