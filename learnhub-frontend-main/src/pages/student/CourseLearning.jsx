import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LessonList from '../../components/LessonList';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCourse } from '../../services/courseService';
import { getMyCourses, updateProgress } from '../../services/enrollmentService';
import { getLessonsByCourse } from '../../services/lessonService';
import {
  createNote, deleteNote, getDiscussions, getNotes, postDiscussion, updateNote
} from '../../services/learningToolsService';

export default function CourseLearning() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [discussion, setDiscussion] = useState([]);
  const [discussionText, setDiscussionText] = useState('');
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);

  async function loadLearningTools(courseId) {
    const [discussionResult, notesResult] = await Promise.allSettled([
      getDiscussions(courseId), getNotes(courseId)
    ]);
    if (discussionResult.status === 'fulfilled') setDiscussion(discussionResult.value.data);
    if (notesResult.status === 'fulfilled') setNotes(notesResult.value.data);
    if (discussionResult.status === 'rejected' || notesResult.status === 'rejected') {
      setError('Some learning tools could not load. Check that you are enrolled and the feature database migration has been applied.');
    }
  }

  useEffect(() => {
    let active = true;
    async function loadPage() {
      setLoading(true);
      setError('');
      try {
        const [courseResponse, lessonResponse, enrollmentResponse] = await Promise.all([
          getCourse(id), getLessonsByCourse(id), getMyCourses()
        ]);
        if (!active) return;
        setCourse(courseResponse.data);
        setLessons(lessonResponse.data);
        const foundEnrollment = enrollmentResponse.data.find((item) => Number(item.id) === Number(id));
        setEnrollment(foundEnrollment);
        setProgress(Number(foundEnrollment?.progress_percentage || 0));
        await loadLearningTools(id);
      } catch (apiError) {
        if (active) setError(apiError.response?.data?.message || 'Could not load this learning page.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPage();
    return () => { active = false; };
  }, [id]);

  async function handleProgressSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (!enrollment) throw new Error('You must be enrolled in this course to save progress.');
      await updateProgress(enrollment.enrollment_id, progress);
      setMessage('Course progress saved.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || apiError.message || 'Could not update progress.');
    }
  }

  async function handlePostDiscussion(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await postDiscussion(id, discussionText);
      setDiscussion((current) => [...current, response.data]);
      setDiscussionText('');
      setMessage('Your message was added to the course discussion.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not post your message.');
    }
  }

  async function handleSaveNote(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = { note_title: noteTitle, note_text: noteText };
      if (editingNoteId) {
        await updateNote(id, editingNoteId, data);
        setMessage('Study note updated.');
      } else {
        const response = await createNote(id, data);
        setNotes((current) => [response.data, ...current]);
        setMessage('Study note saved.');
      }
      setNoteTitle('');
      setNoteText('');
      setEditingNoteId(null);
      if (editingNoteId) {
        const response = await getNotes(id);
        setNotes(response.data);
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not save your note.');
    }
  }

  function startEditing(note) {
    setEditingNoteId(note.id);
    setNoteTitle(note.note_title);
    setNoteText(note.note_text);
  }

  async function handleDeleteNote(noteId) {
    setError('');
    setMessage('');
    try {
      await deleteNote(id, noteId);
      setNotes((current) => current.filter((note) => note.id !== noteId));
      setMessage('Study note deleted.');
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
        setNoteTitle('');
        setNoteText('');
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not delete note.');
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3">{course?.title || 'Course learning'}</h1>
      <p className="text-muted">{course?.description}</p>
      <AlertMessage type="success" message={message} />
      <AlertMessage type="danger" message={error} />
      <div className="content-panel mb-3">
        <form className="row g-2 align-items-end" onSubmit={handleProgressSubmit}>
          <div className="col-md-9">
            <label className="form-label" htmlFor="course-progress">Course progress</label>
            <input id="course-progress" className="form-range" type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
          </div>
          <div className="col-md-1 fw-bold">{progress}%</div>
          <div className="col-md-2 d-grid"><button className="btn btn-primary" type="submit">Save progress</button></div>
        </form>
      </div>

      <div className="content-panel mb-3">
        <h2 className="h5">Lessons and materials</h2>
        <LessonList lessons={lessons} />
      </div>

      <section className="content-panel mb-3">
        <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
          <div><h2 className="h5 mb-1">Course discussion</h2><p className="text-muted small">Ask a question or share a useful tip with people learning this course.</p></div>
          <span className="badge text-bg-light">{discussion.length} messages</span>
        </div>
        <form onSubmit={handlePostDiscussion} className="mb-3">
          <label className="form-label" htmlFor="discussion-message">Your message</label>
          <textarea id="discussion-message" className="form-control mb-2" rows="2" maxLength="1000" value={discussionText} onChange={(e) => setDiscussionText(e.target.value)} placeholder="What would you like to ask or share?" required />
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">{discussionText.length}/1000 characters</small>
            <button className="btn btn-primary btn-sm" type="submit" disabled={!discussionText.trim()}>Post message</button>
          </div>
        </form>
        {discussion.length === 0 ? <p className="text-muted mb-0">No messages yet. Start the conversation.</p> : (
          <div className="d-grid gap-2">
            {discussion.map((item) => (
              <article className="learning-note" key={item.id}>
                <div className="d-flex justify-content-between gap-2 flex-wrap">
                  <strong>{item.full_name}</strong><small className="text-muted">{new Date(item.created_at).toLocaleString()}</small>
                </div>
                <span className="badge text-bg-light mb-2">{item.role}</span>
                <p className="mb-0 note-content">{item.message}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="content-panel">
        <h2 className="h5">My study notes</h2>
        <p className="text-muted small">These notes are private to your account and stay saved in the database.</p>
        <form onSubmit={handleSaveNote} className="mb-4">
          <label className="form-label" htmlFor="note-title">Note title</label>
          <input id="note-title" className="form-control mb-2" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} maxLength="120" placeholder="e.g. Important points from lesson 1" required />
          <label className="form-label" htmlFor="note-text">Your notes</label>
          <textarea id="note-text" className="form-control mb-2" rows="3" value={noteText} onChange={(e) => setNoteText(e.target.value)} maxLength="5000" placeholder="Write the main points you want to remember..." required />
          <div className="d-flex gap-2">
            <button className="btn btn-success btn-sm" type="submit">{editingNoteId ? 'Update note' : 'Save note'}</button>
            {editingNoteId && <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => { setEditingNoteId(null); setNoteTitle(''); setNoteText(''); }}>Cancel edit</button>}
          </div>
        </form>
        {notes.length === 0 ? <p className="text-muted mb-0">You have not saved notes for this course yet.</p> : (
          <div className="row g-3">
            {notes.map((note) => (
              <div className="col-md-6" key={note.id}>
                <article className="learning-note h-100">
                  <h3 className="h6">{note.note_title}</h3>
                  <p className="note-content">{note.note_text}</p>
                  <small className="text-muted d-block mb-2">Updated {new Date(note.updated_at).toLocaleString()}</small>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm" type="button" onClick={() => startEditing(note)}>Edit</button>
                    <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => handleDeleteNote(note.id)}>Delete</button>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
