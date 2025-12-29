// server.js - 你的后端控制中心
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const PORT = 3000;
require('dotenv').config(); // 新增这行
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY; // 改成这行

// 配置图片上传存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads', 'images');
        // 确保目录存在
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名：时间戳 + 随机数 + 原扩展名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 文件过滤器：只允许图片类型
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('只支持上传图片文件 (jpg, jpeg, png, gif, webp)'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

// 允许跨域和解析JSON
app.use(cors());
app.use(bodyParser.json());
// 把当前文件夹作为静态资源服务器（这样你就不用 Live Server 了）
app.use(express.static(__dirname));
// 允许访问上传的图片
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 数据文件路径
const POSTS_DIR = path.join(__dirname, 'posts');
const LIST_FILE = path.join(__dirname, 'posts.json');

// --- 图片上传接口 ---
app.post('/api/upload-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: '没有上传文件' });
        }

        // 返回图片的访问路径
        const imageUrl = `/uploads/images/${req.file.filename}`;

        console.log(`[IMAGE UPLOADED] ${req.file.filename}`);
        res.json({
            success: true,
            url: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('上传错误:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- 新增：删除文章接口 (server.js) ---
app.post('/api/delete', (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.json({ success: false, message: "No ID provided" });

        // 1. 读取 posts.json
        let posts = [];
        if (fs.existsSync(LIST_FILE)) {
            posts = JSON.parse(fs.readFileSync(LIST_FILE, 'utf8'));
        }

        // 2. 过滤掉要删除的文章
        const newPosts = posts.filter(p => p.id !== id);
        fs.writeFileSync(LIST_FILE, JSON.stringify(newPosts, null, 2), 'utf8');

        // 3. 删除对应的 .md 文件
        const filePath = path.join(POSTS_DIR, `${id}.md`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        console.log(`[DELETED] Article ${id} removed.`);
        res.json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "DELETE FAILED" });
    }
});

// --- 核心功能：接收文章上传 ---
app.post('/api/upload', (req, res) => {
    try {
        const { title, id, date, tags, summary, content, cover } = req.body;
        console.log(`[API] Upload request received for ${id}. Cover: ${cover}`);

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
            summary,
            cover
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

// --- AI 辅助生成接口 (接入 DeepSeek) ---
app.post('/api/ai-generate', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.json({ success: false, message: "NO CONTENT" });

        console.log("正在呼叫 DeepSeek...");

        // 1. 构造 Prompt（提示词）
        // 我们要求 AI 必须返回严格的 JSON 格式，这样前端才好填空
        const systemPrompt = `
        你是一个专业的Unity技术博客助手。请分析用户输入的 Markdown 文章内容，并提取/生成以下元数据。
        请严格按照 JSON 格式返回，不要包含 markdown 代码块标记（如 \`\`\`json）。
        JSON 结构如下：
        {
            "title": "提取或生成一个吸引人的标题",
            "summary": "生成一段80字以内的精炼摘要",
            "tags": "提取1-3个相关技术标签，全大写，用 ' / ' 分隔 (例如: UNITY / SHADER / C#)"
        }
        `;

        // 2. 发送请求给 DeepSeek API
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat", // 或者 deepseek-coder
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: content }
                ],
                temperature: 0.7, // 稍微有一点创造性
                max_tokens: 500
            })
        });

        // 3. 处理 API 返回
        if (!response.ok) {
            const errText = await response.text();
            console.error("DeepSeek API Error:", errText);
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const aiContent = data.choices[0].message.content.trim();

        // 4. 解析 AI 返回的 JSON 字符串
        // 有时候 AI 会手贱加上 ```json ... ```，我们需要清洗一下
        let cleanJson = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();

        let metaData;
        try {
            metaData = JSON.parse(cleanJson);
        } catch (e) {
            console.error("JSON Parse Error. AI returned:", aiContent);
            // 如果解析失败，做个降级处理，直接把原始文本塞回去
            metaData = {
                title: "AI Parsing Error",
                summary: aiContent,
                tags: "ERROR"
            };
        }

        console.log("DeepSeek 响应成功:", metaData);

        // 5. 返回给前端
        res.json({
            success: true,
            data: {
                title: metaData.title,
                summary: metaData.summary,
                tags: metaData.tags
            }
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, message: "AI CONNECTION FAILED" });
    }
});

// --- 资源清理接口 ---
app.post('/api/cleanup', (req, res) => {
    try {
        console.log("[CLEANUP] Starting resource cleanup...");

        // 1. 获取所有上传的图片
        const uploadDir = path.join(__dirname, 'uploads', 'images');
        if (!fs.existsSync(uploadDir)) {
            return res.json({ success: true, message: "No uploads directory found.", deleted: [], spaceReclaimed: 0 });
        }

        const allFiles = fs.readdirSync(uploadDir);
        const imageFiles = allFiles.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));

        console.log(`[CLEANUP] Found ${imageFiles.length} images in uploads.`);

        // 2. 收集所有引用
        const referencedFiles = new Set();

        // 2.1 从 posts.json 中收集封面引用
        if (fs.existsSync(LIST_FILE)) {
            const posts = JSON.parse(fs.readFileSync(LIST_FILE, 'utf8'));
            posts.forEach(post => {
                if (post.cover) {
                    const filename = path.basename(post.cover);
                    referencedFiles.add(filename);
                }
            });
        }

        // 2.2 从 posts/*.md 中收集内容引用
        if (fs.existsSync(POSTS_DIR)) {
            const mdFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
            mdFiles.forEach(mdFile => {
                const content = fs.readFileSync(path.join(POSTS_DIR, mdFile), 'utf8');
                // 匹配 Markdown 图片: ![alt](/uploads/images/filename)
                const mdRegex = /\/uploads\/images\/([^\s)]+)/g;
                let match;
                while ((match = mdRegex.exec(content)) !== null) {
                    referencedFiles.add(match[1]);
                }

                // 匹配 HTML 图片: <img src="/uploads/images/filename">
                const htmlRegex = /src=["']\/uploads\/images\/([^"']+)["']/g;
                while ((match = htmlRegex.exec(content)) !== null) {
                    referencedFiles.add(match[1]);
                }
            });
        }

        console.log(`[CLEANUP] Found ${referencedFiles.size} referenced images.`);

        // 3. 找出未引用的图片并删除
        const deletedFiles = [];
        let spaceReclaimed = 0;

        imageFiles.forEach(file => {
            if (!referencedFiles.has(file)) {
                const filePath = path.join(uploadDir, file);
                const stats = fs.statSync(filePath);
                spaceReclaimed += stats.size;

                fs.unlinkSync(filePath);
                deletedFiles.push(file);
                console.log(`[CLEANUP] Deleted orphan: ${file}`);
            }
        });

        // 格式化空间大小
        const formatSize = (bytes) => {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        res.json({
            success: true,
            message: `Cleanup complete. Deleted ${deletedFiles.length} files.`,
            deleted: deletedFiles,
            spaceReclaimed: formatSize(spaceReclaimed)
        });

    } catch (error) {
        console.error("[CLEANUP] Error:", error);
        res.status(500).json({ success: false, message: "Cleanup failed: " + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`P5 Phantom Server running at http://localhost:${PORT}`);
});