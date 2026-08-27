import { 
  FarmerProfile, 
  BookingSlot, 
  ProcurementCentre, 
  CropInfo, 
  UserRole,
  BankAccount,
  QueueLiveState
} from '../types';

const API_BASE = '/api/v1';

// Token Management
export const getAuthToken = (): string | null => {
  return localStorage.getItem('kpip_auth_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('kpip_auth_token', token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('kpip_auth_token');
};

const getHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// API Service Client
export const api = {
  // Auth
  sendOtp: async (mobileNumber: string, role: string = 'FARMER') => {
    const res = await fetch(`${API_BASE}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber, role }),
    });
    return res.json();
  },

  verifyOtp: async (mobileNumber: string, otp: string, role: string) => {
    const res = await fetch(`${API_BASE}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber, otp, role }),
    });
    const data = await res.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  loginFarmer: async (mobileNumber: string) => {
    const res = await fetch(`${API_BASE}/auth/farmer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber }),
    });
    return res.json();
  },

  verifyFarmerOtp: async (mobileNumber: string, otp: string) => {
    const res = await fetch(`${API_BASE}/auth/farmer/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber, otp }),
    });
    const data = await res.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  loginMandi: async (mobileNumber: string) => {
    const res = await fetch(`${API_BASE}/auth/mandi/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber }),
    });
    return res.json();
  },

  verifyMandiOtp: async (mobileNumber: string, otp: string) => {
    const res = await fetch(`${API_BASE}/auth/mandi/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber, otp }),
    });
    const data = await res.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  getFarmerProfileDetails: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/farmers/profile`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  saveFarmerProfile: async (profileData: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/farmers/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  getMandiProfileDetails: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/mandi/profile`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  logout: async () => {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
    });
    clearAuthToken();
  },

  // Farmers
  getFarmerProfile: async (farmerId: string): Promise<FarmerProfile> => {
    const res = await fetch(`${API_BASE}/farmers/${farmerId}`, {
      headers: getHeaders(),
    });
    const raw = await res.json();
    return {
      id: raw.id,
      kisanId: raw.kisanId,
      name: raw.name,
      phone: raw.phone,
      avatarUrl: raw.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      state: raw.state,
      district: raw.district,
      village: raw.village,
      isVerified: raw.isVerified,
      bankDetails: raw.bankAccount ? {
        accountHolder: raw.bankAccount.accountHolder,
        bankName: raw.bankAccount.bankName,
        accountNumber: raw.bankAccount.accountNumberEncrypted?.replace('enc_', '') || raw.bankAccount.accountNumberLast4,
        ifscCode: raw.bankAccount.ifscCode,
        isVerified: raw.bankAccount.isVerified,
        linkedDate: raw.bankAccount.createdAt ? new Date(raw.bankAccount.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '12 Jan 2024'
      } : undefined
    };
  },

  registerBank: async (farmerId: string, bankData: { accountHolder: string; bankName: string; accountNumber: string; ifscCode: string; updatedName?: string }) => {
    const res = await fetch(`${API_BASE}/farmers/${farmerId}/bank`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bankData),
    });
    return res.json();
  },

  updateFarmerProfile: async (farmerId: string, profileData: { 
    name?: string; 
    phone?: string; 
    aadhaar?: string;
    address?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    const res = await fetch(`${API_BASE}/farmers/${farmerId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  // Centres & Crops
  getCentres: async (): Promise<ProcurementCentre[]> => {
    const res = await fetch(`${API_BASE}/centres`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getCentreSlots: async (centreId: string, date: string) => {
    const res = await fetch(`${API_BASE}/centres/${centreId}/slots?date=${date}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getCrops: async (): Promise<CropInfo[]> => {
    const res = await fetch(`${API_BASE}/crops`, {
      headers: getHeaders(),
    });
    const raw = await res.json();
    return raw.map((c: any) => ({
      id: c.code,
      nameEn: c.nameEn,
      nameHi: c.nameHi,
      mspPerQuintal: c.mspPerQuintal,
      maxBookingQuintals: c.maxBookingQuintals,
      icon: c.icon,
      category: c.season
    }));
  },

  // Bookings
  createBooking: async (bookingPayload: {
    farmerId: string;
    farmerName: string;
    phone: string;
    centreId: string;
    cropId: string;
    quantityQuintals: number;
    bookingDate: string;
    timeSlot: string;
    vehicleNumber: string;
  }) => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingPayload),
    });
    return res.json();
  },

  getBookings: async (params?: { farmerId?: string; centreId?: string; status?: string }): Promise<BookingSlot[]> => {
    const query = new URLSearchParams();
    if (params?.farmerId) query.set('farmerId', params.farmerId);
    if (params?.centreId) query.set('centreId', params.centreId);
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`${API_BASE}/bookings?${query.toString()}`, {
      headers: getHeaders(),
    });
    const rawList = await res.json();
    return rawList.map((b: any) => ({
      id: b.id,
      tokenNumber: b.tokenNumber,
      tokenInt: b.tokenSequence,
      farmerId: b.farmerId,
      farmerName: b.farmerName,
      phone: b.phone,
      centreId: b.centreId,
      centreName: b.centreName,
      crop: b.cropCode,
      cropName: b.cropName,
      quantityQuintals: b.quantityQuintals,
      bookingDate: b.bookingDate,
      timeSlot: b.timeSlot,
      vehicleNumber: b.vehicleNumber,
      status: b.status.toLowerCase(),
      estimatedTurnTime: b.estimatedTurnTime,
      estimatedWaitMinutes: b.estimatedWaitMinutes,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(b.qrCodeHash || b.id)}`,
      createdAt: b.createdAt,
      timeline: b.timeline || {},
      qualityCheck: b.qualityCheck,
      weighment: b.weighment,
      payment: b.payment ? {
        amount: b.payment.amountRupees,
        status: b.payment.status.toLowerCase(),
        referenceId: b.payment.referenceId,
        bankName: b.payment.bankName,
        accountLast4: b.payment.accountLast4,
        settlementDate: b.payment.settlementTimestamp ? new Date(b.payment.settlementTimestamp).toLocaleDateString('en-GB') : 'Processing'
      } : undefined
    }));
  },

  // Procurement & Live Queue Actions
  getLiveQueue: async (centreId: string = 'centre-karnal'): Promise<QueueLiveState> => {
    const res = await fetch(`${API_BASE}/queues/live?centreId=${encodeURIComponent(centreId)}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  checkInFarmer: async (payload: { tokenNumber?: string; bookingId?: string; centreId?: string }) => {
    const res = await fetch(`${API_BASE}/queues/check-in`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  callNextQueue: async (centreId: string = 'centre-karnal', counterNumber: number = 1) => {
    const res = await fetch(`${API_BASE}/queues/call-next`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ centreId, counterNumber }),
    });
    return res.json();
  },

  completeQueueLot: async (bookingId: string) => {
    const res = await fetch(`${API_BASE}/queues/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookingId }),
    });
    return res.json();
  },

  getQueueAnalytics: async () => {
    const res = await fetch(`${API_BASE}/queues/analytics`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  retrainAIModel: async () => {
    const res = await fetch(`${API_BASE}/queues/retrain`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  updateBookingStatus: async (bookingId: string, status: string) => {
    const res = await fetch(`${API_BASE}/procurements/status/${bookingId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status: status.toUpperCase() }),
    });
    return res.json();
  },

  submitQualityCheck: async (payload: {
    bookingId: string;
    moisturePercentage: number;
    foreignMatterPercentage?: number;
    grade?: string;
    inspectorName?: string;
    remarks?: string;
  }) => {
    const res = await fetch(`${API_BASE}/procurements/quality-check`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  submitWeighment: async (payload: {
    bookingId: string;
    grossWeightKg: number;
    tareWeightKg: number;
    scaleMachineId?: string;
    operatorName?: string;
  }) => {
    const res = await fetch(`${API_BASE}/procurements/weighment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  callNextToken: async (centreId: string = 'centre-karnal') => {
    const res = await fetch(`${API_BASE}/queues/call-next`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ centreId }),
    });
    return res.json();
  },

  // Analytics & AI
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  predictWaitTime: async (params: { centreId?: string; crop?: string; quantity?: number; timeSlot?: string }) => {
    const res = await fetch(`${API_BASE}/ai/predict`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    return res.json();
  },

  updatePaymentStatus: async (bookingId: string, status: string, remarks?: string) => {
    const res = await fetch(`${API_BASE}/payments/${bookingId}/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status, remarks }),
    });
    return res.json();
  },

  getPaymentEvents: async (bookingId: string) => {
    const res = await fetch(`${API_BASE}/payments/${bookingId}/events`, {
      headers: getHeaders(),
    });
    return res.json();
  }
};

// SSE Hook / Event Listener Helper
export const subscribeToEvents = (onEvent: (type: string, data: any) => void) => {
  const eventSource = new EventSource(`${API_BASE}/events/stream`);

  const eventTypes = [
    'QUEUE_UPDATED',
    'TOKEN_CALLED',
    'FARMER_CHECKED_IN',
    'QUALITY_STARTED',
    'WEIGHING_STARTED',
    'PROCUREMENT_COMPLETED',
    'QUALITY_UPDATED',
    'WEIGHT_UPDATED',
    'PAYMENT_UPDATED',
    'QUEUE_RECALCULATED',
    'CAPACITY_UPDATED',
    'AI_MODEL_RETRAINED',
    'BOOKING_CREATED'
  ];

  eventTypes.forEach(evt => {
    eventSource.addEventListener(evt, (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        onEvent(evt, parsed.data || parsed);
      } catch (err) {
        onEvent(evt, e.data);
      }
    });
  });

  return () => {
    eventSource.close();
  };
};
