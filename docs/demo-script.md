# Demo script

This walkthrough demonstrates student learning, instructor course management, authentication, and progress tracking.

## 1. Start the apps

- In `server/`, copy `.env.example` to `.env`, install dependencies, then run `npm run dev`.
- In `client/`, install dependencies, then run `npm run dev`.
- Open `http://localhost:5173`.

On the first run with an empty database, sample courses and the demo accounts are created.

## 2. Explore as a student

- Sign in with `student@demo.com` / `Demo@123`.
- Search and filter the course catalog.
- Open a course and review its description, instructor, and lesson list.
- Enroll if not already enrolled, then open a lesson.
- Mark a lesson complete and continue to another lesson.
- Open **My Courses** and verify the completion percentage.
- Refresh the page to verify that sign-in persists.

## 3. Manage courses as an instructor

- Log out, then sign in with `instructor@demo.com` / `Demo@123`.
- Open the instructor dashboard and review course, lesson, and enrollment totals.
- Create a course with a title, category, and description.
- Add two or more lessons, then edit a lesson and save the course.
- Return to the dashboard and confirm the new course and counts appear.
- Open **Courses** to see the catalog entry.

## 4. Verify access control

- Log out and try to open a protected course URL; the app should redirect to login.
- As a student, try to read a course lesson before enrolling; the API should deny access.
- As an instructor, try to manage a course created by another instructor; the API should deny the request.
