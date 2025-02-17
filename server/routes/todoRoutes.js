const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// GET all todos for the logged in user
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const db = req.app.get('db');
    const todos = await db
      .collection('todos')
      .find({ userId: req.user._id.toString() })
      .toArray();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get todos.' });
  }
});

// CREATE a new todo
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const db = req.app.get('db');
    const newTodo = {
      title: req.body.title,
      description: req.body.description,
      completed: false,
      userId: req.user._id.toString(),
    };
    const result = await db.collection('todos').insertOne(newTodo);
    res.json({ ...newTodo, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo.' });
  }
});

// UPDATE an existing todo
router.put('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const db = req.app.get('db');
    const todoId = req.params.id;
    const updates = {
      title: req.body.title,
      description: req.body.description,
      completed: req.body.completed || false,
    };
    await db.collection('todos').updateOne(
      { _id: new ObjectId(todoId), userId: req.user._id.toString() },
      { $set: updates }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo.' });
  }
});

// DELETE a todo
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const db = req.app.get('db');
    const todoId = req.params.id;
    await db
      .collection('todos')
      .deleteOne({ _id: new ObjectId(todoId), userId: req.user._id.toString() });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo.' });
  }
});

module.exports = router;
