// CargoXense Copilot: intentionally NOT a call to an external LLM.
// It only answers by reading real application state (the same SQLite-backed
// shipment records the dashboard renders), so every answer is traceable and
// nothing is ever hallucinated. If it can't find an answer in the data,
// it says so instead of guessing.

function formatINR(n) {
  return '₹' + (n / 100000).toFixed(1) + 'L';
}

function answer(query, shipments) {
  const q = query.toLowerCase();

  const idMatch = query.match(/CX-\d{4}/i);
  if (idMatch) {
    const shipment = shipments.find((s) => s.id.toUpperCase() === idMatch[0].toUpperCase());
    if (!shipment) return `Insufficient data available. No shipment with ID ${idMatch[0]} found.`;
    const latestEvent = shipment.events[0];
    return `${shipment.id} (${shipment.name}) — Cargo Survival Score ${shipment.survivalScore}/100, risk level ${shipment.riskLevel}. ` +
      `Status: ${shipment.status}, comms: ${shipment.commsStatus}. ` +
      (latestEvent ? `Most recent event: "${latestEvent.title}" — ${latestEvent.description}` : 'No events recorded yet.');
  }

  if (/highest risk|most at risk|worst/.test(q)) {
    const sorted = [...shipments].sort((a, b) => a.survivalScore - b.survivalScore);
    const top = sorted[0];
    return `${top.id} (${top.name}) currently has the highest risk — Cargo Survival Score ${top.survivalScore}/100, classified ${top.riskLevel}. Route: ${top.origin} → ${top.destination}.`;
  }

  if (/customs/.test(q)) {
    const flagged = shipments.filter((s) => s.customsReadiness.missing.length > 0);
    if (flagged.length === 0) return 'No shipments currently have customs readiness issues — all required documents are available.';
    return `${flagged.length} shipment(s) have customs readiness issues: ` +
      flagged.map((s) => `${s.id} is missing ${s.customsReadiness.missing.join(', ')}`).join('; ') + '.';
  }

  if (/lost tracking|offline|communication|comms/.test(q)) {
    const flagged = shipments.filter((s) => s.commsStatus !== 'ONLINE');
    if (flagged.length === 0) return 'All shipments currently have healthy communication links.';
    return `${flagged.length} shipment(s) have degraded or offline tracking: ` +
      flagged.map((s) => `${s.id} (${s.commsStatus})`).join(', ') + '.';
  }

  if (/abnormal|price|freight|quote/.test(q)) {
    const flagged = [];
    shipments.forEach((s) => s.freightQuotes.forEach((fq) => {
      if (fq.priceAnomaly) flagged.push({ shipment: s.id, carrier: fq.carrier, base: fq.baseCost, current: fq.currentCost });
    }));
    if (flagged.length === 0) return 'No abnormal freight price deviations detected right now.';
    return `${flagged.length} abnormal freight quotation(s) detected: ` +
      flagged.map((f) => `${f.shipment} via ${f.carrier}: ${formatINR(f.base)} → ${formatINR(f.current)} (+${Math.round((f.current / f.base - 1) * 100)}%)`).join('; ') + '.';
  }

  if (/recover/.test(q)) {
    const withImpact = shipments.filter((s) => s.economicImpact);
    if (withImpact.length === 0) return 'No active recoveries with estimated recoverable value right now.';
    const total = withImpact.reduce((sum, s) => sum + s.economicImpact.estimatedLossAvoided, 0);
    return `Estimated loss avoided across ${withImpact.length} recovered shipment(s): ${formatINR(total)}. ` +
      withImpact.map((s) => `${s.id}: ${formatINR(s.economicImpact.estimatedLossAvoided)}`).join('; ') + '.';
  }

  if (/value at risk|cargo at risk|how much/.test(q)) {
    const atRisk = shipments.filter((s) => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL');
    const total = atRisk.reduce((sum, s) => sum + s.cargoValueINR, 0);
    if (atRisk.length === 0) return 'No shipments are currently classified HIGH or CRITICAL risk. Total cargo value at risk: ₹0.';
    return `${atRisk.length} shipment(s) currently HIGH or CRITICAL risk, totaling ${formatINR(total)} in cargo value at risk: ` +
      atRisk.map((s) => `${s.id} (${formatINR(s.cargoValueINR)})`).join(', ') + '.';
  }

  if (/what happened|what did we save|summary|incident/.test(q)) {
    const withIncident = shipments.filter((s) => s.incident);
    if (withIncident.length === 0) return 'No incidents recorded yet. Trigger the crisis simulation on a shipment to see this in action.';
    return withIncident.map((s) => {
      const impact = s.economicImpact
        ? ` Recovery was approved; estimated loss avoided: ${formatINR(s.economicImpact.estimatedLossAvoided)}.`
        : ' Awaiting operator approval on the recommended recovery action.';
      return `${s.id}: ${s.incident.type}, peak ${s.incident.maxTemp}°C, status ${s.incident.status}.${impact}`;
    }).join(' ');
  }

  return "Insufficient data available for that question. Try asking about: highest risk, customs readiness, offline tracking, abnormal freight pricing, recoverable value, cargo value at risk, or a specific shipment ID like CX-1001.";
}

module.exports = { answer };
