import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    // 纯静态站点不需要 adapter，Cloudflare Pages 会自动托管 dist 目录
    output: 'static',
});