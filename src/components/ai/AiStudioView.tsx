import React, { useState } from 'react';
import { Sparkles, Wand2, Mail, MessageSquare, Check, Loader2, ArrowRight, BookOpen, Lightbulb } from 'lucide-react';
import { EmailTemplate, ZaloTemplate } from '../../types';

interface AiStudioViewProps {
  onSaveEmailTemplate: (template: EmailTemplate) => void;
  onSaveZaloTemplate: (template: ZaloTemplate) => void;
  onNavigateToTemplates: (channel: 'gmail' | 'zalo') => void;
}

export const AiStudioView: React.FC<AiStudioViewProps> = ({
  onSaveEmailTemplate,
  onSaveZaloTemplate,
  onNavigateToTemplates,
}) => {
  const [channel, setChannel] = useState<'gmail' | 'zalo'>('zalo');
  const [purpose, setPurpose] = useState('Chăm sóc khách hàng định kỳ');
  const [tone, setTone] = useState('Thân thiện, ấm áp');
  const [businessName, setBusinessName] = useState('Dịch vụ Khách hàng & Công nghệ');
  const [productOrService, setProductOrService] = useState('Chương trình chăm sóc và ưu đãi đặc quyền');
  const [keyPoints, setKeyPoints] = useState('Tặng voucher 30%, tư vấn trực tiếp 1-1, bảo hành tận nơi');
  const [customInstruction, setCustomInstruction] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setSavedSuccess(false);

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
        throw new Error(data.error || 'Không nhận được dữ liệu từ AI');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi gọi AI Gemini');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!generatedResult) return;

    if (channel === 'gmail') {
      const newTemplate: EmailTemplate = {
        id: `email-ai-${Date.now()}`,
        name: generatedResult.name || 'Mẫu Email AI Gemini',
        category: 'sales',
        subject: generatedResult.subject || 'Thông báo từ doanh nghiệp',
        content: generatedResult.content || '',
        isHtml: true,
        tags: ['AI Gemini', purpose],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      onSaveEmailTemplate(newTemplate);
    } else {
      const newTemplate: ZaloTemplate = {
        id: `zalo-ai-${Date.now()}`,
        name: generatedResult.name || 'Mẫu Zalo AI Gemini',
        category: 'customer_care',
        content: generatedResult.content || '',
        ctaText: generatedResult.ctaText || 'Xem chi tiết',
        ctaUrl: 'https://zalo.me',
        tags: ['AI Gemini', purpose],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      onSaveZaloTemplate(newTemplate);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      onNavigateToTemplates(channel);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Content Studio Powered by Google Gemini</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Sáng Tạo Mẫu Tin Nhắn Gmail & Zalo Đỉnh Cao
          </h1>
          <p className="text-sm text-purple-100 mt-1 leading-relaxed">
            AI Gemini sẽ tự động lồng ghép các biến cá nhân hóa <code className="bg-black/20 px-1 rounded">&#123;&#123;ho_ten&#125;&#125;</code>, <code className="bg-black/20 px-1 rounded">&#123;&#123;cong_ty&#125;&#125;</code>, <code className="bg-black/20 px-1 rounded">&#123;&#123;so_tien&#125;&#125;</code>, giúp tin nhắn tự nhiên, tránh bị lọc vào hòm thư rác hoặc làm phiền khách hàng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Form: Parameters (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-600" />
            <span>Thông Số Yêu Cầu Cho AI</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              1. Kênh gửi mục tiêu:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChannel('zalo')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                  channel === 'zalo'
                    ? 'border-[#0068FF] bg-blue-50 text-[#0068FF] ring-2 ring-blue-300'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Kênh Zalo</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('gmail')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                  channel === 'gmail'
                    ? 'border-red-600 bg-red-50 text-red-600 ring-2 ring-red-300'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Kênh Gmail</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              2. Mục đích chiến dịch:
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="Chào hàng & Giới thiệu dịch vụ">Chào hàng & Giới thiệu dịch vụ B2B/B2C</option>
              <option value="Chăm sóc khách hàng định kỳ">Chăm sóc khách hàng & Thăm hỏi định kỳ</option>
              <option value="Xác nhận đơn hàng & Báo giá">Xác nhận đơn hàng & Báo giá sản phẩm</option>
              <option value="Nhắc lịch hẹn làm việc">Nhắc lịch hẹn làm việc / Lịch tư vấn</option>
              <option value="Flash Sale & Ưu đãi nóng">Flash Sale & Giảm giá có hạn</option>
              <option value="Nhắc nợ / Nhắc thanh toán lịch sự">Nhắc nợ / Đối soát thanh toán lịch sự</option>
              <option value="Tri ân & Chúc mừng sinh nhật">Tri ân & Chúc mừng sinh nhật / Lễ Tết</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              3. Giọng điệu & Phong cách:
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="Chuyên nghiệp, lịch sự, tôn trọng">Chuyên nghiệp & Chuẩn mực</option>
              <option value="Thân thiện, ấm áp, gần gũi">Thân thiện, ấm áp & Tận tâm</option>
              <option value="Thuyết phục, thôi thúc hành động chốt đơn">Thuyết phục, chốt đơn mạnh mẽ</option>
              <option value="Ngắn gọn, súc tích, đi thẳng vào trọng tâm">Ngắn gọn, súc tích</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              4. Tên doanh nghiệp:
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="VD: Công ty TNHH Phát Triển..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              5. Sản phẩm / Dịch vụ trọng tâm:
            </label>
            <input
              type="text"
              value={productOrService}
              onChange={(e) => setProductOrService(e.target.value)}
              placeholder="VD: Dịch vụ vận tải, mỹ phẩm, khóa học..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              6. Điểm nổi bật / Ưu đãi cần nhấn mạnh:
            </label>
            <input
              type="text"
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="VD: Giảm 30% khi chốt trong ngày..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              7. Lưu ý bổ sung:
            </label>
            <input
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="VD: Thêm icon hoa, nhấn mạnh vào quà tặng..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemini AI đang tạo mẫu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Tạo Mẫu Tin Nhắn Bằng AI</span>
              </>
            )}
          </button>
        </div>

        {/* Right Preview & Library Actions (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Kết Quả Sáng Tạo Từ AI</span>
              </h2>

              {generatedResult && (
                <button
                  type="button"
                  onClick={handleSaveToLibrary}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã Lưu Mẫu & Đang Chuyển...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Lưu Vào Kho Mẫu {channel === 'zalo' ? 'Zalo' : 'Mail'}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {generatedResult ? (
              <div className="space-y-4">
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                  <div className="text-[11px] font-semibold text-purple-700">Tên mẫu:</div>
                  <div className="text-sm font-bold text-purple-950">
                    {generatedResult.name}
                  </div>
                </div>

                {channel === 'gmail' && generatedResult.subject && (
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-1">Tiêu đề Email:</div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900">
                      {generatedResult.subject}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1">Nội dung mẫu:</div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed min-h-[220px] max-h-[380px] overflow-y-auto">
                    {generatedResult.content}
                  </div>
                </div>

                {generatedResult.tips && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Mẹo gửi hiệu quả:</strong> {generatedResult.tips}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="text-sm font-bold text-slate-800">
                  Chưa có mẫu nào được tạo
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Điền các thông số bên trái và bấm "Tạo Mẫu Tin Nhắn Bằng AI" để nhận ngay mẫu nội dung chuyên nghiệp.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
