"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: "Hey! I'm your Accorria agent 👋 Ask me about listing a car or home." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    const text = inputRef.current?.value?.trim();
    if (!text || isLoading) return;
    
    inputRef.current!.value = "";
    setIsLoading(true);
    
    const next = [...msgs, { role: "user", content: text }];
    setMsgs(next);

    try {
      // Stream from our API
      const res = await fetch("/api/chat", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }) 
      });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const reader = res.body!.getReader();
      const decoder = new TextDecoder("utf-8");
      let buff = "";
      let assistant = { role: "assistant", content: "" } as any;
      setMsgs((m) => [...m, assistant]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buff += decoder.decode(value, { stream: true });

        // Parse SSE: lines like "data: {choices:[{delta:{content:\"...\"}}]}"
        for (const line of buff.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const json = line.replace("data: ", "").trim();
          if (json === "[DONE]") break;
          try {
            const chunk = JSON.parse(json);
            const piece = chunk.choices?.[0]?.delta?.content ?? "";
            if (piece) {
              assistant.content += piece;
              setMsgs((m) => [...m.slice(0, -1), { ...assistant }]);
            }
          } catch {}
        }
        // keep only the last (incomplete) line in buff
        const lastNL = buff.lastIndexOf("\n");
        if (lastNL >= 0) buff = buff.slice(lastNL + 1);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMsgs((m) => [...m, { 
        role: "assistant", 
        content: "Sorry, I'm having trouble connecting right now. Try again in a moment!" 
      }]);
    } finally {
      setIsLoading(false);
    }
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
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-5 z-40 w-[92vw] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
                               <div className="flex items-center justify-between border-b px-4 py-3 bg-gradient-to-r from-amber-50 to-white">
                     <div className="flex items-center gap-2">
                       <img 
                         src="/AccorriaYwLOGO.png" 
                         alt="Accorria" 
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
                     className="h-80 space-y-4 overflow-y-auto bg-slate-50 p-6 text-sm text-slate-800"
                   >
                                   {msgs.map((m, i) => (
                       <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
                         {m.role === "assistant" && (
                           <img 
                             src="/AccorriaYwLOGO.png" 
                             alt="Accorria" 
                             className="w-6 h-6 rounded-full mr-3 mt-1 flex-shrink-0"
                           />
                         )}
                         <div className={`${
                           m.role === "user" 
                             ? "bg-amber-500 text-white" 
                             : "bg-white border border-slate-200"
                           } max-w-[80%] rounded-2xl px-4 py-3 shadow-sm leading-relaxed`}
                         >
                           {m.content}
                         </div>
                       </div>
                     ))}
                                   {isLoading && (
                       <div className="flex justify-start mb-4">
                         <img 
                           src="/AccorriaYwLOGO.png" 
                           alt="Accorria" 
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
                placeholder="Ask about listing your car or home..."
                disabled={isLoading}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent disabled:opacity-50"
              />
              <button 
                onClick={send} 
                disabled={isLoading}
                className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
