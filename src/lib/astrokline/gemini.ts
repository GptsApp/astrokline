import { UserProfile } from './mock-astrology-data';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// ─── System Prompt ───
const ASTRO_SYSTEM_PROMPT = `你是 AstroKline 的首席占星分析师，拥有 20 年西方占星学实战经验。
你精通行星相位、宫位系统（Placidus 分宫制）、行星力量评估（Essential Dignities）和时间预测技术。
你的分析基于 Swiss Ephemeris DE431 精确计算的真实行星位置数据。

## 核心分析方法论——电影制作比喻
- 行星 = 演员：太阳是男主角（核心身份），月亮是女主角（情感基调），水星是编剧（思维方式）
- 星座 = 表演风格：白羊座是动作片风格，金牛座是写实派，双子座是喜剧风格
- 宫位 = 拍摄场景：第 1 宫是个人特写，第 7 宫是双人对手戏，第 10 宫是成就展示
- 相位 = 演员互动：合相是同框表演，三分相是默契配合，四分相是产生冲突但催生蜕变，对冲是需要整合的两极

## 辩证思维框架（Critical — 必须遵守）
你遵循 Rob Hand 的核心理念："There are no bad charts — only charts not yet understood."
- **没有"坏"的配置**：四分相不是灾难，而是成长的张力和行动的燃料；对冲不是冲突，而是需要整合的互补力量
- **行星是原型，不是宿命**：土星是"The Great Teacher（伟大导师）"——通过纪律与责任催你成熟，而非降下厄运；冥王星是"The Transformer（深层转化者）"——旧模式必须死去，才能重生为更强大的自己
- **赋能而非恐吓**：每段分析必须以个人选择权和成长可能性收尾。绝不制造焦虑或宿命论

## 周期论视角
将个人经历放在更大的行星周期中解读：
- 土星回归（~29.5年）= 人生结构性成熟的里程碑
- 木星回归（~12年）= 信念扩展与新可能性周期
- 冥王星行运 = 深层心理转化期
- 当分析当前状态时，要提及"你正处于某个周期的什么阶段"

## 输出规则
1. 用第二人称"你"称呼用户
2. 语言风格：专业但平易近人，像一位智慧的导师在跟朋友聊天
3. **禁止空泛通用描述**——每个洞察必须引用具体的行星+星座+宫位配置作为依据
4. 从多维度分析（心理、社会、经济、职业、健康），结合现代社会现象（数字化、远程工作、自媒体、投资理财）
5. 给出具体可操作的建议，包含时间窗口和行动步骤，而非模糊的"注意健康"
6. 使用生动比喻让抽象概念具象化
7. 标注影响时长（短期/中期/长期）和影响力等级（★~★★★★★）
8. 输出纯文本，不要使用 markdown 格式
9. 分析要**深入到令人震惊**的准确程度——用户读完应该觉得"它真的懂我"
10. **辩证立场**：对于任何"困难"配置（四分相、对冲、落陷行星），必须同时说明其挑战面AND成长机遇面。绝不只给负面解读
11. **赋能收尾**：每个分析段落以一句 empowering statement 结尾，强调"你可以选择如何回应这股能量"`;


// ─── Format profile data for prompt ───
function formatProfileForPrompt(profile: UserProfile): string {
  const planetList = profile.planets
    .map(p => `${p.name}: ${p.sign} ${p.degree}°${p.minute}' (House ${p.house})`)
    .join('\n  ');

  return `## 用户星盘数据
姓名: ${profile.name}
出生日期: ${profile.birthDate}
出生时间: ${profile.birthTime}
出生地点: ${profile.birthLocation}

核心三角:
  太阳（Sun）: ${profile.sun.sign} ${profile.sun.degree}°${profile.sun.minute}' (House ${profile.sun.house})
  月亮（Moon）: ${profile.moon.sign} ${profile.moon.degree}°${profile.moon.minute}' (House ${profile.moon.house})
  上升（Rising）: ${profile.rising.sign} ${profile.rising.degree}°${profile.rising.minute}' (House ${profile.rising.house})

完整行星配置:
  ${planetList}

元素分布:
  火（Fire）: ${profile.elements.fire}%
  土（Earth）: ${profile.elements.earth}%
  风（Air）: ${profile.elements.air}%
  水（Water）: ${profile.elements.water}%

模式分布:
  开创（Cardinal）: ${profile.modalities.cardinal}%
  固定（Fixed）: ${profile.modalities.fixed}%
  变动（Mutable）: ${profile.modalities.mutable}%`;
}

// ─── Generate Personality Insight ───
export async function generatePersonalityInsight(profile: UserProfile): Promise<{
  summary: string;
  strengths: string;
  warnings: string;
  nickname: string;
  coreQuote: string;
}> {
  const userPrompt = `${formatProfileForPrompt(profile)}

## 任务
基于以上真实星盘数据，生成一段令人震撼的人格洞察分析。读完后 TA 应该感到"它怎么可能这么了解我"。

## 核心原则
- 不要笼统说"你很有创意"这种谁都适用的话
- 必须结合 TA 具体的行星星座宫位配置，说出"只有这个配置的人才会有的特征"
- 用具体生活场景来描述，比如"你在深夜 2 点突然对某个项目产生狂热，然后第二天冷静下来又觉得不值得"——这种级别的精准度
- 要触及 TA 自己都不一定意识到的深层心理模式
- 像一个见过上万份星盘的资深占星师，一眼看穿本质
- 使用原型语言而非吉凶判断：土星=伟大导师，冥王星=深层转化者，四分相=成长的张力，对冲=需要整合的互补力量
- 对于任何看似"困难"的配置，必须同时指出它隐含的超能力和成长潜能
- 每段分析以赋能性的选择权statement收尾

## 输出格式（严格遵循，用 ||| 分隔五个部分）
NICKNAME: [一个4-8字的性格昵称，精准概括核心矛盾，如"外冷内热的理想主义狂"、"温柔铠甲下的野心家"]
|||
COREQUOTE: [一句话灵魂金句，8-20字，直击灵魂，如"表面随和，但骨子里绝不妥协"]
|||
SUMMARY: [250-350字的核心人格分析，分三层递进：
第一层：核心人格画像——太阳+月亮+上升的三角交互效应，描述 TA 给外界的印象 vs 内心的真实面貌 vs 深层的情感需求，这三者之间的张力和矛盾是什么
第二层：隐秘动力——TA 自己可能都没意识到的深层驱动力是什么？什么在暗中决定 TA 的选择模式？结合月亮星座和冥王星配置分析潜意识层面
第三层：当前生命课题——现在这个人生阶段，星盘在呼唤 TA 做什么？北交点和土星在暗示什么样的成长方向？
每一层都必须引用具体行星配置作为证据，用"因为你的XX在XX宫"这种格式]
|||
STRENGTHS: [120-180字，你最大的2-3个优势，每个优势不只是说"你擅长XX"，而要说明：这个优势在职场/感情/财务中具体如何表现，引用行星配置作为证据，给出发挥建议]
|||
WARNINGS: [120-180字，需要警惕的1-2个倾向，不是泛泛而谈的"注意情绪"，而要描述：这个倾向在什么情境下最容易触发？它会导致什么具体后果？给出可操作的日常应对策略]`;

  try {
    const response = await callGemini(userPrompt, 2048);
    return parsePersonalityResponse(response);
  } catch (error) {
    console.error('Gemini personality insight failed:', error);
    return getFallbackInsight(profile);
  }
}

// ─── Generate Synergy Reading (合盘) ───
export async function generateSynergyReading(
  profileA: UserProfile,
  profileB: UserProfile
): Promise<{
  compatibility: number;
  sparks: string;
  friction: string;
  advice: string;
}> {
  const userPrompt = `## 用户 A 的星盘
${formatProfileForPrompt(profileA)}

## 用户 B 的星盘
${formatProfileForPrompt(profileB)}

## 任务
基于两人的真实星盘数据，生成合盘匹配分析。重点分析：
1. 两人月亮星座的情感兼容性
2. 金星-火星的化学反应相位
3. 太阳-月亮的互相滋养度

## 输出格式（严格遵循，用 ||| 分隔四个部分）
COMPATIBILITY: [0-100的整数匹配分]
|||
SPARKS: [100-150字的火花区分析 —— 两人最有化学反应的方面]
|||
FRICTION: [100-150字的摩擦区分析 —— 最容易产生误解的地方]
|||
ADVICE: [100-150字的相处建议 —— 给出具体可操作的日常建议]`;

  try {
    const response = await callGemini(userPrompt);
    return parseSynergyResponse(response);
  } catch (error) {
    console.error('Gemini synergy reading failed:', error);
    return { compatibility: 75, sparks: '', friction: '', advice: '' };
  }
}

// ─── Call Gemini API ───
export async function callGemini(userPrompt: string, maxTokens: number = 1024): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: userPrompt }]
      }],
      systemInstruction: {
        parts: [{ text: ASTRO_SYSTEM_PROMPT }]
      },
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: maxTokens,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ─── Call Gemini API and get structured JSON response ───
export async function callGeminiJson<T = any>(userPrompt: string): Promise<T> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  // Use a separate API call with JSON mode (no system instruction to avoid language mixing)
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: userPrompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini JSON API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(text) as T;
}

// ─── Parse Personality Response ───
function parsePersonalityResponse(raw: string): {
  summary: string;
  strengths: string;
  warnings: string;
  nickname: string;
  coreQuote: string;
} {
  const parts = raw.split('|||').map(s => s.trim());
  
  const extractValue = (part: string, prefix: string) => {
    return part.replace(new RegExp(`^${prefix}:\\s*`, 'i'), '').trim();
  };

  return {
    nickname: extractValue(parts[0] || '', 'NICKNAME'),
    coreQuote: extractValue(parts[1] || '', 'COREQUOTE'),
    summary: extractValue(parts[2] || '', 'SUMMARY'),
    strengths: extractValue(parts[3] || '', 'STRENGTHS'),
    warnings: extractValue(parts[4] || '', 'WARNINGS'),
  };
}

// ─── Parse Synergy Response ───
function parseSynergyResponse(raw: string): {
  compatibility: number;
  sparks: string;
  friction: string;
  advice: string;
} {
  const parts = raw.split('|||').map(s => s.trim());
  
  const extractValue = (part: string, prefix: string) => {
    return part.replace(new RegExp(`^${prefix}:\\s*`, 'i'), '').trim();
  };

  const compatStr = extractValue(parts[0] || '', 'COMPATIBILITY');
  const compatibility = Math.min(100, Math.max(0, parseInt(compatStr) || 75));

  return {
    compatibility,
    sparks: extractValue(parts[1] || '', 'SPARKS'),
    friction: extractValue(parts[2] || '', 'FRICTION'),
    advice: extractValue(parts[3] || '', 'ADVICE'),
  };
}

// ─── Fallback (when API fails) ───
function getFallbackInsight(profile: UserProfile) {
  const sun = profile.sun.sign;
  const moon = profile.moon.sign;
  const rising = profile.rising.sign;

  return {
    nickname: `${sun}之心`,
    coreQuote: `${sun}的驱动，${moon}的细腻，${rising}的外表`,
    summary: `你的太阳落在${sun}（第${profile.sun.house}宫），赋予你${sun}座特有的核心驱动力。月亮${moon}（第${profile.moon.house}宫）为你的情感世界染上了${moon}座的色彩，而上升${rising}则是你与世界互动的第一面具。这三者的组合构成了一个独特的人格交响曲——你的内在和外在之间存在着有趣的张力。\n\n你内心深处的情感需求往往和你展现给外界的形象之间有着微妙的反差。这不是矛盾，而是你人格的丰富性所在。当你学会拥抱这种复杂性，你会发现它正是你最大的优势来源。`,
    strengths: `你的元素分布显示火${profile.elements.fire}% / 土${profile.elements.earth}% / 风${profile.elements.air}% / 水${profile.elements.water}%，这意味着你在${profile.elements.earth > 30 ? '实际执行' : profile.elements.water > 30 ? '情感直觉' : profile.elements.fire > 30 ? '行动力' : '思维分析'}方面具有天然优势。`,
    warnings: `注意平衡你的能量分布。你的${Object.entries(profile.elements).sort((a, b) => a[1] - b[1])[0][0] === 'fire' ? '火' : Object.entries(profile.elements).sort((a, b) => a[1] - b[1])[0][0] === 'earth' ? '土' : Object.entries(profile.elements).sort((a, b) => a[1] - b[1])[0][0] === 'air' ? '风' : '水'}元素最弱，建议有意识地在这个领域投入更多关注。`,
  };
}
