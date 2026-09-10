// Simulation Scenarios & Expanded EV Vehicle Database for ANT-EV 2.0
// Includes 8 Detailed Real-World EV Car Models, Section 16 Reference Benchmark, and Multi-Station Data

import type { EVDigitalTwin, ChargingStation, GridTwinState, FleetTwinState, EvaluationMetrics } from '../../types/antev';

export interface SimulationScenario {
  id: string;
  name: string;
  badge: string;
  description: string;
  keyPatentFeatures: string[];
  evs: EVDigitalTwin[];
  stations: ChargingStation[];
  grid: GridTwinState;
  fleet: FleetTwinState;
  expectedDecisions: Record<string, string>;
  scenarioNotes: string[];
}

export const INITIAL_STATIONS: ChargingStation[] = [
  {
    id: "STATION-1",
    name: "Metro Hub Central (Station 1)",
    location: "Downtown Transit Plaza",
    latitude: 34.1377,
    longitude: -118.1253,
    totalChargers: 6,
    availableChargers: 1,
    activeSessions: 5,
    queueLength: 4,
    maxGridPowerCapacityKw: 350,
    currentPowerDrawKw: 295,
    renewableSolarPowerKw: 25,
    tariffPerKwh: 0.38,
    forecastDemand15m: 310,
    forecastDemand30m: 340,
    forecastDemand60m: 320,
    congestionIndex: 0.85,
    networkName: "MetroCharge Direct"
  },
  {
    id: "STATION-2",
    name: "Tech Park Clean Depot (Station 2)",
    location: "Innovation Corridor (1.2 km away)",
    latitude: 34.1415,
    longitude: -118.1189,
    totalChargers: 8,
    availableChargers: 5,
    activeSessions: 3,
    queueLength: 1,
    maxGridPowerCapacityKw: 500,
    currentPowerDrawKw: 140,
    renewableSolarPowerKw: 120,
    tariffPerKwh: 0.22,
    forecastDemand15m: 160,
    forecastDemand30m: 180,
    forecastDemand60m: 210,
    congestionIndex: 0.25,
    networkName: "CleanGrid Solar Alliance"
  },
  {
    id: "STATION-3",
    name: "Logistics Hub East (Depot)",
    location: "Commercial Freight Zone",
    latitude: 34.1320,
    longitude: -118.1050,
    totalChargers: 12,
    availableChargers: 8,
    activeSessions: 4,
    queueLength: 0,
    maxGridPowerCapacityKw: 800,
    currentPowerDrawKw: 210,
    renewableSolarPowerKw: 250,
    tariffPerKwh: 0.18,
    forecastDemand15m: 230,
    forecastDemand30m: 290,
    forecastDemand60m: 380,
    congestionIndex: 0.15,
    networkName: "FleetEnergy Commercial"
  }
];

export const INITIAL_GRID_STATE: GridTwinState = {
  gridStatus: 'HIGH_LOAD',
  currentGridLoadMw: 44.8,
  gridCapacityMw: 50.0,
  renewableAvailabilityPercent: 42,
  renewableForecastRiseMin: 25,
  gridCarbonIntensityGCo2: 385,
  currentTariffPerKwh: 0.36,
  emergencyCurtailmentActive: false
};

export const INITIAL_FLEET_STATE: FleetTwinState = {
  fleetId: "FLEET-EXPRESS-01",
  fleetName: "EcoExpress Urban Delivery Fleet",
  totalVehicles: 20,
  requiredReadyCount: 20,
  targetDeadlineTimestamp: "06:00 AM",
  currentReadyCount: 14,
  totalEnergyDeficitKwh: 145.5,
  fleetOptimizedSchedule: [
    { vehicleId: "EV-C", targetSoc: 85, scheduledSlot: "04:30 - 05:45 AM" }
  ]
};

// Complete Catalog of 8 Distinct EV Models for Testing & Customization
export const AVAILABLE_EV_MODELS: EVDigitalTwin[] = [
  {
    id: "EV-A",
    name: "Vehicle A (Urgent Commuter)",
    model: "Tesla Model 3 Performance",
    licensePlateAnonymized: "HASH-7A9F21",
    type: "passenger_sedan",
    telemetry: {
      soc: 18,
      soh: 91,
      batteryTemp: 44.5, // High thermal stress!
      voltage: 368,
      current: 120,
      maxChargingPowerKw: 150,
      nominalCapacityKwh: 75
    },
    mobility: {
      route: "Downtown to Airport Terminal",
      distanceKm: 48,
      destination: "LAX International Airport",
      departureDeadlineMin: 45,
      estimatedTripEnergyKwh: 14.0,
      destinationSocRequired: 40
    },
    utilityToken: {
      tokenId: "TOK-EV-A-001",
      anonymizedHash: "0x3f8a...c91",
      urgencyScore: 0.92,
      flexibilityScore: 0.10,
      isFleet: false,
      isEmergency: false,
      reciprocityCredit: 12,
      sacrificeMinutesHistory: 15
    },
    batteryTwin: {
      degradationCostPerKwh: 0.18,
      thermalRiskScore: 0.88,
      remainingUsefulLifeCycles: 920,
      safePowerEnvelopeKw: 25, // Throttled due to 44.5°C
      cycleCount: 280,
      internalImpedanceMilliOhm: 74
    },
    assignedStationId: "STATION-1",
    status: "in_negotiation"
  },
  {
    id: "EV-B",
    name: "Vehicle B (Cooperative SUV)",
    model: "Hyundai Ioniq 5 Long Range",
    licensePlateAnonymized: "HASH-9B420E",
    type: "suv",
    telemetry: {
      soc: 42,
      soh: 96,
      batteryTemp: 28.0,
      voltage: 680,
      current: 40,
      maxChargingPowerKw: 220,
      nominalCapacityKwh: 77.4
    },
    mobility: {
      route: "Office Park to Residential Suburb",
      distanceKm: 26,
      destination: "Pasadena Heights",
      departureDeadlineMin: 180,
      estimatedTripEnergyKwh: 8.0,
      destinationSocRequired: 55
    },
    utilityToken: {
      tokenId: "TOK-EV-B-002",
      anonymizedHash: "0x8e12...b44",
      urgencyScore: 0.25,
      flexibilityScore: 0.90,
      isFleet: false,
      isEmergency: false,
      reciprocityCredit: 65,
      sacrificeMinutesHistory: 140
    },
    batteryTwin: {
      degradationCostPerKwh: 0.05,
      thermalRiskScore: 0.15,
      remainingUsefulLifeCycles: 1450,
      safePowerEnvelopeKw: 150,
      cycleCount: 110,
      internalImpedanceMilliOhm: 48
    },
    assignedStationId: "STATION-1",
    status: "in_negotiation"
  },
  {
    id: "EV-C",
    name: "Vehicle C (Commercial Delivery Van)",
    model: "Ford E-Transit 350 Cargo",
    licensePlateAnonymized: "HASH-3C77D1",
    type: "fleet_truck",
    telemetry: {
      soc: 27,
      soh: 88,
      batteryTemp: 32.5,
      voltage: 400,
      current: 65,
      maxChargingPowerKw: 115,
      nominalCapacityKwh: 68
    },
    mobility: {
      route: "Distribution Hub Route A4",
      distanceKm: 55,
      destination: "Regional Logistics Depot",
      departureDeadlineMin: 90,
      estimatedTripEnergyKwh: 12.0,
      destinationSocRequired: 50
    },
    utilityToken: {
      tokenId: "TOK-EV-C-003",
      anonymizedHash: "0x11cc...fa9",
      urgencyScore: 0.68,
      flexibilityScore: 0.40,
      isFleet: true,
      isEmergency: false,
      reciprocityCredit: 30,
      sacrificeMinutesHistory: 45
    },
    batteryTwin: {
      degradationCostPerKwh: 0.09,
      thermalRiskScore: 0.32,
      remainingUsefulLifeCycles: 810,
      safePowerEnvelopeKw: 75,
      cycleCount: 460,
      internalImpedanceMilliOhm: 82
    },
    assignedStationId: "STATION-1",
    status: "in_negotiation"
  },
  {
    id: "EV-EMERG",
    name: "Ambulance Unit 4 (Paramedic EV)",
    model: "Ford E-Transit Paramedic",
    licensePlateAnonymized: "HASH-EMERG-911",
    type: "emergency_ambulance",
    telemetry: {
      soc: 14,
      soh: 95,
      batteryTemp: 31.0,
      voltage: 400,
      current: 150,
      maxChargingPowerKw: 120,
      nominalCapacityKwh: 68
    },
    mobility: {
      route: "Trauma Response Route 9",
      distanceKm: 60,
      destination: "County General Trauma Ward",
      departureDeadlineMin: 20,
      estimatedTripEnergyKwh: 16.0,
      destinationSocRequired: 50
    },
    utilityToken: {
      tokenId: "TOK-EV-AMB-911",
      anonymizedHash: "0x9110...emergency",
      urgencyScore: 1.0,
      flexibilityScore: 0.0,
      isFleet: false,
      isEmergency: true,
      reciprocityCredit: 100,
      sacrificeMinutesHistory: 0
    },
    batteryTwin: {
      degradationCostPerKwh: 0.08,
      thermalRiskScore: 0.20,
      remainingUsefulLifeCycles: 1200,
      safePowerEnvelopeKw: 120,
      cycleCount: 220,
      internalImpedanceMilliOhm: 60
    },
    assignedStationId: "STATION-1",
    status: "in_negotiation"
  },
  {
    id: "EV-V2G",
    name: "Vehicle E (High-SOC V2G Contributor)",
    model: "Lucid Air Grand Touring",
    licensePlateAnonymized: "HASH-5E88AA",
    type: "passenger_sedan",
    telemetry: {
      soc: 86,
      soh: 98,
      batteryTemp: 26.0,
      voltage: 880,
      current: 0,
      maxChargingPowerKw: 300,
      nominalCapacityKwh: 112
    },
    mobility: {
      route: "Parked at Station Garage",
      distanceKm: 15,
      destination: "City Center",
      departureDeadlineMin: 240,
      estimatedTripEnergyKwh: 6.0,
      destinationSocRequired: 60
    },
    utilityToken: {
      tokenId: "TOK-EV-V2G-01",
      anonymizedHash: "0xaa44...88f",
      urgencyScore: 0.15,
      flexibilityScore: 0.95,
      isFleet: false,
      isEmergency: false,
      reciprocityCredit: 40,
      sacrificeMinutesHistory: 60
    },
    batteryTwin: {
      degradationCostPerKwh: 0.04,
      thermalRiskScore: 0.10,
      remainingUsefulLifeCycles: 1800,
      safePowerEnvelopeKw: 150,
      cycleCount: 65,
      internalImpedanceMilliOhm: 38
    },
    assignedStationId: "STATION-1",
    status: "in_negotiation"
  },
  {
    id: "EV-TRUCK",
    name: "Vehicle F (Electric Adventure Truck)",
    model: "Rivian R1T Dual-Motor",
    licensePlateAnonymized: "HASH-RIV-092",
    type: "suv",
    telemetry: {
      soc: 35,
      soh: 94,
      batteryTemp: 34.0,
      voltage: 400,
      current: 80,
      maxChargingPowerKw: 210,
      nominalCapacityKwh: 135
    },
    mobility: {
      route: "Mountain Transit Route",
      distanceKm: 95,
      destination: "Big Bear Trailhead",
      departureDeadlineMin: 75,
      estimatedTripEnergyKwh: 28.0,
      destinationSocRequired: 65
    },
    utilityToken: {
      tokenId: "TOK-EV-RIV-092",
      anonymizedHash: "0x77ee...31b",
      urgencyScore: 0.70,
      flexibilityScore: 0.35,
      isFleet: false,
      isEmergency: false,
      reciprocityCredit: 25,
      sacrificeMinutesHistory: 30
    },
    batteryTwin: {
      degradationCostPerKwh: 0.11,
      thermalRiskScore: 0.40,
      remainingUsefulLifeCycles: 1100,
      safePowerEnvelopeKw: 120,
      cycleCount: 190,
      internalImpedanceMilliOhm: 62
    },
    assignedStationId: "STATION-2",
    status: "in_negotiation"
  },
  {
    id: "EV-LEAF",
    name: "Vehicle G (Urban Commuter)",
    model: "Nissan Leaf Plus",
    licensePlateAnonymized: "HASH-LEAF-44",
    type: "passenger_sedan",
    telemetry: {
      soc: 62,
      soh: 84,
      batteryTemp: 29.0,
      voltage: 360,
      current: 40,
      maxChargingPowerKw: 70,
      nominalCapacityKwh: 62
    },
    mobility: {
      route: "Metro Local Commute",
      distanceKm: 18,
      destination: "Civic Center Library",
      departureDeadlineMin: 120,
      estimatedTripEnergyKwh: 4.0,
      destinationSocRequired: 50
    },
    utilityToken: {
      tokenId: "TOK-EV-LEAF-44",
      anonymizedHash: "0x55aa...11c",
      urgencyScore: 0.20,
      flexibilityScore: 0.85,
      isFleet: false,
      isEmergency: false,
      reciprocityCredit: 45,
      sacrificeMinutesHistory: 80
    },
    batteryTwin: {
      degradationCostPerKwh: 0.08,
      thermalRiskScore: 0.22,
      remainingUsefulLifeCycles: 740,
      safePowerEnvelopeKw: 50,
      cycleCount: 520,
      internalImpedanceMilliOhm: 92
    },
    assignedStationId: "STATION-1",
    status: "in_negotiation"
  },
  {
    id: "EV-TAYCAN",
    name: "Vehicle H (High-Performance GT)",
    model: "Porsche Taycan Turbo S",
    licensePlateAnonymized: "HASH-POR-800V",
    type: "passenger_sedan",
    telemetry: {
      soc: 22,
      soh: 97,
      batteryTemp: 33.0,
      voltage: 800,
      current: 90,
      maxChargingPowerKw: 270,
      nominalCapacityKwh: 93.4
    },
    mobility: {
      route: "Expressway Transit",
      distanceKm: 70,
      destination: "Coastal Highway",
      departureDeadlineMin: 35,
      estimatedTripEnergyKwh: 20.0,
      destinationSocRequired: 55
    },
    utilityToken: {
      tokenId: "TOK-EV-TAY-800",
      anonymizedHash: "0x800a...tay",
      urgencyScore: 0.88,
      flexibilityScore: 0.15,
      isFleet: false,
      isEmergency: false,
      reciprocityCredit: 18,
      sacrificeMinutesHistory: 20
    },
    batteryTwin: {
      degradationCostPerKwh: 0.14,
      thermalRiskScore: 0.45,
      remainingUsefulLifeCycles: 1350,
      safePowerEnvelopeKw: 200,
      cycleCount: 140,
      internalImpedanceMilliOhm: 42
    },
    assignedStationId: "STATION-2",
    status: "in_negotiation"
  }
];

// Section 16 Reference Benchmark Scenario
export const SCENARIO_SECTION_16: SimulationScenario = {
  id: "sec16-reference",
  name: "Section 16 Reference Benchmark",
  badge: "Primary Specification Benchmark",
  description: "Three competing EVs request charging at congested Station-1 while the local distribution grid approaches high-load stress.",
  keyPatentFeatures: ["F1 Predictive Need", "F2 Battery Lifetime Cost", "F3 Reciprocity Credit", "F5 Grid Emergency", "F6 Multi-Agent", "F10 Fleet"],
  stations: JSON.parse(JSON.stringify(INITIAL_STATIONS)),
  grid: { ...INITIAL_GRID_STATE, gridStatus: 'HIGH_LOAD', renewableForecastRiseMin: 25 },
  fleet: { ...INITIAL_FLEET_STATE },
  evs: [
    AVAILABLE_EV_MODELS[0], // EV-A (Model 3)
    AVAILABLE_EV_MODELS[1], // EV-B (Ioniq 5)
    AVAILABLE_EV_MODELS[2]  // EV-C (E-Transit)
  ],
  expectedDecisions: {
    "EV-A": "REDUCE_POWER (22 kW) / Preserve Mobility without killing battery",
    "EV-B": "COOPERATIVE_DELAY (+15 Reciprocity Credits) / Shifts to renewable surge",
    "EV-C": "CHARGE_NOW_STANDARD (50 kW) / Guarantees 06:00 fleet readiness"
  },
  scenarioNotes: [
    "EV-A has high urgency but high temperature (44.5°C). Hard thermal constraint strictly prohibits 150kW fast charge to protect cell chemistry; executes at safe 22kW.",
    "EV-B has ample departure time (180 min) and high reciprocity history. Accepts cooperative delay, smoothing grid peak while gaining +15 credits.",
    "EV-C receives sufficient power allocation to meet the fleet target deadline without treating all EVs identically."
  ]
};

// Scenario 2: Severe Grid Emergency & V2G Peak Shaving
export const SCENARIO_GRID_EMERGENCY: SimulationScenario = {
  id: "sec-grid-emergency",
  name: "Severe Grid Peak & V2G Peak Shaving",
  badge: "Feature 5 & V2G Export",
  description: "Distribution transformer load exceeds 95% threshold. System coordinates load shedding and eligible V2G energy export.",
  keyPatentFeatures: ["F5 Grid Emergency", "F3 Reciprocity Credit", "F4 Energy Reservation"],
  stations: INITIAL_STATIONS.map(s => ({ ...s, currentPowerDrawKw: s.maxGridPowerCapacityKw * 0.94 })),
  grid: {
    ...INITIAL_GRID_STATE,
    gridStatus: 'CRITICAL_EMERGENCY',
    currentGridLoadMw: 48.5,
    emergencyCurtailmentActive: true
  },
  fleet: { ...INITIAL_FLEET_STATE },
  evs: [
    AVAILABLE_EV_MODELS[4], // EV-V2G (Lucid Air)
    AVAILABLE_EV_MODELS[1], // EV-B (Hyundai Ioniq 5)
    AVAILABLE_EV_MODELS[0]  // EV-A (Tesla Model 3)
  ],
  expectedDecisions: {
    "EV-V2G": "ELIGIBLE_V2G_EXPORT (-20 kW back to grid, earns +30 credits & tariff rebate)"
  },
  scenarioNotes: [
    "Grid emergency triggers automated V2G bi-directional discharge from eligible high-SOC EV.",
    "Prevents neighborhood transformer trip without stranding driver."
  ]
};

// Scenario 3: Contextual Emergency Ambulance Preemption
export const SCENARIO_EMERGENCY_AMBULANCE: SimulationScenario = {
  id: "sec-emergency-ambulance",
  name: "Contextual Emergency Ambulance Preemption",
  badge: "Feature 9 Contextual Priority",
  description: "An electric paramedic emergency ambulance arrives with 14% SOC during heavy station queue.",
  keyPatentFeatures: ["F9 Contextual Emergency Priority", "F3 Reciprocity Credit", "F6 Multi-Agent"],
  stations: JSON.parse(JSON.stringify(INITIAL_STATIONS)),
  grid: { ...INITIAL_GRID_STATE, gridStatus: 'MODERATE' },
  fleet: { ...INITIAL_FLEET_STATE },
  evs: [
    AVAILABLE_EV_MODELS[3], // EV-EMERG (Ambulance)
    AVAILABLE_EV_MODELS[1], // EV-B (Ioniq 5)
    AVAILABLE_EV_MODELS[5]  // EV-TRUCK (Rivian R1T)
  ],
  expectedDecisions: {
    "EV-EMERG": "CHARGE_NOW_FAST (120 kW) / Immediate Preemption with Zero PII Leakage"
  },
  scenarioNotes: [
    "Contextual Emergency Priority dynamically preempts lower-urgency vehicles without giving arbitrary unconditional permanent flags.",
    "Yielding vehicles receive automated reciprocity credits into their fairness ledgers."
  ]
};

// All available scenarios
export const ALL_SCENARIOS: SimulationScenario[] = [
  SCENARIO_SECTION_16,
  SCENARIO_GRID_EMERGENCY,
  SCENARIO_EMERGENCY_AMBULANCE
];

// The focused product uses only these two station demonstrations. The normal
// station intentionally contains ten sessions; the second adds a medical
// emergency and an urgent goods-delivery session.
const cloneSession = (source: EVDigitalTwin, suffix: string, name: string): EVDigitalTwin => ({
  ...JSON.parse(JSON.stringify(source)), id: `${source.id}-${suffix}`, name,
  assignedStationId: 'STATION-1', status: 'in_negotiation',
});
const FOCUSED_STATION: ChargingStation[] = [{
  ...INITIAL_STATIONS[0], id: 'STATION-1', name: 'ANT-EV Demonstration Station', location: 'Demo site',
  totalChargers: 10, availableChargers: 0, activeSessions: 10, queueLength: 0,
  maxGridPowerCapacityKw: 300, currentPowerDrawKw: 0, forecastDemand15m: 260, forecastDemand30m: 280, forecastDemand60m: 240,
}];
const TEN_SESSIONS = [
  cloneSession(AVAILABLE_EV_MODELS[0], '01', 'EV 01 - urgent commuter'), cloneSession(AVAILABLE_EV_MODELS[1], '02', 'EV 02 - flexible commuter'),
  cloneSession(AVAILABLE_EV_MODELS[2], '03', 'EV 03 - delivery vehicle'), cloneSession(AVAILABLE_EV_MODELS[4], '04', 'EV 04 - city trip'),
  cloneSession(AVAILABLE_EV_MODELS[5], '05', 'EV 05 - goods delivery'), cloneSession(AVAILABLE_EV_MODELS[6], '06', 'EV 06 - local commuter'),
  cloneSession(AVAILABLE_EV_MODELS[7], '07', 'EV 07 - time-critical trip'), cloneSession(AVAILABLE_EV_MODELS[1], '08', 'EV 08 - flexible session'),
  cloneSession(AVAILABLE_EV_MODELS[2], '09', 'EV 09 - logistics run'), cloneSession(AVAILABLE_EV_MODELS[6], '10', 'EV 10 - local journey'),
];
export const FOCUSED_SCENARIOS: SimulationScenario[] = [
  { id:'ten-vehicle-station', name:'10 Vehicle Station', badge:'Normal allocation', description:'Ten simultaneous requests share one 300 kW station.', keyPatentFeatures:['Safe power split'], stations:structuredClone(FOCUSED_STATION), grid:{...INITIAL_GRID_STATE}, fleet:{...INITIAL_FLEET_STATE}, evs:TEN_SESSIONS, expectedDecisions:{}, scenarioNotes:[] },
  { id:'emergency-commute', name:'Emergency Commute', badge:'Medical + goods priority', description:'Medical and goods-delivery urgency enter the same safety-constrained station split.', keyPatentFeatures:['Emergency allocation'], stations:structuredClone(FOCUSED_STATION), grid:{...INITIAL_GRID_STATE,gridStatus:'HIGH_LOAD'}, fleet:{...INITIAL_FLEET_STATE}, evs:[cloneSession(AVAILABLE_EV_MODELS[3],'MED','Medical emergency'), ...TEN_SESSIONS.slice(0,9)], expectedDecisions:{}, scenarioNotes:[] },
];

// Evaluation metrics comparison data (Section 12 of spec)
export const EVALUATION_METRICS_DATA: EvaluationMetrics = {
  averageWaitTimeMin: { baselineFifo: 34.5, baselinePrism1: 26.2, antev2: 14.8 },
  batteryLifetimePreservedPercent: { baselineFifo: 68.2, baselinePrism1: 76.5, antev2: 92.4 },
  batteryDegradationCostTotalUsd: { baselineFifo: 8.42, baselinePrism1: 6.15, antev2: 3.20 },
  gridPeakStressLoadKw: { baselineFifo: 485, baselinePrism1: 390, antev2: 295 },
  renewableEnergyUtilizedPercent: { baselineFifo: 44.0, baselinePrism1: 61.5, antev2: 88.7 },
  unnecessaryChargingKwhAvoided: { baselineFifo: 0.0, baselinePrism1: 18.5, antev2: 74.2 },
  fleetDeadlineCompliancePercent: { baselineFifo: 75.0, baselinePrism1: 85.0, antev2: 99.4 },
  fairnessIndexJain: { baselineFifo: 0.52, baselinePrism1: 0.81, antev2: 0.94 },
  hardConstraintViolationsCount: { baselineFifo: 14, baselinePrism1: 3, antev2: 0 },
  decisionLatencyMs: { baselineFifo: 12, baselinePrism1: 45, antev2: 38 },
  explainabilityCoveragePercent: { baselineFifo: 0, baselinePrism1: 85, antev2: 100 }
};
