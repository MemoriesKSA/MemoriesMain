"use client";

import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { FormEvent, useState } from "react";

function copy(ar: boolean, en: string, arabic: string) {
  return ar ? arabic : en;
}

export function SupportChat() {
  const pathname = usePathname();
  const ar = pathname === "/ar" || pathname.startsWith("/ar/");
  const [open, setOpen] = useState(false);

  function preventSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return <aside className={`supportChat ${open ? "open" : ""}`} dir={ar ? "rtl" : "ltr"}>
    <div className="supportPanel" id="memories-support-panel" aria-hidden={!open}>
      <header className="supportHeader">
        <span className="supportAvatar"><Sparkles aria-hidden="true" /></span>
        <span><strong>{copy(ar, "MEMORIES concierge", "مساعد ميموريز")}</strong><small><i /> {copy(ar, "AI travel support · Coming soon", "مساعد السفر الذكي · قريبًا")}</small></span>
        <button type="button" onClick={() => setOpen(false)} aria-label={copy(ar, "Close support chat", "إغلاق محادثة الدعم")}><X /></button>
      </header>
      <div className="supportConversation">
        <span className="supportSpark"><Sparkles aria-hidden="true" /></span>
        <p className="supportGreeting">{copy(ar, "What would you like to ask?", "بماذا يمكننا مساعدتك؟")}</p>
        <p>{copy(ar, "Ask about a destination, your dream journey or studying abroad. Live AI replies will be available here soon.", "اسأل عن وجهة أو رحلة أحلامك أو الدراسة في الخارج. ستتوفر الردود الذكية المباشرة هنا قريبًا.")}</p>
        <div className="supportSuggestions" aria-label={copy(ar, "Suggested questions", "أسئلة مقترحة")}>
          <span>{copy(ar, "Help me choose a destination", "ساعدني في اختيار وجهة")}</span>
          <span>{copy(ar, "Tell me about Saudi Arabia", "أخبرني عن السعودية")}</span>
        </div>
      </div>
      <form className="supportComposer" onSubmit={preventSend}>
        <label className="srOnly" htmlFor="support-message">{copy(ar, "Your question", "سؤالك")}</label>
        <textarea id="support-message" rows={2} placeholder={copy(ar, "Type your question here…", "اكتب سؤالك هنا…")} />
        <button type="submit" disabled aria-label={copy(ar, "Send message, coming soon", "إرسال الرسالة، قريبًا")} title={copy(ar, "Coming soon", "قريبًا")}><Send className="directionArrow" /></button>
      </form>
      <p className="supportFootnote">{copy(ar, "Preview only, messages are not sent yet.", "نسخة تجريبية، لا يتم إرسال الرسائل حاليًا.")}</p>
    </div>
    <button className="supportLauncher" type="button" aria-expanded={open} aria-controls="memories-support-panel" onClick={() => setOpen((value) => !value)}>
      <span className="supportLauncherIcon">{open ? <X aria-hidden="true" /> : <MessageCircle aria-hidden="true" />}</span>
      <span className="supportLauncherCopy"><strong>{copy(ar, "Ask MEMORIES", "اسأل ميموريز")}</strong><small>{copy(ar, "Travel support · Coming soon", "مساعد السفر · قريبًا")}</small></span>
    </button>
  </aside>;
}
