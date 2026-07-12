---
layout: post
title: GitHub Pages 学习站部署与笔记添加指南
date: 2026-07-12
category: 工具
tags: [GitHub Pages, Jekyll, Git, 部署, 工具文档]
---

本文档记录本站的完整部署流程，以及日常添加、更新学习笔记的操作方法，方便日后查阅。

## 一、项目概览

| 项目 | 说明 |
|------|------|
| 站点地址 | https://summerxc-66.github.io/ |
| 仓库地址 | https://github.com/SummerXC-66/SummerXC-66.github.io |
| 技术栈 | GitHub Pages + Jekyll + Markdown |
| 本地目录 | `/home/summer/Desktop/summer/mygit` |

站点采用 Jekyll 静态站点生成器，笔记以 Markdown 文件存放在 `_posts/` 目录，推送到 GitHub 后自动构建发布。

## 二、部署过程总结

### 2.1 初始化站点文件

在项目目录下创建了以下核心结构：

```
├── _config.yml        # 站点配置（标题、分类、导航等）
├── _layouts/          # 页面模板（default、post）
├── _posts/            # 学习笔记（Markdown）
├── assets/            # CSS、JS 静态资源
├── index.html         # 首页
├── notes.html         # 全部笔记列表
├── about.html         # 关于页面
├── deploy.sh          # 一键部署脚本
├── Gemfile            # 本地 Jekyll 预览依赖
└── README.md          # 项目说明
```

### 2.2 配置站点信息

编辑 `_config.yml`，填写账号相关信息：

```yaml
title: 我的学习记录
author: SummerXC-66
url: "https://SummerXC-66.github.io"
baseurl: ""
```

> `baseurl` 留空即可。仓库命名为 `用户名.github.io` 时，站点直接部署在根路径。

### 2.3 本地 Git 提交

```bash
cd /home/summer/Desktop/summer/mygit

# 首次提交需指定作者（不修改全局 git config）
GIT_AUTHOR_NAME="SummerXC-66" \
GIT_AUTHOR_EMAIL="21224466+SummerXC-66@users.noreply.github.com" \
GIT_COMMITTER_NAME="SummerXC-66" \
GIT_COMMITTER_EMAIL="21224466+SummerXC-66@users.noreply.github.com" \
git commit -m "初始化学习记录 GitHub Pages 站点"

git branch -M main
```

### 2.4 GitHub 登录与仓库创建

安装 GitHub CLI 并登录：

```bash
sudo apt install gh        # 安装 gh 命令行工具
gh auth login -w           # 浏览器授权登录
gh auth setup-git          # 让 git 使用 gh 的凭据
```

在 GitHub 创建仓库（个人主页仓库必须命名为 `用户名.github.io`）：

```bash
gh repo create SummerXC-66.github.io --public --description "我的学习记录 - GitHub Pages"
```

### 2.5 推送代码

```bash
git remote add origin https://github.com/SummerXC-66/SummerXC-66.github.io.git
git push -u origin main
```

也可使用项目自带的一键脚本：

```bash
chmod +x deploy.sh
./deploy.sh
```

### 2.6 启用 GitHub Pages

仓库创建并推送后，GitHub 通常会自动启用 Pages。如需手动确认：

1. 打开仓库 **Settings → Pages**
2. Source 选择 **Deploy from a branch**
3. Branch 选 **main**，文件夹选 **/ (root)**
4. 等待 1–3 分钟，访问 https://summerxc-66.github.io/

查看构建状态：

```bash
gh api repos/SummerXC-66/SummerXC-66.github.io/pages --jq .status
# 输出 "built" 表示构建成功
```

## 三、添加笔记流程

### 3.1 创建笔记文件

在 `_posts/` 目录新建 Markdown 文件，**命名格式必须为**：

```
YYYY-MM-DD-标题.md
```

示例：`2026-07-12-python-basics.md`

### 3.2 填写 Front Matter

文件开头必须包含 YAML 头信息：

```markdown
---
layout: post
title: 笔记标题
date: 2026-07-12
category: 编程
tags: [Python, 基础]
---

正文从这里开始...
```

**字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| `layout` | 是 | 固定填 `post` |
| `title` | 是 | 笔记标题，显示在列表和详情页 |
| `date` | 是 | 发布日期，格式 `YYYY-MM-DD` |
| `category` | 推荐 | 分类，可选值见 `_config.yml` 中的 `category_list` |
| `tags` | 可选 | 标签数组，支持首页搜索和筛选 |

**可用分类：** 编程、算法、工具、阅读、其他

### 3.3 编写正文

正文支持标准 Markdown 语法：

```markdown
## 二级标题

- 列表项
- **加粗** 和 `行内代码`

\`\`\`python
def hello():
    print("Hello!")
\`\`\`

> 引用块

| 表格 | 示例 |
|------|------|
| A    | B    |
```

### 3.4 推送发布

```bash
cd /home/summer/Desktop/summer/mygit

git add _posts/你的新笔记.md
git commit -m "添加笔记：笔记标题"
git push
```

推送后 GitHub Actions / Pages 自动重新构建，通常 **1–2 分钟** 内可在站点看到更新。

### 3.5 完整操作示例

```bash
# 1. 创建文件
cat > _posts/2026-07-12-docker-notes.md << 'EOF'
---
layout: post
title: Docker 常用命令
date: 2026-07-12
category: 工具
tags: [Docker, 容器]
---

## 镜像管理

- `docker images` — 列出本地镜像
- `docker pull nginx` — 拉取镜像
EOF

# 2. 提交并推送
git add _posts/2026-07-12-docker-notes.md
git commit -m "添加笔记：Docker 常用命令"
git push
```

## 四、本地预览（可选）

如需在推送前本地预览效果：

```bash
sudo apt install ruby-bundler jekyll   # 安装依赖
bundle install
bundle exec jekyll serve
# 浏览器打开 http://localhost:4000
```

修改文件后 Jekyll 会自动热重载，方便调试样式和内容。

## 五、常见问题

### 推送超时

若 `git push` 连接超时，可重试或检查网络：

```bash
gh auth setup-git    # 确保 git 使用 gh 凭据
git push -u origin main
```

### SSH 不可用

本机 SSH 公钥未添加到 GitHub 账号时，推送会失败。推荐使用 HTTPS + `gh auth setup-git`，无需配置 SSH。

### 笔记未显示

1. 检查文件名是否符合 `YYYY-MM-DD-标题.md` 格式
2. 检查 Front Matter 中 `layout: post` 和 `date` 是否正确
3. 确认已 `git push` 且 Pages 构建状态为 `built`

### 修改站点样式

- 全局样式：编辑 `assets/css/style.css`
- 站点配置：编辑 `_config.yml`
- 页面模板：编辑 `_layouts/` 下的 HTML 文件

## 六、日常维护速查

```bash
# 查看 Pages 构建状态
gh api repos/SummerXC-66/SummerXC-66.github.io/pages --jq '{status, html_url}'

# 拉取远程最新代码（多设备协作时）
git pull

# 查看提交历史
git log --oneline -10

# 一键部署（新建环境时使用）
./deploy.sh
```

---

> 本文档本身也是一篇 `_posts/` 笔记，遵循相同的创建和发布流程。后续若部署方式有变更，直接编辑本文件并推送即可。
