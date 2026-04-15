# 线上 Lighthouse 性能优化方案

## 当前状态

| 指标 | 本地 | 线上（热启动） |
|---|---|---|
| Performance | **98** | 40 |
| Accessibility | **100** | **100** |
| Best Practices | **100** | 54 |
| SEO | 92 | **100** |
| TTFB | 132ms | **1927ms** |

### 性能拆解（线上）

| 指标 | 值 | 分数 | 权重 | 根因 |
|---|---|---|---|---|
| TBT | 680ms | 9 | 30% | CF challenge-platform 脚本阻塞 720ms |
| LCP | 3.0s | 34 | 25% | TTFB 2s + SSR 无缓存 |
| FCP | 3.0s | 7 | 10% | 同 LCP，首字节到达太晚 |
| SI | 3.9s | 4 | 10% | TTFB 拖慢整体视觉进度 |
| CLS | 0.006 | 100 | 25% | ✅ 无问题 |

---

## 根因分析

### 1. TTFB 过高（1.9-3s）→ 影响 LCP/FCP/SI

当前 landing page 响应头：
```
Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
```

虽然 `page.tsx` 设了 `revalidate = 3600`，但 OpenNext/CF Workers 输出的是 `no-cache`。**每次请求都走 Worker SSR**，没有边缘缓存。

### 2. CF challenge-platform 脚本（720ms 阻塞）→ 影响 TBT

Cloudflare 的 Bot Management / Turnstile challenge 脚本：
- 脚本执行时间：1439ms
- 主线程阻塞：720ms（单个 Long Task）
- 这是 TBT 的主要来源

### 3. 第三方脚本 → 影响 TBT + Best Practices

- Google Sign-In SDK（`accounts.google.com/gsi/client`）：引入第三方 cookie + deprecated API
- Google Analytics（`gtag.js`）：65KB unused JS
- Microsoft Clarity（`clarity.js`）：59ms 脚本执行

---

## 优化方案（按优先级排序）

### P0: 开启 CDN 边缘缓存（预计 TTFB 2s → 50-200ms）

**方案 A：Cloudflare Cache Rules（推荐）**

在 Cloudflare Dashboard → Caching → Cache Rules 添加规则：
- URL 匹配：`www.astrocurve.net/`（首页）
- 操作：Eligible for cache
- Edge TTL：3600 秒
- Browser TTL：60 秒
- Cache Key 包含：Accept-Language header（区分语言）

**方案 B：wrangler.toml 中设置 assets 配置**

如果 OpenNext 支持，配置 `Cache-Control` header 覆盖：

```toml
# wrangler.toml - assets caching
[assets]
binding = "ASSETS"
directory = ".open-next/assets"
html_handling = "auto-trailing-slash"
```

**方案 C：在 Next.js headers() 中显式设置**

```ts
// next.config.mjs headers()
{
  source: '/',
  headers: [
    { key: 'CDN-Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
    { key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=3600' },
  ],
},
```

> `CDN-Cache-Control` 是 Cloudflare 专用 header，优先级高于 `Cache-Control`。

### P1: 开启 D1 Read Replication（减少 SSR 数据库延迟）

D1 支持 Read Replication，会在边缘节点放置只读副本。

**操作步骤：**
1. Cloudflare Dashboard → Workers & Pages → D1
2. 选择 `astrokline-db`
3. Settings → Read Replication → Enable
4. 选择区域（建议 All regions 或 Americas + Europe）

> 注意：Read Replication 只加速 SELECT 查询。写操作仍走 primary。

### P2: 开启 Smart Placement（减少 Worker 冷启动延迟）

Smart Placement 让 Worker 自动靠近数据源（D1），减少 Worker ↔ DB 的网络延迟。

```toml
# wrangler.toml 添加
[placement]
mode = "smart"
```

> 注意：Smart Placement 可能让 Worker 离用户更远但离 DB 更近。配合 CDN 缓存效果最佳。

### P3: 优化 CF Bot Management 脚本（减少 TBT 680ms）

**选项 1：Landing page 排除 Challenge**
- Cloudflare Dashboard → Security → WAF → Custom Rules
- 添加规则：URI = `/` → Skip challenge

**选项 2：改用 Managed Challenge**
- Managed Challenge 比 JS Challenge 轻量，仅在可疑流量时激活

**选项 3：使用 Turnstile widget 替代 implicit challenge**
- 可控加载时机，不阻塞主线程

### P4: 延迟加载第三方脚本（减少 TBT + 提升 Best Practices）

**Google Analytics：**
```tsx
// 用 next/script strategy="lazyOnload"
<Script src="https://www.googletagmanager.com/gtag/js?id=G-xxx" strategy="lazyOnload" />
```

**Google Sign-In：**
```tsx
// 仅在需要登录的页面加载，不在 landing page 全局加载
<Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
```

**Microsoft Clarity：** 同样改为 `lazyOnload`。

### P5: 开启 Speculation Rules（预加载下一页）

Cloudflare Speculation（已看到 `/cdn-cgi/speculation` 请求）似乎已开启。确认 Dashboard 中 Speed → Speculative Preloading 已启用。

---

## 预期效果

| 优化 | TTFB 影响 | TBT 影响 | 预估 Performance |
|---|---|---|---|
| 当前状态 | 1.9s | 680ms | 40 |
| +P0 CDN 缓存 | → 50-200ms | - | 70-80 |
| +P1 D1 Read Replication | 减少冷SSR时DB延迟 | - | +2-5 |
| +P2 Smart Placement | 减少冷SSR时DB延迟 | - | +2-3 |
| +P3 优化 Bot Management | - | → <100ms | +15-20 |
| +P4 延迟第三方脚本 | - | → <50ms | +3-5 |
| **全部实施** | **50-200ms** | **<50ms** | **90-98** |

---

## 实施顺序建议

1. **立即可做（Dashboard 操作，不改代码）**
   - P0 方案A：Cloudflare Cache Rules
   - P1：D1 Read Replication
   - P2：Smart Placement（加 `wrangler.toml` 一行）

2. **需要改代码**
   - P4：第三方脚本延迟加载
   - P0 方案C：`CDN-Cache-Control` header

3. **需要安全评估**
   - P3：Bot Management 调整（需确认安全影响）
