const fs = require('fs');
const path = './src/app/[locale]/(landing)/kline/result/page-client.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Imports
content = content.replace(
  /import { AiReadingPanels }.*?\nimport { ChartHero }.*?\nimport { DestinySummaryCard }.*?\nimport { InteractiveChart }.*?\nimport { LifeStageScores }.*?\n/s,
  "import { SharedKlineResult } from '@/components/astrokline/kline/shared-kline-result';\n"
);
content = content.replace(/import { TrustEvidenceBar }.*?\n/, '');

// 2. Remove helper functions (getScoreBand, formatAgeYearLabel, InsightCard, FloatingNav)
content = content.replace(/function getScoreBand.*?function ResultClient/s, 'function ResultClient');

// 3. Remove unused state variables in ResultClient
content = content.replace(/const \[selectedYear, setSelectedYear\] \= useState<number \| undefined>\(\n    undefined\n  \);\n/s, '');
content = content.replace(/const birthYear = parseInt.*?const selectedYearFocus.*?;/s, '');

// 4. Replace the returned JSX from <FloatingNav /> down to <ReportSection id="report-footer"
content = content.replace(
  /<div className="mt-16" \/>\n\s*<FloatingNav \/>.*?\{?\/\* ── 8\. Footer ── \*\/?\}/s,
  `      <SharedKlineResult 
        profile={profile} 
        klineData={klineData} 
        transitDetails={transitDetails} 
        tier={tier} 
        onUpgradeClick={openPricing} 
      />

      {/* ── 8. Footer ── */}`
);

// 5. Remove unused lucide-react imports that were moved
content = content.replace(/  ArrowUp,\n  BarChart3,\n  Brain,\n  Layers,\n  Sparkles,\n  Star,\n  Target,\n  TrendingDown,\n  TrendingUp,\n  ShieldCheck,\n/s, '  ShieldCheck,\n');

fs.writeFileSync(path, content);
console.log('ResultClient refactored!');
