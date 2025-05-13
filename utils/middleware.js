const morgan = require('morgan');
const logger = require('../utils/logger');
const config = require('../utils/config');
const jwt = require('jsonwebtoken');

const requestLogger = morgan('dev');

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');

  if (
    authorization &&
    authorization.startsWith('Bearer ')
  ) {
    req.token = authorization.replace('Bearer ', '');
  } else {
    req.token = null;
  }

  next();
};

const userExtractor = (req, res, next) => {
  if (req.token) {
    req.user = jwt.verify(req.token, config.SECRET);
  } else {
    return res
      .status(401)
      .json({ error: 'you must provide a token' });
  }

  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, req, res, next) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return res
      .status(400)
      .send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  } else if (
    error.name === 'MongoServerError' &&
    error.message.includes('E11000 duplicate key error')
  ) {
    return res
      .status(400)
      .json({ error: 'expected `username` to be unique' });
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'token invalid' });
  } else if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'token expired' });
  }

  next(error);
};

module.exports = {
  requestLogger,
  errorHandler,
  unknownEndpoint,
  tokenExtractor,
  userExtractor,
};
