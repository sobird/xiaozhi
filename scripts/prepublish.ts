// scripts/prepublish.js
import fs from 'fs';
import path from 'path';

import pkg from '../package.json' with { type: 'json' };

const packageJsonPath = path.join(__dirname, '../package.json');

// 修改 bin 字段
pkg.bin.xzai = './dist/index.js';

fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
