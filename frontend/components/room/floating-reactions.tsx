"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type FloatingReaction = {
  id: string;
  emoji: string;
  x: number;
};

type FloatingReactionsProps = {
  reactions: FloatingReaction[];
  onDone: (id: string) => void;
};

export function FloatingReactions({ reactions, onDone }: FloatingReactionsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <AnimatePresence>
        {reactions.map((r) => (
          <FloatingEmoji key={r.id} reaction={r} onDone={onDone} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function FloatingEmoji({
  reaction,
  onDone,
}: {
  reaction: FloatingReaction;
  onDone: (id: string) => void;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDone(true);
      onDone(reaction.id);
    }, 2800);
    return () => clearTimeout(t);
  }, [reaction.id, onDone]);

  if (done) return null;

  return (
    <motion.span
      initial={{ opacity: 1, y: 0, x: `${reaction.x}%`, scale: 0.6 }}
      animate={{ opacity: 0, y: -160, scale: 1.4 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2.6, ease: "easeOut" }}
      className="absolute bottom-24 text-3xl drop-shadow-lg font-[family-name:var(--font-emoji)]"
      style={{ left: `${reaction.x}%` }}
    >
      {reaction.emoji}
    </motion.span>
  );
}

export const REACTION_EMOJIS = ["❤️", "😂", "🔥", "👏", "😮", "🎉"] as const;
