const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Book = require('../models/Book');
const User = require('../models/User');
const { sequelize } = require('../config/database');

// Add a book reading
router.post('/add', async (req, res) => {
  try {
    const { userId, bookTitle, author, language } = req.body;
    
    if (!userId || !bookTitle || !author || !language) {
      return res.status(400).json({ error: 'User ID, book title, author, and language are required' });
    }

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transaction = await sequelize.transaction();
    
    try {
      // Create new book entry
      const newBook = await Book.create({
        userId,
        bookTitle: bookTitle.trim(),
        author: author.trim(),
        language: language.trim(),
        recordedAt: new Date()
      }, { transaction });
      
      // Update user's book count
      await User.increment('booksReadCount', { 
        by: 1, 
        where: { id: userId },
        transaction 
      });

      await transaction.commit();
      
      res.status(201).json({ 
        message: 'Book reading recorded successfully', 
        book: {
          id: newBook.id,
          userId: newBook.userId,
          bookTitle: newBook.bookTitle,
          author: newBook.author,
          language: newBook.language,
          recordedAt: newBook.recordedAt
        }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Add Book Error:', error);
    res.status(500).json({ error: 'Failed to add book. Please try again.' });
  }
});

// Get user's reading history
router.get('/user/:userId', async (req, res) => {
  try {
    const books = await Book.findAll({
      where: { userId: req.params.userId },
      order: [['recordedAt', 'DESC']],
      attributes: ['id', 'bookTitle', 'author', 'language', 'recordedAt', 'created_at']
    });
    
    res.json({ books });
  } catch (error) {
    console.error('Get User Books Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get global statistics
router.get('/stats/global', async (req, res) => {
  try {
    // Total books count
    const totalBooks = await Book.count();
    
    // Total users count
    const totalUsers = await User.count();
    
    // Books by region
    const booksByRegion = await User.findAll({
      attributes: [
        'region',
        [sequelize.fn('COUNT', sequelize.col('User.id')), 'totalUsers'],
        [sequelize.fn('SUM', sequelize.col('books_read_count')), 'totalBooks']
      ],
      group: ['region'],
      raw: true
    });

    // Format the region data
    const formattedRegions = booksByRegion.map(region => ({
      _id: region.region,
      totalUsers: parseInt(region.totalUsers) || 0,
      totalBooks: parseInt(region.totalBooks) || 0
    }));
    
    const target = 100000;
    const percentageComplete = totalBooks > 0 ? ((totalBooks / target) * 100).toFixed(2) : '0.00';

    res.json({ 
      totalBooks,
      totalUsers,
      booksByRegion: formattedRegions,
      target,
      percentageComplete: parseFloat(percentageComplete)
    });
  } catch (error) {
    console.error('Get Global Stats Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get top readers (leaderboard)
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topReaders = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'location', 'region', 'booksReadCount'],
      order: [['booksReadCount', 'DESC']],
      limit: limit,
      where: {
        booksReadCount: {
          [Op.gt]: 0
        }
      }
    });
    
    res.json({ topReaders });
  } catch (error) {
    console.error('Get Leaderboard Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get books by region
router.get('/stats/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    
    const users = await User.findAll({
      where: { region },
      attributes: ['id', 'firstName', 'lastName', 'location', 'booksReadCount']
    });

    const totalBooks = users.reduce((sum, user) => sum + user.booksReadCount, 0);
    
    res.json({
      region,
      totalUsers: users.length,
      totalBooks,
      users
    });
  } catch (error) {
    console.error('Get Region Stats Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
