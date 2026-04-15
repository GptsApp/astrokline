# Kline 页面 AI 生成链路表

## 结论先看

- 当前页面前端只打 **一次** `/api/astrology/kline-brief`，不是 hero、diagnosis、action 分别各打一条接口。
- 这条接口的后端生成顺序是：
  1. 先做 nickname + coreQuote
  2. 再做 personality sections，按 **每批 5 个并发** 跑
  3. 最后再做 key year insights 的单次大调用
  4. 然后把结果拼成 hero / diagnosis / action bundle 返回
- 所以它不是“全并发”，而是 **阶段串行，阶段内部分并发**。
- 当前前端有 **60 秒客户端缓存**，同一个 chart + tier + keyYears 组合，60 秒内不会重复打这条接口。

## 页面消费顺序 vs 后端生成顺序

### 页面消费顺序

| 页面位置 | 页面块 | 是否依赖 AI | 读哪个 bundle 字段 |
| --- | --- | --- | --- |
| 01 | Life Curve | 否 | 纯 K 线和 transit 数据 |
| 02 | How This Chapter Feels Right Now | 是 | `bundle.hero` + 部分 fallback |
| 03 | Why This Pattern Keeps Repeating | 是 | `bundle.diagnosis` |
| 04 | How To Move Through The Next Chapter | 是 | `bundle.action` + `bundle.action.years` |
| 05 | Go Deeper | 部分 | `bundle.askContext` |

### 后端真实生成顺序

| 阶段 | 位置 | 顺序 | 并发方式 | 说明 |
| --- | --- | --- | --- | --- |
| A | [src/components/astrocurve/kline/shared-kline-result.tsx](src/components/astrocurve/kline/shared-kline-result.tsx) | 触发入口 | 单次请求 | `prefetchAiBrief()` 在组件挂载时触发 |
| B | [src/app/api/astrology/kline-brief/route.ts](src/app/api/astrology/kline-brief/route.ts) | 路由入口 | 串行 | 先鉴权、校验 tier、整理 keyYears |
| C | [src/lib/astrokline/gemini.ts](src/lib/astrokline/gemini.ts) `generatePersonalityInsight()` | 第 1 段 | 串行 | 先做 nickname + coreQuote |
| D | [src/lib/astrokline/gemini.ts](src/lib/astrokline/gemini.ts) `generatePersonalityInsight()` | 第 2 段 | **分批并发** | sections 按每批 5 个 Gemini 调用并发 |
| E | [src/lib/astrokline/gemini.ts](src/lib/astrokline/gemini.ts) `generateKeyYearInsights()` | 第 3 段 | 串行单次 | 全部 keyYears 放进一次大 prompt 里生成 |
| F | [src/lib/astrokline/kline-ai-bundle.ts](src/lib/astrokline/kline-ai-bundle.ts) | 第 4 段 | 本地同步拼装 | 拼成 hero / diagnosis / action / askContext |

## 详细执行表

| 步骤 | 代码位置 | 生成内容 | 调用次数 | 并发情况 | 超时 | Token 上限 | 是否有结构化日志 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [src/components/astrocurve/kline/shared-kline-result.tsx](src/components/astrocurve/kline/shared-kline-result.tsx) | 前端发 `/api/astrology/kline-brief` | 1 | 无 | 无 | 无 | 无 |
| 2 | [src/lib/astrokline/gemini.ts](src/lib/astrokline/gemini.ts) `buildNicknamePrompt` + `callGeminiJson` | nickname + coreQuote | 1 | 串行 | 25s | 512 | **没有单独 ai_call log** |
| 3 | [src/lib/astrokline/gemini.ts](src/lib/astrokline/gemini.ts) `generateSingleSection` | 单个 personality section | PRO 最多 17 次，LITE 7 次 | **每批 5 个并发** | 25s / 次 | 2048 / 次 | 有 |
| 4 | [src/lib/astrokline/gemini.ts](src/lib/astrokline/gemini.ts) attempt 2 | 同一个 section 的 strict JSON repair 重试 | 最多再 1 次 / section | 和上面同一 task 内串行 | 25s / 次 | 2048 / 次 | 成功会记成 `gemini-2.5-flash-retry` |
| 5 | [src/lib/astrokline/gemini.ts](src/lib/astrokline/gemini.ts) `tryCfFallbackModels` | section 的 CF fallback | 最多 1 次 / section | 仍属单 section task 内串行 | 未在这里显式写死 | 2048 / 次 | 有，`cf-workers-ai` |
| 6 | [src/lib/astrokline/gemini.ts](src/lib/astrokline/gemini.ts) `generateKeyYearInsights` | 所有 keyYears 的 summary + advice | 1 | 串行单次 | 45s | 4096 | **没有单独 ai_call log** |
| 7 | [src/lib/astrokline/kline-ai-bundle.ts](src/lib/astrokline/kline-ai-bundle.ts) | hero / diagnosis / action / askContext 拼装 | 1 | 本地同步 | 无 | 无 | 无 |

## personality sections 的并发模型

| Tier | section 数 | 批大小 | 批次数 | 说明 |
| --- | --- | --- | --- | --- |
| HERO | 0 个 section | 不适用 | 0 | 只做 nickname + coreQuote，diagnosis/action 都不生成 |
| LITE | 7 个 section | 5 | 2 批 | 第 1 批 5 个，第 2 批 2 个 |
| PRO | 17 个 section | 5 | 4 批 | 5 + 5 + 5 + 2 |

## section 来源

这些 section 定义在 [src/lib/astrokline/section-prompts.ts](src/lib/astrokline/section-prompts.ts)。

### LITE 会跑的 7 个 section

| 顺序组 | key |
| --- | --- |
| core | summary |
| core | relationships |
| core | career |
| core | wealth |
| core | health |
| timing | dashaTimeline |
| timing | marriage |

### PRO 会额外再跑的 section

| key |
| --- |
| strengths |
| warnings |
| karma |
| family |
| children |
| spirituality |
| education |
| authority |
| lifestyle |
| hiddenDangers |

## 每个 section 的内部重试顺序

| 单个 section task 内部顺序 | 模型 | 说明 |
| --- | --- | --- |
| 1 | gemini-2.5-flash | 正常调用 |
| 2 | gemini-2.5-flash-retry | 拼上严格 JSON repair suffix 再试一次 |
| 3 | cf-workers-ai | Gemini 还不行就走 CF fallback |
| 4 | none | 三次都失败则返回空串，后续 normalizer 补 fallback |

## 当前日志里能看到的耗时样本

这些是当前本地 dev 终端里出现过的 `ai_call` 结构化日志样本，都是单个 section 的耗时，不是整条请求耗时。

| section | 观测耗时 |
| --- | --- |
| family | 10382 ms |
| lifestyle | 10677 ms |
| hiddenDangers | 10682 ms |
| children | 11398 ms |
| spirituality | 11815 ms |
| relationships | 12143 ms |
| health | 12143 ms |
| education | 12378 ms |
| karma | 12522 ms |
| warnings | 12619 ms |

### 从这些样本能推出来什么

| 观察 | 解释 |
| --- | --- |
| 单个 section 常见在 10-13 秒 | Gemini 单次 section 调用本身就不轻 |
| PRO 17 个 section 虽然并发，但要分 4 批 | 所以总耗时不是 12 秒，而更像 4 个批次叠加 |
| key year insights 又是后置单次大调用 | personality 跑完后还要再等一轮 |
| 当前本地 route 总耗时见到过 79692 ms、84697 ms | 这和“4 批 section + nickname + keyYears + 重试”是对得上的 |

## 为什么你会感觉页面很慢

| 体感点 | 真正原因 |
| --- | --- |
| 页面只打一条 `/api/astrology/kline-brief`，但还是很慢 | 因为这一条接口内部其实串了很多 AI 调用 |
| 你以为 hero 应该很快 | 现在 hero 不是单独接口，它等的是整条 bundle 返回 |
| 有些 section 明明不在首屏 | 但当前 bundle 模型里，personality 先整体生成，再给 hero/diagnosis/action 切片 |

## 现状一句话总结

当前 Kline 的 AI 不是“首屏优先流式生成”，而是“先整包生成，再切片消费”。

如果你下一步是要提速，最值钱的切法通常有 3 个：

1. 把 hero 从整包里彻底拆成独立超轻请求。
2. key year insights 不再等 personality 全部结束后才开始。
3. 把 PRO 的非首屏 section 从首轮请求里延后到 diagnosis 展开时再打。
