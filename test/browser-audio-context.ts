navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  .then((stream) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(2048, 1, 1);

    processor.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer.getChannelData(0);
      console.log(inputBuffer); // 处理音频数据
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  })
  .catch((error) => {
    console.error('Error accessing media devices:', error);
  });
