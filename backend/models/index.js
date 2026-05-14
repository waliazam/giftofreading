const { sequelize } = require('../config/database');
const User = require('./User');
const Book = require('./Book');
const Admin = require('./Admin');

const models = {
  User,
  Book,
  Admin,
  sequelize
};

module.exports = models;