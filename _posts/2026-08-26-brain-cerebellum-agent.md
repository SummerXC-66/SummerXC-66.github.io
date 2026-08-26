---
layout: post
title: Brain–小脑(VLA Locomotion)–Agent 整体算法架构
date: 2026-08-26
category: 具身大模型算法
tags: [具身大模型算法, VLA, Agent]
---

三层各干一件事：**Brain 想目标，小脑走路，Agent 管闭环**。Brain 慢、可打断；小脑快、要稳；Agent 不产动作。

Brain 用 [Qwen3-VL](/notes/2026/08/24/qwen3-vl/)；小脑走 [π\*0.6 RECAP](/notes/2026/08/24/pi06-recap/)；仿真 / 真机接 [Isaac](/notes/2026/08/24/embodied-sim/) 和 [ROS 2](/notes/2026/08/24/ros2-notes/)。

## 一、分层

VLM 直接出关节频率对不上：推理 1–2 Hz，平衡要 50 Hz 以上。

| 层 | 频率 | 模型 | 只输出 |
|----|------|------|--------|
| **Agent** | 事件驱动 | 状态机 | 当前技能、是否重规划 |
| **Brain** | 0.5–2 Hz | Qwen3-VL | 子目标、成功判据 |
| **小脑** | 20–50 Hz | VLA + action expert | 速度 / 关节指令 |

小脑下面再跟一层 PD / WBC。Brain 不碰力矩。

## 二、回路

```
任务 → Agent
         │ 必要时问 Brain：下一步子目标
         ▼
      SkillCmd（技能 + 短指令 + 约束）
         ▼
      小脑 π(a | o, skill) → PD / 电机
         ▼
      Status（完成 / 卡住 / 摔倒）→ Agent
         │
         ├─ 成功 → 下一子目标
         ├─ 卡住 → 重规划（叫 Brain）
         └─ 摔倒 → recover（不叫 Brain）
```

Brain 只在新任务、卡住、场景突变时调用。其余时间小脑自己跟当前技能。

## 三、层间协议

小脑只认短指令，不吃长对话。

| 方向 | 内容 |
|------|------|
| Agent → 小脑 | `skill`（walk_to / stop / recover…）+ 一句话 + 限速等约束 |
| 小脑 → Agent | `done` / `stuck` / `fallen` / `reject` |
| Brain → Agent | 子目标列表：一句话 + 技能 + 怎样算成功 |

摔倒或 `reject` 时强制 `recover`，不要重发原指令。部署时 RECAP 条件固定为 **positive**。

## 四、训练

三层分开训，不要一上来端到端。

```
小脑站住（示范 → SFT → RECAP）
    → Brain 会拆任务（轨迹标子目标 → JSON）
    → Agent 状态机先写死
    → 再联合：冻结小脑，上机数据按 RECAP 从预训练重训
```

数据与 π\*0.6 相同：示范、自主（成败都留）、专家纠正。奖励稀疏：中途 `-1`，成功 `0`，失败 `-C_fail`。

## 五、落地

```
规则跟踪能走到路点
    → 小脑换成 VLA
    → 接 Qwen3-VL 出子目标
    → 真机只先做 stop / walk / recover
```

以后加楼梯、操作臂，只往技能表里加项，Brain 接口不变。
