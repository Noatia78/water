import { useEffect, useState } from 'react';
import { Plus, Search, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase, HealthReport, Severity } from '../lib/supabase';

const SYMPTOMS = [
  'diarrhea', 'vomiting', 'fever', 'dehydration', 'headache',
  'abdominal_pain', 'jaundice', 'fatigue', 'nausea', 'rash'
];

const SEVERITY_STYLE: Record<string, string> = {
  low: 'bg-green-50 text-green-700 border-green-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600',
  confirmed: 'bg-emerald-100 text-emerald-700',
  investigated: 'bg-blue-100 text-blue-700',
};

const REPORTER_LABEL: Record<string, string> = {
  asha_worker: 'ASHA Worker',
  clinic: 'Clinic / PHC',
  volunteer: 'Volunteer',
  community: 'Community',
};

const DISTRICTS = [
  'Kamrup', 'Dibrugarh', 'Nagaon', 'Bongaigaon', 'Jorhat',
  'East Khasi Hills', 'Cachar', 'Lakhimpur', 'Sivasagar', 'Tinsukia'
];

const DISEASES = ['Cholera', 'Typhoid', 'Diarrhea', 'Hepatitis A', 'Dysentery', 'Leptospirosis', 'Other'];

interface FormData {
  reporter_name: string;
  reporter_type: string;
  village: string;
  district: string;
  state: string;
  symptoms: string[];
  disease_suspected: string;
  patient_count: number;
  severity: Severity;
  notes: string;
}

const emptyForm: FormData = {
  reporter_name: '',
  reporter_type: 'volunteer',
  village: '',
  district: 'Kamrup',
  state: 'Assam',
  symptoms: [],
  disease_suspected: '',
  patient_count: 1,
  severity: 'low',
  notes: '',
};

export default function Reports() {
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  async function loadReports() {
    const { data } = await supabase
      .from('health_reports')
      .select('*')
      .order('created_at', { ascending: false });
    setReports(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadReports(); }, []);

  function toggleSymptom(s: string) {
    setForm(f => ({
      ...f,
      symptoms: f.symptoms.includes(s)
        ? f.symptoms.filter(x => x !== s)
        : [...f.symptoms, s],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.reporter_name || !form.village) return;
    setSubmitting(true);
    await supabase.from('health_reports').insert([{ ...form, status: 'pending' }]);
    setSubmitting(false);
    setSuccess(true);
    setForm(emptyForm);
    await loadReports();
    setTimeout(() => { setSuccess(false); setShowForm(false); }, 2000);
  }

  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.disease_suspected.toLowerCase().includes(q)
      || r.village.toLowerCase().includes(q)
      || r.district.toLowerCase().includes(q)
      || r.reporter_name.toLowerCase().includes(q);
    const matchSev = !filterSeverity || r.severity === filterSeverity;
    return matchSearch && matchSev;
  });

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-slate-900 font-semibold text-lg">Community Health Reports</h2>
          <p className="text-slate-400 text-sm">Field reports from ASHA workers, clinics, and volunteers</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Submit Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by disease, village, district..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Submit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="font-semibold text-slate-900">Submit Health Report</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
            </div>

            {success ? (
              <div className="p-10 flex flex-col items-center gap-3">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
                <p className="text-slate-900 font-semibold">Report Submitted</p>
                <p className="text-slate-500 text-sm text-center">Your report has been received and is under review.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reporter Name *</label>
                    <input
                      required
                      value={form.reporter_name}
                      onChange={e => setForm(f => ({ ...f, reporter_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reporter Type</label>
                    <select
                      value={form.reporter_type}
                      onChange={e => setForm(f => ({ ...f, reporter_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="asha_worker">ASHA Worker</option>
                      <option value="clinic">Clinic / PHC</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="community">Community</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                    <select
                      value={form.district}
                      onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Village / Town *</label>
                    <input
                      required
                      value={form.village}
                      onChange={e => setForm(f => ({ ...f, village: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="Village or town name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Suspected Disease</label>
                    <select
                      value={form.disease_suspected}
                      onChange={e => setForm(f => ({ ...f, disease_suspected: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="">Select disease</option>
                      {DISEASES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Patient Count</label>
                    <input
                      type="number"
                      min={1}
                      value={form.patient_count}
                      onChange={e => setForm(f => ({ ...f, patient_count: +e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                    <select
                      value={form.severity}
                      onChange={e => setForm(f => ({ ...f, severity: e.target.value as Severity }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Symptoms Observed</label>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOMS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSymptom(s)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          form.symptoms.includes(s)
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                    placeholder="Any additional observations..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report count */}
      <p className="text-slate-500 text-sm">{filtered.length} report{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Reports grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading reports...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold text-slate-900">{r.disease_suspected || 'Unspecified'}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{r.village}, {r.district}</p>
                </div>
                <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${SEVERITY_STYLE[r.severity]}`}>
                  {r.severity}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
                <div>
                  <p className="text-slate-400 text-xs">Reporter</p>
                  <p className="text-slate-700 text-sm font-medium truncate">{r.reporter_name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Type</p>
                  <p className="text-slate-700 text-sm">{REPORTER_LABEL[r.reporter_type] ?? r.reporter_type}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Patients</p>
                  <p className="text-slate-700 text-sm font-semibold">{r.patient_count}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Date</p>
                  <p className="text-slate-700 text-sm">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {r.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {r.symptoms.slice(0, 4).map(s => (
                    <span key={s} className="text-xs bg-slate-100 text-slate-600 rounded px-2 py-0.5">
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                  {r.symptoms.length > 4 && (
                    <span className="text-xs text-slate-400">+{r.symptoms.length - 4} more</span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                {r.status === 'confirmed' ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : r.status === 'pending' ? (
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_STYLE[r.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-400">No reports match your filters.</div>
          )}
        </div>
      )}
    </div>
  );
}
