import type { Metrics, Shipment, ShipmentSummary } from '../types';

// In dev, the client (Vite, :5173) and server (:4000) are different origins.
// In production the server serves the built client itself, so requests are
// same-origin and a relative path is all that's needed.
const BASE = import.meta.env.DEV ? 'http://localhost:4000/api' : '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

export const api = {
  getShipments: () => request<ShipmentSummary[]>('/shipments'),
  getShipment: (id: string) => request<Shipment>(`/shipments/${id}`),
  getMetrics: () => request<Metrics>('/metrics'),
  getEvidence: (id: string) => request(`/shipments/${id}/evidence`),
  advanceCrisis: (id: string) => request<Shipment>(`/shipments/${id}/crisis/next`, { method: 'POST' }),
  approveRecovery: (id: string) => request<Shipment>(`/shipments/${id}/crisis/approve-recovery`, { method: 'POST' }),
  resetCrisis: (id: string) => request<Shipment>(`/shipments/${id}/crisis/reset`, { method: 'POST' }),
  askCopilot: (query: string) => request<{ query: string; answer: string }>('/copilot', {
    method: 'POST',
    body: JSON.stringify({ query }),
  }),
};
