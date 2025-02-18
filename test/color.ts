const colors = [
  { name: '黑色', code: '\x1b[30m' },
  { name: '红色', code: '\x1b[31m' },
  { name: '绿色', code: '\x1b[32m' },
  { name: '黄色', code: '\x1b[33m' },
  { name: '蓝色', code: '\x1b[34m' },
  { name: '紫色', code: '\x1b[35m' },
  { name: '青色', code: '\x1b[36m' },
  { name: '白色', code: '\x1b[37m' },
  { name: '亮黑色', code: '\x1b[90m' },
  { name: '亮红色', code: '\x1b[91m' },
  { name: '亮绿色', code: '\x1b[92m' },
  { name: '亮黄色', code: '\x1b[93m' },
  { name: '亮蓝色', code: '\x1b[94m' },
  { name: '亮紫色', code: '\x1b[95m' },
  { name: '亮青色', code: '\x1b[96m' },
  { name: '亮白色', code: '\x1b[97m' },
];

colors.forEach((color) => {
  process.stdout.write(`${color.code}${color.name}\x1b[0m\n`);
});
