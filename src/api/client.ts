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

// ==========================================
// FRONTEND BROWSER-PERSISTED MOCK DATABASE
// ==========================================

const getMockState = (key: string, defaultVal: any) => {
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(val);
  } catch {
    return defaultVal;
  }
};

const setMockState = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

const defaultFarmers = {
  "farmer-1": {
    id: "farmer-1",
    phone: "9876543210",
    name: "Rajesh Kumar",
    state: "Haryana",
    district: "Karnal",
    village: "Nilokheri",
    pincode: "132117",
    latitude: 29.6857,
    longitude: 76.9905,
    isVerified: true,
    bankAccount: {
      accountHolder: "Rajesh Kumar",
      bankName: "State Bank of India",
      accountNumberEncrypted: "31029381729",
      ifscCode: "SBIN0001234",
      isVerified: true,
      createdAt: new Date().toISOString()
    }
  }
};

const defaultCentres = [
  { id: "centre-karnal", name: "Karnal APMC Yard", state: "Haryana", district: "Karnal", village: "Karnal", maxDailyCapacityQuintals: 1000 },
  { id: "centre-gharaunda", name: "Gharaunda Sub-Yard", state: "Haryana", district: "Karnal", village: "Gharaunda", maxDailyCapacityQuintals: 500 }
];

const defaultCrops = [
  { code: "paddy", nameEn: "Paddy (Dhan) - Grade A", nameHi: "धान (ग्रेड-ए)", mspPerQuintal: 2203, maxBookingQuintals: 150, icon: "🌾", season: "KHARIF" },
  { code: "wheat", nameEn: "Wheat (Kanak)", nameHi: "गेहूं", mspPerQuintal: 2275, maxBookingQuintals: 200, icon: "🌾", season: "RABI" },
  { code: "maize", nameEn: "Maize (Makka)", nameHi: "मक्का", mspPerQuintal: 2090, maxBookingQuintals: 120, icon: "🌽", season: "KHARIF" }
];

const defaultBookings = [
  {
    id: "27/08/26-1756298450",
    tokenNumber: "#001",
    tokenSequence: 1,
    farmerId: "farmer-1",
    farmerName: "Rajesh Kumar",
    phone: "9876543210",
    centreId: "centre-karnal",
    centreName: "Karnal APMC Yard",
    cropCode: "paddy",
    cropName: "Paddy (Dhan) - Grade A",
    quantityQuintals: 45.5,
    bookingDate: new Date().toISOString().split('T')[0],
    timeSlot: "09:00 AM - 10:00 AM",
    vehicleNumber: "HR-05-AB-1234",
    status: "checked_in",
    estimatedTurnTime: "09:15 AM",
    estimatedWaitMinutes: 15,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    timeline: { checkedInAt: new Date(Date.now() - 1800000).toISOString() },
    payment: {
      amountRupees: 100236,
      status: "NOT_INITIATED",
      bankName: "State Bank of India",
      accountLast4: "1729"
    }
  }
];

// Helper to reset mocks if needed
export const clearMockDatabase = () => {
  localStorage.removeItem('kpip_mock_farmers');
  localStorage.removeItem('kpip_mock_bookings');
};

// ==========================================
// API CLIENT IMPLEMENTATION
// ==========================================

export const api = {
  // Auth Modules
  sendOtp: async (mobileNumber: string, role: string = 'FARMER') => {
    try {
      const res = await fetch(`${API_BASE}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, role }),
      });
      return await res.json();
    } catch (err) {
      return { success: true, message: "OTP sent (Sandbox Mode)" };
    }
  },

  verifyOtp: async (mobileNumber: string, otp: string, role: string) => {
    try {
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
    } catch (err) {
      // Mock Fallback Verify
      const token = `token_${role.toLowerCase() === 'operator' ? 'operator' : 'farmer-1'}`;
      setAuthToken(token);
      return { token, success: true };
    }
  },

  loginFarmer: async (mobileNumber: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/farmer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber }),
      });
      return await res.json();
    } catch (err) {
      return { success: true, message: "OTP sent (Sandbox Mode)" };
    }
  },

  verifyFarmerOtp: async (mobileNumber: string, otp: string) => {
    try {
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
    } catch (err) {
      if (otp !== "123456") {
        return { error: "Invalid verification code." };
      }
      const farmersDb = getMockState('kpip_mock_farmers', defaultFarmers);
      let farmer = Object.values(farmersDb).find((f: any) => f.phone === mobileNumber);
      if (!farmer) {
        const newId = `farmer-${Date.now()}`;
        farmer = {
          id: newId,
          phone: mobileNumber,
          name: "New Farmer User",
          isVerified: false
        };
        farmersDb[newId] = farmer;
        setMockState('kpip_mock_farmers', farmersDb);
      }

      const token = `token_${(farmer as any).id}`;
      setAuthToken(token);

      const profileCompleted = !!((farmer as any).bankAccount && (farmer as any).name && (farmer as any).name !== "New Farmer User");

      return {
        token,
        profileCompleted,
        farmerProfile: farmer
      };
    }
  },

  loginMandi: async (mobileNumber: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/mandi/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber }),
      });
      return await res.json();
    } catch (err) {
      return { success: true, message: "OTP sent (Sandbox Mode)" };
    }
  },

  verifyMandiOtp: async (mobileNumber: string, otp: string) => {
    try {
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
    } catch (err) {
      if (otp !== "456789") {
        return { error: "Invalid operator login PIN." };
      }
      const token = "token_operator";
      setAuthToken(token);
      return {
        token,
        operatorProfile: {
          id: "operator-karnal",
          role: "OPERATOR",
          name: "Karnal Yard Operator"
        }
      };
    }
  },

  getFarmerProfileDetails: async (): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/farmers/profile`, {
        headers: getHeaders(),
      });
      return await res.json();
    } catch (err) {
      const token = getAuthToken() || 'token_farmer-1';
      const farmerId = token.replace('token_', '');
      const farmersDb = getMockState('kpip_mock_farmers', defaultFarmers);
      return farmersDb[farmerId] || defaultFarmers["farmer-1"];
    }
  },

  saveFarmerProfile: async (profileData: any): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/farmers/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      });
      return await res.json();
    } catch (err) {
      const token = getAuthToken() || 'token_farmer-1';
      const farmerId = token.replace('token_', '');
      const farmersDb = getMockState('kpip_mock_farmers', defaultFarmers);
      const farmer = farmersDb[farmerId] || { id: farmerId, phone: "9876543210", isVerified: false };

      farmer.name = profileData.fullName;
      farmer.state = profileData.state;
      farmer.district = profileData.district;
      farmer.village = profileData.village;
      farmer.pincode = profileData.pincode;
      farmer.isVerified = true;

      farmer.bankAccount = {
        accountHolder: profileData.fullName,
        bankName: profileData.bankName,
        accountNumberEncrypted: profileData.accountNumber,
        ifscCode: profileData.ifsc,
        isVerified: true,
        createdAt: new Date().toISOString()
      };

      farmersDb[farmerId] = farmer;
      setMockState('kpip_mock_farmers', farmersDb);
      return { success: true, farmer };
    }
  },

  getMandiProfileDetails: async (): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/mandi/profile`, {
        headers: getHeaders(),
      });
      return await res.json();
    } catch (err) {
      return { id: "operator-karnal", name: "Karnal APMC Yard", state: "Haryana" };
    }
  },

  getMe: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
      });
      return await res.json();
    } catch (err) {
      const token = getAuthToken();
      if (token === "token_operator") {
        return { userId: "operator-karnal", role: "OPERATOR" };
      }
      const farmerId = token?.replace('token_', '') || 'farmer-1';
      const farmersDb = getMockState('kpip_mock_farmers', defaultFarmers);
      const farmer = farmersDb[farmerId] || defaultFarmers["farmer-1"];
      const profileCompleted = !!(farmer.bankAccount && farmer.name && farmer.name !== "New Farmer User");

      return {
        userId: farmer.id,
        role: "FARMER",
        farmerProfile: farmer,
        profileCompleted
      };
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch (e) {}
    clearAuthToken();
  },

  // Farmers
  getFarmerProfile: async (farmerId: string): Promise<FarmerProfile> => {
    try {
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
    } catch (err) {
      const farmersDb = getMockState('kpip_mock_farmers', defaultFarmers);
      const raw = farmersDb[farmerId] || defaultFarmers["farmer-1"];
      return {
        id: raw.id,
        kisanId: `KISAN-${raw.id.toUpperCase()}`,
        name: raw.name,
        phone: raw.phone,
        avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
        state: raw.state,
        district: raw.district,
        village: raw.village,
        isVerified: raw.isVerified,
        bankDetails: raw.bankAccount ? {
          accountHolder: raw.bankAccount.accountHolder,
          bankName: raw.bankAccount.bankName,
          accountNumber: raw.bankAccount.accountNumberEncrypted,
          ifscCode: raw.bankAccount.ifscCode,
          isVerified: raw.bankAccount.isVerified,
          linkedDate: raw.bankAccount.createdAt ? new Date(raw.bankAccount.createdAt).toLocaleDateString('en-GB') : '12 Jan 2024'
        } : undefined
      };
    }
  },

  registerBank: async (farmerId: string, bankData: { accountHolder: string; bankName: string; accountNumber: string; ifscCode: string; updatedName?: string }) => {
    try {
      const res = await fetch(`${API_BASE}/farmers/${farmerId}/bank`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(bankData),
      });
      return await res.json();
    } catch (err) {
      const farmersDb = getMockState('kpip_mock_farmers', defaultFarmers);
      const farmer = farmersDb[farmerId] || { id: farmerId, phone: "9876543210", isVerified: false };

      if (bankData.updatedName) farmer.name = bankData.updatedName;
      farmer.bankAccount = {
        accountHolder: bankData.accountHolder,
        bankName: bankData.bankName,
        accountNumberEncrypted: bankData.accountNumber,
        ifscCode: bankData.ifscCode,
        isVerified: true,
        createdAt: new Date().toISOString()
      };

      farmersDb[farmerId] = farmer;
      setMockState('kpip_mock_farmers', farmersDb);
      return { success: true, farmer };
    }
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
    try {
      const res = await fetch(`${API_BASE}/farmers/${farmerId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      });
      return await res.json();
    } catch (err) {
      const farmersDb = getMockState('kpip_mock_farmers', defaultFarmers);
      const farmer = farmersDb[farmerId] || { id: farmerId, phone: "9876543210", isVerified: false };
      Object.assign(farmer, profileData);
      farmersDb[farmerId] = farmer;
      setMockState('kpip_mock_farmers', farmersDb);
      return farmer;
    }
  },

  // Centres & Crops
  getCentres: async (): Promise<ProcurementCentre[]> => {
    try {
      const res = await fetch(`${API_BASE}/centres`, {
        headers: getHeaders(),
      });
      return await res.json();
    } catch (err) {
      return defaultCentres;
    }
  },

  getCentreSlots: async (centreId: string, date: string) => {
    try {
      const res = await fetch(`${API_BASE}/centres/${centreId}/slots?date=${date}`, {
        headers: getHeaders(),
      });
      return await res.json();
    } catch (err) {
      const bookingsDb = getMockState('kpip_mock_bookings', defaultBookings);
      const active = bookingsDb.filter((b: any) => b.centreId === centreId && b.bookingDate === date);
      return {
        bookedQuintals: active.reduce((sum: number, b: any) => sum + b.quantityQuintals, 0),
        maxCapacity: 1000,
        slots: [
          { id: "s1", time: "09:00 AM - 10:00 AM", booked: 2, capacity: 10 },
          { id: "s2", time: "10:00 AM - 11:00 AM", booked: 4, capacity: 10 },
          { id: "s3", time: "11:00 AM - 12:00 PM", booked: 1, capacity: 10 }
        ]
      };
    }
  },

  getCrops: async (): Promise<CropInfo[]> => {
    try {
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
    } catch (err) {
      return defaultCrops.map((c: any) => ({
        id: c.code,
        nameEn: c.nameEn,
        nameHi: c.nameHi,
        mspPerQuintal: c.mspPerQuintal,
        maxBookingQuintals: c.maxBookingQuintals,
        icon: c.icon,
        category: c.season
      }));
    }
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
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(bookingPayload),
      });
      return await res.json();
    } catch (err) {
      const bookingsDb = getMockState('kpip_mock_bookings', defaultBookings);
      const centre = defaultCentres.find(c => c.id === bookingPayload.centreId) || defaultCentres[0];
      const crop = defaultCrops.find(c => c.code === bookingPayload.cropId) || defaultCrops[0];

      const sameDayBookings = bookingsDb.filter((b: any) => b.centreId === bookingPayload.centreId && b.bookingDate === bookingPayload.bookingDate);
      const nextTokenInt = sameDayBookings.length + 1;
      const tokenStr = `#${String(nextTokenInt).padStart(3, '0')}`;

      const datePart = new Date().toLocaleDateString('en-GB').replace(/\//g, '');
      const newBooking = {
        id: `${datePart}-${Math.floor(Date.now() / 1000)}`,
        tokenNumber: tokenStr,
        tokenSequence: nextTokenInt,
        farmerId: bookingPayload.farmerId,
        farmerName: bookingPayload.farmerName,
        phone: bookingPayload.phone,
        centreId: bookingPayload.centreId,
        centreName: centre.name,
        cropCode: crop.code,
        cropName: crop.nameEn,
        quantityQuintals: Number(bookingPayload.quantityQuintals),
        bookingDate: bookingPayload.bookingDate,
        timeSlot: bookingPayload.timeSlot,
        vehicleNumber: bookingPayload.vehicleNumber,
        status: "pending",
        estimatedTurnTime: "10:30 AM",
        estimatedWaitMinutes: 25,
        createdAt: new Date().toISOString(),
        timeline: { bookedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
        payment: {
          amountRupees: Number(bookingPayload.quantityQuintals) * crop.mspPerQuintal,
          status: "NOT_INITIATED",
          bankName: "State Bank of India",
          accountLast4: "1729"
        }
      };

      bookingsDb.push(newBooking);
      setMockState('kpip_mock_bookings', bookingsDb);
      return newBooking;
    }
  },

  getBookings: async (params?: { farmerId?: string; centreId?: string; status?: string }): Promise<BookingSlot[]> => {
    try {
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
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(b.id)}`,
        createdAt: b.createdAt,
        timeline: b.timeline || {},
        qualityCheck: b.qualityCheck,
        weighment: b.weighment,
        payment: b.payment ? {
          amount: b.payment.amountRupees || b.payment.amount,
          status: b.payment.status.toLowerCase(),
          referenceId: b.payment.referenceId,
          bankName: b.payment.bankName,
          accountLast4: b.payment.accountLast4,
          settlementDate: b.payment.settlementTimestamp ? new Date(b.payment.settlementTimestamp).toLocaleDateString('en-GB') : 'Processing'
        } : undefined
      }));
    } catch (err) {
      const bookingsDb = getMockState('kpip_mock_bookings', defaultBookings);
      let list = bookingsDb;
      if (params?.farmerId) list = list.filter((b: any) => b.farmerId === params.farmerId);
      if (params?.centreId) list = list.filter((b: any) => b.centreId === params.centreId);
      if (params?.status) list = list.filter((b: any) => b.status === params.status);

      return list.map((b: any) => ({
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
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(b.id)}`,
        createdAt: b.createdAt,
        timeline: b.timeline || {},
        qualityCheck: b.qualityCheck,
        weighment: b.weighment,
        payment: b.payment ? {
          amount: b.payment.amountRupees || b.payment.amount,
          status: b.payment.status.toLowerCase(),
          referenceId: b.payment.referenceId || "PFMS-MOCK-1729",
          bankName: b.payment.bankName,
          accountLast4: b.payment.accountLast4,
          settlementDate: b.payment.settlementTimestamp ? new Date(b.payment.settlementTimestamp).toLocaleDateString('en-GB') : 'Processing'
        } : undefined
      }));
    }
  },

  // Procurement & Live Queue Actions
  getLiveQueue: async (centreId: string = 'centre-karnal'): Promise<QueueLiveState> => {
    try {
      const res = await fetch(`${API_BASE}/queues/live?centreId=${encodeURIComponent(centreId)}`, {
        headers: getHeaders(),
      });
      return await res.json();
    } catch (err) {
      const bookingsDb = getMockState('kpip_mock_bookings', defaultBookings);
      const active = bookingsDb.filter((b: any) => b.centreId === centreId && b.status === 'checked_in');

      return {
        activeToken: active[0] ? active[0].tokenNumber : null,
        activeBookingId: active[0] ? active[0].id : null,
        nextToken: active[1] ? active[1].tokenNumber : null,
        waitingCount: bookingsDb.filter((b: any) => b.status === 'pending').length,
        checkedInCount: active.length,
        calledCount: bookingsDb.filter((b: any) => b.status === 'called').length,
        processingCount: bookingsDb.filter((b: any) => b.status === 'processing').length,
        list: bookingsDb
      };
    }
  },

  checkInFarmer: async (payload: { tokenNumber?: string; bookingId?: string; centreId?: string }) => {
    try {
      const res = await fetch(`${API_BASE}/queues/check-in`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      const bookingsDb = getMockState('kpip_mock_bookings', defaultBookings);
      const booking = bookingsDb.find((b: any) => b.id === payload.bookingId || b.tokenNumber === payload.tokenNumber);
      if (booking) {
        booking.status = "checked_in";
        booking.timeline.checkedInAt = new Date().toISOString();
        setMockState('kpip_mock_bookings', bookingsDb);
      }
      return { success: true };
    }
  },

  callNextQueue: async (centreId: string = 'centre-karnal', counterNumber: number = 1) => {
    try {
      const res = await fetch(`${API_BASE}/queues/call-next`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ centreId, counterNumber }),
      });
      return await res.json();
    } catch (err) {
      const bookingsDb = getMockState('kpip_mock_bookings', defaultBookings);
      const checkedIn = bookingsDb.filter((b: any) => b.centreId === centreId && b.status === 'checked_in');
      const booking = checkedIn[0];
      if (booking) {
        booking.status = "called";
        booking.timeline.calledAt = new Date().toISOString();
        setMockState('kpip_mock_bookings', bookingsDb);
        return { success: true, booking };
      }
      return { success: false, message: "No farmers checked in." };
    }
  },

  completeQueueLot: async (bookingId: string) => {
    try {
      const res = await fetch(`${API_BASE}/queues/complete`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bookingId }),
      });
      return await res.json();
    } catch (err) {
      const bookingsDb = getMockState('kpip_mock_bookings', defaultBookings);
      const booking = bookingsDb.find((b: any) => b.id === bookingId);
      if (booking) {
        booking.status = "completed";
        booking.timeline.completedAt = new Date().toISOString();
        setMockState('kpip_mock_bookings', bookingsDb);
      }
      return { success: true };
    }
  },

  getQueueAnalytics: async () => {
    try {
      const res = await fetch(`${API_BASE}/queues/analytics`, {
        headers: getHeaders(),
      });
      return await res.json();
    } catch (err) {
      const bookingsDb = getMockState('kpip_mock_bookings', defaultBookings);
      return { avgWaitTime: 18, checkInRate: 92, processedToday: bookingsDb.length };
    }
  },

  retrainAIModel: async () => {
    try {
      const res = await fetch(`${API_BASE}/queues/retrain`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await res.json();
    } catch (err) {
      return { success: true, accuracy: 0.942 };
    }
  },

  updateBookingStatus: async (bookingId: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/procurements/status/${bookingId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ status: status.toUpperCase() }),
      });
      return await res.json();
    } catch (err) {
      const bookingsDb = getMockState('kpip_mock_bookings', defaultBookings);
      const booking = bookingsDb.find((b: any) => b.id === bookingId);
      if (booking) {
        booking.status = status.toLowerCase();
        setMockState('kpip_mock_bookings', bookingsDb);
      }
      return { success: true };
    }
  },

  submitQualityCheck: async (payload: {
    bookingId: string;
    moisturePercentage: number;
    foreignMatterPercentage?: number;
    grade?: string;
    inspectorName?: string;
    remarks?: string;
  }) => {
    try {
      const res = await fetch(`${API_BASE}/procurements/quality-check`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      const bookingsDb = getMockState('kpip_mock_bookings', defaultBookings);
      const booking = bookingsDb.find((b: any) => b.id === payload.bookingId);
      if (booking) {
        booking.status = "quality_checked";
        booking.qualityCheck = {
          moisturePercentage: payload.moisturePercentage,
          foreignMatterPercentage: payload.foreignMatterPercentage || 1.2,
          grade: payload.grade || "Grade A",
          inspectorName: payload.inspectorName || "Govt Quality Officer",
          remarks: payload.remarks || "",
          checkedAt: new Date().toISOString()
        };
        setMockState('kpip_mock_bookings', bookingsDb);
      }
      return { success: true };
    }
  },

  submitWeighment: async (payload: {
    bookingId: string;
    grossWeightKg: number;
    tareWeightKg: number;
    scaleMachineId?: string;
    operatorName?: string;
  }) => {
    try {
      const res = await fetch(`${API_BASE}/procurements/weighment`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      const bookingsDb = getMockState('kpip_mock_bookings', defaultBookings);
      const booking = bookingsDb.find((b: any) => b.id === payload.bookingId);
      if (booking) {
        const net = (payload.grossWeightKg - payload.tareWeightKg) / 100.0;
        booking.status = "weighed";
        booking.weighment = {
          grossWeightKg: payload.grossWeightKg,
          tareWeightKg: payload.tareWeightKg,
          netWeightQuintals: net,
          weighedAt: new Date().toISOString(),
          scaleMachineId: payload.scaleMachineId || "Scale-1",
          operatorName: payload.operatorName || "Weighbridge Operator"
        };

        const cropPrice = defaultCrops.find(c => c.code === booking.cropCode)?.mspPerQuintal || 2203;
        booking.payment = {
          amount: Math.round(net * cropPrice),
          status: "pfms_processing",
          bankName: "State Bank of India",
          accountLast4: "1729",
          referenceId: `PFMS-${Math.floor(100000 + Math.random() * 900000)}`
        };

        setMockState('kpip_mock_bookings', bookingsDb);
      }
      return { success: true };
    }
  },

  callNextToken: async (centreId: string = 'centre-karnal') => {
    try {
      const res = await fetch(`${API_BASE}/queues/call-next`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ centreId }),
      });
      return await res.json();
    } catch (err) {
      const bookingsDb = getMockState('kpip_mock_bookings', defaultBookings);
      const checkedIn = bookingsDb.filter((b: any) => b.centreId === centreId && b.status === 'checked_in');
      const booking = checkedIn[0];
      if (booking) {
        booking.status = "called";
        booking.timeline.calledAt = new Date().toISOString();
        setMockState('kpip_mock_bookings', bookingsDb);
      }
      return { success: true };
    }
  },

  // Analytics & AI
  getAnalytics: async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/dashboard`, {
        headers: getHeaders(),
      });
      return await res.json();
    } catch (err) {
      const bookingsDb = getMockState('kpip_mock_bookings', defaultBookings);
      return {
        procurementVolumeMT: 14.8,
        activeFarmers: bookingsDb.length,
        capacityUtilization: 88,
        dbtPaidCr: 14.8,
        paymentsPending: bookingsDb.filter((b: any) => b.payment && b.payment.status !== 'payment_credited').length,
        paymentsProcessing: bookingsDb.filter((b: any) => b.payment && b.payment.status === 'pfms_processing').length,
        avgPaymentClearanceHours: 4.2,
        pfmsSuccessRate: 99.4
      };
    }
  },

  predictWaitTime: async (params: { centreId?: string; crop?: string; quantity?: number; timeSlot?: string }) => {
    try {
      const res = await fetch(`${API_BASE}/ai/predict`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (err) {
      const qty = Number(params.quantity || 20);
      const wait = Math.round(15 * (1.0 + qty / 50.0));
      return {
        predictedWaitMinutes: wait,
        congestionLevel: wait > 30 ? "SURGE" : "OPTIMAL",
        recommendation: wait > 30 ? "High load. Postpone to afternoon." : "Optimal load. Carry on."
      };
    }
  },

  updatePaymentStatus: async (bookingId: string, status: string, remarks?: string) => {
    try {
      const res = await fetch(`${API_BASE}/payments/${bookingId}/status`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ status, remarks }),
      });
      return await res.json();
    } catch (err) {
      const bookingsDb = getMockState('kpip_mock_bookings', defaultBookings);
      const booking = bookingsDb.find((b: any) => b.id === bookingId);
      if (booking && booking.payment) {
        booking.payment.status = status;
        if (status.toUpperCase() === 'PAYMENT_CREDITED' || status.toUpperCase() === 'COMPLETED') {
          booking.payment.settlementTimestamp = new Date().toISOString();
          booking.status = "completed";
        }
        setMockState('kpip_mock_bookings', bookingsDb);
      }
      return { success: true };
    }
  },

  getPaymentEvents: async (bookingId: string) => {
    try {
      const res = await fetch(`${API_BASE}/payments/${bookingId}/events`, {
        headers: getHeaders(),
      });
      return await res.json();
    } catch (err) {
      return {
        success: true,
        events: [
          { eventName: "Payment File Generated", timestamp: new Date(Date.now() - 3600000).toISOString(), remarks: "DBT file queued" },
          { eventName: "Sent to PFMS", timestamp: new Date(Date.now() - 1800000).toISOString(), remarks: "PFMS validation accepted" }
        ]
      };
    }
  }
};

// SSE Hook / Event Listener Helper
export const subscribeToEvents = (onEvent: (type: string, data: any) => void) => {
  try {
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
  } catch (err) {
    // Return empty teardown in case of connection failure
    return () => {};
  }
};
