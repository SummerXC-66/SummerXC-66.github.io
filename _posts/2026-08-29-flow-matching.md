---
layout: post
title: Flow Matching 数学推导
date: 2026-08-29
category: 算法
tags: [算法, 生成模型, Flow Matching]
---

Flow Matching 把「噪声送到数据」写成对速度场的回归：训练不解 ODE，采样时再积分。

论文：[Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747)

## 一、目标

先验是标准高斯，要变成数据分布 q。用速度场推粒子：

$$
\frac{\mathrm{d}x}{\mathrm{d}t}=u_t(x),\qquad x_0\sim\mathcal{N}(0,I)
$$

走到 t = 1 时期望得到数据。路径密度与速度场由连续性方程配对：

$$
\partial_t p_t+\nabla\cdot(p_t u_t)=0
$$

若已知边缘速度，最小二乘即可：

$$
\mathcal{L}_{\mathrm{FM}}(\theta)=\mathbb{E}_{t,\,x\sim p_t}\big\|v_\theta(t,x)-u_t(x)\big\|^2
$$

边缘密度、边缘速度都没有闭式，这个损失算不出。

## 二、条件路径

先给单个数据点一条好写的路径（从噪声到该点），边缘是混合：

$$
p_t(x)=\int p_t(x\mid x_1)\,q(x_1)\,\mathrm{d}x_1
$$

生成它的边缘速度，是条件速度的后验平均：

$$
u_t(x)=\int u_t(x\mid x_1)\,\frac{p_t(x\mid x_1)\,q(x_1)}{p_t(x)}\,\mathrm{d}x_1
$$

条件速度有闭式，边缘速度仍没有。

## 三、为什么可以回归条件速度

条件损失：

$$
\mathcal{L}_{\mathrm{CFM}}(\theta)=\mathbb{E}_{t,\,x_1,\,x\sim p_t(\cdot\mid x_1)}\big\|v_\theta(t,x)-u_t(x\mid x_1)\big\|^2
$$

它与边缘损失对 θ **同梯度**。展开平方：目标速度的模方不含 θ；网络模方两边相同（全概率）；交叉项把上一节的后验平均代回去，也相同。两者只差一个与 θ 无关的常数。

因此训练只回归可算的条件速度，学到的仍是生成边缘路径的场。

## 四、直线路径

独立抽取噪声和数据，走直线，速度是常数：

$$
x_t=(1-t)\,x_0+t\,x_1
$$

$$
u=x_1-x_0
$$

## 五、训练

一次迭代：

$$
x_0\sim\mathcal{N}(0,I),\qquad x_1\sim q,\qquad t\sim\mathcal{U}[0,1]
$$

$$
x_t=(1-t)\,x_0+t\,x_1
$$

$$
u^\star=x_1-x_0
$$

$$
\mathcal{L}(\theta)=\big\|v_\theta(t,x_t)-u^\star\big\|^2
$$

对 θ 做梯度下降。有条件时把网络写成 vθ(t, x, c)，插值公式不变。

## 六、推理（采样）

从噪声出发，沿学到的速度场积分到 t = 1：

$$
\frac{\mathrm{d}x}{\mathrm{d}t}=v_\theta(t,x),\qquad x(0)\sim\mathcal{N}(0,I),\qquad t:0\to 1
$$

欧拉离散（N 步，步长 Δt = 1 / N）：

$$
x_{k+1}=x_k+\Delta t\cdot v_\theta(t_k,x_k),\qquad t_k=k\,\Delta t,\quad k=0,\ldots,N-1
$$

输出 x_N 即生成样本。

**一句话：** 边缘速度算不出，条件速度算得出，两者对 θ 的梯度相同；直线路径下训练目标就是 x₁ − x₀，推理就是积 ODE。
