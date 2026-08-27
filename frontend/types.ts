export type Language = 'en' | 'hi';

export type UserRole = 'farmer' | 'operator' | 'admin';

export type PortalType = 'farmer' | 'operator' | 'admin';

export interface FarmerProfile {
  id: string;
  kisanId: string;
  name: string;
  phone: string;
  avatarUrl: string;
  state: string;
  district: string;
  village: string;
  isVerified: boolean;
  bankDetails?: BankAccount;
  aadhaar?: string;
  address?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface BankAccount {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  isVerified: boolean;
  linkedDate?: string;
}

export type CropType = 'wheat' | 'paddy' | 'mustard' | 'cotton' | 'maize';

export interface CropInfo {
  id: CropType;
  nameEn: string;
  nameHi: string;
  mspPerQuintal: number;
  maxBookingQuintals: number;
  icon: string;
  category: 'Rabi' | 'Kharif' | 'Commercial';
}

export interface ProcurementCentre {
  id: string;
  name: string;
  district: string;
  state: string;
  address: string;
  distanceKm: number;
  isOpen: boolean;
  currentCapacity: number;
  maxCapacity: number;
  queueLength: number;
  avgWaitTimeMins: number;
  latitude: number;
  longitude: number;
  activeCounters: number;
}

export type BookingStatus = 'confirmed' | 'booked' | 'arrived' | 'checked_in' | 'waiting' | 'called' | 'verification' | 'verified' | 'quality_check' | 'quality_approved' | 'quality_inspected' | 'weighing' | 'weighed' | 'accepted' | 'procurement_accepted' | 'payment_pending' | 'completed' | 'cancelled' | 'rejected';

export interface QueueTokenItem {
  id: string;
  bookingId: string;
  centreId: string;
  tokenNumber: string;
  tokenSequence: number;
  status: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  cropCode: string;
  cropName: string;
  quantityQuintals: number;
  vehicleNumber: string;
  checkInTime?: string;
  callTime?: string;
  completedTime?: string;
  estimatedWaitMinutes: number;
  predictedTurn: string;
  queuePosition?: number;
  farmersAhead?: number;
  createdAt: string;
}

export interface QueueLiveState {
  centreId: string;
  centreName: string;
  isOperational: boolean;
  activeCounters: number;
  dailyCapacityQuintals: number;
  bookedCapacityQuintals: number;
  capacityUtilizationPercent: number;
  currentServingToken: QueueTokenItem | null;
  nextUpcomingToken: QueueTokenItem | null;
  totalWaitingCount: number;
  activeQueueList: QueueTokenItem[];
  recentCompletedCount: number;
  avgWaitTimeMinutes: number;
  processingSpeedPerHour: number;
  congestionLevel: 'OPTIMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'SURGE';
  aiRecommendation?: string;
  lastUpdated: string;
}

export interface AIPredictionResponse {
  estimatedWaitMinutes: number;
  expectedTurn: string;
  confidence: number;
  congestion: 'OPTIMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'SURGE';
  modelVersion: string;
  features?: {
    queueLength: number;
    activeCounters: number;
    crop: string;
    quantity: number;
    hour: number;
    weekday: string;
    avgProcessingTime: number;
  };
  recommendations: Array<{
    id: string;
    type: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    actionLabel?: string;
  }>;
}

export interface BookingSlot {
  id: string;
  tokenNumber: string;
  tokenInt: number;
  farmerId: string;
  farmerName: string;
  phone: string;
  centreId: string;
  centreName: string;
  crop: CropType;
  cropName: string;
  quantityQuintals: number;
  bookingDate: string;
  timeSlot: string;
  vehicleNumber: string;
  status: BookingStatus;
  estimatedTurnTime: string;
  estimatedWaitMinutes: number;
  qrCodeUrl?: string;
  createdAt: string;
  // Progress timestamps
  timeline: {
    bookedTime?: string;
    arrivedTime?: string;
    verifiedTime?: string;
    qualityCheckedTime?: string;
    weighedTime?: string;
    completedTime?: string;
  };
  qualityCheck?: {
    grade: 'A' | 'FAQ' | 'B' | 'REJECTED';
    moisturePercentage: number;
    foreignMatterPercentage: number;
    baseMspRate?: number;
    qualityAdjustmentPerQtl?: number;
    effectiveRatePerQuintal?: number;
    qualityBonusOrDeductionPercent?: number;
    qualityStatus?: 'PREMIUM_BONUS' | 'STANDARD_FAQ' | 'SUB_FAQ_DEDUCTION' | 'REJECTED';
    inspectorName: string;
    remarks: string;
    passed: boolean;
    inspectedAt?: string;
  };
  weighment?: {
    grossWeightKg: number;
    tareWeightKg: number;
    netWeightKg: number;
    netWeightQuintals: number;
    operatorName: string;
  };
  payment?: {
    baseAmount?: number;
    qualityAdjustmentAmount?: number;
    effectiveRatePerQuintal?: number;
    amount: number;
    status: 'not_initiated' | 'bill_generated' | 'under_review' | 'approved' | 'sent_to_pfms' | 'bank_processing' | 'payment_credited' | 'failed' | 'initiated' | 'processing' | 'completed';
    referenceId: string;
    bankName: string;
    accountLast4: string;
    estimatedDate?: string;
    settlementDate: string;
  };
}

export interface PaymentEvent {
  id: string;
  paymentId: string;
  status: string;
  timestamp: string;
  updatedBy: string;
  remarks?: string;
}

export interface AIInsight {
  id: string;
  type: 'surge' | 'action' | 'quality_alert' | 'forecast';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  targetCentre?: string;
  actionLabel?: string;
  applied?: boolean;
  timestamp: string;
}

export interface DistrictMetric {
  district: string;
  volumeMT: number;
  percentage: number;
  centresCount: number;
  congestion: 'low' | 'med' | 'high';
}
