
// editor.js 新版：支持新建与编辑模式
const input = document.getElementById('markdown-input');
const preview = document.getElementById('preview-content');
let currentEditingId = null;

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('in-date').value = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('id');
    if (editId) {
        await loadPostForEdit(editId);
    }
});

// 加载已有文章
async function loadPostForEdit(id) {
    try {
        const listRes = await fetch('/posts.json');
        const posts = await listRes.json();
        const meta = posts.find(p => p.id === id);
        if (!meta) {
            alert("POST NOT FOUND IN INDEX!");
            return;
        }
        const contentRes = await fetch(`/posts/${id}.md`);
        const content = await contentRes.text();
        document.getElementById('in-title').value = meta.title;
        document.getElementById('in-date').value = meta.date;
        document.getElementById('in-tags').value = Array.isArray(meta.tags) ? meta.tags.join(' / ') : meta.tags;
        document.getElementById('in-summary').value = meta.summary;
        input.value = content;
        currentEditingId = id;
        input.dispatchEvent(new Event('input'));
        document.querySelector('.editor-header div div:nth-child(2)').innerText = "EDIT MODE: " + id;
        document.querySelector('.btn-publish').innerText = "UPDATE LOG";
    } catch (err) {
        console.error(err);
        alert("FAILED TO LOAD POST DATA");
    }
}

// 实时预览
input.addEventListener('input', () => {
    preview.innerHTML = marked.parse(input.value);
    Prism.highlightAllUnder(preview);
});

// 快捷插入
function insertText(before, after) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    const selected = text.substring(start, end);
    input.value = text.substring(0, start) + (before + selected + after) + text.substring(end);
    input.focus();
    input.selectionStart = start + before.length;
    input.selectionEnd = start + before.length + selected.length;
    input.dispatchEvent(new Event('input'));
}

// editor.js 中的 publish 函数

async function publish() {
    let finalId;
    if (currentEditingId) {
        finalId = currentEditingId;
    } else {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[-T:.]/g, '').slice(0, 14);
        finalId = `post_${timestamp}`;
    }

    const data = {
        id: finalId,
        title: document.getElementById('in-title').value,
        date: document.getElementById('in-date').value,
        tags: document.getElementById('in-tags').value,
        summary: document.getElementById('in-summary').value,
        content: input.value
    };

    if (!data.title || !data.content) {
        Phantom.alert("MISSING DATA: Title and Content are required.", "DATA ERROR");
        return;
    }

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();

        if (result.success) {
            const msg = currentEditingId ? "LOG UPDATED!" : "NEW LOG CREATED!";
            Phantom.confirm(msg + "\nReturn to Home?", () => {
                // 修改为返回上一级 ../index.html
                window.location.href = '../index.html';
            }, "MISSION COMPLETE");
        } else {
            Phantom.alert("ERROR: " + result.message, "SERVER ERROR");
        }
    } catch (err) {
        Phantom.alert("NETWORK ERROR: Is server.js running?", "CONNECTION LOST");
    }
}
// AI 自动填充逻辑（保持原样）
async function aiAutoFill() {
    const content = input.value;
    const btn = document.querySelector('button[title="AUTO GENERATE INFO"]');
    if (content.length < 10) { alert("TOO SHORT"); return; }
    btn.innerHTML = "Thinking..."; btn.disabled = true;
    try {
        const res = await fetch('/api/ai-generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
        const result = await res.json();
        if (result.success) {
            if (!document.getElementById('in-title').value) document.getElementById('in-title').value = result.data.title;
            if (!document.getElementById('in-summary').value) document.getElementById('in-summary').value = result.data.summary;
            if (!document.getElementById('in-tags').value) document.getElementById('in-tags').value = result.data.tags;
            btn.innerHTML = "OK!";
        } else { alert("AI ERROR"); }
    } catch (e) { alert("NET ERROR"); }
    btn.disabled = false; btn.innerHTML = "⚡ AI GEN";
}
