import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SensorReading } from '../types';

function fmtTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function SensorChart({ readings, tempRange }: { readings: SensorReading[]; tempRange: { min: number; max: number } }) {
  const data = readings.slice(-20).map((r) => ({ ...r, time: fmtTime(r.timestamp) }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#ddd7cb" />
          <XAxis dataKey="time" tick={{ fill: '#4e463e', fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
          <YAxis tick={{ fill: '#4e463e', fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
          <Tooltip contentStyle={{ background: '#f2efe9', border: '1px solid #ddd7cb', borderRadius: 0, fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
          <ReferenceLine y={tempRange.max} stroke="#3a322a" strokeDasharray="4 4" label={{ value: 'max', fill: '#3a322a', fontSize: 10 }} />
          <ReferenceLine y={tempRange.min} stroke="#6c645c" strokeDasharray="4 4" label={{ value: 'min', fill: '#6c645c', fontSize: 10 }} />
          <Line type="monotone" dataKey="temperature" stroke="#17140f" strokeWidth={2} dot={false} name="Temperature (°C)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
