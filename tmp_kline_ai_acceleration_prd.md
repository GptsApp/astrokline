# Kline AI 提速与内容价值重构 PRD

## 1. 文档目标

这份文档的目标不是讨论方向，而是让另一个工程师看完后，能直接开始改。

要解决的问题有 4 个：

1. PRO 用户当前一次完整 Kline AI 生成太慢，本地 dev 实测约 79.7s 到 84.7s。
2. 当前链路把“首屏必须看到的内容”和“深度补充内容”绑在了一起，导致用户一直空等。
3. 17 个 section 的价值密度并不相同，但当前生成预算过于平均。
4. 当前 prompt 虽然已经写明核心受众是女性 25-45 岁，但仍然可以更聚焦“情感清晰感、安全感、关系判断、边界感、时机感”。

本文给出一套产品与工程一体化方案：

1. 先把首屏体验救回来。
2. 再把主请求总耗时砍下来。
3. 最后提高输出内容的可读性和命中感。

## 2. 当前现状

### 2.1 当前请求结构

当前 Kline 页面前端只请求一次接口：

- `/api/astrology/kline-brief`

但这个接口内部不是一次 AI 调用，而是多阶段串行：

1. 鉴权与 tier 解析
2. `generatePersonalityInsight(profile, { sections })`
3. `normalizePersonalityInsight(...)`
4. `generateKeyYearInsights(profile, keyYears)`
5. `buildKlineAIBundle(...)`
6. 返回 bundle 给前端

### 2.2 当前关键实现

相关文件：

- `src/app/api/astrology/kline-brief/route.ts`
- `src/lib/astrokline/gemini.ts`
- `src/lib/astrokline/section-prompts.ts`
- `src/lib/astrokline/kline-ai-bundle.ts`
- `src/components/astrocurve/kline/shared-kline-result.tsx`

当前已确认的关键参数：

- `DEFAULT_GEMINI_TIMEOUT_MS = 25000`
- `PARALLEL_BATCH_SIZE = 5`
- `SECTION_MAX_TOKENS = 2048`
- 前端客户端缓存 TTL 为 `60_000 ms`

### 2.3 当前 section 结构

当前一共有 17 个 diagnosis section：

1. summary
2. relationships
3. career
4. wealth
5. health
6. strengths
7. warnings
8. dashaTimeline
9. marriage
10. karma
11. family
12. children
13. spirituality
14. education
15. authority
16. lifestyle
17. hiddenDangers

当前 LITE 使用 7 个核心 section：

- summary
- relationships
- career
- wealth
- health
- dashaTimeline
- marriage

当前 PRO 使用全部 17 个 section。

### 2.4 当前实测耗时

已观察到的本地 dev 数据：

| 项目 | 当前观察值 |
| --- | --- |
| 单个 section AI 调用 | 约 10s 到 13s |
| 完整 `/api/astrology/kline-brief` | 约 79.7s 到 84.7s |
| 当前 section 并发方式 | 每批 5 个并发，批与批之间串行 |
| key year insights | 在 personality insight 之后再单独调用 |

这意味着当前的慢，不是单点慢，而是“串行阶段过多 + 高价值内容没有优先返回 + 尾部还有单独的大调用”。

## 3. 问题定义

### 3.1 用户真正要的不是“全量一次性完成”

对用户来说，真正重要的是：

1. 我现在处于什么阶段。
2. 为什么最近会这样。
3. 接下来该怎么做。
4. 这段关系/感情/人生节奏是不是有方向。

用户不需要在首屏就同时拿到：

1. authority
2. education
3. lifestyle
4. hiddenDangers
5. spirituality
6. family
7. children

这些内容不是没价值，而是“不是首屏价值”。

### 3.2 当前架构把高价值和低价值内容绑死了

现在的问题不是 AI 不够快，而是产品没有做内容分层：

1. Life Curve 本身多数是规则或现有数据可推导，但它和 AI 大包一起等待。
2. Hero 当前阶段文案和更深层 diagnosis 在同一包里，导致首屏必须等大部分内容算完。
3. Action 依赖 key year insights，而 key year insights 又放在 personality 后面，形成尾部拖延。

### 3.3 当前 prompt 在“命中感”与“产出长度”之间不够克制

已有 prompt 已经有较强风格，但还有 3 个问题：

1. 某些低价值 section 仍然用较长 prose 输出，影响速度，也增加阅读疲劳。
2. 对女性用户的“情绪命中感”已有方向，但还不够具体地指导模型避开什么。
3. 某些 section 仍然容易滑向抽象、玄、泛、像咨询师而不像一个真正懂当下处境的人。

## 4. 产品目标

### 4.1 核心目标

1. 让首屏在新请求下尽快出现，不再让用户长时间空等。
2. 让 PRO 的重内容生成改为渐进式到达，而不是全量阻塞。
3. 明确哪些内容要重点打磨，哪些内容应该缩短，哪些内容应该延后。
4. 针对女性用户提高“被看见、被理解、能落地”的感受。

### 4.2 非目标

本 PRD 不处理以下事情：

1. 不改占星算法本身。
2. 不改 chart 计算结果。
3. 不改 Ask Chart 的独立产品定位。
4. 不在第一阶段重做全部 UI，只做支持渐进加载所需的 UI 调整。

## 5. 用户价值模型

### 5.1 核心受众

当前 prompt 已明确：核心受众是女性 25-45 岁，主要诉求是：

1. 关系判断
2. 情绪清晰感
3. 安全感和边界感
4. 时机判断
5. 事业与人生方向，但通常不是抽象的“权力感”诉求

### 5.2 重要原则

面向女性用户优化，不等于强化刻板印象。

必须同时做到：

1. 更懂关系与情绪。
2. 不默认对方一定想结婚或生育。
3. 不默认异性恋。
4. 不把事业建议写成男性化、指令化、攻击性的语气。
5. 不把“苦难”包装成空洞的正能量。

### 5.3 用户最在乎的内容优先级

| 内容 | 用户价值 | 是否首屏必需 | 处理策略 |
| --- | --- | --- | --- |
| 当前阶段判断 | 极高 | 是 | 保留，优先返回 |
| 关系/情感模式 | 极高 | 是 | 保留，优先返回 |
| 未来 1-3 年时机感 | 极高 | 是 | 保留，优先返回 |
| 为什么最近这样 | 高 | 是 | 保留，压缩后优先返回 |
| 下一步行动建议 | 高 | 是 | 保留，但可与 key year 解耦 |
| 事业与财富 | 中高 | 否，但应较早返回 | 放入 core |
| 婚姻与长期关系 | 中高 | 否，但应较早返回 | 放入 core |
| 健康与精力 | 中 | 否，但应较早返回 | 放入 core |
| 家族/子女/灵性 | 中低 | 否 | 延后或按需加载 |
| 教育/权威/生活方式 | 低 | 否 | 缩短输出并延后 |
| hiddenDangers | 低 | 否 | 强缩短，避免恐吓式长文 |

## 6. 推荐方案总览

### 6.1 最推荐的总体方案

采用“三段式渐进生成 + 服务端缓存 + 低价值 section 缩写/后置”的组合方案。

顺序如下：

1. Hero Fast Lane
2. Core Reading Lane
3. Deep Dive Lane
4. Key Year 独立异步
5. D1 服务端缓存

### 6.2 为什么不是先调模型

因为现在最大的问题是结构，不是模型本身。

如果不拆结构，即使单 section 从 12 秒优化到 8 秒，整条链路依然慢。
如果先拆结构，就算模型速度不变，用户体感也会先大幅变好。

## 7. 方案一：三段式渐进生成

### 7.1 方案目标

把“用户现在必须看到的内容”和“用户稍后才会看的内容”拆开。

### 7.2 分段定义

#### Stage A: Hero Fast Lane

只负责：

1. nickname
2. coreQuote
3. hero.title
4. hero.supportLine
5. hero.proofLine

另外，Life Curve、当前阶段分数、当前阶段标签，优先使用现有规则数据，不依赖 AI。

目标：

1. 让页面先有“像样内容”
2. 先给用户被理解感
3. 不等 17 个 section

#### Stage B: Core Reading Lane

建议沿用当前 LITE 的 7 个核心 section：

1. summary
2. relationships
3. career
4. wealth
5. health
6. dashaTimeline
7. marriage

这些足够支撑当前页面的“为什么会这样”和“下一步大方向”。

#### Stage C: Deep Dive Lane

剩余 10 个 PRO-only section 改为背景加载或按需加载：

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

这些内容不应阻塞首屏。

### 7.3 推荐接口设计

为减少改动面，推荐保留原接口名，但新增 `mode` 参数。

推荐请求结构：

```json
{
  "profile": "...",
  "tier": "PRO",
  "mode": "hero"
}
```

`mode` 取值：

1. `hero`
2. `core`
3. `deep`

这样能最大程度复用当前：

1. `route.ts`
2. `generatePersonalityInsight`
3. `buildKlineAIBundle`
4. 已存在的 tier 与 section 过滤逻辑

### 7.4 前端行为调整

前端不要再等整包再渲染，而是改成：

1. 页面进入先请求 `mode=hero`
2. Hero 返回后立刻渲染 section 1 和 section 2 的核心视觉内容
3. 同时后台发 `mode=core`
4. 用户滚到 diagnosis 或 action 前，如果 core 已完成则直接展示
5. 用户继续向下或点击 Go Deeper，再触发 `mode=deep`

### 7.5 验收标准

1. 新 chart 首屏应先看到 Hero，而不是整页 skeleton。
2. Hero 未完成时，Life Curve 仍可先渲染。
3. Diagnosis 与 Deep Dive 内容必须支持“后到达后补齐”。

## 8. 方案二：Key Year 独立异步

### 8.1 当前问题

当前 `generateKeyYearInsights(profile, keyYears)` 在 personality insight 完成后才开始。

这会造成两个问题：

1. Action 区块被整个 personality 阶段阻塞。
2. 主请求尾巴过长。

### 8.2 推荐改法

将 key year 独立为单独请求通道。

优先级方案：

1. 最优：`mode=action`，并行或稍后触发
2. 次优：直接复用已有 `/api/astrology/key-year-insights/route.ts`

### 8.3 产品层策略

Action 区块不是首屏第一优先，但属于高价值区。

因此推荐：

1. Hero 成功后，即刻异步触发 key year 请求
2. 不要等 core 结束才触发
3. 如果 key year 还没回来，先显示基于 `keyYears` 原始数据的轻量 fallback 卡片
4. AI 返回后再替换卡片 summary 和 advice

### 8.4 验收标准

1. Action 区块可以在没有完整 personality 的情况下独立出现。
2. Action 不应再阻塞 Hero。
3. AI 未返回时，Action 至少有可读 fallback。

## 9. 方案三：服务端缓存

### 9.1 原则

当前前端只有 60 秒客户端缓存，不够。

真正该做的是服务端缓存，因为：

1. 同一张盘会被重复访问
2. 同一 tier 会重复访问
3. PRO 天然可以复用 LITE 的前 7 个 section

### 9.2 已知缓存约束

仓库已有 D1 缓存约定：

1. 表名：`ai_insight_cache`
2. 列名：`data`
3. key 格式：`${sha256(profile)}:${tier}`
4. TTL：30 天
5. PRO 可在 miss 时复用 LITE 缓存，再补 10 个 PRO-only section

### 9.3 推荐缓存策略

| 缓存层 | 内容 | key |
| --- | --- | --- |
| Hero 缓存 | nickname/coreQuote/hero 文案 | `${sha256(profile)}:HERO:${locale}` |
| Core 缓存 | LITE 7 个核心 section | `${sha256(profile)}:LITE:${locale}` |
| Deep 缓存 | PRO 完整 17 个 section | `${sha256(profile)}:PRO:${locale}` |
| Action 缓存 | key year insights | `${sha256(profile)}:ACTION:${locale}:${yearHash}` |

说明：

1. 加上 `locale`，避免语言串包。
2. Action 单独缓存，避免只因年份数组变化而 miss 整个 personality。

### 9.4 推荐实现方式

新增一个服务端缓存封装层：

- `src/lib/astrokline/kline-bundle-cache.ts`

对外暴露：

1. `getCachedHeroBundle(...)`
2. `setCachedHeroBundle(...)`
3. `getCachedCoreBundle(...)`
4. `setCachedCoreBundle(...)`
5. `getCachedDeepBundle(...)`
6. `setCachedDeepBundle(...)`
7. `getCachedActionBundle(...)`
8. `setCachedActionBundle(...)`

内部优先复用现有 D1 表结构与 hash key 规则。

### 9.5 验收标准

1. 同一 chart 第二次进入页面，Hero 应接近秒开。
2. PRO 命中 LITE 时，不应重复生成前 7 个 section。
3. 缓存 miss 与 hit 要有明确日志，方便观测。

## 10. 哪些内容应该缩短，哪些应该后置

### 10.1 内容决策原则

判断一个 section 是否该缩短，不是看它“能不能写”，而是看它是否满足这 3 个条件：

1. 用户会不会主动来找它。
2. 它是否直接影响用户的当前决策。
3. 它是否值得在主链路上消耗 10 秒级 AI 时间。

### 10.2 新的 section 分层建议

| section | 用户价值 | 建议 |
| --- | --- | --- |
| summary | 高 | 保留在 core，略缩短 |
| relationships | 极高 | 保留在 core，重点打磨 |
| career | 中高 | 保留在 core，缩短 |
| wealth | 中高 | 保留在 core，缩短 |
| health | 中 | 保留在 core，缩短 |
| dashaTimeline | 极高 | 保留在 core，重点打磨 |
| marriage | 中高 | 保留在 core，但避免默认婚育 |
| strengths | 中 | 移到 deep，改短卡片 |
| warnings | 中 | 移到 deep，改短卡片 |
| karma | 中 | 移到 deep，保留但压缩 |
| family | 中低 | deep，强压缩 |
| children | 中低 | deep，强压缩，且避免默认想生育 |
| spirituality | 中低 | deep，强压缩 |
| education | 低 | deep，改极短摘要 |
| authority | 低 | deep，改极短摘要 |
| lifestyle | 低 | deep，改极短摘要 |
| hiddenDangers | 低 | deep，强压缩，避免恐吓语气 |

### 10.3 建议的新字数预算

当前不少 section 在 140 到 300 词。

建议改成：

| section | 当前范围 | 建议范围 |
| --- | --- | --- |
| summary | 180-240 | 120-160 |
| relationships | 220-300 | 160-220 |
| career | 160-220 | 120-160 |
| wealth | 160-220 | 100-140 |
| health | 160-220 | 100-140 |
| dashaTimeline | 160-220 | 120-160 |
| marriage | 160-220 | 130-180 |
| strengths | 140-200 | 80-110 |
| warnings | 140-200 | 80-110 |
| karma | 160-220 | 100-130 |
| family | 140-200 | 80-110 |
| children | 140-200 | 80-110 |
| spirituality | 140-200 | 80-110 |
| education | 140-200 | 70-90 |
| authority | 140-200 | 70-90 |
| lifestyle | 140-200 | 70-90 |
| hiddenDangers | 140-200 | 70-90 |

### 10.4 低价值 section 的输出格式建议

低价值 section 不再需要两三段 prose，建议统一成紧凑格式：

1. 一句 headline
2. 两条 placement evidence
3. 一句 `What this means now`

这样做的好处：

1. 更快
2. 更短
3. 更好读
4. 不会在低价值信息上消耗太多注意力

## 11. 面向女性用户的 prompt 优化方案

### 11.1 当前已有的好基础

当前 `ASTRO_SYSTEM_PROMPT` 已经有这些好点：

1. 明确写了 primary audience 是 women 25-45
2. 强调 relationships first
3. 强调 warm counselor tone
4. 强调被看见、被理解

但还可以更进一步。

### 11.2 需要新增的 prompt 约束

建议在 `src/lib/astrokline/gemini.ts` 的系统 prompt 中增加以下原则：

1. 不默认婚育目标。
2. 不默认异性恋关系。
3. 不把“领导力、权威、公众形象”写成核心欲望。
4. 在 relationship 类内容中，优先写安全感、互相性、边界、情绪负担，而不是只写 chemistry。
5. 在 career 类内容中，优先写可持续、价值感、稳定扩张，不写强攻击性成功学口吻。
6. 在 warnings/hiddenDangers 中，禁止灾难化表达。
7. 每段输出都要优先回答“这对她现在意味着什么”。

### 11.3 推荐新增的系统 prompt 文案

建议加入如下规则块：

```text
## Women-Centered Relevance Rules
- Assume the reader wants emotional clarity, relational safety, reciprocity, self-trust, and better timing.
- Do NOT assume marriage, motherhood, or a male partner.
- Do NOT write like ambition, dominance, or public status are the default goal.
- In love readings, prioritize: nervous system safety, emotional honesty, consistency, reciprocity, and boundaries.
- In career readings, prioritize: sustainability, dignity, aligned ambition, financial steadiness, and freedom from burnout.
- In warning sections, reduce fear. Name the pattern, give the boundary, and explain the practical protection move.
- Every section must answer: what is happening now, why it feels this way, and what she should do next.
```

### 11.4 各类 section 的风格调整

#### relationships

要强化：

1. 她在关系里是怎么先感受到不对劲的
2. 她容易吸引什么类型的人
3. 哪种关系模式会让她耗尽
4. 哪种伴侣互动会让她稳定

少写：

1. 空泛的浪漫命运感
2. 只有 chemistry、没有安全感的描述

#### marriage

要保留，但必须改写为：

1. 长期亲密关系模式
2. commitment readiness
3. deeper partnership archetype

避免写成：

1. “你一定会在什么时候结婚”
2. “命中注定某种丈夫类型”

#### career

要强调：

1. 什么工作方式不会耗干她
2. 她什么时候适合稳定推进，什么时候适合收缩
3. 她怎样更有价值感，而不是更像 KPI 机器

#### hiddenDangers

必须改为：

1. 风险识别
2. 边界提醒
3. 保护动作

不能写成宿命警报。

### 11.5 低价值 section 的 prompt 缩写策略

在 `src/lib/astrokline/section-prompts.ts` 中，为低价值 section 单独增加 compact 指令，例如：

```text
Return a compact reading.
- 1 short headline
- 2 evidence bullets
- 1 practical sentence
- Maximum 90 words
```

建议用于：

1. education
2. authority
3. lifestyle
4. hiddenDangers
5. family
6. spirituality

## 12. 具体工程方案

### 12.1 需要修改的文件

#### 1. `src/lib/astrokline/section-prompts.ts`

要做的事：

1. 调整 `wordRange`
2. 增加 section 分层常量，例如：
   - `HERO_SECTION_KEYS`
   - `CORE_SECTION_KEYS`
   - `DEEP_SECTION_KEYS`
3. 为低价值 section 增加 compact prompt 规则
4. 为 relationship / marriage / career / warnings / hiddenDangers 加入更明确的女性向风格指令

#### 2. `src/lib/astrokline/gemini.ts`

要做的事：

1. 增加基于 `mode` 的生成入口
2. 新增 `generateHeroInsight(...)`
3. 允许 `generatePersonalityInsight(...)` 只跑 core 或 deep 子集
4. 对 low-value sections 使用更小的 token budget
5. 如果可行，Hero 改为 streamGenerateContent，先把首屏内容推出来
6. 更新系统 prompt，加入更精确的女性用户相关约束

#### 3. `src/app/api/astrology/kline-brief/route.ts`

要做的事：

1. 请求 schema 增加 `mode`
2. `mode=hero` 时只返回 Hero 所需字段
3. `mode=core` 时返回 LITE 7 个核心 section
4. `mode=deep` 时仅返回 PRO-only 10 个 section
5. 将 action 生成逻辑独立，不再默认阻塞主链路
6. 接入服务端缓存

#### 4. `src/lib/astrokline/kline-ai-bundle.ts`

要做的事：

1. 支持 partial bundle merge
2. Hero、Core、Deep、Action 分阶段拼装
3. bundle meta 中增加阶段状态，例如：
   - `heroReady`
   - `coreReady`
   - `deepReady`
   - `actionReady`

#### 5. `src/components/astrocurve/kline/shared-kline-result.tsx`

要做的事：

1. 页面加载先发 Hero 请求
2. Hero 到达即渲染上半屏
3. Core 在后台请求并更新 diagnosis
4. Deep 在用户滚动到对应区域或点击时触发
5. Action 独立请求并局部更新
6. Skeleton 要按区块级别显示，不要全页锁死

#### 6. `src/lib/astrokline/kline-bundle-cache.ts`

新增文件，负责服务端缓存读取与写入。

#### 7. `src/app/api/astrology/key-year-insights/route.ts`

如果复用现有 action 通道，则这里需要：

1. 明确支持当前 Kline 页面单独调用
2. 增加缓存

### 12.2 推荐实施顺序

#### Phase 1: 低风险高收益

1. 缩短低价值 section 字数预算
2. 为低价值 section 改 compact 输出格式
3. Action 独立异步
4. 接入或修复 D1 缓存

这是最快能出效果的一阶段。

#### Phase 2: 结构性提速

1. 加 `mode=hero|core|deep`
2. 前端改成渐进渲染
3. 深内容延后触发

这是最核心的一阶段。

#### Phase 3: 质量调优

1. 女性向 prompt 精修
2. 低价值 section 风格进一步压缩
3. Hero 尝试流式输出

## 13. 建议的目标指标

### 13.1 体验目标

| 指标 | 当前 | 目标 |
| --- | --- | --- |
| 首屏 Hero 可见时间 | 约 80s 级链路阻塞 | uncached 8-12s 内出现 |
| Core 到达时间 | 与整包绑定 | uncached 15-25s |
| Deep 完整时间 | 与整包绑定 | 后台完成或按需加载 |
| 重复访问时间 | 前端 60s 内快 | 服务端缓存后接近秒开 |

### 13.2 内容目标

1. 用户读到第二屏前就知道自己现在处于什么阶段。
2. 用户在 relationship 和 dashaTimeline 上感到“被看见”。
3. 用户不再被低价值长文拖累。
4. warnings/hiddenDangers 的阅读体验应从“焦虑感”改成“边界感和保护感”。

## 14. 埋点与验证

### 14.1 需要新增的埋点

建议新增以下事件：

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

### 14.2 需要观察的业务信号

1. 首屏等待时间是否明显下降
2. 用户是否更常滚到 diagnosis
3. Ask Chart 打开率是否提升
4. 保存 chart 或继续交互的比例是否提升

## 15. 风险与注意事项

### 15.1 风险

1. 如果渐进加载做得不好，页面可能出现“内容突然跳变”。
2. 如果 prompt 压缩过猛，命中感可能下降。
3. 如果女性向优化写得太死，会变成新的刻板印象。

### 15.2 应对

1. 用区块级 skeleton 和稳定高度，减少布局跳动。
2. 先压低价值 section，再看是否需要压高价值 section。
3. 在 prompt 中强调“不默认婚育、不默认异性恋、不默认权力野心”。

## 16. 最终推荐决策

如果只能做 3 件事，我建议按这个顺序执行：

1. 上 D1 服务端缓存，并确保 PRO 可以复用 LITE。
2. 拆 Hero / Core / Deep 三段式生成，首屏不再等整包。
3. 把 Action 从 personality 主链路里拆出来，并把低价值 section 改成短格式。

原因很明确：

1. 缓存解决重复访问速度。
2. 三段式解决首屏体验。
3. Action 解耦和低价值缩写解决主链路总长度。

## 17. 给执行工程师的 Checklist

### Phase 1

1. 调整 `section-prompts.ts` 的 wordRange
2. 加 compact prompt 规则
3. 核对 D1 缓存表字段是否使用 `data`
4. 确保 PRO miss 时可以回退读取 LITE 缓存
5. 将 action 改成单独请求或单独 mode

### Phase 2

1. `route.ts` 增加 `mode`
2. `gemini.ts` 增加 hero/core/deep 生成入口
3. `kline-ai-bundle.ts` 支持 partial merge
4. `shared-kline-result.tsx` 改成渐进式渲染

### Phase 3

1. 微调女性向 prompt
2. 压缩 low-value section 的输出
3. 观察关系区、时间线区、Action 区点击和停留

---

## 18. 一句话版本

现在最该做的不是“让 17 个 section 更快一起回来”，而是“只让用户先看到她真正关心的内容，把剩下的内容放到后面”。