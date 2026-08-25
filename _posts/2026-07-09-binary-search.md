---
layout: post
title: 二分查找模板与常见变形
date: 2026-07-09
category: 算法
tags: [算法]
---

二分查找是算法面试中的高频考点，掌握统一模板可以避免边界 bug。

## 基础模板

```python
def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

## 关键细节

1. **循环条件**：`left <= right`（闭区间）或 `left < right`（开区间），二者选其一并保持一致
2. **中点计算**：用 `left + (right - left) // 2` 防止溢出
3. **边界更新**：`left = mid + 1` 和 `right = mid - 1`，避免死循环

## 常见变形

- 查找第一个等于 target 的位置 → 找到后不立即返回，继续向左缩
- 查找最后一个等于 target 的位置 → 找到后继续向右缩
- 旋转数组搜索 → 先判断哪半边有序，再决定搜索方向

## 练习建议

先在 LeetCode 上刷通 #34、#33、#153 三道经典题，再扩展到其他变形。
