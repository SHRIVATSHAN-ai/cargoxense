// Tamper-evidence for the insurance evidence chain. Each entry's hash is a
// SHA-256 of its own content plus the previous entry's hash — the same
// hash-chaining idea Git commits and certificate-transparency logs use.
// Editing any past entry changes its hash, which breaks every hash after
// it, so tampering is always detectable by recomputing and comparing —
// no blockchain, no consensus network, just one hash per entry.

const crypto = require('crypto');

function hashEntry(prevHash, entry) {
  return crypto.createHash('sha256').update(prevHash + entry.timestamp + entry.type + entry.description).digest('hex');
}

function appendEvidence(shipment, type, description) {
  const timestamp = new Date().toISOString();
  const prevHash = shipment.insuranceEvidence.length > 0
    ? shipment.insuranceEvidence[shipment.insuranceEvidence.length - 1].hash
    : shipment.id; // genesis link — ties the very first entry to this shipment
  const entry = { timestamp, type, description };
  const hash = hashEntry(prevHash, entry);
  shipment.insuranceEvidence.push({ ...entry, prevHash, hash });
  shipment.evidenceChainValid = true;
}

function verifyChain(shipment) {
  let prevHash = shipment.id;
  for (const entry of shipment.insuranceEvidence) {
    const expected = hashEntry(prevHash, { timestamp: entry.timestamp, type: entry.type, description: entry.description });
    if (entry.hash !== expected || entry.prevHash !== prevHash) return false;
    prevHash = entry.hash;
  }
  return true;
}

module.exports = { appendEvidence, verifyChain };
