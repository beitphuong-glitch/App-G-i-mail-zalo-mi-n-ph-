import React from 'react';
import { Mail, Star, Reply, MoreHorizontal, Paperclip } from 'lucide-react';
import { Recipient } from '../../types';
import { renderTemplate } from '../../utils/templateUtils';

interface EmailClientPreviewProps {
  subject: string;
  content: string;
  isHtml?: boolean;
  recipient?: Partial<Recipient>;
}

export const EmailClientPreview: React.FC<EmailClientPreviewProps> = ({
  subject,
  content,
  isHtml = true,
  recipient = {
    ho_ten: 'Nguyễn Văn An',
    danh_xung: 'Anh',
    so_dien_thoai: '0912345678',
    email: 'an.nguyen@anphattech.vn',
    cong_ty: 'An Phát Tech',
    ma_don: 'DH-8821',
    so_tien: '2.500.000 VNĐ',
    ngay_hen: '15/11/2026',
    ghi_chu: 'Khách VIP'
  }
}) => {
  const renderedSubject = renderTemplate(subject, recipient);
  const renderedContent = renderTemplate(content, recipient);

  const formattedDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Window Controls */}
      <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
        </div>
        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-red-500" />
          <span>Bản xem trước Email (Gmail)</span>
        </div>
        <div className="text-[11px] text-slate-400">Xem trực tiếp</div>
      </div>

      {/* Email Subject Line */}
      <div className="p-4 border-b border-slate-100 bg-white">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 leading-snug">
            {renderedSubject || (
              <span className="italic text-slate-400 font-normal">Chưa có tiêu đề email...</span>
            )}
          </h2>
          <div className="flex items-center gap-1 text-slate-400">
            <button type="button" className="p-1 hover:text-amber-500 rounded">
              <Star className="w-4 h-4" />
            </button>
            <button type="button" className="p-1 hover:text-slate-600 rounded">
              <Reply className="w-4 h-4" />
            </button>
            <button type="button" className="p-1 hover:text-slate-600 rounded">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sender & Recipient Meta */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs">
              CS
            </div>
            <div>
              <div className="font-semibold text-slate-800">
                Đội ngũ Chăm sóc Khách hàng <span className="font-normal text-slate-500">&lt;cskh@doanhnghiep.vn&gt;</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Gửi tới: <strong className="text-slate-700">{recipient.ho_ten || 'Khách hàng'}</strong> &lt;{recipient.email || 'email@khachhang.vn'}&gt;
              </div>
            </div>
          </div>
          <div className="text-slate-400 text-[11px]">{formattedDate}</div>
        </div>
      </div>

      {/* Email Content Body */}
      <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50">
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs min-h-[300px]">
          {isHtml ? (
            <div
              className="prose prose-slate max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderedContent || '<p class="text-slate-400 italic">Nội dung email sẽ hiển thị tại đây...</p>' }}
            />
          ) : (
            <div className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-slate-800">
              {renderedContent || <span className="text-slate-400 italic">Nội dung email sẽ hiển thị tại đây...</span>}
            </div>
          )}
        </div>
      </div>

      {/* Footer attachment simulation */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-slate-400" />
          <span>Chữ ký số & Thông tin liên hệ đã đính kèm</span>
        </div>
        <div className="text-[11px] text-emerald-600 font-medium">✓ Đã kiểm tra định dạng tương thích</div>
      </div>
    </div>
  );
};
