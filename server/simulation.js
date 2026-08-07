// Drives the "SIMULATE GLOBAL CRISIS" demo: a scripted, stage-by-stage
// disruption chain plus the human-approved recovery. Also handles the
// gentle background sensor jitter so the dashboard feels alive at rest.

const { nowIso } = require('./db');
const { survivalScore, riskLevel, transparencyScore, isFreightAnomaly } = require('./riskEngine');
const { appendEvidence } = require('./evidence');

function addEvent(shipment, type, title, description, severity) {
  shipment.events.unshift({ timestamp: nowIso(), type, title, description, severity });
}

function pushEvidence(shipment, type, description) {
  appendEvidence(shipment, type, description);
}

function recompute(shipment) {
  shipment.survivalScore = survivalScore(shipment.factors);
  shipment.riskLevel = riskLevel(shipment.survivalScore);
  shipment.transparency = transparencyScore(shipment);
  shipment.scoreHistory.push({ timestamp: nowIso(), score: shipment.survivalScore });
  if (shipment.scoreHistory.length > 30) shipment.scoreHistory.shift();
  return shipment;
}

const STAGES = [
  null, // stage 0 = normal, no-op
  function geopoliticalDisruption(shipment) {
    shipment.factors.route = Math.max(0, shipment.factors.route - 20);
    addEvent(shipment, 'DISRUPTION', 'Geopolitical disruption on primary route',
      'A conflict-related corridor closure has increased transit risk on the primary route. ETA projected to increase by 11 hours.', 'WARNING');
  },
  function portCongestion(shipment) {
    shipment.factors.delay = Math.max(0, shipment.factors.delay - 15);
    shipment.freightQuotes = shipment.freightQuotes.map((q, i) => {
      if (i !== 0) return q;
      const currentCost = Math.round(q.baseCost * 2.07);
      return { ...q, currentCost, priceAnomaly: isFreightAnomaly(q.baseCost, currentCost) };
    });
    addEvent(shipment, 'DISRUPTION', 'Port congestion at transit hub',
      'Vessel queue times have tripled at the transit port. Emergency freight quotations are rising sharply for this lane.', 'WARNING');
  },
  function communicationLoss(shipment) {
    shipment.commsStatus = 'OFFLINE';
    shipment.factors.communication = 20;
    shipment.storeAndForward = { buffering: true, bufferedEvents: 0, lastConfirmed: nowIso() };
    addEvent(shipment, 'COMMUNICATION', 'Communication link lost',
      'Tracker has lost connectivity. Store-and-forward buffering activated — sensor readings are still being collected locally and will sync once the link is restored.', 'WARNING');
  },
  function temperatureExcursion(shipment) {
    shipment.factors.environment = 45;
    if (shipment.storeAndForward) shipment.storeAndForward.bufferedEvents += 6;
    const incidentStart = nowIso();
    shipment.incident = {
      type: 'Temperature excursion',
      start: incidentStart,
      durationMinutes: 41,
      maxTemp: 11.2,
      expectedRange: `${shipment.tempRange.min}–${shipment.tempRange.max}°C`,
      impact: 'Requires inspection',
      status: 'OPEN',
    };
    shipment.sensorReadings.push({ timestamp: nowIso(), temperature: 11.2, humidity: shipment.sensorSeed.humidity + 5, shock: 0.3 });
    addEvent(shipment, 'INCIDENT', 'Temperature excursion detected',
      `Cargo temperature rose to 11.2°C against an expected range of ${shipment.tempRange.min}–${shipment.tempRange.max}°C.`, 'CRITICAL');
    pushEvidence(shipment, 'SENSOR', `Temperature log captured: peak 11.2°C at ${incidentStart}.`);
    pushEvidence(shipment, 'GPS', 'Location confirmed and timestamped at moment of incident.');
    pushEvidence(shipment, 'COMMUNICATION', 'Communication log preserved (offline buffering was active during the incident window).');
    shipment.aiRecommendation = {
      recommendation: 'Divert to alternate cold-storage port and re-ice container',
      why: [
        'Primary route disruption already added an estimated 11 hours to ETA.',
        'Cargo viability is projected to decrease by roughly 13% if the cold chain is not restored within 2 hours.',
        'The alternate port adds 2 hours of transit but restores refrigeration and reduces environmental risk.',
      ],
      expectedImpact: 'Cargo Survival Score projected to recover to approximately 85/100.',
      confidence: 82,
      alternatives: ['Continue current route without intervention', 'Hold at nearest port for manual inspection'],
      requiresHumanApproval: true,
    };
  },
];

function advanceCrisis(shipment) {
  const next = shipment.crisisStage + 1;
  if (next >= STAGES.length) return shipment;
  STAGES[next](shipment);
  shipment.crisisStage = next;
  return recompute(shipment);
}

function approveRecovery(shipment) {
  if (!shipment.incident || shipment.incident.status !== 'OPEN') return shipment;

  shipment.factors.environment = Math.min(100, shipment.factors.environment + 35);
  shipment.factors.route = Math.min(100, shipment.factors.route + 10);
  shipment.factors.delay = Math.min(100, shipment.factors.delay + 5);
  shipment.factors.communication = 90;
  shipment.commsStatus = 'ONLINE';
  if (shipment.storeAndForward) {
    shipment.storeAndForward.buffering = false;
    shipment.storeAndForward.bufferedEvents += 2;
  }
  shipment.incident.status = 'RESOLVED';
  shipment.incident.recoveryAction = 'Diverted to alternate cold-storage port; container re-iced.';
  shipment.crisisStage = 5;

  addEvent(shipment, 'RECOVERY', 'Recovery action approved and executed',
    'Operator approved the AI-recommended diversion. Communication restored, buffered sensor data synchronized, cold chain re-established.', 'INFO');
  pushEvidence(shipment, 'CUSTODY', 'Custody transfer logged at alternate cold-storage facility.');
  pushEvidence(shipment, 'OPERATOR_ACTION', 'Recovery plan approved by operator; diversion executed.');

  const cargoValue = shipment.cargoValueINR;
  const potentialLoss = Math.round(cargoValue * 0.43);
  const interventionCost = Math.round(cargoValue * 0.03);
  const estimatedLossAvoided = Math.round(cargoValue * 0.31);
  shipment.economicImpact = {
    cargoValue,
    potentialLossWithoutIntervention: potentialLoss,
    interventionCost,
    estimatedLossAvoided,
    note: 'SIMULATED PROTOTYPE ESTIMATE — not a real financial figure.',
  };
  shipment.claimStatus = 'READY FOR REVIEW';

  return recompute(shipment);
}

function tickJitter(shipment) {
  if (shipment.crisisStage > 0) return shipment; // keep crisis shipments stable/controlled during a live demo
  const last = shipment.sensorReadings[shipment.sensorReadings.length - 1] || shipment.sensorSeed;
  const reading = {
    timestamp: nowIso(),
    temperature: +(last.temperature + (Math.random() - 0.5) * 0.6).toFixed(1),
    humidity: +(last.humidity + (Math.random() - 0.5) * 1.5).toFixed(1),
    shock: +Math.max(0, last.shock + (Math.random() - 0.5) * 0.05).toFixed(2),
  };
  shipment.sensorReadings.push(reading);
  if (shipment.sensorReadings.length > 40) shipment.sensorReadings.shift();
  return shipment;
}

module.exports = { advanceCrisis, approveRecovery, tickJitter, recompute, STAGE_COUNT: STAGES.length };
