export type UserType = "buyer" | "investor" | "realtor";

export type VerificationStatus =
  | "submitted"
  | "under_review"
  | "survey_check"
  | "legal_review"
  | "field_inspection"
  | "completed"
  | "flagged";

export type DocumentType =
  | "c_of_o"
  | "survey_plan"
  | "deed_of_assignment"
  | "allocation_letter"
  | "other";

export type ProfessionalType = "surveyor" | "lawyer" | "inspector";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  userType: UserType;
  avatar?: string;
}

export interface UploadedDocument {
  id: string;
  type: DocumentType;
  name: string;
  uri: string;
  uploadedAt: string;
}

export interface VerificationRequest {
  id: string;
  plotNumber: string;
  district: string;
  state: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  surveyNumber?: string;
  sellerName: string;
  documents: UploadedDocument[];
  status: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  assignedProfessionals: string[];
  riskScore?: number;
  report?: VerificationReport;
  fee: number;
  paid: boolean;
}

export interface VerificationReport {
  id: string;
  titleAuthenticity: "verified" | "unverified" | "suspicious";
  surveyVerification: "verified" | "unverified" | "mismatch";
  ownershipCheck: "clear" | "disputed" | "unknown";
  governmentAcquisition: "clear" | "acquired" | "partial";
  riskScore: number;
  summary: string;
  generatedAt: string;
}

export interface Professional {
  id: string;
  name: string;
  type: ProfessionalType;
  license: string;
  rating: number;
  completedVerifications: number;
  location: string;
  avatar?: string;
  specialization: string;
  available: boolean;
}

export interface District {
  id: string;
  name: string;
  state: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  c_of_o: "Certificate of Occupancy",
  survey_plan: "Survey Plan",
  deed_of_assignment: "Deed of Assignment",
  allocation_letter: "Allocation Letter",
  other: "Other Document",
};

export const STATUS_LABELS: Record<VerificationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  survey_check: "Survey Check",
  legal_review: "Legal Review",
  field_inspection: "Field Inspection",
  completed: "Completed",
  flagged: "Flagged",
};

export const PROFESSIONAL_TYPE_LABELS: Record<ProfessionalType, string> = {
  surveyor: "Licensed Surveyor",
  lawyer: "Real Estate Lawyer",
  inspector: "Field Inspector",
};
