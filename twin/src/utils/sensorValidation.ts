import { SensorData } from '../context/DataContext';

export type SensorValidationRules = {
  [key: string]: {
    min: number;
    max: number;
    unit: string;
  };
};

const SENSOR_VALIDATION_RULES: SensorValidationRules = {
  // Temperature sensors (0-2000°C)
  temp1: { min: 0, max: 2000, unit: '°C' },
  temp2: { min: 0, max: 2000, unit: '°C' },
  temp3: { min: 0, max: 2000, unit: '°C' },
  burning: { min: 0, max: 2000, unit: '°C' },
  cooler: { min: 0, max: 2000, unit: '°C' },

  // Vibration sensor (0-10 mm/s)
  vibration: { min: 0, max: 10, unit: ' mm/s' },

  // Load sensor (0-100%)
  load: { min: 0, max: 100, unit: '%' },

  // Emission sensor (0-1000 mg/Nm³)
  emission: { min: 0, max: 1000, unit: ' mg/Nm³' },

  // Mill sensors (non-negative values)
  'mill-feed': { min: 0, max: 1000, unit: ' t/h' },
  'mill-pressure': { min: 0, max: 100, unit: ' bar' },
  'mill-particle': { min: 0, max: 100, unit: ' µm' },
  'mill-eff': { min: 0, max: 100, unit: '%' },
};

/**
 * Validates and clamps sensor data values
 */
export const validateSensorValue = (
  sensorId: string,
  value: number
): number => {
  const rule = SENSOR_VALIDATION_RULES[sensorId];
  if (!rule) return value;

  return Math.max(rule.min, Math.min(rule.max, value));
};

/**
 * Validates position array
 */
export const validatePosition = (
  position: any
): [number, number, number] | undefined => {
  if (!Array.isArray(position) || position.length !== 3) {
    return undefined;
  }

  return position.map(coord =>
    typeof coord === 'number' && !isNaN(coord) ? coord : 0
  ) as [number, number, number];
};

/**
 * Comprehensive sensor data validation
 */
export const validateSensorData = (
  sensorId: string,
  data: Partial<SensorData>
): Partial<SensorData> => {
  const validatedData = { ...data };

  // Validate value if provided
  if (typeof validatedData.value === 'number') {
    validatedData.value = validateSensorValue(sensorId, validatedData.value);
  }

  // Validate position if provided
  if (validatedData.position) {
    validatedData.position = validatePosition(validatedData.position);
  }

  // Ensure trend is valid
  if (validatedData.trend && !['up', 'down', 'stable'].includes(validatedData.trend)) {
    validatedData.trend = 'stable';
  }

  // Validate color if provided
  if (typeof validatedData.color === 'number') {
    // Ensure color is within valid range for THREE.js colors
    validatedData.color = Math.max(0, Math.min(0xffffff, validatedData.color));
  }

  return validatedData;
};

/**
 * Gets validation rules for a sensor
 */
export const getSensorValidationRules = (sensorId: string) => {
  return SENSOR_VALIDATION_RULES[sensorId];
};

/**
 * Checks if a sensor value is within normal range
 */
export const isSensorValueNormal = (sensorId: string, value: number): boolean => {
  const rule = SENSOR_VALIDATION_RULES[sensorId];
  if (!rule) return true; // Unknown sensor, assume normal

  return value >= rule.min && value <= rule.max;
};
