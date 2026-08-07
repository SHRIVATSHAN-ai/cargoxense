const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const db = require('./db');
const simulation = require('./simulation');
const copilot = require('./copilot');

const app = express();

// Shared-password gate. Set ACCESS_USER / ACCESS_PASS in the environment to
// enable it; if unset, the server stays open (so local dev is unaffected).
// Applied in two places, deliberately: Express middleware below covers the
// HTML/API/static traffic, and `allowRequest` further down covers the
// Socket.IO handshake — Engine.IO attaches its own request listener that
// intercepts `/socket.io/*` before Express ever sees it, so the Express
// gate alone would leave the live data feed unprotected.
const ACCESS_USER = process.env.ACCESS_USER;
const ACCESS_PASS = process.env.ACCESS_PASS;
const authEnabled = Boolean(ACCESS_USER && ACCESS_PASS);

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function checkBasicAuth(req) {
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return false;
  const [user, pass] = Buffer.from(encoded, 'base64').toString('utf8').split(':');
  return Boolean(user && pass && timingSafeEqual(user, ACCESS_USER) && timingSafeEqual(pass, ACCESS_PASS));
}

if (authEnabled) {
  app.use((req, res, next) => {
    if (req.path === '/api/health') return next(); // let uptime pings through
    if (checkBasicAuth(req)) return next();
    res.set('WWW-Authenticate', 'Basic realm="CargoXense"');
    res.status(401).send('Authentication required.');
  });
}

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  allowRequest: (req, callback) => {
    if (!authEnabled || checkBasicAuth(req)) return callback(null, true);
    callback('Unauthorized', false);
  },
});

function broadcastShipment(shipment) {
  io.emit('shipment:update', shipment);
}

function summarize(shipment) {
  const { id, name, cargoType, origin, destination, carrier, status, cargoValueINR,
    survivalScore, riskLevel, commsStatus, crisisStage, customsReadiness, incident } = shipment;
  return { id, name, cargoType, origin, destination, carrier, status, cargoValueINR,
    survivalScore, riskLevel, commsStatus, crisisStage, isHero: shipment.isHero,
    missingDocs: customsReadiness.missing.length, incidentOpen: !!(incident && incident.status === 'OPEN') };
}

app.get('/api/shipments', (req, res) => {
  res.json(db.getAll().map(summarize));
});

app.get('/api/shipments/:id', (req, res) => {
  const shipment = db.getById(req.params.id);
  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
  res.json(shipment);
});

app.get('/api/metrics', (req, res) => {
  const shipments = db.getAll();
  const activeShipments = shipments.length;
  const atRiskCargo = shipments.filter((s) => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL').length;
  const criticalIncidents = shipments.filter((s) => s.incident && s.incident.status === 'OPEN').length;
  const customsAlerts = shipments.filter((s) => s.customsReadiness.missing.length > 0).length;
  const offlineTrackers = shipments.filter((s) => s.commsStatus !== 'ONLINE').length;
  const priceAnomalies = shipments.reduce((sum, s) => sum + s.freightQuotes.filter((q) => q.priceAnomaly).length, 0);
  const claimsInReview = shipments.filter((s) => s.claimStatus === 'READY FOR REVIEW').length;
  const recoverableValue = shipments.reduce((sum, s) => sum + (s.economicImpact ? s.economicImpact.estimatedLossAvoided : 0), 0);
  res.json({ activeShipments, atRiskCargo, criticalIncidents, customsAlerts, offlineTrackers, priceAnomalies, claimsInReview, recoverableValue });
});

app.get('/api/shipments/:id/evidence', (req, res) => {
  const shipment = db.getById(req.params.id);
  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
  res.json({
    shipmentId: shipment.id,
    incident: shipment.incident,
    evidence: shipment.insuranceEvidence,
    events: shipment.events,
    claimStatus: shipment.claimStatus || 'NO CLAIM',
    economicImpact: shipment.economicImpact || null,
  });
});

app.post('/api/shipments/:id/crisis/next', (req, res) => {
  const shipment = db.getById(req.params.id);
  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
  const updated = simulation.advanceCrisis(shipment);
  db.save(updated);
  broadcastShipment(updated);
  res.json(updated);
});

app.post('/api/shipments/:id/crisis/approve-recovery', (req, res) => {
  const shipment = db.getById(req.params.id);
  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
  const updated = simulation.approveRecovery(shipment);
  db.save(updated);
  broadcastShipment(updated);
  res.json(updated);
});

app.post('/api/shipments/:id/crisis/reset', (req, res) => {
  const fresh = db.rebuildOne(req.params.id);
  if (!fresh) return res.status(404).json({ error: 'Shipment not found' });
  broadcastShipment(fresh);
  res.json(fresh);
});

app.post('/api/copilot', (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) return res.status(400).json({ error: 'query is required' });
  const shipments = db.getAll();
  const answerText = copilot.answer(query, shipments);
  res.json({ query, answer: answerText });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Serve the built client (client/dist) so one Render service hosts the whole
// app on one origin — no CORS, and the Basic Auth gate above covers the UI
// too, not just the API. In local dev the client runs on its own Vite server
// instead, so client/dist won't exist yet; that's fine, this simply no-ops.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (req, res, next) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

io.on('connection', (socket) => {
  socket.emit('shipments:init', db.getAll());
});

// Background "live" feel: gentle sensor jitter for shipments not mid-crisis.
setInterval(() => {
  const shipments = db.getAll();
  shipments.forEach((s) => {
    const updated = simulation.tickJitter(s);
    db.save(updated);
    broadcastShipment(updated);
  });
}, 5000);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`CargoXense server listening on http://localhost:${PORT}`);
});
