const notesRouter = require('express').Router();
const Note = require('../models/note');

notesRouter.get('/', (req, res) => {
  Note.find({}).then((notes) => {
    res.json(notes);
  });
});

notesRouter.get('/:id', (req, res, next) => {
  const { id } = req.params;
  Note.findById(id)
    .then((note) => {
      if (!note) return res.status(404).end();
      else res.json(note);
    })
    .catch((err) => next(err));
});

notesRouter.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  Note.findByIdAndDelete(id)
    .then((note) => {
      if (!note)
        return res
          .status(404)
          .send(`No resource find with id: ${id}`);
      else res.status(204).end();
    })
    .catch((err) => next(err));
});

notesRouter.post('/', (req, res, next) => {
  const { content, important } = req.body;

  const note = new Note({
    content,
    important: important || false,
  });

  note
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => next(error));
});

notesRouter.put('/:id', (req, res, next) => {
  const { content, important } = req.body;
  const { id } = req.params;
  Note.findById(id)
    .then((note) => {
      if (!note) {
        return res.status(404).end();
      }

      note.content = content;
      note.important = important;

      return note.save().then((updatedNote) => {
        res.json(updatedNote);
      });
    })
    .catch((err) => next(err));
});

module.exports = notesRouter;
