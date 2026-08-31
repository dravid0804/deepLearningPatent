// ANT-EV 2.0 Unified Type Definitions (Based on System Specification 2.0)

export type VehicleUrgency = 'low' | 'medium' | 'high' | 'critical_emergency';
export type VehicleType = 'passenger_sedan' | 'suv' | 'commercial_van' | 'fleet_truck' | 'emergency_ambulance';
export type ChargingActionType = 
  | 'CHARGE_NOW_FAST' 
  | 'CHARGE_NOW_STANDARD' 
  | 'COOPERATIVE_DELAY' 
  | 'REDUCE_POWER' 
  | 'REDIRECT_STATION' 
  | 'ENERGY_RESERVATION' 
  | 'ELIGIBLE_V2G_EXPORT'
  | 'NO_CHARGE_NEEDED';

export interface EVTelemetry {
  soc: number; // Current SOC % (0 - 100)
  soh: number; // State of Health % (0 - 100)
  batteryTemp: number; // °C
  voltage: number; // Volts
  current: number; // Amperes
  maxChargingPowerKw: number; // Max intake kW
  nominalCapacityKwh: number; // Total capacity kWh
}

export interface EVMobility {
  route: string;
  distanceKm: number;
  destination: string;
  departureDeadlineMin: number; // Minutes until required departure
  estimatedTripEnergyKwh: number; // Trip energy needed
  destinationSocRequired: number; // Required SOC at destination %
}

export interface EVUtilityToken {
  tokenId: string;
  anonymizedHash: string; // Privacy-preserving hash
  urgencyScore: number; // 0.0 - 1.0
  flexibilityScore: number; // 0.0 - 1.0 (willingness to delay)
  isFleet: boolean;
  isEmergency: boolean;
  reciprocityCredit: number; // Accumulated credits
  sacrificeMinutesHistory: number; // Minutes delayed in past
}

export interface BatteryTwinState {
  degradationCostPerKwh: number; // USD ($) or penalty unit per kWh
  thermalRiskScore: number; // 0.0 - 1.0 (risk of rapid heating / degradation)
  remainingUsefulLifeCycles: number; // Estimated remaining cycles
  safePowerEnvelopeKw: number; // Maximum safe power allowed now (e.g. throttled if temp > 40°C)
  cycleCount: number;
  internalImpedanceMilliOhm: number;
}

export interface EVDigitalTwin {
  id: string;
  name: string;
  model: string;
  licensePlateAnonymized: string;
  type: VehicleType;
  telemetry: EVTelemetry;
  mobility: EVMobility;
  utilityToken: EVUtilityToken;
  batteryTwin: BatteryTwinState;
  assignedStationId?: string;
  currentAction?: ChargingActionType;
  assignedPowerKw?: number;
  status: 'idle' | 'in_negotiation' | 'charging' | 'delayed' | 'redirected' | 'reserved' | 'completed';
}

export interface ChargingStation {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  totalChargers: number;
  availableChargers: number;
  activeSessions: number;
  queueLength: number;
  maxGridPowerCapacityKw: number;
  currentPowerDrawKw: number;
  renewableSolarPowerKw: number;
  tariffPerKwh: number;
  forecastDemand15m: number;
  forecastDemand30m: number;
  forecastDemand60m: number;
  congestionIndex: number; // 0.0 - 1.0
  networkName: string;
}

export interface GridTwinState {
  gridStatus: 'OPTIMAL' | 'MODERATE' | 'HIGH_LOAD' | 'CRITICAL_EMERGENCY';
  currentGridLoadMw: number;
  gridCapacityMw: number;
  renewableAvailabilityPercent: number;
  renewableForecastRiseMin: number; // minutes until renewable solar/wind surge
  gridCarbonIntensityGCo2: number;
  currentTariffPerKwh: number;
  emergencyCurtailmentActive: boolean;
}

export interface FleetTwinState {
  fleetId: string;
  fleetName: string;
  totalVehicles: number;
  requiredReadyCount: number;
  targetDeadlineTimestamp: string; // e.g. "06:00 AM"
  currentReadyCount: number;
  totalEnergyDeficitKwh: number;
  fleetOptimizedSchedule: Array<{ vehicleId: string; targetSoc: number; scheduledSlot: string }>;
}

export interface ModelPredictionPackage {
  m1EnergySession: {
    predictedEnergyKwh: number;
    predictedDurationMin: number;
    targetSocPercent: number;
    departureReadinessProbability: number;
    uncertaintyKwh: number;
    confidence: number;
  };
  m2DemandForecast: {
    forecast15mKw: number;
    forecast30mKw: number;
    forecast60mKw: number;
    expectedOccupancy: number;
    congestionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    uncertainty: number;
  };
  m3BatteryHealthRul: {
    predictedSohPercent: number;
    degradationRatePerCycle: number;
    estimatedRulRemainingCycles: number;
    confidencePercent: number;
  };
  m4BatteryCostStress: {
    lifetimeDegradationCostUsd: number;
    thermalStressIndex: number; // 0.0 - 1.0
    recommendedPowerEnvelopeKw: number;
    highPowerRiskWarning: boolean;
  };
  m5MambaState: {
    trajectorySocHorizon: number[];
    trajectoryTempHorizon: number[];
    predictedFutureStateVector: string;
    temporalUncertaintyBand: number;
  };
  m6RlPolicy: {
    recommendedAction: ChargingActionType;
    qValues: Record<ChargingActionType, number>;
    systemRewardExpected: number;
    policyConfidence: number;
  };
}

export interface HardConstraintCheck {
  constraintName: string;
  category: 'BATTERY_PHYSICS' | 'CHARGER_LIMIT' | 'GRID_CAPACITY' | 'VEHICLE_DEADLINE' | 'EMERGENCY_OVERRIDE';
  limitValue: string;
  currentValue: string;
  passed: boolean;
  reason: string;
}

export interface PrismAntDecisionResult {
  vehicleId: string;
  candidateActions: Array<{
    action: ChargingActionType;
    prismAntScore: number;
    rawComponents: {
      urgencyWeighted: number;
      reciprocityBonus: number;
      batteryLifetimeCostPenalty: number;
      gridFitBonus: number;
      congestionPenalty: number;
    };
    hardConstraintsPassed: boolean;
    failedConstraintReason?: string;
    rlPolicyQValue: number;
  }>;
  selectedAction: ChargingActionType;
  assignedPowerKw: number;
  assignedStationId: string;
  targetSocPercent: number;
  targetEnergyKwh: number;
  expectedDurationMin: number;
  reciprocityCreditDelta: number;
  hardConstraints: HardConstraintCheck[];
  explainability: {
    winningFactorSummary: string;
    shapFactorDecomposition: Array<{ factor: string; impact: number; description: string }>;
    whyAlternativeLost: string;
    counterfactualNote: string;
  };
  timestamp: string;
}

export interface EvaluationMetrics {
  averageWaitTimeMin: { baselineFifo: number; baselinePrism1: number; antev2: number };
  batteryLifetimePreservedPercent: { baselineFifo: number; baselinePrism1: number; antev2: number };
  batteryDegradationCostTotalUsd: { baselineFifo: number; baselinePrism1: number; antev2: number };
  gridPeakStressLoadKw: { baselineFifo: number; baselinePrism1: number; antev2: number };
  renewableEnergyUtilizedPercent: { baselineFifo: number; baselinePrism1: number; antev2: number };
  unnecessaryChargingKwhAvoided: { baselineFifo: number; baselinePrism1: number; antev2: number };
  fleetDeadlineCompliancePercent: { baselineFifo: number; baselinePrism1: number; antev2: number };
  fairnessIndexJain: { baselineFifo: number; baselinePrism1: number; antev2: number };
  hardConstraintViolationsCount: { baselineFifo: number; baselinePrism1: number; antev2: number };
  decisionLatencyMs: { baselineFifo: number; baselinePrism1: number; antev2: number };
  explainabilityCoveragePercent: { baselineFifo: number; baselinePrism1: number; antev2: number };
}
