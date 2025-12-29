
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
├── server.js               # Node.js 后端服务 (CMS Backend)
├── astro.config.mjs        # Astro 配置文件
└── package.json            # 项目依赖
```

## 功能说明

-   **双端架构**:
    -   **前台 (Port 4321)**: 纯静态展示，无管理按钮，沉浸式阅读体验。
    -   **后台 (Port 3000)**: 完整的文章增删改查 (CRUD) 功能。
-   **P5 风格 UI**: 独特的黑红白配色，动态背景与微交互动画。
-   **AI 辅助写作**: 集成 DeepSeek API，一键生成文章元数据。
-   **资源清理**: 提供自动化脚本 (`cleanup.bat`) 清理未引用的孤儿图片。
-   **响应式设计**: 完美适配桌面端与移动端。

## 快速启动

1.  **安装依赖**
    ```bash
    npm install
    ```

2.  **启动服务 (双终端运行)**

    *终端 1 (后台服务):*
    ```bash
    node server.js
    ```
    > 访问: http://localhost:3000 (管理后台)

    *终端 2 (静态站点):*
    ```bash
    npm run dev
    ```
    > 访问: http://localhost:4321 (博客主页)

## 文章发布与管理

1.  访问 **http://localhost:3000** 进入管理后台。
2.  点击 **+ NEW LOG** 新建文章，或点击 **EDIT** 修改现有文章。
3.  在编辑器中输入 Markdown 内容，支持 **AI 生成** 元数据。
4.  点击 **发布文章**，数据将自动同步到 `src/content/`。
5.  刷新 **http://localhost:4321** 查看更新。

## 资源清理

运行根目录下的 `cleanup.bat` 脚本，可自动检测并删除 `public/uploads/images` 中未被引用的图片文件，释放存储空间。

## 联系方式

-   作者：又来
-   邮箱：tenb68@126.com

## 许可

代码仅供学习与个人使用，禁止用于商业用途。
