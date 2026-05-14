const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  bookTitle: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'book_title',
    validate: {
      notEmpty: true
    }
  },
  author: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: 'Unknown',
    validate: {
      notEmpty: true
    }
  },
  language: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Other',
    validate: {
      notEmpty: true
    }
  },
  recordedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'recorded_at'
  }
}, {
  tableName: 'books',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['recorded_at']
    }
  ]
});

User.hasMany(Book, {
  foreignKey: 'user_id',
  as: 'books',
  onDelete: 'CASCADE'
});

Book.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = Book;
