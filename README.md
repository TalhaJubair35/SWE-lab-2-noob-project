# E-Learning Platform

A small full-stack learning platform for students and instructors. Students can discover and enroll in courses, study lessons, and track their progress. Instructors can create courses, manage lessons, and see enrollment totals.

## Getting started

1. Copy `server/.env.example` to `server/.env` and set a private `JWT_SECRET`.
2. Install dependencies in `server/` and `client/` using `npm install`.
3. Start the API in `server/` with `npm run dev`.
4. Start the web app in `client/` with `npm run dev`.
5. Open `http://localhost:5173`.

The Vite development server proxies `/api` to `http://localhost:4000`. If the API is running elsewhere, set `VITE_API_PROXY_TARGET` before starting the client, for example `VITE_API_PROXY_TARGET=http://localhost:4010`.

The first database initialization creates demo accounts and sample courses:

- Instructor: `instructor@demo.com` / `Demo@123`
- Student: `student@demo.com` / `Demo@123`

Seeding happens only when the database has no users. Use a new/empty `DB_PATH` if you need a fresh demo database.

## Features

### Member 2 — Talha 35

- Redesigned the app layout with a consistent LearnHub navigation bar, active-page states, refreshed colors and typography, and responsive layouts for smaller screens.
- Replaced the course catalog placeholder with searchable and category-filtered course cards showing instructor, lesson, and enrollment details.
- Added an instructor dashboard with course, lesson, and enrollment totals, plus course management links and delete actions.
- Implemented instructor course creation, editing, and deletion.
- Added lesson management for instructors: create, edit, and delete lessons, displayed in creation order.
- Connected the course and lesson screens to the API, with loading states, empty states, form validation, and visible error messages.
- Added server-side course search/filtering, ownership checks, input validation, and course/lesson management endpoints.

### Students

- Search and filter the course catalog.
- View course descriptions, instructor, lesson count, and enrollments.
- Enroll in courses and access their lessons.
- Mark lessons complete and see course progress in **My Courses**.
- Navigate between lessons and revisit completed lessons.

### Instructors

- View course, lesson, and learner-enrollment totals on the dashboard.
- Create and update courses.
- Add, edit, and delete ordered lessons.
- Delete courses they own.

## API overview

All course and learning endpoints require a bearer token unless marked public.

| Endpoint | Access | Purpose |
| --- | --- | --- |
| `POST /api/auth/register` | Public | Create an account |
| `POST /api/auth/login` | Public | Sign in |
| `GET /api/auth/me` | Authenticated | Get the current account |
| `GET /api/courses` | Authenticated | Search/filter the catalog |
| `GET /api/courses/:id` | Authenticated | View course details |
| `POST /api/courses` | Instructor | Create a course |
| `GET /api/courses/mine` | Instructor | List owned courses and summary counts |
| `PUT/DELETE /api/courses/:id` | Course owner | Update/delete a course |
| `POST /api/courses/:id/lessons` | Course owner | Add a lesson |
| `PUT/DELETE /api/courses/:id/lessons/:lessonId` | Course owner | Edit/delete a lesson |
| `POST /api/courses/:courseId/enroll` | Student | Enroll in a course |
| `GET /api/my-courses` | Student | Get enrollments and progress |
| `GET /api/courses/:courseId/lessons` | Enrolled student/course owner | List lessons |
| `GET /api/lessons/:lessonId` | Enrolled student/course owner | Read a lesson |
| `POST /api/lessons/:lessonId/complete` | Enrolled student | Mark a lesson complete |
| `GET /api/health` | Public | API health check |

## Project structure

- `server/`: Express API, SQLite schema, auth, course and learning routes.
- `client/`: React app, Vite dev server, protected routes and UI.
- `server/src/db/schema.sql`: database tables and relationships.
- `docs/demo-script.md`: end-to-end walkthrough for demonstrating the platform.
