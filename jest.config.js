module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'], // Add setup file (see below)
  modulePaths: [
    "<rootDir>"
  ],

//let's try to stop jest from running EVERY bloodtime I save a file
  // "jest.runMode": "on-demand",
  // "jest.autoRun": { "watch": false },
  // "jest.autoRevealOutput": "off",
  // "jest.runAllTestsFirst": false,
  // "jest.autoEnable": false,
  // "jest.showCoverageOnLoad": false,
  // "jest.autoEnable": false,
  // "jest.autoRun":false
   
};