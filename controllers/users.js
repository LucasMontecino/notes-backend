const usersRouter = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

usersRouter.get('/', async (req, res) => {
  const users = await User.find({});

  return res.json(users);
});

usersRouter.post('/register', async (req, res) => {
  const { username, name, password } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await newUser.save();

  return res.status(201).json(savedUser);
});

usersRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) return res.status(404).json('user not found');

  const passwordCompare = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (passwordCompare) res.send('successful login');
  else res.send('incorrect password');
});

usersRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser)
    return res.status(404).json('user not found');

  return res.status(204).end();
});

module.exports = usersRouter;
