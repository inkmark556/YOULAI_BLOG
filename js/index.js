// js/index.js

// 全局变量
let allPostsCache = [];
let currentFilteredPosts = []; // 当前筛选后的所有文章
let currentPage = 1;
const ITEMS_PER_PAGE = 5; // 每页显示几篇文章

// 1. 初始化
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    const container = document.getElementById('blog-list-container');
    try {
        const res = await fetch('posts.json');
        if (!res.ok) throw new Error("JSON NOT FOUND");
        allPostsCache = await res.json();

        // 初始状态：显示所有文章
        currentFilteredPosts = allPostsCache;
        renderPage(1);

        // 加载社交媒体链接
        loadSocialLinks();
    } catch (err) {
        container.innerHTML = `
            <div style="background:var(--p5-black); color:white; padding:20px; border:2px solid red; transform:rotate(-2deg);">
                <h2 style="font-family:'Bangers'; color:red;">CONNECTION ERROR</h2>
                <p>无法连接到 Phantom Network (posts.json).</p>
                <p>请确保已运行: node server.js</p>
            </div>
        `;
    }
}

// 加载社交媒体链接
async function loadSocialLinks() {
    try {
        const res = await fetch('config.json');
        if (!res.ok) return; // 如果配置文件不存在，静默失败

        const config = await res.json();
        const container = document.getElementById('social-links-container');

        if (!container || !config.social) return;

        // 生成社交媒体图标
        container.innerHTML = '';
        Object.entries(config.social).forEach(([key, social]) => {
            const link = document.createElement('a');
            link.href = social.url;
            link.className = 'social-link';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.title = social.label;
            link.innerHTML = `<i class="${social.icon}"></i>`;
            container.appendChild(link);
        });
    } catch (err) {
        console.error('Failed to load social links:', err);
    }
}


// 2. 核心：渲染当前页
function renderPage(page) {
    const container = document.getElementById('blog-list-container');
    const pagination = document.getElementById('pagination-controls');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const indicator = document.getElementById('page-indicator');

    // 计算分页数据
    const totalPosts = currentFilteredPosts.length;
    const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);

    // 边界检查
    if (page < 1) page = 1;
    if (page > totalPages && totalPages > 0) page = totalPages;
    currentPage = page;

    container.innerHTML = '';

    if (totalPosts === 0) {
        container.innerHTML = `<h2 style="color:white; font-family:'Bangers'; margin-top:50px;">NO DATA FOUND...</h2>`;
        pagination.style.display = 'none';
        return;
    }

    // 切片：获取当前页的数据
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const postsToShow = currentFilteredPosts.slice(start, end);

    // 渲染文章卡片
    container.style.opacity = 0;
    postsToShow.forEach(post => {
        let tagsDisplay = Array.isArray(post.tags) ? post.tags.join(' / ') : post.tags;

        // 注意：这里增加了 onclick="event.stopPropagation()" 防止点击按钮时触发卡片跳转
        // js/index.js 部分修改 (找到 renderPage 函数中的 html 模板部分)

        // ...
        const html = `
    <article class="post-entry" onclick="location.href='html/post.html?id=${post.id}'">
        <div class="post-content-wrap">
            <div class="post-meta">${post.date} <span class="post-tag">${tagsDisplay}</span></div>
            <h2 class="post-title">${post.title}</h2>
            <p class="post-summary">${post.summary}</p>
        </div>
        
        <div class="card-actions">
            <button class="action-mini-btn btn-edit" 
                onclick="event.stopPropagation(); location.href='html/editor.html?id=${post.id}'">
                EDIT
            </button>
            <button class="action-mini-btn btn-del" 
                onclick="event.stopPropagation(); deletePost('${post.id}')">
                DELETE
            </button>
        </div>
    </article>
`;
        // ...
        container.innerHTML += html;
    });
    // 淡入动画
    setTimeout(() => { container.style.opacity = 1; }, 50);

    // 更新分页控件状态
    pagination.style.display = 'flex';
    indicator.innerText = `${currentPage} / ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// 3. 翻页功能
function changePage(direction) {
    renderPage(currentPage + direction);
    // 翻页后滚动到顶部
    document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
}

// 4. 筛选功能
function filterPosts(category) {
    // 按钮高亮逻辑
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtnId = category === 'HOME' ? 'btn-home' : `btn-${category.toLowerCase()}`;
    const activeBtn = document.getElementById(activeBtnId);
    if (activeBtn) activeBtn.classList.add('active');

    // 筛选逻辑
    if (category === 'HOME') {
        currentFilteredPosts = allPostsCache;
    } else {
        currentFilteredPosts = allPostsCache.filter(post => {
            const tagsStr = Array.isArray(post.tags) ? post.tags.join(' ') : post.tags;
            return tagsStr.toLowerCase().includes(category.toLowerCase());
        });
    }

    // 重置到第一页并渲染
    renderPage(1);
}

// js/index.js 中的 deletePost 函数

async function deletePost(id) {
    // 使用 Phantom.confirm 替代原生 confirm
    // 参数：提示文字，点击确定的回调函数，标题
    Phantom.confirm("ARE YOU SURE TO DELETE THIS LOG? (Irreversible)", async () => {

        // --- 原有的删除逻辑开始 ---
        try {
            const res = await fetch('/api/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });

            const result = await res.json();

            if (result.success) {
                // 更新本地缓存并重新渲染
                allPostsCache = allPostsCache.filter(p => p.id !== id);

                // 刷新当前分类的过滤列表
                const currentCategory = document.querySelector('.menu-btn.active').id.replace('btn-', '').toUpperCase();
                if (currentCategory === 'HOME') {
                    currentFilteredPosts = allPostsCache;
                } else {
                    currentFilteredPosts = currentFilteredPosts.filter(p => p.id !== id);
                }

                // 如果当前页数据空了，且不是第一页，就往前翻
                if (currentFilteredPosts.length > 0) {
                    const totalPages = Math.ceil(currentFilteredPosts.length / ITEMS_PER_PAGE);
                    if (currentPage > totalPages) currentPage = totalPages;
                } else {
                    // 如果删光了
                    currentPage = 1;
                }

                renderPage(currentPage);

                // 可选：删除成功也弹个提示
                // Phantom.alert("Target Eliminated.", "SUCCESS"); 

            } else {
                Phantom.alert("DELETE FAILED: " + result.message, "ERROR"); // 替换原生 alert
            }
        } catch (err) {
            Phantom.alert("NETWORK ERROR: Is server running?", "ERROR"); // 替换原生 alert
            console.error(err);
        }
        // --- 原有的删除逻辑结束 ---

    }, "WARNING"); // 弹窗标题
}

