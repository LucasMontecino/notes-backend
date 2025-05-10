const {
  test,
  describe,
  beforeEach,
  after,
} = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const supertest = require('supertest');
const helper = require('./test_helper.js');
const mongoose = require('mongoose');

const app = require('../app');

const api = supertest(app);

describe('initially has one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);

    const user = new User({
      username: 'root',
      passwordHash,
    });

    await user.save();
  });

  describe('register new users', () => {
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        username: 'lucasmontecino',
        name: 'Lucas Montecino',
        password: 'montecino_10',
      };

      await api
        .post('/api/users/register')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const usersAtEnd = await helper.usersInDb();

      assert.strictEqual(
        usersAtEnd.length,
        usersAtStart.length + 1
      );

      const usernames = usersAtEnd.map((u) => u.username);
      assert(usernames.includes(newUser.username));
    });

    test('fails with status code 400 if username already exists', async () => {
      const usersAtStart = await helper.usersInDb();

      console.log(usersAtStart);

      const newUser = {
        username: 'root',
        name: 'Super Agent',
        password: 'sekret',
      };

      const result = await api
        .post('/api/users/register')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      const usersAtEnd = await helper.usersInDb();

      assert(
        result.body.error.includes(
          'expected `username` to be unique'
        )
      );
      assert.strictEqual(
        usersAtEnd.length,
        usersAtStart.length
      );
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
