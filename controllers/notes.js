const notesRouter = require('express').Router();
const Note = require('../models/note');
const User = require('../models/user');
const middleware = require('../utils/middleware');

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1,
  });
  res.json(notes);
});

notesRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const note = await Note.findById(id);
  if (!note) return res.status(404).end();
  else return res.json(note);
});

notesRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const note = await Note.findByIdAndDelete(id);
  if (!note)
    return res
      .status(404)
      .send(`No resource find with id: ${id}`);
  else return res.status(204).end();
});

notesRouter.post('/', async (req, res) => {
  const { content, important } = req.body;

  const decodedToken = middleware.getDecodedToken(req);

  if (!decodedToken.id)
    return res.status(401).json({ error: 'token invalid' });

  const user = await User.findById(decodedToken.id);

  if (!user)
    return res
      .status(400)
      .json({ error: 'userId missing or not valid' });

  const note = new Note({
    content,
    important: important || false,
    user: user._id,
  });

  const savedNote = await note.save();
  user.notes = user.notes.concat(savedNote._id);
  await user.save();

  return res.status(201).json(savedNote);
});

notesRouter.put('/:id', async (req, res) => {
  const { content, important } = req.body;
  const { id } = req.params;
  const note = await Note.findById(id);
  if (!note) return res.status(404).end();

  note.content = content || note.content;
  note.important = important;

  const updatedNote = await note.save();
  return res.json(updatedNote);
});

module.exports = notesRouter;
