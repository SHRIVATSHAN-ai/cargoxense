import { create } from 'zustand';
import { socket } from '../lib/socket';
import type { Metrics, Shipment } from '../types';

interface ShipmentsState {
  shipments: Record<string, Shipment>;
  connected: boolean;
  init: () => void;
}

export const useShipmentsStore = create<ShipmentsState>((set) => ({
  shipments: {},
  connected: false,
  init: () => {
    set({ connected: socket.connected });
    socket.on('connect', () => set({ connected: true }));
    socket.on('disconnect', () => set({ connected: false }));

    socket.on('shipments:init', (list: Shipment[]) => {
      const map: Record<string, Shipment> = {};
      list.forEach((s) => { map[s.id] = s; });
      set({ shipments: map });
    });

    socket.on('shipment:update', (shipment: Shipment) => {
      set((state) => ({ shipments: { ...state.shipments, [shipment.id]: shipment } }));
    });
  },
}));

// Metrics are derived on the client from the same live shipment state that
// drives every other screen — one source of truth, no separate polling.
export function computeMetrics(shipments: Shipment[]): Metrics {
  const activeShipments = shipments.length;
  const atRiskCargo = shipments.filter((s) => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL').length;
  const criticalIncidents = shipments.filter((s) => s.incident && s.incident.status === 'OPEN').length;
  const customsAlerts = shipments.filter((s) => s.customsReadiness.missing.length > 0).length;
  const offlineTrackers = shipments.filter((s) => s.commsStatus !== 'ONLINE').length;
  const priceAnomalies = shipments.reduce((sum, s) => sum + s.freightQuotes.filter((q) => q.priceAnomaly).length, 0);
  const claimsInReview = shipments.filter((s) => s.claimStatus === 'READY FOR REVIEW').length;
  const recoverableValue = shipments.reduce((sum, s) => sum + (s.economicImpact ? s.economicImpact.estimatedLossAvoided : 0), 0);
  return { activeShipments, atRiskCargo, criticalIncidents, customsAlerts, offlineTrackers, priceAnomalies, claimsInReview, recoverableValue };
}
