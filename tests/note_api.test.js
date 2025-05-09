const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Note = require('../models/note');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
  await Note.deleteMany({});
  let noteObject = new Note(helper.initialNotes[0]);
  await noteObject.save();
  noteObject = new Note(helper.initialNotes[1]);
  await noteObject.save();
});

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('all notes are returned', async () => {
  const notes = await helper.notesInDb();
  assert.strictEqual(
    notes.length,
    helper.initialNotes.length
  );
});

test('a specific note is within the returned notes', async () => {
  const notes = await helper.notesInDb();

  const contents = notes.map((e) => e.content);
  assert(contents.includes('HTML is easy'));
});

test('a valid note can be added', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  };
  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const notesAtEnd = await helper.notesInDb();

  assert.strictEqual(
    notesAtEnd.length,
    helper.initialNotes.length + 1
  );

  const contents = notesAtEnd.map((n) => n.content);
  assert(
    contents.includes(
      'async/await simplifies making async calls'
    )
  );
});

test('note without content is not added', async () => {
  const newNote = {
    important: false,
  };

  await api.post('/api/notes').send(newNote).expect(400);

  const notesAtEnd = await helper.notesInDb();

  assert.strictEqual(
    notesAtEnd.length,
    helper.initialNotes.length
  );
});

after(async () => {
  await mongoose.connection.close();
});
