interface StatusData {
  networkStatus?: string;
  rsrp?: number;
  mcc?: number;
  mnc?: number;
  cid?: number;
  band?: number;
  areaCode?: number;
  op?: number;
  modem?: string;
  fw?: string;
  iccid?: string;
  speed?: number;
  gear?: number;
  aku_voltage?: number;
  temperature?: number;
  humidity?: number;
  comp_x?: number;
  comp_y?: number;
  comp_z?: number;
}

// Define the structure device status data
interface DeviceStatus {
  imei: string;
  veloId: string;
  statusData: StatusData;
}

export type { DeviceStatus };
