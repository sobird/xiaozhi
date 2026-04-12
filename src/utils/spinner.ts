import ora from 'ora';

export const tipSpinner = ora({
  discardStdin: false,
  text: '请按下空格键开始说话(ctrl+c 退出聊天)...',
  color: 'magenta',
});
