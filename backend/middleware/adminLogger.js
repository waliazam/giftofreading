const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../admin-activity.log');

const logAdminActivity = (req, res, next) => {
  const originalSend = res.send;

  res.send = function(data) {
    if (req.admin) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        adminId: req.admin.adminId,
        username: req.admin.username,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        ip: req.ip
      };

      fs.appendFile(logFile, JSON.stringify(logEntry) + '\n', (err) => {
        if (err) console.error('Failed to write admin log:', err);
      });
    }
    originalSend.apply(res, arguments);
  };

  next();
};

module.exports = logAdminActivity;
