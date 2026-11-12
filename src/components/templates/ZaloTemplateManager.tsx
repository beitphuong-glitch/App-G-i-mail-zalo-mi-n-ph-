import React, { useState, useRef } from 'react';
import {
  MessageSquare, Plus, Sparkles, Trash2, Copy, Save, Check, ExternalLink,
  Search, Smile, Smartphone, UserCheck, CheckCheck
} from 'lucide-react';
import { ZaloTemplate, Recipient, TemplateCategory } from '../../types';
import { VariableBadgeBar } from '../common/VariableBadgeBar';
import { EmojiPickerPopover } from '../common/EmojiPickerPopover';
import { ZaloChatPreview } from '../campaign/ZaloChatPreview';
import { getZaloChatUrl, renderTemplate } from '../../utils/templateUtils';

interface ZaloTemplateManagerProps {
  templates: ZaloTemplate[];
  onSaveTemplates: (templates: ZaloTemplate[]) => void;
  recipients: Recipient[];
  onOpenAiGenerator: (channel: 'zalo') => void;
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  sales: 'Khuyến mãi & Bán hàng',
  customer_care: 'Chăm sóc 1-1',
  order: 'Thông báo đơn hàng',
  reminder: 'Nhắc hẹn & Đối soát',
  holiday: 'Chúc mừng & Tri ân',
  custom: 'Mẫu tùy chỉnh'
};

export const ZaloTemplateManager: React.FC<ZaloTemplateManagerProps> = ({
  templates,
  onSaveTemplates,
  recipients,
  onOpenAiGenerator,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTestRecipientId, setSelectedTestRecipientId] = useState<string>(
    recipients[0]?.id || ''
  );

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const [name, setName] = useState(activeTemplate?.name || '');
  const [category, setCategory] = useState<TemplateCategory>(activeTemplate?.category || 'customer_care');
  const [content, setContent] = useState(activeTemplate?.content || '');
  const [ctaText, setCtaText] = useState(activeTemplate?.ctaText || '');
  const [ctaUrl, setCtaUrl] = useState(activeTemplate?.ctaUrl || '');
  const [tagsInput, setTagsInput] = useState(activeTemplate?.tags.join(', ') || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (activeTemplate) {
      setName(activeTemplate.name);
      setCategory(activeTemplate.category);
      setContent(activeTemplate.content);
      setCtaText(activeTemplate.ctaText || '');
      setCtaUrl(activeTemplate.ctaUrl || '');
      setTagsInput(activeTemplate.tags.join(', '));
    }
  }, [selectedTemplateId]);

  const testRecipient = recipients.find((r) => r.id === selectedTestRecipientId) || recipients[0];

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = () => {
    if (!name.trim()) {
      alert('Vui lòng nhập tên mẫu Zalo');
      return;
    }

    const updatedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedTemplate: ZaloTemplate = {
      id: activeTemplate ? activeTemplate.id : `zalo-${Date.now()}`,
      name,
      category,
      content,
      ctaText: ctaText.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
      tags: updatedTags,
      createdAt: activeTemplate?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    let nextTemplates: ZaloTemplate[];
    if (templates.some((t) => t.id === updatedTemplate.id)) {
      nextTemplates = templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t));
    } else {
      nextTemplates = [updatedTemplate, ...templates];
      setSelectedTemplateId(updatedTemplate.id);
    }

    onSaveTemplates(nextTemplates);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCreateNew = () => {
    const newId = `zalo-${Date.now()}`;
    const newTemplate: ZaloTemplate = {
      id: newId,
      name: 'Mẫu Tin Nhắn Zalo Mới',
      category: 'customer_care',
      content: `Dạ em chào {{danh_xung}} {{ho_ten}} ạ! ✨\n\nEm là tư vấn viên từ bên công ty. Em xin phép gửi thông tin hỗ trợ đến {{danh_xung}}.\n\nNếu {{danh_xung}} cần giải đáp thêm, cứ nhắn lại ngay cho em nhé!`,
      ctaText: 'Xem chi tiết',
      ctaUrl: 'https://zalo.me',
      tags: ['CSKH', 'Mới'],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSaveTemplates([newTemplate, ...templates]);
    setSelectedTemplateId(newId);
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const source = templates.find((t) => t.id === id);
    if (!source) return;

    const copyTemplate: ZaloTemplate = {
      ...source,
      id: `zalo-${Date.now()}`,
      name: `${source.name} (Bản sao)`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSaveTemplates([copyTemplate, ...templates]);
    setSelectedTemplateId(copyTemplate.id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (templates.length <= 1) {
      alert('Cần giữ lại ít nhất 1 mẫu Zalo trong hệ thống.');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa mẫu tin nhắn Zalo này?')) {
      const remaining = templates.filter((t) => t.id !== id);
      onSaveTemplates(remaining);
      if (selectedTemplateId === id) {
        setSelectedTemplateId(remaining[0].id);
      }
    }
  };

  const handleInsertTag = (tag: string) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + ' ' + tag);
      return;
    }
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const nextValue = content.substring(0, start) + tag + content.substring(end);
    setContent(nextValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const handleInsertEmoji = (emoji: string) => {
    handleInsertTag(emoji);
  };

  const handleTestOpenZalo = () => {
    if (!testRecipient) {
      alert('Vui lòng chọn hoặc thêm người nhận để thử nghiệm');
      return;
    }
    const rendered = renderTemplate(content, testRecipient);
    navigator.clipboard.writeText(rendered);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);

    const zaloUrl = getZaloChatUrl(testRecipient.so_dien_thoai);
    window.open(zaloUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0068FF] flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Quản Lý Mẫu Gửi Zalo (Zalo Template Hub)
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-[#0068FF] rounded-full">
                {templates.length} mẫu Zalo
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Soạn mẫu tin nhắn Zalo chuẩn mobile, chèn emoji sinh động, liên kết CTA và xem trước dạng bong bóng chat
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAiGenerator('zalo')}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Tạo Bằng AI Gemini</span>
          </button>

          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0068FF] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mẫu Zalo</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Template List, Middle Editor, Right Mobile Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Template List (3 cols) */}
        <div className="lg:col-span-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[740px]">
          <div className="mb-3 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm mẫu Zalo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#0068FF] outline-none"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none"
            >
              <option value="all">Tất cả danh mục ({templates.length})</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredTemplates.map((template) => {
              const isSelected = template.id === selectedTemplateId;
              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition relative group ${
                    isSelected
                      ? 'border-[#0068FF] bg-blue-50/40 shadow-xs ring-1 ring-[#0068FF]'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-[#0068FF]' : 'text-slate-800'}`}>
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={(e) => handleDuplicate(template.id, e)}
                        title="Nhân bản mẫu"
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(template.id, e)}
                        title="Xóa mẫu"
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-sans">
                    {template.content}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 bg-blue-50 text-[#0068FF] rounded font-medium">
                      {CATEGORY_LABELS[template.category] || template.category}
                    </span>
                    <span>{template.updatedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Editor (5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[740px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Chỉnh sửa mẫu Zalo
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                #{activeTemplate?.id}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Đã Lưu!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Mẫu</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tên gợi nhớ mẫu:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: CSKH Thân thiết..."
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#0068FF] outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Phân loại mẫu:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-[#0068FF] outline-none"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Emoji Toolbar */}
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-700">
                Nội dung tin nhắn Zalo:
              </label>
              <div className="flex items-center gap-1.5">
                <EmojiPickerPopover onSelectEmoji={handleInsertEmoji} />
                <span className="text-[10px] text-slate-400 font-mono">
                  {content.length} ký tự
                </span>
              </div>
            </div>

            {/* Variable Toolbar */}
            <VariableBadgeBar onInsertTag={handleInsertTag} />

            {/* Textarea */}
            <div>
              <textarea
                ref={contentTextareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="Nhập nội dung tin nhắn Zalo..."
                className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#0068FF] outline-none leading-relaxed font-sans"
              />
            </div>

            {/* Optional CTA Button */}
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
              <span className="block text-[11px] font-bold text-blue-900">
                Nút hành động đính kèm (CTA Link tùy chọn)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="VD: Nhận ưu đãi, Xem đơn..."
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-[#0068FF] outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="https://zalo.me/..."
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-[#0068FF] outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Thẻ từ khóa (Tags):
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="CSKH, Bán hàng, ZNS"
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#0068FF] outline-none text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Zalo Mobile Preview (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-[740px] space-y-3">
          {/* Test recipient switcher */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <UserCheck className="w-4 h-4 text-[#0068FF]" />
              <span>Thử với:</span>
            </div>
            <select
              value={selectedTestRecipientId}
              onChange={(e) => setSelectedTestRecipientId(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 outline-none max-w-[160px] truncate"
            >
              {recipients.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.ho_ten} ({r.so_dien_thoai})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleTestOpenZalo}
              title="Sao chép nội dung & Mở chat Zalo cá nhân"
              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#0068FF] rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Thử Zalo</span>
            </button>
          </div>

          {copiedNotification && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-center gap-1.5 animate-in fade-in">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Đã sao chép tin nhắn vào Clipboard! Dán (Ctrl+V) vào Zalo để gửi.</span>
            </div>
          )}

          <div className="flex-1 flex items-center justify-center">
            <ZaloChatPreview
              content={content}
              ctaText={ctaText}
              ctaUrl={ctaUrl}
              recipient={testRecipient}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
