const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cnicBform: {
    type: DataTypes.STRING(13),
    allowNull: false,
    unique: true,
    field: 'cnic_bform',
    validate: {
      len: [13, 13],
      isNumeric: true
    }
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name'
  },
  category: {
    type: DataTypes.ENUM('Student', 'Staff', 'Teacher', 'Other'),
    allowNull: false
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  class: {
    type: DataTypes.STRING(20),
    defaultValue: 'N/A'
  },
  profilePhotoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'profile_photo_url'
  },
  booksReadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'books_read_count'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['cnic_bform']
    }
  ]
});

module.exports = User;