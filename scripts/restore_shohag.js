import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

console.log('Restoring Shohag (Roll 2203034) Codebase Files...');

// Reads and extracts files from READMESHOHAG.md or writes them directly
const ensureDir = (p) => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};

// Check if READMESHOHAG.md exists
const readmePath = path.join(ROOT, 'READMESHOHAG.md');
if (!fs.existsSync(readmePath)) {
  console.error('Error: READMESHOHAG.md not found!');
  process.exit(1);
}

const content = fs.readFileSync(readmePath, 'utf8');

// Extraction helper
const extractBlock = (marker) => {
  const start = content.indexOf(marker);
  if (start === -1) return null;
  const codeStart = content.indexOf('```', start);
  const lineEnd = content.indexOf('\n', codeStart);
  const codeEnd = content.indexOf('```\n', lineEnd);
  return content.slice(lineEnd + 1, codeEnd).trim();
};

const files = [
  { path: 'server/src/modules/quizzes/quizzes.routes.js', marker: '### File 1: `server/src/modules/quizzes/quizzes.routes.js`' },
  { path: 'server/src/modules/certificates/certificates.routes.js', marker: '### File 2: `server/src/modules/certificates/certificates.routes.js`' },
  { path: 'server/src/modules/analytics/analytics.routes.js', marker: '### File 3: `server/src/modules/analytics/analytics.routes.js`' },
  { path: 'client/src/api/quizzesApi.js', marker: '### File 4: `client/src/api/quizzesApi.js`' },
  { path: 'client/src/api/certificatesApi.js', marker: '### File 5: `client/src/api/certificatesApi.js`' },
  { path: 'client/src/api/analyticsApi.js', marker: '### File 6: `client/src/api/analyticsApi.js`' },
  { path: 'client/src/features/quizzes/CourseQuizzesTab.jsx', marker: '### File 7: `client/src/features/quizzes/CourseQuizzesTab.jsx`' },
  { path: 'client/src/features/quizzes/QuizModal.jsx', marker: '### File 8: `client/src/features/quizzes/QuizModal.jsx`' },
  { path: 'client/src/features/certificates/CertificateModal.jsx', marker: '### File 10: `client/src/features/certificates/CertificateModal.jsx`' },
  { path: 'client/src/features/analytics/AnalyticsPage.jsx', marker: '### File 11: `client/src/features/analytics/AnalyticsPage.jsx`' },
];

files.forEach(({ path: relPath, marker }) => {
  const code = extractBlock(marker);
  if (code) {
    const fullPath = path.join(ROOT, relPath);
    ensureDir(path.dirname(fullPath));
    fs.writeFileSync(fullPath, code, 'utf8');
    console.log(`✓ Restored ${relPath}`);
  } else {
    console.warn(`! Marker not found for ${relPath}`);
  }
});

// Also check and restore schema.sql tables if not present
const schemaPath = path.join(ROOT, 'server/src/db/schema.sql');
if (fs.existsSync(schemaPath)) {
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  if (!schemaContent.includes('CREATE TABLE IF NOT EXISTS quizzes')) {
    const shohagSql = `
-- Member 1 (Shohag 34): Quizzes & Assessments, Student Certificates
CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 70,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL, -- JSON array of strings
  correct_index INTEGER NOT NULL,
  explanation TEXT DEFAULT '',
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  quiz_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  passed INTEGER NOT NULL CHECK (passed IN (0, 1)),
  attempted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  certificate_code TEXT NOT NULL UNIQUE,
  issue_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
`;
    fs.appendFileSync(schemaPath, shohagSql, 'utf8');
    console.log('✓ Restored Shohag tables into server/src/db/schema.sql');
  }
}

console.log('Shohag files and database schemas restored successfully from READMESHOHAG.md!');
