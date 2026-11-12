import React from 'react';
import { Phone, Video, MoreVertical, CheckCheck, Send, Image, Smile, Mic, ArrowLeft } from 'lucide-react';
import { Recipient } from '../../types';
import { renderTemplate } from '../../utils/templateUtils';

interface ZaloChatPreviewProps {
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  recipient?: Partial<Recipient>;
  showFrame?: boolean;
}

export const ZaloChatPreview: React.FC<ZaloChatPreviewProps> = ({
  content,
  ctaText,
  ctaUrl,
  recipient = {
    ho_ten: 'Nguyễn Văn An',
    danh_xung: 'Anh',
    so_dien_thoai: '0912345678',
    cong_ty: 'An Phát Tech',
    ma_don: 'DH-8821',
    so_tien: '2.500.000 VNĐ',
    ngay_hen: '15/11/2026',
    ghi_chu: 'Khách VIP'
  },
  showFrame = true,
}) => {
  const renderedContent = renderTemplate(content, recipient);

  // Time stamp
  const currentTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={`bg-slate-100 rounded-3xl overflow-hidden shadow-xl border border-slate-300 flex flex-col ${
        showFrame ? 'max-w-[360px] mx-auto w-full h-[580px]' : 'w-full h-full'
      }`}
    >
      {/* Phone Notch/Status bar */}
      <div className="bg-[#0068FF] text-white px-5 pt-2 pb-1 text-[11px] flex justify-between items-center select-none font-medium">
        <span>09:41</span>
        <div className="w-20 h-4 bg-black/20 rounded-full mx-auto"></div>
        <div className="flex items-center gap-1.5">
          <span>5G</span>
          <span>100%</span>
        </div>
      </div>

      {/* Zalo Top Header */}
      <div className="bg-[#0068FF] text-white px-3 py-2 flex items-center justify-between shadow-xs select-none">
        <div className="flex items-center gap-2">
          <button type="button" className="p-1 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-blue-300 text-blue-900 font-bold flex items-center justify-center text-sm shadow-inner">
              {recipient.ho_ten ? recipient.ho_ten.charAt(0) : 'U'}
            </div>
            <div className="w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0068FF] rounded-full absolute bottom-0 right-0"></div>
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-sm truncate max-w-[140px]">
              {recipient.ho_ten || 'Khách Hàng'}
            </div>
            <div className="text-[11px] text-blue-100">Vừa mới truy cập</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button type="button" className="p-1.5 hover:bg-white/10 rounded-full">
            <Phone className="w-4 h-4" />
          </button>
          <button type="button" className="p-1.5 hover:bg-white/10 rounded-full">
            <Video className="w-4 h-4" />
          </button>
          <button type="button" className="p-1.5 hover:bg-white/10 rounded-full">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div
        className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#e8ecf2]"
        style={{
          backgroundImage: 'radial-gradient(#d1d7e2 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      >
        <div className="text-center">
          <span className="inline-block bg-black/15 text-slate-700 text-[10px] font-medium px-2.5 py-0.5 rounded-full">
            Hôm nay
          </span>
        </div>

        {/* Sent Zalo Bubble (Right side) */}
        <div className="flex flex-col items-end">
          <div className="max-w-[85%] bg-white rounded-2xl rounded-tr-xs p-3 shadow-xs border border-slate-200/80 text-slate-800 text-[13px] leading-relaxed whitespace-pre-wrap select-text">
            {renderedContent || (
              <span className="italic text-slate-400">Nội dung tin nhắn Zalo sẽ hiển thị tại đây...</span>
            )}

            {/* Optional CTA Link/Button inside message */}
            {ctaText && (
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <a
                  href={ctaUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#0068FF] font-semibold rounded-lg text-xs transition border border-blue-200"
                >
                  {ctaText} ➔
                </a>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-medium pr-1">
            <span>{currentTime}</span>
            <CheckCheck className="w-3.5 h-3.5 text-[#0068FF]" />
            <span className="text-[#0068FF]">Đã nhận</span>
          </div>
        </div>
      </div>

      {/* Zalo Input Simulation */}
      <div className="bg-white p-2 border-t border-slate-200 flex items-center gap-1.5 select-none">
        <button type="button" className="p-1.5 text-slate-500 hover:text-[#0068FF] rounded-full">
          <Smile className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-slate-100 rounded-full px-3.5 py-1.5 text-xs text-slate-400">
          Nhập tin nhắn tới {recipient.ho_ten || 'người nhận'}...
        </div>
        <button type="button" className="p-1.5 text-slate-500 hover:text-[#0068FF] rounded-full">
          <Image className="w-4 h-4" />
        </button>
        <button type="button" className="p-1.5 text-slate-500 hover:text-[#0068FF] rounded-full">
          <Mic className="w-4 h-4" />
        </button>
        <div className="w-7 h-7 bg-[#0068FF] rounded-full flex items-center justify-center text-white shadow-xs">
          <Send className="w-3.5 h-3.5 -rotate-45" />
        </div>
      </div>
    </div>
  );
};
