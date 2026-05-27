/*
  # Smart Health Surveillance and Early Warning System - Initial Schema

  1. New Tables
    - `health_reports` - Community health reports from ASHA workers, clinics, volunteers
      - id, reporter_name, reporter_type, village, district, symptoms, disease_suspected, patient_count, severity, lat, lng, status, created_at
    - `water_quality_readings` - Water quality sensor/manual test data
      - id, source_name, source_type, village, district, ph_level, turbidity, bacterial_presence, nitrate_level, overall_status, lat, lng, recorded_at
    - `outbreaks` - Detected or predicted outbreak events
      - id, disease_name, district, village, severity, status, case_count, predicted, confidence_score, started_at, resolved_at
    - `alerts` - Alerts sent to health officials and local leaders
      - id, outbreak_id, alert_type, severity, message, target_audience, acknowledged, sent_at
    - `interventions` - Recorded interventions and resource allocations
      - id, outbreak_id, intervention_type, description, resources_deployed, status, created_at, completed_at

  2. Security
    - Enable RLS on all tables
    - Public read for dashboards (demo context - all users can view aggregate data)
    - Authenticated users can insert reports and readings
*/

-- Health Reports Table
CREATE TABLE IF NOT EXISTS health_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name text NOT NULL DEFAULT '',
  reporter_type text NOT NULL DEFAULT 'volunteer',
  village text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT 'Assam',
  symptoms text[] DEFAULT '{}',
  disease_suspected text DEFAULT '',
  patient_count integer DEFAULT 1,
  severity text NOT NULL DEFAULT 'low',
  lat numeric(10,6),
  lng numeric(10,6),
  status text NOT NULL DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read health reports"
  ON health_reports FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert health reports"
  ON health_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update health reports"
  ON health_reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Water Quality Readings Table
CREATE TABLE IF NOT EXISTS water_quality_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL DEFAULT '',
  source_type text NOT NULL DEFAULT 'well',
  village text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT 'Assam',
  ph_level numeric(4,2),
  turbidity numeric(8,2),
  bacterial_presence boolean DEFAULT false,
  nitrate_level numeric(8,2),
  overall_status text NOT NULL DEFAULT 'safe',
  lat numeric(10,6),
  lng numeric(10,6),
  recorded_by text DEFAULT '',
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE water_quality_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read water quality readings"
  ON water_quality_readings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert water quality readings"
  ON water_quality_readings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Outbreaks Table
CREATE TABLE IF NOT EXISTS outbreaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_name text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  village text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT 'Assam',
  severity text NOT NULL DEFAULT 'low',
  status text NOT NULL DEFAULT 'monitoring',
  case_count integer DEFAULT 0,
  predicted boolean DEFAULT false,
  confidence_score numeric(5,2) DEFAULT 0,
  lat numeric(10,6),
  lng numeric(10,6),
  started_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE outbreaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read outbreaks"
  ON outbreaks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert outbreaks"
  ON outbreaks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update outbreaks"
  ON outbreaks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outbreak_id uuid REFERENCES outbreaks(id) ON DELETE SET NULL,
  alert_type text NOT NULL DEFAULT 'warning',
  severity text NOT NULL DEFAULT 'medium',
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  district text DEFAULT '',
  target_audience text[] DEFAULT '{}',
  acknowledged boolean DEFAULT false,
  sent_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read alerts"
  ON alerts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert alerts"
  ON alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Interventions Table
CREATE TABLE IF NOT EXISTS interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outbreak_id uuid REFERENCES outbreaks(id) ON DELETE SET NULL,
  intervention_type text NOT NULL DEFAULT '',
  description text DEFAULT '',
  resources_deployed text DEFAULT '',
  district text DEFAULT '',
  village text DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read interventions"
  ON interventions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert interventions"
  ON interventions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update interventions"
  ON interventions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed sample data for the NER (Northeastern Region)
INSERT INTO outbreaks (disease_name, district, village, state, severity, status, case_count, predicted, confidence_score, lat, lng) VALUES
  ('Cholera', 'Kamrup', 'Hajo', 'Assam', 'high', 'active', 23, false, 0, 26.2440, 91.5290),
  ('Typhoid', 'Dibrugarh', 'Naharkatia', 'Assam', 'medium', 'monitoring', 11, false, 0, 27.2874, 95.3413),
  ('Diarrhea', 'Nagaon', 'Kaliabor', 'Assam', 'low', 'monitoring', 7, false, 0, 26.4465, 92.9502),
  ('Hepatitis A', 'Bongaigaon', 'Sidli', 'Assam', 'medium', 'active', 15, false, 0, 26.4758, 90.5590),
  ('Cholera', 'East Khasi Hills', 'Mawphlang', 'Meghalaya', 'high', 'predicted', 0, true, 87.5, 25.4670, 91.7870);

INSERT INTO water_quality_readings (source_name, source_type, village, district, state, ph_level, turbidity, bacterial_presence, nitrate_level, overall_status, lat, lng, recorded_by) VALUES
  ('Brahmaputra Intake Point 3', 'river', 'Hajo', 'Kamrup', 'Assam', 6.2, 48.5, true, 12.3, 'critical', 26.2440, 91.5290, 'District Water Inspector'),
  ('Community Borewell BW-14', 'borewell', 'Naharkatia', 'Dibrugarh', 'Assam', 7.1, 8.2, false, 5.1, 'safe', 27.2874, 95.3413, 'ASHA Worker Priya'),
  ('Open Well OW-7', 'open_well', 'Kaliabor', 'Nagaon', 'Assam', 6.8, 22.1, true, 9.8, 'warning', 26.4465, 92.9502, 'Village Volunteer'),
  ('Pond Source PS-2', 'pond', 'Sidli', 'Bongaigaon', 'Assam', 5.9, 65.3, true, 18.7, 'critical', 26.4758, 90.5590, 'ASHA Worker Rekha'),
  ('Mountain Spring MS-1', 'spring', 'Mawphlang', 'East Khasi Hills', 'Meghalaya', 7.4, 4.1, false, 2.3, 'safe', 25.4670, 91.7870, 'District Health Officer');

INSERT INTO health_reports (reporter_name, reporter_type, village, district, state, symptoms, disease_suspected, patient_count, severity, lat, lng, status) VALUES
  ('Dr. Anjali Bora', 'clinic', 'Hajo', 'Kamrup', 'Assam', ARRAY['diarrhea','vomiting','dehydration'], 'Cholera', 8, 'high', 26.2440, 91.5290, 'confirmed'),
  ('ASHA Sunita Devi', 'asha_worker', 'Naharkatia', 'Dibrugarh', 'Assam', ARRAY['fever','headache','abdominal_pain'], 'Typhoid', 4, 'medium', 27.2874, 95.3413, 'pending'),
  ('Volunteer Ramesh', 'volunteer', 'Kaliabor', 'Nagaon', 'Assam', ARRAY['diarrhea','nausea'], 'Diarrhea', 3, 'low', 26.4465, 92.9502, 'confirmed'),
  ('CHC Sidli', 'clinic', 'Sidli', 'Bongaigaon', 'Assam', ARRAY['jaundice','fatigue','nausea'], 'Hepatitis A', 6, 'medium', 26.4758, 90.5590, 'confirmed'),
  ('ASHA Meena Basumatary', 'asha_worker', 'Jorhat Town', 'Jorhat', 'Assam', ARRAY['fever','diarrhea'], 'Diarrhea', 2, 'low', 26.7509, 94.2037, 'pending');

INSERT INTO alerts (alert_type, severity, title, message, district, target_audience, acknowledged) VALUES
  ('outbreak', 'critical', 'Cholera Outbreak Confirmed - Kamrup', 'Cholera outbreak confirmed in Hajo village, Kamrup district. 23 cases reported. Immediate intervention required. Deploy ORS kits and water purification tablets.', 'Kamrup', ARRAY['district_health_officer','block_medical_officer','local_governance'], false),
  ('water_quality', 'high', 'Water Contamination Alert - Sidli', 'Critical water contamination detected at Pond Source PS-2 in Sidli. Bacterial presence confirmed. Community advised to boil water before use.', 'Bongaigaon', ARRAY['district_health_officer','local_governance','community'], false),
  ('prediction', 'high', 'AI Prediction: Cholera Risk - Meghalaya', 'AI model predicts 87.5% probability of Cholera outbreak in Mawphlang, East Khasi Hills within 7 days. Pre-emptive measures recommended.', 'East Khasi Hills', ARRAY['state_health_authority','district_health_officer'], false),
  ('water_quality', 'medium', 'Elevated Turbidity - Kaliabor', 'Water turbidity above safe limits at Open Well OW-7, Kaliabor. Bacterial contamination detected. Water quality monitoring intensified.', 'Nagaon', ARRAY['district_health_officer','community'], true);
