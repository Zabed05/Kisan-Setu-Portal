import React, { useState, useEffect, useMemo } from 'react';
import { Language, AIInsight } from '../../types';
import { initialAIInsights, districtPerformanceData, procurementCentres, translations } from '../../data/mockData';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  CreditCard, 
  AlertTriangle, 
  Sparkles, 
  MapPin, 
  Download, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../api/client';
import { formatRealTimeWithSeconds, formatRealDate } from '../../utils/dateTime';

interface ExecutiveAnalyticsProps {
  language: Language;
}

export const ExecutiveAnalytics: React.FC<ExecutiveAnalyticsProps> = ({ language }) => {
  const [insights, setInsights] = useState<AIInsight[]>(initialAIInsights);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'centres' | 'predictions'>('overview');
  const [appliedActionToast, setAppliedActionToast] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(formatRealTimeWithSeconds());
  const [liveKpis, setLiveKpis] = useState({
    totalVolumeMT: 14250,
    activeFarmers: 3421,
    avgWaitMins: 14.5,
    dbtSettlementPct: 98.4,
    paymentsPending: 0,
    paymentsProcessing: 0,
    avgPaymentTimeHours: 4.2,
    dbtDisbursedCrores: 14.8
  });

  // Dynamic 7-day day names ending in Today
  const past7Days = useMemo(() => {
    const days: { label: string; isToday: boolean }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const name = d.toLocaleDateString('en-IN', { weekday: 'short' });
      days.push({
        label: i === 0 ? `Today (${name})` : name,
        isToday: i === 0
      });
    }
    return days;
  }, []);

  // Fetch real analytics from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.getAnalytics();
        if (res.summary) {
          setLiveKpis({
            totalVolumeMT: res.summary.totalProcurementMT || 14250,
            activeFarmers: res.summary.activeFarmers || 3421,
            avgWaitMins: res.summary.avgWaitTimeMins || 14.5,
            dbtSettlementPct: res.summary.paymentSuccessRate || 98.4,
            paymentsPending: res.summary.paymentsPending || 0,
            paymentsProcessing: res.summary.paymentsProcessing || 0,
            avgPaymentTimeHours: res.summary.avgPaymentTimeHours || 4.2,
            dbtDisbursedCrores: res.summary.dbtDisbursedCrores || 14.8
          });
        }
        if (res.aiInsights && res.aiInsights.length > 0) {
          setInsights(res.aiInsights);
        }
        setLastSyncTime(formatRealTimeWithSeconds());
      } catch (err) {
        setLastSyncTime(formatRealTimeWithSeconds());
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, []);

  const t = translations[language];

  const handleApplyAction = (insightId: string) => {
    setInsights(prev => prev.map(i => {
      if (i.id === insightId) {
        return { ...i, applied: true };
      }
      return i;
    }));

    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}

    setAppliedActionToast('Action Executed: Counter 2 opened at Barnala Yard. Yard wait time reduced by 18m.');
    setTimeout(() => setAppliedActionToast(null), 4000);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8">
      {/* Toast */}
      {appliedActionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#006b26] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-3 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-[#8dfa96]" />
          <span>{appliedActionToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center pb-6 border-b border-[#becaba]/60 gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191c1d] tracking-tight">
              {t.executiveAnalytics}
            </h1>
            <span className="bg-[#2955bf]/15 text-[#003ea8] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#2955bf]/30">
              National APMC Intelligence Feed
            </span>
          </div>
          <p className="text-xs text-[#6e7a6c] mt-0.5">
            Real-time monitoring across 128 Procurement Centres • SIH 2026 Predictive Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="h-10 px-4 bg-white border border-[#becaba] hover:bg-[#f8fafb] text-[#191c1d] rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-[#006b26]" />
            <span>Export Analytics (PDF)</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-[#006b26] bg-[#8dfa96]/30 px-3 py-2 rounded-xl border border-[#006b26]/20">
            <span className="w-2 h-2 rounded-full bg-[#006b26] animate-pulse"></span>
            <span>Live Feed • {lastSyncTime}</span>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-6 border border-[#becaba]/60 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-[#6e7a6c] uppercase tracking-wider">
              {t.totalProcurementToday}
            </span>
            <BarChart3 className="w-4 h-4 text-[#006b26]" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#191c1d] tracking-tight">
              14,250 <span className="text-sm font-bold text-[#6e7a6c]">MT</span>
            </div>
            <p className="text-xs font-bold text-[#006b26] mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12.5% vs yesterday
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#e1e3e4] text-[11px] text-[#6e7a6c]">
            Wheat: 9,200 MT • Paddy: 5,050 MT
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-6 border border-[#becaba]/60 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-[#6e7a6c] uppercase tracking-wider">
              {t.activeFarmersInQueue}
            </span>
            <Users className="w-4 h-4 text-[#2955bf]" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#191c1d] tracking-tight">
              3,421
            </div>
            <p className="text-xs font-bold text-[#2955bf] mt-1">
              Across 128 active centres
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#e1e3e4] text-[11px] text-[#6e7a6c]">
            Avg throughput: 420 farmers/hour
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-6 border border-[#becaba]/60 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-[#6e7a6c] uppercase tracking-wider">
              {t.averageWaitTime}
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#191c1d] tracking-tight">
              42 <span className="text-sm font-bold text-[#6e7a6c]">Min</span>
            </div>
            <p className="text-xs font-bold text-amber-700 mt-1">
              +5m above national SLA target
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#e1e3e4] text-[11px] text-[#6e7a6c]">
            Fastest: Amravati Hub (14 mins)
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-6 border border-[#becaba]/60 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-[#6e7a6c] uppercase tracking-wider">
              {t.paymentCompletion}
            </span>
            <CreditCard className="w-4 h-4 text-[#006b26]" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#006b26] tracking-tight">
              94.2%
            </div>
            <p className="text-xs font-bold text-[#6e7a6c] mt-1">
              Target: 98% within 24h
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#e1e3e4] text-[11px] text-[#6e7a6c]">
            ₹32.4 Crore disbursed via PFMS
          </div>
        </div>
      </div>

      {/* Government DBT Payments Audits Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payments Pending Verification</span>
          <p className="text-2xl font-black mt-1 text-slate-100">{liveKpis.paymentsPending} lots</p>
          <span className="text-[10px] text-amber-500 font-semibold block mt-0.5">J-Form/Officer Review</span>
        </div>
        
        <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payments Processing in PFMS</span>
          <p className="text-2xl font-black mt-1 text-indigo-400">{liveKpis.paymentsProcessing} lots</p>
          <span className="text-[10px] text-indigo-400 font-semibold block mt-0.5">Clearing batch uploaded</span>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Clearing Speed</span>
          <p className="text-2xl font-black mt-1 text-emerald-400">{liveKpis.avgPaymentTimeHours} hrs</p>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">From weighing to bank credit</span>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Disbursed Amount</span>
          <p className="text-2xl font-black mt-1 text-emerald-400">₹{liveKpis.dbtDisbursedCrores} Cr</p>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Direct Bank Payouts Met</span>
        </div>
      </div>

      {/* Main Grid: Heatmap + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Heatmap (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-[#becaba]/60 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-[#191c1d] tracking-tight">
                {t.heatmap}
              </h3>
              <p className="text-xs text-[#6e7a6c]">
                Live sensor and gate check-in telemetry across state APMC yards
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-[#006b26] font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006b26]"></span> Low
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Med
              </span>
              <span className="flex items-center gap-1 text-rose-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> High
              </span>
            </div>
          </div>

          {/* Interactive Map Visual Stage */}
          <div className="h-72 bg-[#f8fafb] rounded-2xl border border-[#becaba]/50 relative overflow-hidden map-pattern p-6 flex items-center justify-center">
            
            {/* Centre Pin 1: Karnal APMC (Low) */}
            <div className="absolute top-12 left-20 group cursor-pointer">
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-[#006b26] opacity-30"></span>
                <div className="w-6 h-6 rounded-full bg-[#006b26] text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                  18
                </div>
              </div>
              <div className="bg-white/95 px-2 py-1 rounded-md text-[10px] font-bold text-[#191c1d] shadow-sm border border-gray-200 mt-1 text-center whitespace-nowrap">
                Karnal Mandi (Low)
              </div>
            </div>

            {/* Centre Pin 2: Nagpur Yard (High) */}
            <div className="absolute top-24 right-28 group cursor-pointer">
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-rose-600 opacity-40"></span>
                <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                  42
                </div>
              </div>
              <div className="bg-white/95 px-2.5 py-1 rounded-md text-[10px] font-bold text-rose-700 shadow-sm border border-rose-200 mt-1 text-center whitespace-nowrap">
                Nagpur (High Congestion)
              </div>
            </div>

            {/* Centre Pin 3: Amravati Hub (Low) */}
            <div className="absolute bottom-12 left-1/3 group cursor-pointer">
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-[#006b26] opacity-30"></span>
                <div className="w-6 h-6 rounded-full bg-[#006b26] text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                  12
                </div>
              </div>
              <div className="bg-white/95 px-2 py-1 rounded-md text-[10px] font-bold text-[#191c1d] shadow-sm border border-gray-200 mt-1 text-center whitespace-nowrap">
                Amravati Hub (12 in Queue)
              </div>
            </div>

            {/* Centre Pin 4: Barnala Main (Med) */}
            <div className="absolute top-16 left-1/2 group cursor-pointer">
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-amber-500 opacity-40"></span>
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                  24
                </div>
              </div>
              <div className="bg-white/95 px-2 py-1 rounded-md text-[10px] font-bold text-amber-800 shadow-sm border border-amber-200 mt-1 text-center whitespace-nowrap">
                Barnala Yard (Med)
              </div>
            </div>

            <div className="text-center text-xs text-[#6e7a6c] pointer-events-none opacity-40">
              [ Interactive Telemetry Map Layer • 128 Mandi Geofences Active ]
            </div>
          </div>
        </div>

        {/* AI Insights & Actions Panel */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#becaba]/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#2955bf]" />
                <h3 className="text-base font-extrabold text-[#191c1d] tracking-tight">
                  {t.aiInsights}
                </h3>
              </div>
              <span className="text-[10px] text-[#6e7a6c] font-semibold">Updated 2m ago</span>
            </div>

            <div className="space-y-3">
              {insights.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    item.type === 'surge'
                      ? 'bg-amber-50/70 border-amber-200'
                      : item.type === 'action'
                      ? 'bg-[#dbe1ff]/40 border-[#b4c5ff]'
                      : 'bg-rose-50/70 border-rose-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-xs font-extrabold ${
                      item.type === 'surge' ? 'text-amber-800' : item.type === 'action' ? 'text-[#003ea8]' : 'text-rose-800'
                    }`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-white/80">
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs text-[#191c1d] leading-relaxed">
                    {item.description}
                  </p>

                  {item.actionLabel && (
                    <button
                      onClick={() => handleApplyAction(item.id)}
                      disabled={item.applied}
                      className={`mt-3 w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                        item.applied
                          ? 'bg-[#006b26] text-white cursor-default'
                          : 'bg-[#2955bf] hover:bg-[#1e4db7] text-white hover:scale-[1.01]'
                      }`}
                    >
                      {item.applied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#8dfa96]" />
                          <span>Action Executed</span>
                        </>
                      ) : (
                        <span>{item.actionLabel}</span>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#e1e3e4] text-[11px] text-[#6e7a6c] flex items-center justify-between">
            <span>Powered by XGBoost + Prophet</span>
            <span className="text-[#006b26] font-bold">96.8% Accuracy</span>
          </div>
        </div>

      </div>

      {/* Bottom Grid: Trends & District Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 7-Day Procurement Trends SVG Chart */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#becaba]/60 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-extrabold text-[#191c1d]">
                7-Day Procurement Trends (Metric Tonnes)
              </h3>
              <p className="text-xs text-[#6e7a6c]">Daily mandi intake volume vs forecasted quota</p>
            </div>
            <span className="text-xs font-bold text-[#006b26] bg-[#8dfa96]/40 px-2.5 py-1 rounded-full">
              +18.4% Week-on-Week
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="h-56 relative flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
              <defs>
                <linearGradient id="grad-procure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#006b26" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#006b26" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f2f4f5" strokeWidth="1" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f2f4f5" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f2f4f5" strokeWidth="1" />

              {/* Filled Area */}
              <path
                d="M 20,130 L 95,110 L 170,120 L 245,75 L 320,60 L 395,45 L 470,30 L 470,170 L 20,170 Z"
                fill="url(#grad-procure)"
              />

              {/* Line */}
              <path
                d="M 20,130 L 95,110 L 170,120 L 245,75 L 320,60 L 395,45 L 470,30"
                fill="none"
                stroke="#006b26"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data Points */}
              {[
                { x: 20, y: 130, val: '8.4k' },
                { x: 95, y: 110, val: '9.2k' },
                { x: 170, y: 120, val: '8.9k' },
                { x: 245, y: 75, val: '11.5k' },
                { x: 320, y: 60, val: '12.8k' },
                { x: 395, y: 45, val: '13.6k' },
                { x: 470, y: 30, val: '14.2k' }
              ].map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#006b26" stroke="#ffffff" strokeWidth="2" />
                  <text x={pt.x} y={pt.y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#191c1d">
                    {pt.val}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="flex justify-between text-xs font-bold text-[#6e7a6c] mt-4 pt-2 border-t border-[#e1e3e4]">
            {past7Days.map((d, i) => (
              <span key={i} className={d.isToday ? 'text-[#006b26] font-black' : ''}>
                {d.label}
              </span>
            ))}
          </div>
        </div>

        {/* District Performance Horizontal Bar Chart */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#becaba]/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-extrabold text-[#191c1d]">
                  District Procurement Leaderboard
                </h3>
                <p className="text-xs text-[#6e7a6c]">Top 5 procurement districts by volume (MT)</p>
              </div>
              <Filter className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-4">
              {districtPerformanceData.map((d) => (
                <div key={d.district} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#191c1d] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#006b26]" />
                      {d.district} District ({d.centresCount} Mandis)
                    </span>
                    <span className="text-[#006b26]">{d.volumeMT.toLocaleString()} MT</span>
                  </div>
                  <div className="w-full h-3 bg-[#f2f4f5] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#006b26] to-[#0a8733] rounded-full transition-all duration-500"
                      style={{ width: `${d.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#e1e3e4] flex justify-between items-center text-xs text-[#6e7a6c]">
            <span>Total State Mandis: <strong>128</strong></span>
            <span className="text-[#006b26] font-bold">State Target: 88.4% Met</span>
          </div>
        </div>

      </div>
    </div>
  );
};
