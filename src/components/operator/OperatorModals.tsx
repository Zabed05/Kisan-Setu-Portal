import React, { useState } from 'react';
import { BookingSlot } from '../../types';
import { 
  CheckCircle2, 
  X, 
  FlaskConical, 
  Scale,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Info
} from 'lucide-react';
import { calculateQualityValuation, calculateLotPayout, CROP_QUALITY_SPECS } from '../../utils/qualityValuation';

interface QualityCheckModalProps {
  booking: BookingSlot;
  onClose: () => void;
  onSave: (data: { 
    grade: 'A' | 'FAQ' | 'B' | 'REJECTED'; 
    moisture: number; 
    foreignMatter: number; 
    remarks: string;
    effectiveRatePerQuintal: number;
    qualityAdjustmentPerQtl: number;
  }) => void;
}

export const QualityCheckModal: React.FC<QualityCheckModalProps> = ({
  booking,
  onClose,
  onSave
}) => {
  const cropSpec = CROP_QUALITY_SPECS[booking.crop] || CROP_QUALITY_SPECS.wheat;
  const [moisture, setMoisture] = useState(booking.qualityCheck?.moisturePercentage || cropSpec.optimalMoisture);
  const [grade, setGrade] = useState<'A' | 'FAQ' | 'B' | 'REJECTED'>(booking.qualityCheck?.grade || 'A');
  const [foreignMatter, setForeignMatter] = useState(booking.qualityCheck?.foreignMatterPercentage || 0.8);
  const [remarks, setRemarks] = useState(booking.qualityCheck?.remarks || 'Grain sampling verified under Fair Average Quality (FAQ) norms.');

  // Real-time dynamic quality valuation
  const valuation = calculateQualityValuation(booking.crop, moisture, foreignMatter, grade);
  const lotPayout = calculateLotPayout(booking.quantityQuintals, valuation);

  const handleGradeSelect = (g: 'A' | 'FAQ' | 'B' | 'REJECTED') => {
    setGrade(g);
    if (g === 'A') {
      setMoisture(cropSpec.optimalMoisture);
      setForeignMatter(0.6);
    } else if (g === 'FAQ') {
      setMoisture(cropSpec.maxFaqMoisture);
      setForeignMatter(1.2);
    } else if (g === 'B') {
      setMoisture(cropSpec.maxRelaxedMoisture);
      setForeignMatter(2.0);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900">Quality Inspection & Pricing Grading</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">FAQ Norms</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Token {booking.tokenNumber} • {booking.farmerName} • {booking.cropName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Quality & Moisture Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Moisture Content (%)</span>
                <span className="text-[10px] text-slate-400 font-medium">Safe Limit: {cropSpec.maxFaqMoisture}%</span>
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="30"
                  value={moisture}
                  onChange={(e) => setMoisture(Number(e.target.value))}
                  className="w-28 h-10 px-3 rounded-xl border border-slate-300 font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
                <span className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border ${
                  valuation.isOptimal 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : valuation.passed
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {valuation.isOptimal ? 'Optimal' : valuation.passed ? 'FAQ Acceptable' : 'Exceeds Tolerance'}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Foreign Matter / Refraction (%)</span>
                <span className="text-[10px] text-slate-400 font-medium">Max Limit: {cropSpec.maxFaqForeignMatter}%</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={foreignMatter}
                onChange={(e) => setForeignMatter(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Assigned Quality Grade Buttons */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Assigned Mandi Quality Grade
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['A', 'FAQ', 'B', 'REJECTED'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGradeSelect(g)}
                  className={`py-2 px-2 rounded-xl border text-center font-bold transition-all ${
                    grade === g
                      ? g === 'A'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-700'
                        : g === 'FAQ'
                        ? 'border-blue-700 bg-blue-50 text-blue-900 ring-2 ring-blue-700'
                        : g === 'B'
                        ? 'border-amber-700 bg-amber-50 text-amber-900 ring-2 ring-amber-700'
                        : 'border-rose-700 bg-rose-50 text-rose-900 ring-2 ring-rose-700'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-xs font-black">
                    {g === 'A' ? 'Grade A' : g === 'FAQ' ? 'Grade FAQ' : g === 'B' ? 'Grade B' : 'Reject'}
                  </div>
                  <div className="text-[10px] opacity-80 font-medium">
                    {g === 'A' ? '+2% Bonus' : g === 'FAQ' ? '100% MSP' : g === 'B' ? '-2.5% Cut' : '0 Payout'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Quality Valuation Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Fair Average Quality (FAQ) Valuation Breakdown</span>
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                valuation.qualityStatus === 'PREMIUM_BONUS'
                  ? 'bg-emerald-100 text-emerald-800'
                  : valuation.qualityStatus === 'STANDARD_FAQ'
                  ? 'bg-blue-100 text-blue-800'
                  : valuation.qualityStatus === 'SUB_FAQ_DEDUCTION'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {valuation.qualityStatus.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-500 block text-[11px]">Base MSP Rate:</span>
                <strong className="text-slate-900 text-sm font-bold">₹{valuation.baseMspRate}/Qtl</strong>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Quality Incentive/Cut:</span>
                <strong className={`text-sm font-bold flex items-center gap-0.5 ${
                  valuation.qualityAdjustmentPerQtl > 0 
                    ? 'text-emerald-700' 
                    : valuation.qualityAdjustmentPerQtl < 0 
                    ? 'text-rose-700' 
                    : 'text-slate-700'
                }`}>
                  {valuation.qualityAdjustmentPerQtl > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 inline" />
                  ) : valuation.qualityAdjustmentPerQtl < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5 inline" />
                  ) : null}
                  {valuation.qualityAdjustmentPerQtl >= 0 ? '+' : ''}₹{valuation.qualityAdjustmentPerQtl}/Qtl
                </strong>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Effective Procured Rate:</span>
                <strong className="text-emerald-800 text-sm font-black">₹{valuation.effectiveRatePerQuintal}/Qtl</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">
                Estimated Lot Value ({booking.quantityQuintals} Qtl):
              </span>
              <span className="text-base font-black text-emerald-800">
                ₹{lotPayout.finalPayout.toLocaleString('en-IN')}.00
              </span>
            </div>

            <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200">
              {valuation.explanationEn}
            </p>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Official Quality Inspector Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave({ 
              grade: valuation.grade, 
              moisture, 
              foreignMatter, 
              remarks,
              effectiveRatePerQuintal: valuation.effectiveRatePerQuintal,
              qualityAdjustmentPerQtl: valuation.qualityAdjustmentPerQtl
            })}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Issue Quality Certificate & Lock Rate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface WeighmentModalProps {
  booking: BookingSlot;
  onClose: () => void;
  onSave: (data: { 
    grossWeightKg: number; 
    tareWeightKg: number; 
    netWeightKg: number; 
    netQuintals: number;
    effectiveRatePerQuintal: number;
    totalAmount: number;
  }) => void;
}

export const WeighmentModal: React.FC<WeighmentModalProps> = ({
  booking,
  onClose,
  onSave
}) => {
  const initialGross = booking.weighment?.grossWeightKg || Math.round((booking.quantityQuintals * 100) + 2150);
  const initialTare = booking.weighment?.tareWeightKg || 2150;

  const [grossWeight, setGrossWeight] = useState(initialGross);
  const [tareWeight, setTareWeight] = useState(initialTare);

  const cropSpec = CROP_QUALITY_SPECS[booking.crop] || CROP_QUALITY_SPECS.wheat;
  const baseMspRate = cropSpec.baseMsp;
  
  // Use inspected rate or default base MSP
  const effectiveRate = booking.qualityCheck?.effectiveRatePerQuintal || baseMspRate;
  const qualityGrade = booking.qualityCheck?.grade || 'FAQ';
  const qualityAdjustment = booking.qualityCheck?.qualityAdjustmentPerQtl || 0;

  const netWeightKg = Math.max(0, grossWeight - tareWeight);
  const netQuintals = Number((netWeightKg / 100).toFixed(2));
  
  const baseTotal = Number((netQuintals * baseMspRate).toFixed(2));
  const qualityAdjTotal = Number((netQuintals * qualityAdjustment).toFixed(2));
  const finalTotalAmount = Number((netQuintals * effectiveRate).toFixed(2));

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900">Weighbridge Electronic Station</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Calibrated
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Token {booking.tokenNumber} • {booking.vehicleNumber} • {booking.farmerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Gross Weight (Loaded Vehicle)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
                <span className="font-bold text-slate-500 text-xs">KG</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Tare Weight (Empty Vehicle)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tareWeight}
                  onChange={(e) => setTareWeight(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
                <span className="font-bold text-slate-500 text-xs">KG</span>
              </div>
            </div>
          </div>

          {/* Quality Grade & Valuation Summary Strip */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-blue-700" />
              <div>
                <span className="font-bold text-blue-950 text-xs">Applied Quality Rating: Grade {qualityGrade}</span>
                <span className="text-[11px] text-blue-700 block">
                  Moisture: {booking.qualityCheck?.moisturePercentage || 11.5}% • Quality Incentive: {qualityAdjustment >= 0 ? '+' : ''}₹{qualityAdjustment}/Qtl
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-blue-800 block font-medium">Effective Rate</span>
              <strong className="text-sm font-black text-blue-950">₹{effectiveRate}/Qtl</strong>
            </div>
          </div>

          {/* Calculated Output & DBT Payout Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Net Procured Grain Weight:</span>
              <span className="text-sm font-black text-slate-900">
                {netWeightKg.toLocaleString()} KG ({netQuintals} Quintals)
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Base MSP Valuation ({netQuintals} Qtl × ₹{baseMspRate}):</span>
              <span className="font-semibold text-slate-700">₹{baseTotal.toLocaleString('en-IN')}.00</span>
            </div>

            {qualityAdjustment !== 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  Quality Differential ({qualityAdjustment > 0 ? '+2% Grade A Bonus' : 'Moisture/Refraction Cut'}):
                </span>
                <span className={`font-bold ${qualityAdjTotal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {qualityAdjTotal >= 0 ? '+' : ''}₹{qualityAdjTotal.toLocaleString('en-IN')}.00
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Final Approved Government DBT Settlement</span>
                <span className="text-[10px] text-emerald-700 font-medium">Direct Transfer to PFMS Registered Bank Account</span>
              </div>
              <span className="text-lg sm:text-xl font-black text-emerald-800">
                ₹{finalTotalAmount.toLocaleString('en-IN')}.00
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave({ 
              grossWeightKg: grossWeight, 
              tareWeightKg: tareWeight, 
              netWeightKg, 
              netQuintals,
              effectiveRatePerQuintal: effectiveRate,
              totalAmount: finalTotalAmount
            })}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Lock Weighment & Trigger DBT Payment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
