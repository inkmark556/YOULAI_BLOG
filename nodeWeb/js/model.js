// js/modal.js

const Phantom = {
    // 初始化：如果页面里没有弹窗HTML，就自动插入
    init: function () {
        if (document.getElementById('p5-modal-overlay')) return;

        const html = `
        <div id="p5-modal-overlay">
            <div class="p5-modal-box">
                <div class="p5-modal-header">
                    <span id="p5-modal-title">NOTICE</span>
                </div>
                <div class="p5-modal-content" id="p5-modal-text"></div>
                <div class="p5-modal-footer" id="p5-modal-actions"></div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', html);

        // 缓存DOM元素
        this.overlay = document.getElementById('p5-modal-overlay');
        this.titleEl = document.getElementById('p5-modal-title');
        this.textEl = document.getElementById('p5-modal-text');
        this.actionsEl = document.getElementById('p5-modal-actions');
    },

    // 关闭弹窗
    close: function () {
        if (this.overlay) this.overlay.classList.remove('active');
    },

    // --- 替代 alert() ---
    alert: function (msg, title = "PHANTOM NOTICE") {
        this.init();
        this.titleEl.innerText = title;
        this.textEl.innerText = msg;
        // 只有一个 OK 按钮
        this.actionsEl.innerHTML = `<button class="p5-modal-btn primary" onclick="Phantom.close()">OK</button>`;
        this.overlay.classList.add('active');
    },

    // --- 替代 confirm() ---
    // 注意：原生confirm是阻塞的，这里变成了回调函数 (callback) 模式
    confirm: function (msg, onConfirm, title = "CONFIRMATION") {
        this.init();
        this.titleEl.innerText = title;
        this.textEl.innerText = msg;

        this.actionsEl.innerHTML = '';

        // 创建取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'p5-modal-btn cancel';
        cancelBtn.innerText = 'CANCEL';
        cancelBtn.onclick = () => { this.close(); };

        // 创建确认按钮
        const okBtn = document.createElement('button');
        okBtn.className = 'p5-modal-btn primary';
        okBtn.innerText = 'YES, DO IT';
        okBtn.onclick = () => {
            this.close();
            if (onConfirm) onConfirm(); // 执行回调
        };

        this.actionsEl.appendChild(cancelBtn);
        this.actionsEl.appendChild(okBtn);

        this.overlay.classList.add('active');
    }
};