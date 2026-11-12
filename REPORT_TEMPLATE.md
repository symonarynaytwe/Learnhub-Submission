# LearnHub Web Application Development — Report Template

> **Before submission:** Replace every square-bracket placeholder with your own information. Keep the original repository attribution. Do not claim that an unperformed test passed or that the application ran locally until you have checked it on your computer.

## Student details

- **Student name:** [Enter your full name]
- **Student number:** [Enter your student number]
- **Course / programme:** [Enter course and programme]
- **Lecturer:** [Enter lecturer's name]
- **Submission date:** [Enter date]
- **Chosen application:** LearnHub (React frontend + Express/MySQL backend)

## Repository details

- **Your frontend fork:** [Paste your GitHub frontend fork URL]
- **Frontend final commit ID:** [Paste final commit hash]
- **Your backend fork:** [Paste your GitHub backend fork URL]
- **Backend final commit ID:** [Paste final commit hash]
- **Original frontend starting commit ID:** [Record from the original frontend repository]
- **Original backend starting commit ID:** [Record from the original backend repository]

The provided ZIP files do not contain the original Git history, so the original and final commit IDs must be recorded from your own Git repositories. Fork the matching frontend and backend repositories into your GitHub account and push your finished changes before submitting.

## 1. Project overview

LearnHub is a learning platform that allows students to browse and enrol in courses, open lessons, submit assignments, and view grades. Teachers manage courses and learning materials, while administrators manage users and course information. This extension keeps the existing application and adds three features aimed at helping students learn together and organise their study.

## 2. Proposed and implemented features

### Feature 1: Course discussion

- **User:** Students enrolled in a course and the teacher who owns that course.
- **Problem:** Students may need a place to ask questions or share useful explanations while studying.
- **Expected behaviour:** The learning page displays course messages and allows an authorised participant to post a message.
- **Frontend changes:** Discussion list, message form, character count, empty state, and success/error feedback on the course learning page.
- **Backend changes:** Authenticated GET and POST endpoints; course access is checked before messages are read or created.
- **Database change:** `course_discussions` stores course, author, message, and creation time.
- **Acceptance criteria:** An enrolled student can post and see a message; blank or overlong messages are rejected; an un-enrolled student cannot read or post; the teacher who owns the course can participate.

### Feature 2: Private study notes

- **User:** A student enrolled in the selected course.
- **Problem:** Students need to save their own revision points rather than keeping notes only in temporary browser text.
- **Expected behaviour:** Students can create, view, edit, and delete notes for each course. Notes remain stored in the database.
- **Frontend changes:** Note title and text fields, saved-note cards, edit/delete actions, and validation feedback.
- **Backend changes:** Authenticated endpoints validate note length and filter all note changes by the signed-in student's ID.
- **Database change:** `study_notes` stores the owner, course, title, text, and timestamps.
- **Acceptance criteria:** A student can save, edit, and delete their own note; empty or overlong values are rejected; another student cannot retrieve or change the note; notes remain after reloading the page.

### Feature 3: Saved courses

- **User:** A signed-in student.
- **Problem:** Students may find a useful course but want to return to it later without searching again.
- **Expected behaviour:** A student saves a course from Browse Courses, then views or removes it from the Saved Courses page.
- **Frontend changes:** Save button on course cards, a Saved Courses page, navigation link, and empty/error states.
- **Backend changes:** Authenticated student-only endpoints list, add, and remove bookmarks.
- **Database change:** `course_bookmarks` stores student/course pairs and prevents duplicates with a unique constraint.
- **Acceptance criteria:** A student can save an active course and find it after logging in again; duplicate saves return a clear message; a student can remove a saved course; a non-student cannot use student bookmark endpoints.

## 3. Setup and integration

1. Install a compatible Node.js version (18 or newer), npm, and MySQL/MariaDB.
2. Fork the matching LearnHub frontend and backend repositories to your own GitHub account. Clone your forks.
3. In each project folder, install dependencies with `npm install`.
4. In each folder, copy `.env.example` to `.env` and update local values. Do not commit `.env`.
5. Inspect `database/schema.sql` before running it. The original script drops and recreates `learnhub_db`, so only use it for a fresh learning database.
6. Import the original schema and seed data using the backend README instructions.
7. Apply the new feature migration: `mysql -u root -p < database/feature_migration.sql`.
8. Start the backend in one terminal with `npm run dev`.
9. Start the frontend in a second terminal with `npm run dev`.
10. Open `http://localhost:5173` and use the sample student account documented in the backend README, or your own permitted local test account.

**Frontend environment example:** `VITE_API_URL=http://localhost:5000/api`

**Backend environment:** use the values in `.env.example` and the database username/password configured on your own computer. Never submit real credentials.

## 4. Testing results

Fill in the actual result column after running the app locally.

| Test | Steps | Expected result | Actual result / evidence | Status |
|---|---|---|---|---|
| Existing login | Sign in using a seeded student account | Student dashboard opens | [Record result] | [Pass/Fail/Not run] |
| Original course workflow | Open My Courses and a course learning page | Lessons and progress control load | [Record result] | [Pass/Fail/Not run] |
| Discussion success | Enrol in a course and post a normal message | Message appears in the discussion | [Record result] | [Pass/Fail/Not run] |
| Discussion validation | Submit an empty message or one longer than 1,000 characters | Empty message is blocked; API rejects overlong input | [Record result] | [Pass/Fail/Not run] |
| Discussion access | Try to open discussion as a student not enrolled in the course | API denies access | [Record result] | [Pass/Fail/Not run] |
| Notes create/edit/delete | Save a note, edit it, reload, then delete it | Changes persist and deleted note disappears | [Record result] | [Pass/Fail/Not run] |
| Notes ownership | Try to request another student's note using their ID | API returns no other student's note | [Record result] | [Pass/Fail/Not run] |
| Saved course | Save a course, open Saved Courses, then reload | Saved course remains visible | [Record result] | [Pass/Fail/Not run] |
| Duplicate bookmark | Save the same course twice | Clear duplicate message; one database record | [Record result] | [Pass/Fail/Not run] |
| Remove bookmark | Remove a saved course and reload the list | Course no longer appears | [Record result] | [Pass/Fail/Not run] |
| Unauthenticated access | Sign out and request a learning-tools endpoint | API returns 401 | [Record result] | [Pass/Fail/Not run] |

## 5. Setup problems and resolutions

- **Problem encountered:** [Write the actual problem, or write “None encountered” only if true.]
- **How it was resolved:** [Write the steps that worked.]
- **Database migration:** The new tables are created by `database/feature_migration.sql`. The migration should be run after the original schema and seed data.
- **Local configuration:** Database credentials and API URLs are set in local `.env` files and must not be committed.

## 6. Known limitations

- The course discussion is a simple message board, not a live chat. Users may need to refresh the page to see messages posted by other people.
- There is no edit/delete control for discussion messages in this version.
- The features require the new SQL migration to be applied. Without it, the new API routes cannot read or save their records.
- This submission pack does not contain screenshots or a screen recording. Add real evidence if time permits and if required by your lecturer.
- The app has not been verified against your local MySQL credentials or browser. Complete the manual test table before claiming full end-to-end success.

## 7. Conclusion

This extension builds on LearnHub rather than replacing its existing course and assignment workflows. Course discussions encourage learning with others, private notes support revision, and saved courses make it easier to return to useful learning material. The new features use authenticated API routes and database records, so the work demonstrates the relationship between the React interface, Express backend, and MySQL/MariaDB database.

## 8. Acknowledgements

Original project: LearnHub frontend and backend from Musasizi's public GitHub repositories. Original attribution should remain in the repositories.

Additional libraries: the existing project libraries documented in the original README files.

AI assistance: OpenAI ChatGPT was used to help plan and draft feature code, documentation, and test cases. I reviewed and adapted the work and will explain and test the submitted implementation. [Adjust this statement to accurately reflect your use.]
