import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'
import opus from '@discordjs/opus'
import { aesCtrEncrypt, aesCtrDecrypt } from '@/utils/crypto'
// import { tipSpinner } from '@/utils/spinner';
import DgramService from './DgramService'

interface AudioOptions {
  udp: {
    server: string
    port: number
    encryption: string
    key: string
    nonce: string
  }
  // 音频输入
  inputSampleRate: SampleRate
  inputChannels: number
  inputFrameDuration: number
  // 音频输出
  outputSampleRate: SampleRate
  outputChannels: number
  outputframeDuration?: number
}

// 单例
export class AudioService {
  options?: AudioOptions
  mic?: ChildProcessWithoutNullStreams
  speaker?: ChildProcessWithoutNullStreams
  sequence = 0
  isPaused = false

  // 【新增】PCM 缓冲区，用于对齐 Opus 帧
  private pcmAccumulator = Buffer.alloc(0)

  hello(options: AudioOptions) {
    this.options = options
    this.createMicrophone()
    this.createSpeaker()
    this.sequence = 0
    this.pcmAccumulator = Buffer.alloc(0) // 重置缓冲区
  }

  createMicrophone() {
    if (this.mic || !this.options) return

    const { inputSampleRate, inputChannels, inputFrameDuration } = this.options
    const BYTES_PER_FRAME = (inputSampleRate * inputChannels * 2 * inputFrameDuration) / 1000

    const encoder = new opus.OpusEncoder(inputSampleRate, inputChannels)

    const sox = spawn('sox', [
      '-q', // 静音模式，减少 stderr 输出
      '-t',
      process.platform === 'win32' ? 'waveaudio' : 'coreaudio',
      '-d',
      '-t',
      'raw',
      '-r',
      `${inputSampleRate}`,
      '-b',
      '16',
      '-c',
      `${inputChannels}`,
      '-e',
      'signed-integer',
      '-',
    ])

    const micStream = sox.stdout

    micStream.on('data', (chunk: Buffer) => {
      if (this.isPaused || !this.options) return

      // 1. 将新数据放入蓄水池
      this.pcmAccumulator = Buffer.concat([this.pcmAccumulator, chunk])

      // 2. 只要池子里的水够一帧，就循环处理
      while (this.pcmAccumulator.length >= BYTES_PER_FRAME) {
        // 截取固定长度的一帧
        const frame = this.pcmAccumulator.subarray(0, BYTES_PER_FRAME)
        // 池子中扣除已处理的数据
        this.pcmAccumulator = this.pcmAccumulator.subarray(BYTES_PER_FRAME)

        try {
          // 3. 此时的 frame 长度固定为 640，encoder 不再会报错
          const encodedBuffer = encoder.encode(frame)

          this.sendAudioPacket(encodedBuffer)
        } catch (err) {
          console.error('Opus Encode Error:', err)
        }
      }
    })

    sox.on('close', () => {
      this.mic = undefined
    })
    this.mic = sox
  }

  // 抽离发送逻辑，保持代码整洁
  private sendAudioPacket(encodedBuffer: Buffer) {
    if (!this.options) return
    const { key, nonce, port, server } = this.options.udp

    const encodedBufferLengthHex = encodedBuffer.length.toString(16).padStart(4, '0')
    this.sequence += 1
    const sequenceHex = this.sequence.toString(16).padStart(8, '0')

    const newNonce = nonce.slice(0, 4) + encodedBufferLengthHex + nonce.slice(8, 24) + sequenceHex
    const encryptedData = aesCtrEncrypt(key, newNonce, encodedBuffer)
    const packet = Buffer.concat([Buffer.from(newNonce, 'hex'), encryptedData])

    DgramService.send(packet, port, server, (err) => {
      if (err) console.error('Error sending audio:', err)
    })
  }

  // 启动扬声器
  createSpeaker() {
    if (this.speaker) {
      return
    }

    if (!this.options) {
      return
    }

    const { outputSampleRate, outputChannels } = this.options

    const sox = spawn('sox', [
      '-t',
      'raw', // 指定输入格式为原始音频数据
      '-r',
      `${outputSampleRate}`, // 采样率
      '-b',
      '16', // 位深
      '-c',
      `${outputChannels}`, // 声道数
      '-e',
      'signed-integer',
      '-', // 从标准输入读取数据
      '-t',
      process.platform === 'win32' ? 'waveaudio' : 'coreaudio',
      '-d', // 输出到默认音频设备
    ])

    // let timer: NodeJS.Timeout;
    sox.stderr.on('data', () => {
      // const lns = data.toString().split('\n');
      // if (lns.length > 1) {
      //   return;
      // }
      // process.stdout.write('\r'); // 移动光标到行首
      // process.stdout.write('\x1b[2K'); // 清除当前行
      // process.stdout.write(data.toString());
      // // console.error(data.toString());
      // if (!this.ttsStoped) {
      //   return;
      // }
      // clearTimeout(timer);
      // timer = setTimeout(() => {
      //   // process.stdout.write('\r'); // 移动光标到行首
      //   // process.stdout.write('\x1b[2K'); // 清除当前行
      //   tipSpinner.start();
      // }, 200);
    })

    const encoder2 = new opus.OpusEncoder(outputSampleRate, outputChannels)

    DgramService.on('message', (data) => {
      if (!this.options) {
        return
      }
      const { key } = this.options.udp

      const nonce = data.subarray(0, 16)
      const encryptedBuffer = data.subarray(16)
      const decryptedBuffer = aesCtrDecrypt(key, nonce.toString('hex'), encryptedBuffer)
      const decodeBuffer = encoder2.decode(decryptedBuffer)

      sox.stdin.write(decodeBuffer)
    })

    this.speaker = sox
  }

  pauseMicrophone() {
    if (!this.mic) {
      return
    }
    this.isPaused = true
  }

  resumeMicrophone() {
    if (!this.mic) {
      return
    }
    this.isPaused = false
  }
}

export default new AudioService()
