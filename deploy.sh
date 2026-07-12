#!/usr/bin/env bash
set -euo pipefail

REPO="SummerXC-66.github.io"
REMOTE="https://github.com/SummerXC-66/${REPO}.git"

cd "$(dirname "$0")"

if ! gh auth status >/dev/null 2>&1; then
  echo "请先登录 GitHub："
  echo "  gh auth login -w"
  echo "或访问 https://github.com/login/device 输入设备码完成授权"
  exit 1
fi

if ! gh repo view "$REPO" >/dev/null 2>&1; then
  echo "创建仓库 ${REPO} ..."
  gh repo create "$REPO" --public --description "我的学习记录 - GitHub Pages"
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE"
else
  git remote add origin "$REMOTE"
fi

git branch -M main
git push -u origin main

echo ""
echo "推送完成！正在检查 GitHub Pages 状态..."
sleep 5
gh api "repos/SummerXC-66/${REPO}/pages" 2>/dev/null || echo "请在 GitHub 仓库 Settings → Pages 中确认 Source 为 main 分支 / (root)"

echo ""
echo "站点地址: https://SummerXC-66.github.io"
echo "仓库地址: https://github.com/SummerXC-66/${REPO}"
