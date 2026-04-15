# Kline PRD Runtime Report

## 结论

当前 Kline 加速 PRD 的核心链路已经跑通，并且真实浏览器验证符合目标顺序：Hero 先出，Core 和 Action 在 Hero 后并行，Deep 只在用户继续深入时再请求。

## 代码改动后的实际行为

- Hero 首次请求走 [src/app/api/astrology/kline-brief/route.ts](src/app/api/astrology/kline-brief/route.ts#L106) 到 [src/app/api/astrology/kline-brief/route.ts](src/app/api/astrology/kline-brief/route.ts#L266)，按 phase=hero 只返回 hero bundle。
- 前端在 [src/components/astrocurve/kline/shared-kline-result.tsx](src/components/astrocurve/kline/shared-kline-result.tsx#L801) 和 [src/components/astrocurve/kline/shared-kline-result.tsx](src/components/astrocurve/kline/shared-kline-result.tsx#L926) 在 hero 完成后立刻并发拉 action。
- 第二条 kline-brief 请求是 phase=core，请求体和响应都已验证，核心 section 只包含 summary、relationships、career、wealth、health、dashaTimeline、marriage，对应实现见 [src/app/api/astrology/kline-brief/route.ts](src/app/api/astrology/kline-brief/route.ts#L106) 和 [src/app/api/astrology/kline-brief/route.ts](src/app/api/astrology/kline-brief/route.ts#L198)。
- Deep 是单独的按需请求，前端触发点在 [src/components/astrocurve/kline/shared-kline-result.tsx](src/components/astrocurve/kline/shared-kline-result.tsx#L997)。
- 观察到的 /api/kline/ai-insight 不是旧链路泄漏，而是诊断结果持久化，代码在 [src/components/astrocurve/kline/ai-reading-panels.tsx](src/components/astrocurve/kline/ai-reading-panels.tsx#L768) 和 [src/components/astrocurve/kline/ai-reading-panels.tsx](src/components/astrocurve/kline/ai-reading-panels.tsx#L781)。真正的 legacy fallback fetch 仍是 /api/astrology/ai-insight，见 [src/components/astrocurve/kline/ai-reading-panels.tsx](src/components/astrocurve/kline/ai-reading-panels.tsx#L829)。
- Hero 专用轻量生成已从通用 personality 流拆出，见 [src/lib/astrokline/gemini.ts](src/lib/astrokline/gemini.ts#L243) 到 [src/lib/astrokline/gemini.ts](src/lib/astrokline/gemini.ts#L302)。
- Action 独立接口和 locale 缓存键在 [src/app/api/astrology/key-year-insights/route.ts](src/app/api/astrology/key-year-insights/route.ts#L57) 到 [src/app/api/astrology/key-year-insights/route.ts](src/app/api/astrology/key-year-insights/route.ts#L120)。

## 修改前后等待时间对比

### 修改前

- 旧的 PRO 整包 route 在本地曾测到 79692ms 和 84697ms，记录在 [tmp_kline_ai_pipeline.md](tmp_kline_ai_pipeline.md#L121)。
- PRD 里把旧体验定义为“首屏 Hero 可见时间约 80s 级链路阻塞”。

### 修改后

同一条 warm authenticated dashboard 流程里，浏览器和服务端日志都拿到了完整数据：

- Hero 请求：浏览器 16338.7ms，服务端 hero phase 10843ms，整条 hero route 15236ms。
- Action 请求：浏览器 23682.7ms，服务端 19610ms。
- Core 请求：浏览器 24146.9ms，服务端 20096ms。
- Deep 请求：不阻塞首屏，只在用户点击 Go Deeper 后再发起。

### 用户等待时间变化

- 首屏 Hero：约 80s 级阻塞 -> 约 15.2s 到 16.3s。
- 绝对减少：约 63s 到 69s。
- 相对缩短：约 79% 到 81%。
- 体验变化：用户不再等待整包 AI 全部生成后才看到内容，而是先看到 hero，再继续补全 diagnosis 和 action。

## 与 PRD 验收项对照

- Hero -> Core / Action -> Deep(按需)：已验证。
- Hero 本地 dev warm 15s 内可见：边界附近，当前浏览器实测 16.3s，服务端 route 为 15.2s。需要注意该值仍受认证、list、referral 等非 AI 请求影响。
- Core 本地 dev warm 25s 内：已达到，实测 24.1s。
- Deep 不阻塞首屏：已达到。

## Gemini 截断修复复测

- 真实 dev 日志里的失败样本已经补成回归测试，见 [src/lib/astrokline/json-repair.test.ts](src/lib/astrokline/json-repair.test.ts)。新增样本覆盖 key-year 数组最后一个对象被截断、并且错误提前遇到 `]` 的场景。
- 修复器新增了不匹配闭合符裁剪逻辑，先把损坏尾段裁掉再做 balance，见 [src/lib/astrokline/json-repair.ts](src/lib/astrokline/json-repair.ts)。
- 窄测试结果：`pnpm exec tsx --test src/lib/astrokline/json-repair.test.ts` 现为 5/5 通过。
- 真实 Gemini 生成链路复测了 2 轮 key-year 调用，走的仍是 [src/lib/astrokline/gemini.ts](src/lib/astrokline/gemini.ts#L665) 同一条生产路径。
- 两轮结果都没有再出现 `Initial JSON parse failed`、`Failed to salvage JSON`、`AI key year insights failed`，并且没有 fallback 痕迹。
- 两轮耗时分别约 9.0s 和 10.8s，均成功返回 10/10 年份 insight。

## Cloudflare 部署与生产验证

- 已执行 Cloudflare 正式部署，Worker 名称为 astro。
- 新版本 Version ID：12be201a-9522-4332-ba8c-d1a05d777764。
- Wrangler 返回的 workers.dev 地址为 https://astro.payeezoo.workers.dev。
- 生产域名 [https://www.astrocurve.net/dashboard/kline](https://www.astrocurve.net/dashboard/kline) 已实际打开并验证到带登录态页面。
- 生产页中 01 到 05 五段结构全部存在：01 Life Curve、02 Current Stage、03 Why It Feels This Way、04 What To Do Next、05 Go Deeper。
- 生产页 console 错误检查结果为空，未发现 error 或 warn。

## Logo 抓取链路清理

- 为了彻底移除 ShipAny 模板 logo，已调整默认 favicon 配置，见 [src/config/index.ts](src/config/index.ts#L7)。
- 根布局不再手写 icon 和 apple-touch-icon，改为依赖 Next app icon 输出，见 [src/app/layout.tsx](src/app/layout.tsx#L1)。
- 结构化数据里的 Organization.logo 已改为生产可访问的 [public/logo.png](public/logo.png)，实现见 [src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx#L66)。
- 对外兼容入口 [public/logo.webp](public/logo.webp) 也已替换为 AstroCurve 品牌图，不再是 ShipAny 模板图。
- logo 清理后又执行了一次 Cloudflare 正式部署，最新 Version ID 为 aa296c0f-763d-4252-a75a-f9900d7abce2。
- 生产首页再次抓取验证后，head 和结构化数据只看到 `/icon.png`、`/apple-icon.png`、`https://www.astrocurve.net/logo.png`。
- 同一次生产抓取中，`/logo.webp` 和 `/imgs/logo.png` 已不再出现在 crawler-facing 元数据链路里。

## 当前剩余问题

- Gemini 截断 JSON 的恢复层已经补强，并且 key-year 的真实 Gemini 直连复测已通过。还没补到的是“带登录态的浏览器整链路”再跑一轮同样样本，不过当前最关键的 AI 解析回退点已经不再复现。
- 本地 dev 曾因为 .next 构建产物损坏出现 500，不是这次 Kline 业务链路回退；执行 rm -rf .next && pnpm dev 后恢复。
- 当前 pnpm build 已恢复通过；这轮真正挡住构建的是 [src/lib/astrokline/json-repair.ts](src/lib/astrokline/json-repair.ts) 里两处正则无效转义，已修复。

## 本次最终验证

- 浏览器网络请求体和响应体已核对：hero、core、action、deep 顺序正确。
- 页面实际 UI 已看到 01 Life Curve、02 Current Stage、03 Why It Feels This Way、04 What To Do Next、05 Go Deeper 全部阶段化渲染。
- JSON 修复相关文件当前无编辑器诊断错误：
  - [src/lib/astrokline/json-repair.ts](src/lib/astrokline/json-repair.ts)
  - [src/lib/astrokline/json-repair.test.ts](src/lib/astrokline/json-repair.test.ts)
  - [src/lib/astrokline/gemini.ts](src/lib/astrokline/gemini.ts)
- pnpm build 已再次完整通过。
- Kline 相关四个核心文件当前无编辑器诊断错误：
  - [src/components/astrocurve/kline/shared-kline-result.tsx](src/components/astrocurve/kline/shared-kline-result.tsx)
  - [src/app/api/astrology/kline-brief/route.ts](src/app/api/astrology/kline-brief/route.ts)
  - [src/app/api/astrology/key-year-insights/route.ts](src/app/api/astrology/key-year-insights/route.ts)
  - [src/lib/astrokline/gemini.ts](src/lib/astrokline/gemini.ts)
