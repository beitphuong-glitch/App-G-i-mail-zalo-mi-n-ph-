import React from 'react';
import { TEMPLATE_VARIABLES } from '../../utils/templateUtils';
import { Tag, Copy, Check } from 'lucide-react';

interface VariableBadgeBarProps {
  onInsertTag?: (tag: string) => void;
  className?: string;
}

export const VariableBadgeBar: React.FC<VariableBadgeBarProps> = ({ onInsertTag, className = '' }) => {
  const [copiedTag, setCopiedTag] = React.useState<string | null>(null);

  const handleClick = (tag: string) => {
    if (onInsertTag) {
      onInsertTag(tag);
    } else {
      navigator.clipboard.writeText(tag);
      setCopiedTag(tag);
      setTimeout(() => setCopiedTag(null), 1800);
    }
  };

  return (
    <div className={`p-3 bg-slate-50 border border-slate-200 rounded-xl ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Tag className="w-3.5 h-3.5 text-blue-600" />
          <span>Biến cá nhân hóa (Bấm để chèn vào vị trí con trỏ):</span>
        </div>
        <span className="text-[11px] text-slate-500">Tự động thay bằng thông tin từng người</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TEMPLATE_VARIABLES.map((v) => (
          <button
            key={v.tag}
            type="button"
            onClick={() => handleClick(v.tag)}
            title={`Ví dụ: ${v.example}`}
            className="group flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 hover:text-blue-700 transition shadow-xs"
          >
            <span className="text-blue-600 font-semibold">{v.tag}</span>
            <span className="text-[11px] text-slate-400 font-sans group-hover:text-blue-500">
              ({v.label})
            </span>
            {copiedTag === v.tag ? (
              <Check className="w-3 h-3 text-emerald-600 ml-0.5" />
            ) : (
              <Copy className="w-2.5 h-2.5 text-slate-300 group-hover:text-blue-400 ml-0.5 opacity-0 group-hover:opacity-100 transition" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
