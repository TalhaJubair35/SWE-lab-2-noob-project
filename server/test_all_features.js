// Automated verification of endpoints & features for Member 2 (Talha 35) & Member 3 (Rofaz 36)
// Note: Member 1 (Shohag 34) modules are preserved in READMESHOHAG.md for independent commit.

async function testAll() {
  const BASE = 'http://localhost:4000/api';

  console.log('1. Testing Student Login (Member 2 - Talha 35)...');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@demo.com', password: 'Demo@123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.token) throw new Error('Student login failed: ' + JSON.stringify(loginData));
  const studentToken = loginData.token;
  console.log('✓ Student logged in:', loginData.user.name);

  console.log('\n2. Testing Course List with Ratings (Member 3 - Rofaz 36)...');
  const coursesRes = await fetch(`${BASE}/courses`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const courses = await coursesRes.json();
  console.log(`✓ Fetched ${courses.length} courses:`);
  courses.forEach(c => {
    console.log(`   - ${c.title} | Rating: ${c.avg_rating}★ (${c.review_count} reviews) | Lessons: ${c.lesson_count}`);
  });

  const course1 = courses.find(c => c.title === 'Intro to JavaScript') || courses[0];

  console.log('\n3. Testing Course Discussion Forum (Member 3 - Rofaz 36)...');
  const discRes = await fetch(`${BASE}/courses/${course1.id}/discussions`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const threads = await discRes.json();
  console.log(`✓ Found ${threads.length} discussion threads`);
  if (threads.length > 0) {
    const thread = threads[0];
    console.log(`   - Topic: "${thread.title}" by ${thread.author_name} (${thread.reply_count} replies)`);

    const threadDetailRes = await fetch(`${BASE}/discussions/${thread.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const threadDetail = await threadDetailRes.json();
    console.log(`   - Replies: ${threadDetail.replies.length}`);
    threadDetail.replies.forEach(r => {
      console.log(`     [${r.is_course_instructor ? 'INSTRUCTOR' : r.author_role}] ${r.author_name}: "${r.content}"`);
    });
  }

  console.log('\n4. Testing Course Reviews & Ratings (Member 3 - Rofaz 36)...');
  const reviewsRes = await fetch(`${BASE}/courses/${course1.id}/reviews`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const revData = await reviewsRes.json();
  console.log(`✓ Average Rating: ${revData.summary.avgRating}★ from ${revData.summary.totalReviews} reviews`);
  console.log('   - 5-Star count:', revData.summary.distribution[5]);

  console.log('\n5. Testing Lesson Progress & Completion (Member 2 - Talha 35)...');
  const lessonsRes = await fetch(`${BASE}/courses/${course1.id}/lessons`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const lessons = await lessonsRes.json();
  console.log(`✓ Fetched ${lessons.length} lessons in "${course1.title}"`);
  if (lessons.length > 0) {
    const completeRes = await fetch(`${BASE}/lessons/${lessons[0].id}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const completeData = await completeRes.json();
    console.log(`✓ Progress toggled for lesson "${lessons[0].title}":`, completeData.completed);
  }

  console.log('\n=============================================');
  console.log('🎉 All Member 2 (Talha) and Member 3 (Rofaz) tests PASSED!');
  console.log('📌 Note: Member 1 (Shohag) modules are documented and staged in READMESHOHAG.md');
  console.log('=============================================\n');
}

testAll().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
