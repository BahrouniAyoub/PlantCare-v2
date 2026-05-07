import { supabase } from '@/lib/supabase';
import { SimulationScenario, TelemetryReading, Device } from '@/types';

// Clamps a value between min and max
function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

// Adds small random variation to a value
function jitter(val: number, amount: number) {
  return val + (Math.random() - 0.5) * amount;
}

// Generates a new telemetry reading based on scenario and previous state
export function simulateTick(
  prev: Partial<TelemetryReading>,
  scenario: SimulationScenario,
  pumpOn: boolean
): Omit<TelemetryReading, 'id' | 'owner_id' | 'device_id' | 'plant_id' | 'created_at'> {
  let moisture = prev.soil_moisture ?? 60;
  let temp = prev.temperature ?? 22;
  let humidity = prev.humidity ?? 60;
  let tank = prev.tank_level ?? 95;
  let pump = false;

  // Watering event boosts moisture and drains tank
  if (pumpOn) {
    moisture = clamp(moisture + 20, 0, 100);
    tank = clamp(tank - 5, 0, 100);
    pump = true;
  }

  switch (scenario) {
    case 'normal':
      moisture = clamp(jitter(moisture - 0.3, 1), 20, 90);
      temp = clamp(jitter(temp, 0.5), 18, 28);
      humidity = clamp(jitter(humidity, 2), 40, 80);
      tank = clamp(jitter(tank - 0.05, 0.2), 10, 100);
      break;

    case 'dry_plant':
      moisture = clamp(jitter(moisture - 1.5, 1), 5, 90);
      temp = clamp(jitter(temp, 0.5), 18, 30);
      humidity = clamp(jitter(humidity - 0.5, 2), 25, 70);
      tank = clamp(jitter(tank - 0.05, 0.2), 10, 100);
      break;

    case 'overwatered':
      moisture = clamp(jitter(moisture + 0.2, 0.5), 75, 100);
      temp = clamp(jitter(temp, 0.5), 18, 26);
      humidity = clamp(jitter(humidity + 0.3, 1), 70, 95);
      tank = clamp(jitter(tank - 0.05, 0.2), 10, 100);
      break;

    case 'hot_day':
      moisture = clamp(jitter(moisture - 2, 1.5), 5, 90);
      temp = clamp(jitter(temp + 0.5, 1), 30, 42);
      humidity = clamp(jitter(humidity - 1, 2), 15, 50);
      tank = clamp(jitter(tank - 0.1, 0.3), 10, 100);
      break;

    case 'low_tank':
      moisture = clamp(jitter(moisture - 0.3, 1), 20, 90);
      temp = clamp(jitter(temp, 0.5), 18, 28);
      humidity = clamp(jitter(humidity, 2), 40, 80);
      tank = clamp(jitter(tank - 2, 0.5), 0, 15);
      break;

    case 'offline':
      return {
        soil_moisture: prev.soil_moisture ?? 50,
        temperature: prev.temperature ?? 22,
        humidity: prev.humidity ?? 60,
        tank_level: prev.tank_level ?? 80,
        pump_on: false,
      };
  }

  return {
    soil_moisture: Math.round(moisture * 10) / 10,
    temperature: Math.round(temp * 10) / 10,
    humidity: Math.round(humidity * 10) / 10,
    tank_level: Math.round(tank * 10) / 10,
    pump_on: pump,
  };
}

// Runs one simulation tick for a single device, persists telemetry, generates alerts
export async function runDeviceTick(device: Device, ownerId: string) {
  if (device.scenario === 'offline') {
    await supabase.from('devices').update({ status: 'offline' }).eq('id', device.id);
    return;
  }

  // Get last telemetry reading
  const { data: prevRows } = await supabase
    .from('telemetry_readings')
    .select('*')
    .eq('device_id', device.id)
    .order('created_at', { ascending: false })
    .limit(1);

  const prev = prevRows?.[0] ?? {};
  const reading = simulateTick(prev, device.scenario, false);

  // Insert new telemetry
  await supabase.from('telemetry_readings').insert({
    owner_id: ownerId,
    device_id: device.id,
    plant_id: device.plant_id,
    ...reading,
  });

  // Update device last_seen_at and status
  await supabase
    .from('devices')
    .update({ status: 'online', last_seen_at: new Date().toISOString() })
    .eq('id', device.id);

  // Auto-watering logic
  if (
    device.automation_enabled &&
    reading.soil_moisture < device.min_moisture &&
    reading.tank_level > 10
  ) {
    // Check how many automatic waterings happened today
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const { data: todayWaterings } = await supabase
      .from('irrigation_events')
      .select('id')
      .eq('device_id', device.id)
      .eq('trigger_type', 'automatic')
      .gte('created_at', dayStart.toISOString());

    if ((todayWaterings?.length ?? 0) < 3) {
      await triggerWatering(device.id, ownerId, device.plant_id, 'automatic', reading);
    }
  }

  // Alert generation
  await generateAlerts(device, ownerId, reading);
}

export async function triggerWatering(
  deviceId: string,
  ownerId: string,
  plantId: string | null,
  triggerType: 'manual' | 'automatic',
  currentReading?: Partial<TelemetryReading>
) {
  // Check tank level before watering
  if (currentReading && currentReading.tank_level !== undefined && currentReading.tank_level < 10) {
    return { success: false, message: 'Tank level too low to water.' };
  }

  const { data: latestRows } = await supabase
    .from('telemetry_readings')
    .select('*')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false })
    .limit(1);

  const prev = latestRows?.[0] ?? {};
  const afterWatering = simulateTick(prev, 'normal', true);

  await supabase.from('telemetry_readings').insert({
    owner_id: ownerId,
    device_id: deviceId,
    plant_id: plantId,
    ...afterWatering,
  });

  await supabase.from('irrigation_events').insert({
    owner_id: ownerId,
    device_id: deviceId,
    plant_id: plantId,
    duration_seconds: 10,
    trigger_type: triggerType,
    success: true,
    message: triggerType === 'manual' ? 'Manual watering triggered.' : 'Auto-watering triggered.',
  });

  return { success: true, message: 'Watering complete.' };
}

async function generateAlerts(
  device: Device,
  ownerId: string,
  reading: ReturnType<typeof simulateTick>
) {
  const alerts: any[] = [];

  if (reading.soil_moisture < 20) {
    alerts.push({
      owner_id: ownerId,
      device_id: device.id,
      plant_id: device.plant_id,
      type: 'dry_soil',
      severity: 'high',
      title: 'Soil is Very Dry',
      message: `Soil moisture dropped to ${reading.soil_moisture}%. Consider watering soon.`,
    });
  }

  if (reading.soil_moisture > 85) {
    alerts.push({
      owner_id: ownerId,
      device_id: device.id,
      plant_id: device.plant_id,
      type: 'overwatered',
      severity: 'medium',
      title: 'Overwatering Detected',
      message: `Soil moisture is ${reading.soil_moisture}%. Reduce watering frequency.`,
    });
  }

  if (reading.tank_level < 15) {
    alerts.push({
      owner_id: ownerId,
      device_id: device.id,
      plant_id: device.plant_id,
      type: 'low_tank',
      severity: 'critical',
      title: 'Water Tank Low',
      message: `Tank level is ${reading.tank_level}%. Refill the water tank.`,
    });
  }

  if (alerts.length > 0) {
    // Avoid duplicate alerts - only insert if no similar unread alert in last 30 min
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    for (const alert of alerts) {
      const { data: existing } = await supabase
        .from('alerts')
        .select('id')
        .eq('device_id', device.id)
        .eq('type', alert.type)
        .eq('is_read', false)
        .gte('created_at', thirtyMinAgo)
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabase.from('alerts').insert(alert);
      }
    }
  }
}
