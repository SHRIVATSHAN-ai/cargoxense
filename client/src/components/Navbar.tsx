import { Link, useLocation } from 'react-router-dom';
import { GridFour, ShieldCheck, WifiHigh, WifiSlash } from '@phosphor-icons/react';
import { useShipmentsStore } from '../store/useShipments';

export function Navbar() {
  const connected = useShipmentsStore((s) => s.connected);
  const location = useLocation();

  const linkClass = (path: string) =>
    `flex items-center gap-1.5 font-mono-ui text-xs uppercase tracking-[0.08em] transition ${
      location.pathname === path ? 'text-text' : 'text-muted hover:text-text'
    }`;

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-baseline gap-3">
          <span className="font-display text-2xl font-medium tracking-tight text-text">CargoXense</span>
          <span className="hidden font-mono-ui text-[10px] uppercase tracking-[0.14em] text-muted sm:inline">
            Global Cargo Intelligence Center
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/" className={linkClass('/')}><GridFour size={15} weight="regular" />Command Center</Link>
          <Link to="/evidence" className={linkClass('/evidence')}><ShieldCheck size={15} weight="regular" />Evidence Vault</Link>
        </nav>

        <div className="font-mono-ui flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-muted" role="status">
          {connected ? <WifiHigh size={14} weight="regular" className="text-good" /> : <WifiSlash size={14} weight="regular" className="animate-pulse text-critical" />}
          {connected ? 'System Live' : 'Connecting'}
        </div>
      </div>
    </header>
  );
}
