require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
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

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (req, res) => {
  Note.find({}).then((notes) => {
    res.json(notes);
  });
});

app.get('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  Note.findOne({ _id: id }).then((note) => {
    if (!note)
      return res
        .status(404)
        .send(`No resource find with id: ${id}`);
    else res.json(note);
  });
});

app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;

  Note.deleteOne({ _id: id }).then((note) => {
    if (!note)
      return res
        .status(404)
        .send(`No resource find with id: ${id}`);
    else res.status(204).end();
  });
});

app.post('/api/notes', (req, res) => {
  const { content, important } = req.body;

  if (!content) {
    return res.status(400).json({
      message: 'Please give a valid content for the note.',
    });
  }

  const note = new Note({
    content,
    important: important || false,
  });

  note.save().then((result) => {
    res.status(201).json(result);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
