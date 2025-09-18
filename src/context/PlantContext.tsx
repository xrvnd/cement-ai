import React, { createContext, useContext, useState, ReactNode } from 'react';

export type PlantLocation = 'karnataka' | 'rajasthan';

export interface PlantData {
  id: PlantLocation;
  name: string;
  location: string;
  capacity: {
    clinker: string;
    cement: string;
  };
  current_production: {
    clinker: number;
    cement: number;
    utilization: number;
  };
  key_metrics: {
    energy_efficiency: number;
    quality_index: number;
    environmental_compliance: number;
    safety_score: number;
  };
  focus_areas: Array<{
    name: string;
    description: string;
    metrics: Array<{
      name: string;
      current_value: number;
      target_value: number;
      unit: string;
      status: string;
      trend: string;
      last_updated: string;
    }>;
    recommendations: Array<{
      title: string;
      description: string;
      priority: string;
      category: string;
      action_required: boolean;
      estimated_impact?: string;
    }>;
    priority_score: number;
  }>;
  real_time_alerts: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    severity: string;
    timestamp: string;
    location: string;
    action_required: boolean;
  }>;
  performance_summary: {
    overall_score: number;
    categories: {
      energy_efficiency: { score: number; trend: string };
      quality_performance: { score: number; trend: string };
    };
  };
  last_updated: string;
}

const plantData: Record<PlantLocation, PlantData> = {
  karnataka: {
    id: 'karnataka',
    name: 'JK Cement Plant',
    location: 'Karnataka, India',
    capacity: {
      clinker: '4000 ton/day',
      cement: '4800 ton/day'
    },
    current_production: {
      clinker: 3850,
      cement: 4620,
      utilization: 96.3
    },
    key_metrics: {
      energy_efficiency: 87.5,
      quality_index: 94.2,
      environmental_compliance: 98.8,
      safety_score: 95.1
    },
    focus_areas: [
      {
        name: 'Optimize Raw Mill Efficiency',
        description: 'Improve grinding efficiency and reduce power consumption',
        metrics: [
          {
            name: 'Raw Mill Power',
            current_value: 16.8,
            target_value: 15.5,
            unit: 'kWh/ton',
            status: 'good',
            trend: 'decreasing',
            last_updated: '2025-09-12T00:00:00Z'
          }
        ],
        recommendations: [
          {
            title: 'Optimize Grinding Media Distribution',
            description: 'Implement optimal ball size distribution for better grinding efficiency',
            priority: 'high',
            category: 'energy_efficiency',
            action_required: true,
            estimated_impact: '5-8% power reduction'
          }
        ],
        priority_score: 8.5
      }
    ],
    real_time_alerts: [
      {
        id: 'alert_001',
        type: 'warning',
        title: 'Raw Mill Power Consumption High',
        description: 'Power consumption exceeds target by 8%',
        severity: 'medium',
        timestamp: '2025-09-12T00:00:00Z',
        location: 'Raw Mill #1',
        action_required: true
      }
    ],
    performance_summary: {
      overall_score: 89.2,
      categories: {
        energy_efficiency: { score: 87.5, trend: 'improving' },
        quality_performance: { score: 94.2, trend: 'stable' }
      }
    },
    last_updated: '2025-09-12T00:00:00Z'
  },
  rajasthan: {
    id: 'rajasthan',
    name: 'JK Cement Plant',
    location: 'Rajasthan, India',
    capacity: {
      clinker: '3500 ton/day',
      cement: '4200 ton/day'
    },
    current_production: {
      clinker: 3420,
      cement: 4050,
      utilization: 96.4
    },
    key_metrics: {
      energy_efficiency: 85.2,
      quality_index: 92.8,
      environmental_compliance: 98.5,
      safety_score: 94.2
    },
    focus_areas: [
      {
        name: 'Reduce Specific Power Consumption',
        description: 'Optimize energy consumption across operations',
        metrics: [
          {
            name: 'Raw Mill Power',
            current_value: 18.5,
            target_value: 16.0,
            unit: 'kWh/ton',
            status: 'fair',
            trend: 'decreasing',
            last_updated: '2025-09-12T00:00:00Z'
          }
        ],
        recommendations: [
          {
            title: 'Optimize Grinding Media',
            description: 'Implement optimal ball size distribution',
            priority: 'high',
            category: 'energy_efficiency',
            action_required: true
          }
        ],
        priority_score: 9.2
      }
    ],
    real_time_alerts: [
      {
        id: 'alert_001',
        type: 'warning',
        title: 'Mill Power Consumption High',
        description: 'Power consumption exceeds target',
        severity: 'medium',
        timestamp: '2025-09-12T00:00:00Z',
        location: 'Cement Mill #2',
        action_required: true
      }
    ],
    performance_summary: {
      overall_score: 87.5,
      categories: {
        energy_efficiency: { score: 82.0, trend: 'improving' },
        quality_performance: { score: 91.5, trend: 'stable' }
      }
    },
    last_updated: '2025-09-12T00:00:00Z'
  }
};

interface PlantContextType {
  selectedPlant: PlantLocation;
  setSelectedPlant: (plant: PlantLocation) => void;
  currentPlantData: PlantData;
  plantOptions: Array<{ id: PlantLocation; name: string; location: string }>;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export const usePlant = () => {
  const context = useContext(PlantContext);
  if (!context) {
    throw new Error('usePlant must be used within a PlantProvider');
  }
  return context;
};

interface PlantProviderProps {
  children: ReactNode;
}

export const PlantProvider: React.FC<PlantProviderProps> = ({ children }) => {
  const [selectedPlant, setSelectedPlant] = useState<PlantLocation>('karnataka');

  const currentPlantData = plantData[selectedPlant];

  const plantOptions = [
    { id: 'karnataka' as PlantLocation, name: 'JK Cement Plant', location: 'Karnataka, India' },
    { id: 'rajasthan' as PlantLocation, name: 'JK Cement Plant', location: 'Rajasthan, India' }
  ];

  return (
    <PlantContext.Provider
      value={{
        selectedPlant,
        setSelectedPlant,
        currentPlantData,
        plantOptions
      }}
    >
      {children}
    </PlantContext.Provider>
  );
};
