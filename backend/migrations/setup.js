const { Client } = require('pg');
const { sequelize } = require('../config/database');
require('../models/User');
require('../models/Book');
require('dotenv').config();

const databaseName = process.env.DB_NAME || 'gift-of-reading';

const quoteIdentifier = (value) => `"${value.replace(/"/g, '""')}"`;

const ensureDatabaseExists = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_ADMIN_DB || 'postgres'
  });

  await client.connect();

  try {
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
      console.log(`Created database "${databaseName}"`);
    }
  } finally {
    await client.end();
  }
};

const cleanupDuplicateUniqueConstraints = async () => {
  const [constraints] = await sequelize.query(`
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'users'
      AND c.contype = 'u'
      AND pg_get_constraintdef(c.oid) = 'UNIQUE (cnic_bform)'
    ORDER BY c.conname;
  `);

  for (const constraint of constraints.slice(1)) {
    await sequelize.query(`ALTER TABLE users DROP CONSTRAINT ${quoteIdentifier(constraint.conname)};`);
    console.log(`Dropped duplicate constraint "${constraint.conname}"`);
  }
};

const ensureBookDetailColumns = async () => {
  await sequelize.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS author VARCHAR(200) NOT NULL DEFAULT 'Unknown';
  `);

  await sequelize.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS language VARCHAR(100) NOT NULL DEFAULT 'Other';
  `);
};

const setupDatabase = async () => {
  try {
    console.log('Setting up database...');

    await ensureDatabaseExists();

    await sequelize.authenticate();
    console.log('Database connection established');

    await sequelize.sync();
    console.log('All models synchronized');

    await ensureBookDetailColumns();
    await cleanupDuplicateUniqueConstraints();

    const [users] = await sequelize.query('SELECT COUNT(*) FROM users;');
    const [books] = await sequelize.query('SELECT COUNT(*) FROM books;');

    console.log(`
Database Setup Complete
Database: ${databaseName}
Tables: users, books
Users: ${users[0].count || 0}
Books: ${books[0].count || 0}
`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
};

setupDatabase();
