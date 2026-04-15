# PRD v2: AstroKline 沉浸式占星体验全面重设计

> **版本**: v2.0 — 全面升级版  
> **日期**: 2026-04-14  
> **一句话**: 把"信息展示工具"变成"让用户心跳加速、不付费就睡不着"的占星体验。

---

## 一、产品现状 vs 目标状态

### 现状（问题全景）

```
首页 Landing
├─ 文案 "Your Stars Have a Message for You" — 抽象、无痛点共鸣
├─ 纯文字为主，缺乏星座品类视觉锚点（无星座图标，无星空氛围）
├─ 社交证明弱（几个头像 + 数字）
└─ 用户感受：这是个什么网站？跟星座有什么关系？

测试完成后结果页
├─ 第一屏：Natal Chart + Cosmic ID Card（日历式评分）— 数字罗列，冲击力弱
├─ 第二屏：K线生命曲线 — 本该是最震撼的视觉，却被埋在下面
├─ 诊断用爱情做验证 — 命中率低，用户觉得不准
├─ 内容展开平铺直叙 — 没有悬念节奏，情绪平缓
├─ 锁定方式生硬（突然出现🔒）— 没有"快看到了但又看不清"的焦虑感
└─ 用户感受：看完觉得"哦"，而不是"卧槽！"
```

### 目标状态

```
首页 Landing
├─ 文案直击用户焦虑："Your Next 3 Years, Mapped."
├─ 星座 SVG 图标 + 星空粒子背景 + 星盘纹理 — 一眼就是占星产品
├─ 实时滚动社交证明 + 星座标签 — "Leo ♌ just unlocked"
└─ 用户感受：哇，这个看起来很专业，我要试试

结果页
├─ 第一屏：K线生命曲线 — 动画绘入，当前位置脉冲发光，峰值/低谷极端色差
├─ 第二屏：过去验证 — 高命中率事件，连续命中让用户震惊 "它怎么知道？！"
├─ 第三屏：Cosmic Profile（原 Dashboard 重命名）— 身份卡 + 评分 + 对比
├─ 第四屏：诊断（关键词打码 + 渐变模糊）— "我快看到了…但又看不清"
├─ 第五屏：行动计划（大部分锁定）— "告诉我该怎么做啊！"
├─ 第六屏：付费释放 — "算了，买了"
└─ 用户感受：心跳加速 → 抓耳挠腮 → 必须付费
```

---

## 二、设计哲学

### 情绪过山车四拍节奏

每个页面必须制造这条情绪曲线：

```
 震撼         好奇/验证        焦虑/渴望        释放(付费)
  ┃             ┃               ┃               ┃
  ┃   ╭─────╮   ┃  ╭────────╮   ┃               ┃
  ┃  ╱       ╲  ┃ ╱          ╲  ┃   ╭────╮      ┃  ╭──
  ┃╱           ╲┃╱             ╲┃  ╱ 煎熬 ╲     ┃ ╱
  ╱              ╳               ╲╱         ╲    ┃╱
 ╱             ╱ ╲                            ╲──╳
0s            5s  10s           30s           60s
```

**五条铁律：**

| # | 铁律 | 方法 |
|---|------|------|
| 1 | **先给冲击，后给解释** | K线动画第一个出现，文字解读跟在后面 |
| 2 | **信息递减，悬念递增** | 免费部分越往下，关键信息逐字打码变模糊 |
| 3 | **对比制造焦虑** | "你 vs 同星座平均值"、"你现在 vs 你本可以的状态" |
| 4 | **验证建立信任** | 用过去已发生的高命中率事件，先让用户相信"它算得准" |
| 5 | **每一屏都有星座视觉锚点** | 12 星座 SVG 图标（非 emoji）贯穿全站 |

---

## 三、改动方案

---

### 【改动 1】结果页首屏重排 + Dashboard 重命名

#### 核心问题
现在测试完成后第一屏是 Natal Chart + Cosmic ID Card（评分卡），用户反馈"弹出来的第一个居然是日历版的评分，莫名其妙"。K线生命曲线才是视觉冲击最强的元素，必须排第一。

#### 页面重命名方案

| 现有名称 | 现有 ID | 新名称 | 新 ID | 原因 |
|---------|---------|--------|-------|------|
| Current Stage | `hero` | **Cosmic Profile** | `cosmic-profile` | 不再叫 "dashboard" 或 "current stage"，改为"你的宇宙身份档案"，更具占星感 |
| Life Curve | `life-curve` | **Destiny K-Line** | `destiny-kline` | 提升到第一位，名字强调"命运" |

#### 新页面顺序

| # | 章节 | 组件 | 导航标签 | 情绪节拍 |
|---|------|------|---------|---------|
| **01** | **Destiny K-Line** | `yearly-energy-curve` + 新 K线增强 | `K-Line` / `命運線` | **震撼** — 10年命运曲线动画绘入，当前脉冲，峰谷极端色差 |
| **02** | **Past Proof** | 新组件 `past-validation` | `Proof` / `検証` | **信任** — 3个高命中率事件验证，连续命中后显示准确率 |
| **03** | **Cosmic Profile** | `chart-hero` + `cosmic-id-card` 改造 | `Profile` / `檔案` | **好奇** — 身份卡 + 星座图标 + 百分位对比 |
| **04** | **Deep Reading** | `ai-reading-panels` + 打码增强 | `Reading` / `解読` | **焦虑** — 关键词打码、渐变模糊、"快看到但看不清" |
| **05** | **Action Map** | `action-plan` + 锁定增强 | `Action` / `行動` | **抓耳挠腮** — 行动建议大部分锁定，紧迫文案 |
| **06** | **Unlock** | 付费 CTA 区 | `Unlock` / `解鍵` | **释放** — 一键付费 |

#### floating-nav.tsx 改动

```
现有：01 Now → 02 Curve → 03 Why → 04 Action → 05 More
改为：01 K-Line → 02 Proof → 03 Profile → 04 Reading → 05 Action → 06 Unlock
```

每个导航项目前加上对应的占星 SVG 小图标（非 emoji）。

#### K线首屏（Destiny K-Line）详细设计

**视觉构成：**

```
┌──────────────────────────────────────────────────┐
│  [星座图标] Your Destiny K-Line                    │
│  ─────────────────────────────────────────────    │
│                                                   │
│   100 ┤          ╭──╮                             │
│       │        ╭╯    ╲      ╭╮                    │
│    75 ┤  ╭──╮╱        ╲   ╱  ╲    ╭──            │
│       │╱    ╲            ╲╱    ╲  ╱  ░░░░░(模糊)  │
│    50 ┤                         ╲╱   ░░░░░░░░░░   │
│       │                              ░░░░░░░░░░   │
│    25 ┤                                           │
│       └─────┬─────┬─────┬─────┬─────┬─────┬────  │
│          2020  2022  2024 ★NOW 2026  2028  2030   │
│              ♄       ♃    ●脉冲  ░模糊  ░░锁定     │
│                                                   │
│  ♄ Saturn Return (2022)    ♃ Jupiter Transit (2024)│
│  [行星图标带说明的图例]                               │
│                                                   │
│  "2022年, 你的人生曲线跌至谷底。你还记得那一年吗？"    │
│  ─── 悬念钩子，引导到下一屏「Past Proof」 ──────     │
└──────────────────────────────────────────────────┘
```

**动画时序：**

| 时间 | 动作 |
|------|------|
| 0-0.3s | 背景星座连线淡入 |
| 0.3-1.8s | K线从左到右逐年绘入，每经过一个年份节点闪现对应行星 SVG 符号 |
| 1.8s | 到达当前年份 → **脉冲光点**开始持续跳动（金色 #D4AF37 光晕） |
| 2.0s | 峰值点弹出绿色标签 `"Peak"` + 低谷点弹出红色标签 `"Valley"` |
| 2.5s | 未来年份区域渐变模糊（从半透明到完全锁定） |
| 3.0s | 底部出现悬念文案 + 向下箭头引导 |

**数据节点上的行星 SVG 图标：**
- 每个年份节点旁显示当年最重要的行星过境对应的 SVG 图标
- 例：土星回归年 → 土星 SVG、木星过境年 → 木星 SVG
- 图标尺寸 20×20px，颜色跟随节点颜色（绿/红/金）

---

### 【改动 2】Past Proof — 过去验证模块（全新章节）

#### 为什么需要这个章节

用户第一次看到 K线曲线时，内心反应是"这准吗？"。如果下一步直接展示评分或诊断，用户带着怀疑看所有内容，付费意愿极低。

**Past Proof 的作用：用过去已经发生的事情证明"我们算得准"。**

当用户连续 2-3 次确认"确实如此"后，潜意识就会切换到"这个东西真的知道我的事"，之后看到的所有锁定内容都会产生"我必须知道"的冲动。

#### 事件选择策略：只选高命中率事件，完全移除爱情

**为什么移除爱情验证：**
- 爱情事件的时间点因人而异，命中率低（约 40%）
- 一旦不准，用户立刻不信任所有其他内容
- 单身用户看到爱情验证会有负面情绪

**高命中率事件排序（基于占星学行星过境的普遍感知度）：**

| 优先级 | 事件类型 | AI prompt 指导 | 命中率 | 原理 |
|--------|---------|---------------|--------|------|
| 1 | **重大压力/方向迷失** | 找土星过境（尤其土8/土12）、冥王过境期 | ~85% | 土星周期几乎人人有感 |
| 2 | **环境/居住变化** | 找木星/天王过境4宫期 | ~75% | 搬家是可验证的客观事实 |
| 3 | **事业/学业重大决定** | 找木星/土星过境10宫、中天合相期 | ~75% | 事业转折记忆深刻 |
| 4 | **身体/精力明显波动** | 找火星/土星过境6宫或1宫期 | ~70% | 健康波动容易回忆 |
| 5 | **人际关系重组**（非爱情） | 找冥王过境7宫、土星过境11宫 | ~65% | 友谊/合伙/家庭关系变化 |

**Prompt 硬约束：** AI 生成验证事件时，系统 prompt 中插入：
```
STRICT RULE: Do NOT generate any validation events about:
- love, romance, dating, breakups, marriage, divorce
- romantic partners, soulmates, crush  
Focus ONLY on: career, health, relocation, pressure, education, family dynamics, friendship changes
```

#### 交互流程设计

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│  [K线图中 2021 年的红色低谷点开始脉冲闪烁]              │
│                                                      │
│       ...╲                                           │
│            ╲   ★ ← 脉冲红点                           │
│             ╲╱                                       │
│                                                      │
│  ═══════════════════════════════════════════════════  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  ♄ Saturn Transit · 2021                        │  │
│  │                                                 │  │
│  │  "Around late 2021 to early 2022,                │  │
│  │   you experienced intense pressure,              │  │
│  │   a sense of being lost, or a major setback."   │  │
│  │                                                 │  │
│  │  Score dropped to: 28/100                       │  │
│  │                                                 │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │  ✓ That's     │  │  ✗ Not       │             │  │
│  │  │   accurate    │  │   quite      │             │  │
│  │  └──────────────┘  └──────────────┘             │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**用户点击「That's accurate」后：**

1. K线上该点变成 ✓ 绿色验证标记（带微动画）
2. 卡片滑出，下一个验证事件卡片滑入（0.4s 过渡）
3. 连续命中 2 次后 → 底部出现信任强化条：

```
┌─────────────────────────────────────────────────┐
│  ✓✓ 2/2 verified · Accuracy: 100%               │
│  Based on your exact planetary positions         │
│  calculated to 0.001° precision                  │
└─────────────────────────────────────────────────┘
```

4. 第 3 个验证完成后 → 整体信任条变金色：
```
"Your chart accuracy: 93% — calculated from 
 real planetary ephemeris data"
```
→ 然后自动平滑滚动到下一章节 Cosmic Profile

**用户点击「Not quite」时：**
- 不做负面反馈
- 轻描淡写跳过：`"Every chart is unique. Let's check another period."`
- 切到下一个验证事件

---

### 【改动 3】首页全面重设计 — 文案 + 视觉 + 氛围

#### 3a. 主标题文案（已选定方案A）

```
主标题: Your Next 3 Years, Mapped.
副标题: See exactly when your career peaks, when to stay cautious,
        and the one window you can't afford to miss.
```

**每种语言的适配：**

| 语言 | 主标题 | 副标题 |
|------|--------|--------|
| EN | Your Next 3 Years, Mapped. | See exactly when your career peaks, when to stay cautious, and the one window you can't afford to miss. |
| JA | あなたの3年後、解読済み。 | キャリアの頂点、慎重になるべき時期、見逃せない転機がいつ来るか — すべてがここに。 |
| ES | Tus Próximos 3 Años, Mapeados. | Descubre exactamente cuándo prospera tu carrera, cuándo ser cauteloso, y la ventana que no puedes perderte. |
| ZH | 你的未来三年，已被解读。 | 事业何时到达顶峰、何时该谨慎行事、那个你不能错过的窗口期 — 全部在这里。 |
| KO | 당신의 다음 3년, 해독 완료. | 커리어가 정점에 달하는 시기, 신중해야 할 때, 놓칠 수 없는 전환점이 언제 오는지 확인하세요. |

#### 3b. 快速问题预告 — 换成高痛点问题

**现有（移除）：**
```
"When is my best time for career?"
"When will I find true love?"     ← 移除
"..."
```

**改为：**
```
"Should I take the leap or play it safe in 2026?"
"Why does everything feel stuck right now?"
"When is my next turning point?"
```

这三个问题覆盖用户来占星网站的三大真实动机：
1. **决策焦虑** — 我该怎么选？
2. **现状不满** — 为什么感觉不对？
3. **未来好奇** — 什么时候会变好？

#### 3c. 首页 Hero 区视觉重构

**现有 Hero 视觉层：**
```
文字标题 + 描述 + Authority Proof 条 + 表单
背景：纯暗色 + noise 纹理
```

**改为 5 层视觉叠加：**

```
Layer 5 (最上): 文案 + 表单（不变）
Layer 4: 浮动星座 SVG 符号（6-8个，缓慢漂浮，opacity 0.06-0.12）
Layer 3: 星座连线网格（SVG path，缓慢旋转，opacity 0.04）
Layer 2: 微光粒子（tiny dots，随机闪烁，模拟星空，opacity 0.08）
Layer 1 (最底): 暗色背景 + noise.svg 纹理 + 中心径向渐变金色光晕
```

**星座 SVG 浮动符号规则：**
- 使用 12 星座的线条风格 SVG 图标（下面【改动 4】定义）
- 随机选取 6-8 个符号
- 每个符号 40-80px 大小
- 极低透明度（0.06-0.12），不干扰阅读
- 用 CSS `@keyframes float` — 上下缓慢浮动（6-12s 周期）
- 颜色：`#D4AF37` 金色描边，无填充

#### 3d. 社交证明升级

**现有：**
```
3 个头像叠放 + "★★★★★ 4.9" + "1,204 Exploring Now"
```

**改为实时滚动条 + 星座标签：**

```
┌─────────────────────────────────────────────────┐
│  ♌ Emily · just unlocked full report   3 min ago │
│  ♏ Kai · "accuracy blew my mind"       7 min ago │
│  ♒ Sarah · revealed her 2027 timeline  12 min ago│
└─────────────────────────────────────────────────┘
  ↕ 自动滚动（marquee-vertical），每 4 秒切换一条
```

每条包含：
- **星座 SVG 小图标**（16px）
- 名字（随机生成）
- 动作描述（解锁报告 / 验证准确 / 分享 K线）
- 时间（"X min ago"，随机 1-30 分钟）

#### 3e. 表单仪式感强化

**现有提交后：** 通用 loading spinner

**改为星盘 loading 仪式：**

```
┌──────────────────────────────────────────┐
│                                           │
│        ╭── 星盘轮图 SVG 旋转 ──╮           │
│       │    行星符号依次亮起      │          │
│       │    ♄ → ♃ → ♂ → ☉ → ☽   │          │
│        ╰──────────────────────╯           │
│                                           │
│      "Mapping your celestial blueprint..." │
│               ▸▸▸  (进度条)               │
│                                           │
│    Calculating 10 planetary positions      │
│    Cross-referencing 120-year ephemeris    │
│    Generating your unique K-Line pattern   │
│                                           │
└──────────────────────────────────────────┘
```

- 星盘轮图使用现有 `astrology-chart-wheel.tsx` 的简化版
- 行星符号依次从暗变亮（0.3s 间隔）
- 底部分步骤文案自动切换（制造"复杂计算"的感知）
- 总时长 3-4s（即使实际计算更快，也要有仪式感）

---

### 【改动 4】占星视觉系统 — 12星座 SVG 图标 + 全站视觉渗透

#### 核心原则
**用户打开一个占星网站，必须在 0.5 秒内"感觉到"这是占星。** 不是通过读文字，而是通过视觉符号。

现在的网站文字多、图标少，用户潜意识觉得"这不像那么回事儿"。需要注入大量占星品类的专属视觉元素。

#### 4a. 12 星座 SVG 图标系统（核心资产）

**设计规范：** 线条风格（line-art），非卡通，非 emoji。

```
风格: 精细线条描边（stroke-width: 1.5-2px）
颜色: 默认 #D4AF37（品牌金色），可根据元素变色
填充: 无填充（transparent），纯描边
尺寸: 设计稿 64×64px，支持 16/24/32/48/64 多尺寸
格式: 每个星座一个独立 React SVG 组件
圆角: 略带圆角的线条（不要生硬直角）
```

**12 星座图标清单：**

| 星座 | SVG 特征 | 元素 | 颜色标识 |
|------|---------|------|---------|
| Aries ♈ | 羊角曲线（两条对称弧线从中心向上外翻） | 火 | `#E74C3C` 红 |
| Taurus ♉ | 牛头轮廓（圆圈 + 上方两角弧线） | 土 | `#8B7355` 棕 |
| Gemini ♊ | 双子柱（两条平行竖线 + 上下横连） | 风 | `#F1C40F` 黄 |
| Cancer ♋ | 螃蟹钳（两个 69 式对称弧） | 水 | `#3498DB` 蓝 |
| Leo ♌ | 狮子鬃毛（圆圈 + 向右延伸的鬃毛曲线） | 火 | `#D4AF37` 金 |
| Virgo ♍ | 处女座符号（M + 右侧下划弧线） | 土 | `#27AE60` 绿 |
| Libra ♎ | 天秤（横线 + 上方半圆弧） | 风 | `#E91E8A` 粉 |
| Scorpio ♏ | 蝎尾（M + 右侧箭头上翘） | 水 | `#8E44AD` 紫 |
| Sagittarius ♐ | 射手箭（对角箭头 + 横划线） | 火 | `#E67E22` 橙 |
| Capricorn ♑ | 山羊角（V + 右侧卷曲尾部） | 土 | `#2C3E50` 深灰 |
| Aquarius ♒ | 水波纹（两条平行波浪线） | 风 | `#1ABC9C` 青 |
| Pisces ♓ | 双鱼（两条对称弧线 + 中间横线） | 水 | `#2E86AB` 蓝绿 |

**行星 SVG 图标清单（7 颗经典行星 + 3 颗外行星）：**

| 行星 | SVG 特征 | 功能对应 |
|------|---------|---------|
| ☉ Sun | 圆圈 + 中心圆点 | 核心自我 |
| ☽ Moon | 月牙弧 | 情感/内在 |
| ☿ Mercury | 圆圈 + 上方十字 + 顶部半圆 | 思维/沟通 |
| ♀ Venus | 圆圈 + 下方十字 | 美/财富 |
| ♂ Mars | 圆圈 + 右上箭头 | 行动/能量 |
| ♃ Jupiter | 数字 4 的变体 | 事业/扩张 |
| ♄ Saturn | 十字 + 左下弧线 | 压力/责任 |
| ♅ Uranus | H + 下方圆圈 | 突变/创新 |
| ♆ Neptune | 三叉戟 | 直觉/灵性 |
| ♇ Pluto | P 带弧线 | 权力/转化 |

**组件接口设计：**

```typescript
// components/icons/zodiac-icon.tsx
interface ZodiacIconProps {
  sign: ZodiacSign;         // 'aries' | 'taurus' | ... | 'pisces'
  size?: 16 | 24 | 32 | 48 | 64;
  color?: string;           // 默认使用该星座的元素色
  glow?: boolean;           // 是否有光晕效果
  animated?: boolean;       // 是否有微动画（呼吸效果）
  className?: string;
}

// components/icons/planet-icon.tsx
interface PlanetIconProps {
  planet: Planet;           // 'sun' | 'moon' | 'mercury' | ... | 'pluto'
  size?: 16 | 24 | 32 | 48;
  color?: string;
  className?: string;
}
```

#### 4b. 全站星座视觉渗透点位

| 页面 | 位置 | 元素 | 说明 |
|------|------|------|------|
| **Landing Hero** | 背景 | 6-8 个星座 SVG 低透明度漂浮 | Layer 4，`opacity: 0.06-0.12`，`@keyframes float` |
| **Landing Hero** | 表单标题旁 | 用户太阳星座的 SVG 图标 | 输入生日后自动识别并显示 |
| **Landing** | 三个快速问题前 | 对应行星 SVG | ♃ 事业 / ♄ 压力 / ♅ 转折 |
| **Landing** | 社交证明条 | 每条前面的星座 SVG | 16px 尺寸 |
| **Loading** | 星盘旋转中 | 10 颗行星 SVG 依次点亮 | 从暗→金色渐变 |
| **K-Line** | 每个年份节点旁 | 该年主导行星 SVG | 20px，颜色跟随节点色 |
| **K-Line** | 章节标题前 | 小型星座装饰 SVG | 作为 section icon |
| **Past Proof** | 验证卡片标题 | 对应行星 SVG | ♄ 压力 / ♃ 搬家 / ☉ 事业 |
| **Cosmic Profile** | Cosmic ID Card | 太阳/月亮/上升三个大图标 | Big 3 展示 |
| **Cosmic Profile** | 评分维度旁 | Career→♃, Wealth→♀, Health→♂, Power→♇ | 替换原有纯文字标签 |
| **Deep Reading** | 每个模块标题 | 模块专属行星/星座图标 | 32px |
| **Action Map** | 每条行动建议前 | 相关行星图标 | 叙事引导 |
| **Paywall** | 锁定区背景 | 半透明星盘轮图纹理 | 叠加在模糊内容上 |
| **全站** | 章节分割线 | 12 星座图标排列装饰条 | 极低透明度（0.05） |
| **全站** | 页脚 | 12 星座一字排列 | 品牌装饰 |

#### 4c. 视觉密度调整 — 减少大段文字

| 现有呈现 | 改为 |
|---------|------|
| AI 分析的大段文字（5-8行一段） | 拆成**卡片组**，每张 ≤ 3 行文字 + 左侧行星 SVG 图标 |
| Cosmic ID 评分用纯数字 | **环形进度条** + 中心行星 SVG + 数字标签 |
| 月份能量列表（12行文字） | **12格热力图日历**，颜色深浅表示能量高低 |
| 行星位置表格（多列文字） | **视觉化行星卡片**，每颗行星一张小卡（SVG + 星座 + 宫位） |
| "Why This Matters" 说明段落 | **图标 + 一句话摘要**，展开箭头可选看详情 |

#### 4d. 关键交互的仪式感动效

| 触发时机 | 动效 | 技术实现 |
|---------|------|---------|
| 提交出生信息 | 星盘轮图旋转 + 行星依次亮起 | Framer Motion sequence |
| K线绘制过程 | 曲线逐年绘入 + 每经过节点闪现行星 SVG | SVG path animation + `strokeDashoffset` |
| 验证命中 | 行星 SVG 旋转放大 → 变成 ✓ checkmark → 缩回 | `scale(1 → 1.5 → 1)` + morph |
| 章节过渡 | 对应章节的行星 SVG 从导航飞入章节标题位置 | `layoutId` shared animation |
| 打开锁定内容的尝试 | 金色光粒子从锁定区向"Unlock"按钮方向飘散 | `@keyframes particle-drift` |
| 付费解锁瞬间 | 星盘碎片从四周聚合 → 组成完整图形 → 内容渐显 | Framer spring physics |
| Cosmic ID Card 分享 | 卡片轻微 3D 倾斜 + 金色光泽扫过 | `transform: perspective(800px) rotateY(5deg)` |

---

### 【改动 5】情绪波动设计 — 从"信息陈列"到"心理过山车"

#### 核心理念
产品不是在展示信息，是在**讲一个关于用户自己的故事**。每一屏都要让用户的情绪比上一屏更强烈。

#### 5a. 好奇缺口（Curiosity Gap）— 打码系统

**位置：Deep Reading 章节（第4屏）**

现有的 AI 诊断内容是平铺直叙的：
```
现在: "Your career breakthrough window opens in September 2027 — 
       the transit of Jupiter through your 10th house 
       creates a once-in-12-year opportunity."
```

改为**关键词打码**：
```
改后: "Your career breakthrough window opens in ███████ ████ — 
       the transit of ██████ through your 10th house 
       creates a once-in-██-year opportunity."
```

**打码规则：**

| 信息类型 | 免费可见 | 打码 |
|---------|---------|------|
| 事件类型 | ✅ "career breakthrough" | — |
| 具体时间 | ❌ | ████ "September 2027" |
| 行星名 | ❌ | ██████ "Jupiter" |
| 周期长度 | ❌ | ██ "12" |
| 建议动作 | ❌ | 整段打码 |
| 风险/警告 | 第一句可见 | 后续打码 |

**用户的心理体验：**
- 能看到句子结构 → 知道存在有价值的信息
- 关键词被遮挡 → "到底是几月？到底是什么行星？"
- 尝试猜测 → 猜不到 → 焦虑感上升
- 反复滚动回来看 → "啊我真的很想知道"

**技术实现：**
```tsx
// AI 返回结构化内容，包含 redacted 标记
{
  text: "Your career breakthrough window opens in",
  redacted: "September 2027",  // 付费后显示
  continuation: "— the transit of",
  redacted2: "Jupiter",
  // ...
}
```

#### 5b. 渐变模糊锁定 — 替代硬锁

**现有：** 内容到某个点突然出现 🔒 图标 + "Unlock" 按钮

**改为三段式渐变：**

```
┌──────────────────────────────┐
│  100% 清晰                    │  ← 完全可读
│  Lorem ipsum dolor sit amet,  │
│  consectetur adipiscing elit. │
│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │  ← 开始模糊
│  S̤e̤d̤ ̤d̤o̤ ̤e̤i̤ṳs̤m̤od tempor     │  ← 70% 可读
│  ̤i̤n̤c̤i̤d̤i̤d̤ṳn̤t̤ ̤ṳt̤ ̤l̤a̤b̤o̤r̤e̤     │  ← 40% 可读
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← 完全不可读
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                               │
│  [星盘纹理叠加在模糊区上]       │
│                               │
│     ♃ See Your Full Reading   │  ← CTA 按钮
│                               │
└──────────────────────────────┘
```

**关键效果：**
- 用户下意识会眯起眼睛尝试看清模糊部分
- 能隐约看到还有很多内容 → "后面还有这么多我没看到"
- 模糊区域叠加半透明星盘轮图纹理 → 美观 + 品牌强化
- CTA 按钮前加行星 SVG 图标

**CSS 实现：**
```css
.gradual-blur {
  mask-image: linear-gradient(
    to bottom,
    black 0%,      /* 完全可见 */
    black 30%,     /* 仍然可见 */
    rgba(0,0,0,0.5) 55%, /* 半可见 */
    transparent 75%  /* 完全隐藏 */
  );
}
```

#### 5c. 对比面板 — "你 vs 同星座平均值"

**位置：K-Line 下方（第1屏底部）**

```
┌──────────────────────────────────────────┐
│  Your K-Line vs. Average Scorpio ♏        │
│                                           │
│  100 ┤    YOU ──── ╭──╮                    │
│      │           ╱     ╲                   │
│   75 ┤   ╭─────╯        ╲                  │
│      │  ╱    AVG ·····╮    ╲                │
│   50 ┤╱   ···········  ╲·····╲·····         │
│      │  ·····            ╲                  │
│   25 ┤                                     │
│      └───┬───┬───┬───┬───┬───┬───          │
│       2020 2022 2024 2026 2028 2030         │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ 🟢 You're in the top 18% of         │  │
│  │    Scorpios for 2026 energy.         │  │
│  │    Most Scorpios are in a low cycle. │  │
│  │    → See why your pattern is         │  │
│  │      different ░░░░░░░░░             │  │
│  └─────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

**文案逻辑：**
- 用户高于平均 → `"You're in the top X%. See why your pattern stands out →"` （强化自我认同）
- 用户低于平均 → `"You're navigating a tougher-than-usual cycle. There's an exit window →"` （制造希望 + 焦虑）
- 关键信息（为什么不同）→ 模糊锁定

#### 5d. 个性化钩子 — 名字 + 星座贯穿

**全站所有文案中，尽可能插入用户的名字和星座：**

| 位置 | 现有 | 改为 |
|------|------|------|
| K-Line 标题 | "Your Destiny K-Line" | "Sarah's Destiny K-Line" |
| 验证章节 | "Around 2021..." | "Sarah, around 2021..." |
| 诊断预览 | "Career breakthrough..." | "As a Scorpio ♏, your career breakthrough..." |
| 锁定提示 | "Unlock full reading" | "Sarah, 47 Scorpios unlocked today" |
| 对比面板 | "Your energy vs average" | "Your Scorpio ♏ energy vs average Scorpio" |

**心理效果：** 当产品反复使用用户的名字 + 星座称呼，用户会感觉"这是专门为我做的"，付费意愿大幅提升。

#### 5e. 损失厌恶文案 — 替代"解锁更多"

| 现有 CTA | 改为 |
|---------|------|
| "Unlock Full Reading" | "Don't miss the window closing in 2027" |
| "See More" | "Your chart shows a rare pattern — see what it means" |
| "Upgrade to Pro" | "47 Scorpios unlocked this today. You're still reading the preview." |
| "Go Deeper" | "There's a turning point in your next 18 months. See when." |

**原则：** 每个 CTA 都暗示"有你不知道的重要信息"，而非"买更多功能"。

#### 5f. 实时社交证明滚动

**位置：结果页右下角（浮动 toast）**

每 15-30 秒弹出一次：
```
┌─────────────────────────────────────┐
│ ♌ A Leo just verified their K-Line  │
│ "Scary accurate" — 2 min ago        │
└─────────────────────────────────────┘
```

- 星座 SVG 小图标（非 emoji）
- 随机名字 + 随机星座 + 随机时间
- 3 秒后自动淡出
- 最多出现 3 次（避免打扰，但足够建立 FOMO）

---

### 【改动 6】Tacit Knowledge — 读懂用户没说出口的需求

> Tacit Knowledge（隐性知识）= 用户永远不会在反馈里写出来，但行为数据刻在骨子里的需求。

#### 6a. 七大隐性需求 & 设计回应

| # | 隐性需求 | 用户不会说 | 但行为暗示 | 设计回应 |
|---|---------|-----------|-----------|---------|
| 1 | **寻求确认偏差** | "我想被肯定" | 反复看某个高分维度 | 每个高分维度旁加确认文案：`"People with your chart tend to excel here."` + 对应行星 SVG |
| 2 | **害怕被看穿** | "它怎么这么准" | 看到精准描述时滚动变慢 | 验证命中后插入：`"Surprised? Your planetary positions don't lie."` — 强化"它真的懂我" |
| 3 | **比较欲 + 优越感** | "我比别人强吗" | 百分位排名停留时间最长 | 百分位用 `"Top 12%"` 而非 `"88/100"` + 对比面板（改动 5c） |
| 4 | **合理化消费** | "花这个钱值不值" | 犹豫、反复滚动付费区 | 科学语言包装：`"Based on Swiss Ephemeris + NASA JPL data"` + 计算步骤可视化 |
| 5 | **社交货币** | "我要让别人也看看" | 截图 Cosmic ID Card | ID Card 做成完美 16:9 分享图 + AstroKline 品牌水印 + 一键分享 |
| 6 | **控制感渴望** | "告诉我该怎么做" | Action Plan 停留最久 | 行动建议改为 checkbox 格式 + 月份时间轴 + 对应行星 SVG |
| 7 | **焦虑型回访** | "有变化吗" | 多次重复访问 | 每次回访显示不同的时效信息：`"Since your last visit, Jupiter moved 2°"` |

#### 6b. 行为触发规则

| 用户行为 | 触发条件 | 产品响应 | 目标 |
|---------|---------|---------|------|
| 滚动到锁定区停留 | 停留 ≥ 3s | 底部浮出极简提示：`"Most people unlock at this point"` | 社会证明推动 |
| 反复查看 K-Line 某时段 | 同一区域点击/悬停 ≥ 2次 | 侧边弹出：`"This period seems important to you. ♃ See your full 2027 reading."` | 精准转化 |
| 第 3 次以上访问 | session count ≥ 3 | 首屏个性化欢迎：`"Welcome back, Sarah. 47 people unlocked their full report today."` | FOMO + 亲切感 |
| 点击锁定模块 ≥ 2 次 | click count on locked ≥ 2 | 付费弹窗改为限时提示：`"Special for returning readers: full reading at $29.9"` | 降低犹豫 |
| 完成全部验证 | 3/3 verified | CTA 文案变更：`"You proved it's accurate. Now see what's coming."` | 信任→行动 |
| 分享 Cosmic ID Card | share event | 解锁一个额外免费洞察（奖励机制） | 裂变传播 |

#### 6c. Cosmic Profile（原 Dashboard/Current Stage）的 Tacit 优化

**现有 Cosmic ID Card** 显示 4 个维度：Career / Wealth / Love / Health

**Tacit 优化：**

1. **移除 Love 评分**（与改动 2 一致，减少爱情依赖）
2. **替换为 Timing 评分** — 用户真正想知道的不是"爱情几分"，而是"现在是不是好时机"
3. 4 个新维度：

| 维度 | 行星 SVG | 颜色 | 衡量标准 |
|------|---------|------|---------|
| Career 事业 | ♃ Jupiter | `#D4AF37` 金 | 事业扩张潜力 |
| Wealth 财富 | ♀ Venus | `#27AE60` 绿 | 财富积累周期 |
| Timing 时机 | ♄ Saturn | `#3498DB` 蓝 | 当前是否处于最佳行动窗口 |
| Vitality 活力 | ♂ Mars | `#E74C3C` 红 | 身体/精力/行动力 |

4. 每个维度不只显示分数，还显示**百分位排名 + 趋势箭头**：

```
♃ Career   82/100  Top 15% ↗  (上升趋势)
♀ Wealth   64/100  Top 38% →  (平稳)
♄ Timing   91/100  Top 6%  ↗  (极佳窗口)
♂ Vitality 55/100  Top 52% ↘  (注意下降)
```

---

## 四、全站交互地图（鸟瞰）

```
┌─────────────────────────────────────────────────────────┐
│                    LANDING PAGE                          │
│                                                          │
│  ┌─ Hero ─────────────────────────────────────────────┐  │
│  │ "Your Next 3 Years, Mapped."                        │  │
│  │  星空粒子 + 浮动星座 SVG + 星盘纹理                    │  │
│  │  3 个痛点问题 + 实时社交证明滚动                       │  │
│  │  [出生信息表单] → 星盘旋转 loading                    │  │
│  └───────────────────────────────────────────────────┘  │
│                          ↓                               │
│  ┌─ Scroll ───────────────────────────────────────────┐  │
│  │  Features / Social Proof / CTA                      │  │
│  │  每个 section 都有星座 SVG 装饰                       │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ 提交表单
                         ↓
┌─────────────────────────────────────────────────────────┐
│              RESULT PAGE (K-Line)                        │
│  ┌─ Nav: ❶K-Line ❷Proof ❸Profile ❹Reading ❺Action ❻Unlock │
│  │                                                       │
│  │  ❶ DESTINY K-LINE ─────────────────── 情绪: 震撼      │
│  │  │ 10年曲线动画绘入                                     │
│  │  │ 当前年份脉冲金色光点                                  │
│  │  │ 峰值绿标签 / 低谷红标签                               │
│  │  │ 未来区域渐变模糊锁定                                  │
│  │  │ 每个节点旁有行星 SVG 图标                             │
│  │  │ 底部对比面板 "You vs Average Scorpio"                │
│  │  │ 悬念钩子 → 引导下一屏                                 │
│  │  │                                                     │
│  │  ❷ PAST PROOF ────────────────────── 情绪: 信任震撼    │
│  │  │ K线上低谷/高峰点亮脉冲                                │
│  │  │ 验证卡片（行星 SVG + 事件描述 + 确认按钮）             │
│  │  │ 连续命中 → 信任条 "Accuracy: 93%"                    │
│  │  │                                                     │
│  │  ❸ COSMIC PROFILE ───────────────── 情绪: 好奇         │
│  │  │ Cosmic ID Card（可分享 16:9 图）                      │
│  │  │ Big 3 太阳/月亮/上升 SVG 图标                        │
│  │  │ 4 维度环形进度条 + 行星图标 + 百分位                   │
│  │  │ 100年迷你 K线 sparkline                              │
│  │  │                                                     │
│  │  ❹ DEEP READING ─────────────────── 情绪: 焦虑/渴望    │
│  │  │ 3-4 张免费洞察卡片（完整可读）                        │
│  │  │ 后续卡片：关键词打码 "opens in ████"                  │
│  │  │ 渐变模糊（30% → 70% → 完全模糊 + 星盘纹理覆盖）      │
│  │  │ 损失厌恶 CTA: "Don't miss the window..."            │
│  │  │                                                     │
│  │  ❺ ACTION MAP ────────────────────── 情绪: 抓耳挠腮    │
│  │  │ 3 条免费行动建议（模糊细节）                          │
│  │  │ 5 年计划全锁定（标题可见，内容模糊）                   │
│  │  │ checkbox 式行动清单（可见但不可勾选）                   │
│  │  │ 紧迫文案: "Your next turning point: ██ months away"  │
│  │  │                                                     │
│  │  ❻ UNLOCK ────────────────────────── 情绪: 释放        │
│  │  │ 付费CTA区（Lite / Pro 方案）                         │
│  │  │ 验证准确率回顾 + 社交证明                             │
│  │  │ 星盘聚合解锁动画                                     │
│  │  │                                                     │
│  └──┘                                                     │
│                                                           │
│  [浮动] Ask Chart 右下角                                   │
│  [浮动] 社交证明 toast（每 15-30s）                         │
└─────────────────────────────────────────────────────────┘
```

---

## 五、不改动的部分

| 内容 | 原因 |
|------|------|
| 付费价格体系 | 本次只改体验不改定价 |
| AI 内容生成 pipeline 架构 | Prompt 微调，架构不变 |
| 登录/注册流程 | 不在本次范围 |
| Ask Chart 功能 | 保持 |
| 多语言 i18n 框架 | 框架不变，只改文案 |
| Natal Chart 星盘可视化 | 保留但从首屏移到第三屏 |

---

## 六、实施优先级

**所有改动一起做，不分批。** 这是一次完整的体验重构。

| 阶段 | 内容 | 涉及文件 |
|------|------|---------|
| **Phase 1: 资产准备** | 创建 12 星座 + 10 行星 SVG 图标组件 | 新建 `components/icons/` |
| **Phase 2: 结果页重排** | K-Line 提到首屏 + floating-nav 重排 + Dashboard 重命名为 Cosmic Profile | `shared-kline-result.tsx`, `floating-nav.tsx` |
| **Phase 3: Past Proof** | 新建验证模块组件 + AI prompt 修改 | 新建 `past-validation.tsx` |
| **Phase 4: 情绪系统** | 打码组件 + 渐变模糊 + 对比面板 | `ai-reading-panels.tsx`, `progressive-reveal.tsx` |
| **Phase 5: 首页重构** | 文案替换 + 星空背景 + 社交证明滚动 + 星盘 loading | `astro-hero.tsx` |
| **Phase 6: 视觉渗透** | 全站注入星座/行星 SVG + 仪式感动效 | 多文件 |
| **Phase 7: Tacit 交互** | 行为触发规则 + 个性化 + 损失厌恶文案 | 多文件 |

---

## 七、风险与应对

| 风险 | 应对 |
|------|------|
| 打码/模糊过度 → 用户觉得"骗人" | 保证至少 3-4 张完整免费洞察卡可读，打码只用于关键时间/数字 |
| 星座元素过多 → 视觉噪音 | SVG 图标统一线条风格 + 低透明度，不用卡通/3D/emoji |
| 验证事件不准 → 信任崩塌 | 用模糊时间段 + 感受性措辞；不准时轻描淡写跳过 |
| 个性化文案翻译成本 | 名字直接插入，星座名用英文原名（全球通用），降低 i18n 成本 |
| 社交证明假数据被质疑 | 随机生成但保持合理范围（不夸张），频率控制（最多 3 次 toast） |

---

## 八、成功指标

| 指标 | 当前估值 | 目标 | 衡量方式 |
|------|---------|------|---------|
| 首页 → 提交表单 | ~8% | 18%+ | GA4 Event |
| 测试完 → 滚动过 50% 结果页 | ~40% | 80%+ | Scroll depth |
| Past Proof 参与率 | 0%（无此功能） | 65%+ | Click event on verify buttons |
| 验证命中率（用户自确认） | N/A | 75%+ | Button clicks |
| 结果页平均停留时间 | ~90s | 240s+ | GA4 |
| 免费 → 付费转化率 | ~2% | 6%+ | Payment event |
| Cosmic ID Card 分享率 | ~1% | 8%+ | Share event |
| 付费区前滚动放弃率 | ~60% | 20% | Scroll abort |
