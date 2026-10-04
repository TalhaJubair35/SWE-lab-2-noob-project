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
};

await seedDatabase();

export default db;
