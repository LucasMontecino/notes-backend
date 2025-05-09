const notesRouter = require('express').Router();
const Note = require('../models/note');

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({});
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

  const note = new Note({
    content,
    important: important || false,
  });

  const savedNote = await note.save();
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
