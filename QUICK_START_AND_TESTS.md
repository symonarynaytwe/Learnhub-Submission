# Quick Start and Testing Checklist

## Run locally

### Backend terminal

```bash
cd learnhub-backend-main
npm install
```

Create `.env` using `.env.example`, then create/seed the database as described in `README.md`. Apply the additional feature migration:

```bash
mysql -u root -p < database/feature_migration.sql
npm run dev
```

### Frontend terminal

```bash
cd learnhub-frontend-main
npm install
```

Create `.env` using `.env.example`, check that `VITE_API_URL=http://localhost:5000/api`, then run:

```bash
npm run dev
```

Open `http://localhost:5173`.

Sample seeded student login is documented in the backend README:
- Email: `brian.student@learnhub.test`
- Password: `Password123!`

Use only for local practice, never as a production password.

## Demo sequence for lecturer

1. Log in as a student and open **Browse Courses**.
2. Click **♡ Save** on an active course.
3. Open the student dashboard's **Saved Courses** link and show that the course appears.
4. Remove the saved course and show it disappears.
5. Enrol in a course (if not already enrolled) and open it from **My Courses**.
6. Post a short question in **Course discussion** and show it in the message list.
7. Add a study note, edit it, reload the page to show persistence, then delete it.
8. Try invalid note/message input and explain the validation feedback.
9. If you have a second test student who is not enrolled in that course, test that they cannot access its discussion or notes.
10. Show the original login, lesson list, and progress-saving workflow still works.

## Git reminder

The supplied ZIPs do not contain `.git` history. Fork the matching upstream frontend and backend repositories, copy/merge your changes into those clones, and commit in small steps. Suggested commits:

- `feat: add course discussion API and database`
- `feat: add private student study notes`
- `feat: add saved courses for students`
- `docs: document LearnHub feature setup and testing`

Record each repository's starting and final commit IDs. Never commit `.env`, database passwords, tokens, or generated `node_modules` folders.
