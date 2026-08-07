// The "AI Risk Engine". Deliberately simple and rule-based so every number
// on screen can be explained in one sentence to a judge — no black box.

function survivalScore(factors) {
  const { environment, delay, route, customs, communication } = factors;
  return Math.round((environment + delay + route + customs + communication) / 5);
}

function riskLevel(score) {
  if (score >= 85) return 'LOW';
  if (score >= 70) return 'MODERATE';
  if (score >= 50) return 'HIGH';
  return 'CRITICAL';
}

function customsReadinessPct(customsReadiness) {
  const { required, available } = customsReadiness;
  if (required.length === 0) return 100;
  return Math.round((available.length / required.length) * 100);
}

function missingDocs(customsReadiness) {
  const { required, available } = customsReadiness;
  return required.filter((doc) => !available.includes(doc));
}

function transparencyScore(shipment) {
  const locationFreshness = shipment.commsStatus === 'ONLINE' ? 95 : shipment.commsStatus === 'DEGRADED' ? 65 : 30;
  const sensorFreshness = shipment.commsStatus === 'OFFLINE' ? 40 : 92;
  const docs = customsReadinessPct(shipment.customsReadiness);
  const custody = 90;
  const communication = shipment.commsStatus === 'ONLINE' ? 95 : shipment.commsStatus === 'DEGRADED' ? 60 : 25;
  const overall = Math.round((locationFreshness + sensorFreshness + docs + custody + communication) / 5);
  return { overall, breakdown: { location: locationFreshness, sensor: sensorFreshness, documents: docs, custody, communication } };
}

// Freight price reference bands: an expected cost range derived from each
// quote's own baseline cost, not a single flat "+20%" magic number. The band
// is asymmetric (-10% / +15%) because spot freight rates spike far more
// often, and further, than they dip — a quote outside its own band is what
// gets flagged as an anomaly, not a hand-set boolean in the seed data.
function freightReferenceBand(baseCost) {
  return { min: Math.round(baseCost * 0.9), max: Math.round(baseCost * 1.15) };
}

function isFreightAnomaly(baseCost, currentCost) {
  const band = freightReferenceBand(baseCost);
  return currentCost < band.min || currentCost > band.max;
}

module.exports = {
  survivalScore, riskLevel, customsReadinessPct, missingDocs, transparencyScore,
  freightReferenceBand, isFreightAnomaly,
};
