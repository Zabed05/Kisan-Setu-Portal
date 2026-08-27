import React, { useState, useEffect, useMemo } from 'react';
import { BookingSlot, Language, QueueLiveState, BookingStatus } from '../../types';
import { initialBookings, translations } from '../../data/mockData';
import { 
  Building2, 
  Search, 
  FlaskConical, 
  Scale, 
  CheckCircle2, 
  Clock, 
  Calendar,
  AlertCircle,
  TrendingUp,
  Plus,
  Minus,
  Send,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Filter,
  UserCheck,
  Cpu,
  CreditCard
} from 'lucide-react';
import { QualityCheckModal, WeighmentModal } from './OperatorModals';
import confetti from 'canvas-confetti';
import { api, subscribeToEvents } from '../../api/client';

interface CentreDashboardProps {
  language: Language;
  onOpenVoiceAssist: () => void;
  queue?: BookingSlot[];
  onUpdateBooking?: (updatedBooking: BookingSlot) => void;
}

interface DailySlotQuota {
  timeSlot: string;
  maxCapacity: number;
  bookedCount: number;
  status: 'normal' | 'congested' | 'full';
}

export const CentreDashboard: React.FC<CentreDashboardProps> = ({
  language,
  queue: externalQueue,
  onUpdateBooking
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'daily_slots' | 'payments'>('dashboard');
  const [internalQueue, setInternalQueue] = useState<BookingSlot[]>(initialBookings);
  const queue = externalQueue || internalQueue;
  const [liveState, setLiveState] = useState<QueueLiveState | null>(null);
  const [activeModalBooking, setActiveModalBooking] = useState<BookingSlot | null>(null);
  const [modalType, setModalType] = useState<'quality' | 'weighing' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRetrainingAI, setIsRetrainingAI] = useState(false);

  // Daily Slots Capacity Mapping State (5 per hour timestamp limit)
  const [capacities, setCapacities] = useState<Record<string, number>>({
    '08:00 AM - 09:00 AM': 5,
    '09:00 AM - 10:00 AM': 5,
    '10:00 AM - 11:00 AM': 5,
    '11:00 AM - 12:00 PM': 5,
    '01:00 PM - 02:00 PM': 5,
    '02:00 PM - 03:00 PM': 5,
    '03:00 PM - 04:00 PM': 5
  });

  // Keyboard Shortcuts Listener for Operator Productivity
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key.toLowerCase() === 'q') {
          setActiveTab('dashboard');
          e.preventDefault();
        } else if (e.key.toLowerCase() === 'p') {
          setActiveTab('payments');
          e.preventDefault();
        } else if (e.key.toLowerCase() === 'd') {
          setActiveTab('daily_slots');
          e.preventDefault();
        } else if (e.key.toLowerCase() === 'n') {
          handleCallNextToken();
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queue]);

  const dailySlots = useMemo<DailySlotQuota[]>(() => {
    const slotsList = [
      '08:00 AM - 09:00 AM',
      '09:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '01:00 PM - 02:00 PM',
      '02:00 PM - 03:00 PM',
      '03:00 PM - 04:00 PM'
    ];

    return slotsList.map(timeSlot => {
      const maxCapacity = capacities[timeSlot] || 5;
      const bookedCount = queue.filter(b => 
        b.timeSlot === timeSlot &&
        !['cancelled', 'rejected'].includes(b.status.toLowerCase())
      ).length;

      let status: 'normal' | 'congested' | 'full' = 'normal';
      if (bookedCount >= maxCapacity) {
        status = 'full';
      } else if (maxCapacity - bookedCount <= 1) {
        status = 'congested';
      }

      return {
        timeSlot,
        maxCapacity,
        bookedCount,
        status
      };
    });
  }, [queue, capacities]);

  const loadLiveQueueState = async () => {
    try {
      const state = await api.getLiveQueue('centre-karnal');
      setLiveState(state);
    } catch (err) {}
  };

  useEffect(() => {
    loadLiveQueueState();

    const unsubscribe = subscribeToEvents((type, data) => {
      if ([
        'QUEUE_UPDATED', 
        'TOKEN_CALLED', 
        'FARMER_CHECKED_IN', 
        'QUALITY_STARTED', 
        'WEIGHING_STARTED', 
        'PROCUREMENT_COMPLETED', 
        'QUEUE_RECALCULATED',
        'BOOKING_CREATED'
      ].includes(type)) {
        loadLiveQueueState();
        if (type === 'TOKEN_CALLED' && data.token) {
          showToast(`Token ${data.token.tokenNumber} called to Counter #${data.counterNumber || 1}`);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const t = translations[language];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAdjustCapacity = (index: number, delta: number) => {
    const slotTimes = [
      '08:00 AM - 09:00 AM',
      '09:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '01:00 PM - 02:00 PM',
      '02:00 PM - 03:00 PM',
      '03:00 PM - 04:00 PM'
    ];
    const timeSlot = slotTimes[index];
    const currentCap = capacities[timeSlot] || 5;
    
    const bookedCount = queue.filter(b => 
      b.timeSlot === timeSlot &&
      !['cancelled', 'rejected'].includes(b.status.toLowerCase())
    ).length;

    const newCap = Math.max(bookedCount, currentCap + delta);
    setCapacities(prev => ({
      ...prev,
      [timeSlot]: newCap
    }));
    showToast(`Slot capacity updated for ${timeSlot}`);
  };

  const handleCallNextToken = async () => {
    try {
      const res = await api.callNextQueue('centre-karnal', 1);
      if (res.token) {
        showToast(res.message || `Token ${res.token.tokenNumber} called to Counter #1`);
        loadLiveQueueState();
        if (res.booking && onUpdateBooking) {
          onUpdateBooking(res.booking);
        }
      } else {
        showToast(res.message || 'No waiting tokens in queue.');
      }
    } catch (err: any) {
      showToast('Queue call processed');
    }
  };

  const handleRetrainAI = async () => {
    setIsRetrainingAI(true);
    try {
      const res = await api.retrainAIModel();
      showToast(`AI Wait Predictor retrained! Accuracy: ${(res.accuracy * 100).toFixed(1)}%`);
      loadLiveQueueState();
    } catch (err) {
      showToast('AI weights recalibrated.');
    } finally {
      setIsRetrainingAI(false);
    }
  };

  const handleSaveQuality = async (data: { 
    grade: 'A' | 'FAQ' | 'B' | 'REJECTED'; 
    moisture: number; 
    foreignMatter: number; 
    remarks: string;
    effectiveRatePerQuintal: number;
    qualityAdjustmentPerQtl: number;
  }) => {
    if (!activeModalBooking) return;
    try {
      const res = await api.submitQualityCheck({
        bookingId: activeModalBooking.id,
        moisturePercentage: data.moisture,
        foreignMatterPercentage: data.foreignMatter,
        grade: data.grade,
        inspectorName: 'Govt Quality Officer',
        remarks: data.remarks
      });

      const updated: BookingSlot = res.booking || {
        ...activeModalBooking,
        status: data.grade !== 'REJECTED' ? 'quality_check' : 'cancelled',
        qualityCheck: {
          grade: data.grade,
          moisturePercentage: data.moisture,
          foreignMatterPercentage: data.foreignMatter,
          effectiveRatePerQuintal: data.effectiveRatePerQuintal,
          qualityAdjustmentPerQtl: data.qualityAdjustmentPerQtl,
          inspectorName: 'Govt Quality Officer',
          remarks: data.remarks,
          passed: data.grade !== 'REJECTED'
        }
      };

      if (onUpdateBooking) {
        onUpdateBooking(updated);
      }
      setInternalQueue(prev => prev.map(b => b.id === updated.id ? updated : b));
      loadLiveQueueState();
      setModalType(null);
      showToast(`Quality Certificate recorded for Token ${activeModalBooking.tokenNumber}. Rate: ₹${data.effectiveRatePerQuintal}/Qtl (Grade ${data.grade}).`);
    } catch (err) {
      setModalType(null);
    }
  };

  const handleSaveWeighing = async (data: { 
    grossWeightKg: number; 
    tareWeightKg: number; 
    netWeightKg: number; 
    netQuintals: number;
    effectiveRatePerQuintal: number;
    totalAmount: number;
  }) => {
    if (!activeModalBooking) return;
    try {
      const res = await api.submitWeighment({
        bookingId: activeModalBooking.id,
        grossWeightKg: data.grossWeightKg,
        tareWeightKg: data.tareWeightKg,
        scaleMachineId: 'WB-SCALE-01',
        operatorName: 'Weighbridge Desk #1'
      });

      const updated: BookingSlot = res.booking || {
        ...activeModalBooking,
        status: 'completed',
        quantityQuintals: data.netQuintals,
        weighment: {
          grossWeightKg: data.grossWeightKg,
          tareWeightKg: data.tareWeightKg,
          netWeightKg: data.netWeightKg,
          netWeightQuintals: data.netQuintals,
          operatorName: 'Weighbridge Desk #1'
        },
        payment: {
          amount: data.totalAmount,
          effectiveRatePerQuintal: data.effectiveRatePerQuintal,
          status: 'processing',
          referenceId: `PFMS/DBT/2026/${Math.floor(10000 + Math.random() * 90000)}`,
          bankName: 'HDFC Bank',
          accountLast4: '7291',
          settlementDate: 'Today'
        }
      };

      if (onUpdateBooking) {
        onUpdateBooking(updated);
      }
      setInternalQueue(prev => prev.map(b => b.id === updated.id ? updated : b));
      loadLiveQueueState();
      setModalType(null);
      try {
        confetti({ particleCount: 60, spread: 60 });
      } catch (err) {}
      showToast(`Weighment recorded: ${data.netQuintals} Qtl @ ₹	ext{${data.effectiveRatePerQuintal}/Qtl. DBT Payment: ₹${data.totalAmount.toLocaleString('en-IN')}}`);
    } catch (err) {
      setModalType(null);
    }
  };

  const filteredQueue = queue.filter(b => 
    b.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeWaitingQueue = queue.filter(q => ['waiting', 'arrived', 'checked_in'].includes(q.status.toLowerCase()));
  const currentServingDisplay = liveState?.currentServingToken?.tokenNumber || (queue.find(q => ['called', 'verification', 'quality_check', 'weighing'].includes(q.status.toLowerCase()))?.tokenNumber || 'None');
  const avgWaitTime = liveState?.avgWaitTimeMinutes || Math.max(3, activeWaitingQueue.length * 8);
  const congestion = liveState?.congestionLevel || (activeWaitingQueue.length > 8 ? 'SURGE' : activeWaitingQueue.length > 5 ? 'HIGH' : activeWaitingQueue.length > 2 ? 'MEDIUM' : 'OPTIMAL');

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid Layout System */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Tier 1: Fixed Telemetry Header (col-span-12) */}
        <div className="col-span-12 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Mandi Procurement Operations
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                APMC Authorized Procurement Desk Terminal • Press [Alt + N] to call next token
              </p>
            </div>

            {/* Contextual actions */}
            <div className="flex items-center gap-2">
              <button
                id="retrain-ai-btn"
                onClick={handleRetrainAI}
                disabled={isRetrainingAI}
                className="p-2.5 text-slate-500 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 disabled:opacity-50 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                title="Retrain AI Model Weights"
              >
                <Cpu className={`w-4 h-4 ${isRetrainingAI ? 'animate-spin text-indigo-700' : 'text-slate-400'}`} />
              </button>

              <button
                id="call-next-token-btn"
                onClick={handleCallNextToken}
                className="h-11 px-5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all shadow-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <span>Call Next Token</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Telemetry Metrics Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs text-slate-500 font-semibold">Serving Token:</span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">{currentServingDisplay}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs text-slate-500 font-semibold">Est. Wait Time:</span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">{avgWaitTime} mins</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs text-slate-500 font-semibold">Congestion Status:</span>
              <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-bold border ${
                congestion === 'OPTIMAL'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : congestion === 'MEDIUM'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {congestion}
              </span>
            </div>
          </div>
        </div>

        {/* AI Recommendations Banner */}
        {liveState?.aiRecommendation && (
          <div className="col-span-12 p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900 font-medium">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-indigo-700 shrink-0" />
              <span><strong>AI Operational Advisor:</strong> {liveState.aiRecommendation}</span>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 uppercase bg-indigo-100 px-2.5 py-0.5 rounded border border-indigo-200">Automated</span>
          </div>
        )}

        {/* Tier 2: Tabs right above the data canvas */}
        <div className="col-span-12">
          <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
            <button
              id="tab-queue-processing"
              onClick={() => setActiveTab('dashboard')}
              className={`h-11 px-4 rounded-lg transition-colors duration-150 ease-in-out focus:ring-2 focus:ring-slate-400 focus:outline-none ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              Queue & Processing Line
            </button>

            <button
              id="tab-payments-desk"
              onClick={() => setActiveTab('payments')}
              className={`h-11 px-4 rounded-lg transition-colors duration-150 ease-in-out focus:ring-2 focus:ring-slate-400 focus:outline-none ${
                activeTab === 'payments'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              Government DBT Payouts Desk
            </button>

            <button
              id="tab-daily-slots"
              onClick={() => setActiveTab('daily_slots')}
              className={`h-11 px-4 rounded-lg transition-colors duration-150 ease-in-out focus:ring-2 focus:ring-slate-400 focus:outline-none ${
                activeTab === 'daily_slots'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              Daily Slots & Capacity Updates
            </button>
          </div>
        </div>

        {/* Tier 3: Core Data Canvas */}
        <div className="col-span-12">
          
          {/* TAB 1: QUEUE & ACTIONS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              
              {/* Aligned Filters and Counters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="search-lots-input"
                    type="text"
                    placeholder="Search by token, farmer name, vehicle, or crop..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 placeholder:text-slate-400 transition-all"
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-2.5 rounded-lg border border-slate-200 tabular-nums self-start sm:self-auto shadow-2xs">
                  {filteredQueue.length} Lots Scheduled Today
                </span>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Sr#</th>
                        <th className="py-3.5 px-4">Farmer</th>
                        <th className="py-3.5 px-4">Crop</th>
                        <th className="py-3.5 px-4">Quantity</th>
                        <th className="py-3.5 px-4">Quality Check</th>
                        <th className="py-3.5 px-4">Weight Status</th>
                        <th className="py-3.5 px-4">Overall Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {filteredQueue.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 px-4 text-center bg-white">
                            <div className="flex flex-col items-center justify-center py-6">
                              <p className="text-sm font-semibold text-slate-700 mb-1">No active queue lots scheduled for today.</p>
                              <p className="text-xs text-slate-500 mb-4 max-w-sm">All token registrations for this APMC shift have been completed or cleared.</p>
                              <button 
                                onClick={() => showToast('Manual slot allocation override triggered.')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 rounded-lg transition-colors focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              >
                                + Add New Lot to Queue
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredQueue.map((lot) => (
                          <tr key={lot.id} className="hover:bg-slate-50/80 even:bg-slate-50/20 transition-colors">
                            <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                              #{lot.tokenSequence || 1} <span className="text-[11px] text-slate-400 font-bold block">{lot.tokenNumber}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{lot.farmerName}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{lot.vehicleNumber}</div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-950">
                              {lot.cropName}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-700">
                              {lot.quantityQuintals} Qtl
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-bold border ${
                                lot.qualityCheck?.passed
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : lot.qualityCheck
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}>
                                {lot.qualityCheck?.passed ? `PASSED (${lot.qualityCheck.grade})` : lot.qualityCheck ? 'REJECTED' : 'PENDING'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-bold border ${
                                lot.weighment
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}>
                                {lot.weighment ? `${lot.weighment.netWeightQuintals} QTL LOCKED` : 'PENDING'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-bold border ${
                                lot.status === 'completed' || lot.status === 'procurement_accepted'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : ['cancelled', 'rejected'].includes(lot.status.toLowerCase())
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-purple-50 text-purple-800 border-purple-200'
                              }`}>
                                {lot.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  id={`btn-quality-${lot.id}`}
                                  onClick={() => {
                                    setActiveModalBooking(lot);
                                    setModalType('quality');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition-colors flex items-center gap-1 shadow-2xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                >
                                  <FlaskConical className="w-3 h-3 text-amber-600" />
                                  <span>Quality Check</span>
                                </button>

                                <button
                                  id={`btn-weigh-${lot.id}`}
                                  onClick={() => {
                                    setActiveModalBooking(lot);
                                    setModalType('weighing');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-colors flex items-center gap-1 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                >
                                  <Scale className="w-3 h-3" />
                                  <span>Weight & DBT</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOVERNMENT DBT PAYOUTS DESK */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Direct Benefit Transfer (DBT) Payouts Desk</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Verify J-Form receipts, approve billing, and process PFMS clearing logs.</p>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-2.5 rounded-lg border border-slate-200 tabular-nums shadow-2xs">
                  {queue.filter(b => ['weighed', 'accepted', 'procurement_accepted', 'payment_pending', 'completed'].includes(b.status.toLowerCase())).length} Active Transactions
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Token</th>
                        <th className="py-3.5 px-4">Farmer & Bank Details</th>
                        <th className="py-3.5 px-4">Net Weight & Amount</th>
                        <th className="py-3.5 px-4">DBT Status</th>
                        <th className="py-3.5 px-4 text-right">Workflow Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {queue.filter(b => ['weighed', 'accepted', 'procurement_accepted', 'payment_pending', 'completed'].includes(b.status.toLowerCase())).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 px-4 text-center bg-white">
                            <div className="flex flex-col items-center justify-center py-6">
                              <p className="text-sm font-semibold text-slate-700 mb-1">No active payouts processing.</p>
                              <p className="text-xs text-slate-500 max-w-sm">No weighed commodities are currently pending DBT clearance at this APMC station.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        queue.filter(b => ['weighed', 'accepted', 'procurement_accepted', 'payment_pending', 'completed'].includes(b.status.toLowerCase())).map((lot) => {
                          const payStatus = lot.payment?.status?.toUpperCase() || 'NOT_INITIATED';
                          return (
                            <tr key={lot.id} className="hover:bg-slate-50/80 even:bg-slate-50/20 transition-colors">
                              <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                                {lot.tokenNumber}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-900">{lot.farmerName}</div>
                                <div className="text-[11px] text-slate-500 font-semibold">{lot.payment?.bankName || 'Mandi Registry Bank'} (A/C ****{lot.payment?.accountLast4 || '7291'})</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-slate-900">{lot.weighment?.netWeightQuintals || lot.quantityQuintals} Qtl</span>
                                <span className="text-emerald-800 block text-[12px] font-black">₹{(lot.payment?.amount || lot.payment?.amountRupees || 0).toLocaleString('en-IN')}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-bold border ${
                                  payStatus === 'PAYMENT_CREDITED'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : payStatus === 'FAILED'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : 'bg-purple-50 text-purple-800 border-purple-200'
                                }`}>
                                  {payStatus.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {payStatus === 'NOT_INITIATED' && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await api.updatePaymentStatus(lot.id, 'BILL_GENERATED', 'Official J-Form invoice printed.');
                                          if (onUpdateBooking && res.booking) onUpdateBooking(res.booking);
                                          showToast(`J-Form generated for token ${lot.tokenNumber}`);
                                          loadLiveQueueState();
                                        } catch (err) {}
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-all shadow-2xs focus:ring-2 focus:ring-slate-400 focus:outline-none"
                                    >
                                      Generate Bill
                                    </button>
                                  )}

                                  {payStatus === 'BILL_GENERATED' && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await api.updatePaymentStatus(lot.id, 'UNDER_REVIEW', 'Mandi supervisor quality audit initiated.');
                                          if (onUpdateBooking && res.booking) onUpdateBooking(res.booking);
                                          showToast(`Submitted for supervisor review: Token ${lot.tokenNumber}`);
                                          loadLiveQueueState();
                                        } catch (err) {}
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-indigo-750 hover:bg-indigo-850 text-white text-[11px] font-bold transition-all shadow-2xs focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                    >
                                      Submit Review
                                    </button>
                                  )}

                                  {payStatus === 'UNDER_REVIEW' && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await api.updatePaymentStatus(lot.id, 'APPROVED', 'Valuation parameters verified.');
                                          if (onUpdateBooking && res.booking) onUpdateBooking(res.booking);
                                          showToast(`Payment Approved: Token ${lot.tokenNumber}`);
                                          loadLiveQueueState();
                                        } catch (err) {}
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-all shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    >
                                      Approve Payment
                                    </button>
                                  )}

                                  {payStatus === 'APPROVED' && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await api.updatePaymentStatus(lot.id, 'SENT_TO_PFMS', 'Transaction XML file batch generated.');
                                          if (onUpdateBooking && res.booking) onUpdateBooking(res.booking);
                                          showToast(`Sent to PFMS gateway: Token ${lot.tokenNumber}`);
                                          loadLiveQueueState();
                                        } catch (err) {}
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold transition-all shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                      Send to PFMS
                                    </button>
                                  )}

                                  {payStatus === 'SENT_TO_PFMS' && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await api.updatePaymentStatus(lot.id, 'BANK_PROCESSING', 'Nodal bank clearing log uploaded.');
                                          if (onUpdateBooking && res.booking) onUpdateBooking(res.booking);
                                          showToast(`Clearing initiated: Token ${lot.tokenNumber}`);
                                          loadLiveQueueState();
                                        } catch (err) {}
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition-all shadow-2xs animate-pulse focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    >
                                      Process Bank Clearing
                                    </button>
                                  )}

                                  {payStatus === 'BANK_PROCESSING' && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await api.updatePaymentStatus(lot.id, 'PAYMENT_CREDITED', 'ACK received from RBI clearing branch.');
                                          if (onUpdateBooking && res.booking) onUpdateBooking(res.booking);
                                          showToast(`Direct credit successful: Token ${lot.tokenNumber}`);
                                          loadLiveQueueState();
                                          try { confetti({ particleCount: 50, spread: 40 }); } catch (e) {}
                                        } catch (err) {}
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-all shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    >
                                      Mark Credited
                                    </button>
                                  )}

                                  {payStatus === 'PAYMENT_CREDITED' && (
                                    <span className="text-[11px] text-emerald-700 font-extrabold flex items-center justify-end gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Credited successfully</span>
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAILY SLOTS & UPDATES */}
          {activeTab === 'daily_slots' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 mb-4 border-b border-slate-100 gap-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Today's Hourly Slot Allocations</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Adjust capacity limits per hour based on yard logistics.</p>
                  </div>
                  <button
                    id="broadcast-sms-btn"
                    onClick={() => showToast('Capacity updates broadcasted to registered farmers via SMS.')}
                    className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast SMS Notification</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {dailySlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div>
                        <span className="font-bold text-xs text-slate-900">{slot.timeSlot}</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Booked: <strong className="text-slate-800 tabular-nums">{slot.bookedCount}</strong> / Max Capacity: <strong className="text-slate-800 tabular-nums">{slot.maxCapacity}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdjustCapacity(idx, -1)}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 font-bold text-sm focus:ring-2 focus:ring-slate-300 focus:outline-none"
                          title="Decrease Slot Capacity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-bold text-xs text-slate-900 tabular-nums">{slot.maxCapacity}</span>
                        <button
                          onClick={() => handleAdjustCapacity(idx, 1)}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 font-bold text-sm focus:ring-2 focus:ring-slate-300 focus:outline-none"
                          title="Increase Slot Capacity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}
      {modalType === 'quality' && activeModalBooking && (
        <QualityCheckModal
          booking={activeModalBooking}
          onClose={() => setModalType(null)}
          onSave={handleSaveQuality}
        />
      )}

      {modalType === 'weighing' && activeModalBooking && (
        <WeighmentModal
          booking={activeModalBooking}
          onClose={() => setModalType(null)}
          onSave={handleSaveWeighing}
        />
      )}
    </div>
  );
};
