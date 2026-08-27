import React, { useState, useMemo } from 'react';
import { CropType, Language, BookingSlot, FarmerProfile } from '../../types';
import { availableCrops, procurementCentres, translations } from '../../data/mockData';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  RotateCcw,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getUpcomingCalendarDays, formatRealDate, calculateDynamicETA, formatRealTime } from '../../utils/dateTime';

interface SmartSlotBookingProps {
  farmer: FarmerProfile;
  language: Language;
  onBack: () => void;
  onBookingConfirmed: (slot: BookingSlot) => void;
}

export const SmartSlotBooking: React.FC<SmartSlotBookingProps> = ({
  farmer,
  language,
  onBack,
  onBookingConfirmed
}) => {
  const dynamicCalendarDays = useMemo(() => getUpcomingCalendarDays(7), []);

  const [selectedCrop, setSelectedCrop] = useState<CropType>('paddy');
  const [quantity, setQuantity] = useState<number>(25);
  const [selectedCentre, setSelectedCentre] = useState<string>('centre-karnal');
  const [selectedDate, setSelectedDate] = useState<string>(dynamicCalendarDays[0]?.date || new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:00 AM - 11:00 AM');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const t = translations[language];

  const currentCropObj = availableCrops.find(c => c.id === selectedCrop) || availableCrops[0];
  const estimatedMSPValue = (quantity || 0) * currentCropObj.mspPerQuintal;

  const quickQuintals = [10, 25, 50, 75];

  const timeSlots = [
    { slot: '08:00 AM - 09:00 AM', status: 'Moderate', trafficColor: 'bg-amber-50 text-amber-800 border-amber-200' },
    { slot: '09:00 AM - 10:00 AM', status: 'Optimal', trafficColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { slot: '10:00 AM - 11:00 AM', status: 'Recommended', trafficColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { slot: '11:00 AM - 12:00 PM', status: 'Moderate', trafficColor: 'bg-amber-50 text-amber-800 border-amber-200' },
    { slot: '01:00 PM - 02:00 PM', status: 'Heavy Traffic', trafficColor: 'bg-rose-50 text-rose-800 border-rose-200' },
    { slot: '02:00 PM - 03:00 PM', status: 'Available', trafficColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
  ];

  const handleReset = () => {
    setSelectedCrop('paddy');
    setQuantity(25);
    setSelectedCentre('centre-karnal');
    setSelectedDate(dynamicCalendarDays[0]?.date || new Date().toISOString().split('T')[0]);
    setSelectedTimeSlot('10:00 AM - 11:00 AM');
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setValidationError('Please specify a valid crop quantity in quintals.');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      try {
        confetti({ particleCount: 60, spread: 60 });
      } catch (err) {}

      const selectedDayObj = dynamicCalendarDays.find(d => d.date === selectedDate);
      const formattedBookingDate = selectedDayObj ? selectedDayObj.fullLabel : formatRealDate(selectedDate);
      const generatedTokenInt = Math.floor(100 + Math.random() * 900);

      const newBooking: BookingSlot = {
        id: `bk-${Date.now()}`,
        tokenNumber: `#${generatedTokenInt}`,
        tokenInt: generatedTokenInt,
        farmerId: farmer.id,
        farmerName: farmer.name || 'Rajesh Kumar',
        phone: farmer.phone || '9876543210',
        centreId: selectedCentre,
        centreName: procurementCentres.find(c => c.id === selectedCentre)?.name || 'Karnal APMC Market Yard',
        crop: selectedCrop,
        cropName: currentCropObj.nameEn,
        quantityQuintals: quantity,
        bookingDate: formattedBookingDate,
        timeSlot: selectedTimeSlot,
        vehicleNumber: 'TROLLEY-PASS',
        status: 'confirmed',
        estimatedTurnTime: calculateDynamicETA(18),
        estimatedWaitMinutes: 18,
        createdAt: new Date().toISOString(),
        timeline: {
          bookedTime: formatRealTime(new Date())
        }
      };

      onBookingConfirmed(newBooking);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-6 font-sans">
        <button
          id="booking-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back} to Dashboard</span>
        </button>
        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Step 2 of 2: Schedule Delivery
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans">
        {/* Title Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Book Crop Delivery Slot
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Choose your crop, quantity, and arrival window to bypass mandi bottlenecks.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Reset Selections</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {validationError}
            </div>
          )}

          {/* STEP 1: COMMODITY & QUANTITY */}
          <div className="space-y-4">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Select Commodity & Quantity</span>
            </h2>

            {/* Crops Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableCrops.map((crop) => (
                <button
                  type="button"
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedCrop === crop.id
                      ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-700 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900">{crop.nameEn}</div>
                  <div className="text-xs text-emerald-800 font-extrabold mt-1">
                    ₹{crop.mspPerQuintal.toLocaleString('en-IN')} / Qtl
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Govt MSP Rate</span>
                </button>
              ))}
            </div>

            {/* Quantity Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Estimated Quantity (Quintals)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    id="crop-quantity-input"
                    type="number"
                    min={1}
                    max={200}
                    value={quantity || ''}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    placeholder="25"
                    className="w-28 h-10 px-3 rounded-xl border border-slate-300 font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    required
                  />
                  <span className="text-xs font-bold text-slate-600">Quintals</span>
                </div>

                {/* Quick Selection Chips */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Quick Select:</span>
                  {quickQuintals.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors ${
                        quantity === q
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {q} Qtl
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-5">
                <span className="text-xs font-bold text-slate-500">Government MSP Payout Estimation</span>
                <span className="text-2xl font-black text-emerald-800 mt-0.5">
                  ₹{estimatedMSPValue.toLocaleString('en-IN')}.00
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Direct Benefit Transfer (DBT)
                </span>
              </div>
            </div>
          </div>

          {/* STEP 2: MANDI CENTRE SELECTION */}
          <div className="space-y-4">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[11px] font-bold">2</span>
              <span>Select Mandi Centre</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Procurement Yard Destination
              </label>
              <select
                id="mandi-centre-select"
                value={selectedCentre}
                onChange={(e) => setSelectedCentre(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              >
                {procurementCentres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.distanceKm} km away)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 3: DATE & TIME SELECTION */}
          <div className="space-y-4">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center text-[11px] font-bold">3</span>
              <span>Select Date & Preferred Time Window</span>
            </h2>

            {/* Date Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  Procurement Date
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Real-time Slot Booking
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                {dynamicCalendarDays.map((d) => {
                  const isSelected = selectedDate === d.date;
                  return (
                    <button
                      key={d.date}
                      type="button"
                      disabled={d.isBooked}
                      onClick={() => setSelectedDate(d.date)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        d.isBooked
                          ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-emerald-700 bg-emerald-700 text-white shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`text-[11px] font-semibold ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                        {d.isToday ? 'Today' : d.isTomorrow ? 'Tomorrow' : d.dayName}
                      </div>
                      <div className={`text-base font-black my-0.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>{d.dayNum} {d.monthName}</div>
                      <div className={`text-[10px] font-bold ${isSelected ? 'text-white/90' : d.isBooked ? 'text-slate-400' : 'text-emerald-700'}`}>
                        {d.isBooked ? 'Full' : 'Open'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Hourly Time Window
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {timeSlots.map((ts, idx) => {
                  const isSelected = selectedTimeSlot === ts.slot;
                  const isFull = ts.status === 'Full';

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isFull}
                      onClick={() => setSelectedTimeSlot(ts.slot)}
                      className={`p-3 rounded-xl border text-left transition-all flex justify-between items-center ${
                        isFull
                          ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                          : isSelected
                          ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-700 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900">{ts.slot}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${ts.trafficColor}`}>
                        {ts.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              id="booking-cancel-btn"
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {t.back}
            </button>
            <button
              id="booking-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
            >
              <span>{isSubmitting ? 'Reserving Slot...' : 'Confirm Slot & Generate Token'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
