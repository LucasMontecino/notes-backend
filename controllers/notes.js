const notesRouter = require('express').Router();
const Note = require('../models/note');

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({});
  res.json(notes);
});

notesRouter.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const note = await Note.findById(id);
    if (!note) return res.status(404).end();
    else return res.json(note);
  } catch (error) {
    next(error);
  }
});

notesRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const note = await Note.findByIdAndDelete(id);
    if (!note)
      return res
        .status(404)
        .send(`No resource find with id: ${id}`);
    else return res.status(204).end();
  } catch (error) {
    next(error);
  }
});

notesRouter.post('/', async (req, res, next) => {
  const { content, important } = req.body;

  const note = new Note({
    content,
    important: important || false,
  });

  try {
    await note.save();
    return res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

notesRouter.put('/:id', async (req, res, next) => {
  const { content, important } = req.body;
  const { id } = req.params;
  try {
    const note = await Note.findById(id);
    if (!note) return res.status(404).end();

    note.content = content || note.content;
    note.important = important;

    await note.save();
    return res.json(note);
  } catch (error) {
    next(error);
  }
});

module.exports = notesRouter;
