// Preload script
import { contextBridge } from 'electron';

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  // We need to access process directly since we're in a preload script
  const versions = {
    chrome: process.versions.chrome,
    node: process.versions.node,
    electron: process.versions.electron
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, versions[dependency])
  }
});