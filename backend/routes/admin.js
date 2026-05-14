const express = require('express');
const { Op } = require('sequelize');
const Book = require('../models/Book');
const User = require('../models/User');
const { sequelize } = require('../config/database');
const { buildSimplePdf } = require('../utils/pdf');
const { requireAdminAuth } = require('../middleware/adminAuth');
const logAdminActivity = require('../middleware/adminLogger');

const router = express.Router();
const TARGET_BOOKS = 100000;

router.use(requireAdminAuth);
router.use(logAdminActivity);

const csvEscape = (value) => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadName = (prefix, extension) => {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${prefix}-${stamp}.${extension}`;
};

const getLeaderboard = async (groupBy, limit = 10) => {
  const attribute = groupBy === 'school' ? 'location' : 'region';
  const label = groupBy === 'school' ? 'school' : 'region';

  const rows = await User.findAll({
    attributes: [
      [sequelize.col(attribute), label],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalUsers'],
      [sequelize.fn('SUM', sequelize.col('books_read_count')), 'totalBooks']
    ],
    group: [attribute],
    order: [[sequelize.literal('SUM("books_read_count")'), 'DESC']],
    limit,
    raw: true
  });

  return rows.map((row) => ({
    name: row[label],
    totalUsers: parseInt(row.totalUsers, 10) || 0,
    totalBooks: parseInt(row.totalBooks, 10) || 0
  }));
};

router.get('/overview', async (req, res) => {
  try {
    const [totalBooks, totalUsers, activeReaders, totalSchools, totalRegions, topReaders, byRegion, bySchool, byLanguage, recentBooks] = await Promise.all([
      Book.count(),
      User.count(),
      User.count({ where: { booksReadCount: { [Op.gt]: 0 } } }),
      User.count({ distinct: true, col: 'location' }),
      User.count({ distinct: true, col: 'region' }),
      User.findAll({
        attributes: ['id', 'firstName', 'lastName', 'location', 'region', 'booksReadCount'],
        where: { booksReadCount: { [Op.gt]: 0 } },
        order: [['booksReadCount', 'DESC']],
        limit: 8,
        raw: true
      }),
      getLeaderboard('region', 8),
      getLeaderboard('school', 8),
      Book.findAll({
        attributes: [
          'language',
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalBooks']
        ],
        group: ['language'],
        order: [[sequelize.literal('COUNT("id")'), 'DESC']],
        raw: true
      }),
      Book.findAll({
        attributes: ['id', 'bookTitle', 'author', 'language', 'recordedAt'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'location', 'region']
        }],
        order: [['recordedAt', 'DESC']],
        limit: 10
      })
    ]);

    res.json({
      metrics: {
        totalBooks,
        totalUsers,
        activeReaders,
        totalSchools,
        totalRegions,
        target: TARGET_BOOKS,
        percentageComplete: totalBooks > 0 ? Number(((totalBooks / TARGET_BOOKS) * 100).toFixed(2)) : 0
      },
      topReaders,
      leaderboards: {
        byRegion,
        bySchool
      },
      byLanguage: byLanguage.map((row) => ({
        language: row.language,
        totalBooks: parseInt(row.totalBooks, 10) || 0
      })),
      recentBooks: recentBooks.map((book) => ({
        id: book.id,
        bookTitle: book.bookTitle,
        author: book.author,
        language: book.language,
        recordedAt: book.recordedAt,
        reader: `${book.user.firstName} ${book.user.lastName}`,
        school: book.user.location,
        region: book.user.region
      }))
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/leaderboards', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const [byRegion, bySchool, topReaders] = await Promise.all([
      getLeaderboard('region', limit),
      getLeaderboard('school', limit),
      User.findAll({
        attributes: ['id', 'firstName', 'lastName', 'location', 'region', 'booksReadCount'],
        where: { booksReadCount: { [Op.gt]: 0 } },
        order: [['booksReadCount', 'DESC']],
        limit,
        raw: true
      })
    ]);

    res.json({ byRegion, bySchool, topReaders });
  } catch (error) {
    console.error('Admin leaderboards error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/reports.csv', async (req, res) => {
  try {
    const { region, school, language } = req.query;
    const whereClause = {};
    const userWhereClause = {};

    if (region && region !== '') userWhereClause.region = region;
    if (school && school !== '') userWhereClause.location = school;
    if (language && language !== '') whereClause.language = language;

    const books = await Book.findAll({
      where: whereClause,
      attributes: ['bookTitle', 'author', 'language', 'recordedAt'],
      include: [{
        model: User,
        as: 'user',
        where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined,
        required: true,
        attributes: ['firstName', 'lastName', 'cnicBform', 'category', 'region', 'location', 'booksReadCount']
      }],
      order: [['recordedAt', 'DESC']]
    });

    const header = ['Reader', 'CNIC/B-Form', 'Category', 'Region', 'School/Office', 'Book Title', 'Author', 'Language', 'Recorded At', 'Reader Total'];
    const rows = books.map((book) => [
      `${book.user.firstName} ${book.user.lastName}`,
      book.user.cnicBform,
      book.user.category,
      book.user.region,
      book.user.location,
      book.bookTitle,
      book.author,
      book.language,
      book.recordedAt.toISOString(),
      book.user.booksReadCount
    ]);

    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName('gift-of-reading-report', 'csv')}"`);
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/reports.pdf', async (req, res) => {
  try {
    const { region, school, language } = req.query;
    const whereClause = {};
    const userWhereClause = {};

    if (region && region !== '') userWhereClause.region = region;
    if (school && school !== '') userWhereClause.location = school;
    if (language && language !== '') whereClause.language = language;

    const [totalBooks, totalUsers, activeReaders, topSchools] = await Promise.all([
      Book.count({
        where: whereClause,
        include: Object.keys(userWhereClause).length > 0 ? [{ model: User, as: 'user', where: userWhereClause, required: true }] : []
      }),
      User.count({ where: userWhereClause }),
      User.count({ where: { ...userWhereClause, booksReadCount: { [Op.gt]: 0 } } }),
      getLeaderboard('school', 5)
    ]);

    const pdfData = {
      title: 'Gift of Reading Admin Report',
      generatedAt: new Date().toLocaleString(),
      filters: {
        region: region || 'All Regions',
        school: school || 'All Schools',
        language: language || 'All Languages'
      },
      stats: {
        totalBooks,
        totalUsers,
        activeReaders,
        progress: totalBooks > 0 ? ((totalBooks / TARGET_BOOKS) * 100).toFixed(2) : '0.00'
      },
      topSchools: topSchools.map((s, i) => ({
        rank: i + 1,
        name: s.name,
        books: s.totalBooks,
        readers: s.totalUsers
      }))
    };

    const pdf = buildSimplePdf(pdfData.title, pdfData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName('gift-of-reading-report', 'pdf')}"`);
    res.send(pdf);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/certificates/:userId.pdf', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const lines = [
      'This certificate is proudly presented to',
      '',
      `${user.firstName} ${user.lastName}`,
      '',
      `For contributing ${user.booksReadCount || 0} book(s) to the Gift of Reading Initiative.`,
      `School/Office: ${user.location}`,
      `Region: ${user.region}`,
      `Issued: ${new Date().toLocaleDateString()}`
    ];

    const pdf = buildSimplePdf('Certificate of Reading Achievement', lines);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reading-certificate-${user.id}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Certificate export error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
