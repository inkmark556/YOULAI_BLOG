# 社交媒体配置说明

本文档说明如何配置博客侧边栏的社交媒体链接。

## 配置文件位置

配置文件位于项目根目录：`config.json`

## 配置项说明

### 1. 个人信息 (owner)

```json
"owner": {
  "name": "又来",                    // 显示的昵称
  "title": "Unity Developer",       // 职位/标签
  "avatar": "posts/头像.jpg",       // 头像路径
  "bio": "游戏开发者 / Unity 技术爱好者"  // 个人简介（暂未使用）
}
```

### 2. 社交媒体链接 (social)

每个社交媒体需要配置以下内容：

```json
"social": {
  "平台名称": {
    "url": "链接地址",      // 点击图标后跳转的 URL
    "icon": "图标类名",     // Font Awesome 图标类名
    "label": "显示标签"     // 鼠标悬停时的提示文字
  }
}
```

### 3. 页脚信息 (footer)

```json
"footer": {
  "copyright": "© 2025 LIU MINGLIANG.",        // 版权信息
  "marquee": "滚动文字内容..."                 // 页脚滚动文字
}
```

---

## 如何配置社交媒体链接

### GitHub

```json
"github": {
  "url": "https://github.com/你的用户名",
  "icon": "fab fa-github",
  "label": "GitHub"
}
```

### Instagram

```json
"instagram": {
  "url": "https://instagram.com/你的用户名",
  "icon": "fab fa-instagram",
  "label": "Instagram"
}
```

### QQ

有两种方式：

**方式1：QQ 临时会话链接**
```json
"qq": {
  "url": "https://wpa.qq.com/msgrd?v=3&uin=你的QQ号&site=qq&menu=yes",
  "icon": "fab fa-qq",
  "label": "QQ"
}
```

**方式2：QQ 群二维码/加好友链接**
```json
"qq": {
  "url": "https://qm.qq.com/q/SpmhrQhzi0",
  "icon": "fab fa-qq",
  "label": "QQ"
}
```

> 获取 QQ KEY：在 QQ 中生成加好友链接或群二维码，链接中的 `k=` 后面的部分即为 KEY

### 邮箱

```json
"email": {
  "url": "mailto:your.email@example.com",
  "icon": "fas fa-envelope",
  "label": "Email"
}
```

---

## Font Awesome 图标参考

常用的社交媒体图标类名：

| 平台 | 图标类名 |
|------|---------|
| GitHub | `fab fa-github` |
| Instagram | `fab fa-instagram` |
| QQ | `fab fa-qq` |
| 微信 | `fab fa-weixin` |
| 微博 | `fab fa-weibo` |
| Twitter/X | `fab fa-x-twitter` 或 `fab fa-twitter` |
| Facebook | `fab fa-facebook` |
| LinkedIn | `fab fa-linkedin` |
| YouTube | `fab fa-youtube` |
| Bilibili | 自定义（无官方图标） |
| 邮箱 | `fas fa-envelope` |
| 网站 | `fas fa-globe` |
| Discord | `fab fa-discord` |

> 完整图标列表：https://fontawesome.com/search?o=r&m=free

---

## 添加/删除社交媒体链接

### 添加新的社交媒体

在 `config.json` 的 `social` 对象中添加新项：

```json
"social": {
  "github": { ... },
  "instagram": { ... },
  "新平台名称": {
    "url": "https://...",
    "icon": "fab fa-icon-name",
    "label": "平台名称"
  }
}
```

### 删除社交媒体

直接删除 `social` 对象中对应的项即可。

### 调整显示顺序

社交媒体图标按照在 `config.json` 中的顺序显示，调整顺序只需调整 JSON 中的顺序。

---

## 示例：完整配置

```json
{
  "owner": {
    "name": "又来",
    "title": "Unity Developer",
    "avatar": "posts/头像.jpg",
    "bio": "游戏开发者 / Unity 技术爱好者"
  },
  "social": {
    "github": {
      "url": "https://github.com/yourusername",
      "icon": "fab fa-github",
      "label": "GitHub"
    },
    "bilibili": {
      "url": "https://space.bilibili.com/你的UID",
      "icon": "fas fa-play-circle",
      "label": "Bilibili"
    },
    "qq": {
      "url": "https://wpa.qq.com/msgrd?v=3&uin=你的QQ号&site=qq&menu=yes",
      "icon": "fab fa-qq",
      "label": "QQ"
    },
    "email": {
      "url": "mailto:your.email@example.com",
      "icon": "fas fa-envelope",
      "label": "Email"
    }
  },
  "footer": {
    "copyright": "© 2025 YOUR NAME.",
    "marquee": "LATEST UPDATE: NEW FEATURES RELEASED +++"
  }
}
```

---

## 注意事项

1. **JSON 格式**：确保 JSON 格式正确，最后一项不要有逗号
2. **链接测试**：配置后在浏览器中测试链接是否有效
3. **图标显示**：如果图标没有显示，检查图标类名是否正确
4. **刷新页面**：修改 `config.json` 后需要刷新页面才能看到效果

---

## 故障排查

**问题：社交媒体图标不显示**
- 检查浏览器控制台是否有 JavaScript 错误
- 确认 `config.json` 格式正确（可使用 JSON 验证工具）
- 确认 Font Awesome CDN 加载成功

**问题：图标显示为方框**
- 图标类名可能错误，参考 Font Awesome 官网
- Font Awesome CDN 可能被屏蔽，尝试更换 CDN 源

**问题：点击链接无反应**
- 检查 URL 格式是否正确
- 某些链接需要特定格式（如 `mailto:`、`https://`等）
