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
// server.js - DeepSeek 接入版

// ... (前面的引入保持不变)

// ★★★ 请在这里填入你的 DeepSeek API Key ★★★
const DEEPSEEK_API_KEY = "sk-25ca1265fd004d0fae0d7eeebf8c6d31";

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

// ... (后面的 app.listen 保持不变)
app.listen(PORT, () => {
    console.log(`P5 Phantom Server running at http://localhost:${PORT}`);
});