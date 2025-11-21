// 引入第三方库
// marked.js 用于 Markdown 解析
// prism.js 用于代码高亮

// 1. 自动填充日期
window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('in-date').value = new Date().toISOString().split('T')[0].replace(/-/g, '.');
});

// 2. 实时预览逻辑
const input = document.getElementById('markdown-input');
const preview = document.getElementById('preview-content');
input.addEventListener('input', () => {
    const text = input.value;
    preview.innerHTML = marked.parse(text);
    Prism.highlightAllUnder(preview);
});

// 3. 快捷键插入文本逻辑
function insertText(before, after) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;
    input.value = text.substring(0, start) + replacement + text.substring(end);
    input.focus();
    input.selectionStart = start + before.length;
    input.selectionEnd = start + before.length + selected.length;
    input.dispatchEvent(new Event('input'));
}

// 4. 发布逻辑
async function publish() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:.]/g, '').slice(0, 14);
    const autoId = `post_${timestamp}`;
    const data = {
        id: autoId,
        title: document.getElementById('in-title').value,
        date: document.getElementById('in-date').value,
        tags: document.getElementById('in-tags').value,
        summary: document.getElementById('in-summary').value,
        content: input.value
    };
    if (!data.title || !data.content) {
        alert("MISSING DATA: Title and Content are required.");
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
            if (confirm("SUCCESS! Post created. Go back to Home?")) {
                window.location.href = 'index.html';
            }
        } else {
            alert("ERROR: " + result.message);
        }
    } catch (err) {
        alert("NETWORK ERROR: Is server.js running?");
    }
}

// 5. AI 自动填充逻辑
async function aiAutoFill() {
    const content = input.value;
    const btn = document.querySelector('button[title="AUTO GENERATE INFO"]');
    if (content.length < 10) {
        alert("PHANTOM AI: CONTENT TOO SHORT! (Need more data to analyze)");
        return;
    }
    const originalText = btn.innerHTML;
    btn.innerHTML = "Thinking...";
    btn.style.background = "#ccc";
    btn.disabled = true;
    try {
        const res = await fetch('/api/ai-generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content })
        });
        const result = await res.json();
        if (result.success) {
            if (!document.getElementById('in-title').value)
                document.getElementById('in-title').value = result.data.title;
            if (!document.getElementById('in-summary').value)
                document.getElementById('in-summary').value = result.data.summary;
            if (!document.getElementById('in-tags').value)
                document.getElementById('in-tags').value = result.data.tags;
            btn.style.background = "#55ff55";
            btn.innerHTML = "OK!";
            setTimeout(() => {
                btn.style.background = "var(--p5-yellow)";
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 1000);
        } else {
            alert("AI ERROR: " + result.message);
            btn.innerHTML = "ERROR";
        }
    } catch (err) {
        console.error(err);
        alert("NETWORK ERROR: Check server console.");
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}
