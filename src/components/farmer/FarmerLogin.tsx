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
  Sprout,
  Calendar,
  Coins,
  Activity
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
    <div className="min-h-screen flex flex-col justify-between relative bg-cover bg-center bg-no-repeat font-sans" style={{ backgroundImage: "url('/login-bg.jpg')" }}>
      {/* Light transparent mask layer for content contrast */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-0"></div>

      {/* Main Grid Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 md:py-16 flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Title and Benefit Icons (Hidden on Mobile) */}
        <div className="hidden md:flex flex-col space-y-8 text-slate-900 animate-fade-in-up md:col-span-5">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900">
              Smart Procurement.<br />
              <span className="text-emerald-800">Stronger Farmers.</span><br />
              Better Tomorrow.
            </h1>
            <div className="w-16 h-1 bg-emerald-700 rounded"></div>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed mt-4">
              AI-Powered Queue Intelligence, Transparent Procurement & Direct Benefit Transfer.
            </p>
          </div>

          {/* Benefit lists */}
          <div className="space-y-5">
            {/* Benefit 1 */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-white shadow-xs border border-slate-100 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Book Smart Slots</h4>
                <p className="text-xs text-slate-500 font-semibold">Avoid long queues and save valuable time</p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-white shadow-xs border border-slate-100 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">AI Queue Tracking</h4>
                <p className="text-xs text-slate-500 font-semibold">Get real-time wait updates and smart predictions</p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-white shadow-xs border border-slate-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Transparent Process</h4>
                <p className="text-xs text-slate-500 font-semibold">Track every step from entry to payment</p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-white shadow-xs border border-slate-100 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Secure Payments</h4>
                <p className="text-xs text-slate-500 font-semibold">Direct benefit transfer to your bank</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: The Login Card */}
        <div className="w-full max-w-md bg-white/95 rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-scale-in hover:shadow-2xl transition-all duration-300 backdrop-blur-xs flex flex-col justify-between md:col-span-4">
          <div>
            {/* Top Header */}
            <div className="p-6 pb-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white/50">
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
                    <span>{isLoading ? 'Authenticating...' : (language === 'hi' ? 'लॉगिन करें' : 'Sign In as Farmer')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Register Trigger */}
                  <div className="pt-2 text-center">
                    <button
                      id="login-register-link"
                      type="button"
                      onClick={onGoToRegister}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                    >
                      <span>New Farmer? Complete Profile & Bank Registry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                /* OPERATOR LOGIN FLOW */
                <form onSubmit={handleOperatorSubmit} className="space-y-4">
                  {/* Phone Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'hi' ? 'ऑपरेटर मोबाइल नंबर' : 'Operator Mobile Number'}
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

        {/* Right Empty Spacing for background farmer */}
        <div className="hidden md:block md:col-span-3"></div>
      </div>

      {/* Styled Mockup Sub-Footer (3 columns) */}
      <div className="relative z-10 w-full bg-slate-100/90 border-t border-slate-200/60 backdrop-blur-xs select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left text-xs font-semibold text-slate-600">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Secured & Trusted</p>
              <p className="text-[10px] text-slate-500 font-semibold">Your data is fully protected</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 md:border-x md:border-slate-200 px-4">
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Government of India</p>
              <p className="text-[10px] text-slate-500 font-semibold">Digital India Initiative</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-2.5">
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Empowering Farmers</p>
              <p className="text-[10px] text-slate-500 font-semibold">Building a #ViksitBharat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
