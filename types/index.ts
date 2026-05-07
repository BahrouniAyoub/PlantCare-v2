export interface Profile {
  id: string;
  name: string;
  email?: string;
  created_at: string;
}

export interface Plant {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  image_url: string;
  location: string;
  notes: string;
  health_score: number;
  device_id: string | null;
  created_at: string;
  device?: Device;
  latest_telemetry?: TelemetryReading;
}

export interface Device {
  id: string;
  owner_id: string;
  plant_id: string | null;
  name: string;
  type: 'simulated';
  status: 'online' | 'offline';
  scenario: SimulationScenario;
  automation_enabled: boolean;
  min_moisture: number;
  max_moisture: number;
  last_seen_at: string;
  created_at: string;
}

export type SimulationScenario =
  | 'normal'
  | 'dry_plant'
  | 'overwatered'
  | 'hot_day'
  | 'low_tank'
  | 'offline';

export interface TelemetryReading {
  id: string;
  owner_id: string;
  device_id: string;
  plant_id: string | null;
  soil_moisture: number;
  temperature: number;
  humidity: number;
  tank_level: number;
  pump_on: boolean;
  created_at: string;
}

export interface IrrigationEvent {
  id: string;
  owner_id: string;
  device_id: string;
  plant_id: string | null;
  duration_seconds: number;
  trigger_type: 'manual' | 'automatic';
  success: boolean;
  message: string;
  created_at: string;
}

export type AlertType =
  | 'dry_soil'
  | 'overwatered'
  | 'low_tank'
  | 'device_offline'
  | 'pump_error'
  | 'info';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  owner_id: string;
  device_id: string | null;
  plant_id: string | null;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  plant?: { name: string };
}
