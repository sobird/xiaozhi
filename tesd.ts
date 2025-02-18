import readline from 'readline';

// 获取终端的宽度
function getTerminalWidth() {
  return process.stdout.columns;
}

// 计算右对齐的文本
function getRightAlignedText(text) {
  const terminalWidth = getTerminalWidth();
  const padding = Math.max(0, terminalWidth - text.length);
  return ' '.repeat(padding) + text;
}

// 清除当前行并输出右对齐的文本
function printRightAligned(text) {
  process.stdout.clearLine(0); // 清除整行
  process.stdout.cursorTo(0); // 移动光标到行首
  const alignedText = getRightAlignedText(text);
  process.stdout.write(alignedText);
}

// 防抖函数
function debounce(func, wait) {
  let timeout;

  return function (...args) {
    process.stdout.clearLine(1);
    clearTimeout(timeout);
    timeout = setTimeout(() => { return func.apply(this, args); }, wait);
  };
}

// 初始文本
let text = 'Hello, World!';

// 首次输出右对齐的文本
printRightAligned(text);

// 监听窗口大小变化（防抖处理）
// const handleResize = debounce(() => {
//   printRightAligned(text);
// }, 500); // 防抖时间 100ms

// process.stdout.on('resize', handleResize);

// 模拟动态更新文本
setInterval(() => {
  text = `Current time: ${new Date().toLocaleTimeString()}`;
  // printRightAligned(text);
  console.log('first', text);
}, 1000);
