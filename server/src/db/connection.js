import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { env } from '../config/env.js';

const dbPath = path.resolve(process.cwd(), env.DB_PATH);
const dbDir = path.dirname(dbPath);

fs.mkdirSync(dbDir, { recursive: true });

const schemaSql = fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.exec(schemaSql);

export const seedDatabase = async () => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();

  if (Number(userCount.count) > 0) {
    return;
  }

  const instructor = {
    name: 'Instructor Demo',
    email: 'instructor@demo.com',
    password_hash: bcrypt.hashSync('Demo@123', 10),
    role: 'instructor',
  };

  const student = {
    name: 'Student Demo',
    email: 'student@demo.com',
    password_hash: bcrypt.hashSync('Demo@123', 10),
    role: 'student',
  };

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  );

  const instructorId = insertUser.run(
    instructor.name,
    instructor.email,
    instructor.password_hash,
    instructor.role
  ).lastInsertRowid;

  const studentId = insertUser.run(
    student.name,
    student.email,
    student.password_hash,
    student.role
  ).lastInsertRowid;

  const insertCourse = db.prepare(
    'INSERT INTO courses (title, description, category, instructor_id) VALUES (?, ?, ?, ?)'
  );

  const courses = [
    ['Intro to JavaScript', 'Learn the basics of JavaScript programming.', 'Programming', instructorId],
    ['Web Design Fundamentals', 'Create beautiful interfaces and layouts.', 'Design', instructorId],
    ['Database Basics', 'Understand SQL and data storage.', 'Database', instructorId],
  ];

  const courseIds = courses.map((course) => insertCourse.run(...course).lastInsertRowid);

  const insertLesson = db.prepare(
    'INSERT INTO lessons (course_id, title, content, position) VALUES (?, ?, ?, ?)'
  );

  const lessonSeed = [
    ['Variables and Types', 'Learn JavaScript values and primitive types.', 1],
    ['Functions', 'Create reusable code blocks and understand scope.', 2],
    ['DOM Basics', 'Interact with page elements using the DOM.', 3],
    ['Color Theory', 'Understand how colors work together visually.', 1],
    ['Layouts', 'Organize content using layout patterns.', 2],
    ['Accessibility', 'Build interfaces that work for everyone.', 3],
    ['Relational Tables', 'Understand how tables represent related data.', 1],
    ['Queries', 'Read data with SQL queries and filters.', 2],
    ['Normalization', 'Keep your database organized and efficient.', 3],
  ];

  for (let i = 0; i < courseIds.length; i += 1) {
    const courseId = courseIds[i];
    const lessonSet = lessonSeed.slice(i * 3, i * 3 + 3);

    lessonSet.forEach(([title, content, position]) => {
      insertLesson.run(courseId, title, content, position);
    });
  }

  const insertEnrollment = db.prepare(
    'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)'
  );

  courseIds.forEach((courseId) => {
    insertEnrollment.run(studentId, courseId);
  });

  // Member 1 (Shohag 34) Seeds: Quizzes & Questions
  const insertQuiz = db.prepare(
    'INSERT INTO quizzes (course_id, title, passing_score) VALUES (?, ?, ?)'
  );
  const insertQuestion = db.prepare(
    'INSERT INTO quiz_questions (quiz_id, question, options, correct_index, explanation) VALUES (?, ?, ?, ?, ?)'
  );

  const quiz1Id = insertQuiz.run(courseIds[0], 'JavaScript Fundamentals Quiz', 70).lastInsertRowid;
  insertQuestion.run(
    quiz1Id,
    'Which of the following is NOT a JavaScript primitive data type?',
    JSON.stringify(['String', 'Number', 'Object', 'Boolean']),
    2,
    'Object is a non-primitive reference type in JavaScript, whereas String, Number, and Boolean are primitives.'
  );
  insertQuestion.run(
    quiz1Id,
    'Which keyword declares a block-scoped reassignable variable?',
    JSON.stringify(['var', 'let', 'static', 'val']),
    1,
    'let declares block-scoped local variables introduced in ES6.'
  );
  insertQuestion.run(
    quiz1Id,
    'Which method adds one or more elements to the end of an array?',
    JSON.stringify(['shift()', 'pop()', 'push()', 'unshift()']),
    2,
    'push() appends items to the end of an array and returns the new length.'
  );

  const quiz2Id = insertQuiz.run(courseIds[1], 'UI/UX & Design Basics Quiz', 70).lastInsertRowid;
  insertQuestion.run(
    quiz2Id,
    'What does CSS stand for?',
    JSON.stringify(['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style System', 'Colorful Style Sheets']),
    1,
    'Cascading Style Sheets describes how HTML elements are formatted and displayed.'
  );
  insertQuestion.run(
    quiz2Id,
    'What is the minimum WCAG AA contrast ratio for regular body text?',
    JSON.stringify(['2:1', '3:1', '4.5:1', '7:1']),
    2,
    'WCAG Level AA requires a contrast ratio of at least 4.5:1 for normal body text.'
  );

  // Member 3 (Rofaz 36) Seeds: Reviews & Discussions
  const insertReview = db.prepare(
    'INSERT INTO reviews (student_id, course_id, rating, comment) VALUES (?, ?, ?, ?)'
  );
  insertReview.run(
    studentId,
    courseIds[0],
    5,
    'Outstanding course! The explanations of functions and variables are crisp, clear, and beginner-friendly.'
  );
  insertReview.run(
    studentId,
    courseIds[1],
    5,
    'Loved the accessibility and layout principles! Highly practical for building real-world web applications.'
  );

  const insertDiscussion = db.prepare(
    'INSERT INTO discussions (course_id, user_id, title, content) VALUES (?, ?, ?, ?)'
  );
  const insertReply = db.prepare(
    'INSERT INTO discussion_replies (discussion_id, user_id, content) VALUES (?, ?, ?)'
  );

  const discussionId = insertDiscussion.run(
    courseIds[0],
    studentId,
    'Difference between == and === in JavaScript?',
    'Could someone please clarify when we should strictly prefer === over == in production code?'
  ).lastInsertRowid;

  insertReply.run(
    discussionId,
    instructorId,
    'Always prefer === (strict equality) because it avoids unexpected type coercion. For example, "0" == 0 evaluates to true, but "0" === 0 evaluates to false!'
  );
};

await seedDatabase();

export default db;
