import { macAddress } from '@/utils';

const OTA_VERSION_URL = 'https://api.tenclass.net/xiaozhi/ota/';
const MAC_ADDRESS = macAddress();

interface DeviceInfo {
  flash_size: number;
  minimum_free_heap_size: number;
  mac_address: string;
  chip_model_name: string;
  chip_info: ChipInfo;
  application: Application;
  partition_table: Partition[];
  ota: Ota;
  board: Board;
}

// 定义芯片信息接口
interface ChipInfo {
  model: number;
  cores: number;
  revision: number;
  features: number;
}

// 定义应用信息接口
interface Application {
  name: string;
  version: string;
  compile_time: string;
  idf_version: string;
  elf_sha256: string;
}

// 定义分区表接口
interface Partition {
  label: string;
  type: number;
  subtype: number;
  address: number;
  size: number;
}

// 定义 OTA 信息接口
interface Ota {
  label: string;
}

// 定义开发板信息接口
interface Board {
  type: string;
  ssid: string;
  rssi: number;
  channel: number;
  ip: string;
  mac: string;
}

export interface OtaInfo {
  mqtt: {
    endpoint: string,
    client_id: string,
    username: string,
    password: string,
    publish_topic: string,
    subscribe_topic: string
  },
  server_time: {
    timestamp: number,
    timezone: string,
    timezone_offset: number
  },
  firmware: {
    version: string,
    url: string
  },
  activation: { code: string, message: string }
}

export default {
  async otaInfo(options?: Partial<DeviceInfo>) {
    const defaults = {
      application: {},
    };
    return fetch(OTA_VERSION_URL, {
      method: 'post',
      body: JSON.stringify(Object.assign(defaults, options)),
      headers: {
        'Device-Id': MAC_ADDRESS,
        'Content-Type': 'application/json',
      },
    }).then<OtaInfo>((res) => {
      return res.json();
    });
  },
};
