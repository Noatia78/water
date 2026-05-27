import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Droplets, Plus, ThermometerSun, Wind } from 'lucide-react';
import { supabase, WaterQualityReading, WaterStatus } from '../lib/supabase';

const STATUS_CONFIG = {
  safe: { label: 'Safe', icon: CheckCircle, dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 border-green-200', bar: 'bg-green-500' },
  warning: { label: 'Warning', icon: AlertTriangle, dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-400' },
  critical: { label: 'Critical', icon: AlertTriangle, dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-500' },
};

const SOURCE_LABEL: Record<string, string> = {
  well: 'Open Well',
  borewell: 'Borewell',
  river: 'River / Stream',
  pond: 'Pond',
  spring: 'Mountain Spring',
  tap: 'Tap / Piped',
};

const DISTRICTS = [
  'Kamrup', 'Dibrugarh', 'Nagaon', 'Bongaigaon', 'Jorhat',
  'East Khasi Hills', 'Cachar', 'Lakhimpur', 'Sivasagar', 'Tinsukia'
];

interface FormData {
  source_name: string;
  source_type: string;
  village: string;
  district: string;
  state: string;
  ph_level: string;
  turbidity: string;
  bacterial_presence: boolean;
  nitrate_level: string;
  overall_status: WaterStatus;
  recorded_by: string;
}

const emptyForm: FormData = {
  source_name: '',
  source_type: 'well',
  village: '',
  district: 'Kamrup',
  state: 'Assam',
  ph_level: '',
  turbidity: '',
  bacterial_presence: false,
  nitrate_level: '',
  overall_status: 'safe',
  recorded_by: '',
};

function Gauge({ value, max, label, warn, critical }: { value: number; max: number; label: string; warn: number; critical: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value >= critical ? 'bg-red-500' : value >= warn ? 'bg-amber-400' : 'bg-green-500';
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className={`text-xs font-semibold ${value >= critical ? 'text-red-600' : value >= warn ? 'text-amber-600' : 'text-green-600'}`}>
          {value}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function WaterQuality() {
  const [readings, setReadings] = useState<WaterQualityReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [filter, setFilter] = useState<'all' | WaterStatus>('all');

  async function loadReadings() {
    const { data } = await supabase
      .from('water_quality_readings')
      .select('*')
      .order('recorded_at', { ascending: false });
    setReadings(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadReadings(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.source_name || !form.village) return;
    setSubmitting(true);
    await supabase.from('water_quality_readings').insert([{
      ...form,
      ph_level: form.ph_level ? +form.ph_level : null,
      turbidity: form.turbidity ? +form.turbidity : null,
      nitrate_level: form.nitrate_level ? +form.nitrate_level : null,
    }]);
    setSubmitting(false);
    setSuccess(true);
    setForm(emptyForm);
    await loadReadings();
    setTimeout(() => { setSuccess(false); setShowForm(false); }, 2000);
  }

  const filtered = filter === 'all' ? readings : readings.filter(r => r.overall_status === filter);
  const counts = {
    safe: readings.filter(r => r.overall_status === 'safe').length,
    warning: readings.filter(r => r.overall_status === 'warning').length,
    critical: readings.filter(r => r.overall_status === 'critical').length,
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-slate-900 font-semibold text-lg">Water Quality Monitoring</h2>
          <p className="text-slate-400 text-sm">IoT sensors and manual test kit readings from water sources</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Log Reading
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {(['safe', 'warning', 'critical'] as const).map(status => {
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          return (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? 'all' : status)}
              className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                filter === status ? 'ring-2 ring-blue-400 border-blue-200' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{cfg.label}</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{counts[status]}</p>
              <p className="text-slate-400 text-xs mt-0.5">sources</p>
            </button>
          );
        })}
      </div>

      {/* Log Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="font-semibold text-slate-900">Log Water Quality Reading</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
            </div>

            {success ? (
              <div className="p-10 flex flex-col items-center gap-3">
                <CheckCircle className="w-12 h-12 text-blue-500" />
                <p className="text-slate-900 font-semibold">Reading Recorded</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Source Name *</label>
                    <input
                      required
                      value={form.source_name}
                      onChange={e => setForm(f => ({ ...f, source_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="e.g. Community Borewell BW-14"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Source Type</label>
                    <select
                      value={form.source_type}
                      onChange={e => setForm(f => ({ ...f, source_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {Object.entries(SOURCE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                    <select
                      value={form.district}
                      onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Village *</label>
                    <input
                      required
                      value={form.village}
                      onChange={e => setForm(f => ({ ...f, village: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">pH Level</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="14"
                      value={form.ph_level}
                      onChange={e => setForm(f => ({ ...f, ph_level: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="6.5 – 8.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Turbidity (NTU)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.turbidity}
                      onChange={e => setForm(f => ({ ...f, turbidity: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="< 4 NTU is safe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nitrate (mg/L)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.nitrate_level}
                      onChange={e => setForm(f => ({ ...f, nitrate_level: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="< 50 mg/L"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="bact"
                      checked={form.bacterial_presence}
                      onChange={e => setForm(f => ({ ...f, bacterial_presence: e.target.checked }))}
                      className="w-4 h-4 accent-red-500"
                    />
                    <label htmlFor="bact" className="text-sm font-medium text-slate-700">Bacterial presence detected</label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Overall Status</label>
                    <select
                      value={form.overall_status}
                      onChange={e => setForm(f => ({ ...f, overall_status: e.target.value as WaterStatus }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="safe">Safe</option>
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Recorded By</label>
                    <input
                      value={form.recorded_by}
                      onChange={e => setForm(f => ({ ...f, recorded_by: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Name of inspector / ASHA worker"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Reading'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Readings */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading water quality data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(r => {
            const cfg = STATUS_CONFIG[r.overall_status];
            const Icon = cfg.icon;
            return (
              <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{r.source_name}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{SOURCE_LABEL[r.source_type] ?? r.source_type} · {r.village}, {r.district}</p>
                  </div>
                  <span className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {r.ph_level !== null && (
                    <Gauge value={r.ph_level} max={14} label="pH Level" warn={8.5} critical={9.5} />
                  )}
                  {r.turbidity !== null && (
                    <Gauge value={r.turbidity} max={100} label="Turbidity (NTU)" warn={4} critical={25} />
                  )}
                  {r.nitrate_level !== null && (
                    <Gauge value={r.nitrate_level} max={100} label="Nitrate (mg/L)" warn={25} critical={50} />
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    r.bacterial_presence ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    Bacteria: {r.bacterial_presence ? 'Detected' : 'None'}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {new Date(r.recorded_at).toLocaleDateString('en-IN')}
                  </span>
                </div>

                {r.recorded_by && (
                  <p className="text-slate-400 text-xs mt-1.5">By: {r.recorded_by}</p>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-400">No readings match the selected filter.</div>
          )}
        </div>
      )}
    </div>
  );
}
