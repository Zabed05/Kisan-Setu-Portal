import React from 'react';
import { FarmerProfile, BookingSlot, Language } from '../../types';
import { 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  CreditCard,
  UserCheck,
  MapPin,
  Clock,
  Activity,
  FileText,
  AlertCircle,
  Coins
} from 'lucide-react';
import { translations } from '../../data/mockData';
import { api } from '../../api/client';

interface FarmerDashboardProps {
  farmer: FarmerProfile;
  booking: BookingSlot;
  bookings?: BookingSlot[];
  language: Language;
  onOpenBooking: () => void;
  onOpenTracker: () => void;
  onOpenBankRegistration: () => void;
  onOpenVoiceAssist: () => void;
  onOpenSlip: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  farmer,
  booking,
  bookings = [],
  language,
  onOpenBooking,
  onOpenTracker,
  onOpenBankRegistration,
  onOpenSlip
}) => {
  const t = translations[language];
  const [paymentEvents, setPaymentEvents] = React.useState<any[]>([]);

  const isProfileCompleted = farmer.bankDetails && farmer.bankDetails.isVerified;
  const hasActiveBooking = booking && !['completed', 'cancelled', 'rejected'].includes(booking.status.toLowerCase());

  let scenario: 'A' | 'B' | 'C' = 'A';
  if (hasActiveBooking || (booking && ['completed'].includes(booking.status.toLowerCase()))) {
    scenario = 'C';
  } else if (isProfileCompleted) {
    scenario = 'B';
  }

  const currentStatus = booking?.status || 'confirmed';
  const isPostProcurement = ['weighed', 'accepted', 'procurement_accepted', 'payment_pending', 'completed'].includes(currentStatus.toLowerCase());

  React.useEffect(() => {
    if (booking && isPostProcurement) {
      api.getPaymentEvents(booking.id)
        .then(res => {
          if (res && res.success) {
            setPaymentEvents(res.events || []);
          }
        })
        .catch(err => console.warn('Failed to load payment events', err));
    }
  }, [booking?.id, booking?.status]);

  const farmersAheadCount = booking && bookings ? bookings.filter(b => 
    b.centreId === booking.centreId &&
    ['arrived', 'checked_in', 'waiting', 'called', 'verification', 'quality_check', 'weighing'].includes(b.status.toLowerCase()) &&
    b.tokenInt < booking.tokenInt
  ).length : 0;

  const currentTokenSeq = booking ? Math.max(101, booking.tokenInt - farmersAheadCount) : 101;
  const currentTokenStr = booking && booking.tokenNumber.includes('-')
    ? `${booking.tokenNumber.split('-')[0]}-${currentTokenSeq}`
    : `#${currentTokenSeq}`;

  const isFarmerTurn = booking && (currentTokenStr === booking.tokenNumber || farmersAheadCount === 0) && !isPostProcurement;

  const defaultBookedTime = booking?.timeline?.bookedTime || '09:00 AM';

  const stages = [
    {
      id: 'confirmed',
      titleEn: '1. Slot Confirmed',
      titleHi: '1. स्लॉट पुष्ट हुआ',
      time: defaultBookedTime,
      subtitle: 'Slot confirmed with APMC token assignment',
      isCompleted: true
    },
    {
      id: 'arrived',
      titleEn: '2. Mandi Gate Entry',
      titleHi: '2. मंडी गेट प्रवेश',
      time: booking?.timeline?.arrivedTime || 'Pending',
      subtitle: 'Vehicle RFID scanned & admitted to holding bay',
      isCompleted: ['arrived', 'checked_in', 'waiting', 'called', 'verification', 'quality_check', 'weighing', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase())
    },
    {
      id: 'verification',
      titleEn: '3. Document Verification',
      titleHi: '3. दस्तावेज़ सत्यापन',
      time: booking?.timeline?.verifiedTime || 'Pending',
      subtitle: 'Kisan ID, land records & bank details cross-verified',
      isCompleted: ['verification', 'quality_check', 'weighing', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase())
    },
    {
      id: 'quality_check',
      titleEn: '4. Quality & Moisture Sampling',
      titleHi: '4. गुणवत्ता एवं नमी जांच',
      time: booking?.timeline?.qualityCheckedTime || 'Pending',
      subtitle: booking?.qualityCheck 
        ? `Grade ${booking.qualityCheck.grade} Approved • Moisture: ${booking.qualityCheck.moisturePercentage}%`
        : 'Quality parameters being tested under FAQ norms',
      isCompleted: ['quality_check', 'quality_inspected', 'quality_approved', 'weighing', 'weighed', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase()) || !!booking?.qualityCheck
    },
    {
      id: 'weighing',
      titleEn: '5. Electronic Weighing & Settlement',
      titleHi: '5. इलेक्ट्रॉनिक तौल एवं डीबीटी भुगतान',
      time: booking?.timeline?.weighedTime || 'Pending',
      subtitle: booking?.weighment 
        ? `Net Grain: ${booking.weighment.netWeightQuintals} Qtl • DBT: ₹${(booking.payment?.amount || booking.payment?.amountRupees || 0).toLocaleString('en-IN')}`
        : 'Queueing for weighbridge station tare and gross logs',
      isCompleted: ['weighing', 'weighed', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase()) || !!booking?.weighment
    }
  ];

  const payStatus = booking?.payment?.status?.toUpperCase() || 'NOT_INITIATED';
  const paymentTimeline = [
    {
      key: 'ACCEPTED',
      label: 'Procurement Accepted',
      subtitle: 'Crop officially accepted & quantity finalized',
      status: ['NOT_INITIATED', 'BILL_GENERATED', 'UNDER_REVIEW', 'APPROVED', 'SENT_TO_PFMS', 'BANK_PROCESSING', 'PAYMENT_CREDITED'].includes(payStatus) ? 'completed' : 'pending',
      time: booking?.timeline?.weighedTime || 'Today',
      dept: 'APMC Mandi Officer'
    },
    {
      key: 'BILL_GENERATED',
      label: 'Procurement Bill Generated',
      subtitle: 'Official J-Form/Receipt generated in portal',
      status: ['BILL_GENERATED', 'UNDER_REVIEW', 'APPROVED', 'SENT_TO_PFMS', 'BANK_PROCESSING', 'PAYMENT_CREDITED'].includes(payStatus) ? 'completed' : 'pending',
      time: payStatus === 'BILL_GENERATED' ? 'Live' : (['UNDER_REVIEW', 'APPROVED', 'SENT_TO_PFMS', 'BANK_PROCESSING', 'PAYMENT_CREDITED'].includes(payStatus) ? 'Done' : 'Pending'),
      dept: 'Procurement Inspector'
    },
    {
      key: 'UNDER_REVIEW',
      label: 'Department Approval',
      subtitle: 'Government officer verifying weighing slips',
      status: ['UNDER_REVIEW', 'APPROVED', 'SENT_TO_PFMS', 'BANK_PROCESSING', 'PAYMENT_CREDITED'].includes(payStatus) ? 'completed' : (payStatus === 'BILL_GENERATED' ? 'active' : 'pending'),
      time: payStatus === 'UNDER_REVIEW' ? 'Live' : (['APPROVED', 'SENT_TO_PFMS', 'BANK_PROCESSING', 'PAYMENT_CREDITED'].includes(payStatus) ? 'Approved' : 'Pending'),
      dept: 'DoCA / Mandi Board'
    },
    {
      key: 'SENT_TO_PFMS',
      label: 'PFMS Processing',
      subtitle: 'Payment request routed to Public Financial Management System',
      status: ['SENT_TO_PFMS', 'BANK_PROCESSING', 'PAYMENT_CREDITED'].includes(payStatus) ? 'completed' : (payStatus === 'APPROVED' ? 'active' : 'pending'),
      time: payStatus === 'SENT_TO_PFMS' ? 'Live' : (['BANK_PROCESSING', 'PAYMENT_CREDITED'].includes(payStatus) ? 'Sent' : 'Pending'),
      dept: 'Ministry Finance / PFMS'
    },
    {
      key: 'PAYMENT_CREDITED',
      label: 'Payment Credited',
      subtitle: `₹${(booking?.payment?.amount || booking?.payment?.amountRupees || 0).toLocaleString('en-IN')} transferred to ending A/C ****${booking?.payment?.accountLast4 || '7291'}`,
      status: payStatus === 'PAYMENT_CREDITED' ? 'completed' : (payStatus === 'BANK_PROCESSING' ? 'active' : 'pending'),
      time: payStatus === 'PAYMENT_CREDITED' ? (booking?.timeline?.completedTime || 'Completed') : 'Pending',
      dept: booking?.payment?.bankName || 'Kisan Registered Bank'
    }
  ];

  // Unified timeline events
  const unifiedEvents: Array<{ title: string; time: string; subtitle: string; isDone: boolean }> = [];
  
  unifiedEvents.push({
    title: 'Slot Confirmed',
    time: defaultBookedTime,
    subtitle: 'Slot confirmed and token assigned',
    isDone: true
  });

  unifiedEvents.push({
    title: 'Gate Entry',
    time: booking?.timeline?.arrivedTime || 'Pending',
    subtitle: 'RFID scanned at Mandi entry',
    isDone: ['arrived', 'checked_in', 'waiting', 'called', 'verification', 'quality_check', 'weighing', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase())
  });

  unifiedEvents.push({
    title: 'Verification Completed',
    time: booking?.timeline?.verifiedTime || 'Pending',
    subtitle: 'Documents approved by verify desk',
    isDone: ['verification', 'quality_check', 'weighing', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase())
  });

  unifiedEvents.push({
    title: 'Quality Approved',
    time: booking?.timeline?.qualityCheckedTime || 'Pending',
    subtitle: booking?.qualityCheck ? `Grade ${booking.qualityCheck.grade} Approved • Moisture: ${booking.qualityCheck.moisturePercentage}%` : 'Quality parameters verified',
    isDone: ['quality_check', 'quality_inspected', 'quality_approved', 'weighing', 'weighed', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase()) || !!booking?.qualityCheck
  });

  unifiedEvents.push({
    title: 'Weighment Locked',
    time: booking?.timeline?.weighedTime || 'Pending',
    subtitle: booking?.weighment ? `Net Weight: ${booking.weighment.netWeightQuintals} Qtl` : 'Net weight logs locked',
    isDone: ['weighing', 'weighed', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase()) || !!booking?.weighment
  });

  unifiedEvents.push({
    title: 'Procurement Accepted',
    time: isPostProcurement ? (booking?.timeline?.weighedTime || 'Today') : 'Pending',
    subtitle: 'Crop officially accepted at mandi',
    isDone: isPostProcurement
  });

  const isBillDone = ['BILL_GENERATED', 'UNDER_REVIEW', 'APPROVED', 'SENT_TO_PFMS', 'BANK_PROCESSING', 'PAYMENT_CREDITED'].includes(payStatus);
  unifiedEvents.push({
    title: 'Procurement Bill Generated (J-Form)',
    time: isBillDone ? '2:45 PM' : 'Pending',
    subtitle: 'Procurement J-Form receipt generated in portal',
    isDone: isBillDone
  });

  const isReviewDone = ['UNDER_REVIEW', 'APPROVED', 'SENT_TO_PFMS', 'BANK_PROCESSING', 'PAYMENT_CREDITED'].includes(payStatus);
  unifiedEvents.push({
    title: 'Department Approval Process',
    time: isReviewDone ? 'Done' : 'Pending',
    subtitle: 'Verify weighing logs and J-Form approvals',
    isDone: isReviewDone
  });

  const isPfmsDone = ['SENT_TO_PFMS', 'BANK_PROCESSING', 'PAYMENT_CREDITED'].includes(payStatus);
  unifiedEvents.push({
    title: 'Payment Request Sent to PFMS',
    time: isPfmsDone ? 'Sent' : 'Pending',
    subtitle: 'Payment transaction forwarded to bank via PFMS',
    isDone: isPfmsDone
  });

  const isCreditDone = payStatus === 'PAYMENT_CREDITED';
  unifiedEvents.push({
    title: 'DBT Amount Credited to Bank Account',
    time: isCreditDone ? (booking?.timeline?.completedTime || 'Completed') : 'Pending',
    subtitle: isCreditDone ? `₹${(booking?.payment?.amount || booking?.payment?.amountRupees || 0).toLocaleString('en-IN')} credited` : 'Direct bank transfer credit',
    isDone: isCreditDone
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
      
      {/* 1. Header Welcome Bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight tracking-tight">
              {language === 'hi' ? `नमस्ते, ${farmer.name || 'किसान साथी'}` : `Namaste, ${farmer.name || 'Farmer'}`}
            </h1>
            <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> 
              <span>{language === 'hi' ? 'सत्यापित किसान' : 'Verified Kisan'}</span>
            </span>
          </div>
          <div className="text-xs text-slate-500 font-semibold flex flex-wrap items-center gap-2">
            <span>Kisan ID: <strong className="text-slate-800">{farmer.kisanId}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {farmer.village}, {farmer.district}, {farmer.state}
            </span>
          </div>
        </div>

        <div>
          <button
            id="dash-bank-profile-btn"
            onClick={onOpenBankRegistration}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              isProfileCompleted 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <CreditCard className={`w-3.5 h-3.5 ${isProfileCompleted ? 'text-emerald-700' : 'text-red-600'}`} />
            <span>Aadhaar DBT Status: {isProfileCompleted ? 'Verified & Linked' : 'Action Required'}</span>
          </button>
        </div>
      </div>

      {/* SCENARIO A: New Farmer Profile Completion Core Card */}
      {scenario === 'A' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">KYC Profile Verification Required</h2>
          </div>
          
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">Step 1 of 2</span>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Complete Aadhaar & DBT Verification
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Verify your identity using your 12-Digit Aadhaar number. This links your profile to the Direct Benefit Transfer (DBT) system, routing your MSP crop payouts automatically to your Aadhaar-seeded bank account.
              </p>
            </div>
            
            <button
              id="card-complete-profile-btn"
              onClick={onOpenBankRegistration}
              className="w-full md:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0"
            >
              <span>Verify Aadhaar Identity</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCENARIO B: Profile Completed, Ready to Book Delivery Slot Card */}
      {scenario === 'B' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">KYC Verified & Ready</h2>
          </div>

          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm transition-all">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">Step 2 of 2</span>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Schedule Crop Delivery Slot
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xl">
                  Choose your crop type, quantity, and pick a preferred date and hour window. Instantly secure your place in the Mandi queue and get a dynamic turn ETA.
                </p>
              </div>

              <button
                id="card-book-slot-btn"
                onClick={onOpenBooking}
                className="w-full md:w-auto px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0"
              >
                <span>Book Delivery Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCENARIO C: Active Booking Exists -> Real-Time Queue Hero Presentation */}
      {scenario === 'C' && (
        <div className="space-y-6">
          
          {/* A. Live Queue Hero Card OR Dynamic Payment Status Card */}
          {!isPostProcurement ? (
            <div className="bg-white text-slate-950 rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              {/* Turn Announcement Banner */}
              {isFarmerTurn && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg text-xs font-bold flex items-center gap-2 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>It is your turn! Please proceed to Counter Desk immediately.</span>
                </div>
              )}

              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping"></span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700">Live AI Queue Tracking</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {booking.status.toUpperCase()}
                </span>
              </div>

              {/* Row 1: Main Highlight Tokens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Current Serving</span>
                    <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">{currentTokenStr}</p>
                  </div>
                  <div className="w-10 h-10 rounded bg-white flex items-center justify-center border border-slate-200 shrink-0 text-slate-500">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block">Your Token</span>
                    <p className="text-2xl font-black text-indigo-950 mt-0.5 tracking-tight">{booking.tokenNumber}</p>
                  </div>
                  <div className="w-10 h-10 rounded bg-white flex items-center justify-center border border-indigo-200 shrink-0 text-indigo-700">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Row 2: Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center text-xs font-semibold">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Ahead in Line</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{farmersAheadCount}</p>
                </div>
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Live ETA</span>
                  <p className="text-xl font-black text-emerald-800 mt-1">~{booking.estimatedWaitMinutes} mins</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Expected Turn</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{booking.estimatedTurnTime}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Queue Speed</span>
                  <p className="text-xl font-black text-slate-900 mt-1">8m/vehicle</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Last Updated</span>
                  <p className="text-[12px] font-extrabold text-slate-800 mt-1.5">
                    {new Date(booking.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* DBT Payment Status Tracking Hero Card */
            <div className="bg-white text-slate-950 rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700">DBT Payment Status</span>
                  <p className="text-xs text-slate-500 font-medium">
                    Procurement ID: <strong className="text-slate-800">{booking.id.substring(0, 13).toUpperCase()}</strong>
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
                  payStatus === 'PAYMENT_CREDITED' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : (payStatus === 'FAILED' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-purple-50 text-purple-800 border-purple-200 animate-pulse')
                }`}>
                  {payStatus.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Steps Timeline Grid */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {paymentTimeline.map((step) => {
                  const isStepCompleted = step.status === 'completed';
                  const isStepActive = step.status === 'active';
                  return (
                    <div key={step.key} className="relative flex items-start gap-4 transition-all">
                      <div className={`absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-white flex items-center justify-center ${
                        isStepCompleted 
                          ? 'border-emerald-700 bg-emerald-700' 
                          : (isStepActive ? 'border-purple-600 animate-pulse bg-purple-600' : 'border-slate-300')
                      }`} />
                      
                      <div className="flex-1 space-y-0.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className={`text-xs font-bold ${
                            isStepCompleted ? 'text-slate-800' : (isStepActive ? 'text-purple-900 font-black' : 'text-slate-400')
                          }`}>
                            {step.label}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {step.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {step.subtitle}
                        </p>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          Agency: {step.dept}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimated Window Badge */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Estimated Settlement Window</span>
                  <p className="text-sm font-black text-slate-800">Within 3–7 working days</p>
                </div>
                <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-lg shrink-0">
                  Direct Benefit Transfer (DBT)
                </span>
              </div>
            </div>
          )}

          {/* B. Live Event Timeline (Vertical Stepper with connecting line) */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                {isPostProcurement ? 'Unified Payment & Procurement Timeline' : 'Mandi Procurement Progress'}
              </h3>
              <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-purple-700" />
                <span>Live Event Stream</span>
              </span>
            </div>

            <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {(isPostProcurement ? unifiedEvents : stages).map((stage, idx) => {
                const isCompleted = isPostProcurement ? (stage as any).isDone : (stage as any).isCompleted;
                const stageTime = (stage as any).time;
                const stageSubtitle = isPostProcurement ? (stage as any).subtitle : (stage as any).subtitle;
                
                let isCurrent = false;
                if (!isCompleted) {
                  const prevStagesCompleted = (isPostProcurement ? unifiedEvents : stages)
                    .slice(0, idx)
                    .every(s => isPostProcurement ? (s as any).isDone : (s as any).isCompleted);
                  if (prevStagesCompleted) {
                    isCurrent = true;
                  }
                }

                return (
                  <div key={idx} className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isCompleted ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-40'
                  }`}>
                    {/* Circle Indicator */}
                    <div className={`absolute -left-[26px] top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-[10px] ${
                      isCompleted 
                        ? 'border-emerald-700 bg-emerald-700 text-white' 
                        : isCurrent 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800 animate-pulse' 
                        : 'border-slate-300 bg-white text-slate-400'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : idx + 1}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className={`text-xs font-bold ${
                        isCompleted ? 'text-slate-900 font-extrabold' : isCurrent ? 'text-indigo-900 font-black' : 'text-slate-400'
                      }`}>
                        {isPostProcurement 
                          ? (stage as any).title 
                          : (language === 'hi' ? (stage as any).titleHi : (stage as any).titleEn)}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-semibold">
                        {stageSubtitle}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                        {stageTime}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C. Mandi Centre Details & PDF Receipt Action (Calm supporting utility block) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm col-span-2 flex flex-col justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Designated Mandi Yard</h4>
                </div>
                <p className="text-sm font-extrabold text-slate-800">{booking.centreName}</p>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Gate 1 weighbridge. Check coordinates on your RFID gate slip.
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Karnal Mandi Complex, Karnal, Haryana</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Pass</h4>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Present your digital QR or printed Mandi Slip at the entry gate.
                </p>
              </div>

              <button
                id="active-booking-slip-btn"
                onClick={onOpenSlip}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-slate-300" />
                <span>Download Mandi Slip</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
