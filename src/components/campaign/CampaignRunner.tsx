import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Mail, MessageSquare, Play, Pause, RotateCcw, CheckCircle2,
  AlertCircle, Clock, ExternalLink, Copy, Check, ChevronRight, ChevronLeft,
  Download, Sparkles, ShieldCheck, ArrowRight, Volume2, VolumeX
} from 'lucide-react';
import { Recipient, EmailTemplate, ZaloTemplate, CampaignLog } from '../../types';
import {
  renderTemplate, getGmailComposeUrl, getZaloChatUrl, playChimeSound,
  exportToCsv, normalizeZaloPhone
} from '../../utils/templateUtils';
import { ZaloChatPreview } from './ZaloChatPreview';
import { EmailClientPreview } from './EmailClientPreview';

interface CampaignRunnerProps {
  recipients: Recipient[];
  emailTemplates: EmailTemplate[];
  zaloTemplates: ZaloTemplate[];
  onUpdateRecipients: (recipients: Recipient[]) => void;
  logs: CampaignLog[];
  onAddLog: (log: CampaignLog) => void;
  onClearLogs: () => void;
  onNavigateToTemplates: (channel: 'gmail' | 'zalo') => void;
}

export const CampaignRunner: React.FC<CampaignRunnerProps> = ({
  recipients,
  emailTemplates,
  zaloTemplates,
  onUpdateRecipients,
  logs,
  onAddLog,
  onClearLogs,
  onNavigateToTemplates,
}) => {
  const [channel, setChannel] = useState<'gmail' | 'zalo'>('zalo');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [audienceFilter, setAudienceFilter] = useState<'pending' | 'all'>('pending');
  const [delaySeconds, setDelaySeconds] = useState<number>(3);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Queue runner states
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [copiedBccAll, setCopiedBccAll] = useState(false);

  // Zalo OA API Config (Optional)
  const [showZaloOaConfig, setShowZaloOaConfig] = useState(false);
  const [zaloOaToken, setZaloOaToken] = useState('');

  // Default select template when channel changes
  useEffect(() => {
    if (channel === 'gmail' && emailTemplates.length > 0) {
      if (!emailTemplates.some((t) => t.id === selectedTemplateId)) {
        setSelectedTemplateId(emailTemplates[0].id);
      }
    } else if (channel === 'zalo' && zaloTemplates.length > 0) {
      if (!zaloTemplates.some((t) => t.id === selectedTemplateId)) {
        setSelectedTemplateId(zaloTemplates[0].id);
      }
    }
  }, [channel, emailTemplates, zaloTemplates]);

  // Current active template
  const activeEmailTemplate = emailTemplates.find((t) => t.id === selectedTemplateId) || emailTemplates[0];
  const activeZaloTemplate = zaloTemplates.find((t) => t.id === selectedTemplateId) || zaloTemplates[0];

  // Target recipients based on channel requirement (Phone for Zalo, Email for Gmail)
  const eligibleRecipients = recipients.filter((r) => {
    if (channel === 'zalo') {
      const hasPhone = !!r.so_dien_thoai?.trim();
      return audienceFilter === 'pending' ? hasPhone && r.status === 'pending' : hasPhone;
    } else {
      const hasEmail = !!r.email?.trim() && r.email.includes('@');
      return audienceFilter === 'pending' ? hasEmail && r.status === 'pending' : hasEmail;
    }
  });

  const totalEligible = eligibleRecipients.length;
  const currentRecipient = eligibleRecipients[currentIndex] || eligibleRecipients[0];

  // Stats
  const totalSent = recipients.filter((r) => r.status === 'sent').length;
  const totalPending = recipients.filter((r) => r.status === 'pending').length;
  const totalFailed = recipients.filter((r) => r.status === 'failed').length;
  const progressPercent = recipients.length > 0 ? Math.round((totalSent / recipients.length) * 100) : 0;

  // Single send action (Manual or Triggered)
  const executeSingleSend = (recipient: Recipient) => {
    if (!recipient) return;

    if (channel === 'zalo') {
      const message = renderTemplate(activeZaloTemplate?.content || '', recipient);
      navigator.clipboard.writeText(message);
      setCopiedNotification(recipient.id);
      setTimeout(() => setCopiedNotification(null), 2500);

      const url = getZaloChatUrl(recipient.so_dien_thoai);
      window.open(url, '_blank');

      // Update recipient status
      const updated = recipients.map((r) =>
        r.id === recipient.id
          ? { ...r, status: 'sent' as const, sentAt: new Date().toLocaleTimeString('vi-VN') }
          : r
      );
      onUpdateRecipients(updated);

      if (soundEnabled) playChimeSound('success');

      // Log
      onAddLog({
        id: `log-${Date.now()}`,
        recipientId: recipient.id,
        recipientName: recipient.ho_ten,
        recipientTarget: recipient.so_dien_thoai,
        channel: 'zalo',
        templateName: activeZaloTemplate?.name || 'Mẫu Zalo',
        status: 'sent',
        timestamp: new Date().toLocaleTimeString('vi-VN')
      });
    } else {
      const sub = renderTemplate(activeEmailTemplate?.subject || '', recipient);
      const body = renderTemplate(activeEmailTemplate?.content || '', recipient);

      const url = getGmailComposeUrl(recipient.email, sub, body);
      window.open(url, '_blank');

      const updated = recipients.map((r) =>
        r.id === recipient.id
          ? { ...r, status: 'sent' as const, sentAt: new Date().toLocaleTimeString('vi-VN') }
          : r
      );
      onUpdateRecipients(updated);

      if (soundEnabled) playChimeSound('success');

      onAddLog({
        id: `log-${Date.now()}`,
        recipientId: recipient.id,
        recipientName: recipient.ho_ten,
        recipientTarget: recipient.email,
        channel: 'gmail',
        templateName: activeEmailTemplate?.name || 'Mẫu Gmail',
        status: 'sent',
        timestamp: new Date().toLocaleTimeString('vi-VN')
      });
    }
  };

  // Next recipient
  const handleNext = () => {
    if (currentIndex < eligibleRecipients.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // Previous recipient
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Send & Next in 1 click
  const handleSendAndNext = () => {
    if (!currentRecipient) return;
    executeSingleSend(currentRecipient);
    if (currentIndex < eligibleRecipients.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Auto Queue Runner
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (eligibleRecipients.length === 0) {
      setIsRunning(false);
      if (soundEnabled) playChimeSound('complete');
      alert('Đã hoàn thành gửi cho tất cả người nhận trong danh sách!');
      return;
    }

    timerRef.current = setInterval(() => {
      const target = eligibleRecipients[0]; // Always pick next eligible
      if (target) {
        executeSingleSend(target);
      } else {
        setIsRunning(false);
        if (soundEnabled) playChimeSound('complete');
      }
    }, delaySeconds * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, eligibleRecipients, delaySeconds, soundEnabled]);

  // Copy all BCC emails
  const handleCopyAllBcc = () => {
    const emails = eligibleRecipients
      .map((r) => r.email?.trim())
      .filter((e) => e && e.includes('@'));
    if (emails.length === 0) {
      alert('Không có địa chỉ email hợp lệ');
      return;
    }
    const joined = emails.join(', ');
    navigator.clipboard.writeText(joined);
    setCopiedBccAll(true);
    setTimeout(() => setCopiedBccAll(false), 2500);
  };

  // Export Log CSV
  const handleExportLogs = () => {
    const headers = ['ID', 'Thời gian', 'Kênh', 'Người nhận', 'Số ĐT / Email', 'Mẫu gửi', 'Trạng thái'];
    const rows = logs.map((l) => [
      l.id,
      l.timestamp,
      l.channel.toUpperCase(),
      l.recipientName,
      l.recipientTarget,
      l.templateName,
      l.status === 'sent' ? 'Thành công' : 'Thất bại'
    ]);
    exportToCsv('lich_su_gui_chien_dich', headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Top Campaign Control Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Trung Tâm Gửi Gmail & Zalo Hàng Loạt (Bulk Dispatcher)
            </h1>
            <p className="text-xs text-slate-500">
              Cá nhân hóa tự động theo danh bạ, hỗ trợ chế độ gửi thông minh chống spam và kiểm soát tiến độ thời gian thực
            </p>
          </div>
        </div>

        {/* Channel Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setChannel('zalo');
              setIsRunning(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              channel === 'zalo'
                ? 'bg-[#0068FF] text-white ring-2 ring-blue-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Kênh Gửi Zalo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setChannel('gmail');
              setIsRunning(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              channel === 'gmail'
                ? 'bg-red-600 text-white ring-2 ring-red-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Kênh Gửi Gmail</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Đang bật âm thanh' : 'Đang tắt âm thanh'}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Progress & Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Tiến độ chiến dịch</span>
            <span className="font-bold text-slate-800">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                channel === 'zalo' ? 'bg-[#0068FF]' : 'bg-red-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {totalSent} / {recipients.length} liên hệ đã xử lý
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Đã gửi thành công</div>
            <div className="text-xl font-extrabold text-emerald-600">{totalSent}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ✓
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Đang chờ gửi</div>
            <div className="text-xl font-extrabold text-amber-600">{totalPending}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Sẵn sàng gửi đợt này</div>
            <div className="text-xl font-extrabold text-slate-900">{totalEligible}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            {channel === 'zalo' ? 'Z' : 'M'}
          </div>
        </div>
      </div>

      {/* Main Campaign Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Campaign Configuration & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Step 1: Select Template & Audience */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                Cấu hình mẫu & Đối tượng
              </span>
              <button
                type="button"
                onClick={() => onNavigateToTemplates(channel)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                + Soạn / Sửa mẫu {channel === 'zalo' ? 'Zalo' : 'Gmail'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Chọn mẫu tin nhắn {channel === 'zalo' ? 'Zalo' : 'Email'}:
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800"
                >
                  {channel === 'zalo'
                    ? zaloTemplates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))
                    : emailTemplates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nhóm khách hàng gửi:
                </label>
                <select
                  value={audienceFilter}
                  onChange={(e) => setAudienceFilter(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800"
                >
                  <option value="pending">Chỉ gửi người Chưa gửi ({totalPending} người)</option>
                  <option value="all">Tất cả người có {channel === 'zalo' ? 'SĐT' : 'Email'} ({recipients.length} người)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Dispatcher Mode & Actions */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                Thực thi gửi {channel === 'zalo' ? 'Zalo' : 'Gmail'}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cơ chế gửi an toàn, không lo spam</span>
              </div>
            </div>

            {/* Current Target Contact Card */}
            {currentRecipient ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0068FF] font-bold flex items-center justify-center text-xs">
                      {currentIndex + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{currentRecipient.danh_xung} {currentRecipient.ho_ten}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-white border border-slate-200 rounded text-slate-600 font-normal">
                          {currentRecipient.cong_ty || 'Khách hàng'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {channel === 'zalo' ? currentRecipient.so_dien_thoai : currentRecipient.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold px-2 text-slate-600">
                      {currentIndex + 1} / {totalEligible}
                    </span>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={currentIndex >= totalEligible - 1}
                      className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {copiedNotification === currentRecipient.id && (
                  <div className="p-2 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Đã sao chép tin nhắn vào Clipboard! Dán vào cửa sổ Zalo để gửi.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                🎉 Không có người nhận nào đang chờ gửi trong danh mục này!
              </div>
            )}

            {/* Action Buttons based on channel */}
            {channel === 'zalo' ? (
              <div className="space-y-3">
                {/* Primary Guided Button: 1-Click Send & Next */}
                <button
                  type="button"
                  disabled={!currentRecipient}
                  onClick={handleSendAndNext}
                  className="w-full py-3.5 px-4 bg-[#0068FF] hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>
                    Mở Chat Zalo Với {currentRecipient?.ho_ten || 'Khách Hàng'} & Chuyển Người Tiếp Theo
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-[11px] text-center text-slate-500">
                  ⚡ <em>Tự động sao chép tin nhắn cá nhân hóa vào clipboard & mở Zalo Web/App. Bạn chỉ cần nhấn <strong>Ctrl + V</strong> và gửi!</em>
                </div>

                {/* Auto Queue Sender with Delay */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium">Khoảng cách gửi:</span>
                    <select
                      value={delaySeconds}
                      onChange={(e) => setDelaySeconds(Number(e.target.value))}
                      className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
                    >
                      <option value={2}>2 giây / người</option>
                      <option value={3}>3 giây / người (Khuyên dùng)</option>
                      <option value={5}>5 giây / người</option>
                      <option value={8}>8 giây / người</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRunning(!isRunning)}
                    disabled={totalEligible === 0}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                      isRunning
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Tạm Dừng Hàng Đợi</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Chạy Hàng Đợi Tự Động</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Gmail Primary Guided Button */}
                <button
                  type="button"
                  disabled={!currentRecipient}
                  onClick={handleSendAndNext}
                  className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Mail className="w-5 h-5" />
                  <span>
                    Mở Soạn Thư Gmail Với {currentRecipient?.ho_ten || 'Khách Hàng'} & Chuyển Người Tiếp
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-[11px] text-center text-slate-500">
                  ✉️ <em>Mở sẵn tab soạn thư Gmail mới với đầy đủ Người nhận, Tiêu đề và Nội dung đã thay tên!</em>
                </div>

                {/* Batch BCC Option */}
                <div className="p-3 bg-red-50/60 border border-red-100 rounded-xl flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-red-900">
                      Gửi 1 lần qua danh sách ẩn danh (BCC)
                    </div>
                    <div className="text-[11px] text-red-700">
                      Sao chép tất cả {totalEligible} địa chỉ email để dán vào ô BCC gửi cùng lúc
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAllBcc}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    {copiedBccAll ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã Sao Chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao Chép BCC</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Auto Queue Option for Gmail */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium">Giãn cách:</span>
                    <select
                      value={delaySeconds}
                      onChange={(e) => setDelaySeconds(Number(e.target.value))}
                      className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
                    >
                      <option value={3}>3 giây / email</option>
                      <option value={5}>5 giây / email</option>
                      <option value={8}>8 giây / email</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRunning(!isRunning)}
                    disabled={totalEligible === 0}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                      isRunning
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Tạm Dừng Gửi</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Chạy Tự Động Hàng Đợi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Activity Log Table */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Nhật ký chiến dịch vừa gửi ({logs.length})
              </span>
              <div className="flex items-center gap-2">
                {logs.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleExportLogs}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất Log</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClearLogs}
                      className="text-xs font-semibold text-red-600 hover:text-red-800"
                    >
                      Xóa lịch sử
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
              {logs.map((log) => (
                <div key={log.id} className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.channel === 'zalo'
                          ? 'bg-blue-100 text-[#0068FF]'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {log.channel.toUpperCase()}
                    </span>
                    <span className="font-semibold text-slate-900">{log.recipientName}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ({log.recipientTarget})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã gửi
                    </span>
                    <span className="font-mono text-slate-400">{log.timestamp}</span>
                  </div>
                </div>
              ))}

              {logs.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Chưa có lượt gửi nào trong phiên làm việc này
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Live Visual Mockup for Current Recipient (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full space-y-2">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Bản xem trước trực tiếp cho:</span>
              <strong className="text-blue-600 font-bold">
                {currentRecipient?.ho_ten || 'Khách hàng'}
              </strong>
            </span>
            <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded-full font-mono text-slate-600">
              {channel === 'zalo' ? 'Zalo Mobile' : 'Gmail Desktop'}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[580px]">
            {channel === 'zalo' ? (
              <ZaloChatPreview
                content={activeZaloTemplate?.content || ''}
                ctaText={activeZaloTemplate?.ctaText}
                ctaUrl={activeZaloTemplate?.ctaUrl}
                recipient={currentRecipient}
              />
            ) : (
              <EmailClientPreview
                subject={activeEmailTemplate?.subject || ''}
                content={activeEmailTemplate?.content || ''}
                isHtml={activeEmailTemplate?.isHtml}
                recipient={currentRecipient}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
