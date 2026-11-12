# LearnHub — Three-Feature Proposal

**Student:** [Name]  
**Student number:** [Number]  
**Chosen application:** LearnHub

## Why these features?

LearnHub already supports course enrolment, lessons, assignments, submissions, grades, and course progress. The following additions focus on student study habits and communication without changing the existing main workflows.

| Feature | User problem | Planned behaviour | Frontend / backend / database | Acceptance criteria |
|---|---|---|---|---|
| Course discussion | Students need to ask course-related questions and share tips | Enrolled students and the course-owning teacher can read and post messages | React discussion panel; authenticated Express endpoints; `course_discussions` table | Valid messages persist; blank/overlong messages rejected; users without course access denied |
| Private study notes | Students need to keep revision notes connected to a course | Students can create, view, edit, and delete their own notes | React note editor and list; ownership-checked Express endpoints; `study_notes` table | Notes persist after refresh; invalid input rejected; one student cannot access another student's notes |
| Saved courses | Students may want to return to a course later | Students can bookmark and remove active courses from a saved list | Save button and Saved Courses page; student-only endpoints; `course_bookmarks` table | Saved list persists; duplicates are rejected; remove action works; non-students denied |

## Security and validation

- All learning-tools routes require JWT authentication.
- Bookmark and private-note endpoints require the student role.
- Course discussions and notes check course participation; notes are restricted to the signed-in owner.
- SQL queries use parameters instead of building SQL from user text.
- Input lengths are checked by the backend as well as the interface.
- The database uses foreign keys and a unique student/course bookmark constraint.

## Review note

This proposal is included with the implementation for documentation. If the lecturer requires approval *before* implementation, submit this proposal for review and follow any feedback received.
