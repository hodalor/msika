const fs = require('fs');
const path = require('path');

const setupDirectories = () => {
  const dirs = [
    path.join(__dirname, '../public'),
    path.join(__dirname, '../public/uploads')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      } catch (error) {
        console.error(`Error creating directory ${dir}:`, error);
        throw error;
      }
    } else {
      // Verify write permissions
      try {
        fs.accessSync(dir, fs.constants.W_OK);
        console.log(`Directory ${dir} is writable`);
      } catch (error) {
        console.error(`Directory ${dir} is not writable:`, error);
        throw error;
      }
    }
  });
};

module.exports = setupDirectories; 