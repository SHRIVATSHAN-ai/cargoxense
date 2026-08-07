export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type CommsStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE';

export interface SurvivalFactors {
  environment: number;
  delay: number;
  route: number;
  customs: number;
  communication: number;
}

export interface SensorReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  shock: number;
}

export interface ShipmentEvent {
  timestamp: string;
  type: string;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface EvidenceEntry {
  timestamp: string;
  type: string;
  description: string;
}

export interface FreightQuote {
  carrier: string;
  route: string;
  transitDays: number;
  baseCost: number;
  currentCost: number;
  riskLevel: RiskLevel | 'LOW' | 'MODERATE' | 'HIGH';
  priceAnomaly?: boolean;
}

export interface CustomsReadiness {
  required: string[];
  available: string[];
  missing: string[];
  readinessPct: number;
}

export interface Incident {
  type: string;
  start: string;
  durationMinutes: number;
  maxTemp: number;
  expectedRange: string;
  impact: string;
  status: 'OPEN' | 'RESOLVED';
  recoveryAction?: string;
}

export interface AIRecommendation {
  recommendation: string;
  why: string[];
  expectedImpact: string;
  confidence: number;
  alternatives: string[];
  requiresHumanApproval: boolean;
}

export interface EconomicImpact {
  cargoValue: number;
  potentialLossWithoutIntervention: number;
  interventionCost: number;
  estimatedLossAvoided: number;
  note: string;
}

export interface Transparency {
  overall: number;
  breakdown: {
    location: number;
    sensor: number;
    documents: number;
    custody: number;
    communication: number;
  };
}

export interface Shipment {
  id: string;
  name: string;
  cargoType: string;
  description: string;
  origin: string;
  destination: string;
  carrier: string;
  transportMode: string;
  cargoValueINR: number;
  status: string;
  isHero: boolean;
  tempRange: { min: number; max: number };
  factors: SurvivalFactors;
  commsStatus: CommsStatus;
  crisisStage: number;
  incident: Incident | null;
  customsReadiness: CustomsReadiness;
  freightQuotes: FreightQuote[];
  sensorReadings: SensorReading[];
  events: ShipmentEvent[];
  insuranceEvidence: EvidenceEntry[];
  aiRecommendation: AIRecommendation | null;
  survivalScore: number;
  riskLevel: RiskLevel;
  transparency: Transparency;
  scoreHistory: { timestamp: string; score: number }[];
  storeAndForward?: { buffering: boolean; bufferedEvents: number; lastConfirmed: string };
  economicImpact?: EconomicImpact;
  claimStatus?: string;
}

export interface ShipmentSummary {
  id: string;
  name: string;
  cargoType: string;
  origin: string;
  destination: string;
  carrier: string;
  status: string;
  cargoValueINR: number;
  survivalScore: number;
  riskLevel: RiskLevel;
  commsStatus: CommsStatus;
  crisisStage: number;
  isHero: boolean;
  missingDocs: number;
  incidentOpen: boolean;
}

export interface Metrics {
  activeShipments: number;
  atRiskCargo: number;
  criticalIncidents: number;
  customsAlerts: number;
  offlineTrackers: number;
  priceAnomalies: number;
  claimsInReview: number;
  recoverableValue: number;
}
