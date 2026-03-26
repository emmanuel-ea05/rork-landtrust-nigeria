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

export type TitleType =
  | "c_of_o"
  | "r_of_o"
  | "customary_right"
  | "governor_consent"
  | "allocation_letter"
  | "deed_of_assignment"
  | "unknown";

export const TITLE_TYPE_LABELS: Record<TitleType, string> = {
  c_of_o: "Certificate of Occupancy (C of O)",
  r_of_o: "Right of Occupancy (R of O)",
  customary_right: "Customary Right of Occupancy",
  governor_consent: "Governor's Consent",
  allocation_letter: "Allocation Letter",
  deed_of_assignment: "Deed of Assignment",
  unknown: "Unknown / Not Provided",
};

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

export type VerificationTier = "basic" | "full_diligence" | "priority";

export const TIER_LABELS: Record<VerificationTier, string> = {
  basic: "Basic Check",
  full_diligence: "Full Due Diligence",
  priority: "Priority (24hr)",
};

export const TIER_PRICES: Record<VerificationTier, number> = {
  basic: 30000,
  full_diligence: 150000,
  priority: 200000,
};

export const TIER_DESCRIPTIONS: Record<VerificationTier, string> = {
  basic: "C of O check, survey verification, basic ownership search",
  full_diligence: "Full title chain, court dispute search, field inspection, lawyer review, detailed risk analysis",
  priority: "Everything in Full Due Diligence + 24-hour turnaround, dedicated team, direct lawyer hotline",
};

export const TIER_TURNAROUND: Record<VerificationTier, string> = {
  basic: "5–7 business days",
  full_diligence: "7–14 business days",
  priority: "24 hours",
};

export interface OwnershipChainEntry {
  name: string;
  acquiredDate?: string;
  method?: string;
}

export interface IntelligenceData {
  titleType: TitleType;
  landSize?: string;
  landSizeUnit?: "sqm" | "hectares" | "plots" | "acres";
  estimatedPrice?: number;
  ownershipChain: OwnershipChainEntry[];
  knownDisputes?: string;
  yearOfAllocation?: string;
  developmentStatus?: "undeveloped" | "under_construction" | "developed" | "unknown";
  accessRoad?: boolean;
  fenced?: boolean;
}

export const DEVELOPMENT_STATUS_LABELS: Record<string, string> = {
  undeveloped: "Undeveloped / Bare Land",
  under_construction: "Under Construction",
  developed: "Developed / Built",
  unknown: "Unknown",
};

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
  tier: VerificationTier;
  intelligence?: IntelligenceData;
}

export interface TrustSignal {
  verifiedBy: string;
  verifierLicense: string;
  verifierType: ProfessionalType;
  backedByLawyer?: string;
  lawyerLicense?: string;
  verificationTimestamp: string;
  caseId: string;
  certificateHash: string;
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
  trustSignals?: TrustSignal;
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

export type LandStatus = "safe" | "disputed" | "government_acquisition" | "under_review" | "flagged";

export const LAND_STATUS_LABELS: Record<LandStatus, string> = {
  safe: "Safe",
  disputed: "Disputed",
  government_acquisition: "Gov. Acquisition",
  under_review: "Under Review",
  flagged: "Flagged",
};

export const LAND_STATUS_COLORS: Record<LandStatus, string> = {
  safe: "#2ECC71",
  disputed: "#F39C12",
  government_acquisition: "#E74C3C",
  under_review: "#3498DB",
  flagged: "#E74C3C",
};

export interface OwnershipEvent {
  id: string;
  date: string;
  type: "allocation" | "transfer" | "verification" | "dispute" | "acquisition" | "mortgage" | "court_ruling" | "status_change";
  title: string;
  description: string;
  actor?: string;
  documentRef?: string;
}

export interface LandRecord {
  landId: string;
  plotNumber: string;
  district: string;
  state: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  surveyNumber?: string;
  areaSize?: string;
  currentOwner: string;
  status: LandStatus;
  riskScore: number;
  timeline: OwnershipEvent[];
  verificationHistory: string[];
  lastVerified?: string;
  totalVerifications: number;
  createdAt: string;
  updatedAt: string;
  intelligence?: IntelligenceData;
}

export interface PlatformStats {
  totalPlotsVerified: number;
  totalLandRecords: number;
  activeSurveyors: number;
  activeLawyers: number;
  activeInspectors: number;
  districtsWithData: number;
  totalDataPoints: number;
  monthlyVerifications: number;
  disputesDetected: number;
  govAcquisitionsDetected: number;
  avgRiskScore: number;
  totalInvestmentProtected: number;
}
