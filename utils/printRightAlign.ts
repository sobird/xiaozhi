import stringWidth from 'string-width';

export function printRightAlign(text: string, color: string = '\x1b[32m') {
  const terminalWidth = process.stdout.columns; // 获取终端宽度
  const textLength = stringWidth(text); // 获取文本长度
  const padding = terminalWidth - textLength - 2; // 计算需要填充的空格数

  if (padding > 0) {
    // 在文本前填充空格
    const alignedText = `${' '.repeat(padding) + color + text}\x1b[0m`;
    console.log(alignedText);
  } else {
    // 如果文本长度超过终端宽度，直接输出文本
    console.log(`${color + text}\x1b[0m`);
  }
}

// 示例用法
// printRightAlign('今天天气真好');
