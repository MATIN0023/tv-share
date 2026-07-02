"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendAssistantMessage, type AssistantMessage } from "@/lib/api/assistant";
import { CompactLoader } from "@/components/ui/app-loader";

import { useTranslation } from "@/providers/i18n-provider";

export function AssistantWidget() {
  const { t, locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: "assistant",
      content: t("assistant.greeting"),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: AssistantMessage = { role: "user", content: trimmed };
    const nextHistory = [...messages.filter((m) => m.role !== "system"), userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendAssistantMessage({
        message: trimmed,
        locale,
        history: nextHistory.slice(-10),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("assistant.error") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    t("assistant.suggestRoom"),
    t("assistant.suggestOtp"),
    t("assistant.suggestUpload"),
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 z-[60] flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg transition hover:scale-105",
          locale === "fa" ? "left-6" : "right-6"
        )}
        aria-label={t("assistant.open")}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {open ? (
        <div
          className={cn(
            "fixed bottom-24 z-[60] flex w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/95 shadow-2xl backdrop-blur-xl",
            locale === "fa" ? "left-4 sm:left-6" : "right-4 sm:right-6"
          )}
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <Sparkles className="size-5 text-violet-400" />
            <div>
              <p className="font-semibold text-sm">{t("assistant.title")}</p>
              <p className="text-xs text-muted-foreground">{t("assistant.subtitle")}</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 max-h-80 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[90%] rounded-2xl px-3 py-2 text-sm",
                  msg.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-white/10 text-foreground"
                )}
              >
                {msg.content}
              </div>
            ))}
            {loading ? (
              <CompactLoader
                label={t("assistant.thinking")}
                className="items-start py-2"
              />
            ) : null}
          </div>

          <div className="flex flex-wrap gap-1 border-t border-white/10 p-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-white/10 px-2 py-1 text-xs text-muted-foreground hover:bg-white/5"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="flex gap-2 border-t border-white/10 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("assistant.placeholder")}
              className="flex-1 rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-primary p-2 text-white disabled:opacity-50"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
