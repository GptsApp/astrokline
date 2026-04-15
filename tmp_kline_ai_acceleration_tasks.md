# Kline AI 提速 PRD 开发任务清单与验收点

对应 PRD：`tmp_kline_ai_acceleration_prd.md`

这份文档的目标是把 PRD 变成可执行任务单。

使用原则：

1. 按阶段推进，不要同时开太多切面。
2. 每个阶段结束都要跑本阶段验收。
3. 只有当本阶段验收通过，才进入下一阶段。
4. 如果某个任务会影响接口结构，必须先补兼容层，再改前端调用。

## 1. 开发总目标

当整个任务完成后，应达到以下结果：

1. Kline 页面不再等待全量 PRO AI 完成才显示首屏内容。
2. Hero、Core、Deep、Action 可以分阶段返回和渲染。
3. PRO 能复用 LITE 的缓存结果，避免重复生成前 7 个核心 section。
4. 低价值 section 被压缩或后置，不再拖垮主链路。
5. Prompt 更贴近女性用户的真实关注点，但不强化刻板印象。
6. 整体具备可观测性：能看到 cache hit/miss、各阶段时延、区块完成时刻。

## 2. 当前已知约束

### 2.1 已存在的脚本

可用命令：

1. `pnpm lint`
2. `pnpm build`
3. `pnpm dev`

当前没有明确的单元测试脚本，因此本项目本轮验收以：

1. lint
2. build
3. 本地手动 QA
4. 网络与日志观测

为主。

### 2.2 已存在的缓存基础

已有文件：

1. `src/lib/astrokline/ai-insight-cache.ts`
2. `src/app/api/astrology/key-year-insights/route.ts`

已有事实：

1. `ai_insight_cache` 已被使用
2. key year insights 已经单独有路由和 D1 缓存
3. 说明本轮不需要从零设计缓存机制，而是要标准化和复用

### 2.3 本轮主要修改文件

核心文件：

1. `src/lib/astrokline/section-prompts.ts`
2. `src/lib/astrokline/gemini.ts`
3. `src/app/api/astrology/kline-brief/route.ts`
4. `src/lib/astrokline/kline-ai-bundle.ts`
5. `src/components/astrocurve/kline/shared-kline-result.tsx`

新增文件：

1. `src/lib/astrokline/kline-bundle-cache.ts`

可能需要补改的文件：

1. `src/app/api/astrology/key-year-insights/route.ts`
2. `src/lib/astrokline/ai-call-logger.ts`
3. `src/lib/astrokline/client-request-cache.ts`

## 3. 里程碑拆分

整个开发分为 5 个里程碑：

1. M0 基线与可观测性
2. M1 快速收益项
3. M2 后端分段生成
4. M3 前端渐进渲染
5. M4 全链路验收

只有当前一个里程碑完成，才进入下一个。

---

## 4. M0 基线与可观测性

### 4.1 目标

在开始重构前，先固定基线，避免后面只凭感觉判断变快了没有。

### 4.2 任务

#### M0-T1 记录当前基线耗时

目标：

1. 记录当前 fresh PRO 请求完整耗时
2. 记录单个 section latency 样本
3. 记录是否存在 JSON repair / fallback

操作：

1. 用当前 dev 环境跑 2 到 3 次 fresh chart 请求
2. 记录 `/api/astrology/kline-brief` 总耗时
3. 摘录 AI logger 中的 section latency

验收：

1. 有一份文本或 markdown 记录当前基线
2. 至少包含 2 次完整路由耗时样本

#### M0-T2 增加阶段级埋点定义

目标：

明确后面要观测哪些事件。

输出事件名：

1. `kline_hero_request_started`
2. `kline_hero_rendered`
3. `kline_core_request_started`
4. `kline_core_rendered`
5. `kline_deep_request_started`
6. `kline_deep_rendered`
7. `kline_action_request_started`
8. `kline_action_rendered`
9. `kline_cache_hit`
10. `kline_cache_miss`

验收：

1. 事件命名固定
2. 每个事件都有明确触发时机

### 4.3 M0 完成定义

1. 当前基线已记录
2. 后续阶段要观察的事件已定义

---

## 5. M1 快速收益项

### 5.1 目标

在不大改前后端协议的前提下，先拿到最快的收益：

1. 缩短低价值 section 输出
2. 统一缓存层
3. Action 不再作为主链路尾巴

### 5.2 任务

#### M1-T1 调整 section 分层常量

文件：

1. `src/lib/astrokline/section-prompts.ts`

改动：

1. 新增 `HERO_SECTION_KEYS`
2. 新增 `CORE_SECTION_KEYS`
3. 新增 `DEEP_SECTION_KEYS`
4. 明确 LITE = CORE
5. 明确 PRO-only = DEEP

建议分层：

`CORE_SECTION_KEYS`

1. summary
2. relationships
3. career
4. wealth
5. health
6. dashaTimeline
7. marriage

`DEEP_SECTION_KEYS`

1. strengths
2. warnings
3. karma
4. family
5. children
6. spirituality
7. education
8. authority
9. lifestyle
10. hiddenDangers

验收：

1. 常量定义清晰
2. 旧逻辑不被破坏
3. LITE 和 PRO 依然能通过现有调用正常取到 section 集合

#### M1-T2 调整 wordRange 和 compact 输出规则

文件：

1. `src/lib/astrokline/section-prompts.ts`

改动：

1. 按 PRD 缩短 low-value section 的字数预算
2. 为低价值 section 增加 compact 指令
3. 保证 relationships、dashaTimeline、summary 的主价值不被削掉

验收：

1. low-value section 的新预算已生效
2. 输出不再默认长段 prose
3. relationships 和 dashaTimeline 仍然保留足够信息量

#### M1-T3 强化女性向 prompt 规则

文件：

1. `src/lib/astrokline/gemini.ts`
2. `src/lib/astrokline/section-prompts.ts`

改动：

1. 新增 women-centered relevance rules
2. relationship / marriage / career / warnings / hiddenDangers 分别增加专用限制
3. 明确不默认婚育、不默认异性恋、不默认权力追求

验收：

1. prompt 文本能明确看到这些限制
2. 不与已有系统 prompt 冲突
3. 不引入更强的 stereotype

人工抽检标准：

1. relationship 先谈安全感和边界，不只是化学反应
2. career 不写成公司黑话或攻击性成功学
3. warnings 先给保护动作，而不是制造恐惧

#### M1-T4 新增统一缓存封装层

文件：

1. 新增 `src/lib/astrokline/kline-bundle-cache.ts`
2. 参考 `src/lib/astrokline/ai-insight-cache.ts`

改动：

1. 统一 Hero/Core/Deep/Action 的 cache key 规则
2. 包装读取、写入、过期检查
3. 支持 locale 维度
4. 支持 PRO miss 时复用 LITE cache

最低要求接口：

1. `getHeroCache(...)`
2. `setHeroCache(...)`
3. `getCoreCache(...)`
4. `setCoreCache(...)`
5. `getDeepCache(...)`
6. `setDeepCache(...)`
7. `getActionCache(...)`
8. `setActionCache(...)`

验收：

1. 缓存 API 可单独复用
2. key 规则统一
3. 支持 locale
4. 支持 tier 复用链路

#### M1-T5 Action 路由职责明确化

文件：

1. `src/app/api/astrology/key-year-insights/route.ts`

改动：

1. 明确 Action 路由是 Kline 可单独调用的正式通道
2. 统一 cache key 逻辑到新缓存层
3. 日志里标明 cache hit / miss

验收：

1. key-year-insights 可以独立服务 Action 区块
2. 再次请求同一 chart + years 时命中缓存

### 5.3 M1 验证步骤

1. `pnpm lint`
2. 手动请求 key-year route，确认返回正常
3. 用同一 chart 重复请求，确认 cache hit 出现

### 5.4 M1 完成定义

1. section 已完成分层
2. 低价值 section 输出已缩短
3. 女性向 prompt 规则已落地
4. 统一缓存层可用
5. Action 路由可单独工作并有缓存

---

## 6. M2 后端分段生成

### 6.1 目标

把 `kline-brief` 从“一次返回所有内容”改成“按模式返回”。

### 6.2 任务

#### M2-T1 扩展请求 schema 增加 mode

文件：

1. `src/app/api/astrology/kline-brief/route.ts`

改动：

新增 `mode`：

1. `hero`
2. `core`
3. `deep`

建议默认兼容：

1. 未传 mode 时，保持旧行为或等价到 `core + action`，避免一次性破坏现有调用

验收：

1. schema 可识别 mode
2. 不传 mode 时不 500

#### M2-T2 实现 Hero 生成入口

文件：

1. `src/lib/astrokline/gemini.ts`

改动：

新增 `generateHeroInsight(...)`，只负责：

1. nickname
2. coreQuote
3. hero title
4. supportLine
5. proofLine

建议：

1. Hero 不跑 17 个 diagnosis section
2. Hero 尽量只做极少量 AI 工作
3. 如果可控，优先考虑流式首包

验收：

1. Hero 请求可独立返回一份最小可渲染数据
2. 返回内容足够支撑 section 2 首屏

#### M2-T3 实现 Core 生成入口

文件：

1. `src/lib/astrokline/gemini.ts`
2. `src/app/api/astrology/kline-brief/route.ts`

改动：

1. `mode=core` 时只跑 CORE 7 个 section
2. 优先读取 LITE cache
3. miss 时生成并写 cache

验收：

1. Core 可以不依赖 Deep 单独返回
2. 重复请求时命中 LITE cache

#### M2-T4 实现 Deep 生成入口

文件：

1. `src/lib/astrokline/gemini.ts`
2. `src/app/api/astrology/kline-brief/route.ts`

改动：

1. `mode=deep` 时只跑 PRO-only 10 个 section
2. 优先读取 PRO cache
3. PRO miss 时尝试读 LITE cache，再补 10 个 deep sections

验收：

1. Deep 不重复生成 Core
2. PRO 复用 LITE 缓存成功

#### M2-T5 Bundle 支持 partial merge

文件：

1. `src/lib/astrokline/kline-ai-bundle.ts`

改动：

1. 增加 partial bundle merge 能力
2. meta 标记阶段状态
3. 支持先 Hero，后 Core，再 Deep，再 Action 合并

建议状态：

1. `heroReady`
2. `coreReady`
3. `deepReady`
4. `actionReady`

验收：

1. 任意阶段返回都能合并成稳定 bundle
2. 前端拿 partial bundle 不会崩

#### M2-T6 从主链路中移除 Action 阻塞

文件：

1. `src/app/api/astrology/kline-brief/route.ts`

改动：

1. `mode=hero` 不生成 action
2. `mode=core` 默认不阻塞 action
3. action 由单独请求负责

验收：

1. hero/core 请求不再等待 key year insights
2. kline-brief 的总时间显著缩短

### 6.3 M2 验证步骤

1. `pnpm lint`
2. `pnpm build`
3. 手工调用 3 种 mode，确认都返回正确结构
4. 用同一 chart 重复请求 core/deep，确认缓存命中链路生效

### 6.4 M2 完成定义

1. route 支持 hero/core/deep
2. Hero、Core、Deep 都可独立返回
3. partial bundle merge 可用
4. Action 不再阻塞 kline-brief 主链路

---

## 7. M3 前端渐进渲染

### 7.1 目标

让页面真正按阶段展示，而不是后端拆了、前端还在等整包。

### 7.2 任务

#### M3-T1 Hero 首发请求

文件：

1. `src/components/astrocurve/kline/shared-kline-result.tsx`

改动：

1. 页面初始化先发 `mode=hero`
2. Hero 返回后立即渲染首屏
3. Life Curve 继续优先使用规则数据展示

验收：

1. 页面不再全局等待完整 AI
2. 首屏先能看到 Hero 区块核心内容

#### M3-T2 Core 后台请求与局部填充

文件：

1. `src/components/astrocurve/kline/shared-kline-result.tsx`

改动：

1. Hero 成功后立刻发 `mode=core`
2. Core 返回后更新 diagnosis 区块
3. 用 partial merge 更新本地 bundle state

验收：

1. Hero 已显示时，Core 可以稍后到达并补齐页面
2. 不出现整页闪烁或重置滚动

#### M3-T3 Deep 按需加载

文件：

1. `src/components/astrocurve/kline/shared-kline-result.tsx`

改动：

1. 用户滚动到 diagnosis 深区或点击 Go Deeper 时发 `mode=deep`
2. 未加载前先显示占位或简版文案

验收：

1. 用户不进入深区时，不应默认请求 deep
2. deep 返回后能补全内容，不影响已渲染部分

#### M3-T4 Action 独立请求与局部替换

文件：

1. `src/components/astrocurve/kline/shared-kline-result.tsx`

改动：

1. Hero 成功后异步触发 action 请求
2. Action 未返回时，先展示基于 `keyYears` 的 fallback
3. Action 返回后只替换 summary / advice 层

验收：

1. Action 不阻塞首屏
2. Action 未返回时已有可读内容
3. Action 返回后平滑替换

#### M3-T5 细化 loading UI

文件：

1. `src/components/astrocurve/kline/shared-kline-result.tsx`
2. 如有必要，相关子组件

改动：

1. 使用区块级 loading，不用全页 loading
2. 预留稳定高度，防止内容回来时大幅跳动

验收：

1. 页面没有大面积白屏等待
2. 布局跳动明显下降

### 7.3 M3 验证步骤

1. `pnpm lint`
2. `pnpm build`
3. 本地打开 Kline 页面
4. 打开 Network 面板，确认请求顺序为 Hero -> Core / Action -> Deep(按需)
5. 确认首屏先出现，非首屏内容后补

### 7.4 M3 完成定义

1. Hero 首先渲染
2. Core 后补
3. Deep 按需触发
4. Action 独立更新
5. 页面无全局阻塞 skeleton

---

## 8. M4 全链路验收

### 8.1 技术验收

必须通过：

1. `pnpm lint`
2. `pnpm build`

### 8.2 手动 QA 验收

#### 首次打开 fresh chart

检查：

1. 首屏是否先出现 Hero
2. 是否不再等待整包
3. Core 是否后补
4. Action 是否不阻塞首屏

#### 重复打开同一 chart

检查：

1. Hero 是否明显更快
2. Core 是否命中缓存
3. Deep 是否可复用缓存

#### 文案命中感抽检

至少抽检这几块：

1. relationships
2. dashaTimeline
3. marriage
4. warnings
5. hiddenDangers

通过标准：

1. 不默认婚育
2. 不默认异性恋
3. 不用公司黑话
4. 有边界和保护建议
5. 读起来像在解释“现在为什么这样”，不是泛泛而谈

#### 低价值内容压缩抽检

抽检：

1. education
2. authority
3. lifestyle
4. family
5. spirituality

通过标准：

1. 明显更短
2. 仍有具体 placement evidence
3. 没有为了变短而变空

### 8.3 性能验收

建议目标：

| 指标 | 目标 |
| --- | --- |
| Hero 首次出现 | 本地 dev warm 下 15s 内可见；生产目标 8-12s |
| Core 返回 | 本地 dev warm 下 25s 内；生产目标 15-25s |
| Deep | 后台或按需，不阻塞首屏 |
| 重复访问 | Hero/Core 明显命中缓存 |

备注：

开发环境本身较慢，因此本地验收重点看相对改善和阶段拆分是否生效，不强求生产级数字完全一致。

### 8.4 日志验收

日志中必须能观察到：

1. hero/core/deep/action 的请求开始和完成
2. cache hit / miss
3. 单 section latency
4. 是否触发 fallback

### 8.5 M4 完成定义

1. lint 和 build 都通过
2. 首屏体验已从“等整包”改成“先看到 Hero”
3. 缓存复用链路已验证
4. 女性向 prompt 的文案抽检通过
5. 低价值 section 缩写抽检通过

---

## 9. 最终完成定义

只有当以下条件同时满足，才算整个 PRD 开发验收完成：

1. M0 到 M4 全部完成
2. 无阻塞性 lint/build 问题
3. 首屏与深内容已经彻底解耦
4. Action 已从主阻塞链路拆出
5. 缓存已具备 Hero/Core/Deep/Action 的统一策略
6. 文案风格已通过人工抽检
7. 性能对比能明确证明结构优化生效

## 10. 推荐执行顺序

如果要实际开干，推荐按下面顺序提交批次：

### Batch 1

1. `section-prompts.ts` 分层
2. `section-prompts.ts` 缩字数
3. `gemini.ts` 女性向规则

### Batch 2

1. 新增 `kline-bundle-cache.ts`
2. key-year route 统一缓存
3. `route.ts` 加 mode schema

### Batch 3

1. `gemini.ts` 增加 hero/core/deep 生成入口
2. `kline-ai-bundle.ts` 支持 partial merge
3. `route.ts` 实现 hero/core/deep

### Batch 4

1. `shared-kline-result.tsx` Hero 首发
2. `shared-kline-result.tsx` Core 后补
3. `shared-kline-result.tsx` Action 独立
4. `shared-kline-result.tsx` Deep 按需

### Batch 5

1. 全链路 QA
2. 基线对比
3. 文案抽检

---

## 11. 执行提醒

这套方案最容易失败的地方，不是在代码，而是在范围失控。

执行时要始终记住：

1. 先把结构拆开，再谈极限优化。
2. 先压低价值内容，再保护高价值内容。
3. 先让用户尽快看到内容，再追求全量内容一次完成。