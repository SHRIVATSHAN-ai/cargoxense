// Persistence layer. Each shipment's full state is stored as one JSON
// document per row — simple to reason about, and enough for a prototype.
// (A production version would normalize this into the relational model
// described in the CargoXense spec: separate tables per entity.)

const path = require('path');
const Database = require('better-sqlite3');
const { shipments: seedShipments } = require('./seedData');
const { survivalScore, riskLevel, customsReadinessPct, missingDocs, transparencyScore, freightReferenceBand, isFreightAnomaly } = require('./riskEngine');

const db = new Database(path.join(__dirname, 'cargoxense.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );
`);

function buildInitialShipment(seedInput) {
  // Deep clone so mutating a shipment during simulation never leaks back
  // into the shared seed data (which would silently break "reset").
  const seed = JSON.parse(JSON.stringify(seedInput));
  const readings = [];
  const start = Date.now() - 11 * 5 * 60000;
  for (let i = 0; i < 12; i++) {
    readings.push({
      timestamp: new Date(start + i * 5 * 60000).toISOString(),
      temperature: +(seed.sensorSeed.temperature + (Math.random() - 0.5)).toFixed(1),
      humidity: +(seed.sensorSeed.humidity + (Math.random() - 0.5) * 2).toFixed(1),
      shock: +(seed.sensorSeed.shock + Math.random() * 0.1).toFixed(2),
    });
  }

  const shipment = {
    ...seed,
    survivalScore: survivalScore(seed.factors),
    riskLevel: riskLevel(survivalScore(seed.factors)),
    transparency: transparencyScore(seed),
    sensorReadings: readings,
    events: [...seed.events],
    insuranceEvidence: [],
    evidenceChainValid: true, // trivially true — nothing recorded yet to tamper with
    aiRecommendation: null,
    scoreHistory: [{ timestamp: nowIso(), score: survivalScore(seed.factors) }],
  };
  shipment.customsReadiness.readinessPct = customsReadinessPct(shipment.customsReadiness);
  shipment.customsReadiness.missing = missingDocs(shipment.customsReadiness);
  shipment.freightQuotes = shipment.freightQuotes.map((q) => ({
    ...q,
    expectedBand: freightReferenceBand(q.baseCost),
    priceAnomaly: isFreightAnomaly(q.baseCost, q.currentCost),
  }));
  return shipment;
}

function nowIso() {
  return new Date().toISOString();
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM shipments').get().c;
  if (count > 0) return;
  const insert = db.prepare('INSERT INTO shipments (id, data) VALUES (?, ?)');
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row.id, JSON.stringify(row));
  });
  insertMany(seedShipments.map(buildInitialShipment));
}

function getAll() {
  return db.prepare('SELECT data FROM shipments').all().map((r) => JSON.parse(r.data));
}

function getById(id) {
  const row = db.prepare('SELECT data FROM shipments WHERE id = ?').get(id);
  return row ? JSON.parse(row.data) : null;
}

function save(shipment) {
  db.prepare('UPDATE shipments SET data = ? WHERE id = ?').run(JSON.stringify(shipment), shipment.id);
}

function resetAll() {
  db.prepare('DELETE FROM shipments').run();
  seedIfEmpty();
}

function rebuildOne(id) {
  const seed = seedShipments.find((s) => s.id === id);
  if (!seed) return null;
  const fresh = buildInitialShipment(seed);
  save(fresh);
  return fresh;
}

seedIfEmpty();

module.exports = { getAll, getById, save, resetAll, rebuildOne, nowIso };
