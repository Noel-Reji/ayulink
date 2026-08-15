export type UserRole = 'doctor' | 'pharmacy' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface DoctorProfile {
  doctor_id: string;
  specialization: string;
  license_number: string;
}

export interface PharmacyProfile {
  pharmacy_id: string;
  name: string;
  address: string;
}

export interface PatientProfile {
  patient_id: string;
  name: string;
  date_of_birth: string;
}

export type RoleProfile = DoctorProfile | PharmacyProfile | PatientProfile | { role: UserRole };

export interface AuthState {
  user: User | null;
  token: string | null;
  roleProfile: any | null;
}

export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  strength: string;
  dosage_form: string;
  rxcui?: string;
  prescription_required: boolean;
}

export type AvailabilityStatus = 'available' | 'unavailable' | 'uncertain';

export interface PublicPharmacyAvailability {
  pharmacy_id: string;
  pharmacy_name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  availability_status: AvailabilityStatus;
  last_updated: string;
}

export interface InternalInventoryItem {
  id: string;
  pharmacy_id: string;
  medicine_id: string;
  medicine: Medicine;
  availability_status: AvailabilityStatus;
  internal_stock_quantity: number;
  last_updated: string;
}

export type PrescriptionStatus = 
  | 'draft' 
  | 'sent' 
  | 'received' 
  | 'unavailable' 
  | 'doctor_review' 
  | 'resolved' 
  | 'completed' 
  | 'cancelled';

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medicine_id: string;
  medicine: Medicine;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionItemCreateInput {
  medicine_id: string;
  medicine_name?: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  doctor_id: string;
  doctor_name?: string;
  doctor_specialization?: string;
  patient_id: string;
  patient_name?: string;
  pharmacy_id?: string;
  pharmacy_name?: string;
  status: PrescriptionStatus;
  notes?: string;
  resolution_notes?: string;
  items: PrescriptionItem[];
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  recipient_user_id: string;
  prescription_id?: string;
  type: 'prescription_received' | 'medicine_unavailable' | 'doctor_response' | 'safety_alert' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DemandMetric {
  id: string;
  medicine_id: string;
  medicine_name: string;
  generic_name: string;
  strength: string;
  area: string;
  search_count: number;
  prescription_count: number;
  availability_percentage: number;
  demand_score: number;
  demand_level: 'Low' | 'Medium' | 'High';
  supply_gap_detected: boolean;
  calculated_at: string;
}

export interface SafetyAlert {
  level: 'warning' | 'info' | 'caution';
  title: string;
  description: string;
  recommendation: string;
  source: string;
  physician_confirmation_required: boolean;
}

export interface SafetyCheckResponse {
  has_alerts: boolean;
  alerts: SafetyAlert[];
  disclaimer: string;
}

export interface HistorySummaryResponse {
  patient_name: string;
  prescription_count: number;
  timeline_summary: string;
  timeline_entries?: string[];
  key_medications: string[];
  disclaimer: string;
}

export interface PosSyncResponse {
  last_synchronization: string;
  medicines_processed: number;
  updated: number;
  unavailable: number;
  status: string;
  message: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  user_id: string;
}

export interface Patient {
  id: string;
  user_id: string;
  name: string;
  date_of_birth: string;
  email?: string;
}
