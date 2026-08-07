# CargoXense — Working Prototype

Cross-border cargo intelligence, resilience & recovery platform.
"Sense the risk. See the journey. Protect the cargo."

## How to run it

You need two terminals open at the same time.

**Terminal 1 — backend:**
```bash
cd cargoxense/server
npm install
npm start
```
Runs on http://localhost:4000

**Terminal 2 — frontend:**
```bash
cd cargoxense/client
npm install
npm run dev
```
Runs on http://localhost:5173 — open this in your browser.

## Demo script (2-3 minutes)

1. Open the **Command Center** — 6 live shipments, top metrics bar.
2. Click into **CX-1001 "Pharma Cold Chain"** (marked DEMO) — this is the shipment built for the live demo.
3. Click **"⚡ Trigger Next Disruption"** four times, narrating each stage:
   - Geopolitical disruption → route risk rises
   - Port congestion → freight quote spikes (+107%)
   - Communication loss → tracker goes OFFLINE, store-and-forward buffering kicks in
   - Temperature excursion → an incident opens, Insurance Evidence Vault starts capturing evidence, AI recommendation appears
4. Read out the **AI Recommendation card** (why / confidence / alternatives), then click **"Approve Recommended Action"** — this is the human-in-the-loop step.
5. Point at the **Economic Impact** panel that appears: potential loss vs. estimated loss avoided.
6. Go to **Evidence Vault** — show the chronological evidence chain and download the incident report JSON.
7. Open the **Copilot** (bottom-right 🤖) and ask "What can potentially be recovered?" or "Which cargo is at highest risk?" — show that answers come from real data, not a script.
8. Click **"Reset Simulation"** on the shipment page to set it back to normal before doing it again.

## Project structure

```
cargoxense/
  server/   Node.js + Express + Socket.IO + SQLite (the backend)
  client/   React + TypeScript + Vite + Tailwind (the frontend)
```

See the team explanation doc for a part-by-part breakdown you can use to answer judge questions.
