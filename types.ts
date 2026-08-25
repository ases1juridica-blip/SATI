export enum Language {
  EN = 'en',
  ES = 'es',
  AR = 'ar',
}

export enum DocumentType {
  Visa = 'Visa',
  EmiratesID = 'Emirates ID',
  KHDAPermit = 'KHDA Permit',
  Contract = 'Contract',
  WorkPermit = 'Work Permit',
  MedicalFitness = 'Medical Fitness',
  AttestedDegree = 'Attested Degree',
  HealthInsurance = 'Health Insurance',
  StudentPassport = 'Student Passport',
  Unknown = 'Unknown',
}

export interface Document {
  id: string;
  type: DocumentType;
  expiryDate: string;
}

export interface Employee {
  id: string;
  name: string;
  campus: string;
  role: 'Teacher' | 'Administrator' | 'Staff' | 'Student';
  documents: Document[];
  email?: string;
  phone?: string;
  telegram?: string;
  discord?: string;
  preferredChannels?: string[];
}

export type ExtractedDocumentInfo = {
  employeeName: string;
  documentType: 'Visa' | 'Emirates ID' | 'KHDA Permit' | 'Contract' | 'Work Permit' | 'Medical Fitness' | 'Attested Degree' | 'Health Insurance' | 'Student Passport';
  expiryDate: string; // YYYY-MM-DD
  campus?: string;
};

export enum AlertLevel {
  Info = 'Info',
  Formal = 'Formal',
  FollowUp = 'FollowUp',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export interface AlertRule {
  id: string;
  days: number;
  level: AlertLevel;
  message: string;
  recipients: string[];
  channels: string[];
}

export type AlertSchedule = Record<string, AlertRule[]>;

export interface Alert {
  employee: Employee;
  document: Document;
  daysRemaining: number;
  level: AlertLevel;
  message: string;
  recipients: string[];
  channels: string[];
}

