export interface PatientPower {
  re: string;
  le: string;
  add: string;
}

export interface PatientPayment {
  total: number;
  paid: number;
  remaining: number;
}

export interface PatientRecord {
  id: string;
  date: string;
  clinicName: string;
  patientName: string;
  mobileNumber: string;
  address: string;
  power: PatientPower;
  glass: string;
  frame: string;
  eyeDrop: string;
  payment: PatientPayment;
  complication: string;
  glassesDelivered: boolean;
  deliveryDate: string | null;
  imageUrl: string | null;
  createdAt: number;
}

export type PatientRecordInput = Omit<PatientRecord, 'id' | 'createdAt'>;
