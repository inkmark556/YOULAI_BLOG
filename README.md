
# CODE PHANTOM | 博客系统

## 项目简介

本项目是一个基于 **Astro** (静态站点) 和 **Node.js/Express** (内容管理后台) 的个人技术博客系统，设计风格致敬《女神异闻录5》(Persona 5)。
前端采用 **Astro** 进行静态生成，保证极速访问与 SEO 优化；后台使用 **Express** 提供文章管理、AI 辅助写作、图片上传与资源清理功能。

## 技术栈

-   **静态站点 (Public Site)**:
    -   **Astro**: 静态站点生成器 (SSG)
    -   **HTML5 / Semantic HTML**
    -   **CSS3**: 模块化设计 (Base, Layout, Components, Posts, Background FX)
    -   **JavaScript**: Vanilla ES6+
-   **后台管理 (CMS)**:
    -   **Node.js & Express**: API 服务与静态资源托管
    -   **Multer**: 图片上传处理
    -   **DeepSeek API**: AI 辅助生成标题、摘要与标签
-   **数据存储**:
    -   **JSON**: `src/content/posts.json` (文章索引)
    -   **Markdown**: `src/content/posts/*.md` (文章内容)

## 代码目录结构

```
├── admin/                  # 后台管理界面 (CMS Frontend)
│   ├── index.html          # 后台首页 (文章列表)
│   ├── editor.html         # 文章编辑器
│   └── ...
├── public/                 # 静态资源 (CSS, JS, Uploads)
│   ├── css/                # 模块化样式
│   ├── js/                 # 前端逻辑
│   ├── uploads/            # 图片上传目录
│   └── config.json         # 全局配置
├── src/                    # Astro 源码
│   ├── content/            # 文章数据
│   │   ├── posts.json      # 索引文件
│   │   └── posts/          # Markdown 源文件
│   └── pages/              # Astro 页面组件
│       ├── index.astro     # 博客主页
│       └── posts/          # 文章详情页
├── scripts/                # 自动化脚本
│   └── sync_to_github.bat  # 一键同步脚本
├── server.js               # Node.js 后端服务 (CMS Backend)
├── astro.config.mjs        # Astro 配置文件
└── package.json            # 项目依赖
```

## 混合工作流 (Hybrid Workflow)

本项目采用 **本地管理 + 云端发布** 的混合模式：

1.  **本地创作 (Local)**: 在本地运行 `server.js`，使用 Admin Dashboard 撰写文章、上传图片。
2.  **自动同步 (Sync)**: 使用 `scripts/sync_to_github.bat` 脚本将本地更改推送到 GitHub。
3.  **云端构建 (Cloud)**: Cloudflare Pages 自动检测 GitHub 更新，构建静态网站并发布。

## 快速启动 (本地开发)

1.  **安装依赖**
    ```bash
    npm install
    ```

2.  **启动服务 (双终端运行)**

    *终端 1 (后台服务 - 用于写文章):*
    ```bash
    node server.js
    ```
    > 访问: http://localhost:3000 (管理后台)

    *终端 2 (静态预览 - 用于看效果):*
    ```bash
    npm run dev
    ```
    > 访问: http://localhost:4321 (博客主页)

## 部署指南 (Cloudflare Pages)

本项目已针对 Cloudflare Pages 优化。请按照以下配置进行部署：

1.  **连接仓库**: 授权 Cloudflare 访问你的 GitHub 仓库。
2.  **构建配置 (Build Settings)**:
    -   **构建命令 (Build command)**: `npm run build`
    -   **构建输出目录 (Build output directory)**: `dist`
    -   **根目录 (Root directory)**: *(留空)*
3.  **环境变量 (Environment Variables)**:
    -   `NODE_VERSION`: `20`

## 常用脚本

-   **`cleanup.bat`**: 自动清理 `public/uploads/images` 中未被引用的孤儿图片，释放空间。

## 联系方式

-   作者：又来
-   邮箱：tenb68@126.com

## 许可

代码仅供学习与个人使用，禁止用于商业用途。
