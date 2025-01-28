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

interface GpsMsg {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  speedAccuracy?: number;
  heading?: number;
  pdop?: number;
  hdop?: number;
  vdop?: number;
  tdop?: number;
  measId?: number;
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

// Define the structure device gps data
interface DeviceGps {
  imei: string;
  veloId: string;
  gpsData: GpsMsg;
}

export type {DeviceStatus, DeviceLogin, DeviceGps };
