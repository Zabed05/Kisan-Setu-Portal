import { CropInfo, ProcurementCentre, BookingSlot, AIInsight, DistrictMetric, FarmerProfile } from '../types';
import { getTodayISODate, formatRealDate, formatRealTime, calculateDynamicETA } from '../utils/dateTime';

export const initialFarmerProfile: FarmerProfile = {
  id: 'farmer-101',
  kisanId: '8829-1029',
  name: 'Rajesh Kumar',
  phone: '9876543210',
  avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
  state: 'Haryana',
  district: 'Karnal',
  village: 'Nilokheri',
  isVerified: false,
  bankDetails: undefined
};

export const availableCrops: CropInfo[] = [
  {
    id: 'wheat',
    nameEn: 'Wheat (Gehu)',
    nameHi: 'गेहूँ (Gehu)',
    mspPerQuintal: 2275,
    maxBookingQuintals: 50,
    icon: 'grass',
    category: 'Rabi'
  },
  {
    id: 'paddy',
    nameEn: 'Paddy (Dhaan)',
    nameHi: 'धान (Dhaan)',
    mspPerQuintal: 2300,
    maxBookingQuintals: 75,
    icon: 'grain',
    category: 'Kharif'
  },
  {
    id: 'mustard',
    nameEn: 'Mustard (Sarson)',
    nameHi: 'सरसों (Sarson)',
    mspPerQuintal: 5650,
    maxBookingQuintals: 30,
    icon: 'eco',
    category: 'Rabi'
  },
  {
    id: 'cotton',
    nameEn: 'Cotton (Kapas)',
    nameHi: 'कपास (Kapas)',
    mspPerQuintal: 7122,
    maxBookingQuintals: 40,
    icon: 'park',
    category: 'Commercial'
  }
];

export const procurementCentres: ProcurementCentre[] = [
  {
    id: 'centre-karnal',
    name: 'Karnal APMC Market',
    district: 'Karnal',
    state: 'Haryana',
    address: 'Sector 4, Karnal Mandi Road, Haryana - 132001',
    distanceKm: 2.4,
    isOpen: true,
    currentCapacity: 350,
    maxCapacity: 500,
    queueLength: 18,
    avgWaitTimeMins: 16,
    latitude: 29.6857,
    longitude: 76.9905,
    activeCounters: 4
  },
  {
    id: 'centre-amravati',
    name: 'Amravati Hub Mandi',
    district: 'Amravati',
    state: 'Maharashtra',
    address: 'Cotton Market Yard, Amravati, MH - 444601',
    distanceKm: 2.4,
    isOpen: true,
    currentCapacity: 142,
    maxCapacity: 200,
    queueLength: 12,
    avgWaitTimeMins: 14,
    latitude: 20.9374,
    longitude: 77.7796,
    activeCounters: 3
  },
  {
    id: 'centre-nagpur',
    name: 'Nagpur Central Grain Yard',
    district: 'Nagpur',
    state: 'Maharashtra',
    address: 'Kalamna Market, Nagpur, MH - 440026',
    distanceKm: 8.5,
    isOpen: true,
    currentCapacity: 420,
    maxCapacity: 500,
    queueLength: 28,
    avgWaitTimeMins: 32,
    latitude: 21.1458,
    longitude: 79.0882,
    activeCounters: 5
  },
  {
    id: 'centre-barnala',
    name: 'Barnala Main Yard',
    district: 'Barnala',
    state: 'Punjab',
    address: 'Grain Market Complex, Barnala, PB - 148101',
    distanceKm: 14.2,
    isOpen: true,
    currentCapacity: 190,
    maxCapacity: 200,
    queueLength: 24,
    avgWaitTimeMins: 28,
    latitude: 30.3819,
    longitude: 75.5467,
    activeCounters: 2
  }
];

const nowTime = new Date();
const todayISO = getTodayISODate(0);
const todayFormatted = formatRealDate(nowTime, true);

export const initialBookings: BookingSlot[] = [];

export const initialAIInsights: AIInsight[] = [];

export const districtPerformanceData: DistrictMetric[] = [];

export const popularBanks = [
  { name: 'State Bank of India', ifscPrefix: 'SBIN', code: 'SBI' },
  { name: 'HDFC Bank', ifscPrefix: 'HDFC', code: 'HDFC' },
  { name: 'Punjab National Bank', ifscPrefix: 'PUNB', code: 'PNB' },
  { name: 'Bank of Baroda', ifscPrefix: 'BARB', code: 'BOB' },
  { name: 'ICICI Bank', ifscPrefix: 'ICIC', code: 'ICICI' }
];

export const translations = {
  en: {
    appName: 'KPIP',
    appFullName: 'Kisan Procurement Intelligence Platform',
    goiTag: 'Government of India',
    sihBadge: 'SIH 2026',
    tagline: 'Predict • Schedule • Queue • Track • Notify',
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    reports: 'Reports',
    login: 'Secure Login',
    farmerPortal: 'Farmer',
    authorizedBuyer: 'Authorized Buyer',
    mobileNumber: 'Mobile Number',
    sendOtp: 'Send OTP',
    verifyOtp: 'Verify OTP',
    registerAsFarmer: 'Register as Farmer',
    newToKpip: 'New to KPIP?',
    voiceAssist: 'Voice Assist',
    bookNewSlot: 'Book New Slot',
    scheduleDropOff: 'Schedule your next drop-off quickly and easily. Available slots for tomorrow.',
    startBooking: 'Start Booking',
    nextBooking: 'Next Booking',
    liveQueue: 'Live Queue',
    paymentStatus: 'Payment Status',
    nearestCentre: 'Nearest Centre',
    getDirections: 'Get Directions',
    tokenNumber: 'Token Number',
    bookingConfirmed: 'Booking Confirmed',
    bookingSuccessMsg: 'Your procurement slot has been successfully scheduled.',
    downloadSlip: 'Download Slip',
    whatsApp: 'WhatsApp',
    returnToDashboard: 'Return to Dashboard',
    procurementTracker: 'Procurement Progress Tracker',
    aiPredictedTime: 'AI Predicted Time',
    minsLeft: 'mins left',
    estimatedTurn: 'Estimated Turn',
    addBankAccount: 'Add Bank Account',
    saveAndContinue: 'Save & Continue',
    back: 'Back',
    secureAndEncrypted: 'Secure & Encrypted',
    callNextFarmer: 'Call Next Farmer',
    todaysFarmers: 'Today\'s Farmers',
    currentQueue: 'Current Queue',
    avgQualityCheck: 'Avg Quality Check',
    executiveAnalytics: 'Executive Analytics Overview',
    totalProcurementToday: 'TOTAL PROCUREMENT TODAY',
    activeFarmersInQueue: 'ACTIVE FARMERS IN QUEUE',
    averageWaitTime: 'AVERAGE WAIT TIME',
    paymentCompletion: 'PAYMENT COMPLETION',
    heatmap: 'Live Centre Congestion Heatmap',
    aiInsights: 'AI Insights'
  },
  hi: {
    appName: 'केपीआईपी',
    appFullName: 'किसान अधिप्राप्ति आसूचना मंच',
    goiTag: 'भारत सरकार',
    sihBadge: 'एसआईएच 2026',
    tagline: 'पूर्वानुमान • समय-निर्धारण • कतार • ट्रैकिंग • सूचना',
    dashboard: 'डैशबोर्ड',
    analytics: 'एनालिटिक्स',
    reports: 'रिपोर्ट्स',
    login: 'सुरक्षित लॉगिन',
    farmerPortal: 'किसान',
    authorizedBuyer: 'अधिकृत खरीदार / ऑपरेटर',
    mobileNumber: 'मोबाइल नंबर',
    sendOtp: 'ओटीपी भेजें',
    verifyOtp: 'ओटीपी सत्यापित करें',
    registerAsFarmer: 'किसान पंजीकरण करें',
    newToKpip: 'केपीआईपी पर नए हैं?',
    voiceAssist: 'ध्वनि सहायक',
    bookNewSlot: 'नया स्लॉट बुक करें',
    scheduleDropOff: 'अपनी फसल विक्रय के लिए जल्दी और आसानी से स्लॉट बुक करें।',
    startBooking: 'बुकिंग शुरू करें',
    nextBooking: 'आगामी बुकिंग',
    liveQueue: 'लाइव कतार स्थिति',
    paymentStatus: 'भुगतान स्थिति',
    nearestCentre: 'निकटतम खरीद केंद्र',
    getDirections: 'दिशा-निर्देश प्राप्त करें',
    tokenNumber: 'टोकन संख्या',
    bookingConfirmed: 'बुकिंग पुष्ट हुई',
    bookingSuccessMsg: 'आपका अधिप्राप्ति स्लॉट सफलतापूर्वक निर्धारित हो गया है।',
    downloadSlip: 'पर्ची डाउनलोड करें',
    whatsApp: 'व्हाट्सएप',
    returnToDashboard: 'डैशबोर्ड पर वापस जाएं',
    procurementTracker: 'अधिप्राप्ति प्रगति ट्रैकर',
    aiPredictedTime: 'एआई अनुमानित समय',
    minsLeft: 'मिनट शेष',
    estimatedTurn: 'अनुमानित बारी',
    addBankAccount: 'बैंक खाता जोड़ें',
    saveAndContinue: 'सहेजें और आगे बढ़ें',
    back: 'पीछे',
    secureAndEncrypted: 'सुरक्षित एवं एन्क्रिप्टेड',
    callNextFarmer: 'अगले किसान को बुलाएं',
    todaysFarmers: 'आज के कुल किसान',
    currentQueue: 'वर्तमान कतार',
    avgQualityCheck: 'औसत गुणवत्ता जांच',
    executiveAnalytics: 'कार्यकारी विश्लेषण अवलोकन',
    totalProcurementToday: 'आज की कुल अधिप्राप्ति',
    activeFarmersInQueue: 'कतार में सक्रिय किसान',
    averageWaitTime: 'औसत प्रतीक्षा समय',
    paymentCompletion: 'भुगतान पूर्णता',
    heatmap: 'लाइव केंद्र भीड़ हीटमैप',
    aiInsights: 'एआई अंतर्दृष्टि'
  }
};
