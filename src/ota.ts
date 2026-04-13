import crypto from 'crypto'
import { EventEmitter } from 'events'
import fs from 'fs'
import os from 'node:os'
import path from 'path'

interface OtaConfig {
  otaURL?: string
  deviceId?: string
  clientId?: string
  serialNumber?: string
  userAgent?: string
  language?: string
  firmwareDir?: string
  currentVersion?: string
}

console.log('os.totalmem()', os.totalmem(), os.freemem(), os.cpus()[0].model, process.version)

/**
 * OTA Manager for Node.js
 *
 * 将 ESP32 C++ OTA 逻辑移植到 Node.js 环境
 */
export class Ota extends EventEmitter {
  public currentVersion = '0.0.0'
  hasNewVersion = false
  hasSerialNumber = false
  firmwareVersion = ''
  firmwareUrl = ''
  constructor(public config: OtaConfig = {}) {
    super()

    // 配置选项
    this.config = {
      otaURL: config.otaURL || process.env.OTA_URL || 'https://api.tenclass.net/xiaozhi/ota/',
      deviceId: config.deviceId || this.getMacAddress(),
      clientId: config.clientId || crypto.randomUUID(),
      serialNumber: config.serialNumber,
      userAgent: config.userAgent || `Node-OTA/1.2.0`,
      language: config.language || 'zh-CN',
      firmwareDir: config.firmwareDir || './firmware',
    }

    // 状态变量
    this.currentVersion = config.currentVersion || '0.0.0'
    this.hasSerialNumber = !!this.config.serialNumber

    // 激活相关
    this.hasActivationCode = false
    this.hasActivationChallenge = false
    this.activationCode = ''
    this.activationChallenge = ''
    this.activationMessage = ''
    this.activationTimeoutMs = 0

    // 配置标志
    this.hasMqttConfig = false
    this.hasWebsocketConfig = false
    this.hasServerTime = false

    // 确保固件目录存在
    if (!fs.existsSync(this.config.firmwareDir)) {
      fs.mkdirSync(this.config.firmwareDir, { recursive: true })
    }

    this.TAG = 'Ota'
    console.log(`[${this.TAG}] Initialized with device: ${this.config.deviceId}`)
  }

  /**
   * 获取设备MAC地址（替代 ESP32 MAC 地址）
   */
  getMacAddress() {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.mac
        }
      }
    }
    return crypto.randomBytes(6).toString('hex').toUpperCase()
  }

  /**
   * 设置 HTTP 请求头（对应 C++ SetupHttp）
   */
  setupHeaders() {
    return {
      // 'Activation-Version': this.hasSerialNumber ? '2' : '1',
      'Device-Id': this.getMacAddress(),
      // 'Client-Id': this.config.clientId!,
      'User-Agent': this.config.userAgent!,
      // 'Accept-Language': this.config.language!,
      'Content-Type': 'application/json',
      // ...(this.hasSerialNumber && {
      //   'Serial-Number': this.config.serialNumber!,
      // }),
    }
  }

  /**
   * 获取系统信息 JSON（对应 C++ GetSystemInfoJson）
   *
   * ```json
   * {
   *   "version": 2,
   *   "flash_size": 4194304,
   *   "psram_size": 0,
   *   "minimum_free_heap_size": 123456,
   *   "mac_address": "00:00:00:00:00:00",
   *   "uuid": "00000000-0000-0000-0000-000000000000",
   *   "chip_model_name": "esp32s3",
   *   "chip_info": {
   *     "model": 1,
   *     "cores": 2,
   *     "revision": 0,
   *     "features": 0
   *   },
   *   "application": {
   *     "name": "my-app",
   *     "version": "1.0.0",
   *     "compile_time": "2021-01-01T00:00:00Z"
   *     "idf_version": "4.2-dev"
   *     "elf_sha256": ""
   *   },
   *   "partition_table": [
   *     "app": {
   *       "label": "app",
   *       "type": 1,
   *       "subtype": 2,
   *       "address": 0x10000,
   *       "size": 0x100000
   *     }
   *   ],
   *   "ota": {
   *     "label": "ota_0"
   *   },
   *   "board": {
   *     ...
   *   }
   * }
   * ```
   */
  getSystemInfo() {
    return {
      version: 2,
      language: 'zh-CN',
      flash_size: 16777216,
      minimum_free_heap_size: 8318916,
      mac_address: this.getMacAddress(),
      uuid: 'df0f7560-d1c2-49e1-ab11-4187d4c0e639',
      chip_model_name: 'esp32s3',
      chip_info: {
        model: 9,
        cores: 2,
        revision: 2,
        features: 18,
      },
      application: {
        name: 'xiaozhi',
        version: '0.9.9',
        compile_time: 'Jan 22 2025T20:40:23Z',
        idf_version: 'v5.3.2-dirty',
        elf_sha256: '22986216df095587c42f8aeb06b239781c68ad8df80321e260556da7fcf5f522',
      },
      partition_table: [
        { label: 'nvs', type: 1, subtype: 2, address: 36864, size: 16384 },
        { label: 'otadata', type: 1, subtype: 0, address: 53248, size: 8192 },
        { label: 'phy_init', type: 1, subtype: 1, address: 61440, size: 4096 },
        { label: 'model', type: 1, subtype: 130, address: 65536, size: 983040 },
        { label: 'storage', type: 1, subtype: 130, address: 1048576, size: 1048576 },
        { label: 'factory', type: 0, subtype: 0, address: 2097152, size: 4194304 },
        { label: 'ota_0', type: 0, subtype: 16, address: 6291456, size: 4194304 },
        { label: 'ota_1', type: 0, subtype: 17, address: 10485760, size: 4194304 },
      ],
      ota: {
        label: 'factory',
      },
      board: {
        type: 'bread-compact-wifi',
        ssid: 'sobird',
        rssi: -58,
        channel: 6,
        ip: '192.168.124.38',
        mac: 'cc:ba:97:20:b4:bc',
      },
    }
  }

  /**
   * 检查版本（对应 C++ CheckVersion）
   */
  async checkVersion() {
    console.log(`[${this.TAG}] Current version: ${this.currentVersion}`)

    try {
      const url = this.config.otaURL
      const systemInfo = this.getSystemInfo()
      const headers = this.setupHeaders()

      const response = await fetch(url!, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ mac_addr: this.getMacAddress() }),
      })

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      console.log('data', data)

      // 解析激活信息
      this.parseActivation(data.activation)

      // 解析 MQTT 配置
      this.parseMqttConfig(data.mqtt)

      // 解析 WebSocket 配置
      this.parseWebsocketConfig(data.websocket)

      // 解析服务器时间
      this.parseServerTime(data.server_time)

      // 解析固件信息
      this.parseFirmware(data.firmware)

      return {
        success: true,
        hasNewVersion: this.hasNewVersion,
        newVersion: this.firmwareVersion,
        hasActivation: this.hasActivationChallenge,
        hasMqttConfig: this.hasMqttConfig,
        hasWebsocketConfig: this.hasWebsocketConfig,
        serverTimeSynced: this.hasServerTime,
      }
    } catch (error) {
      console.error(`[${this.TAG}] Check version failed:`, error.message)
      throw error
    }
  }

  /**
   * 解析激活信息
   */
  parseActivation(activation) {
    this.hasActivationCode = false
    this.hasActivationChallenge = false

    if (!activation || typeof activation !== 'object') return

    if (activation.message) {
      this.activationMessage = activation.message
    }

    if (activation.code) {
      this.activationCode = activation.code
      this.hasActivationCode = true
    }

    if (activation.challenge) {
      this.activationChallenge = activation.challenge
      this.hasActivationChallenge = true
    }

    if (typeof activation.timeout_ms === 'number') {
      this.activationTimeoutMs = activation.timeout_ms
    }

    if (this.hasActivationChallenge) {
      console.log(`[${this.TAG}] Activation challenge received`)
    }
  }

  /**
   * 解析 MQTT 配置
   */
  parseMqttConfig(mqtt) {
    this.hasMqttConfig = false

    if (!mqtt || typeof mqtt !== 'object') {
      console.log(`[${this.TAG}] No MQTT section found`)
      return
    }

    // 保存到配置文件或内存
    this.mqttConfig = {}
    for (const [key, value] of Object.entries(mqtt)) {
      this.mqttConfig[key] = value
    }

    this.hasMqttConfig = true
    console.log(`[${this.TAG}] MQTT config updated`)
    this.emit('mqttConfig', this.mqttConfig)
  }

  /**
   * 解析 WebSocket 配置
   */
  parseWebsocketConfig(websocket) {
    this.hasWebsocketConfig = false

    if (!websocket || typeof websocket !== 'object') {
      console.log(`[${this.TAG}] No WebSocket section found`)
      return
    }

    this.websocketConfig = {}
    for (const [key, value] of Object.entries(websocket)) {
      this.websocketConfig[key] = value
    }

    this.hasWebsocketConfig = true
    console.log(`[${this.TAG}] WebSocket config updated`)
    this.emit('websocketConfig', this.websocketConfig)
  }

  /**
   * 解析服务器时间
   */
  parseServerTime(serverTime) {
    this.hasServerTime = false

    if (!serverTime || typeof serverTime !== 'object') {
      console.warn(`[${this.TAG}] No server_time section found`)
      return
    }

    const { timestamp, timezone_offset } = serverTime

    if (typeof timestamp === 'number') {
      let ts = timestamp

      // 应用时区偏移（分钟转毫秒）
      if (typeof timezone_offset === 'number') {
        ts += timezone_offset * 60 * 1000
      }

      // 注意：Node.js 通常不能随意设置系统时间，这里仅记录偏移
      this.serverTimeOffset = ts - Date.now()
      this.hasServerTime = true

      console.log(`[${this.TAG}] Server time synced, offset: ${this.serverTimeOffset}ms`)
      this.emit('serverTime', { timestamp: ts, offset: this.serverTimeOffset })
    }
  }

  /**
   * 解析固件信息
   */
  parseFirmware(firmware) {
    this.hasNewVersion = false

    if (!firmware || typeof firmware !== 'object') {
      console.warn(`[${this.TAG}] No firmware section found`)
      return
    }

    if (firmware.version) {
      this.firmwareVersion = firmware.version
    }

    if (firmware.url) {
      this.firmwareUrl = firmware.url
    }

    if (this.firmwareVersion && this.firmwareUrl) {
      // 检查版本是否更新
      this.hasNewVersion = this.isNewVersionAvailable(this.currentVersion, this.firmwareVersion)

      if (this.hasNewVersion) {
        console.log(`[${this.TAG}] New version available: ${this.firmwareVersion}`)
      } else {
        console.log(`[${this.TAG}] Current is the latest version`)
      }

      // 强制更新标志
      if (firmware.force === 1) {
        this.hasNewVersion = true
        console.log(`[${this.TAG}] Force update enabled`)
      }
    }
  }

  /**
   * 版本号解析（对应 C++ ParseVersion）
   */
  parseVersion(version) {
    return version.split('.').map((v) => parseInt(v, 10) || 0)
  }

  /**
   * 检查是否有新版本（对应 C++ IsNewVersionAvailable）
   */
  isNewVersionAvailable(currentVersion, newVersion) {
    const current = this.parseVersion(currentVersion)
    const newer = this.parseVersion(newVersion)

    const len = Math.min(current.length, newer.length)
    for (let i = 0; i < len; i++) {
      if (newer[i] > current[i]) return true
      if (newer[i] < current[i]) return false
    }

    return newer.length > current.length
  }

  /**
   * 下载并升级固件（对应 C++ Upgrade）
   * @param {string} firmwareUrl - 固件 URL（可选，默认使用 checkVersion 获取的）
   * @param {function} onProgress - 进度回调 (progress, speed)
   */
  async upgrade(firmwareUrl, onProgress) {
    const url = firmwareUrl || this.firmwareUrl

    if (!url) {
      throw new Error('No firmware URL provided')
    }

    console.log(`[${this.TAG}] Upgrading firmware from ${url}`)

    const outputPath = path.join(this.config.firmwareDir, `firmware_${Date.now()}.bin`)

    try {
      const response = await axios({
        method: 'GET',
        url: url,
        headers: this.setupHeaders(),
        responseType: 'stream',
        timeout: 300000, // 5分钟超时
      })

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`)
      }

      const totalLength = parseInt(response.headers['content-length'], 10)
      if (!totalLength) {
        console.warn(`[${this.TAG}] Content-Length not provided`)
      }

      const writer = fs.createWriteStream(outputPath)
      let receivedLength = 0
      let lastReceivedLength = 0
      let lastCalcTime = Date.now()

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk) => {
          receivedLength += chunk.length

          // 每秒计算一次进度和速度
          const now = Date.now()
          if (now - lastCalcTime >= 1000) {
            const progress = totalLength ? Math.floor((receivedLength / totalLength) * 100) : 0
            const speed = receivedLength - lastReceivedLength // bytes per second

            console.log(`[${this.TAG}] Progress: ${progress}% (${receivedLength}/${totalLength}), Speed: ${speed}B/s`)

            if (onProgress) {
              onProgress(progress, speed)
            }

            this.emit('progress', {
              progress,
              speed,
              received: receivedLength,
              total: totalLength,
            })

            lastReceivedLength = receivedLength
            lastCalcTime = now
          }
        })

        response.data.pipe(writer)

        writer.on('finish', () => {
          console.log(`[${this.TAG}] Firmware downloaded to: ${outputPath}`)
          this.emit('downloadComplete', {
            path: outputPath,
            size: receivedLength,
          })

          // 注意：Node.js 环境不涉及实际刷写固件分区，这里仅模拟完成
          // 在实际应用中，这里可能是解压、验证签名、执行安装脚本等
          this.simulateFirmwareUpdate(outputPath)

          resolve({
            success: true,
            path: outputPath,
            size: receivedLength,
            version: this.firmwareVersion,
          })
        })

        writer.on('error', reject)
        response.data.on('error', reject)
      })
    } catch (error) {
      console.error(`[${this.TAG}] Upgrade failed:`, error.message)
      throw error
    }
  }

  /**
   * 模拟固件更新过程（替代 ESP32 的 flash 写入）
   */
  simulateFirmwareUpdate(firmwarePath) {
    console.log(`[${this.TAG}] Validating firmware: ${firmwarePath}`)

    // 这里可以添加固件验证逻辑，如签名验证、CRC 校验等
    const stats = fs.statSync(firmwarePath)
    console.log(`[${this.TAG}] Firmware size: ${stats.size} bytes`)

    // 模拟标记当前版本有效（对应 C++ MarkCurrentVersionValid）
    console.log(`[${this.TAG}] Firmware marked as valid`)

    return true
  }

  /**
   * 开始升级（对应 C++ StartUpgrade）
   */
  async startUpgrade(onProgress) {
    return this.upgrade(this.firmwareUrl, onProgress)
  }

  /**
   * 生成激活载荷（对应 C++ GetActivationPayload）
   */
  getActivationPayload() {
    if (!this.hasSerialNumber) {
      return '{}'
    }

    // 使用 HMAC-SHA256 计算挑战响应（对应 ESP32 的 esp_hmac_calculate）
    const hmac = crypto.createHmac('sha256', this.config.serialNumber)
    hmac.update(this.activationChallenge)
    const hmacHex = hmac.digest('hex')

    const payload = {
      algorithm: 'hmac-sha256',
      serial_number: this.config.serialNumber,
      challenge: this.activationChallenge,
      hmac: hmacHex,
    }

    console.log(`[${this.TAG}] Activation payload generated`)
    return JSON.stringify(payload)
  }

  /**
   * 激活设备（对应 C++ Activate）
   */
  async activate() {
    if (!this.hasActivationChallenge) {
      console.warn(`[${this.TAG}] No activation challenge found`)
      return { success: false, error: 'No challenge' }
    }

    const baseUrl = this.config.otaUrl.replace(/\/+$/, '')
    const url = `${baseUrl}/activate`

    try {
      const payload = this.getActivationPayload()
      const headers = this.setupHeaders()

      console.log(`[${this.TAG}] Sending activation request to ${url}`)

      const response = await axios({
        method: 'POST',
        url: url,
        headers: headers,
        data: payload,
        timeout: 30000,
      })

      if (response.status === 202) {
        console.log(`[${this.TAG}] Activation pending (timeout)`)
        return {
          success: false,
          status: 'timeout',
          error: 'Activation pending',
        }
      }

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.data}`)
      }

      console.log(`[${this.TAG}] Activation successful`)
      this.emit('activated', { serialNumber: this.config.serialNumber })

      return { success: true, data: response.data }
    } catch (error) {
      console.error(`[${this.TAG}] Activation failed:`, error.message)
      throw error
    }
  }

  /**
   * 标记当前版本有效（对应 C++ MarkCurrentVersionValid）
   * 在 Node.js 中，这可以表示确认当前运行版本稳定
   */
  markCurrentVersionValid() {
    console.log(`[${this.TAG}] Current version marked as valid: ${this.currentVersion}`)
    this.emit('versionValidated', { version: this.currentVersion })
    return true
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      currentVersion: this.currentVersion,
      hasNewVersion: this.hasNewVersion,
      newVersion: this.firmwareVersion,
      hasSerialNumber: this.hasSerialNumber,
      serialNumber: this.config.serialNumber,
      deviceId: this.config.deviceId,
      hasActivationChallenge: this.hasActivationChallenge,
      hasMqttConfig: this.hasMqttConfig,
      hasWebsocketConfig: this.hasWebsocketConfig,
      serverTimeOffset: this.serverTimeOffset || 0,
    }
  }
}

const ota = new Ota()
console.log('first', await ota.checkVersion())

// module.exports = Ota;

// // 使用示例
// if (require.main === module) {
//   async function main() {
//     const ota = new Ota({
//       otaUrl: 'http://localhost:8080/api/ota/check',
//       currentVersion: '1.0.0',
//       serialNumber: 'SN123456789',
//       deviceId: 'AABBCCDDEEFF'
//     });

//     try {
//       // 检查版本
//       const checkResult = await ota.checkVersion();
//       console.log('Check result:', checkResult);

//       // 如果有激活挑战，执行激活
//       if (checkResult.hasActivation) {
//         const activateResult = await ota.activate();
//         console.log('Activate result:', activateResult);
//       }

//       // 如果有新版本，执行升级
//       if (checkResult.hasNewVersion) {
//         await ota.startUpgrade((progress, speed) => {
//           console.log(`Downloading: ${progress}% at ${speed}B/s`);
//         });

//         // 升级成功后标记版本有效
//         ota.markCurrentVersionValid();
//       }

//     } catch (error) {
//       console.error('OTA Error:', error);
//     }
//   }

//   main();
// }
