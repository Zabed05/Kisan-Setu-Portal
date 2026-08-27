import React, { useState } from 'react';
import { FarmerProfile, Language, BankAccount } from '../../types';
import { translations } from '../../data/mockData';
import { ArrowLeft, ArrowRight, ShieldCheck, Zap, MapPin } from 'lucide-react';

interface BankRegistrationProps {
  farmer: FarmerProfile;
  language: Language;
  onBack: () => void;
  onSaveBank: (
    bank: BankAccount, 
    updatedName: string, 
    phone: string, 
    aadhaar: string,
    address: string,
    pincode: string,
    latitude?: number,
    longitude?: number
  ) => void;
}

export const BankRegistration: React.FC<BankRegistrationProps> = ({
  farmer,
  language,
  onBack,
  onSaveBank
}) => {
  const isFirstTime = !farmer.name || farmer.name === 'New Farmer User' || !farmer.isVerified;

  const [fullName, setFullName] = useState(isFirstTime ? '' : (farmer.name || ''));
  const [state, setState] = useState(isFirstTime ? '' : (farmer.state || ''));
  const [district, setDistrict] = useState(isFirstTime ? '' : (farmer.district || ''));
  const [village, setVillage] = useState(isFirstTime ? '' : (farmer.village || ''));
  const [pincode, setPincode] = useState(isFirstTime ? '' : (farmer.pincode || ''));
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat?: number; lon?: number } | null>(
    isFirstTime ? null : (farmer.latitude && farmer.longitude ? { lat: farmer.latitude, lon: farmer.longitude } : null)
  );
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const fetchCurrentLocation = () => {
    setIsFetchingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setState('Haryana');
          setDistrict('Karnal');
          setVillage('Nilokheri');
          setPincode('132117');
          setIsFetchingLocation(false);
          setErrorMessage(null);
        },
        (error) => {
          setGpsCoordinates({
            lat: 29.6857,
            lon: 76.9905
          });
          setState('Haryana');
          setDistrict('Karnal');
          setVillage('Nilokheri');
          setPincode('132117');
          setIsFetchingLocation(false);
          setErrorMessage('Location permission denied. Loaded fallback APMC village coordinates.');
        }
      );
    } else {
      setGpsCoordinates({
        lat: 29.6857,
        lon: 76.9905
      });
      setState('Haryana');
      setDistrict('Karnal');
      setVillage('Nilokheri');
      setPincode('132117');
      setIsFetchingLocation(false);
    }
  };
  
  const [bankName, setBankName] = useState(isFirstTime ? '' : (farmer.bankDetails?.bankName || ''));
  const [accountNumber, setAccountNumber] = useState(farmer.bankDetails?.accountNumber || '');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(farmer.bankDetails?.accountNumber || '');
  const [ifsc, setIfsc] = useState(farmer.bankDetails?.ifscCode || '');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const t = translations[language];

  const handleFillDemoBank = () => {
    setFullName('Rajesh Kumar');
    setState('Haryana');
    setDistrict('Karnal');
    setVillage('Nilokheri');
    setPincode('132117');
    setGpsCoordinates({ lat: 29.6857, lon: 76.9905 });
    setBankName('State Bank of India');
    setAccountNumber('31029381729');
    setConfirmAccountNumber('31029381729');
    setIfsc('SBIN0001234');
    setErrorMessage(null);
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!village.trim()) {
      setErrorMessage('Please enter your village name.');
      return;
    }
    if (!bankName) {
      setErrorMessage('Please select your bank name.');
      return;
    }
    if (!accountNumber.trim()) {
      setErrorMessage('Please enter your bank account number.');
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      setErrorMessage('Bank account numbers do not match.');
      return;
    }
    if (ifsc.replace(/\s/g, '').length !== 11) {
      setErrorMessage('IFSC code must be exactly 11 characters.');
      return;
    }
    if (!pincode.trim() || pincode.replace(/\s/g, '').length !== 6) {
      setErrorMessage('Pincode must be exactly 6 digits.');
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    const bankDetails: BankAccount = {
      accountHolder: fullName.trim(),
      bankName,
      accountNumber,
      ifscCode: ifsc.toUpperCase().trim(),
      isVerified: true,
      linkedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    setTimeout(() => {
      // Pass the details to App.tsx saving handler. No Aadhaar parameter is sent!
      onSaveBank(
        bankDetails, 
        fullName.trim(), 
        farmer.phone || '9876543210', 
        '', // Aadhaar hash is blank as Aadhaar is completely removed
        `${village.trim()}, ${district}, ${state}`,
        pincode.trim(),
        gpsCoordinates?.lat || 29.6857,
        gpsCoordinates?.lon || 76.9905
      );
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 font-sans animate-fade-in-up">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          id="back-to-dashboard-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back} to Dashboard</span>
        </button>

        <button
          type="button"
          onClick={handleFillDemoBank}
          className="text-xs font-bold text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 transition-all flex items-center gap-1"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Demo Auto-Fill Profile</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Complete Farmer Profile & Bank Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            One-time setup required to enable Direct Benefit Transfer (DBT) payout transfers.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitProfile} className="space-y-6">
            
            {/* Section 1: Personal Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                1. Personal Details
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name (as registered in Bank Account)
                </label>
                <div className="flex h-11 w-full rounded-lg border border-slate-300 bg-white overflow-hidden transition-all focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20">
                  <input
                    id="profile-name-input"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full h-full px-3.5 text-sm font-semibold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Location details */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                2. Location Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
                  <div className="flex h-11 w-full rounded-lg border border-slate-300 bg-white overflow-hidden transition-all focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20">
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Enter state name"
                      className="w-full h-full px-3.5 text-sm font-semibold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">District</label>
                  <div className="flex h-11 w-full rounded-lg border border-slate-300 bg-white overflow-hidden transition-all focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20">
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Enter district name"
                      className="w-full h-full px-3.5 text-sm font-semibold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Village</label>
                  <div className="flex h-11 w-full rounded-lg border border-slate-300 bg-white overflow-hidden transition-all focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20">
                    <input
                      id="profile-village-input"
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="Enter village name"
                      className="w-full h-full px-3.5 text-sm font-semibold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Pincode</label>
                  <div className="flex h-11 w-full rounded-lg border border-slate-300 bg-white overflow-hidden transition-all focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20">
                    <input
                      id="profile-pincode-input"
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 132117"
                      className="w-full h-full px-3.5 text-sm font-semibold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={fetchCurrentLocation}
                  disabled={isFetchingLocation}
                  className="h-10 px-4 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition-all flex items-center gap-1.5 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{isFetchingLocation ? 'Retrieving GPS Coordinates...' : 'Detect Current Location'}</span>
                </button>
                
                {gpsCoordinates && (
                  <span className="text-[11px] text-slate-500 font-semibold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg select-none">
                    GPS: {gpsCoordinates.lat?.toFixed(5)}, {gpsCoordinates.lon?.toFixed(5)}
                  </span>
                )}
              </div>
            </div>

            {/* Section 3: Bank Account Info */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                3. Bank Account & DBT Routing
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Bank Name</label>
                  <div className="relative h-11 w-full rounded-lg border border-slate-300 bg-white transition-all focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20">
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full h-full px-3 text-sm font-semibold text-slate-900 bg-transparent focus:outline-none select-none appearance-none"
                    >
                      <option value="">Select Bank Name</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">IFSC Code</label>
                  <div className="flex h-11 w-full rounded-lg border border-slate-300 bg-white overflow-hidden transition-all focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20">
                    <input
                      id="profile-ifsc-input"
                      type="text"
                      maxLength={11}
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      placeholder="e.g. SBIN0001234"
                      className="w-full h-full px-3.5 text-sm font-bold tracking-wider text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Bank Account Number</label>
                  <div className="flex h-11 w-full rounded-lg border border-slate-300 bg-white overflow-hidden transition-all focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20">
                    <input
                      id="profile-account-input"
                      type="password"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter account number"
                      className="w-full h-full px-3.5 text-sm font-bold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Bank Account Number</label>
                  <div className="flex h-11 w-full rounded-lg border border-slate-300 bg-white overflow-hidden transition-all focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20">
                    <input
                      id="profile-confirm-account-input"
                      type="text"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Confirm account number"
                      className="w-full h-full px-3.5 text-sm font-bold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-emerald-800">Direct Payouts Setup</h4>
                  <p className="text-[11px] text-emerald-600 font-semibold leading-relaxed">
                    By submitting this form, you authorize automatic Direct Benefit Transfer (DBT) payments to this bank account upon weighment lock approval at mandi centers.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between gap-4">
              <button
                type="button"
                onClick={onBack}
                className="h-11 px-5 rounded-lg border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-11 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-2"
              >
                <span>{isSaving ? 'Saving Profile...' : 'Save & Register Profile'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
