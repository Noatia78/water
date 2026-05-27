import { useEffect, useState } from 'react';
import { AlertTriangle, Bell, BellOff, CheckCircle, Zap, Info, Droplets, Brain } from 'lucide-react';
import { supabase, Alert } from '../lib/supabase';

const SEVERITY_CONFIG = {
  low: { label: 'Low', badge: 'bg-slate-100 text-slate-600 border-slate-200', bar: 'bg-slate-400' },
  medium: { label: 'Medium', badge: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-400' },
  high: { label: 'High', badge: 'bg-orange-50 text-orange-700 border-orange-200', bar: 'bg-orange-500' },
  critical: { label: 'Critical', badge: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-500' },
};

const ALERT_TYPE_CONFIG = {
  outbreak: { label: 'Outbreak', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  water_quality: { label: 'Water Quality', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
  prediction: { label: 'AI Prediction', icon: Brain, color: 'text-violet-500', bg: 'bg-slate-50' },
  informational: { label: 'Information', icon: Info, color: 'text-slate-500', bg: 'bg-slate-50' },
};

const AUDIENCE_LABEL: Record<string, string> = {
  district_health_officer: 'District Health Officer',
  block_medical_officer: 'Block Medical Officer',
  state_health_authority: 'State Health Authority',
  local_governance: 'Local Governance',
  community: 'Community',
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'acknowledged'>('all');
  const [severityFilter, setSeverityFilter] = useState('');

  async function loadAlerts() {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .order('sent_at', { ascending: false });
    setAlerts(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadAlerts(); }, []);

  async function acknowledge(id: string) {
    await supabase.from('alerts').update({ acknowledged: true }).eq('id', id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  }

  async function acknowledgeAll() {
    const ids = alerts.filter(a => !a.acknowledged).map(a => a.id);
    if (ids.length === 0) return;
    await supabase.from('alerts').update({ acknowledged: true }).in('id', ids);
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  }

  const filtered = alerts.filter(a => {
    const matchStatus = filter === 'all' || (filter === 'acknowledged' ? a.acknowledged : !a.acknowledged);
    const matchSev = !severityFilter || a.severity === severityFilter;
    return matchStatus && matchSev;
  });

  const pendingCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  const counts = {
    outbreak: alerts.filter(a => a.alert_type === 'outbreak').length,
    water_quality: alerts.filter(a => a.alert_type === 'water_quality').length,
    prediction: alerts.filter(a => a.alert_type === 'prediction').length,
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-slate-900 font-semibold text-lg">Alerts & Notifications</h2>
          <p className="text-slate-400 text-sm">Real-time alerts for health officials and local leaders</p>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={acknowledgeAll}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <CheckCircle className="w-4 h-4" /> Acknowledge All ({pendingCount})
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Pending</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-red-500" />
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Critical</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{criticalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Outbreaks</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{counts.outbreak}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">AI Alerts</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{counts.prediction}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'acknowledged'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="w-px bg-slate-200 self-stretch mx-1" />
        {(['', 'critical', 'high', 'medium', 'low']).map(s => (
          <button
            key={s || 'all'}
            onClick={() => setSeverityFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              severityFilter === s
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Severities'}
          </button>
        ))}
      </div>

      {/* Alert list */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading alerts...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => {
            const typeCfg = ALERT_TYPE_CONFIG[alert.alert_type] ?? ALERT_TYPE_CONFIG.informational;
            const sevCfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.medium;
            const TypeIcon = typeCfg.icon;
            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border transition-all hover:shadow-md ${
                  alert.acknowledged ? 'border-slate-200 opacity-75' : 'border-slate-200 shadow-sm'
                }`}
              >
                {/* Severity bar */}
                <div className={`h-1 rounded-t-xl ${sevCfg.bar}`} />

                <div className="p-4 lg:p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeCfg.bg}`}>
                      <TypeIcon className={`w-5 h-5 ${typeCfg.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="font-semibold text-slate-900 text-sm leading-tight">{alert.title}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sevCfg.badge}`}>
                          {sevCfg.label}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {typeCfg.label}
                        </span>
                        {alert.acknowledged && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Acknowledged
                          </span>
                        )}
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed">{alert.message}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        {alert.district && (
                          <span className="text-slate-400 text-xs">District: {alert.district}</span>
                        )}
                        <span className="text-slate-400 text-xs">
                          {new Date(alert.sent_at).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        {alert.target_audience.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {alert.target_audience.map(t => (
                              <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                                {AUDIENCE_LABEL[t] ?? t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledge(alert.id)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Acknowledge</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <BellOff className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">No alerts match the selected filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
