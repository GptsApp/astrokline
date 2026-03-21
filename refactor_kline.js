const fs = require('fs');

const path = 'src/app/[locale]/(landing)/kline/page-client.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add useRouter import
content = content.replace(
  "import { BarChart3, Star, Brain, Layers } from 'lucide-react';",
  "import { BarChart3, Star, Brain, Layers } from 'lucide-react';\nimport { useRouter } from 'next/navigation';"
);

// 2. Add router hook
content = content.replace(
  'export function KlineClient({ userTier, isLoggedIn = false }: { userTier: string; isLoggedIn?: boolean }) {\n',
  'export function KlineClient({ userTier, isLoggedIn = false }: { userTier: string; isLoggedIn?: boolean }) {\n  const router = useRouter();\n'
);

// 3. Update handleCalculateBirthData hook (remove setIsUserData and add push to result page)
// In the finally block, if we successfully saved data and isUserData is true, we should push.
// Actually, it's better to just push inside the if (result.success).
content = content.replace(
  '        setIsUserData(true);',
  "        setTimeout(() => { router.push('/kline/result'); }, 500);"
);

// We also don't need the hydration useEffect on the landing page anymore
// Just remove the useEffect that reads getSavedKlineResult
content = content.replace(
  /\/\/ Recover state or auto-open modal if empty[\s\S]*?\}, \[openBirthModal, handleCalculateBirthData\]\);/,
  `// Auto-open modal if empty
  useEffect(() => {
    const savedBirth = getSavedBirthData();
    if (!savedBirth) {
      const t = setTimeout(() => openBirthModal(handleCalculateBirthData), 500);
      return () => clearTimeout(t);
    }
  }, [openBirthModal, handleCalculateBirthData]);`
);

// 4. Remove the isUserData ternary and just keep the fallback
// Find the exact blocks
const startResultStr = '{isUserData ? (';
const endResultStr = ') : (';
const startIdx = content.indexOf(startResultStr);
const endIdx = content.indexOf(endResultStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  // Remove {isUserData ? ( ... ) : (
  let newContent =
    content.substring(0, startIdx) +
    content.substring(endIdx + endResultStr.length);

  // Now we need to remove the closing )} around line 622
  // We can just find the closing tags of the landing page
  // The landing page ends with `<RegistrationNudge` and `QuotaLimitModal`
  newContent = newContent.replace(
    /\s*\)\}\s*\{\/\* Registration Nudge for non-logged-in users \*\//g,
    '\n\n      {/* Registration Nudge for non-logged-in users */'
  );

  fs.writeFileSync(path, newContent);
  console.log('Refactored successfully.');
} else {
  console.log('Could not find replacement strings!');
}
