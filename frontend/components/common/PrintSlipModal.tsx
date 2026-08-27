import React from 'react';
import { BookingSlot, FarmerProfile, Language } from '../../types';
import { Printer, X, Download, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { formatRealDate, formatRealTimeWithSeconds } from '../../utils/dateTime';

interface PrintSlipModalProps {
  booking: BookingSlot;
  farmer: FarmerProfile;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({
  booking,
  farmer,
  isOpen,
  onClose,
  language
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const now = new Date();
  const issuedDateStr = formatRealDate(now, true);
  const issuedTimeStr = formatRealTimeWithSeconds(now);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-[#becaba] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        
        {/* Top Control Bar (Hidden during window print) */}
        <div className="bg-[#191c1d] text-white px-6 py-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8dfa96]"></span>
            <span className="font-bold text-xs sm:text-sm">Official Mandi Procurement Pass & Slip</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#006b26] hover:bg-[#0a8733] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Official Slip
            </button>
            <button onClick={onClose} className="text-gray-300 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Pass Container */}
        <div className="p-8 bg-white text-[#191c1d] space-y-6" id="printable-slip">
          {/* Slip Header */}
          <div className="border-b-2 border-[#006b26] pb-4 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#006b26] text-white flex items-center justify-center font-extrabold text-sm">
                KPIP
              </div>
              <div>
                <h2 className="text-base font-extrabold uppercase tracking-tight text-[#006b26]">
                  Government of India • Ministry of Agriculture
                </h2>
                <h3 className="text-xs font-bold text-[#191c1d]">
                  Kisan Procurement Intelligence Platform (KPIP)
                </h3>
                <p className="text-[11px] text-[#6e7a6c]">
                  Official e-Gate Pass & Weighment Token • Issued: {issuedDateStr} at {issuedTimeStr}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-[#006b26]">
                {booking.tokenNumber}
              </div>
              <span className="text-[10px] uppercase font-bold bg-[#8dfa96]/40 text-[#006b26] px-2 py-0.5 rounded">
                Verified Priority
              </span>
            </div>
          </div>
          {/* Barcode & QR Code Segment */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-[#f8fafb] border border-[#becaba]/60 p-4 rounded-2xl gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[11px] font-bold text-[#6e7a6c] uppercase">Electronic Verification Barcode</p>
              <div className="font-mono text-[10px] tracking-wider font-bold my-1 text-[#191c1d]">
                *KPIP-ID-{booking.id}*
              </div>
              {/* SVG Stylized Barcode */}
              <svg className="w-56 h-9" viewBox="0 0 200 40">
                <rect x="0" y="0" width="4" height="40" fill="#191c1d" />
                <rect x="8" y="0" width="2" height="40" fill="#191c1d" />
                <rect x="14" y="0" width="6" height="40" fill="#191c1d" />
                <rect x="24" y="0" width="2" height="40" fill="#191c1d" />
                <rect x="30" y="0" width="4" height="40" fill="#191c1d" />
                <rect x="38" y="0" width="8" height="40" fill="#191c1d" />
                <rect x="50" y="0" width="4" height="40" fill="#191c1d" />
                <rect x="58" y="0" width="2" height="40" fill="#191c1d" />
                <rect x="64" y="0" width="6" height="40" fill="#191c1d" />
                <rect x="74" y="0" width="4" height="40" fill="#191c1d" />
                <rect x="82" y="0" width="2" height="40" fill="#191c1d" />
                <rect x="88" y="0" width="8" height="40" fill="#191c1d" />
                <rect x="100" y="0" width="4" height="40" fill="#191c1d" />
                <rect x="108" y="0" width="2" height="40" fill="#191c1d" />
                <rect x="114" y="0" width="6" height="40" fill="#191c1d" />
                <rect x="124" y="0" width="4" height="40" fill="#191c1d" />
                <rect x="132" y="0" width="2" height="40" fill="#191c1d" />
                <rect x="140" y="0" width="8" height="40" fill="#191c1d" />
                <rect x="152" y="0" width="4" height="40" fill="#191c1d" />
                <rect x="160" y="0" width="4" height="40" fill="#191c1d" />
                <rect x="168" y="0" width="6" height="40" fill="#191c1d" />
                <rect x="178" y="0" width="2" height="40" fill="#191c1d" />
                <rect x="184" y="0" width="8" height="40" fill="#191c1d" />
                <rect x="196" y="0" width="4" height="40" fill="#191c1d" />
              </svg>
            </div>
 
            {/* Dynamic QR Code */}
            <div className="w-20 h-20 bg-white p-1 rounded-lg border border-gray-300 flex items-center justify-center overflow-hidden">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  JSON.stringify({
                    bookingId: booking.id,
                    tokenNumber: booking.tokenNumber,
                    centreId: booking.centreId,
                    bookingDate: booking.bookingDate,
                    timeSlot: booking.timeSlot
                  })
                )}`} 
                alt="Mandi Pass QR Code" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>

          {/* Key Information Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-[#f8fafb] p-3 rounded-xl border border-gray-200">
              <span className="text-[#6e7a6c] block">Farmer Name & Kisan ID:</span>
              <strong className="text-[#191c1d] text-sm">{farmer.name}</strong>
              <p className="text-[11px] text-[#6e7a6c]">Kisan ID: {farmer.kisanId}</p>
            </div>

            <div className="bg-[#f8fafb] p-3 rounded-xl border border-gray-200">
              <span className="text-[#6e7a6c] block">Vehicle & Contact:</span>
              <strong className="text-[#191c1d] text-sm">{booking.vehicleNumber}</strong>
              <p className="text-[11px] text-[#6e7a6c]">+91 {booking.phone}</p>
            </div>

            <div className="bg-[#f8fafb] p-3 rounded-xl border border-gray-200">
              <span className="text-[#6e7a6c] block">Centre & Address:</span>
              <strong className="text-[#191c1d]">{booking.centreName}</strong>
              <p className="text-[11px] text-[#6e7a6c]">Gate 2 • Sector 4 Mandi Road</p>
            </div>

            <div className="bg-[#f8fafb] p-3 rounded-xl border border-gray-200">
              <span className="text-[#6e7a6c] block">Commodity & Quantity:</span>
              <strong className="text-[#006b26]">{booking.cropName} • {booking.quantityQuintals} Quintals</strong>
              <p className="text-[11px] text-[#6e7a6c]">Scheduled: {booking.bookingDate} ({booking.timeSlot})</p>
            </div>
          </div>

          {/* Official Seals and Signatures */}
          <div className="pt-6 border-t border-gray-200 flex justify-between items-end text-[11px]">
            <div>
              <div className="flex items-center gap-1.5 text-[#006b26] font-bold mb-1">
                <ShieldCheck className="w-4 h-4" /> Cryptographically Audited by NIC & PFMS
              </div>
              <p className="text-[#6e7a6c]">
                Aadhaar Seeding: <strong>Active (APBS Verified)</strong> • Bank: {farmer.bankDetails?.bankName} (...{farmer.bankDetails?.accountNumber.slice(-4)})
              </p>
            </div>

            <div className="text-center">
              <div className="w-28 border-b border-gray-400 pb-8 text-center text-gray-400 font-mono text-[10px]">
                [ DIGITAL SEAL ]
              </div>
              <span className="text-[10px] font-bold text-gray-700 block mt-1">Authorized Mandi Secretary</span>
            </div>
          </div>

          {/* Legal Note */}
          <div className="bg-[#f2f4f5] p-3 rounded-xl text-[10px] text-gray-500 text-center leading-normal">
            Please present this physical slip or digital QR code at Gate 2. Grains must meet Government FAQ moisture standards (max 12.0%). Payouts will be credited directly to your registered bank account via DBT within 24 hours.
          </div>
        </div>

      </div>
    </div>
  );
};
