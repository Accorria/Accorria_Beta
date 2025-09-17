"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CarListingData {
  year?: string;
  make?: string;
  model?: string;
  miles?: string;
  title_status?: string;
  zip?: string;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [carData, setCarData] = useState<CarListingData>({});
  const [conversationState, setConversationState] = useState<'start' | 'collect_basic' | 'collect_meta' | 'gate_to_login' | 'nudge_alt_capture'>('start');
  const [messageCount, setMessageCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Reset conversation when opening
  useEffect(() => {
    if (open) {
      setMsgs([]);
      setCarData({});
      setConversationState('start');
      setMessageCount(0);
    }
  }, [open]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Apply comprehensive body scroll lock
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
      // Prevent all touch interactions on body
      document.body.style.touchAction = 'none';
      document.body.style.pointerEvents = 'none';
      
      // Prevent scrolling on html element too
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
      
      // Cleanup function
      return () => {
        document.body.style.overflow = 'unset';
        document.body.style.position = 'unset';
        document.body.style.top = 'unset';
        document.body.style.left = 'unset';
        document.body.style.right = 'unset';
        document.body.style.width = 'unset';
        document.body.style.height = 'unset';
        document.body.style.touchAction = 'unset';
        document.body.style.pointerEvents = 'unset';
        
        document.documentElement.style.overflow = 'unset';
        document.documentElement.style.height = 'unset';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);



  const send = async () => {
    const text = inputRef.current?.value?.trim();
    if (!text || isLoading) return;
    
    // Rate limiting: max 3 messages after collect_meta
    if (messageCount >= 3 && conversationState === 'gate_to_login') {
      setMsgs((m) => [...m, { 
        role: "assistant", 
        content: "To continue, please **sign in** to Accorria or provide your email/phone for a magic link."
      }]);
      return;
    }
    
    inputRef.current!.value = "";
    setIsLoading(true);
    setMessageCount(prev => prev + 1);
    
    const next = [...msgs, { role: "user", content: text }];
    setMsgs(next);

    try {
      // Handle conversation flow based on state
      const response = await handleConversationFlow(text);
      setMsgs((m) => [...m, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMsgs((m) => [...m, { 
        role: "assistant", 
        content: "Sorry, I'm having trouble right now. Please try again or sign in to create your listing directly."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationFlow = async (userInput: string): Promise<string> => {
    switch (conversationState) {
      case 'start':
        return handleStartState(userInput);
      case 'collect_basic':
        return handleCollectBasicState(userInput);
      case 'collect_meta':
        return handleCollectMetaState(userInput);
      case 'gate_to_login':
        return handleGateToLoginState(userInput);
      case 'nudge_alt_capture':
        return handleNudgeAltCaptureState(userInput);
      default:
        return "Let's start over. What kind of car do you have? (Year, Make, Model)";
    }
  };

  const handleStartState = (input: string): string => {
    // Extract year, make, model from input
    const words = input.split(' ');
    const yearMatch = words.find(word => /^\d{4}$/.test(word));
    
    if (yearMatch) {
      setCarData(prev => ({ ...prev, year: yearMatch }));
      setConversationState('collect_basic');
      return "Nice. About how many miles and what's the title status (clean or rebuilt)?";
    }
    
    return "What kind of car do you have? (Year, Make, Model)";
  };

  const handleCollectBasicState = (input: string): string => {
    // Extract miles and title status
    const milesMatch = input.match(/(\d+(?:,\d{3})*)\s*miles?/i);
    const titleMatch = input.match(/(clean|rebuilt|salvage)/i);
    
    if (milesMatch) {
      setCarData(prev => ({ ...prev, miles: milesMatch[1].replace(/,/g, '') }));
    }
    
    if (titleMatch) {
      setCarData(prev => ({ ...prev, title_status: titleMatch[1].toLowerCase() }));
    }
    
    if (milesMatch && titleMatch) {
      setConversationState('collect_meta');
      return "Last thing: what's your ZIP? (We use this for local demand.)";
    }
    
    return "Got it. Miles and title (clean or rebuilt)?";
  };

  const handleCollectMetaState = (input: string): string => {
    const zipMatch = input.match(/\b\d{5}(?:-\d{4})?\b/);
    
    if (zipMatch) {
      setCarData(prev => ({ ...prev, zip: zipMatch[0] }));
      setConversationState('gate_to_login');
      return "Sweet. To see **Good / Better / Best** pricing and finish your listing, please sign in.";
    }
    
    return "Your ZIP? (For local demand)";
  };

  const handleGateToLoginState = (input: string): string => {
    if (input.toLowerCase().includes('sign') || input.toLowerCase().includes('login')) {
      // Open auth modal
      window.location.href = '/dashboard';
      return "Perfect! You're being redirected to sign in.";
    }
    
    setConversationState('nudge_alt_capture');
    return "No worries — I can send a magic link. What's your email or phone?";
  };

  const handleNudgeAltCaptureState = (input: string): string => {
    const emailMatch = input.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const phoneMatch = input.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
    
    if (emailMatch || phoneMatch) {
      // Send magic link
      return "Magic link sent! Open it to finish your listing.";
    }
    
    return "What's your email or phone for the magic link?";
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-amber-400 px-4 py-3 font-semibold text-slate-900 shadow-xl hover:bg-amber-300 transition-all duration-200 hover:scale-105"
      >
        <span className="inline-flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Ask Accorria
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setOpen(false)}
            />
            
            {/* Chat modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-4 right-4 left-4 sm:bottom-20 sm:right-5 sm:left-auto sm:w-[92vw] sm:max-w-sm z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between border-b px-4 py-3 bg-gradient-to-r from-amber-50 to-white">
              <div className="flex items-center gap-2">
                <Image 
                  src="/LOGOSYMBLOYBLUE.png" 
                  alt="Accorria" 
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
                <div className="text-sm font-semibold text-slate-800">Accorria Agent</div>
              </div>
              <button 
                className="text-slate-500 hover:text-slate-800 transition-colors" 
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>

            <div 
              ref={boxRef} 
              className="h-80 sm:h-80 max-h-[60vh] space-y-4 overflow-y-auto bg-slate-50 p-4 sm:p-6 text-sm text-slate-800"
            >
              {msgs.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  <div className="text-lg mb-2">🚗</div>
                  <div className="text-sm font-medium">What kind of car do you have?</div>
                  <div className="text-xs mt-2 text-slate-400">
                    (Year, Make, Model)
                  </div>
                  <div className="text-xs mt-3 text-slate-300 max-w-xs mx-auto">
                    Get instant market analysis, pricing strategies, and listing optimization powered by AI
                  </div>
                </div>
              )}
              
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
                  {m.role === "assistant" && (
                    <Image 
                      src="/LOGOSYMBLOYBLUE.png" 
                      alt="Accorria" 
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full mr-3 mt-1 flex-shrink-0"
                    />
                  )}
                  <div className={`${
                    m.role === "user" 
                      ? "bg-amber-500 text-white" 
                      : "bg-white border border-slate-200"
                    } max-w-[80%] rounded-2xl px-4 py-3 shadow-sm leading-relaxed whitespace-pre-wrap`}
                  >
                    <div className="prose prose-sm max-w-none">
                      {m.content.split('\n').map((line, index) => {
                        // Handle numbered lists with better formatting
                        if (/^\d+\.\s/.test(line)) {
                          return (
                            <div key={index} className="flex items-start mb-2">
                              <span className="font-semibold text-amber-600 mr-2 min-w-[20px]">
                                {line.match(/^\d+/)?.[0]}.
                              </span>
                              <span className="flex-1">{line.replace(/^\d+\.\s/, '')}</span>
                            </div>
                          );
                        }
                        // Handle bullet points
                        if (line.startsWith('•') || line.startsWith('-')) {
                          return (
                            <div key={index} className="flex items-start mb-1 ml-4">
                              <span className="text-amber-500 mr-2">•</span>
                              <span className="flex-1">{line.replace(/^[•-]\s/, '')}</span>
                            </div>
                          );
                        }
                        // Handle headings (lines that end with :)
                        if (line.trim().endsWith(':') && line.length < 50) {
                          return (
                            <div key={index} className="font-semibold text-slate-800 mb-2 mt-3 first:mt-0">
                              {line}
                            </div>
                          );
                        }
                        // Regular text
                        return (
                          <div key={index} className="mb-1">
                            {line}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <Image 
                    src="/LOGOSYMBLOYBLUE.png" 
                    alt="Accorria" 
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full mr-3 mt-1 flex-shrink-0"
                  />
                  <div className="bg-white border border-slate-200 max-w-[80%] rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-slate-500">Accorria is typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>


            <div className="flex items-center gap-2 border-t bg-white p-3">
              <input
                ref={inputRef}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && send()}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-500 outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent disabled:opacity-50 bg-white min-w-0 pointer-events-auto"
              />
              <button 
                onClick={send} 
                disabled={isLoading}
                className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex-shrink-0"
              >
                Send
              </button>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
