"use client";

import { MessageCircle, Send, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

function copy(ar: boolean, en: string, arabic: string) {
  return ar ? arabic : en;
}

export function SupportChat() {
  const pathname = usePathname();
  const ar = pathname === "/ar" || pathname.startsWith("/ar/");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationRef.current?.scrollTo({ top: conversationRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: ar ? "ar" : "en", messages: nextMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((current) => {
          const updated = [...current];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }

      if (!assistantText.trim()) {
        throw new Error("Empty response");
      }
    } catch {
      setError(copy(ar, "Something went wrong. Please try again.", "حدث خطأ ما. يرجى المحاولة مرة أخرى."));
      setMessages((current) => current.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  }

  const suggestions = [
    { en: "Help me choose a destination", ar: "ساعدني في اختيار وجهة" },
    { en: "Tell me about Saudi Arabia", ar: "أخبرني عن السعودية" },
  ];

  return <aside className={`supportChat ${open ? "open" : ""}`} dir={ar ? "rtl" : "ltr"}>
    <div className="supportPanel" id="memories-support-panel" aria-hidden={!open}>
      <header className="supportHeader">
        <span className="supportAvatar"><Image src="/images/memories-logo-full.webp" alt="" width={26} height={26} /></span>
        <span><strong>{copy(ar, "Noor", "نور")}</strong><small><i /> {copy(ar, "MEMORIES AI concierge", "مساعد ميموريز الذكي")}</small></span>
        <button type="button" onClick={() => setOpen(false)} aria-label={copy(ar, "Close support chat", "إغلاق محادثة الدعم")}><X /></button>
      </header>
      <div className="supportConversation" ref={conversationRef}>
        {messages.length === 0 ? (
          <>
            <span className="supportSpark"><Image src="/images/memories-logo-full.webp" alt="" width={22} height={22} /></span>
            <p className="supportGreeting">{copy(ar, "Hi, I'm Noor. What would you like to ask?", "أهلًا، أنا نور. بماذا يمكننا مساعدتك؟")}</p>
            <p>{copy(ar, "Ask about a destination, your dream journey or studying abroad.", "اسأل عن وجهة أو رحلة أحلامك أو الدراسة في الخارج.")}</p>
            <div className="supportSuggestions" aria-label={copy(ar, "Suggested questions", "أسئلة مقترحة")}>
              {suggestions.map((suggestion) => (
                <button type="button" key={suggestion.en} onClick={() => sendMessage(ar ? suggestion.ar : suggestion.en)}>
                  {copy(ar, suggestion.en, suggestion.ar)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="supportMessages">
            {messages.map((message, index) => (
              <div className={`supportMessage ${message.role}`} key={index}>
                {message.role === "assistant" && (
                  <span className="supportMessageAvatar"><Image src="/images/memories-logo-full.webp" alt="" width={16} height={16} /></span>
                )}
                <div className="supportMessageContent">
                  {message.role === "assistant" && <span className="supportMessageName">{copy(ar, "Noor", "نور")}</span>}
                  {message.role === "assistant" && message.content === "" && isStreaming && index === messages.length - 1 ? (
                    <span className="supportTyping" aria-label={copy(ar, "Typing", "يكتب الآن")}><span /><span /><span /></span>
                  ) : (
                    <span className="supportBubble">{message.content}</span>
                  )}
                </div>
              </div>
            ))}
            {error && <p className="supportFootnote" role="alert">{error}</p>}
          </div>
        )}
      </div>
      <form className="supportComposer" onSubmit={handleSubmit}>
        <label className="srOnly" htmlFor="support-message">{copy(ar, "Your question", "سؤالك")}</label>
        <textarea
          id="support-message"
          rows={2}
          placeholder={copy(ar, "Type your question here…", "اكتب سؤالك هنا…")}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" disabled={isStreaming || !input.trim()} aria-label={copy(ar, "Send message", "إرسال الرسالة")}><Send className="directionArrow" /></button>
      </form>
    </div>
    <button className="supportLauncher" type="button" aria-expanded={open} aria-controls="memories-support-panel" onClick={() => setOpen((value) => !value)}>
      <span className="supportLauncherIcon">{open ? <X aria-hidden="true" /> : <MessageCircle aria-hidden="true" />}</span>
      <span className="supportLauncherCopy"><strong>{copy(ar, "Ask Noor", "اسأل نور")}</strong><small>{copy(ar, "MEMORIES AI concierge", "مساعد ميموريز الذكي")}</small></span>
    </button>
  </aside>;
}
