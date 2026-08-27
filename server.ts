import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ==========================================
// IN-MEMORY DATABASE STATE (LOCAL RUNTIME)
// ==========================================

const farmers: Record<string, any> = {
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

const centres = [
  { id: "centre-karnal", name: "Karnal APMC Yard", state: "Haryana", district: "Karnal", village: "Karnal", maxDailyCapacityQuintals: 1000 },
  { id: "centre-gharaunda", name: "Gharaunda Sub-Yard", state: "Haryana", district: "Karnal", village: "Gharaunda", maxDailyCapacityQuintals: 500 }
];

const crops = [
  { code: "paddy", nameEn: "Paddy (Dhan) - Grade A", nameHi: "धान (ग्रेड-ए)", mspPerQuintal: 2203, maxBookingQuintals: 150, icon: "🌾", season: "KHARIF" },
  { code: "wheat", nameEn: "Wheat (Kanak)", nameHi: "गेहूं", mspPerQuintal: 2275, maxBookingQuintals: 200, icon: "🌾", season: "RABI" },
  { code: "maize", nameEn: "Maize (Makka)", nameHi: "मक्का", mspPerQuintal: 2090, maxBookingQuintals: 120, icon: "🌽", season: "KHARIF" }
];

const bookings: any[] = [
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

// SSE connected clients
let sseClients: any[] = [];

const broadcastEvent = (type: string, data: any) => {
  const payload = JSON.stringify({ type, data });
  sseClients.forEach(client => {
    client.write(`event: ${type}\n`);
    client.write(`data: ${payload}\n\n`);
  });
};

// ==========================================
// API ROUTE HANDLERS
// ==========================================

const router = express.Router();

// 1. Auth Modules
router.post('/auth/farmer/login', (req, res) => {
  res.json({ success: true, message: "OTP sent successfully. Sandbox bypass code is 123456." });
});

router.post('/auth/farmer/verify-otp', (req, res) => {
  const { mobileNumber, otp } = req.body;
  if (otp !== "123456") {
    return res.status(401).json({ error: "Invalid verification code." });
  }

  // Find or create farmer
  let farmer = Object.values(farmers).find(f => f.phone === mobileNumber);
  if (!farmer) {
    const newId = `farmer-${Date.now()}`;
    farmer = {
      id: newId,
      phone: mobileNumber,
      name: "New Farmer User",
      isVerified: false
    };
    farmers[newId] = farmer;
  }

  const profileCompleted = !!(farmer.bankAccount && farmer.name && farmer.name !== "New Farmer User");

  res.json({
    token: `token_${farmer.id}`,
    profileCompleted,
    farmerProfile: farmer
  });
});

router.post('/auth/mandi/login', (req, res) => {
  res.json({ success: true, message: "OTP sent successfully. Sandbox bypass code is 456789." });
});

router.post('/auth/mandi/verify-otp', (req, res) => {
  const { mobileNumber, otp } = req.body;
  if (otp !== "456789") {
    return res.status(401).json({ error: "Invalid operator login PIN." });
  }

  res.json({
    token: "token_operator",
    operatorProfile: {
      id: "operator-karnal",
      role: "OPERATOR",
      name: "Karnal Yard Operator"
    }
  });
});

router.get('/auth/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');

  if (token === "token_operator") {
    return res.json({ userId: "operator-karnal", role: "OPERATOR" });
  }

  const farmerId = token.replace('token_', '');
  const farmer = farmers[farmerId];
  if (farmer) {
    const profileCompleted = !!(farmer.bankAccount && farmer.name && farmer.name !== "New Farmer User");
    return res.json({
      userId: farmer.id,
      role: "FARMER",
      farmerProfile: farmer,
      profileCompleted
    });
  }

  res.status(401).json({ error: "Unauthorized access." });
});

router.post('/auth/logout', (req, res) => {
  res.json({ success: true });
});

// 2. Farmers Profile Modules
router.get('/farmers/profile', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  const farmerId = token.replace('token_', '');
  const farmer = farmers[farmerId];

  if (!farmer) return res.status(404).json({ error: "Profile not found" });
  res.json(farmer);
});

router.put('/farmers/profile', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  const farmerId = token.replace('token_', '');
  const farmer = farmers[farmerId];

  if (!farmer) return res.status(404).json({ error: "Farmer not found" });

  const { fullName, state, district, village, pincode, bankName, accountNumber, ifsc } = req.body;

  farmer.name = fullName;
  farmer.state = state;
  farmer.district = district;
  farmer.village = village;
  farmer.pincode = pincode;
  farmer.isVerified = true;

  farmer.bankAccount = {
    accountHolder: fullName,
    bankName,
    accountNumberEncrypted: accountNumber,
    ifscCode: ifsc,
    isVerified: true,
    createdAt: new Date().toISOString()
  };

  res.json({ success: true, farmer });
});

router.get('/farmers/:id', (req, res) => {
  const farmer = farmers[req.params.id];
  if (!farmer) return res.status(404).json({ error: "Farmer not found" });
  res.json(farmer);
});

router.put('/farmers/:id', (req, res) => {
  const farmer = farmers[req.params.id];
  if (!farmer) return res.status(404).json({ error: "Farmer not found" });
  Object.assign(farmer, req.body);
  res.json(farmer);
});

router.post('/farmers/:id/bank', (req, res) => {
  const farmer = farmers[req.params.id];
  if (!farmer) return res.status(404).json({ error: "Farmer not found" });
  const { accountHolder, bankName, accountNumber, ifscCode, updatedName } = req.body;
  if (updatedName) farmer.name = updatedName;

  farmer.bankAccount = {
    accountHolder,
    bankName,
    accountNumberEncrypted: accountNumber,
    ifscCode,
    isVerified: true,
    createdAt: new Date().toISOString()
  };
  res.json({ success: true, farmer });
});

// 3. Centre & Crops
router.get('/centres', (req, res) => {
  res.json(centres);
});

router.get('/centres/:id/slots', (req, res) => {
  res.json({
    bookedQuintals: 120,
    maxCapacity: 1000,
    slots: [
      { id: "s1", time: "09:00 AM - 10:00 AM", booked: 2, capacity: 10 },
      { id: "s2", time: "10:00 AM - 11:00 AM", booked: 4, capacity: 10 },
      { id: "s3", time: "11:00 AM - 12:00 PM", booked: 1, capacity: 10 }
    ]
  });
});

router.get('/crops', (req, res) => {
  res.json(crops);
});

// 4. Bookings
router.post('/bookings', (req, res) => {
  const { farmerId, farmerName, phone, centreId, cropId, quantityQuintals, bookingDate, timeSlot, vehicleNumber } = req.body;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '');
  const bookingId = `${dateStr}-${Math.floor(Date.now() / 1000)}`;

  const todayBookings = bookings.filter(b => b.centreId === centreId && b.bookingDate === bookingDate);
  const nextTokenSeq = todayBookings.length + 1;
  const tokenNumber = `#${String(nextTokenSeq).padStart(3, '0')}`;

  const crop = crops.find(c => c.code === cropId) || crops[0];

  const newBooking = {
    id: bookingId,
    tokenNumber,
    tokenSequence: nextTokenSeq,
    farmerId,
    farmerName,
    phone,
    centreId,
    centreName: centres.find(c => c.id === centreId)?.name || "Karnal APMC Yard",
    cropCode: crop.code,
    cropName: crop.nameEn,
    quantityQuintals: Number(quantityQuintals),
    bookingDate,
    timeSlot,
    vehicleNumber,
    status: "pending",
    estimatedTurnTime: "10:30 AM",
    estimatedWaitMinutes: 25,
    createdAt: new Date().toISOString(),
    timeline: { bookedAt: new Date().toISOString() },
    payment: {
      amountRupees: Number(quantityQuintals) * crop.mspPerQuintal,
      status: "NOT_INITIATED",
      bankName: "State Bank of India",
      accountLast4: "1729"
    }
  };

  bookings.push(newBooking);
  broadcastEvent('BOOKING_CREATED', newBooking);
  broadcastEvent('QUEUE_UPDATED', { centreId });

  res.status(201).json(newBooking);
});

router.get('/bookings', (req, res) => {
  const { farmerId, centreId, status } = req.query;
  let filtered = bookings;
  if (farmerId) filtered = filtered.filter(b => b.farmerId === farmerId);
  if (centreId) filtered = filtered.filter(b => b.centreId === centreId);
  if (status) filtered = filtered.filter(b => b.status === status);

  res.json(filtered);
});

// 5. Queues
router.get('/queues/live', (req, res) => {
  const checkedIn = bookings.filter(b => b.status === 'checked_in');
  const active = checkedIn[0] || null;

  res.json({
    centreId: "centre-karnal",
    activeToken: active ? active.tokenNumber : null,
    activeBookingId: active ? active.id : null,
    nextToken: checkedIn[1] ? checkedIn[1].tokenNumber : null,
    waitingCount: bookings.filter(b => b.status === 'pending').length,
    checkedInCount: checkedIn.length,
    calledCount: bookings.filter(b => b.status === 'called').length,
    processingCount: bookings.filter(b => b.status === 'processing').length,
    list: bookings
  });
});

router.post('/queues/check-in', (req, res) => {
  const { bookingId } = req.body;
  const booking = bookings.find(b => b.id === bookingId);
  if (booking) {
    booking.status = "checked_in";
    booking.timeline.checkedInAt = new Date().toISOString();
    broadcastEvent('FARMER_CHECKED_IN', booking);
    broadcastEvent('QUEUE_UPDATED', { centreId: booking.centreId });
  }
  res.json({ success: true });
});

router.post('/queues/call-next', (req, res) => {
  const checkedIn = bookings.filter(b => b.status === 'checked_in');
  const booking = checkedIn[0];
  if (booking) {
    booking.status = "called";
    booking.timeline.calledAt = new Date().toISOString();
    broadcastEvent('TOKEN_CALLED', { tokenNumber: booking.tokenNumber, bookingId: booking.id });
    broadcastEvent('QUEUE_UPDATED', { centreId: booking.centreId });
    return res.json({ success: true, booking });
  }
  res.json({ success: false, message: "No farmers checked in." });
});

router.post('/queues/complete', (req, res) => {
  const { bookingId } = req.body;
  const booking = bookings.find(b => b.id === bookingId);
  if (booking) {
    booking.status = "completed";
    booking.timeline.completedAt = new Date().toISOString();
    broadcastEvent('PROCUREMENT_COMPLETED', booking);
    broadcastEvent('QUEUE_UPDATED', { centreId: booking.centreId });
  }
  res.json({ success: true });
});

router.get('/queues/analytics', (req, res) => {
  res.json({ avgWaitTime: 18, checkInRate: 92, processedToday: bookings.length });
});

router.post('/queues/retrain', (req, res) => {
  broadcastEvent('AI_MODEL_RETRAINED', { accuracy: 0.942 });
  res.json({ success: true });
});

// 6. Procurement Updates
router.post('/procurements/status/:bookingId', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.bookingId);
  if (booking) {
    booking.status = req.body.status.toLowerCase();
    broadcastEvent('QUEUE_UPDATED', { centreId: booking.centreId });
  }
  res.json({ success: true });
});

router.post('/procurements/quality-check', (req, res) => {
  const { bookingId, moisturePercentage, foreignMatterPercentage, grade, inspectorName, remarks } = req.body;
  const booking = bookings.find(b => b.id === bookingId);
  if (booking) {
    booking.status = "quality_checked";
    booking.qualityCheck = {
      moisturePercentage,
      foreignMatterPercentage: foreignMatterPercentage || 1.2,
      grade: grade || "Grade A",
      inspectorName: inspectorName || "Inspector Verma",
      checkedAt: new Date().toISOString(),
      remarks
    };
    broadcastEvent('QUALITY_UPDATED', booking);
    broadcastEvent('QUEUE_UPDATED', { centreId: booking.centreId });
  }
  res.json({ success: true });
});

router.post('/procurements/weighment', (req, res) => {
  const { bookingId, grossWeightKg, tareWeightKg, scaleMachineId, operatorName } = req.body;
  const booking = bookings.find(b => b.id === bookingId);
  if (booking) {
    const netWeight = (grossWeightKg - tareWeightKg) / 100.0;
    booking.status = "weighed";
    booking.weighment = {
      grossWeightKg,
      tareWeightKg,
      netWeightQuintals: netWeight,
      weighedAt: new Date().toISOString(),
      scaleMachineId,
      operatorName
    };

    const cropPrice = crops.find(c => c.code === booking.cropCode)?.mspPerQuintal || 2203;
    booking.payment = {
      amountRupees: Math.round(netWeight * cropPrice),
      status: "pfms_processing",
      bankName: "State Bank of India",
      accountLast4: "1729",
      settlementTimestamp: null
    };

    broadcastEvent('WEIGHT_UPDATED', booking);
    broadcastEvent('PAYMENT_UPDATED', booking);
    broadcastEvent('QUEUE_UPDATED', { centreId: booking.centreId });
  }
  res.json({ success: true });
});

// 7. Payments
router.post('/payments/:bookingId/status', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.bookingId);
  if (booking && booking.payment) {
    booking.payment.status = req.body.status;
    if (req.body.status.toUpperCase() === 'PAYMENT_CREDITED' || req.body.status.toUpperCase() === 'COMPLETED') {
      booking.payment.settlementTimestamp = new Date().toISOString();
      booking.status = "completed";
    }
    broadcastEvent('PAYMENT_UPDATED', booking);
    broadcastEvent('QUEUE_UPDATED', { centreId: booking.centreId });
  }
  res.json({ success: true });
});

router.get('/payments/:bookingId/events', (req, res) => {
  res.json([
    { eventName: "Payment File Generated", timestamp: new Date(Date.now() - 3600000).toISOString(), remarks: "DBT file queued" },
    { eventName: "Sent to PFMS", timestamp: new Date(Date.now() - 1800000).toISOString(), remarks: "PFMS validation accepted" }
  ]);
});

// 8. Analytics & AI Predictor
router.get('/analytics/dashboard', (req, res) => {
  res.json({
    procurementVolumeMT: 14.8,
    activeFarmers: bookings.length,
    capacityUtilization: 88,
    dbtPaidCr: 14.8,
    paymentsPending: bookings.filter(b => b.payment && b.payment.status !== 'PAYMENT_CREDITED').length,
    paymentsProcessing: bookings.filter(b => b.payment && b.payment.status === 'pfms_processing').length,
    avgPaymentClearanceHours: 4.2,
    pfmsSuccessRate: 99.4
  });
});

router.post('/ai/predict', (req, res) => {
  const { crop, quantity } = req.body;
  const qty = Number(quantity || 20);
  const baseWait = 15;
  const multiplier = crop === "paddy" ? 1.2 : 1.0;
  const waitMinutes = Math.round(baseWait * multiplier * (1.0 + qty / 50.0));

  res.json({
    predictedWaitMinutes: waitMinutes,
    congestionLevel: waitMinutes > 30 ? "SURGE" : "OPTIMAL",
    recommendation: waitMinutes > 30 ? "High load. Postpone to afternoon." : "Optimal load. Carry on."
  });
});

// 9. SSE Connection handler
router.get('/events/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);
  req.on('close', () => {
    sseClients = sseClients.filter(c => c !== res);
  });
});

app.use('/api/v1', router);

// ==========================================
// VITE INTEGRATION FOR HOSTING THE FRONTEND
// ==========================================

const startServer = async () => {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      );
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`[KPIP-Server] Development platform active on http://localhost:${PORT}`);
  });
};

// Import fs dynamically to support standard ESM runs
import fs from 'fs';
startServer();
