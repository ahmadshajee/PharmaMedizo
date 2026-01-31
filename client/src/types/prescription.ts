export interface Medicine {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface MedicineStatus {
  medicineName: string;
  status: 'pending' | 'given' | 'not_available' | 'not_needed';
  updatedAt?: string;
}

export interface Prescription {
  _id: string;
  diagnosis?: string;
  instructions?: string;
  notes?: string;
  followUpDate?: string;
  status: 'active' | 'completed' | 'cancelled' | 'dispensed' | 'partially_dispensed';
  createdAt: string;
  patientEmail?: string;
  pharmacistId?: string;
  pharmacistName?: string;
  pharmacyName?: string;
  validatedAt?: string;
  medicineStatuses?: MedicineStatus[];
  dispensingNotes?: string;
}

export interface ValidationResponse {
  valid: boolean;
  message: string;
  prescription?: Prescription;
  medicines?: Medicine[];
  medicineStatuses?: MedicineStatus[];
  previousDispensing?: {
    pharmacistId: string;
    pharmacistName: string;
    pharmacyName: string;
    validatedAt: string;
  } | null;
}

export interface DispenseRequest {
  medicineStatuses: MedicineStatus[];
  dispensingNotes?: string;
}

export interface DispensingStats {
  totalDispensed: number;
  todayDispensed: number;
  partiallyDispensed: number;
}
