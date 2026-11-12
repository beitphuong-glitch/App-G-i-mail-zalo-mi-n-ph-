import React from 'react';
import { Smile } from 'lucide-react';

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void;
  className?: string;
}

const COMMON_EMOJIS = [
  '✨', '🔥', '🎁', '⭐', '🚀', '💬', '📞', '🌸', '❤️', '🍀',
  '📦', '🎉', '💼', '⏰', '👉', '🔹', '💯', '✅', '🔔', '📢',
  '💰', '🏷️', '🎯', '📍', '🤝', '👍', '💐', '🏆', '🌟', '📩'
];

export const EmojiPickerPopover: React.FC<EmojiPickerPopoverProps> = ({
  onSelectEmoji,
  className = ''
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition"
        title="Chèn biểu tượng cảm xúc (Emoji)"
      >
        <Smile className="w-3.5 h-3.5 text-amber-500" />
        <span>Emoji</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-1.5 w-64 p-2 bg-white rounded-xl shadow-xl border border-slate-200 z-30 grid grid-cols-6 gap-1.5 text-lg">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onSelectEmoji(emoji);
                  setIsOpen(false);
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
