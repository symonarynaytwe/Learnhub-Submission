import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getBookmarks, removeBookmark } from '../../services/learningToolsService';

export default function SavedCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadSaved() {
    setLoading(true);
    try {
      const response = await getBookmarks();
      setCourses(response.data);
      setError('');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not load your saved courses.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSaved(); }, []);

  async function handleRemove(courseId) {
    setError('');
    setMessage('');
    try {
      const response = await removeBookmark(courseId);
      setMessage(response.data.message);
      setCourses((current) => current.filter((course) => Number(course.id) !== Number(courseId)));
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not remove this course.');
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div><h1 className="h3 mb-1">Saved courses</h1><p className="text-muted mb-0">Keep a personal list of courses you want to study later.</p></div>
        <Link className="btn btn-outline-primary" to="/courses">Browse courses</Link>
      </div>
      <AlertMessage type="success" message={message} />
      <AlertMessage type="danger" message={error} />
      {loading ? <LoadingSpinner /> : courses.length === 0 ? (
        <div className="content-panel text-center py-5">
          <h2 className="h5">No saved courses yet</h2>
          <p className="text-muted">Browse LearnHub and save a course to find it here later.</p>
          <Link className="btn btn-primary" to="/courses">Find a course</Link>
        </div>
      ) : (
        <div className="row g-3">
          {courses.map((course) => (
            <div className="col-md-6" key={course.id}>
              <article className="course-card">
                <span className="badge badge-soft mb-2">{course.category_name || 'General'}</span>
                <h2 className="h5">{course.title}</h2>
                <p className="text-muted">{course.description}</p>
                <p className="small text-muted">Teacher: {course.teacher_name} · {course.level || 'All levels'}</p>
                <div className="d-flex gap-2 flex-wrap">
                  <Link className="btn btn-primary btn-sm" to={`/courses/${course.id}`}>View course</Link>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemove(course.id)}>Remove saved course</button>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
