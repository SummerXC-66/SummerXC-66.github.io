---
layout: post
title: Flow Matching 数学推导
date: 2026-08-29
category: 算法
tags: [算法, 生成模型, Flow Matching]
---

Flow Matching 把「把噪声送到数据」写成对速度场的回归：训练时不解 ODE，采样时再积分。下面从连续归一化流推到条件流匹配，并给出直线路径的闭式目标。

论文：[Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747)（Lipman et al.）；直线路径另见 [Rectified Flow](https://arxiv.org/abs/2209.03003)。

**符号**

| 符号 | 含义 |
|------|------|
| $p_0$ | 先验，通常 $\mathcal{N}(0,I)$ |
| $q$ 或 $p_1$ | 数据分布 |
| $p_t$ | $t\in[0,1]$ 上的概率路径 |
| $u_t(x)$ | 生成 $p_t$ 的边缘速度场 |
| $v_\theta(t,x)$ | 网络学到的速度场 |
| $p_t(x\mid x_1)$、$u_t(x\mid x_1)$ | 以单个数据点为条件的路径与速度 |

## 一、用 ODE 搬动分布

要把先验 $p_0$ 变成数据分布 $p_1=q$。用时变向量场 $u_t:\mathbb{R}^d\to\mathbb{R}^d$ 定义流 $\psi_t$：

$$
\frac{d}{dt}\psi_t(x)=u_t(\psi_t(x)),\qquad \psi_0(x)=x
$$

$t=0$ 的粒子 $x_0\sim p_0$ 沿 ODE 走到 $x_t=\psi_t(x_0)$。诱导密度是 push-forward

$$
p_t=[\psi_t]_{\#}p_0
$$

即 $X_t=\psi_t(X_0)$ 的分布。希望 $p_1\approx q$。

这就是连续归一化流（CNF）。经典 CNF 做最大似然时要把 ODE 正反积分，还要算 $\nabla\cdot u_t$，训练很贵。Flow Matching 改成：先指定一条从 $p_0$ 到 $q$ 的路径 $p_t$，再学生成它的速度场。

## 二、连续性方程

粒子守恒给出 $p_t$ 与 $u_t$ 必须满足的 PDE。任意区域 $\Omega$ 内的概率变化只能来自边界通量：

$$
\frac{d}{dt}\int_{\Omega}p_t(x)\,dx
=-\int_{\partial\Omega}p_t(x)\,u_t(x)\cdot n\,dS
=-\int_{\Omega}\nabla\cdot(p_t u_t)\,dx
$$

左边换成 $\int_{\Omega}\partial_t p_t$，$\Omega$ 任意，得到连续性方程

$$
\partial_t p_t(x)+\nabla\cdot\bigl(p_t(x)\,u_t(x)\bigr)=0
$$

反过来：若 $(p_t,u_t)$ 满足它，且 $p_0$ 正确，则 $u_t$ 生成的流就是这条路径。生成建模于是变成：构造 $p_t$，再求出（或回归）对应的 $u_t$。

## 三、边缘流匹配：目标对，但算不出

若已知生成 $p_t$ 的真速度 $u_t$，最小二乘即可：

$$
\mathcal{L}_{\mathrm{FM}}(\theta)
=\mathbb{E}_{t\sim\mathcal{U}[0,1],\,x\sim p_t}
\left\|v_\theta(t,x)-u_t(x)\right\|^2
$$

$v_\theta=u_t$ 几乎处处时损失为零，沿 ODE 就能从 $p_0$ 走到 $p_1$。

一般路径的边缘密度 $p_t(x)$ 和边缘速度 $u_t(x)$ 都没有闭式，所以 $\mathcal{L}_{\mathrm{FM}}$ 不能直接算。

## 四、条件路径：先搬一个数据点

对单个数据点 $x_1\sim q$，构造一条容易写出来的条件路径 $p_t(x\mid x_1)$，要求

$$
p_0(x\mid x_1)=p_0(x),\qquad p_1(x\mid x_1)\approx\delta(x-x_1)
$$

实际常用很窄的高斯代替 Dirac。边缘路径是混合

$$
p_t(x)=\int p_t(x\mid x_1)\,q(x_1)\,dx_1
$$

于是 $p_0$ 仍是先验，$p_1$ 近似数据分布。

设 $u_t(x\mid x_1)$ 生成条件路径：

$$
\partial_t p_t(x\mid x_1)+\nabla\cdot\bigl(p_t(x\mid x_1)\,u_t(x\mid x_1)\bigr)=0
$$

对 $x_1$ 积分，并定义边缘向量场

$$
u_t(x)
=\int u_t(x\mid x_1)\,\frac{p_t(x\mid x_1)\,q(x_1)}{p_t(x)}\,dx_1
$$

则

$$
\int p_t(x\mid x_1)\,u_t(x\mid x_1)\,q(x_1)\,dx_1
=p_t(x)\,u_t(x)
$$

从而 $\partial_t p_t+\nabla\cdot(p_t u_t)=0$。条件场按后验加权平均，就是边缘场；边缘路径由这个 $u_t$ 生成。

$u_t(x)$ 仍是后验加权，不能直接算。但它说明：回归对象可以换成可算的 $u_t(x\mid x_1)$。

## 五、条件流匹配：与 FM 同梯度

定义

$$
\mathcal{L}_{\mathrm{CFM}}(\theta)
=\mathbb{E}_{t,\,x_1\sim q,\,x\sim p_t(\cdot\mid x_1)}
\left\|v_\theta(t,x)-u_t(x\mid x_1)\right\|^2
$$

**定理（Lipman et al.）** 在 $p_t(x)>0$ 的支撑上，

$$
\nabla_\theta\mathcal{L}_{\mathrm{FM}}(\theta)=\nabla_\theta\mathcal{L}_{\mathrm{CFM}}(\theta)
$$

两个损失只差一个与 $\theta$ 无关的常数，随机梯度相同。

**证明** 展开 $\|a-b\|^2=\|a\|^2-2\langle a,b\rangle+\|b\|^2$。其中 $\|u_t(x)\|^2$ 与 $\|u_t(x\mid x_1)\|^2$ 都不含 $\theta$，对梯度无贡献。剩下两项：

1. **二次项。** 由全概率，

$$
\mathbb{E}_{x\sim p_t}\|v_\theta(t,x)\|^2
=\mathbb{E}_{x_1\sim q,\,x\sim p_t(\cdot\mid x_1)}\|v_\theta(t,x)\|^2
$$

FM 与 CFM 相同。

2. **交叉项。** 把边缘场的定义代进去：

$$
\mathbb{E}_{x\sim p_t}\langle v_\theta(t,x),u_t(x)\rangle
=\int\langle v_\theta,u_t(x)\rangle p_t(x)\,dx
$$

$$
=\int\left\langle v_\theta,\;\int u_t(x\mid x_1)\,p_t(x\mid x_1)\,q(x_1)\,dx_1\right\rangle dx
$$

$$
=\mathbb{E}_{x_1\sim q,\,x\sim p_t(\cdot\mid x_1)}
\langle v_\theta(t,x),u_t(x\mid x_1)\rangle
$$

交叉项也相同。故 $\mathcal{L}_{\mathrm{FM}}-\mathcal{L}_{\mathrm{CFM}}$ 与 $\theta$ 无关，梯度相等。证毕。

训练时只需：抽 $x_1$、抽 $t$、从 $p_t(\cdot\mid x_1)$ 抽 $x$，回归闭式的 $u_t(x\mid x_1)$。不必求边缘 $p_t$ 或 $u_t$，也不必在训练中积分 ODE。

条件变量也可以是一对端点 $(x_0,x_1)$。证明逐字相同，只需把 $q(x_1)$ 换成耦合 $\pi(x_0,x_1)$。

## 六、高斯条件路径：速度场的闭式

取

$$
p_t(x\mid x_1)=\mathcal{N}\bigl(x;\,\mu_t(x_1),\,\sigma_t^2 I\bigr)
$$

并令仿射流

$$
\psi_t(x_0)=\mu_t(x_1)+\sigma_t x_0,\qquad x_0\sim\mathcal{N}(0,I)
$$

则 $X_t=\psi_t(X_0)$ 正好服从上述高斯。对 $t$ 求导：

$$
\dot\psi_t=\mu_t'(x_1)+\sigma_t'x_0
=\mu_t'(x_1)+\frac{\sigma_t'}{\sigma_t}\bigl(\psi_t-\mu_t(x_1)\bigr)
$$

把 $\psi_t$ 换成当前位置 $x$，得到条件速度

$$
u_t(x\mid x_1)
=\frac{\sigma_t'}{\sigma_t}\bigl(x-\mu_t(x_1)\bigr)+\mu_t'(x_1)
$$

这是 Flow Matching 里所有高斯路径的通用公式。

## 七、最优传输直线路径

希望粒子走直线，对应位移插值。Lipman 的 OT 条件路径取

$$
\mu_t(x_1)=t x_1,\qquad \sigma_t=1-(1-\sigma_{\min})t
$$

$\sigma_{\min}$ 很小（例如 $10^{-5}$），避免 $t=1$ 时方差数值塌零。代入上一节：

$$
\mu_t'=x_1,\qquad \sigma_t'=-(1-\sigma_{\min})
$$

$$
u_t(x\mid x_1)
=\frac{x_1-(1-\sigma_{\min})x}{1-(1-\sigma_{\min})t}
$$

$\sigma_{\min}\to 0$ 时，$x_t=(1-t)x_0+t x_1$，目标速度趋向 $x_1-x_0$。

实践里更常用独立耦合（I-CFM / Rectified Flow）：$x_0\sim p_0$、$x_1\sim q$ 独立，

$$
x_t=(1-t)x_0+t x_1,\qquad u_t(x\mid x_0,x_1)=x_1-x_0
$$

回归目标与当前位置无关，是一条常速度直线。条件路径以 $x_t$ 为中心（窄高斯或 Dirac）。CFM 损失变成

$$
\mathcal{L}(\theta)
=\mathbb{E}_{t,x_0,x_1}
\left\|v_\theta\bigl(t,(1-t)x_0+t x_1\bigr)-(x_1-x_0)\right\|^2
$$

这就是现在 VLA、DiT、SD3 / Flux 里最常见的训练目标。

Mini-batch OT 把同一 batch 里的 $(x_0,x_1)$ 按最优传输重配对，再走直线；边缘仍然正确，直线更短，通常更好拟合。

## 八、与扩散 / 分数匹配的关系

同一条高斯路径也可以用分数来写。条件分数

$$
\nabla_x\log p_t(x\mid x_1)=-\frac{x-\mu_t(x_1)}{\sigma_t^2}
$$

代回第六节，

$$
u_t(x\mid x_1)=-\sigma_t\sigma_t'\,\nabla_x\log p_t(x\mid x_1)+\mu_t'(x_1)
$$

速度场与分数只差已知的仿射变换。扩散模型学 $\nabla\log p_t$，再经概率流 ODE 采样；Flow Matching 直接学 $u_t$。路径若取 VP / VE 噪声日程，两者描述同一族概率流，只是参数化不同。

直线路径的条件速度近似常数，ODE 轨迹接近直线，少步欧拉就够。扩散的概率流往往更弯，同样网络下通常要更多函数评价。

扩散训练对应随机插值 + 分数回归；Flow Matching 对应确定性插值 + 速度回归。随机插值（stochastic interpolant）把二者放在同一框架里，这里不展开。

## 九、训练与采样

直线 I-CFM 的一步训练：

1. 抽 $x_1\sim q$、$x_0\sim\mathcal{N}(0,I)$、$t\sim\mathcal{U}[0,1]$（也可用 logit-normal 等非均匀日程）
2. 令 $x_t=(1-t)x_0+t x_1$，目标 $u^{\star}=x_1-x_0$
3. 梯度下降 $\left\|v_\theta(t,x_t)-u^{\star}\right\|^2$

采样：从 $x_0\sim p_0$ 积分

$$
\frac{dx}{dt}=v_\theta(t,x),\qquad t:0\to 1
$$

欧拉一步是 $x_{t+\Delta t}=x_t+\Delta t\cdot v_\theta(t,x_t)$。也可用中点法、Dopri5。直线路径下十几到几十步通常已够；轨迹越直，步数可以越少。

条件生成（类别、文本、观测）只需把网络写成 $v_\theta(t,x,c)$，推导不变：路径仍是 $x_0$ 与 $x_1$ 的插值，网络多看一个 $c$。

## 十、推导链条

```
连续性方程：p_t 与 u_t 必须配对
        ↓
边缘 FM：回归 u_t(x)，但 p_t、u_t 无闭式
        ↓
条件路径 p_t(x|x_1) 可构造；边缘场是条件场的后验平均
        ↓
CFM 与 FM 同梯度（交叉项把后验平均还原）
        ↓
高斯仿射流 → u_t(x|x_1) 闭式
        ↓
直线 / OT：目标退化为 x_1 − x_0
        ↓
训练：仿真无关的回归；采样：积 ODE
```

要点就一句：**边缘速度不可得，条件速度可得，而两者对网络参数的梯度相同。** 剩下的只是选一条好走的条件路径。
