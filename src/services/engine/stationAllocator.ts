import type { ChargingStation, EVDigitalTwin, PrismAntDecisionResult } from '../../types/antev';
import { DeepLearningIntelligenceLayer } from '../models/deepLearningLayer';

export interface PrismSignals { energyNeedKwh:number; energyConfidence:number; readinessRisk:number; forecastPressure:number; healthRisk:number; healthConfidence:number; thermalRisk:number; futureTemperatureRisk:number; predictionReliability:number; survivalPowerKw:number; safePowerCapKw:number; strategyValue:number; }
export interface StationAllocation { ev:EVDigitalTwin; decision?:PrismAntDecisionResult; powerKw:number; capKw:number; reserveKw:number; priority:number; targetSoc:number; reason:string; signals:PrismSignals; }
const clamp=(value:number,min=0,max=1)=>Math.max(min,Math.min(max,value));

/** PRISM-ANT: Predictive Readiness, Integrity, Safety Masking - Adaptive Necessity Tiering.
 * It reserves the minimum safe deadline power first, then shares the remaining capacity.
 * A hard safety envelope is calculated before either tier, so no score or emergency
 * may trade away temperature or electrical limits. */
export function allocateStationPower(evs:EVDigitalTwin[], decisions:Record<string,PrismAntDecisionResult>, station:ChargingStation):StationAllocation[] {
 const candidates=evs.filter(ev=>ev.status!=='completed').map(ev=>{
  const decision=decisions[ev.id],winner=decision?.candidateActions.find(x=>x.action===decision.selectedAction);
  const m1=DeepLearningIntelligenceLayer.predictM1EnergySession(ev),m2=DeepLearningIntelligenceLayer.predictM2DemandForecast(station),m3=DeepLearningIntelligenceLayer.predictM3BatteryHealth(ev),m4=DeepLearningIntelligenceLayer.predictM4BatteryCostStress(ev,ev.telemetry.maxChargingPowerKw),m5=DeepLearningIntelligenceLayer.predictM5MambaSequenceState(ev,Math.min(ev.telemetry.maxChargingPowerKw,m4.recommendedPowerEnvelopeKw));
  const targetSoc=Math.min(95,decision?.targetSocPercent??m1.targetSocPercent??ev.mobility.destinationSocRequired),complete=ev.telemetry.soc>=targetSoc||decision?.selectedAction==='NO_CHARGE_NEEDED';
  const thermalCap=ev.telemetry.batteryTemp>=42?22:ev.telemetry.maxChargingPowerKw;
  const energyNeed=clamp(m1.predictedEnergyKwh/Math.max(1,ev.telemetry.nominalCapacityKwh)),readinessRisk=clamp(1-m1.departureReadinessProbability+Math.max(0,m1.predictedDurationMin-ev.mobility.departureDeadlineMin)/Math.max(15,ev.mobility.departureDeadlineMin)),forecastPressure=clamp(m2.forecast30mKw/Math.max(1,station.maxGridPowerCapacityKw)),futureTemperatureRisk=clamp((Math.max(...m5.trajectoryTempHorizon)-38)/10),healthRisk=clamp((90-m3.predictedSohPercent)/25),strategyValue=clamp(winner?.rlPolicyQValue??.5);
  const predictionReliability=Math.min(m1.confidence,m3.confidencePercent/100);
  const trajectoryCap=futureTemperatureRisk>=.55?22:futureTemperatureRisk>=.22?50:ev.telemetry.maxChargingPowerKw;
  const healthCap=healthRisk>=.4?Math.max(22,ev.batteryTwin.safePowerEnvelopeKw*.7):ev.batteryTwin.safePowerEnvelopeKw;
  const confidenceCap=predictionReliability<.75?50:ev.telemetry.maxChargingPowerKw;
  const capKw=complete?0:Math.min(thermalCap,trajectoryCap,confidenceCap,ev.utilityToken.isEmergency?ev.telemetry.maxChargingPowerKw:Math.min(healthCap,m4.recommendedPowerEnvelopeKw));
  const survivalPowerKw=Math.min(capKw,Math.max(0,m1.predictedEnergyKwh/(Math.max(15,ev.mobility.departureDeadlineMin)/60)/.92));
  const signals={energyNeedKwh:m1.predictedEnergyKwh,energyConfidence:m1.confidence,readinessRisk,forecastPressure,healthRisk,healthConfidence:m3.confidencePercent/100,thermalRisk:m4.thermalStressIndex,futureTemperatureRisk,predictionReliability,survivalPowerKw,safePowerCapKw:capKw,strategyValue};
  const urgency=ev.utilityToken.isEmergency?1:clamp(ev.utilityToken.urgencyScore),flexibility=clamp(ev.utilityToken.flexibilityScore);
  const forecastReadinessInterlock=forecastPressure*readinessRisk,normalHealthProtection=ev.utilityToken.isEmergency?0:healthRisk;
  const priority=Math.max(.05,.30*urgency+.24*readinessRisk+.18*energyNeed+.10*strategyValue+.08*(1-flexibility)+.05*forecastReadinessInterlock-.06*normalHealthProtection+(ev.utilityToken.isEmergency?3.5:0));
  const reason=complete?`Target reached (${ev.telemetry.soc.toFixed(1)}% / ${targetSoc}%). Released capacity is reallocated immediately.`:ev.utilityToken.isEmergency?`Emergency receives its safe readiness reserve first. M4/M5 keep a hard ${capKw.toFixed(0)} kW cap; battery-life preference is not used.`:ev.telemetry.batteryTemp>=42?`Thermal guard is binding at ${ev.telemetry.batteryTemp}°C, so M4 limits this EV to ${capKw.toFixed(0)} kW.`:`Tier 1 reserves ${survivalPowerKw.toFixed(1)} kW needed for the deadline; Tier 2 shares remaining capacity using M1 need, M2 peak-deadline interlock, M3 health protection, and M6 strategy value.`;
  return {ev,decision,capKw,reserveKw:survivalPowerKw,priority,targetSoc,reason,signals};
 });
 let remaining=station.maxGridPowerCapacityKw;const allocated=new Map<string,number>();
 // Tier 1: reserve minimum feasible power required for deadline readiness. If the station is
 // oversubscribed, reserve is rationed by auditable priority rather than silently ignored.
 const reservePool=candidates.filter(x=>x.reserveKw>0);const reserveDemand=reservePool.reduce((s,x)=>s+x.reserveKw,0);
 for(const item of reservePool){const reserveShare=reserveDemand<=remaining?item.reserveKw:remaining*(item.reserveKw*item.priority)/Math.max(.01,reservePool.reduce((s,x)=>s+x.reserveKw*x.priority,0));const grant=Math.min(item.capKw,reserveShare);allocated.set(item.ev.id,grant)}
 remaining=Math.max(0,remaining-[...allocated.values()].reduce((s,x)=>s+x,0));
 // Tier 2: give every remaining safe kW to open sessions proportionally to PRISM priority.
 let open=candidates.filter(x=>x.capKw>(allocated.get(x.ev.id)??0)+.01);while(open.length&&remaining>.01){const total=open.reduce((s,x)=>s+x.priority,0);let used=0;const next:typeof open=[];for(const item of open){const current=allocated.get(item.ev.id)??0;const grant=Math.min(item.capKw-current,remaining*(item.priority/total));allocated.set(item.ev.id,current+grant);used+=grant;if(item.capKw-current-grant>.01)next.push(item)}remaining-=used;if(used<.01)break;open=next}
 return candidates.map(item=>({...item,powerKw:Number((allocated.get(item.ev.id)??0).toFixed(1))}));
}
