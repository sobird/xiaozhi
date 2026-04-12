import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const isWindows = os.platform() === 'win32';

// Show installation guide
function showInstallGuide() {
  const platform = os.platform();
  let message = '\n❌ Sox is not installed. Please follow the installation guide below:\n\n';

  switch (platform) {
    case 'darwin': // macOS
      message += 'Recommended to install via Homebrew:\n';
      message += '  1. Install Homebrew (if not already installed):\n';
      message += '     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"\n\n';
      message += '  2. Install Sox:\n';
      message += '     brew install sox\n';
      break;

    case 'linux':
      // Detect package manager
      if (spawnSync('which', ['apt-get'], { stdio: 'ignore' }).status === 0) {
        message += 'Using apt (Debian/Ubuntu):\n';
        message += '  sudo apt update && sudo apt install sox\n';
      } else if (spawnSync('which', ['yum'], { stdio: 'ignore' }).status === 0) {
        message += 'Using yum (RHEL/CentOS):\n';
        message += '  sudo yum install sox\n';
      } else if (spawnSync('which', ['pacman'], { stdio: 'ignore' }).status === 0) {
        message += 'Using pacman (Arch):\n';
        message += '  sudo pacman -S sox\n';
      } else {
        message += 'Please install sox using your system package manager\n';
      }
      break;

    case 'win32': // Windows
      message += 'Windows installation methods:\n';
      message += '  1. Via Chocolatey (recommended):\n';
      message += '     choco install sox\n\n';
      message += '  2. Manual installation:\n';
      message += '     a. Download from official website: http://sox.sourceforge.net/\n';
      message += '     b. Add sox.exe directory to PATH environment variable\n';
      break;

    default:
      message += 'Please visit official website for installation guide: http://sox.sourceforge.net/';
  }

  console.error(message);
  process.exit(1);
}

export function cmdExists(cmd: string) {
  const pathExts = (isWindows ? process.env.PATHEXT || '' : '').split(';');
  const pathDirs = (process.env.PATH || '').split(isWindows ? ';' : ':');

  for (const dir of pathDirs) {
    for (const ext of pathExts) {
      const fullPath = path.join(dir, cmd + ext);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        return true;
      }
    }
  }
  showInstallGuide();
  return false;
}
