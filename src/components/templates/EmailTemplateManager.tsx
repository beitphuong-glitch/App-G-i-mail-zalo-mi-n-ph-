import React, { useState, useRef } from 'react';
import {
  Mail, Plus, Sparkles, Trash2, Copy, Save, Check, ExternalLink,
  Search, Eye, Code, FileText, Send, UserCheck, RefreshCw
} from 'lucide-react';
import { EmailTemplate, Recipient, TemplateCategory } from '../../types';
import { VariableBadgeBar } from '../common/VariableBadgeBar';
import { EmailClientPreview } from '../campaign/EmailClientPreview';
import { getGmailComposeUrl, renderTemplate } from '../../utils/templateUtils';

interface EmailTemplateManagerProps {
  templates: EmailTemplate[];
  onSaveTemplates: (templates: EmailTemplate[]) => void;
  recipients: Recipient[];
  onOpenAiGenerator: (channel: 'gmail') => void;
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  sales: 'Kinh doanh & Bán hàng',
  customer_care: 'Chăm sóc khách hàng',
  order: 'Đơn hàng & Hóa đơn',
  reminder: 'Nhắc hẹn & Công việc',
  holiday: 'Lễ Tết & Tri ân',
  custom: 'Mẫu tùy chỉnh'
};

export const EmailTemplateManager: React.FC<EmailTemplateManagerProps> = ({
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

  // Active editor state
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const [name, setName] = useState(activeTemplate?.name || '');
  const [category, setCategory] = useState<TemplateCategory>(activeTemplate?.category || 'sales');
  const [subject, setSubject] = useState(activeTemplate?.subject || '');
  const [content, setContent] = useState(activeTemplate?.content || '');
  const [isHtml, setIsHtml] = useState<boolean>(activeTemplate?.isHtml ?? true);
  const [tagsInput, setTagsInput] = useState(activeTemplate?.tags.join(', ') || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Refs for insertion focus
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [lastFocusedField, setLastFocusedField] = useState<'subject' | 'content'>('content');

  // Sync state when active template changes
  React.useEffect(() => {
    if (activeTemplate) {
      setName(activeTemplate.name);
      setCategory(activeTemplate.category);
      setSubject(activeTemplate.subject);
      setContent(activeTemplate.content);
      setIsHtml(activeTemplate.isHtml ?? true);
      setTagsInput(activeTemplate.tags.join(', '));
    }
  }, [selectedTemplateId]);

  const testRecipient = recipients.find((r) => r.id === selectedTestRecipientId) || recipients[0];

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = () => {
    if (!name.trim()) {
      alert('Vui lòng nhập tên mẫu email');
      return;
    }

    const updatedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedTemplate: EmailTemplate = {
      id: activeTemplate ? activeTemplate.id : `email-${Date.now()}`,
      name,
      category,
      subject,
      content,
      isHtml,
      tags: updatedTags,
      createdAt: activeTemplate?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    let nextTemplates: EmailTemplate[];
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
    const newId = `email-${Date.now()}`;
    const newTemplate: EmailTemplate = {
      id: newId,
      name: 'Mẫu Email Mới',
      category: 'sales',
      subject: 'Kính gửi {{danh_xung}} {{ho_ten}} - Thông tin từ {{cong_ty}}',
      content: `<p>Kính gửi {{danh_xung}} <strong>{{ho_ten}}</strong>,</p>\n<p>Em xin gửi thông tin cập nhật mới nhất đến {{danh_xung}}.</p>\n<p>Trân trọng,<br>Đội ngũ Hỗ trợ</p>`,
      isHtml: true,
      tags: ['Mới'],
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

    const copyTemplate: EmailTemplate = {
      ...source,
      id: `email-${Date.now()}`,
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
      alert('Cần giữ lại ít nhất 1 mẫu trong hệ thống.');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa mẫu email này?')) {
      const remaining = templates.filter((t) => t.id !== id);
      onSaveTemplates(remaining);
      if (selectedTemplateId === id) {
        setSelectedTemplateId(remaining[0].id);
      }
    }
  };

  const handleInsertTag = (tag: string) => {
    if (lastFocusedField === 'subject') {
      const input = subjectInputRef.current;
      if (!input) {
        setSubject((prev) => prev + ' ' + tag);
        return;
      }
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const nextValue = subject.substring(0, start) + tag + subject.substring(end);
      setSubject(nextValue);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + tag.length, start + tag.length);
      }, 50);
    } else {
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
    }
  };

  const handleTestSendGmail = () => {
    if (!testRecipient) {
      alert('Vui lòng thêm ít nhất một liên hệ người nhận để thử nghiệm');
      return;
    }
    const renderedSub = renderTemplate(subject, testRecipient);
    const renderedBody = renderTemplate(content, testRecipient);
    const url = getGmailComposeUrl(testRecipient.email, renderedSub, renderedBody);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-xs">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Quản Lý Mẫu Gửi Mail (Gmail Template Hub)
              <span className="text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                {templates.length} mẫu có sẵn
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Soạn thảo mẫu Email chuẩn HTML / Markdown, tự động thay biến cá nhân hóa & xem trước trực tiếp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAiGenerator('gmail')}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Tạo Bằng AI Gemini</span>
          </button>

          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mẫu Mới</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Template List, Middle Editor, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Template List (3 cols) */}
        <div className="lg:col-span-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[740px]">
          <div className="mb-3 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm mẫu mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none"
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
                      ? 'border-red-500 bg-red-50/40 shadow-xs ring-1 ring-red-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-red-900' : 'text-slate-800'}`}>
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={(e) => handleDuplicate(template.id, e)}
                        title="Nhân bản mẫu này"
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

                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-medium">
                    {template.subject}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                      {CATEGORY_LABELS[template.category] || template.category}
                    </span>
                    <span>{template.updatedAt}</span>
                  </div>
                </div>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                Không tìm thấy mẫu phù hợp
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Editor (5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[740px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Chỉnh sửa mẫu
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
                  placeholder="VD: Chào hàng B2B..."
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Phân loại mẫu:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-red-500 outline-none"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Tiêu đề Email (Subject):
                </label>
                <span className="text-[10px] text-slate-400">Có thể chứa biến &#123;&#123;ho_ten&#125;&#125;</span>
              </div>
              <input
                ref={subjectInputRef}
                type="text"
                value={subject}
                onFocus={() => setLastFocusedField('subject')}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="VD: [Kính gửi {{danh_xung}} {{ho_ten}}] Thư mời tham gia sự kiện..."
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none font-semibold text-slate-900"
              />
            </div>

            {/* Variable Toolbar */}
            <VariableBadgeBar onInsertTag={handleInsertTag} />

            {/* Content Textarea with HTML toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Nội dung Email:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsHtml(!isHtml)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition ${
                      isHtml ? 'bg-blue-100 text-blue-700 font-semibold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    <span>{isHtml ? 'Định dạng HTML' : 'Văn bản thường'}</span>
                  </button>
                </div>
              </div>

              <textarea
                ref={contentTextareaRef}
                value={content}
                onFocus={() => setLastFocusedField('content')}
                onChange={(e) => setContent(e.target.value)}
                rows={13}
                placeholder="Nhập nội dung thư hoặc mã HTML..."
                className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none font-mono leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Thẻ từ khóa (Tags, phân cách bằng dấu phẩy):
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Kinh doanh, Khuyến mãi, VIP"
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Email Preview (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-[740px] space-y-3">
          {/* Test recipient switcher */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Xem trước với:</span>
            </div>
            <select
              value={selectedTestRecipientId}
              onChange={(e) => setSelectedTestRecipientId(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 outline-none max-w-[170px] truncate"
            >
              {recipients.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.ho_ten} ({r.cong_ty || r.email})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleTestSendGmail}
              title="Mở tab Gmail để gửi thử ngay"
              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Thử gửi</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <EmailClientPreview
              subject={subject}
              content={content}
              isHtml={isHtml}
              recipient={testRecipient}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
