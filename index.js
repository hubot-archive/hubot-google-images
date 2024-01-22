const path = require('path');

module.exports = async (robot) => {
  const scriptsPath = path.resolve(__dirname, 'src');
  await robot.loadFile(scriptsPath, 'google-images.js');
};
