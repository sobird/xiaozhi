// 定义一个类来管理文本对齐
class RightAlignedText {
  private text: string;

  private color: string;

  private terminalWidth: number;

  constructor(text: string, color: string = '\x1b[32m') {
    this.text = text;
    this.color = color;
    this.terminalWidth = process.stdout.columns;
  }

  // 方法：打印靠右对齐的文本
  print() {
    process.stdout.write('Loading...');
    process.stdout.write('\x1B[2K\r'); // 清除整行并移动光标到行首
    process.stdout.write('Loading complete!\n');

    // lines.forEach((line, index) => {
    //   const textLength = line.length;
    //   const padding = currentWidth - textLength;

    //   if (padding > 0) {
    //     const alignedText = `${' '.repeat(padding) + this.color + line}\x1b[0m`; // 重置颜色
    //     // process.stdout.write(`${alignedText}\n`);
    //   } else {
    //     process.stdout.write(`${this.color + line}\x1b[0m` + '\n'); // 重置颜色
    //   }

    //   // 如果不是最后一行，清除下一行的内容
    //   if (index < lines.length - 1) {
    //     process.stdout.write('\x1B[2K\r'); // 清除整行并回到行首
    //   }
    // });
  }

  // 方法：更新终端宽度并重新打印文本
  public updateTerminalWidth() {
    this.terminalWidth = process.stdout.columns;
    this.print();
  }
}

// 创建 RightAlignedText 实例
const text = 'Line 1Line 2Line 3';
const rightAlignedText = new RightAlignedText(text);

// 首次打印文本
rightAlignedText.print();

// 监听终端宽度变化
process.on('SIGWINCH', () => {
  // console.log('12112', 12112);
  rightAlignedText.updateTerminalWidth();
});

setTimeout(() => {}, 10000);
