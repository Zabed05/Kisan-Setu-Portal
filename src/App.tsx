import React, { useState, useEffect } from 'react';
import { PortalType, Language, UserRole, BookingSlot, FarmerProfile, BankAccount, BookingStatus } from './types';
import { initialFarmerProfile, initialBookings, translations } from './data/mockData';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { VoiceAssistantModal } from './components/common/VoiceAssistantModal';
import { PrintSlipModal } from './components/common/PrintSlipModal';
import { FarmerLogin } from './components/farmer/FarmerLogin';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { SmartSlotBooking } from './components/farmer/SmartSlotBooking';
import { BookingSuccessModal } from './components/farmer/BookingSuccessModal';
import { BankRegistration } from './components/farmer/BankRegistration';
import { ProcurementTracker } from './components/farmer/ProcurementTracker';
import { CentreDashboard } from './components/operator/CentreDashboard';
import { ExecutiveAnalytics } from './components/admin/ExecutiveAnalytics';
import { api, subscribeToEvents } from './api/client';

export function App() {
  const [currentPortal, setCurrentPortal] = useState<PortalType>('farmer');
  const [language, setLanguage] = useState<Language>('en');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [farmer, setFarmer] = useState<FarmerProfile>(initialFarmerProfile);
  const [bookingsQueue, setBookingsQueue] = useState<BookingSlot[]>(initialBookings);
  const [currentBooking, setCurrentBooking] = useState<BookingSlot>(initialBookings[0]);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  
  // Modals
  const [isVoiceAssistOpen, setIsVoiceAssistOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPrintSlipOpen, setIsPrintSlipOpen] = useState(false);

  // Synchronize data from backend API
  const refreshDataFromBackend = async () => {
    try {
      const activeId = localStorage.getItem('kpip_farmer_id') || 'farmer-101';
      const [fetchedBookings, fetchedFarmer] = await Promise.allSettled([
        api.getBookings(),
        api.getFarmerProfile(activeId)
      ]);

      if (fetchedBookings.status === 'fulfilled' && fetchedBookings.value.length > 0) {
        setBookingsQueue(fetchedBookings.value);
        // Find current farmer booking or fallback to latest
        const farmerBooking = fetchedBookings.value.find((b: BookingSlot) => b.farmerId === activeId) || fetchedBookings.value[0];
        setCurrentBooking(farmerBooking);
      }

      if (fetchedFarmer.status === 'fulfilled' && fetchedFarmer.value) {
        setFarmer(fetchedFarmer.value);
      }
    } catch (err) {
      console.warn('Backend synchronization notice:', err);
    }
  };

  useEffect(() => {
    const checkPersistedSession = async () => {
      const token = localStorage.getItem('kpip_jwt_token');
      if (!token) return;

      try {
        const me = await api.getMe();
        if (me && me.user) {
          setIsLoggedIn(true);
          if (me.user.role === 'FARMER') {
            setCurrentPortal('farmer');
            if (me.farmerProfile) {
              const profile = me.farmerProfile;
              const mappedProfile: FarmerProfile = {
                id: profile.id,
                kisanId: profile.kisanId,
                name: profile.name,
                phone: profile.phone,
                avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
                state: profile.state,
                district: profile.district,
                village: profile.village,
                isVerified: profile.isVerified,
                bankDetails: profile.bankAccount ? {
                  accountHolder: profile.bankAccount.accountHolder,
                  bankName: profile.bankAccount.bankName,
                  accountNumber: profile.bankAccount.accountNumberEncrypted,
                  ifscCode: profile.bankAccount.ifscCode,
                  isVerified: profile.bankAccount.isVerified,
                  linkedDate: new Date(profile.bankAccount.createdAt).toLocaleDateString('en-GB')
                } : undefined
              };
              setFarmer(mappedProfile);
              localStorage.setItem('kpip_farmer_id', profile.id);
            }
            const isCompleted = me.profileCompleted || !!(me.farmerProfile && me.farmerProfile.name && me.farmerProfile.name !== 'New Farmer User' && me.farmerProfile.bankAccount);
            setCurrentView(isCompleted ? 'dashboard' : 'bank');
          } else {
            setCurrentPortal('operator');
            setCurrentView('dashboard');
          }
          await refreshDataFromBackend();
        }
      } catch (err) {
        localStorage.removeItem('kpip_jwt_token');
      }
    };

    checkPersistedSession();
    refreshDataFromBackend();

    // Subscribe to live SSE events from backend
    const unsubscribe = subscribeToEvents((eventType, eventData) => {
      console.log(`[KPIP-Realtime] Event received: ${eventType}`, eventData);
      refreshDataFromBackend();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {}
    localStorage.removeItem('kpip_jwt_token');
    localStorage.removeItem('kpip_farmer_id');
    setIsLoggedIn(false);
  };

  const handleLoginSuccess = async (role: UserRole, farmerProfile?: any, profileCompleted?: boolean) => {
    setIsLoggedIn(true);
    if (role === 'farmer') {
      setCurrentPortal('farmer');
      if (farmerProfile) {
        setFarmer(farmerProfile);
        localStorage.setItem('kpip_farmer_id', farmerProfile.id);
      }
      if (profileCompleted) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('bank');
      }
    } else if (role === 'operator') {
      setCurrentPortal('operator');
      setCurrentView('dashboard');
    } else if (role === 'admin') {
      setCurrentPortal('admin');
      setCurrentView('analytics');
    }
    await refreshDataFromBackend();
  };

  const handleBookingConfirmed = (newBooking: BookingSlot) => {
    setBookingsQueue(prev => [newBooking, ...prev]);
    setCurrentBooking(newBooking);
    setIsSuccessModalOpen(true);
    refreshDataFromBackend();
  };

  const handleSaveBank = async (
    bank: BankAccount, 
    updatedName: string, 
    phone: string, 
    aadhaar: string,
    address: string,
    pincode: string,
    latitude?: number,
    longitude?: number
  ) => {
    try {
      if (api.saveFarmerProfile) {
        const res = await api.saveFarmerProfile({
          fullName: updatedName,
          state: farmer.state || 'Haryana',
          district: farmer.district || 'Karnal',
          village: address.split(',')[0] || farmer.village || 'Nilokheri',
          bankName: bank.bankName,
          accountNumber: bank.accountNumber,
          ifsc: bank.ifscCode
        });
        if (res.farmer) {
          const updatedFarmer: FarmerProfile = {
            ...farmer,
            id: res.farmer.id,
            name: res.farmer.name,
            phone: res.farmer.phone,
            state: res.farmer.state,
            district: res.farmer.district,
            village: res.farmer.village,
            isVerified: true,
            bankDetails: res.farmer.bankAccount ? {
              accountHolder: res.farmer.bankAccount.accountHolder,
              bankName: res.farmer.bankAccount.bankName,
              accountNumber: res.farmer.bankAccount.accountNumberEncrypted,
              ifscCode: res.farmer.bankAccount.ifscCode,
              isVerified: res.farmer.bankAccount.isVerified,
              linkedDate: new Date(res.farmer.bankAccount.createdAt).toLocaleDateString('en-GB')
            } : undefined
          };
          setFarmer(updatedFarmer);
        }
      }
    } catch (err) {}

    setBookingsQueue(prev => prev.map(b => {
      if (b.farmerId === farmer.id) {
        return { ...b, farmerName: updatedName };
      }
      return b;
    }));
    setCurrentView('dashboard');
  };

  const handleUpdateBooking = (updatedBooking: BookingSlot) => {
    setBookingsQueue(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
    if (currentBooking.id === updatedBooking.id) {
      setCurrentBooking(updatedBooking);
    }
  };

  const handleUpdateBookingStatus = async (newStatus: BookingStatus) => {
    try {
      await api.updateBookingStatus(currentBooking.id, newStatus);
    } catch (err) {}

    const updated = {
      ...currentBooking,
      status: newStatus
    };
    setCurrentBooking(updated);
    setBookingsQueue(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafb] text-[#191c1d] selection:bg-[#8dfa96] selection:text-[#00531b]">
      {/* Top Main Navigation Header */}
      {isLoggedIn && (
        <Header
          currentPortal={currentPortal}
          onSelectPortal={(portal) => {
            setCurrentPortal(portal);
            if (portal === 'admin') setCurrentView('analytics');
            else setCurrentView('dashboard');
          }}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          farmer={farmer}
          onOpenVoiceAssist={() => setIsVoiceAssistOpen(true)}
          currentView={currentView}
          onNavigateView={(view) => setCurrentView(view)}
          onLogout={handleLogout}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {!isLoggedIn ? (
          <FarmerLogin
            language={language}
            onToggleLanguage={handleToggleLanguage}
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={() => {
              const newId = `farmer-${Date.now()}`;
              const emptyFarmer: FarmerProfile = {
                id: newId,
                kisanId: `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
                name: '',
                phone: '',
                avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
                state: 'Haryana',
                district: 'Karnal',
                village: 'Nilokheri',
                isVerified: false,
                bankDetails: undefined
              };
              setFarmer(emptyFarmer);
              localStorage.setItem('kpip_farmer_id', newId);
              setIsLoggedIn(true);
              setCurrentPortal('farmer');
              setCurrentView('bank');
            }}
          />
        ) : (
          <>
            {/* 1. Farmer Portal */}
            {currentPortal === 'farmer' && (
              <>
                {currentView === 'dashboard' && (
                  <FarmerDashboard
                    farmer={farmer}
                    booking={currentBooking}
                    bookings={bookingsQueue}
                    language={language}
                    onOpenBooking={() => setCurrentView('booking')}
                    onOpenTracker={() => setCurrentView('tracker')}
                    onOpenBankRegistration={() => setCurrentView('bank')}
                    onOpenVoiceAssist={() => setIsVoiceAssistOpen(true)}
                    onOpenSlip={() => setIsPrintSlipOpen(true)}
                  />
                )}

                {currentView === 'booking' && (
                  <SmartSlotBooking
                    farmer={farmer}
                    language={language}
                    onBack={() => setCurrentView('dashboard')}
                    onBookingConfirmed={handleBookingConfirmed}
                  />
                )}

                {currentView === 'tracker' && (
                  <ProcurementTracker
                    booking={currentBooking}
                    language={language}
                    onBack={() => setCurrentView('dashboard')}
                    onOpenPrintSlip={() => setIsPrintSlipOpen(true)}
                    onUpdateStatus={handleUpdateBookingStatus}
                  />
                )}

                {currentView === 'bank' && (
                  <BankRegistration
                    farmer={farmer}
                    language={language}
                    onBack={() => setCurrentView('dashboard')}
                    onSaveBank={handleSaveBank}
                    onNavigateToBooking={() => setCurrentView('booking')}
                    onNavigateToTracking={() => setCurrentView('tracker')}
                  />
                )}
              </>
            )}

            {/* 2. Procurement Centre / Mandi Operator Portal */}
            {currentPortal === 'operator' && (
              <CentreDashboard
                language={language}
                onOpenVoiceAssist={() => setIsVoiceAssistOpen(true)}
                queue={bookingsQueue}
                onUpdateBooking={handleUpdateBooking}
              />
            )}

            {/* 3. Government Executive Analytics Portal */}
            {currentPortal === 'admin' && (
              <ExecutiveAnalytics
                language={language}
              />
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer language={language} />

      {/* Modals & Overlays */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistOpen}
        onClose={() => setIsVoiceAssistOpen(false)}
        language={language}
      />

      {isSuccessModalOpen && (
        <BookingSuccessModal
          booking={currentBooking}
          language={language}
          onOpenTracker={() => {
            setIsSuccessModalOpen(false);
            setCurrentView('tracker');
          }}
          onOpenPrintSlip={() => {
            setIsSuccessModalOpen(false);
            setIsPrintSlipOpen(true);
          }}
          onClose={() => {
            setIsSuccessModalOpen(false);
            setCurrentView('dashboard');
          }}
        />
      )}

      <PrintSlipModal
        booking={currentBooking}
        farmer={farmer}
        isOpen={isPrintSlipOpen}
        onClose={() => setIsPrintSlipOpen(false)}
        language={language}
      />
    </div>
  );
}

export default App;
