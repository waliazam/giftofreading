const { Admin } = require('../models');
const { sequelize } = require('../config/database');

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Ensure table exists
    await Admin.sync();

    const username = 'kashif.saleem';
    const password = 'KsAkM123!@#';

    const [admin, created] = await Admin.findOrCreate({
      where: { username },
      defaults: {
        username,
        password,
        fullName: 'Kashif Saleem',
        isActive: true
      }
    });

    if (created) {
      console.log(`Admin user "${username}" created successfully.`);
    } else {
      // Update password if it already exists to ensure it's hashed correctly with bcrypt
      admin.password = password;
      await admin.save();
      console.log(`Admin user "${username}" already exists. Password updated.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
