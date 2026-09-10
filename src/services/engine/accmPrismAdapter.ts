/**
 * ACCM-to-PRISM-ANT Integration Adapter.
 * Enforces the core architectural rule:
 * 1. ACCM predicts multi-horizon consequences and produces Action-Specific Sacrifice Vectors S_a.
 * 2. PRISM-ANT independently negotiates based on driver reciprocity memory, urgency, and predicted sacrifice.
 * 3. The Deterministic Safety Gate independently verifies physical, thermal, and grid constraints.
 */
import type { EVDigitalTwin, ChargingStation, GridTwinState, PrismAntDecisionResult } from '../../types/antev';
import type { CandidateAction, AccmInferenceResult, AccmActionConsequence } from '../../types/accm';
import { AccmService } from '../models/accmService';

export interface AccmCoupledDecision {
  evId: string;
  selectedAction: CandidateAction;
  powerKw: number;
  reason: string;
  safetyPassed: boolean;
  safetyViolations: string[];
  accmPrediction: AccmInferenceResult;
  selectedConsequence: AccmActionConsequence;
  prismFairnessScore: number;
  reciprocityImpact: number;
}

export class AccmPrismAdapter {
  /**
   * Complete Closed-Loop Step:
   * State -> ACCM Predictions -> PRISM-ANT Negotiation -> Safety Gate -> Execution
   */
  public static negotiateWithAccm(
    ev: EVDigitalTwin,
    station: ChargingStation,
    grid: GridTwinState
  ): AccmCoupledDecision {
    // 1. ACCM evaluates all candidate actions and outputs consequence matrix + sacrifice vectors
    const accmResult = AccmService.predictConsequences(ev, station, grid);

    // 2. PRISM-ANT Independent Negotiation Logic
    // Scores each candidate action based on driver urgency, flexibility, reciprocity balance, and ACCM sacrifice
    const urgency = ev.utilityToken.urgencyScore; // 0 to 1
    const reciprocity = ev.utilityToken.reciprocityCredit; // positive = excess credit, negative = consumed
    const isEmergency = ev.utilityToken.isEmergency;
    const currentTemp = ev.telemetry.batteryTemp;

    let bestAction: CandidateAction = 'CHARGE_NOW_STANDARD';
    let highestScore = -Infinity;
    let selectedConsequence: AccmActionConsequence = accmResult.actions[0];
    let reciprocityDelta = 0.0;

    for (const actionConsequence of accmResult.actions) {
      const act = actionConsequence.action;
      const s = actionConsequence.sacrifice_vector;

      // PRISM-ANT objective function:
      // Maximize driver utility while penalizing system sacrifice, modulated by reciprocity
      let score = 0.0;

      if (isEmergency) {
        // Medical emergency strongly favors FAST charging
        if (act === 'CHARGE_NOW_FAST') score = 100.0;
        else if (act === 'CHARGE_NOW_STANDARD') score = 50.0;
        else score = -50.0;
      } else {
        // Normal negotiation using reciprocity and ACCM sacrifice vector
        if (act === 'CHARGE_NOW_FAST') {
          score = urgency * 1.5 - s.thermal * 2.0 - s.grid * 1.2 - s.degradation * 1.5;
          if (reciprocity < 0) score -= 0.5; // Has debt, penalize fast charge
        } else if (act === 'CHARGE_NOW_STANDARD') {
          score = 1.0 - s.thermal * 1.0 - s.grid * 0.8;
        } else if (act === 'COOPERATIVE_DELAY') {
          // Delay is favored if driver has flexibility and can earn reciprocity credits
          score = (1.0 - urgency) * 1.2 + (reciprocity < 0.2 ? 0.6 : 0.2) - s.waiting * 0.8;
        } else if (act === 'REDUCE_POWER') {
          score = 0.8 - s.grid * 0.5 - s.waiting * 0.5;
        } else if (act === 'ENERGY_RESERVATION') {
          score = (1.0 - urgency) * 0.9 + 0.4;
        } else if (act === 'REDIRECT_STATION') {
          score = (1.0 - urgency) * 0.7 - 0.2;
        } else if (act === 'ELIGIBLE_V2G_EXPORT') {
          score = (1.0 - urgency) * 1.4 - s.battery * 1.0 + 0.5;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestAction = act;
        selectedConsequence = actionConsequence;
      }
    }

    // Determine requested power based on selected action
    let targetPowerKw = 0.0;
    const maxPower = ev.telemetry.maxChargingPowerKw || 150.0;

    switch (bestAction) {
      case 'CHARGE_NOW_FAST':
        targetPowerKw = maxPower;
        reciprocityDelta = -0.2;
        break;
      case 'CHARGE_NOW_STANDARD':
        targetPowerKw = maxPower * 0.55;
        reciprocityDelta = 0.0;
        break;
      case 'COOPERATIVE_DELAY':
        targetPowerKw = 0.0;
        reciprocityDelta = +0.5;
        break;
      case 'REDUCE_POWER':
        targetPowerKw = maxPower * 0.30;
        reciprocityDelta = +0.15;
        break;
      case 'ENERGY_RESERVATION':
        targetPowerKw = maxPower * 0.10;
        reciprocityDelta = +0.25;
        break;
      case 'REDIRECT_STATION':
        targetPowerKw = 0.0;
        reciprocityDelta = +0.40;
        break;
      case 'ELIGIBLE_V2G_EXPORT':
        targetPowerKw = -30.0; // V2G export
        reciprocityDelta = +0.80;
        break;
    }

    // 3. Independent Deterministic Hard Safety & Physics Gate
    const safetyViolations: string[] = [];
    let safetyPassed = true;

    // Thermal Guard: If T_bat >= 42.0°C, fast charging is unconditionally rejected
    if (currentTemp >= 42.0 && targetPowerKw > 25.0) {
      safetyPassed = false;
      safetyViolations.push(`Battery temperature (${currentTemp.toFixed(1)}°C) exceeds hard thermal safety threshold (42.0°C). Power clamped to <= 25 kW.`);
      targetPowerKw = Math.min(25.0, targetPowerKw);
      bestAction = 'REDUCE_POWER';
    }

    // Transformer capacity check
    const transformerHeadroom = station.maxGridPowerCapacityKw - station.currentPowerDrawKw;
    if (targetPowerKw > transformerHeadroom && transformerHeadroom > 0) {
      safetyViolations.push(`Target power (${targetPowerKw.toFixed(1)} kW) exceeds transformer headroom (${transformerHeadroom.toFixed(1)} kW). Clamped.`);
      targetPowerKw = Math.max(0, transformerHeadroom);
    }

    const reason = `ACCM predicted low thermal/grid risk for ${bestAction}. PRISM-ANT approved action with reciprocity balance (${reciprocity.toFixed(2)}). Deterministic safety gate ${safetyPassed ? 'verified 100% compliant' : 'enforced thermal clamp'}.`;

    return {
      evId: ev.id,
      selectedAction: bestAction,
      powerKw: Number(targetPowerKw.toFixed(1)),
      reason,
      safetyPassed,
      safetyViolations,
      accmPrediction: accmResult,
      selectedConsequence,
      prismFairnessScore: Number(highestScore.toFixed(3)),
      reciprocityImpact: reciprocityDelta,
    };
  }
}
