import React from 'react';
import { Language } from '../../types';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 w-full py-6 mt-auto text-xs text-slate-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-2">
        <p className="text-slate-300 font-medium">
          Ministry of Agriculture & Farmers Welfare, Government of India
        </p>
        <p className="text-[11px] text-slate-500 font-medium">
          © 2026 Kisan Setu (KPIP). Designed and Developed by National Informatics Centre (NIC).
        </p>
      </div>
    </footer>
  );
};
