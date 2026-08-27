import React from 'react';
import { BookingSlot, Language } from '../../types';
import { 
  CheckCircle2, 
  ArrowRight, 
  FileText,
  X
} from 'lucide-react';
import { translations } from '../../data/mockData';

interface BookingSuccessModalProps {
  booking: BookingSlot;
  language: Language;
  onOpenTracker: () => void;
  onOpenPrintSlip: () => void;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  booking,
  language,
  onOpenTracker,
  onOpenPrintSlip,
  onClose
}) => {
  const t = translations[language];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200">
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Slot Successfully Reserved
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your Mandi delivery token is active.
          </p>
        </div>

        {/* Details Box */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Token</span>
            <div className="text-3xl font-black text-emerald-800 my-1">{booking.tokenNumber}</div>
            <div className="text-xs font-medium text-slate-600">
              {booking.bookingDate} • {booking.timeSlot}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs font-medium text-slate-500">
              Booking ID: <span className="font-mono font-bold text-slate-900">{booking.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium block">Commodity</span>
              <span className="font-bold text-slate-900">{booking.cropName} ({booking.quantityQuintals} Qtl)</span>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium block">Vehicle</span>
              <span className="font-bold text-slate-900 font-mono">{booking.vehicleNumber}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenPrintSlip();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Mandi Slip</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenTracker();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Live Tracking</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
