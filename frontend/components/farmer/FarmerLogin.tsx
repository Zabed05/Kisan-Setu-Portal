import React, { useState } from 'react';
import { Language, UserRole } from '../../types';
import { 
  Building2, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Languages, 
  KeyRound, 
  Phone,
  CheckCircle2,
  Sparkles,
  Zap,
  Sprout
} from 'lucide-react';
import { translations } from '../../data/mockData';
import { api } from '../../api/client';

interface FarmerLoginProps {
  language: Language;
  onToggleLanguage: () => void;
  onLoginSuccess: (role: UserRole, farmerProfile?: any, profileCompleted?: boolean) => void;
  onGoToRegister: () => void;
}

export const FarmerLogin: React.FC<FarmerLoginProps> = ({
  language,
  onToggleLanguage,
  onLoginSuccess,
  onGoToRegister
}) => {
  const [activeTab, setActiveTab] = useState<'farmer' | 'operator'>('farmer');
  
  // Clean Empty Auth State
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerOtp, setFarmerOtp] = useState('');
  
  // Clean Mandi Center Auth State
  const [operatorPhone, setOperatorPhone] = useState('');
  const [operatorOtp, setOperatorOtp] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = translations[language];

  const handleFillDemoFarmer = () => {
    setFarmerPhone('9876543210');
    setFarmerOtp('123456');
    setErrorMessage(null);
  };

  const handleFillDemoOperator = () => {
    setOperatorPhone('9812345670');
    setOperatorOtp('456789');
    setErrorMessage(null);
  };

  const handleFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (farmerPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!farmerOtp) {
      setErrorMessage('Please enter the 6-digit OTP.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await api.verifyFarmerOtp(farmerPhone, farmerOtp);
      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      onLoginSuccess('farmer', res.farmerProfile, res.profileCompleted);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Connection failed. Please retry.');
    }
  };

  const handleOperatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (operatorPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!operatorOtp) {
      setErrorMessage('Please enter the operator OTP.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await api.verifyMandiOtp(operatorPhone, operatorOtp);
      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      onLoginSuccess('operator');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Connection failed. Please retry.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50/70">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Top Header */}
        <div className="p-6 pb-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sprout className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-base text-slate-900 leading-tight tracking-tight truncate">
                Kisan Setu Portal
              </h1>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {language === 'hi' ? 'स्मार्ट अधिप्राप्ति एवं डीबीटी मंच' : 'Smart Procurement & DBT Platform'}
              </p>
            </div>
          </div>

          {/* Language Toggle */}
          <button
            id="login-language-btn"
            onClick={onToggleLanguage}
            className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors bg-white flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
            title="Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>

        {/* Role Switcher Tabs */}
        <div className="px-6 pt-5 pb-1">
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              id="tab-farmer-login"
              type="button"
              onClick={() => {
                setActiveTab('farmer');
                setErrorMessage(null);
              }}
              className={`h-10 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'farmer'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className={`w-3.5 h-3.5 ${activeTab === 'farmer' ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>{language === 'hi' ? 'किसान लॉगिन' : 'Farmer Login'}</span>
            </button>

            <button
              id="tab-operator-login"
              type="button"
              onClick={() => {
                setActiveTab('operator');
                setErrorMessage(null);
              }}
              className={`h-10 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'operator'
                  ? 'bg-white text-blue-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className={`w-3.5 h-3.5 ${activeTab === 'operator' ? 'text-blue-700' : 'text-slate-400'}`} />
              <span>{language === 'hi' ? 'मंडी केंद्र' : 'Mandi Center'}</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 pt-5">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'farmer' ? (
            /* FARMER LOGIN FLOW */
            <form onSubmit={handleFarmerSubmit} className="space-y-4">
              
              {/* Phone Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'किसान मोबाइल नंबर' : 'Farmer Mobile Number'}
                </label>
                <div className="flex h-11 w-full rounded-lg border border-slate-300 bg-white overflow-hidden transition-all focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20">
                  <div className="flex items-center justify-center bg-slate-50 px-3.5 text-xs font-bold text-slate-600 border-r border-slate-200 select-none">
                    +91
                  </div>
                  <input
                    id="farmer-phone-input"
                    type="tel"
                    maxLength={10}
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="flex-1 h-full px-3.5 text-sm font-semibold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* OTP Field */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-bold text-slate-700">
                    {language === 'hi' ? 'ओटीपी (OTP)' : 'Verification Code (OTP)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setFarmerOtp('123456')}
                    className="font-bold text-slate-500 hover:text-emerald-700 text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-dashed border-slate-300 transition-colors"
                  >
                    Sandbox OTP: 123456
                  </button>
                </div>
                <div className="flex h-11 w-full rounded-lg border border-slate-300 bg-white overflow-hidden transition-all focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20">
                  <input
                    id="farmer-otp-input"
                    type="text"
                    maxLength={6}
                    value={farmerOtp}
                    onChange={(e) => setFarmerOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full h-full px-3.5 text-sm font-bold tracking-wider text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal"
                    required
                  />
                </div>
              </div>

              {/* Demo Helper Button */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={handleFillDemoFarmer}
                  className="w-full h-9 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 text-[11px] font-bold transition-all border border-dashed border-slate-300 flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3 h-3 text-slate-400 fill-slate-300" />
                  <span>Sandbox Auto-Fill: Farmer Credentials</span>
                </button>
              </div>

              {/* Submit Button */}
              <button
                id="farmer-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 mt-1"
              >
                <span>{isLoading ? 'Verifying...' : (language === 'hi' ? 'लॉगिन करें' : 'Sign In as Farmer')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Register Link */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
                <button
                  type="button"
                  onClick={onGoToRegister}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-950 inline-flex items-center justify-center gap-1.5 transition-colors group"
                >
                  <span>{language === 'hi' ? 'नया किसान? प्रोफ़ाइल और बैंक विवरण पूरा करें' : 'New Farmer? Complete Profile & Bank Registry'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </form>
          ) : (
            /* MANDI CENTER LOGIN FLOW */
            <form onSubmit={handleOperatorSubmit} className="space-y-4">
              
              {/* Officer Phone Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'अधिकारी संपर्क नंबर' : 'Center Officer Contact Number'}
                </label>
                <div className="flex h-11 w-full rounded-lg border border-slate-300 bg-white overflow-hidden transition-all focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-700/20">
                  <div className="flex items-center justify-center bg-slate-50 px-3.5 text-xs font-bold text-slate-600 border-r border-slate-200 select-none">
                    +91
                  </div>
                  <input
                    id="operator-phone-input"
                    type="tel"
                    maxLength={10}
                    value={operatorPhone}
                    onChange={(e) => setOperatorPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="flex-1 h-full px-3.5 text-sm font-semibold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Access Code / OTP */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-bold text-slate-700">
                    {language === 'hi' ? 'ऑपरेटर पिन / ओटीपी' : 'Operator Access Code / OTP'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setOperatorOtp('456789')}
                    className="font-bold text-slate-500 hover:text-blue-700 text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-dashed border-slate-300 transition-colors"
                  >
                    Sandbox Code: 456789
                  </button>
                </div>
                <div className="flex h-11 w-full rounded-lg border border-slate-300 bg-white overflow-hidden transition-all focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-700/20">
                  <input
                    id="operator-otp-input"
                    type="text"
                    maxLength={6}
                    value={operatorOtp}
                    onChange={(e) => setOperatorOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full h-full px-3.5 text-sm font-bold tracking-wider text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal"
                    required
                  />
                </div>
              </div>

              {/* Demo Helper Button */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={handleFillDemoOperator}
                  className="w-full h-9 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 text-[11px] font-bold transition-all border border-dashed border-slate-300 flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3 h-3 text-slate-400 fill-slate-300" />
                  <span>Sandbox Auto-Fill: Mandi Credentials</span>
                </button>
              </div>

              {/* Submit Button */}
              <button
                id="operator-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white font-bold text-sm rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 mt-1"
              >
                <span>{isLoading ? 'Authenticating...' : (language === 'hi' ? 'मंडी केंद्र में प्रवेश करें' : 'Sign In to Mandi Operations')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
                Authorized Mandi Staff • Karnal APMC Yard Desk
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
