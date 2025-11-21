// server.js - 你的后端控制中心
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// 允许跨域和解析JSON
app.use(cors());
app.use(bodyParser.json());
// 把当前文件夹作为静态资源服务器（这样你就不用 Live Server 了）
app.use(express.static(__dirname));

// 数据文件路径
const POSTS_DIR = path.join(__dirname, 'posts');
const LIST_FILE = path.join(__dirname, 'posts.json');

// --- 核心功能：接收文章上传 ---
app.post('/api/upload', (req, res) => {
    try {
        const { title, id, date, tags, summary, content } = req.body;

        // 1. 检查 posts 文件夹是否存在
        if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);

        // 2. 写入 .md 文件
        const filePath = path.join(POSTS_DIR, `${id}.md`);
        // 这里的 content 是纯 Markdown，我们直接写入
        fs.writeFileSync(filePath, content, 'utf8');

        // 3. 更新 posts.json (文章索引)
        let posts = [];
        if (fs.existsSync(LIST_FILE)) {
            posts = JSON.parse(fs.readFileSync(LIST_FILE, 'utf8'));
        }

        // 创建新的文章元数据对象
        const newPostMeta = {
            id,
            title,
            date,
            tags,
            summary
        };

        // 如果已存在同ID，则覆盖（编辑模式），否则添加到开头
        const existingIndex = posts.findIndex(p => p.id === id);
        if (existingIndex >= 0) {
            posts[existingIndex] = newPostMeta;
        } else {
            posts.unshift(newPostMeta);
        }

        fs.writeFileSync(LIST_FILE, JSON.stringify(posts, null, 2), 'utf8');

        console.log(`[SUCCESS] Article ${id} saved.`);
        res.json({ success: true, message: 'MISSION ACCOMPLISHED' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'SERVER ERROR' });
    }
});

app.listen(PORT, () => {
    console.log(`P5 Phantom Server running at http://localhost:${PORT}`);
});