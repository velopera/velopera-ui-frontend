interface StatusData {
  speed?: number;
  gear?: number;
  aku_voltage?: number;
  temperature?: number;
  humidity?: number;
  comp_x?: number;
  comp_y?: number;
  comp_z?: number;
}

interface LoginData {
  networkStatus?: string;
  rsrp?: number;
  mcc?: string;
  mnc?: string;
  cid?: string;
  band?: string;
  areaCode?: string;
  op?: string;
  modem?: string;
  fw?: string;
  iccid?: string;
}

// Define the structure device status data
interface DeviceStatus {
  imei: string;
  veloId: string;
  statusData: StatusData;
}

// Define the structure device login data
interface DeviceLogin {
  imei: string;
  veloId: string;
  loginData: LoginData;
}

export type { DeviceLogin, DeviceStatus };
