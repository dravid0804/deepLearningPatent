/**
 * TypeScript types and interfaces for the Action-Conditioned Consequence Model (ACCM).
 * Defines action vocabularies, multi-horizon metrics, sacrifice vectors, and telemetry statuses.
 */

export type CandidateAction =
  | 'CHARGE_NOW_FAST'
  | 'CHARGE_NOW_STANDARD'
  | 'COOPERATIVE_DELAY'
  | 'REDUCE_POWER'
  | 'ENERGY_RESERVATION'
  | 'REDIRECT_STATION'
  | 'ELIGIBLE_V2G_EXPORT';

export interface AccmHorizonMetrics {
  soc: number;                     // % (0 - 100)
  energy_delivered_kwh: number;    // kWh
  battery_temp_c: number;          // °C
  soh: number;                     // % (0 - 100)
  degradation_rate_pct: number;    // % capacity fade
  charging_duration_min: number;   // minutes
  station_load_kw: number;         // kW
  grid_load_pct: number;           // % (0 - 100)
  electricity_cost_usd: number;    // $
  waiting_time_min: number;        // minutes
  renewable_utilization: number;   // ratio (0 - 1)
}

export interface AccmSacrificeVector {
  battery: number;                 // [0, 1] battery cycling strain
  degradation: number;             // [0, 1] economic pack loss
  thermal: number;                 // [0, 1] elevated cell temp risk
  grid: number;                    // [0, 1] grid peak contribution
  waiting: number;                 // [0, 1] delay penalty
  energy: number;                  // [0, 1] tariff cost impact
  future_availability: number;     // [0, 1] station flexibility loss
  fairness: number;                // [0, 1] queue equity deviation
}

export interface AccmActionConsequence {
  action: CandidateAction;
  description: string;
  horizons: Record<string, AccmHorizonMetrics>; // "5m", "10m", "15m", "30m", "60m"
  uncertainty: Record<string, Partial<AccmHorizonMetrics>>;
  confidence: Record<string, number>; // "5m" -> confidence %
  sacrifice_vector: AccmSacrificeVector;
  recommended_rank?: number;
  safety_approved?: boolean;
}

export interface AccmInferenceResult {
  state_timestamp: string;
  model_id: string;
  model_version: string;
  schema_version: string;
  is_demo: boolean;
  actions: AccmActionConsequence[];
  feature_importances: Record<string, number>;
  station_summary: {
    active_chargers: number;
    station_load_kw: number;
    grid_load_pct: number;
    thermal_status: 'SAFE' | 'THERMAL_WARNING' | 'EMERGENCY_OVERRIDE';
  };
}

export interface AccmTelemetryStatus {
  model_id: string;
  model_version: string;
  status: 'ONLINE' | 'STANDBY' | 'CALIBRATING';
  temporal_encoder: 'ONLINE' | 'OFFLINE';
  graph_encoder: 'ONLINE' | 'OFFLINE';
  physics_encoder: 'ONLINE' | 'OFFLINE';
  action_decoder: 'ONLINE' | 'OFFLINE';
  uncertainty_estimator: 'ONLINE' | 'OFFLINE';
  trainable_params: number;
  fused_latent_dim: number;
  prediction_horizons: number[];
  dataset_provenance: string;
}

export interface AccmBenchmarkRecord {
  model: string;
  soc_mae_pct: number;
  temp_mae_c: number;
  energy_mae_kwh: number;
  soh_mae_pct: number;
  degradation_mae_pct: number;
  station_load_mae_kw: number;
  grid_load_mae_pct: number;
  uncertainty_calib_error: number;
  inference_latency_ms: number;
}

export interface AccmAblationRecord {
  configuration: string;
  soc_mae_pct: number;
  temp_mae_c: number;
  station_load_mae_kw: number;
  sacrifice_mae: number;
  physics_consistency_pct: number;
  notes: string;
}

export interface AccmSystemComparisonRecord {
  metric: string;
  old_system: string;
  proposed_accm: string;
  improvement: string;
  impact: string;
}
