require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const Note = require('./models/note');
const app = express();
const PORT = process.env.PORT || 3001;

let notes = [
  {
    id: '1',
    content: 'HTML is easy',
    important: true,
  },
  {
    id: '2',
    content: 'Browser can execute only JavaScript',
    important: false,
  },
  {
    id: '3',
    content:
      'GET and POST are the most important methods of HTTP protocol',
    important: true,
  },
];

app.use(express.json());
app.use(express.static('dist'));
app.use(morgan('tiny'));

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return res
      .status(400)
      .send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (req, res) => {
  Note.find({}).then((notes) => {
    res.json(notes);
  });
});

app.get('/api/notes/:id', (req, res, next) => {
  const { id } = req.params;
  Note.findById(id)
    .then((note) => {
      if (!note) return res.status(404).end();
      else res.json(note);
    })
    .catch((err) => next(err));
});

app.delete('/api/notes/:id', (req, res, next) => {
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

app.post('/api/notes', (req, res, next) => {
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

app.put('/api/notes/:id', (req, res, next) => {
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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `Server running on port http://localhost:${PORT}`
  );
});
