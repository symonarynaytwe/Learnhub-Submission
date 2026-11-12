const db = require('../config/db');
const { findCourse, canManageCourse } = require('./courseController');

async function hasCourseAccess(user, courseId) {
  const course = await findCourse(courseId);
  if (!course) return { allowed: false, course: null };
  if (user.role === 'admin' || canManageCourse(user, course)) return { allowed: true, course };
  if (user.role !== 'student') return { allowed: false, course };
  const enrolled = await db.query(
    "SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? AND status = 'active'",
    [user.id, courseId]
  );
  return { allowed: enrolled.length > 0, course };
}

async function listDiscussions(req, res) {
  try {
    const access = await hasCourseAccess(req.user, req.params.courseId);
    if (!access.course) return res.status(404).json({ message: 'Course not found.' });
    if (!access.allowed) return res.status(403).json({ message: 'Enroll in this course to join its discussion.' });
    const rows = await db.query(
      `SELECT d.id, d.course_id, d.user_id, d.message, d.created_at, u.full_name, u.role
       FROM course_discussions d JOIN users u ON u.id = d.user_id
       WHERE d.course_id = ? ORDER BY d.created_at ASC, d.id ASC`,
      [req.params.courseId]
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load discussion.', error: error.message });
  }
}

async function createDiscussion(req, res) {
  try {
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
    if (!message || message.length > 1000) {
      return res.status(400).json({ message: 'Message must contain 1 to 1000 characters.' });
    }
    const access = await hasCourseAccess(req.user, req.params.courseId);
    if (!access.course) return res.status(404).json({ message: 'Course not found.' });
    if (!access.allowed) return res.status(403).json({ message: 'Enroll in this course to post a message.' });
    const result = await db.query(
      'INSERT INTO course_discussions (course_id, user_id, message) VALUES (?, ?, ?)',
      [req.params.courseId, req.user.id, message]
    );
    const rows = await db.query(
      `SELECT d.id, d.course_id, d.user_id, d.message, d.created_at, u.full_name, u.role
       FROM course_discussions d JOIN users u ON u.id = d.user_id WHERE d.id = ?`,
      [result.insertId]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Could not post message.', error: error.message });
  }
}

async function listBookmarks(req, res) {
  try {
    const rows = await db.query(
      `SELECT b.id AS bookmark_id, b.saved_at, c.id, c.title, c.description, c.level, c.duration,
              cat.name AS category_name, u.full_name AS teacher_name
       FROM course_bookmarks b JOIN courses c ON c.id = b.course_id
       JOIN users u ON u.id = c.teacher_id LEFT JOIN course_categories cat ON cat.id = c.category_id
       WHERE b.student_id = ? AND c.status = 'active' ORDER BY b.saved_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load saved courses.', error: error.message });
  }
}

async function addBookmark(req, res) {
  try {
    const course = await findCourse(req.params.courseId);
    if (!course || course.status !== 'active') return res.status(404).json({ message: 'Active course not found.' });
    const existing = await db.query(
      'SELECT id FROM course_bookmarks WHERE student_id = ? AND course_id = ?',
      [req.user.id, req.params.courseId]
    );
    if (existing.length) return res.status(409).json({ message: 'This course is already saved.' });
    await db.query('INSERT INTO course_bookmarks (student_id, course_id) VALUES (?, ?)', [req.user.id, req.params.courseId]);
    return res.status(201).json({ message: 'Course saved to your list.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not save course.', error: error.message });
  }
}

async function removeBookmark(req, res) {
  try {
    const result = await db.query('DELETE FROM course_bookmarks WHERE student_id = ? AND course_id = ?', [req.user.id, req.params.courseId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Saved course not found.' });
    return res.json({ message: 'Course removed from saved list.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not remove saved course.', error: error.message });
  }
}

async function listNotes(req, res) {
  try {
    const access = await hasCourseAccess(req.user, req.params.courseId);
    if (!access.course) return res.status(404).json({ message: 'Course not found.' });
    if (req.user.role !== 'student' || !access.allowed) return res.status(403).json({ message: 'Only enrolled students can access personal notes.' });
    const notes = await db.query(
      'SELECT id, course_id, note_title, note_text, created_at, updated_at FROM study_notes WHERE student_id = ? AND course_id = ? ORDER BY updated_at DESC',
      [req.user.id, req.params.courseId]
    );
    return res.json(notes);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load notes.', error: error.message });
  }
}

async function createNote(req, res) {
  try {
    const title = typeof req.body.note_title === 'string' ? req.body.note_title.trim() : '';
    const noteText = typeof req.body.note_text === 'string' ? req.body.note_text.trim() : '';
    if (!title || title.length > 120 || !noteText || noteText.length > 5000) {
      return res.status(400).json({ message: 'Enter a title (1–120 characters) and note text (1–5000 characters).' });
    }
    const access = await hasCourseAccess(req.user, req.params.courseId);
    if (!access.course) return res.status(404).json({ message: 'Course not found.' });
    if (req.user.role !== 'student' || !access.allowed) return res.status(403).json({ message: 'Only enrolled students can save personal notes.' });
    const result = await db.query(
      'INSERT INTO study_notes (student_id, course_id, note_title, note_text) VALUES (?, ?, ?, ?)',
      [req.user.id, req.params.courseId, title, noteText]
    );
    const notes = await db.query(
      'SELECT id, course_id, note_title, note_text, created_at, updated_at FROM study_notes WHERE id = ? AND student_id = ?',
      [result.insertId, req.user.id]
    );
    return res.status(201).json(notes[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Could not save note.', error: error.message });
  }
}

async function updateNote(req, res) {
  try {
    const title = typeof req.body.note_title === 'string' ? req.body.note_title.trim() : '';
    const noteText = typeof req.body.note_text === 'string' ? req.body.note_text.trim() : '';
    if (!title || title.length > 120 || !noteText || noteText.length > 5000) {
      return res.status(400).json({ message: 'Enter a title (1–120 characters) and note text (1–5000 characters).' });
    }
    const result = await db.query(
      'UPDATE study_notes SET note_title = ?, note_text = ? WHERE id = ? AND student_id = ? AND course_id = ?',
      [title, noteText, req.params.noteId, req.user.id, req.params.courseId]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Your note was not found.' });
    return res.json({ message: 'Note updated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update note.', error: error.message });
  }
}

async function deleteNote(req, res) {
  try {
    const result = await db.query(
      'DELETE FROM study_notes WHERE id = ? AND student_id = ? AND course_id = ?',
      [req.params.noteId, req.user.id, req.params.courseId]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Your note was not found.' });
    return res.json({ message: 'Note deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not delete note.', error: error.message });
  }
}

module.exports = { listDiscussions, createDiscussion, listBookmarks, addBookmark, removeBookmark, listNotes, createNote, updateNote, deleteNote };
