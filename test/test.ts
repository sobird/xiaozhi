import ora from 'ora';

// 模拟语音输入的强度变化
const simulateVoiceInput = () => {
  const spinner = ora({
    text: 'Listening...',
    color: 'blue',
    spinner: {
      interval: 200, // 动画间隔时间（单位：ms）
      frames: [
        '█    █    █    █',
        '█ █  █    █    █',
        '█ █  █ █  █    █',
        '█ █  █ █  █ █  █',
        '█ █  █ █  █ █  █ █',
        '█ █  █ █  █ █  █',
        '█ █  █ █  █    █',
        '█ █  █    █    █',
        '█    █    █    █',
      ], // 自定义动画帧
    },
  }).start();

  // let intensity = 0;
  // const maxIntensity = 10;

  // const updateIntensity = () => {
  //   intensity += 1;
  //   if (intensity > maxIntensity) {
  //     intensity = 0;
  //   }
  //   spinner.text = `Listening ${'.'.repeat(intensity)}`;
  // };

  // const intervalId = setInterval(updateIntensity, 200);

  // 模拟语音输入结束
  setTimeout(() => {
    // clearInterval(intervalId);
    spinner.succeed('Voice input finished.');
  }, 10000);
};

simulateVoiceInput();
