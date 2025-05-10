const {
  test,
  after,
  beforeEach,
  describe,
} = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Note = require('../models/note');
const helper = require('./test_helper');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const api = supertest(app);

describe('when there is initially some notes saved', () => {
  beforeEach(async () => {
    await Note.deleteMany({});

    for (const note of helper.initialNotes) {
      const noteObject = new Note(note);
      await noteObject.save();
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);

    const user = new User({
      username: 'root',
      passwordHash,
    });

    await user.save();
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

  describe('viewing a specific note', () => {
    test('succeeds with a valid id', async () => {
      const notesAtStart = await helper.notesInDb();
      const noteToView = notesAtStart[0];

      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert.deepStrictEqual(resultNote.body, noteToView);
    });

    test('fails with status code 404 if note does not exist', async () => {
      const validNonexistingId =
        await helper.nonExistingId();

      await api
        .get(`/api/notes/${validNonexistingId}`)
        .expect(404);
    });

    test('fails with status code 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445';

      await api.get(`/api/notes/${invalidId}`).expect(400);
    });
  });

  describe('addition of a new note', () => {
    test('succeeds with valid data', async () => {
      const users = await helper.usersInDb();

      const userToView = users[0];

      const newNote = {
        content:
          'async/await simplifies making async calls',
        important: true,
        userId: userToView.id,
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

    test('fails with status code 400 if data invalid', async () => {
      const newNote = {
        important: false,
      };

      await api
        .post('/api/notes')
        .send(newNote)
        .expect(400);

      const notesAtEnd = await helper.notesInDb();

      assert.strictEqual(
        notesAtEnd.length,
        helper.initialNotes.length
      );
    });
  });

  describe('deletion of a note', () => {
    test('succeeds with status 204 if id is valid', async () => {
      const notesAtStart = await helper.notesInDb();
      const noteToDelete = notesAtStart[0];

      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(204);

      const notesAtEnd = await helper.notesInDb();
      const contents = notesAtEnd.map((n) => n.content);
      assert(!contents.includes(noteToDelete.content));

      assert.strictEqual(
        notesAtEnd.length,
        helper.initialNotes.length - 1
      );
    });
    test('fails with status 404 if note does not exist', async () => {
      const validNonexistingId =
        await helper.nonExistingId();

      await api
        .delete(`/api/notes/${validNonexistingId}`)
        .expect(404);
    });

    test('fails with status 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445';

      await api
        .delete(`/api/notes/${invalidId}`)
        .expect(400);
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
