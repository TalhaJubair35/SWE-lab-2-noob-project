import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(__dirname, '../docs/report/figures');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture() {
  console.log('Launching headless Google Chrome from:', CHROME_PATH);
  console.log('Output directory for real screenshots:', OUTPUT_DIR);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,960'],
    defaultViewport: { width: 1440, height: 960, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();

  // 1. Capture Login Screen
  console.log('1. Capturing Login Screen...');
  await page.goto(`${BASE_URL}/login`);
  await sleep(1500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'login_screen.jpg'),
    type: 'jpeg',
    quality: 95,
  });
  console.log('✓ Captured login_screen.jpg');

  // 2. Perform Login as Student
  console.log('2. Signing in as student@demo.com...');
  await page.click('.demo-pill');
  await sleep(500);
  await page.click('button[type="submit"]');
  await sleep(2000);

  // 3. Capture Course Catalog Screen
  console.log('3. Capturing Real Course Catalog Screen...');
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'catalog_overview.jpg'),
    type: 'jpeg',
    quality: 95,
  });
  console.log('✓ Captured catalog_overview.jpg');

  // 4. Click first course card to navigate to Course Detail Hub
  console.log('4. Navigating to Course Detail Screen (Course 1)...');
  await page.evaluate(() => {
    const link = document.querySelector('.modern-course-card a.btn');
    if (link) link.click();
  });
  await sleep(2000);

  console.log(' Capturing Real Course Detail Hub Screen...');
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'course_detail_ui.jpg'),
    type: 'jpeg',
    quality: 95,
  });
  console.log('✓ Captured course_detail_ui.jpg');

  // 5. Click Quizzes Tab and run assessment
  console.log('5. Capturing Real Quiz Assessment Modal Screen...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.tab-btn'));
    const quizBtn = btns.find((b) => b.textContent && b.textContent.includes('Quizzes'));
    if (quizBtn) quizBtn.click();
  });
  await sleep(1000);

  // Click start or retake quiz
  await page.evaluate(() => {
    const startBtn = document.querySelector('.quiz-card .btn, .quiz-card button');
    if (startBtn) startBtn.click();
  });
  await sleep(1200);

  // Select answers to questions
  const radios = await page.$$('.quiz-modal input[type="radio"]');
  console.log(`Found ${radios.length} quiz radio options`);
  if (radios.length >= 3) {
    await radios[2].click();
    if (radios.length >= 6) await radios[5].click();
    if (radios.length >= 9) await radios[8].click();
  }
  await sleep(600);

  // Submit assessment
  await page.evaluate(() => {
    const submitBtn = document.querySelector('.quiz-modal button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await sleep(1500);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'quiz_assessment_ui.jpg'),
    type: 'jpeg',
    quality: 95,
  });
  console.log('✓ Captured quiz_assessment_ui.jpg');

  // Close Quiz Modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.quiz-modal .text-button, .quiz-modal .btn-secondary');
    if (closeBtn) closeBtn.click();
  });
  await sleep(800);

  // 6. Capture Certificate Modal Screen
  console.log('6. Capturing Real Certificate of Completion Modal Screen...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const certBtn = btns.find((b) => b.textContent && b.textContent.includes('Certificate'));
    if (certBtn) certBtn.click();
  });
  await sleep(1500);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'certificate_completion.jpg'),
    type: 'jpeg',
    quality: 95,
  });
  console.log('✓ Captured certificate_completion.jpg');

  // Close Certificate Modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.certificate-modal .text-button');
    if (closeBtn) closeBtn.click();
  });
  await sleep(800);

  // 7. Capture Analytics Screen
  console.log('7. Capturing Real Learning Analytics Screen...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const analyticsLink = links.find((l) => l.href && l.href.includes('/analytics'));
    if (analyticsLink) analyticsLink.click();
  });
  await sleep(2000);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'learning_analytics_ui.jpg'),
    type: 'jpeg',
    quality: 95,
  });
  console.log('✓ Captured learning_analytics_ui.jpg');

  console.log('🎉 ALL 6 REAL WEBSITE SCREENSHOTS CAPTURED SUCCESSFULLY!');
  await browser.close();
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});



