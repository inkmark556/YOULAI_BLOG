# CODE PHANTOM | 博客系统

## 项目简介

本项目是一个基于 Node.js 的个人程序博客系统，前端采用原生 HTML/CSS/JS，后端使用简单的 Express 服务，支持文章管理、分类筛选、隐藏编辑器等功能。技术笔记与项目分享。

## 目录结构

```
├── index.html           # 首页，展示文章列表与分类筛选
├── post.html            # 文章详情页，支持 Markdown 渲染
├── posts.json           # 文章数据列表（由后端维护）
├── server.js            # Node.js 后端服务，提供 API 支持
├── package.json         # Node.js 项目依赖与脚本
├── posts/               # 文章内容（Markdown 格式）
│   ├── unity_001.md
│   ├── unity_002.md
│   ├── unity_003.md
│   └── about.md         # 个人介绍页
└── .gitignore           # Git 忽略文件
```

## 功能说明

- 文章列表展示与分类筛选（支持 Unity、Shader、多人联机、VR/AR 等标签）
- 文章详情页支持 Markdown 格式渲染
- 隐藏编辑器（通过特殊按键触发，支持新文章发布）
- 文章数据存储于 `posts.json`，内容存储于 `posts/` 目录下
- 后端 API 支持文章上传与数据同步
- 响应式布局，适配 PC 与移动端

## 快速启动

1. 安装依赖

```bash
npm install
```

2. 启动服务

```bash
node server.js
```

3. 浏览器访问

```
http://localhost:3000
```

## 文章发布

- 普通用户仅浏览，无需登录。
- 管理员可通过隐藏编辑器（输入 A-B-A-B-上-下-上-下 组合键）发布新文章。
- 新文章会自动写入 `posts.json` 并保存 Markdown 内容到 `posts/` 目录。

## 主要文件说明

- `index.html`：博客首页，包含文章列表、分类筛选、侧边栏信息、隐藏编辑器入口。
- `post.html`：文章详情页，通过 URL 参数 `id` 加载对应 Markdown 内容。
- `server.js`：Node.js 后端，负责 API 路由、文章上传、静态资源服务。
- `posts.json`：文章元数据列表，包含 id、标题、日期、标签、摘要等。
- `posts/*.md`：每篇文章的 Markdown 内容文件。
- `.gitignore`：忽略 node_modules、日志、打包输出等。

## 特色功能

- 支持文章分类筛选，标签可自定义扩展
- 隐藏编辑器带弹性动画，支持 Markdown 编辑与预览
- 作弊码触发隐藏编辑器，提升趣味性与安全性
- 响应式设计，适配多终端
- 侧边栏展示作者信息、联系方式（含 QQ）、标签云

## 联系方式

- 作者：刘明亮
- QQ：17877729102
- 邮箱：tenb68@126.com
- 地点：湖南长沙

## 适用场景

- 个人技术博客、游戏开发笔记、项目展示
- Unity/Shader/多人联机/VR/AR 技术分享
- 轻量级文章管理与发布

## 贡献与许可

欢迎交流、建议与合作。代码仅供学习与个人使用，禁止用于商业用途。

---

如有问题或建议，请通过 QQ 或邮箱联系作者。
