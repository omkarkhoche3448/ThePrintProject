// This is a CommonJS entry point file for electron-builder
module.exports = {
  appId: 'com.printproject.dashboard',
  productName: 'Print Project Dashboard',
  files: [
    'dist/**/*',
    'electron/**/*'
  ],
  directories: {
    buildResources: 'assets',
    output: 'dist_electron'
  },
  win: {
    target: ['nsis'],
    icon: 'assets/icons/icon.ico'
  },
  mac: {
    target: ['dmg'],
    icon: 'assets/icons/icon.icns'
  },
  linux: {
    target: ['AppImage'],
    icon: 'assets/icons/icon.png'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },
  publish: {
    provider: 'github',
    private: false,
    releaseType: 'release'
  }
};