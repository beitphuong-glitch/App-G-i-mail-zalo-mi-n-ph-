import React, { useState } from 'react';
import { Sparkles, X, Wand2, Mail, MessageSquare, AlertCircle, Check, Loader2 } from 'lucide-react';
import { EmailTemplate, ZaloTemplate } from '../../types';

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultChannel?: 'gmail' | 'zalo';
  onApplyEmailTemplate?: (template: Partial<EmailTemplate>) => void;
  onApplyZaloTemplate?: (template: Partial<ZaloTemplate>) => void;
}

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  isOpen,
  onClose,
  defaultChannel = 'gmail',
  onApplyEmailTemplate,
  onApplyZaloTemplate,
}) => {
  const [channel, setChannel] = useState<'gmail' | 'zalo'>(defaultChannel);
  const [purpose, setPurpose] = useState('sales');
  const [tone, setTone] = useState('Chuyên nghiệp, lịch sự');
  const [businessName, setBusinessName] = useState('Công ty CP Công Nghệ & Dịch Vụ Mega');
  const [productOrService, setProductOrService] = useState('Giải pháp phần mềm quản trị và tự động hóa');
  const [keyPoints, setKeyPoints] = useState('Tặng dùng thử miễn phí 14 ngày, giảm 25% cho khách hàng đăng ký sớm');
  const [customInstruction, setCustomInstruction] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          purpose,
          tone,
          businessName,
          productOrService,
          keyPoints,
          customInstruction
        })
      });

      const data = await res.json();
      if (data.success && data.template) {
        setGeneratedResult(data.template);
      } else {
        throw new Error(data.error || 'Không nhận được kết quả từ AI');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi gọi AI Gemini');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedResult) return;

    if (channel === 'gmail' && onApplyEmailTemplate) {
      onApplyEmailTemplate({
        name: generatedResult.name || 'Mẫu Email AI tạo',
        subject: generatedResult.subject || 'Thông báo từ doanh nghiệp',
        content: generatedResult.content || '',
        category: 'sales',
        tags: ['AI Gemini', purpose]
      });
    } else if (channel === 'zalo' && onApplyZaloTemplate) {
      onApplyZaloTemplate({
        name: generatedResult.name || 'Mẫu Zalo AI tạo',
        content: generatedResult.content || '',
        ctaText: generatedResult.ctaText || 'Xem chi tiết',
        category: 'sales',
        tags: ['AI Gemini', purpose]
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Trợ Lý AI Gemini - Tạo Mẫu Tự Động
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-900 rounded-full uppercase tracking-wider">
                  AI Studio
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                Tạo mẫu Email và Zalo chuẩn văn phong kinh doanh, tự động chèn biến cá nhân hóa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Chọn kênh cần tạo mẫu:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setChannel('gmail');
                  setGeneratedResult(null);
                }}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition ${
                  channel === 'gmail'
                    ? 'border-red-500 bg-red-50/50 text-red-700 shadow-xs ring-1 ring-red-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span>Mẫu Gửi Gmail Hàng Loạt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setChannel('zalo');
                  setGeneratedResult(null);
                }}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition ${
                  channel === 'zalo'
                    ? 'border-[#0068FF] bg-blue-50/50 text-[#0068FF] shadow-xs ring-1 ring-[#0068FF]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#0068FF] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span>Mẫu Gửi Zalo Hàng Loạt</span>
              </button>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mục đích chiến dịch:
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Chào hàng & Giới thiệu dịch vụ">Chào hàng & Giới thiệu dịch vụ</option>
                <option value="Chăm sóc khách hàng định kỳ">Chăm sóc khách hàng định kỳ</option>
                <option value="Xác nhận đơn hàng & Hóa đơn">Xác nhận đơn hàng & Hóa đơn</option>
                <option value="Nhắc hẹn lịch hẹn / Lịch gặp">Nhắc hẹn lịch hẹn / Lịch gặp</option>
                <option value="Flash Sale & Khuyến mãi sốc">Flash Sale & Khuyến mãi sốc</option>
                <option value="Nhắc nợ / Nhắc thanh toán lịch sự">Nhắc nợ / Nhắc thanh toán lịch sự</option>
                <option value="Chúc mừng sinh nhật & Tri ân">Chúc mừng sinh nhật & Tri ân</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giọng văn & Phong cách:
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Chuyên nghiệp, lịch sự">Chuyên nghiệp, chuẩn mực (B2B)</option>
                <option value="Thân thiện, ấm áp, gần gũi">Thân thiện, ấm áp (B2C, CSKH)</option>
                <option value="Thuyết phục, thôi thúc hành động">Thuyết phục, cuốn hút (Bán hàng)</option>
                <option value="Ngắn gọn, súc tích, đi thẳng vào vấn đề">Ngắn gọn, súc tích (Thông báo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên doanh nghiệp / Người gửi:
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="VD: Công ty An Phát..."
                className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sản phẩm / Dịch vụ trọng tâm:
              </label>
              <input
                type="text"
                value={productOrService}
                onChange={(e) => setProductOrService(e.target.value)}
                placeholder="VD: Dịch vụ marketing, thời trang, nội thất..."
                className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Điểm nổi bật / Ưu đãi / Chi tiết cần nhấn mạnh:
            </label>
            <input
              type="text"
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="VD: Giảm 20% khi chốt trong tuần này, miễn phí giao hàng..."
              className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Yêu cầu riêng biệt thêm (Tùy chọn):
            </label>
            <input
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="VD: Hãy dùng thêm nhiều icon Zalo sinh động, tránh các từ ngữ dễ bị spam..."
              className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Trigger Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gemini AI đang sáng tạo mẫu nội dung...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 text-amber-300" />
                  <span>Tạo Mẫu Bằng AI Gemini Ngay</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* AI Generated Result Preview */}
          {generatedResult && (
            <div className="mt-4 p-4 bg-slate-50 border-2 border-indigo-200 rounded-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Đã tạo mẫu thành công!
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {generatedResult.name}
                </span>
              </div>

              {channel === 'gmail' && generatedResult.subject && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-600 mb-0.5">Tiêu đề email:</div>
                  <div className="text-xs font-bold text-slate-900 bg-white p-2.5 rounded-lg border border-slate-200">
                    {generatedResult.subject}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[11px] font-semibold text-slate-600 mb-0.5">Nội dung mẫu:</div>
                <div className="text-xs bg-white p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto whitespace-pre-wrap text-slate-800 leading-relaxed font-sans">
                  {generatedResult.content}
                </div>
              </div>

              {generatedResult.tips && (
                <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  💡 <strong>Gợi ý từ AI:</strong> {generatedResult.tips}
                </div>
              )}

              <button
                type="button"
                onClick={handleApply}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Áp dụng mẫu này vào trình soạn thảo</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
