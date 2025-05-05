const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
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
app.use(cors());

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (req, res) => {
  res.json(notes);
});

app.get('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const findNote = notes.find((note) => note.id === id);

  if (findNote) {
    res.json(findNote);
  } else {
    res.status(404).send(`No resource find with id: ${id}`);
  }
});

app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;

  const findNote = notes.find((note) => note.id === id);
  if (findNote) {
    notes = notes.filter((note) => note.id !== id);
    res.status(204).end();
  } else {
    res.status(404).send(`No resource find with id: ${id}`);
  }
});

app.post('/api/notes', (req, res) => {
  const { content, important } = req.body;

  if (!content) {
    return res.status(400).json({
      message: 'Please give a valid content for the note.',
    });
  }

  const newNote = {
    id: crypto.randomUUID(),
    content,
    important: important || false,
  };

  notes = notes.concat(newNote);

  res.status(201).json(newNote);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
