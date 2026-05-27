import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  Droplets,
  FileText,
  MapPin,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { supabase, Outbreak, Alert, WaterQualityReading, HealthReport } from '../lib/supabase';

const SEVERITY_COLOR: Record<string, string> = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_DOT: Record<string, string> = {
  active: 'bg-red-500',
  monitoring: 'bg-amber-400',
  predicted: 'bg-blue-500',
  resolved: 'bg-green-500',
};

function StatCard({
  label, value, sub, icon: Icon, color, trend
}: {
  label: string; value: string | number; sub?: string;
  icon: typeof AlertTriangle; color: string; trend?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-slate-900 text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-rose-500" />
            <span className="text-rose-500 text-xs font-medium">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [waterReadings, setWaterReadings] = useState<WaterQualityReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [obRes, alRes, rpRes, wqRes] = await Promise.all([
        supabase.from('outbreaks').select('*').order('started_at', { ascending: false }),
        supabase.from('alerts').select('*').order('sent_at', { ascending: false }).limit(5),
        supabase.from('health_reports').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('water_quality_readings').select('*').order('recorded_at', { ascending: false }).limit(10),
      ]);
      setOutbreaks(obRes.data ?? []);
      setAlerts(alRes.data ?? []);
      setReports(rpRes.data ?? []);
      setWaterReadings(wqRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const activeOutbreaks = outbreaks.filter(o => o.status === 'active');
  const predictedOutbreaks = outbreaks.filter(o => o.status === 'predicted');
  const criticalWater = waterReadings.filter(w => w.overall_status === 'critical');
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const totalCases = outbreaks.reduce((sum, o) => sum + o.case_count, 0);

  const districtRiskMap: Record<string, { cases: number; severity: string }> = {};
  for (const o of outbreaks) {
    if (!districtRiskMap[o.district]) districtRiskMap[o.district] = { cases: 0, severity: 'low' };
    districtRiskMap[o.district].cases += o.case_count;
    const sev = ['low', 'medium', 'high', 'critical'];
    if (sev.indexOf(o.severity) > sev.indexOf(districtRiskMap[o.district].severity)) {
      districtRiskMap[o.district].severity = o.severity;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading surveillance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Outbreaks"
          value={activeOutbreaks.length}
          sub={`${predictedOutbreaks.length} predicted`}
          icon={AlertTriangle}
          color="bg-red-100 text-red-600"
          trend={activeOutbreaks.length > 0 ? `+${activeOutbreaks.length} this week` : undefined}
        />
        <StatCard
          label="Total Cases"
          value={totalCases}
          sub="Across all districts"
          icon={Users}
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          label="Critical Water Sources"
          value={criticalWater.length}
          sub={`${waterReadings.filter(w => w.overall_status === 'warning').length} warnings`}
          icon={Droplets}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Pending Alerts"
          value={unacknowledgedAlerts.length}
          sub="Require action"
          icon={Zap}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Outbreak Map Placeholder */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Outbreak Hotspot Map</h2>
              <p className="text-slate-400 text-xs mt-0.5">Northeastern Region, India</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-1 font-medium">
              Live
            </span>
          </div>
          {/* Stylized NER map placeholder with outbreak pins */}
          <div className="relative bg-gradient-to-br from-slate-100 via-emerald-50/30 to-blue-50/30 h-72 overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 40%, #10b981 0px, transparent 120px),
                  radial-gradient(circle at 70% 30%, #3b82f6 0px, transparent 100px),
                  radial-gradient(circle at 50% 70%, #f59e0b 0px, transparent 80px)`,
              }}
            />
            {/* Grid lines suggesting a map */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              {[20, 40, 60, 80].map(y => (
                <line key={`h${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#64748b" strokeWidth="1" />
              ))}
              {[20, 40, 60, 80].map(x => (
                <line key={`v${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#64748b" strokeWidth="1" />
              ))}
            </svg>

            {/* Outbreak pins */}
            {outbreaks.map((outbreak, idx) => {
              const positions = [
                { left: '28%', top: '45%' },
                { left: '72%', top: '25%' },
                { left: '55%', top: '55%' },
                { left: '22%', top: '62%' },
                { left: '42%', top: '35%' },
              ];
              const pos = positions[idx % positions.length];
              const dotColor = outbreak.status === 'active' ? 'bg-red-500' :
                outbreak.status === 'predicted' ? 'bg-blue-500' : 'bg-amber-400';
              const ringColor = outbreak.status === 'active' ? 'ring-red-400' :
                outbreak.status === 'predicted' ? 'ring-blue-400' : 'ring-amber-300';
              return (
                <div key={outbreak.id} className="absolute group" style={pos}>
                  <div className={`w-4 h-4 rounded-full ${dotColor} ring-4 ${ringColor} ring-opacity-30 animate-pulse cursor-pointer`} />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 w-36">
                    <div className="bg-slate-900 text-white text-xs rounded-lg p-2 shadow-lg">
                      <p className="font-semibold">{outbreak.disease_name}</p>
                      <p className="text-slate-300">{outbreak.district}</p>
                      <p className="text-slate-400">{outbreak.case_count} cases</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs space-y-1.5 border border-slate-200">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-red-500 rounded-full" /><span className="text-slate-600">Active Outbreak</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-amber-400 rounded-full" /><span className="text-slate-600">Monitoring</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full" /><span className="text-slate-600">AI Predicted</span></div>
            </div>

            <div className="absolute top-4 left-4 text-slate-400 text-xs font-medium bg-white/70 backdrop-blur-sm rounded px-2 py-1">
              Northeastern India · Assam & Meghalaya
            </div>
          </div>

          {/* Outbreak list below map */}
          <div className="divide-y divide-slate-100">
            {outbreaks.slice(0, 4).map(o => (
              <div key={o.id} className="px-5 py-3 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[o.status] ?? 'bg-slate-300'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{o.disease_name}</p>
                  <p className="text-slate-400 text-xs">{o.village}, {o.district}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SEVERITY_COLOR[o.severity]}`}>
                  {o.severity}
                </span>
                <span className="text-slate-500 text-xs">{o.case_count} cases</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Recent Alerts */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent Alerts</h2>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-emerald-600 hover:text-emerald-700 text-xs font-medium flex items-center gap-1"
              >
                View all <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0 ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-tight">{alert.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          alert.acknowledged ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {alert.acknowledged ? 'Acknowledged' : 'Pending'}
                        </span>
                        <span className="text-slate-400 text-xs">{alert.district}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* District Risk Summary */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">District Risk Summary</h2>
            </div>
            <div className="p-4 space-y-2">
              {Object.entries(districtRiskMap).map(([district, info]) => (
                <div key={district} className="flex items-center gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700 flex-1 truncate">{district}</span>
                  <span className="text-slate-400 text-xs">{info.cases} cases</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SEVERITY_COLOR[info.severity]}`}>
                    {info.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent Reports</h2>
              <button
                onClick={() => onNavigate('reports')}
                className="text-emerald-600 hover:text-emerald-700 text-xs font-medium flex items-center gap-1"
              >
                View all <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {reports.slice(0, 3).map(r => (
                <div key={r.id} className="px-4 py-3 flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{r.disease_suspected || 'Unknown'}</p>
                    <p className="text-slate-400 text-xs">{r.reporter_name} · {r.village}</p>
                    <p className="text-slate-400 text-xs">{r.patient_count} patients · {r.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Water Quality Strip */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Water Source Status</h2>
            <p className="text-slate-400 text-xs mt-0.5">Latest quality readings</p>
          </div>
          <button
            onClick={() => onNavigate('water')}
            className="text-emerald-600 hover:text-emerald-700 text-xs font-medium flex items-center gap-1"
          >
            Full report <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {waterReadings.slice(0, 5).map(w => (
            <div key={w.id} className="px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  w.overall_status === 'critical' ? 'bg-red-500' :
                  w.overall_status === 'warning' ? 'bg-amber-400' : 'bg-green-500'
                }`} />
                <span className={`text-xs font-semibold capitalize ${
                  w.overall_status === 'critical' ? 'text-red-600' :
                  w.overall_status === 'warning' ? 'text-amber-600' : 'text-green-600'
                }`}>{w.overall_status}</span>
              </div>
              <p className="text-slate-800 text-sm font-medium truncate">{w.source_name}</p>
              <p className="text-slate-400 text-xs mt-0.5">{w.village}, {w.district}</p>
              <div className="mt-2 space-y-1">
                {w.ph_level !== null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">pH</span>
                    <span className={`font-medium ${w.ph_level < 6.5 || w.ph_level > 8.5 ? 'text-red-600' : 'text-slate-600'}`}>
                      {w.ph_level}
                    </span>
                  </div>
                )}
                {w.turbidity !== null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Turbidity</span>
                    <span className={`font-medium ${w.turbidity > 4 ? 'text-red-600' : 'text-slate-600'}`}>
                      {w.turbidity} NTU
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Bacteria</span>
                  <span className={`font-medium ${w.bacterial_presence ? 'text-red-600' : 'text-green-600'}`}>
                    {w.bacterial_presence ? 'Detected' : 'None'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
