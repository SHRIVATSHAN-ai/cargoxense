import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CopilotWidget } from './components/CopilotWidget';
import { CommandCenter } from './pages/CommandCenter';
import { ShipmentDetail } from './pages/ShipmentDetail';
import { EvidenceVault } from './pages/EvidenceVault';
import { useShipmentsStore } from './store/useShipments';

export default function App() {
  const init = useShipmentsStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <Routes>
        <Route path="/" element={<CommandCenter />} />
        <Route path="/shipment/:id" element={<ShipmentDetail />} />
        <Route path="/evidence" element={<EvidenceVault />} />
      </Routes>
      <CopilotWidget />
    </div>
  );
}
