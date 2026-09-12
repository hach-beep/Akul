import React, { useState, useRef, useEffect } from "react";
import { X, Send, ChefHat, Sparkles, User, Bot, RefreshCw } from "lucide-react";
import { askChef } from "../services/apiClient.ts";

interface ChefCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fridgeItems: string[];
  initialContextMeal?: string;
}

interface Message {
  id: string;
  sender: "user" | "chef";
  text: string;
  timestamp: string;
}

export const ChefCopilotDrawer: React.FC<ChefCopilotDrawerProps> = ({
  isOpen,
  onClose,
  fridgeItems,
  initialContextMeal,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "chef",
      text: `Bonjour! I am Chef Remy, your autonomous kitchen copilot. I've reviewed your fridge stock (${fridgeItems.slice(0, 4).join(", ") || "items"}). How can I help you adjust a recipe, suggest an air fryer method, or find pantry substitutes?`,
      timestamp: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    "How do I cook this in an air fryer?",
    "Best zero-cost substitute for cream?",
    "How to keep my fresh produce crisp?",
    "Can I freeze remaining leftovers?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const answer = await askChef(query, {
        fridgeItems,
        currentMeal: initialContextMeal,
      });

      const chefMsg: Message = {
        id: `chef-${Date.now()}`,
        sender: "chef",
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, chefMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `chef-err-${Date.now()}`,
          sender: "chef",
          text: "I couldn't reach the culinary brain right now. Try again in a second!",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      id="chef-copilot-drawer"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity"
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden text-left">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm font-display text-stone-900 flex items-center gap-1.5">
                <span>Chef Remy</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </h3>
              <p className="text-[11px] text-stone-500">Autonomous Culinary Assistant</p>
            </div>
          </div>

          <button
            id="close-chef-copilot-button"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === "user" ? "bg-stone-800 text-white" : "bg-emerald-600 text-white"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-stone-900 text-white rounded-tr-xs"
                    : "bg-white text-stone-800 border border-stone-200 shadow-2xs rounded-tl-xs"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span
                  className={`text-[9px] mt-1 block text-right ${
                    m.sender === "user" ? "text-stone-400" : "text-stone-400"
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-stone-400 text-xs pl-9">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Chef Remy is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-stone-50 border-t border-stone-100 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-emerald-500 hover:text-emerald-700 whitespace-nowrap transition shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
        >
          <input
            id="chef-copilot-input"
            type="text"
            placeholder="Ask anything about cooking or ingredients..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-emerald-600"
          />
          <button
            id="send-chef-copilot-button"
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
