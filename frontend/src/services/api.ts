const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

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
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getDemoAccounts: () => request<any[]>('/auth/demo-accounts'),

  // Doctors
  getDoctorDashboard: (doctorId: string) =>
    request<any>(`/doctors/dashboard?doctor_id=${doctorId}`),
  getDoctorTemplates: (doctorId: string) =>
    request<any[]>(`/doctors/templates?doctor_id=${doctorId}`),

  // Patients
  getPatients: () => request<any[]>('/patients'),
  getPatient: (patientId: string) => request<any>(`/patients/${patientId}`),
  getPatientPrescriptions: (patientId: string) =>
    request<any[]>(`/patients/${patientId}/prescriptions`),

  // Pharmacies
  getPharmacies: () => request<any[]>('/pharmacies'),
  getPharmacyDashboard: (pharmacyId: string) =>
    request<any>(`/pharmacies/${pharmacyId}/dashboard`),
  getPharmacyInventory: (pharmacyId: string) =>
    request<any[]>(`/pharmacies/${pharmacyId}/inventory`),

  // Medicines
  searchMedicines: (query?: string) =>
    request<any[]>(`/medicines${query ? `?q=${encodeURIComponent(query)}` : ''}`),
  getMedicineAvailability: (medicineId: string, location?: string) =>
    request<any[]>(`/medicines/${medicineId}/availability?coarse_location=${encodeURIComponent(location || 'Thrissur Metro Area')}`),

  // Prescriptions
  createPrescription: (payload: any, doctorId?: string) =>
    request<any>(`/prescriptions${doctorId ? `?doctor_id=${doctorId}` : ''}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getPrescriptions: (filters: { doctor_id?: string; pharmacy_id?: string; patient_id?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters.doctor_id) params.append('doctor_id', filters.doctor_id);
    if (filters.pharmacy_id) params.append('pharmacy_id', filters.pharmacy_id);
    if (filters.patient_id) params.append('patient_id', filters.patient_id);
    if (filters.status) params.append('status', filters.status);
    return request<any[]>(`/prescriptions?${params.toString()}`);
  },
  getPrescription: (id: string) => request<any>(`/prescriptions/${id}`),
  sendPrescription: (id: string, pharmacyId: string) =>
    request<any>(`/prescriptions/${id}/send?pharmacy_id=${pharmacyId}`, {
      method: 'POST',
    }),
  markPrescriptionUnavailable: (id: string, notes?: string) =>
    request<any>(`/prescriptions/${id}/unavailable`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  doctorResolvePrescription: (id: string, payload: any) =>
    request<any>(`/prescriptions/${id}/doctor-response`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  completePrescription: (id: string) =>
    request<any>(`/prescriptions/${id}/complete`, {
      method: 'POST',
    }),

  // Inventory
  updateInventoryStatus: (id: string, availabilityStatus: string, stock?: number) =>
    request<any>(`/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        availability_status: availabilityStatus,
        internal_stock_quantity: stock,
      }),
    }),
  syncInventory: (pharmacyId: string) =>
    request<any>(`/inventory/sync?pharmacy_id=${pharmacyId}`, {
      method: 'POST',
    }),

  // Notifications
  getNotifications: (userId: string, unreadOnly: boolean = false) =>
    request<any[]>(`/notifications?user_id=${userId}${unreadOnly ? '&unread_only=true' : ''}`),
  markNotificationRead: (id: string) =>
    request<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  markAllNotificationsRead: (userId: string) =>
    request<any>(`/notifications/mark-all-read?user_id=${userId}`, {
      method: 'POST',
    }),

  // Demand Intelligence
  getDemandMetrics: () => request<any[]>('/demand'),
  getMedicineDemand: (medicineId: string) => request<any>(`/demand/${medicineId}`),

  // AI & Safety
  generateHistorySummary: (patientId: string) =>
    request<any>('/ai/history-summary', {
      method: 'POST',
      body: JSON.stringify({ patient_id: patientId }),
    }),
  checkPrescriptionSafety: (patientId: string, items: any[]) =>
    request<any>('/ai/safety-check', {
      method: 'POST',
      body: JSON.stringify({ patient_id: patientId, items }),
    }),
  explainDemand: (medicineId: string) =>
    request<any>('/ai/demand-explanation', {
      method: 'POST',
      body: JSON.stringify({ medicine_id: medicineId }),
    }),

  // Demo Reset
  resetDemoData: () =>
    request<any>('/demo/reset', {
      method: 'POST',
    }),
};
