# Kline 第 4 部分审计

目标范围：How To Move Through The Next Chapter

## 结论

第 4 部分现在基本不是 AI 生成。

它主要由 3 类内容组成：

1. 纯系统预设文案
2. 基于分数和 transit 的规则拼接文案
3. 一个完全模板化的 5 年计划组件

所以你的判断是对的：这一段目前不符合“应该是 AI 生成，而不是系统模板”的要求。

## 哪些是系统预设

文件：[src/components/astrocurve/kline/shared-kline-result.tsx](src/components/astrocurve/kline/shared-kline-result.tsx)

### 1. 第 4 部分标题和说明是纯模板

- `SECTION_COPY.en.action.eyebrow`
- `SECTION_COPY.en.action.title`
- `SECTION_COPY.en.action.description`
- `SECTION_COPY.en.action.cards.*`
- `SECTION_COPY.en.action.futureTitle`
- `SECTION_COPY.en.action.futureDescription`

这一组是固定字符串，不经过 AI。

### 2. `buildStageNarrative(...)` 是纯模板分桶

文件位置：同一个文件顶部的 `buildStageNarrative`

它按 score 分 3 桶：

- `score >= 75`
- `score >= 55`
- 其余

每一桶都返回固定的：

- `title`
- `summary`
- `advice`

这不是 AI，只是规则模板。

### 3. `describeFutureMoment(...)` 是规则拼接，不是 AI

它从 `klineData` 和 `transitDetails` 里找：

- peak
- pivot
- pressure

然后拼出这种句子：

- `${event.planet} ${event.aspect} shifts your ${event.theme.toLowerCase()} timeline.`
- `${point.stage} energy becomes more visible here.`

这也是模板拼接，不是 AI。

## 第 4 部分页面上每一块的来源

### A. 三张卡片

来源文件：[src/components/astrocurve/kline/shared-kline-result.tsx](src/components/astrocurve/kline/shared-kline-result.tsx)

- `Focus` 卡：`stageNarrative.title` + `stageNarrative.summary`
- `Next Window` 卡：`nextWindow.year` + `nextWindow.summary ?? stageNarrative.advice`
- `Guardrail` 卡：固定标题 `Stay deliberate, not reactive` + `guardrailWindow.summary ?? stageNarrative.advice`

结论：这三张卡都不是 AI。

### B. 下方 “Your Longer Timeline” 区块

来源文件：[src/components/astrocurve/kline/shared-kline-result.tsx](src/components/astrocurve/kline/shared-kline-result.tsx)

- 区块标题和说明：纯模板
- 内容主体：`ActionableFutureCliffhanger`

### C. `ActionableFutureCliffhanger`

来源文件：[src/components/astrocurve/kline/shared-kline-result.tsx](src/components/astrocurve/kline/shared-kline-result.tsx)

- `PRO` 用户：进入 `FiveYearPlan`
- 非 `PRO` 用户：显示一层 teaser + paywall

这里没有 AI 分支。

## `FiveYearPlan` 里哪些是模板

文件：[src/components/astrocurve/kline/five-year-plan.tsx](src/components/astrocurve/kline/five-year-plan.tsx)

### 1. 顶部说明是纯模板

- `A year-by-year roadmap of energy shifts...`

### 2. `Peak Year` 区块是规则生成，不是 AI

- 从 `yearPlans` 算 `bestYear`
- 然后显示 `Peak Year: {bestYear.year}`

### 3. 每年 verdict 是规则分桶

函数：`getYearVerdict(score, change)`

固定返回：

- `Strong Growth`
- `Steady Progress`
- `Transition Period`
- `Challenge Phase`
- `Rebuilding`

### 4. 四维度 Career / Wealth / Love / Health 是规则偏移

函数：`getDimScore(...)`

再叠加 `stageOffsets`：

- `Peak Flow`
- `Expansion`
- `Harvest`
- `Renewal`
- `Consolidation`
- `Reflection`
- `Transformation`
- `Challenge`
- `Grounding`

这完全是系统规则，不是 AI。

### 5. 非 `PRO` 的 teaser 文案是硬编码模板

同文件里有两段非常明显的模板句：

- `The Next Chapter of Your Story`
- `Between 2026 and 2028...`
- `career curve shows a critical pivot point around 2027...`

这里虽然插了 `profile.sun.sign`，但本质还是写死模板。

## 现在真正用了 AI 的地方

### 1. Hero 顶部卡片

文件：[src/components/astrocurve/kline/result-command-deck.tsx](src/components/astrocurve/kline/result-command-deck.tsx)

这里会尝试读取：

- `aiInsight.summary`
- `aiInsight.career / wealth / relationships / health / strengths`
- `aiInsight.coreQuote`

但仍然混有 fallback 模板。

### 2. 第 3 部分诊断区

文件：[src/components/astrocurve/kline/ai-reading-panels.tsx](src/components/astrocurve/kline/ai-reading-panels.tsx)

这里才是 Kline 页面里最主要的 AI 内容来源。

## 为什么你会看到“低级重复”

主要有 3 个原因：

1. 第 4 部分声明自己“不重复 daily guidance”，但实际又大量回退到 `stageNarrative.advice`。
2. `Next Window` 和 `Guardrail` 在拿不到更具体 summary 时，会一起回退到同一句 `stageNarrative.advice`。
3. `FiveYearPlan` 和 paywall teaser 都是模板化强文案，所以会继续放大“像系统文案”的感觉。

## 我给你的判断

如果你的要求是：

- 第 4 部分也要尽量 AI 生成
- 不要系统模板味
- 不要重复 hero 的建议

那么当前实现不合格。

## 我建议的改法

### 方案 A：最小改法

保留现有结构，但把第 4 部分改成：

- 标题保留
- 三张卡改为优先使用 `key-year-insights` 的 `aiSummary / aiAdvice`
- 没有 AI 时再回退模板

优点：改动小，能快速止血。

### 方案 B：按你的要求重做

把第 4 部分改成真正的 AI action layer：

- 一个 AI 生成的“未来 2-3 年主线判断”
- 一个 AI 生成的“最该抓住的窗口”
- 一个 AI 生成的“最该避免的模式”
- `FiveYearPlan` 只保留数据图，不再写模板文案

优点：更接近你原要求。
缺点：需要改数据链路和 prompt 设计。

## 现在最关键的一句

第 4 部分当前不是 AI 主导。

它是“模板文案 + 规则拼接 + 少量数据插值”，不是你要的那种 AI 生成层。

## 本轮重构后，剩余的预设残留

已经去掉的：

1. 第 4 部分顶部说明句
2. `FiveYearPlan` 顶部 roadmap 说明
3. 非 PRO teaser 的两段硬编码长文
4. 已经不再渲染但还留在多语言表里的 action 描述字段

现在还剩下的固定文案，主要是结构标签，不是长段落：

1. 第 4 部分标题：`How To Move Through The Next Chapter`
2. 三张卡的小标签：`Focus` / `Next Window` / `Guardrail`
3. 下方区块标题：`Your Longer Timeline`
4. `FiveYearPlan` 里的数据标签：
	- `Strong Growth` / `Steady Progress` / `Transition Period` / `Challenge Phase` / `Rebuilding`
	- `Career` / `Wealth` / `Love` / `Health`
	- `Life Stage`

我的判断：

- 这些残留现在更像 UI 骨架标签
- 不再是之前那种大段模板解释文案
- 如果你还要继续往“几乎全 AI”推进，下一刀就该改这些结构标签和 `FiveYearPlan` 的 verdict label

## 本轮额外限制

第 4 部分当前已加长度控制：

1. `Focus` 卡标题约 96 字以内
2. `Focus / Next Window / Guardrail` 正文约 200 字以内
3. 非 PRO 预览卡正文约 200 字以内
4. 非 PRO 预览建议行约 160 字以内