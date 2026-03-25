const fs = require('fs');
const path = './src/app/[locale]/(dashboard)/dashboard/kline/page-client.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add SharedKlineResult import
if (!content.includes('SharedKlineResult')) {
  content = content.replace(
    /import { ChartHero }.*?\n/,
    "import { SharedKlineResult } from '@/components/astrokline/kline/shared-kline-result';\nimport { ChartHero } from '@/components/astrokline/kline/chart-hero';\n"
  );
}

// 2. Remove old dashboard kline components
content = content.replace(/import { CurrentEnergy }.*?\n/s, '');
content = content.replace(/import { InteractiveChart }.*?\n/s, '');
content = content.replace(/import { LifeRadar }.*?\n/s, '');
content = content.replace(/import { Next30Days }.*?\n/s, '');
content = content.replace(/import { ReadingSummary }.*?\n/s, '');

// 3. Remove PremiumGate component mapping completely as it is no longer used
content = content.replace(/function PremiumGate.*?\}\n\n\/\/ ──/s, '// ──');

// 4. Replace detail view inside <div id="kline-report">
content = content.replace(
  /<div id="kline-report">.*?<\/div>\{' '}\n\s+\{\/\* end #kline-report \*\/\}/s,
  `<div id="kline-report">
        {profile && (
          <SharedKlineResult
            profile={profile}
            klineData={klineData}
            transitDetails={transitDetails}
            tier={chartTier}
            onUpgradeClick={() => window.location.href = '/pricing'}
            hideFloatingNav={true}
          />
        )}
      </div>`
);

// 5. Remove unused state for old components
content = content.replace(/const \[destinyReading, setDestinyReading\].*?;\n/s, '');
content = content.replace(/const \[radarData, setRadarData\].*?;\n/s, '');
content = content.replace(/const \[next30Days, setNext30Days\].*?;\n/s, '');
content = content.replace(/const \[currentEnergy, setCurrentEnergy\].*?;\n/s, '');

content = content.replace(/setRadarData\(.*?\);\n/s, '');
content = content.replace(/setDestinyReading\(.*?\);\n/s, '');
content = content.replace(/setNext30Days\(.*?\);\n/s, '');
content = content.replace(/setCurrentEnergy\(.*?\);\n/s, '');

// Also clean up the unused imports for personalized-report
content = content.replace(/import type \{ CurrentEnergyData \} from '@\/lib\/astrokline\/personalized-report';\n/s, '');

fs.writeFileSync(path, content);
console.log('DashboardKlineClient refactored!');
