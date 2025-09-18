import * as XLSX from 'xlsx';

export interface RawSimulationData {
  Time?: string;
  time?: string;
  Preheater_Temp?: number;
  preheaterTemp?: number;
  Calciner_Temp?: number;
  calcinerTemp?: number;
  Kiln_Inlet_Temp?: number;
  kilnInletTemp?: number;
  Burning_Zone_Temp?: number;
  burningZoneTemp?: number;
  Cooler_Temp?: number;
  coolerTemp?: number;
  Kiln_Vibration?: number;
  kilnVibration?: number;
  Motor_Load?: number;
  motorLoad?: number;
  NOx_Emission?: number;
  noxEmission?: number;
  Fuel_Rate?: number;
  fuelRate?: number;
  Production_Rate?: number;
  productionRate?: number;
  CO2_Emission?: number;
  co2Emission?: number;
  SO2_Emission?: number;
  so2Emission?: number;
}

export interface RawMillData {
  Time?: string;
  time?: string;
  Mill1_Feed_Rate?: number;
  mill1FeedRate?: number;
  Mill1_Pressure?: number;
  mill1Pressure?: number;
  Mill1_Particle_Size?: number;
  mill1ParticleSize?: number;
  Mill1_Efficiency?: number;
  mill1Efficiency?: number;
  Mill2_Feed_Rate?: number;
  mill2FeedRate?: number;
  Mill2_Pressure?: number;
  mill2Pressure?: number;
  Mill2_Particle_Size?: number;
  mill2ParticleSize?: number;
  Mill2_Efficiency?: number;
  mill2Efficiency?: number;
  Power_Consumption?: number;
  powerConsumption?: number;
  Grinding_Media_Wear?: number;
  grindingMediaWear?: number;
  Product_Quality?: number;
  productQuality?: number;
}

export interface SimulationData {
  time: string;
  preheaterTemp: number;
  calcinerTemp: number;
  kilnInletTemp: number;
  burningZoneTemp: number;
  coolerTemp: number;
  kilnVibration: number;
  motorLoad: number;
  noxEmission: number;
  fuelRate: number;
  productionRate: number;
  co2Emission: number;
  so2Emission: number;
}

export interface MillData {
  time: string;
  mill1FeedRate: number;
  mill1Pressure: number;
  mill1ParticleSize: number;
  mill1Efficiency: number;
  mill2FeedRate: number;
  mill2Pressure: number;
  mill2ParticleSize: number;
  mill2Efficiency: number;
  powerConsumption: number;
  grindingMediaWear: number;
  productQuality: number;
}

export interface RawMaterialData {
  Timestamp?: string;
  Limestone_Feed_Rate?: number;
  Clay_Feed_Rate?: number;
  Iron_Ore_Feed_Rate?: number;
  Gypsum_Feed_Rate?: number;
  Moisture_Content?: number;
  Particle_Size_Distribution?: number;
  Mill_1_Feed_Rate?: number;
  Mill_2_Feed_Rate?: number;
  Mill_1_Power_Consumption?: number;
  Mill_2_Power_Consumption?: number;
  Mill_1_Product_Size?: number;
  Mill_2_Product_Size?: number;
  Mill_1_Efficiency?: number;
  Mill_2_Efficiency?: number;
  Cement_Type?: string;
  Quality_Score?: number;
}

export interface ProcessedRawMaterialData {
  timestamp: string;
  limestoneFeedRate: number;
  clayFeedRate: number;
  ironOreFeedRate: number;
  gypsumFeedRate: number;
  moistureContent: number;
  particleSizeDistribution: number;
  mill1FeedRate: number;
  mill2FeedRate: number;
  mill1PowerConsumption: number;
  mill2PowerConsumption: number;
  mill1ProductSize: number;
  mill2ProductSize: number;
  mill1Efficiency: number;
  mill2Efficiency: number;
  cementType: string;
  qualityScore: number;
}

/**
 * Detects if text content is CSV format
 */
export const isCSVFormat = (text: string): boolean => {
  return text.includes(',') && text.includes('\n');
};

/**
 * Parses CSV text into array of objects
 */
export const parseCSV = <T>(csvText: string): T[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row: any = {};
    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      row[header] = value ? (isNaN(Number(value)) ? value : Number(value)) : 0;
    });
    return row as T;
  });
};

/**
 * Parses Excel file into array of objects
 */
export const parseExcel = async <T>(response: Response): Promise<T[]> => {
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet) as T[];
};

/**
 * Maps raw simulation data to structured format
 */
export const mapToSimulationData = (raw: RawSimulationData): SimulationData => ({
  time: raw.Time || raw.time || '00:00',
  preheaterTemp: raw.Preheater_Temp || raw.preheaterTemp || 1245,
  calcinerTemp: raw.Calciner_Temp || raw.calcinerTemp || 1850,
  kilnInletTemp: raw.Kiln_Inlet_Temp || raw.kilnInletTemp || 1120,
  burningZoneTemp: raw.Burning_Zone_Temp || raw.burningZoneTemp || 1450,
  coolerTemp: raw.Cooler_Temp || raw.coolerTemp || 180,
  kilnVibration: raw.Kiln_Vibration || raw.kilnVibration || 2.3,
  motorLoad: raw.Motor_Load || raw.motorLoad || 87,
  noxEmission: raw.NOx_Emission || raw.noxEmission || 245,
  fuelRate: raw.Fuel_Rate || raw.fuelRate || 45.2,
  productionRate: raw.Production_Rate || raw.productionRate || 98.5,
  co2Emission: raw.CO2_Emission || raw.co2Emission || 850,
  so2Emission: raw.SO2_Emission || raw.so2Emission || 12.5,
});

/**
 * Maps raw mill data to structured format
 */
export const mapToMillData = (raw: RawMillData): MillData => ({
  time: raw.Time || raw.time || '00:00',
  mill1FeedRate: raw.Mill1_Feed_Rate || raw.mill1FeedRate || 12.4,
  mill1Pressure: raw.Mill1_Pressure || raw.mill1Pressure || 2.1,
  mill1ParticleSize: raw.Mill1_Particle_Size || raw.mill1ParticleSize || 12,
  mill1Efficiency: raw.Mill1_Efficiency || raw.mill1Efficiency || 78,
  mill2FeedRate: raw.Mill2_Feed_Rate || raw.mill2FeedRate || 12.4,
  mill2Pressure: raw.Mill2_Pressure || raw.mill2Pressure || 2.1,
  mill2ParticleSize: raw.Mill2_Particle_Size || raw.mill2ParticleSize || 12,
  mill2Efficiency: raw.Mill2_Efficiency || raw.mill2Efficiency || 78,
  powerConsumption: raw.Power_Consumption || raw.powerConsumption || 1200,
  grindingMediaWear: raw.Grinding_Media_Wear || raw.grindingMediaWear || 0.5,
  productQuality: raw.Product_Quality || raw.productQuality || 95,
});

/**
 * Loads and parses data from Excel/CSV file
 */
export const loadDataFile = async <T, U>(
  url: string,
  isCSV: (text: string) => boolean,
  parseCSV: (text: string) => T[],
  parseExcel: (response: Response) => Promise<T[]>,
  mapData: (raw: T) => U
): Promise<U[]> => {
  try {
    const response = await fetch(url);
    const text = await response.text();

    let rawData: T[];
    if (isCSV(text)) {
      rawData = parseCSV(text);
    } else {
      rawData = await parseExcel(await fetch(url));
    }

    return rawData.map(mapData);
  } catch (error) {
    console.error('Error loading data file:', error);
    return [];
  }
};

/**
 * Creates fallback data when file loading fails
 */
export const createFallbackSimulationData = (): SimulationData[] => [
  {
    time: '00:00',
    preheaterTemp: 1245,
    calcinerTemp: 1850,
    kilnInletTemp: 1120,
    burningZoneTemp: 1450,
    coolerTemp: 180,
    kilnVibration: 2.3,
    motorLoad: 87,
    noxEmission: 245,
    fuelRate: 45.2,
    productionRate: 98.5,
    co2Emission: 850,
    so2Emission: 12.5,
  },
];

export const createFallbackMillData = (): MillData[] => [];

/**
 * Maps raw material data to structured format
 */
export const mapToRawMaterialData = (rawData: RawMaterialData): ProcessedRawMaterialData => {
  return {
    timestamp: rawData.Timestamp || new Date().toISOString(),
    limestoneFeedRate: rawData.Limestone_Feed_Rate || 85.5,
    clayFeedRate: rawData.Clay_Feed_Rate || 12.9,
    ironOreFeedRate: rawData.Iron_Ore_Feed_Rate || 3.1,
    gypsumFeedRate: rawData.Gypsum_Feed_Rate || 2.1,
    moistureContent: rawData.Moisture_Content || 2.1,
    particleSizeDistribution: rawData.Particle_Size_Distribution || 45.0,
    mill1FeedRate: rawData.Mill_1_Feed_Rate || 12.6,
    mill2FeedRate: rawData.Mill_2_Feed_Rate || 12.0,
    mill1PowerConsumption: rawData.Mill_1_Power_Consumption || 1280,
    mill2PowerConsumption: rawData.Mill_2_Power_Consumption || 1210,
    mill1ProductSize: rawData.Mill_1_Product_Size || 11.8,
    mill2ProductSize: rawData.Mill_2_Product_Size || 11.7,
    mill1Efficiency: rawData.Mill_1_Efficiency || 79.0,
    mill2Efficiency: rawData.Mill_2_Efficiency || 79.7,
    cementType: rawData.Cement_Type || 'OPC',
    qualityScore: rawData.Quality_Score || 92.8
  };
};

/**
 * Creates fallback raw material data when file loading fails
 */
export const createFallbackRawMaterialData = (): ProcessedRawMaterialData[] => [
  {
    timestamp: new Date().toISOString(),
    limestoneFeedRate: 85.5,
    clayFeedRate: 12.9,
    ironOreFeedRate: 3.1,
    gypsumFeedRate: 2.1,
    moistureContent: 2.1,
    particleSizeDistribution: 45.0,
    mill1FeedRate: 12.6,
    mill2FeedRate: 12.0,
    mill1PowerConsumption: 1280,
    mill2PowerConsumption: 1210,
    mill1ProductSize: 11.8,
    mill2ProductSize: 11.7,
    mill1Efficiency: 79.0,
    mill2Efficiency: 79.7,
    cementType: 'OPC',
    qualityScore: 92.8
  },
];
