const express = require('express');
const controller = require('../controllers/learningToolsController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();
router.use(authenticateToken);

router.get('/courses/:courseId/discussions', controller.listDiscussions);
router.post('/courses/:courseId/discussions', controller.createDiscussion);

router.get('/bookmarks', authorizeRoles('student'), controller.listBookmarks);
router.post('/bookmarks/:courseId', authorizeRoles('student'), controller.addBookmark);
router.delete('/bookmarks/:courseId', authorizeRoles('student'), controller.removeBookmark);

router.get('/courses/:courseId/notes', authorizeRoles('student'), controller.listNotes);
router.post('/courses/:courseId/notes', authorizeRoles('student'), controller.createNote);
router.put('/courses/:courseId/notes/:noteId', authorizeRoles('student'), controller.updateNote);
router.delete('/courses/:courseId/notes/:noteId', authorizeRoles('student'), controller.deleteNote);

module.exports = router;
