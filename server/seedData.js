// Initial demo shipments. Kept to 6 diverse, realistic shipments instead of 20+
// so the dashboard stays easy to read and explain during a demo.

function nowIso(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60000).toISOString();
}

function baseFactors(environment, delay, route, customs, communication) {
  return { environment, delay, route, customs, communication };
}

const shipments = [
  {
    id: 'CX-1001',
    name: 'Pharma Cold Chain',
    cargoType: 'Pharmaceuticals',
    description: 'Temperature-sensitive vaccines, 2-8°C cold chain',
    origin: 'Mumbai, India',
    destination: 'Rotterdam, Netherlands',
    carrier: 'Meridian Ocean Lines',
    transportMode: 'Sea + Road',
    cargoValueINR: 7200000,
    status: 'In Transit',
    isHero: true, // this is the shipment used for the live crisis demo
    tempRange: { min: 2, max: 8 },
    factors: baseFactors(97, 96, 96, 100, 97),
    commsStatus: 'ONLINE',
    crisisStage: 0,
    incident: null,
    customsReadiness: {
      required: ['Commercial Invoice', 'Packing List', 'Certificate of Origin', 'Cold Chain Compliance Cert', 'Bill of Lading', 'Import License', 'GMP Certificate'],
      available: ['Commercial Invoice', 'Packing List', 'Cold Chain Compliance Cert', 'Bill of Lading', 'Import License', 'GMP Certificate'],
    },
    freightQuotes: [
      { carrier: 'Meridian Ocean Lines', route: 'Route A (Suez)', transitDays: 9, baseCost: 480000, currentCost: 480000, riskLevel: 'LOW' },
      { carrier: 'Blue Horizon Shipping', route: 'Route B (Cape)', transitDays: 12, baseCost: 520000, currentCost: 520000, riskLevel: 'LOW' },
      { carrier: 'Orient Star Logistics', route: 'Route C (Suez Express)', transitDays: 8, baseCost: 610000, currentCost: 610000, riskLevel: 'MODERATE' },
    ],
    sensorSeed: { temperature: 5.1, humidity: 46, shock: 0.1 },
    events: [
      { timestamp: nowIso(-720), type: 'DEPARTURE', title: 'Departed origin warehouse', description: 'Cargo sealed, sensors activated, departure health gate passed.', severity: 'INFO' },
      { timestamp: nowIso(-360), type: 'CHECKPOINT', title: 'Cleared Mumbai port customs', description: 'All documents verified at origin.', severity: 'INFO' },
    ],
  },
  {
    id: 'CX-1002',
    name: 'Electronics Components',
    cargoType: 'Electronics',
    description: 'Consumer electronics components, shock/humidity sensitive',
    origin: 'Shenzhen, China',
    destination: 'Hamburg, Germany',
    carrier: 'Pacific Trade Line',
    transportMode: 'Sea',
    cargoValueINR: 4500000,
    status: 'In Transit',
    isHero: false,
    tempRange: { min: -10, max: 40 },
    factors: baseFactors(94, 90, 92, 100, 95),
    commsStatus: 'ONLINE',
    crisisStage: 0,
    incident: null,
    customsReadiness: {
      required: ['Commercial Invoice', 'Packing List', 'Certificate of Origin', 'Bill of Lading'],
      available: ['Commercial Invoice', 'Packing List', 'Certificate of Origin', 'Bill of Lading'],
    },
    freightQuotes: [
      { carrier: 'Pacific Trade Line', route: 'Direct', transitDays: 21, baseCost: 310000, currentCost: 310000, riskLevel: 'LOW' },
      { carrier: 'Silk Route Freight', route: 'Via Singapore', transitDays: 24, baseCost: 285000, currentCost: 285000, riskLevel: 'LOW' },
    ],
    sensorSeed: { temperature: 22, humidity: 55, shock: 0.2 },
    events: [
      { timestamp: nowIso(-1440), type: 'DEPARTURE', title: 'Departed Shenzhen port', description: 'Container loaded and sealed.', severity: 'INFO' },
    ],
  },
  {
    id: 'CX-1003',
    name: 'Perishable Produce',
    cargoType: 'Perishable Food',
    description: 'Fresh fruit export, short shelf-life window',
    origin: 'Mombasa, Kenya',
    destination: 'Dubai, UAE',
    carrier: 'Coastal Reefer Co.',
    transportMode: 'Sea',
    cargoValueINR: 1800000,
    status: 'Customs Hold',
    isHero: false,
    tempRange: { min: 4, max: 10 },
    factors: baseFactors(88, 70, 85, 55, 90),
    commsStatus: 'ONLINE',
    crisisStage: 0,
    incident: null,
    customsReadiness: {
      required: ['Commercial Invoice', 'Packing List', 'Phytosanitary Certificate', 'Certificate of Origin', 'Health Certificate'],
      available: ['Commercial Invoice', 'Packing List', 'Certificate of Origin'],
    },
    freightQuotes: [
      { carrier: 'Coastal Reefer Co.', route: 'Direct', transitDays: 5, baseCost: 140000, currentCost: 140000, riskLevel: 'MODERATE' },
    ],
    sensorSeed: { temperature: 6.5, humidity: 60, shock: 0.3 },
    events: [
      { timestamp: nowIso(-200), type: 'ALERT', title: 'Customs hold: missing Phytosanitary Certificate', description: 'Destination customs flagged missing documentation.', severity: 'WARNING' },
    ],
  },
  {
    id: 'CX-1004',
    name: 'Humanitarian Medical Aid',
    cargoType: 'Humanitarian',
    description: 'Emergency medical supplies for disaster relief',
    origin: 'Nairobi, Kenya',
    destination: 'Aden, Yemen',
    carrier: 'Global Relief Logistics',
    transportMode: 'Air + Road',
    cargoValueINR: 3000000,
    status: 'In Transit',
    isHero: false,
    tempRange: { min: 5, max: 25 },
    factors: baseFactors(80, 60, 50, 90, 40),
    commsStatus: 'DEGRADED',
    crisisStage: 0,
    incident: null,
    customsReadiness: {
      required: ['Commercial Invoice', 'Packing List', 'Humanitarian Exemption Certificate'],
      available: ['Commercial Invoice', 'Packing List', 'Humanitarian Exemption Certificate'],
    },
    freightQuotes: [
      { carrier: 'Global Relief Logistics', route: 'Direct', transitDays: 3, baseCost: 220000, currentCost: 220000, riskLevel: 'HIGH' },
    ],
    sensorSeed: { temperature: 18, humidity: 40, shock: 0.4 },
    events: [
      { timestamp: nowIso(-90), type: 'ALERT', title: 'Communication degraded near conflict zone', description: 'Signal loss detected on primary corridor; device buffering locally.', severity: 'WARNING' },
    ],
  },
  {
    id: 'CX-1005',
    name: 'Industrial Machinery',
    cargoType: 'Industrial',
    description: 'Heavy manufacturing equipment',
    origin: 'Busan, South Korea',
    destination: 'Los Angeles, USA',
    carrier: 'TransPacific Carriers',
    transportMode: 'Sea',
    cargoValueINR: 9500000,
    status: 'In Transit',
    isHero: false,
    tempRange: { min: -20, max: 50 },
    factors: baseFactors(98, 95, 94, 100, 96),
    commsStatus: 'ONLINE',
    crisisStage: 0,
    incident: null,
    customsReadiness: {
      required: ['Commercial Invoice', 'Packing List', 'Bill of Lading'],
      available: ['Commercial Invoice', 'Packing List', 'Bill of Lading'],
    },
    freightQuotes: [
      { carrier: 'TransPacific Carriers', route: 'Direct', transitDays: 14, baseCost: 720000, currentCost: 720000, riskLevel: 'LOW' },
    ],
    sensorSeed: { temperature: 20, humidity: 50, shock: 0.1 },
    events: [
      { timestamp: nowIso(-2000), type: 'DEPARTURE', title: 'Departed Busan port', description: 'Standard departure checks passed.', severity: 'INFO' },
    ],
  },
  {
    id: 'CX-1006',
    name: 'Consumer Electronics Batch',
    cargoType: 'Electronics',
    description: 'Retail electronics shipment, high demand season',
    origin: 'Ho Chi Minh City, Vietnam',
    destination: 'New York, USA',
    carrier: 'Apex Freight Solutions',
    transportMode: 'Sea',
    cargoValueINR: 5200000,
    status: 'In Transit',
    isHero: false,
    tempRange: { min: -10, max: 45 },
    factors: baseFactors(92, 80, 78, 100, 88),
    commsStatus: 'ONLINE',
    crisisStage: 0,
    incident: null,
    customsReadiness: {
      required: ['Commercial Invoice', 'Packing List', 'Certificate of Origin', 'Bill of Lading'],
      available: ['Commercial Invoice', 'Packing List', 'Certificate of Origin', 'Bill of Lading'],
    },
    freightQuotes: [
      { carrier: 'Apex Freight Solutions', route: 'Direct', transitDays: 26, baseCost: 340000, currentCost: 705000, riskLevel: 'HIGH', priceAnomaly: true },
      { carrier: 'Northline Cargo', route: 'Via Long Beach', transitDays: 29, baseCost: 355000, currentCost: 380000, riskLevel: 'MODERATE' },
      { carrier: 'Everline Shipping', route: 'Via Vancouver', transitDays: 31, baseCost: 330000, currentCost: 350000, riskLevel: 'LOW' },
    ],
    sensorSeed: { temperature: 24, humidity: 52, shock: 0.2 },
    events: [
      { timestamp: nowIso(-500), type: 'ALERT', title: 'Abnormal freight quotation detected', description: 'Current quote is +107% above historical reference for this lane.', severity: 'WARNING' },
    ],
  },
];

module.exports = { shipments };
