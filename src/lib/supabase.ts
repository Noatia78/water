import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ReporterType = 'asha_worker' | 'clinic' | 'volunteer' | 'community';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type WaterStatus = 'safe' | 'warning' | 'critical';
export type OutbreakStatus = 'monitoring' | 'active' | 'predicted' | 'resolved';
export type AlertType = 'outbreak' | 'water_quality' | 'prediction' | 'informational';

export interface HealthReport {
  id: string;
  reporter_name: string;
  reporter_type: ReporterType;
  village: string;
  district: string;
  state: string;
  symptoms: string[];
  disease_suspected: string;
  patient_count: number;
  severity: Severity;
  lat: number | null;
  lng: number | null;
  status: string;
  notes: string;
  created_at: string;
}

export interface WaterQualityReading {
  id: string;
  source_name: string;
  source_type: string;
  village: string;
  district: string;
  state: string;
  ph_level: number | null;
  turbidity: number | null;
  bacterial_presence: boolean;
  nitrate_level: number | null;
  overall_status: WaterStatus;
  lat: number | null;
  lng: number | null;
  recorded_by: string;
  recorded_at: string;
}

export interface Outbreak {
  id: string;
  disease_name: string;
  district: string;
  village: string;
  state: string;
  severity: Severity;
  status: OutbreakStatus;
  case_count: number;
  predicted: boolean;
  confidence_score: number;
  lat: number | null;
  lng: number | null;
  started_at: string;
  resolved_at: string | null;
  created_at: string;
}

export interface Alert {
  id: string;
  outbreak_id: string | null;
  alert_type: AlertType;
  severity: Severity;
  title: string;
  message: string;
  district: string;
  target_audience: string[];
  acknowledged: boolean;
  sent_at: string;
}

export interface Intervention {
  id: string;
  outbreak_id: string | null;
  intervention_type: string;
  description: string;
  resources_deployed: string;
  district: string;
  village: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}
