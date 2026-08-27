import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { Mic, MicOff, Volume2, X, Sparkles, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [isListening, setIsListening] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const sampleQuestions = language === 'hi' ? [
    'मेरी वर्तमान टोकन स्थिति क्या है?',
    'करनाल मंडी में गेहूं का एमएसपी क्या है?',
    'कल के लिए स्लॉट कैसे बुक करें?',
    'क्या मेरा बैंक खाता सत्यापित है?'
  ] : [
    'What is my live queue status for Token #42?',
    'What is the current MSP for Paddy and Wheat?',
    'Which time slot has minimum wait time tomorrow?',
    'When will my payment of ₹42,500 be credited?'
  ];

  const handleAsk = (text: string) => {
    setQuery(text);
    setIsListening(false);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      if (text.includes('टोकन') || text.includes('Token') || text.includes('queue') || text.includes('स्थिति')) {
        setResponse(language === 'hi' 
          ? 'आपका टोकन संख्या #42 है। वर्तमान में टोकन #38 की गुणवत्ता जांच चल रही है। आपकी बारी लगभग 18 मिनट में (2:18 PM) आने की संभावना है।'
          : 'Your Token Number is #42. Currently Token #38 is at the verification desk. Your estimated turn will arrive in approximately 18 minutes (at 2:18 PM).'
        );
      } else if (text.includes('MSP') || text.includes('एमएसपी') || text.includes('गेहूं') || text.includes('Wheat') || text.includes('Paddy')) {
        setResponse(language === 'hi'
          ? 'भारत सरकार द्वारा रबी 2026 के लिए गेहूं का न्यूनतम समर्थन मूल्य ₹2,275 प्रति क्विंटल एवं धान का ₹2,300 प्रति क्विंटल निर्धारित है।'
          : 'The current Government of India MSP for Wheat is ₹2,275 per Quintal and Paddy is ₹2,300 per Quintal with guaranteed DBT transfer.'
        );
      } else if (text.includes('payment') || text.includes('भुगतान') || text.includes('42,500') || text.includes('खाता')) {
        setResponse(language === 'hi'
          ? 'आपका ₹42,500 का भुगतान डीबीटी प्रणाली के माध्यम से आपके एचडीएफसी बैंक खाते में प्रक्रियाधीन है। कल दोपहर 12 बजे तक जमा हो जाएगा।'
          : 'Your payment of ₹42,500 has been initiated via PFMS-DBT to your HDFC Bank account (...7291). Expected settlement is by tomorrow noon.'
        );
      } else {
        setResponse(language === 'hi'
          ? 'करनाल एपीएमसी मंडी आज खुली है। सुबह 9:00 से 11:30 बजे का मॉर्निंग स्लॉट एआई द्वारा अनुशंसित है जहां न्यूनतम 12 मिनट प्रतीक्षा समय है।'
          : 'Karnal APMC Market is operating smoothly. The AI recommended slot is the Morning Batch (09:00 AM - 11:30 AM) with only 12 minutes estimated yard wait.'
        );
      }
    }, 800);
  };

  const toggleMic = () => {
    if (!isListening) {
      setIsListening(true);
      setResponse(null);
      // Simulate speech detection
      setTimeout(() => {
        setIsListening(false);
        handleAsk(language === 'hi' ? 'मेरी टोकन स्थिति और प्रतीक्षा समय बताएं' : 'What is my Token #42 live queue and wait time?');
      }, 2500);
    } else {
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white border border-[#becaba] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2955bf] to-[#476ed9] p-6 text-white flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">AI Kisan Mitra Voice Assist</h3>
                <span className="bg-white/20 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                  Bilingual Live
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                {language === 'hi' ? 'बोलकर या प्रश्न चुनकर तुरंत सरकारी सहायता प्राप्त करें' : 'Speak or tap quick questions for instant Mandi guidance'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Body */}
        <div className="p-6 flex flex-col items-center">
          {/* Animated Mic Button */}
          <div className="relative my-4">
            {isListening && (
              <div className="absolute -inset-4 bg-[#2955bf]/20 rounded-full animate-ping pointer-events-none"></div>
            )}
            <button
              onClick={toggleMic}
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                isListening 
                  ? 'bg-[#ba1a1a] text-white ring-4 ring-[#ba1a1a]/30' 
                  : 'bg-[#2955bf] hover:bg-[#1e4db7] text-white'
              }`}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 animate-bounce" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          <p className="text-xs font-semibold text-[#3f4a3d] mb-6 text-center">
            {isListening 
              ? (language === 'hi' ? 'सुन रहे हैं... कृपया बोलिए' : 'Listening to your voice... Speak now') 
              : (language === 'hi' ? 'माइक दबाकर बोलें या नीचे से प्रश्न चुनें' : 'Tap microphone to speak or choose a question below')}
          </p>

          {/* AI Response Box */}
          {isProcessing && (
            <div className="w-full bg-[#f2f4f5] p-4 rounded-xl flex items-center justify-center gap-3 text-xs text-[#3f4a3d] mb-4">
              <Sparkles className="w-4 h-4 text-[#2955bf] animate-spin" />
              <span>Analyzing procurement records & live queue...</span>
            </div>
          )}

          {response && (
            <div className="w-full bg-[#dbe1ff]/40 border border-[#b4c5ff] p-4 rounded-xl mb-4 text-left animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-[#003ea8] font-bold text-xs mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Kisan Mitra Response:</span>
              </div>
              <p className="text-xs font-medium text-[#191c1d] leading-relaxed">
                {response}
              </p>
              <div className="mt-3 pt-2 border-t border-[#b4c5ff]/50 flex justify-between items-center text-[11px] text-[#003ea8]">
                <span>Verified with State APMC Registry</span>
                <button 
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(response);
                    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
                    window.speechSynthesis.speak(utterance);
                  }}
                  className="flex items-center gap-1 font-semibold hover:underline"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                </button>
              </div>
            </div>
          )}

          {/* Quick FAQ Questions */}
          <div className="w-full">
            <h4 className="text-xs font-bold text-[#6e7a6c] uppercase tracking-wider mb-2 text-left">
              {language === 'hi' ? 'सुझाए गए त्वरित प्रश्न:' : 'Suggested Quick Queries:'}
            </h4>
            <div className="space-y-2">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(q)}
                  className="w-full text-left p-2.5 rounded-lg border border-[#becaba] hover:border-[#2955bf] hover:bg-[#f8fafb] text-xs font-medium text-[#191c1d] flex justify-between items-center transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[#2955bf]" />
                    {q}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#6e7a6c] group-hover:text-[#2955bf] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#f8fafb] border-t border-[#becaba] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#e6e8e9] hover:bg-[#d8dadb] text-[#191c1d] rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
