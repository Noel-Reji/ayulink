import type {
  InternalInventoryItem,
  Prescription,
  Notification,
  DemandMetric,
  PublicPharmacyAvailability,
  SafetyAlert
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2-second timeout before falling back

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetail = 'API Request Failed';
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || errorDetail;
      } catch {
        // fallback
      }
      throw new Error(errorDetail);
    }
    return response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ----------------------------------------------------
// In-Browser State Fallback (For Mobile & Cloud Hosting)
// ----------------------------------------------------
const FALLBACK_MEDICINES = [
  { id: "med-1", name: "Amoxicillin 500 mg", generic_name: "Amoxicillin", strength: "500 mg", dosage_form: "Capsule", rxcui: "213169", prescription_required: true },
  { id: "med-2", name: "Paracetamol 500 mg", generic_name: "Paracetamol", strength: "500 mg", dosage_form: "Tablet", rxcui: "209387", prescription_required: false },
  { id: "med-3", name: "Augmentin 625 mg", generic_name: "Amoxicillin and Clavulanate Potassium", strength: "625 mg", dosage_form: "Tablet", rxcui: "213269", prescription_required: true },
  { id: "med-4", name: "ORS (Oral Rehydration Salts)", generic_name: "Oral Electrolytes", strength: "21.8 g", dosage_form: "Sachet", rxcui: "847232", prescription_required: false },
  { id: "med-5", name: "Azithromycin 500 mg", generic_name: "Azithromycin", strength: "500 mg", dosage_form: "Tablet", rxcui: "248656", prescription_required: true },
  { id: "med-6", name: "Cetirizine 10 mg", generic_name: "Cetirizine", strength: "10 mg", dosage_form: "Tablet", rxcui: "310344", prescription_required: false },
  { id: "med-7", name: "Pantoprazole 40 mg", generic_name: "Pantoprazole", strength: "40 mg", dosage_form: "Tablet", rxcui: "284635", prescription_required: true },
  { id: "med-8", name: "Metformin 500 mg", generic_name: "Metformin", strength: "500 mg", dosage_form: "Tablet", rxcui: "860975", prescription_required: true },
  { id: "med-9", name: "Ibuprofen 400 mg", generic_name: "Ibuprofen", strength: "400 mg", dosage_form: "Tablet", rxcui: "197806", prescription_required: false },
  { id: "med-10", name: "Diclofenac 50 mg", generic_name: "Diclofenac", strength: "50 mg", dosage_form: "Tablet", rxcui: "200345", prescription_required: true },
  { id: "med-11", name: "Atorvastatin 20 mg", generic_name: "Atorvastatin", strength: "20 mg", dosage_form: "Tablet", rxcui: "259255", prescription_required: true },
];

const FALLBACK_PATIENTS = [
  { id: "pat-1", user_id: "usr-pat-1", name: "Rahul Krishnan", date_of_birth: "1994-05-18", email: "patient@ayulink.demo" },
  { id: "pat-2", user_id: "usr-pat-2", name: "Anjali Thomas", date_of_birth: "1988-11-23", email: "anjali@ayulink.demo" },
];

const FALLBACK_PHARMACIES = [
  { id: "pharm-1", user_id: "usr-pharm-1", name: "CarePlus Pharmacy", address: "Round North, Thrissur, Kerala", latitude: 10.5276, longitude: 76.2144 },
  { id: "pharm-2", user_id: "usr-pharm-2", name: "GreenCare Pharmacy", address: "MG Road, Thrissur, Kerala", latitude: 10.5220, longitude: 76.2180 },
  { id: "pharm-3", user_id: "usr-pharm-3", name: "Medico Pharmacy", address: "Swaraj Round West, Thrissur, Kerala", latitude: 10.5250, longitude: 76.2100 },
  { id: "pharm-4", user_id: "usr-pharm-4", name: "CityMed Pharmacy", address: "East Fort Junction, Thrissur, Kerala", latitude: 10.5290, longitude: 76.2230 },
];

const FALLBACK_INVENTORY: InternalInventoryItem[] = [
  { id: "inv-1", pharmacy_id: "pharm-1", medicine_id: "med-1", medicine: FALLBACK_MEDICINES[0], availability_status: "unavailable", internal_stock_quantity: 0, last_updated: new Date().toISOString() },
  { id: "inv-2", pharmacy_id: "pharm-1", medicine_id: "med-2", medicine: FALLBACK_MEDICINES[1], availability_status: "available", internal_stock_quantity: 45, last_updated: new Date().toISOString() },
  { id: "inv-3", pharmacy_id: "pharm-1", medicine_id: "med-3", medicine: FALLBACK_MEDICINES[2], availability_status: "available", internal_stock_quantity: 25, last_updated: new Date().toISOString() },
  { id: "inv-4", pharmacy_id: "pharm-1", medicine_id: "med-4", medicine: FALLBACK_MEDICINES[3], availability_status: "available", internal_stock_quantity: 12, last_updated: new Date().toISOString() },
  { id: "inv-5", pharmacy_id: "pharm-2", medicine_id: "med-1", medicine: FALLBACK_MEDICINES[0], availability_status: "available", internal_stock_quantity: 22, last_updated: new Date().toISOString() },
  { id: "inv-6", pharmacy_id: "pharm-2", medicine_id: "med-2", medicine: FALLBACK_MEDICINES[1], availability_status: "available", internal_stock_quantity: 60, last_updated: new Date().toISOString() },
  { id: "inv-7", pharmacy_id: "pharm-2", medicine_id: "med-4", medicine: FALLBACK_MEDICINES[3], availability_status: "unavailable", internal_stock_quantity: 0, last_updated: new Date().toISOString() },
];

const FALLBACK_PRESCRIPTIONS: Prescription[] = [
  {
    id: "rx-demo-init",
    doctor_id: "doc-1",
    doctor_name: "Dr. Arun Menon",
    doctor_specialization: "General Medicine",
    patient_id: "pat-1",
    patient_name: "Rahul Krishnan",
    pharmacy_id: "pharm-1",
    pharmacy_name: "CarePlus Pharmacy",
    status: "received",
    notes: "Suspected upper respiratory bacterial infection. Prescribing first-line Amoxicillin.",
    items: [
      { id: "item-init-1", prescription_id: "rx-demo-init", medicine_id: "med-1", medicine: FALLBACK_MEDICINES[0], dose: "1 capsule", frequency: "Twice daily", duration: "5 days", instructions: "Take after meals with water." }
    ],
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60000).toISOString(),
  }
];

const FALLBACK_DEMAND: DemandMetric[] = [
  { id: "dm-1", medicine_id: "med-4", medicine_name: "ORS (Oral Rehydration Salts)", generic_name: "Oral Electrolytes", strength: "21.8 g", area: "Thrissur Metro Area", search_count: 142, prescription_count: 67, availability_percentage: 46.0, demand_score: 84.5, demand_level: "High", supply_gap_detected: true, calculated_at: new Date().toISOString() },
  { id: "dm-2", medicine_id: "med-1", medicine_name: "Amoxicillin 500 mg", generic_name: "Amoxicillin", strength: "500 mg", area: "Thrissur Metro Area", search_count: 95, prescription_count: 48, availability_percentage: 60.0, demand_score: 72.0, demand_level: "Medium", supply_gap_detected: false, calculated_at: new Date().toISOString() },
  { id: "dm-3", medicine_id: "med-2", medicine_name: "Paracetamol 500 mg", generic_name: "Paracetamol", strength: "500 mg", area: "Thrissur Metro Area", search_count: 210, prescription_count: 115, availability_percentage: 88.0, demand_score: 78.0, demand_level: "High", supply_gap_detected: false, calculated_at: new Date().toISOString() },
  { id: "dm-4", medicine_id: "med-5", medicine_name: "Azithromycin 500 mg", generic_name: "Azithromycin", strength: "500 mg", area: "Thrissur Metro Area", search_count: 62, prescription_count: 30, availability_percentage: 75.0, demand_score: 52.0, demand_level: "Medium", supply_gap_detected: false, calculated_at: new Date().toISOString() },
];

function getLocalState<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`ayulink_fb_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalState(key: string, data: any) {
  try {
    localStorage.setItem(`ayulink_fb_${key}`, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    try {
      return await request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch {
      // Instant Client-Side Fallback for Phones & Cloud
      const email = credentials.email.toLowerCase();
      if (email.includes('doctor') || email.includes('arun') || email.includes('priya')) {
        return {
          user: { id: "usr-doc-1", name: "Dr. Arun Menon", email: "doctor@ayulink.demo", role: "doctor", created_at: new Date().toISOString() },
          token: "demo-jwt-doc-token",
          role_profile: { role: "doctor", doctor_id: "doc-1", specialization: "General Medicine", license_number: "MED-KL-2018-9482" }
        };
      } else if (email.includes('pharmacy') || email.includes('careplus') || email.includes('greencare')) {
        return {
          user: { id: "usr-pharm-1", name: "CarePlus Pharmacy", email: "pharmacy@ayulink.demo", role: "pharmacy", created_at: new Date().toISOString() },
          token: "demo-jwt-pharm-token",
          role_profile: { role: "pharmacy", pharmacy_id: "pharm-1", name: "CarePlus Pharmacy", address: "Round North, Thrissur, Kerala" }
        };
      } else {
        return {
          user: { id: "usr-pat-1", name: "Rahul Krishnan", email: "patient@ayulink.demo", role: "patient", created_at: new Date().toISOString() },
          token: "demo-jwt-pat-token",
          role_profile: { role: "patient", patient_id: "pat-1", name: "Rahul Krishnan", date_of_birth: "1994-05-18" }
        };
      }
    }
  },

  getDemoAccounts: async () => {
    try {
      return await request<any[]>('/auth/demo-accounts');
    } catch {
      return [
        { role: "doctor", name: "Dr. Arun Menon", email: "doctor@ayulink.demo", password: "demo123", desc: "General Physician" },
        { role: "pharmacy", name: "CarePlus Pharmacy", email: "pharmacy@ayulink.demo", password: "demo123", desc: "Local Pharmacy" },
        { role: "patient", name: "Rahul Krishnan", email: "patient@ayulink.demo", password: "demo123", desc: "Patient" }
      ];
    }
  },

  // Doctors
  getDoctorDashboard: async (doctorId: string) => {
    try {
      return await request<any>(`/doctors/dashboard?doctor_id=${doctorId}`);
    } catch {
      const rxs = getLocalState<Prescription[]>('rxs', FALLBACK_PRESCRIPTIONS);
      const pending = rxs.filter(r => r.status === 'unavailable' || r.status === 'doctor_review');
      return {
        doctor_name: "Dr. Arun Menon",
        specialization: "General Medicine",
        license_number: "MED-KL-2018-9482",
        total_prescriptions: rxs.length,
        pending_responses_count: pending.length,
        active_prescriptions_count: rxs.filter(r => r.status === 'sent' || r.status === 'received' || r.status === 'resolved').length,
        patients_count: 2,
        pending_prescriptions: pending,
        recent_prescriptions: rxs.slice(0, 5),
        notifications: getLocalState<Notification[]>('notifs', [])
      };
    }
  },

  getDoctorTemplates: async (doctorId: string) => {
    try {
      return await request<any[]>(`/doctors/templates?doctor_id=${doctorId}`);
    } catch {
      return [
        {
          id: "tpl-1",
          name: "Upper Respiratory Tract Protocol",
          specialization: "General Medicine",
          items: [
            { medicine_name: "Amoxicillin 500 mg", dose: "1 capsule", frequency: "Twice daily", duration: "5 days", instructions: "Take after meals with water" }
          ]
        },
        {
          id: "tpl-2",
          name: "Acid Reflux / Gastric Protocol",
          specialization: "General Medicine",
          items: [
            { medicine_name: "Pantoprazole 40 mg", dose: "1 tablet", frequency: "Once daily", duration: "7 days", instructions: "Take empty stomach before breakfast" }
          ]
        }
      ];
    }
  },

  // Patients
  getPatients: async () => {
    try {
      return await request<any[]>('/patients');
    } catch {
      return FALLBACK_PATIENTS;
    }
  },

  getPatient: async (patientId: string) => {
    try {
      return await request<any>(`/patients/${patientId}`);
    } catch {
      const p = FALLBACK_PATIENTS.find(pt => pt.id === patientId);
      return p || FALLBACK_PATIENTS[0];
    }
  },

  getPatientPrescriptions: async (patientId: string) => {
    try {
      return await request<any[]>(`/patients/${patientId}/prescriptions`);
    } catch {
      const rxs = getLocalState<Prescription[]>('rxs', FALLBACK_PRESCRIPTIONS);
      return rxs.filter(r => r.patient_id === patientId || r.patient_name.includes("Rahul"));
    }
  },

  // Pharmacies
  getPharmacies: async () => {
    try {
      return await request<any[]>('/pharmacies');
    } catch {
      return FALLBACK_PHARMACIES;
    }
  },

  getPharmacyDashboard: async (pharmacyId: string) => {
    try {
      return await request<any>(`/pharmacies/${pharmacyId}/dashboard`);
    } catch {
      const rxs = getLocalState<Prescription[]>('rxs', FALLBACK_PRESCRIPTIONS);
      const incoming = rxs.filter(p => p.status === 'sent' || p.status === 'received');
      return {
        pharmacy_name: "CarePlus Pharmacy",
        address: "Round North, Thrissur, Kerala",
        incoming_count: incoming.length,
        pending_doctor_count: rxs.filter(p => p.status === 'unavailable' || p.status === 'doctor_review').length,
        resolved_count: rxs.filter(p => p.status === 'resolved').length,
        completed_count: rxs.filter(p => p.status === 'completed').length,
        low_availability_count: 1,
        incoming_prescriptions: rxs,
        notifications: getLocalState<Notification[]>('notifs', [])
      };
    }
  },

  getPharmacyInventory: async (pharmacyId: string) => {
    try {
      return await request<any[]>(`/pharmacies/${pharmacyId}/inventory`);
    } catch {
      const inv = getLocalState<InternalInventoryItem[]>('inv', FALLBACK_INVENTORY);
      return inv.filter(i => i.pharmacy_id === pharmacyId || pharmacyId === "pharm-1");
    }
  },

  // Medicines
  searchMedicines: async (query?: string) => {
    try {
      return await request<any[]>(`/medicines${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    } catch {
      if (!query) return FALLBACK_MEDICINES;
      const q = query.toLowerCase();
      return FALLBACK_MEDICINES.filter(m => m.name.toLowerCase().includes(q) || m.generic_name.toLowerCase().includes(q));
    }
  },

  getMedicineAvailability: async (medicineId: string, location?: string) => {
    try {
      return await request<any[]>(`/medicines/${medicineId}/availability?coarse_location=${encodeURIComponent(location || 'Thrissur Metro Area')}`);
    } catch {
      const inv = getLocalState<InternalInventoryItem[]>('inv', FALLBACK_INVENTORY);
      const matched = inv.filter(i => i.medicine_id === medicineId);
      const res: PublicPharmacyAvailability[] = matched.map(i => {
        const ph = FALLBACK_PHARMACIES.find(p => p.id === i.pharmacy_id);
        return {
          pharmacy_id: i.pharmacy_id,
          pharmacy_name: ph ? ph.name : "CarePlus Pharmacy",
          address: ph ? ph.address : "Thrissur, Kerala",
          latitude: ph ? ph.latitude : 10.5276,
          longitude: ph ? ph.longitude : 76.2144,
          availability_status: i.availability_status,
          last_updated: i.last_updated
        };
      });

      if (res.length === 0) {
        return [
          { pharmacy_id: "pharm-1", pharmacy_name: "CarePlus Pharmacy", address: "Round North, Thrissur, Kerala", latitude: 10.5276, longitude: 76.2144, availability_status: "available", last_updated: new Date().toISOString() },
          { pharmacy_id: "pharm-2", pharmacy_name: "GreenCare Pharmacy", address: "MG Road, Thrissur, Kerala", latitude: 10.5220, longitude: 76.2180, availability_status: "available", last_updated: new Date().toISOString() }
        ];
      }
      return res;
    }
  },

  // Prescriptions
  createPrescription: async (payload: any, doctorId?: string) => {
    try {
      return await request<any>(`/prescriptions${doctorId ? `?doctor_id=${doctorId}` : ''}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const rxs = getLocalState<Prescription[]>('rxs', FALLBACK_PRESCRIPTIONS);
      const pat = FALLBACK_PATIENTS.find(p => p.id === payload.patient_id) || FALLBACK_PATIENTS[0];
      const ph = FALLBACK_PHARMACIES.find(p => p.id === payload.pharmacy_id) || FALLBACK_PHARMACIES[0];

      const newItems = payload.items.map((it: any, idx: number) => {
        const med = FALLBACK_MEDICINES.find(m => m.id === it.medicine_id) || FALLBACK_MEDICINES[0];
        return {
          id: `item-${Date.now()}-${idx}`,
          prescription_id: `rx-${Date.now()}`,
          medicine_id: med.id,
          medicine: med,
          dose: it.dose,
          frequency: it.frequency,
          duration: it.duration,
          instructions: it.instructions
        };
      });

      const newRx: Prescription = {
        id: `rx-${Date.now()}`,
        doctor_id: doctorId || "doc-1",
        doctor_name: "Dr. Arun Menon",
        doctor_specialization: "General Medicine",
        patient_id: payload.patient_id,
        patient_name: pat.name,
        pharmacy_id: payload.pharmacy_id,
        pharmacy_name: ph.name,
        status: payload.pharmacy_id ? "received" : "draft",
        notes: payload.notes,
        items: newItems,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      rxs.unshift(newRx);
      setLocalState('rxs', rxs);
      return newRx;
    }
  },

  getPrescriptions: async (filters: { doctor_id?: string; pharmacy_id?: string; patient_id?: string; status?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filters.doctor_id) params.append('doctor_id', filters.doctor_id);
      if (filters.pharmacy_id) params.append('pharmacy_id', filters.pharmacy_id);
      if (filters.patient_id) params.append('patient_id', filters.patient_id);
      if (filters.status) params.append('status', filters.status);
      return await request<any[]>(`/prescriptions?${params.toString()}`);
    } catch {
      const rxs = getLocalState<Prescription[]>('rxs', FALLBACK_PRESCRIPTIONS);
      return rxs.filter(p => {
        if (filters.doctor_id && p.doctor_id !== filters.doctor_id) return false;
        if (filters.pharmacy_id && p.pharmacy_id !== filters.pharmacy_id) return false;
        if (filters.patient_id && p.patient_id !== filters.patient_id) return false;
        if (filters.status && p.status !== filters.status) return false;
        return true;
      });
    }
  },

  getPrescription: async (id: string) => {
    try {
      return await request<any>(`/prescriptions/${id}`);
    } catch {
      const rxs = getLocalState<Prescription[]>('rxs', FALLBACK_PRESCRIPTIONS);
      return rxs.find(r => r.id === id) || rxs[0];
    }
  },

  sendPrescription: async (id: string, pharmacyId: string) => {
    try {
      return await request<any>(`/prescriptions/${id}/send?pharmacy_id=${pharmacyId}`, {
        method: 'POST',
      });
    } catch {
      const rxs = getLocalState<Prescription[]>('rxs', FALLBACK_PRESCRIPTIONS);
      const rx = rxs.find(r => r.id === id);
      if (rx) {
        rx.pharmacy_id = pharmacyId;
        rx.status = "received";
        setLocalState('rxs', rxs);
      }
      return rx;
    }
  },

  markPrescriptionUnavailable: async (id: string, notes?: string) => {
    try {
      return await request<any>(`/prescriptions/${id}/unavailable`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      });
    } catch {
      const rxs = getLocalState<Prescription[]>('rxs', FALLBACK_PRESCRIPTIONS);
      const rx = rxs.find(r => r.id === id);
      if (rx) {
        rx.status = "unavailable";
        rx.updated_at = new Date().toISOString();
        setLocalState('rxs', rxs);

        // Add doctor notification
        const notifs = getLocalState<Notification[]>('notifs', []);
        notifs.unshift({
          id: `notif-${Date.now()}`,
          recipient_user_id: "usr-doc-1",
          prescription_id: rx.id,
          type: "medicine_unavailable",
          title: "Pharmacy Availability Alert: Action Required",
          message: `${rx.pharmacy_name} reported that prescribed medicine is out of stock for ${rx.patient_name}. Clinician resolution required.`,
          is_read: false,
          created_at: new Date().toISOString()
        });
        setLocalState('notifs', notifs);
      }
      return rx;
    }
  },

  doctorResolvePrescription: async (id: string, payload: any) => {
    try {
      return await request<any>(`/prescriptions/${id}/doctor-response`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const rxs = getLocalState<Prescription[]>('rxs', FALLBACK_PRESCRIPTIONS);
      const rx = rxs.find(r => r.id === id);
      if (rx) {
        rx.status = "resolved";
        rx.resolution_notes = payload.resolution_notes;
        rx.updated_at = new Date().toISOString();

        if (payload.updated_medicine_id && rx.items.length > 0) {
          const subMed = FALLBACK_MEDICINES.find(m => m.id === payload.updated_medicine_id) || FALLBACK_MEDICINES[2];
          rx.items[0].medicine = subMed;
          rx.items[0].medicine_id = subMed.id;
          if (payload.updated_dose) rx.items[0].dose = payload.updated_dose;
          if (payload.updated_frequency) rx.items[0].frequency = payload.updated_frequency;
          if (payload.updated_duration) rx.items[0].duration = payload.updated_duration;
        }
        setLocalState('rxs', rxs);
      }
      return rx;
    }
  },

  completePrescription: async (id: string) => {
    try {
      return await request<any>(`/prescriptions/${id}/complete`, {
        method: 'POST',
      });
    } catch {
      const rxs = getLocalState<Prescription[]>('rxs', FALLBACK_PRESCRIPTIONS);
      const rx = rxs.find(r => r.id === id);
      if (rx) {
        rx.status = "completed";
        rx.updated_at = new Date().toISOString();
        setLocalState('rxs', rxs);
      }
      return rx;
    }
  },

  // Inventory
  updateInventoryStatus: async (id: string, availabilityStatus: string, stock?: number) => {
    try {
      return await request<any>(`/inventory/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          availability_status: availabilityStatus,
          internal_stock_quantity: stock,
        }),
      });
    } catch {
      const inv = getLocalState<InternalInventoryItem[]>('inv', FALLBACK_INVENTORY);
      const item = inv.find(i => i.id === id);
      if (item) {
        item.availability_status = availabilityStatus as any;
        item.last_updated = new Date().toISOString();
        setLocalState('inv', inv);
      }
      return item;
    }
  },

  syncInventory: async (pharmacyId: string) => {
    try {
      return await request<any>(`/inventory/sync?pharmacy_id=${pharmacyId}`, {
        method: 'POST',
      });
    } catch {
      const inv = getLocalState<InternalInventoryItem[]>('inv', FALLBACK_INVENTORY);
      return {
        last_synchronization: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        medicines_processed: inv.length,
        updated: inv.filter(i => i.availability_status === 'available').length,
        unavailable: inv.filter(i => i.availability_status === 'unavailable').length,
        status: "success",
        message: "POS/ERP simulated sync cycle complete."
      };
    }
  },

  // Notifications
  getNotifications: async (userId: string, unreadOnly: boolean = false) => {
    try {
      return await request<any[]>(`/notifications?user_id=${userId}${unreadOnly ? '&unread_only=true' : ''}`);
    } catch {
      const notifs = getLocalState<Notification[]>('notifs', []);
      return unreadOnly ? notifs.filter(n => !n.is_read) : notifs;
    }
  },

  markNotificationRead: async (id: string) => {
    try {
      return await request<any>(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
    } catch {
      return { id, is_read: true };
    }
  },

  markAllNotificationsRead: async (userId: string) => {
    try {
      return await request<any>(`/notifications/mark-all-read?user_id=${userId}`, {
        method: 'POST',
      });
    } catch {
      return { status: "success", message: "All notifications marked as read" };
    }
  },

  // Demand Intelligence
  getDemandMetrics: async () => {
    try {
      return await request<any[]>('/demand');
    } catch {
      return FALLBACK_DEMAND;
    }
  },

  getMedicineDemand: async (medicineId: string) => {
    try {
      return await request<any>(`/demand/${medicineId}`);
    } catch {
      return FALLBACK_DEMAND.find(d => d.medicine_id === medicineId) || FALLBACK_DEMAND[0];
    }
  },

  // AI & Safety
  generateHistorySummary: async (patientId: string) => {
    try {
      return await request<any>('/ai/history-summary', {
        method: 'POST',
        body: JSON.stringify({ patient_id: patientId }),
      });
    } catch {
      const rxs = getLocalState<Prescription[]>('rxs', FALLBACK_PRESCRIPTIONS);
      return {
        patient_name: "Rahul Krishnan",
        prescription_count: rxs.length,
        timeline_summary: `Patient Rahul Krishnan has ${rxs.length} recorded prescription encounter(s) in the AyuLink network. Therapy spans upper respiratory bacterial infection with verified physician oversight.`,
        key_medications: ["Amoxicillin 500 mg", "Augmentin 625 mg", "Paracetamol 500 mg"],
        disclaimer: "AI-generated summary based on recorded AyuLink data. Assistive information only. Physician confirmation required."
      };
    }
  },

  checkPrescriptionSafety: async (patientId: string, items: any[]) => {
    try {
      return await request<any>('/ai/safety-check', {
        method: 'POST',
        body: JSON.stringify({ patient_id: patientId, items }),
      });
    } catch {
      const alerts: SafetyAlert[] = [];
      const medIds = items.map(i => i.medicine_id);
      const meds = FALLBACK_MEDICINES.filter(m => medIds.includes(m.id));

      if (meds.some(m => m.generic_name.includes("Amoxicillin"))) {
        alerts.push({
          level: "info",
          title: "Penicillin Class Advisory (Amoxicillin)",
          description: "Standard allergy verification recommended. Confirm patient has no documented hypersensitivity to beta-lactam antibiotics.",
          recommendation: "Physician confirmation of patient allergy history is advised.",
          source: "RxNorm Concept ID: 213169",
          physician_confirmation_required: true
        });
      }

      return {
        has_alerts: alerts.length > 0,
        alerts,
        disclaimer: "Assistive information only. Physician confirmation required."
      };
    }
  },

  explainDemand: async (medicineId: string) => {
    try {
      return await request<any>(`/ai/demand-explanation`, {
        method: 'POST',
        body: JSON.stringify({ medicine_id: medicineId }),
      });
    } catch {
      const dm = FALLBACK_DEMAND.find(d => d.medicine_id === medicineId) || FALLBACK_DEMAND[0];
      return {
        medicine_name: dm.medicine_name,
        score: dm.demand_score,
        level: dm.demand_level,
        factors: [
          { factor: "Patient Search Volume", weight: "40%", value: `${dm.search_count} localized searches`, impact: "High" },
          { factor: "Prescription Inflow", weight: "40%", value: `${dm.prescription_count} physician orders`, impact: "Moderate" },
          { factor: "Local Availability Ratio", weight: "20%", value: `${dm.availability_percentage}% fulfillment coverage`, impact: dm.availability_percentage < 50 ? "Critical Gap" : "Adequate" }
        ],
        explanation: dm.availability_percentage < 50 
          ? `Potential supply gap detected for ${dm.medicine_name}. Search volume and prescription orders are outpacing local pharmacy stock levels (${dm.availability_percentage}% availability).`
          : `Demand for ${dm.medicine_name} is operating at ${dm.demand_level.toLowerCase()} intensity with balanced distribution across regional fulfillment partners.`,
        disclaimer: "Demand Intelligence / prototype signal. Non-prescriptive analytics for pharmacy capacity planning."
      };
    }
  },

  // Demo Reset
  resetDemoData: async () => {
    try {
      return await request<any>('/demo/reset', {
        method: 'POST',
      });
    } catch {
      localStorage.removeItem('ayulink_fb_rxs');
      localStorage.removeItem('ayulink_fb_inv');
      localStorage.removeItem('ayulink_fb_notifs');
      return {
        status: "success",
        message: "AyuLink demo database has been reset to baseline scenario state successfully."
      };
    }
  },
};
