import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Globe, Video, FileText, CheckCircle, Droplets, Hand, AlertTriangle } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'as', label: 'Assamese (অসমীয়া)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'bodo', label: 'Bodo' },
  { code: 'kha', label: 'Khasi' },
  { code: 'mni', label: 'Meitei' },
];

const MODULES = [
  {
    id: 'hand-hygiene',
    title: 'Hand Hygiene & Sanitation',
    icon: Hand,
    color: 'bg-emerald-50 text-emerald-600',
    borderColor: 'border-emerald-200',
    duration: '8 min',
    audience: 'Community',
    content: {
      en: {
        summary: 'Proper handwashing is the single most effective way to prevent the spread of water-borne diseases.',
        steps: [
          'Wet hands with clean, running water',
          'Apply soap and lather thoroughly for at least 20 seconds',
          'Scrub between fingers, under nails, and the backs of hands',
          'Rinse completely under running water',
          'Dry with a clean towel or air dry',
        ],
        keyMessage: 'Wash hands before eating, after using the toilet, and after handling animals or waste.',
      },
      as: {
        summary: 'হাত ধোৱাটো পানীৰ দ্বাৰা বিয়পা ৰোগ প্ৰতিৰোধৰ সবচেয়ে ফলপ্ৰসু উপায়।',
        steps: [
          'পৰিষ্কাৰ, বৈ থকা পানীৰে হাত তিয়াওক',
          'চাবোন লগাই কমেও ২০ ছেকেণ্ড ভালদৰে ঘঁহক',
          'আঙুলিৰ মাজে মাজে, নখৰ তলত আৰু হাতৰ পিছফালো ঘঁহক',
          'বৈ থকা পানীৰে সম্পূৰ্ণভাৱে ধুই পেলাওক',
          'পৰিষ্কাৰ তোৱালেৰে মোহাৰক বা বায়ুত শুকাওক',
        ],
        keyMessage: 'খোৱাৰ আগে, শৌচালয় ব্যৱহাৰৰ পিছত আৰু জন্তু বা আৱৰ্জনা চম্ভালাৰ পিছত হাত ধোৱক।',
      },
    },
  },
  {
    id: 'safe-water',
    title: 'Safe Water Practices',
    icon: Droplets,
    color: 'bg-blue-50 text-blue-600',
    borderColor: 'border-blue-200',
    duration: '10 min',
    audience: 'Community',
    content: {
      en: {
        summary: 'Contaminated water is the primary cause of cholera, typhoid, and hepatitis A. Simple purification methods save lives.',
        steps: [
          'Boil water vigorously for at least 1 minute before drinking',
          'Use water purification tablets (Chlorine/Iodine) when boiling is not possible',
          'Store purified water in clean, covered containers',
          'Avoid collecting water downstream of settlements or latrines',
          'Report any change in water color, smell, or taste to ASHA workers immediately',
        ],
        keyMessage: 'When in doubt, boil it out. Never drink directly from open water sources during monsoon.',
      },
      as: {
        summary: 'দূষিত পানী কলেৰা, টাইফয়েড আৰু হেপাটাইটিছ-এ ৰোগৰ প্ৰধান কাৰণ।',
        steps: [
          'পানী খোৱাৰ আগে কমেও ১ মিনিট তীব্ৰভাৱে উতলাওক',
          'উতলোৱা সম্ভৱ নহলে পানী পৰিশোধন টেবলেট ব্যৱহাৰ কৰক',
          'পৰিশোধিত পানী পৰিষ্কাৰ, ঢাকা পাত্ৰত সংৰক্ষণ কৰক',
          'বাসস্থান বা শৌচালয়ৰ তলৰফালে পানী সংগ্ৰহ নকৰিব',
          'পানীৰ ৰং, গোন্ধ বা সোৱাদত পৰিৱৰ্তন হলে তৎক্ষণাৎ আশা কৰ্মীক জনাওক',
        ],
        keyMessage: 'সন্দেহ হলে উতলাওক। বৰষুণৰ সময়ত খোলা পানীৰ উৎসৰ পৰা পোনপটীয়াকৈ পানী নাখাব।',
      },
    },
  },
  {
    id: 'early-symptoms',
    title: 'Early Symptom Recognition',
    icon: AlertTriangle,
    color: 'bg-amber-50 text-amber-600',
    borderColor: 'border-amber-200',
    duration: '7 min',
    audience: 'ASHA Workers',
    content: {
      en: {
        summary: 'Early recognition of water-borne disease symptoms enables faster response and prevents outbreaks from spreading.',
        steps: [
          'Cholera: Sudden onset of watery diarrhea ("rice water stool"), vomiting, rapid dehydration — EMERGENCY',
          'Typhoid: High fever (above 39°C), headache, slow heart rate, rose-colored spots on chest',
          'Hepatitis A: Jaundice (yellow eyes/skin), dark urine, fatigue, nausea, abdominal pain',
          'Diarrhea/Gastroenteritis: Loose stools 3+ times per day, cramping, mild fever',
          'Any cluster of 3+ similar cases in the same area — REPORT IMMEDIATELY',
        ],
        keyMessage: 'Do not wait for laboratory confirmation. Report any suspected cluster to the PHC within 24 hours.',
      },
      as: {
        summary: 'পানীৰ দ্বাৰা বিয়পা ৰোগৰ লক্ষণসমূহ সোনকালে চিনাক্ত কৰিলে দ্ৰুত সঁহাৰি আৰু ৰোগ বিয়পা প্ৰতিৰোধ সম্ভৱ।',
        steps: [
          'কলেৰা: হঠাৎ পানীৰ দৰে পায়খানা ("চাউলৰ মাৰৰ দৰে"), বমি, দ্ৰুত পানীশূন্যতা — জৰুৰীকালীন',
          'টাইফয়েড: তীব্ৰ জ্বৰ (৩৯°C-ৰ ওপৰত), মূৰৰ বিষ, মন্থৰ হৃদস্পন্দন',
          'হেপাটাইটিছ-এ: জণ্ডিছ, গাঢ় প্ৰস্ৰাৱ, ক্লান্তি, ওকালি অহা',
          'ডায়েৰিয়া: দিনে ৩ বা ততোধিকবাৰ পাতল পায়খানা, পেটৰ বিষ',
          'একেটা এলেকাত ৩ বা ততোধিক একে ধৰণৰ ৰোগী — তৎক্ষণাৎ ৰিপোৰ্ট কৰক',
        ],
        keyMessage: 'পৰীক্ষাগাৰৰ নিশ্চিতকৰণৰ বাবে অপেক্ষা নকৰিব। সন্দেহজনক গোট ২৪ ঘণ্টাৰ ভিতৰত PHC-ক জনাওক।',
      },
    },
  },
  {
    id: 'outbreak-response',
    title: 'Outbreak Response Protocol',
    icon: FileText,
    color: 'bg-red-50 text-red-600',
    borderColor: 'border-red-200',
    duration: '15 min',
    audience: 'Health Officials',
    content: {
      en: {
        summary: 'A structured outbreak response reduces case fatality rates by up to 60%. Speed of initial response is the most critical factor.',
        steps: [
          'Hour 0–4: Verify the outbreak — confirm at least 3 linked cases with similar symptoms',
          'Hour 4–12: Notify Block Medical Officer and activate district outbreak response team',
          'Hour 12–24: Deploy RRT (Rapid Response Team), set up Oral Rehydration Centers',
          'Day 2–3: Water source investigation, collect samples for laboratory testing',
          'Day 3–7: Mass awareness campaign, door-to-door surveillance, targeted chlorination',
          'Ongoing: Daily case reporting via AquaGuard app, resource tracking, IEC activities',
        ],
        keyMessage: 'The first 24 hours determine the trajectory of any outbreak. Act before confirmation, not after.',
      },
      as: {
        summary: 'সংগঠিত প্ৰাদুৰ্ভাৱ সঁহাৰিয়ে মৃত্যুৰ হাৰ ৬০% পৰ্যন্ত হ্ৰাস কৰিব পাৰে।',
        steps: [
          '০-৪ ঘণ্টা: প্ৰাদুৰ্ভাৱ নিশ্চিত কৰক — একে লক্ষণযুক্ত কমেও ৩টা সংযুক্ত ঘটনা নিশ্চিত কৰক',
          '৪-১২ ঘণ্টা: ব্লক চিকিৎসা বিষয়াক জনাওক আৰু জিলা প্ৰাদুৰ্ভাৱ সঁহাৰি দল সক্ৰিয় কৰক',
          '১২-২৪ ঘণ্টা: RRT মোতায়েন কৰক, মৌখিক পুনৰৰুদনকাৰী কেন্দ্ৰ স্থাপন কৰক',
          '২-৩ দিন: পানীৰ উৎস তদন্ত, পৰীক্ষাগাৰ পৰীক্ষাৰ বাবে নমুনা সংগ্ৰহ',
          '৩-৭ দিন: গণ সচেতনতা অভিযান, দৰজাই দৰজাই নজৰদাৰি, লক্ষ্যভিত্তিক ক্লৰিনেচন',
        ],
        keyMessage: 'প্ৰথম ২৪ ঘণ্টাই যিকোনো প্ৰাদুৰ্ভাৱৰ গতিপথ নিৰ্ধাৰণ কৰে।',
      },
    },
  },
];

interface ModuleCardProps {
  module: typeof MODULES[0];
  lang: string;
}

function ModuleCard({ module, lang }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = module.icon;
  const content = (module.content as Record<string, typeof module.content.en>)[lang] ?? module.content.en;

  return (
    <div className={`bg-white rounded-xl border ${module.borderColor} transition-all hover:shadow-md`}>
      <div
        className="p-4 flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${module.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 text-sm">{module.title}</h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{module.audience}</span>
            <span className="text-xs text-slate-400">{module.duration}</span>
          </div>
          <p className="text-slate-500 text-xs mt-1 line-clamp-2">{content.summary}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-4">
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">{content.summary}</p>

          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2.5">Steps</p>
          <ol className="space-y-2.5">
            {content.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-slate-600 text-sm leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>

          <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-800 text-sm font-medium leading-relaxed">{content.keyMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Education() {
  const [selectedLang, setSelectedLang] = useState('en');

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-slate-900 font-semibold text-lg">Education & Awareness</h2>
          <p className="text-slate-400 text-sm">Hygiene modules and disease prevention resources in tribal languages</p>
        </div>
        {/* Language selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedLang}
            onChange={e => setSelectedLang(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {/* Language note */}
      {selectedLang !== 'en' && selectedLang !== 'as' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Full translation for this language is in progress. Showing English content.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Modules Available', value: MODULES.length, icon: BookOpen, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Languages Supported', value: 6, icon: Globe, color: 'bg-blue-100 text-blue-600' },
          { label: 'Target Audiences', value: 3, icon: FileText, color: 'bg-amber-100 text-amber-600' },
          { label: 'Offline Capable', value: 'Yes', icon: CheckCircle, color: 'bg-green-100 text-green-600' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">{s.label}</p>
                <p className="text-slate-900 font-bold text-lg">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modules */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900">Learning Modules</h3>
        {MODULES.map(m => (
          <ModuleCard key={m.id} module={m} lang={selectedLang} />
        ))}
      </div>

      {/* Offline notice */}
      <div className="bg-slate-900 rounded-xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Video className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Offline Mode</h3>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            All educational modules, including audio guides in tribal languages, are cached locally for offline use.
            This ensures ASHA workers and community volunteers can access critical health information even in areas
            without mobile data coverage — common across much of the NER terrain.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LANGUAGES.map(l => (
              <span key={l.code} className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
