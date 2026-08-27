import React, { useState } from 'react';
import { BookingSlot, Language, BookingStatus } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  FileText,
  Building2,
  ShieldCheck,
  Scale,
  FlaskConical,
  Truck,
  MapPin,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Coins,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { translations } from '../../data/mockData';
import { api } from '../../api/client';

interface ProcurementTrackerProps {
  booking: BookingSlot;
  language: Language;
  onBack: () => void;
  onOpenPrintSlip: () => void;
  onUpdateStatus?: (newStatus: BookingStatus) => void;
}

export const ProcurementTracker: React.FC<ProcurementTrackerProps> = ({
  booking,
  language,
  onBack,
  onOpenPrintSlip,
  onUpdateStatus
}) => {
  const [currentStatus, setCurrentStatus] = useState<BookingStatus>(booking.status || 'verification');
  const t = translations[language];
  const [paymentEvents, setPaymentEvents] = useState<any[]>([]);

  const isPostProcurement = ['weighed', 'accepted', 'procurement_accepted', 'payment_pending', 'completed'].includes(currentStatus.toLowerCase());
  const payStatus = booking.payment?.status?.toUpperCase() || 'NOT_INITIATED';

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

  const now = new Date();
  const defaultBookedTime = booking.timeline?.bookedTime || '09:00 AM';
  const defaultArrivedTime = booking.timeline?.arrivedTime || '09:15 AM';
  const defaultVerifiedTime = booking.timeline?.verifiedTime || '09:30 AM';

  const qualityGrade = booking.qualityCheck?.grade || 'FAQ';
  const moisturePct = booking.qualityCheck?.moisturePercentage || 11.5;
  const effectiveRate = booking.qualityCheck?.effectiveRatePerQuintal || (booking.payment?.amount ? Math.round(booking.payment.amount / booking.quantityQuintals) : 2275);
  const totalPayment = booking.payment?.amount || booking.payment?.amountRupees || (booking.quantityQuintals * effectiveRate);

  const stages = [
    {
      id: 'booked',
      titleEn: '1. Slot Booked',
      titleHi: '1. स्लॉट बुक किया गया',
      time: defaultBookedTime,
      subtitle: 'Slot confirmed with APMC token assignment',
      isCompleted: true,
      isActive: currentStatus === 'booked'
    },
    {
      id: 'arrived',
      titleEn: '2. Mandi Gate Entry',
      titleHi: '2. मंडी गेट प्रवेश',
      time: booking.timeline?.arrivedTime || defaultArrivedTime,
      subtitle: 'Vehicle RFID scanned & admitted to holding bay',
      isCompleted: ['arrived', 'checked_in', 'waiting', 'called', 'verification', 'quality_check', 'weighing', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase()),
      isActive: currentStatus === 'arrived'
    },
    {
      id: 'verification',
      titleEn: '3. Document Verification',
      titleHi: '3. दस्तावेज़ सत्यापन',
      time: booking.timeline?.verifiedTime || defaultVerifiedTime,
      subtitle: 'Kisan ID, land records & bank details cross-verified',
      isCompleted: ['verification', 'quality_check', 'weighing', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase()),
      isActive: currentStatus === 'verification'
    },
    {
      id: 'quality_check',
      titleEn: '4. Quality & Moisture Sampling',
      titleHi: '4. गुणवत्ता एवं नमी जांच',
      time: booking.timeline?.qualityCheckedTime || (booking.qualityCheck ? 'Certified' : 'In Progress'),
      subtitle: booking.qualityCheck 
        ? `Grade ${qualityGrade} Approved • Moisture: ${moisturePct}% • Rate: ₹${effectiveRate}/Qtl`
        : 'Quality parameters being tested under FAQ norms',
      isCompleted: ['quality_check', 'quality_inspected', 'quality_approved', 'weighing', 'weighed', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase()) || !!booking.qualityCheck,
      isActive: currentStatus === 'quality_check'
    },
    {
      id: 'weighing',
      titleEn: '5. Electronic Weighing & DBT Settlement',
      titleHi: '5. इलेक्ट्रॉनिक तौल एवं डीबीटी भुगतान',
      time: booking.timeline?.weighedTime || (booking.weighment ? 'Initiated' : 'Queued'),
      subtitle: `Net Grain: ${booking.quantityQuintals} Quintals • Effective Rate: ₹${effectiveRate}/Qtl • Direct DBT: ₹${totalPayment.toLocaleString('en-IN')}.00`,
      isCompleted: ['weighing', 'weighed', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase()) || !!booking.weighment,
      isActive: currentStatus === 'weighing' || currentStatus === 'completed'
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
    time: booking?.timeline?.arrivedTime || defaultArrivedTime,
    subtitle: 'RFID scanned at Mandi entry',
    isDone: ['arrived', 'checked_in', 'waiting', 'called', 'verification', 'quality_check', 'weighing', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase())
  });

  unifiedEvents.push({
    title: 'Verification Completed',
    time: booking?.timeline?.verifiedTime || defaultVerifiedTime,
    subtitle: 'Documents approved by verify desk',
    isDone: ['verification', 'quality_check', 'weighing', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase())
  });

  unifiedEvents.push({
    title: 'Quality Approved',
    time: booking?.timeline?.qualityCheckedTime || 'Certified',
    subtitle: booking?.qualityCheck ? `Grade ${booking.qualityCheck.grade} Approved • Moisture: ${booking.qualityCheck.moisturePercentage}%` : 'Quality parameters verified',
    isDone: ['quality_check', 'quality_inspected', 'quality_approved', 'weighing', 'weighed', 'accepted', 'completed', 'procurement_accepted'].includes(currentStatus.toLowerCase()) || !!booking?.qualityCheck
  });

  unifiedEvents.push({
    title: 'Weighment Locked',
    time: booking?.timeline?.weighedTime || 'Locked',
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          id="tracker-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back} to Dashboard</span>
        </button>
        <button
          id="tracker-download-slip-btn"
          onClick={onOpenPrintSlip}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-2xs"
        >
          <FileText className="w-3.5 h-3.5 text-slate-600" />
          <span>Download Mandi Slip</span>
        </button>
      </div>

      {/* Main Token Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isPostProcurement ? 'Government Payout Tracking' : 'Live Procurement Tracking'}
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-black text-emerald-800 tracking-tight">{booking.tokenNumber}</span>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {currentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="text-slate-500 font-medium">Designated APMC Yard</span>
            <p className="font-bold text-slate-900 mt-0.5">{booking.centreName}</p>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center sm:justify-end gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Gate 1 Weighbridge Station
            </span>
          </div>
        </div>

        {/* Quick Details Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Farmer Name</span>
            <p className="font-bold text-slate-900 mt-0.5">{booking.farmerName}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Commodity</span>
            <p className="font-bold text-slate-900 mt-0.5">{booking.cropName} ({booking.quantityQuintals} Qtl)</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Arrival Time Slot</span>
            <p className="font-bold text-slate-900 mt-0.5">{booking.timeSlot}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Vehicle / Trolley</span>
            <p className="font-bold text-slate-900 mt-0.5 font-mono">{booking.vehicleNumber}</p>
          </div>
        </div>

        {/* Quality & Value Inspection Card */}
        {booking.qualityCheck && (
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-slate-900 text-xs">Government Mandi Quality Inspection Certificate</span>
              </div>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Grade {booking.qualityCheck.grade} Approved
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-500 block text-[11px]">Moisture Level:</span>
                <strong className="text-slate-900 text-sm font-bold">{booking.qualityCheck.moisturePercentage}%</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Foreign Matter:</span>
                <strong className="text-slate-900 text-sm font-bold">{booking.qualityCheck.foreignMatterPercentage}%</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Effective Rate:</span>
                <strong className="text-emerald-800 text-sm font-black">₹{effectiveRate}/Qtl</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Direct Bank Transfer:</span>
                <strong className="text-emerald-800 text-sm font-black">₹{totalPayment.toLocaleString('en-IN')}.00</strong>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Event Progress */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isPostProcurement ? 'Unified Timeline Events' : 'Procurement Milestones'}
            </h3>
            <span className="text-xs font-semibold text-emerald-700">Real-Time Telemetry</span>
          </div>

          <div className="space-y-3">
            {(isPostProcurement ? unifiedEvents : stages).map((stage, idx) => {
              const isCompleted = isPostProcurement ? (stage as any).isDone : (stage as any).isCompleted;
              const stageTime = (stage as any).time;
              const stageSubtitle = isPostProcurement ? (stage as any).subtitle : (stage as any).subtitle;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                      : 'bg-white border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-xs sm:text-sm text-slate-900">
                        {isPostProcurement 
                          ? (stage as any).title 
                          : (language === 'hi' ? (stage as any).titleHi : (stage as any).titleEn)}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">{stageSubtitle}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right pl-11 sm:pl-0">
                    <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {stageTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
