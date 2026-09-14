import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/pages/StudentHome.tsx');
if (!fs.existsSync(filePath)) {
  console.error('StudentHome.tsx לא נמצא. הרץ את הסקריפט משורש הפרויקט.');
  process.exit(1);
}

let source = fs.readFileSync(filePath, 'utf8');
const newImport = "import StudentNavigation, { type StudentNavigationTab } from '../components/student/StudentNavigation';";

if (!source.includes(newImport)) {
  const anchor = "import CompanionFlourishCeremony from '../components/student/CompanionFlourishCeremony';";
  if (!source.includes(anchor)) {
    console.error('לא נמצא עוגן import צפוי. לא בוצע שינוי.');
    process.exit(1);
  }
  source = source.replace(anchor, `${anchor}\n${newImport}`);
}

if (!source.includes('type Tab = StudentNavigationTab;')) {
  const start = source.indexOf('type Tab =');
  const end = source.indexOf('\n\nexport default function StudentHome', start);
  if (start === -1 || end === -1) {
    console.error('לא נמצא type Tab הצפוי. לא בוצע שינוי.');
    process.exit(1);
  }
  source = source.slice(0, start) + 'type Tab = StudentNavigationTab;' + source.slice(end);
}

if (!source.includes('<StudentNavigation')) {
  const tabsMarker = '        {/* Tabs */}';
  const contentMarker = '        {/* Tab content */}';
  const tabsStart = source.indexOf(tabsMarker);
  const contentStart = source.indexOf(contentMarker, tabsStart);
  if (tabsStart === -1 || contentStart === -1) {
    console.error('לא נמצא בלוק הניווט הישן. לא בוצע שינוי.');
    process.exit(1);
  }

  const replacement = `        {/* Student navigation */}\n        <StudentNavigation\n          activeTab={tab}\n          onSelect={setTab}\n          activeMissionCount={activeMissionCount}\n          inventoryCount={student.inventory.length}\n          hasPendingCompanionEvolution={hasPendingCompanionEvolution}\n        />\n\n`;
  source = source.slice(0, tabsStart) + replacement + source.slice(contentStart);
}

fs.writeFileSync(filePath, source, 'utf8');
console.log('✓ ניווט התלמיד עודכן בהצלחה.');
