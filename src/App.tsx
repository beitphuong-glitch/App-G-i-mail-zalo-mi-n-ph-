import React, { useState, useEffect } from 'react';
import { EmailTemplate, ZaloTemplate, Recipient, CampaignLog } from './types';
import { INITIAL_EMAIL_TEMPLATES, INITIAL_ZALO_TEMPLATES, INITIAL_RECIPIENTS } from './data/mockData';
import { Navbar, ActiveTab } from './components/Navbar';
import { CampaignRunner } from './components/campaign/CampaignRunner';
import { EmailTemplateManager } from './components/templates/EmailTemplateManager';
import { ZaloTemplateManager } from './components/templates/ZaloTemplateManager';
import { RecipientManager } from './components/recipients/RecipientManager';
import { AiStudioView } from './components/ai/AiStudioView';
import { AiGeneratorModal } from './components/ai/AiGeneratorModal';

export default function App() {
  // Load initial states from LocalStorage or fallbacks
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('megasender_email_templates');
      return saved ? JSON.parse(saved) : INITIAL_EMAIL_TEMPLATES;
    } catch {
      return INITIAL_EMAIL_TEMPLATES;
    }
  });

  const [zaloTemplates, setZaloTemplates] = useState<ZaloTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('megasender_zalo_templates');
      return saved ? JSON.parse(saved) : INITIAL_ZALO_TEMPLATES;
    } catch {
      return INITIAL_ZALO_TEMPLATES;
    }
  });

  const [recipients, setRecipients] = useState<Recipient[]>(() => {
    try {
      const saved = localStorage.getItem('megasender_recipients');
      return saved ? JSON.parse(saved) : INITIAL_RECIPIENTS;
    } catch {
      return INITIAL_RECIPIENTS;
    }
  });

  const [logs, setLogs] = useState<CampaignLog[]>(() => {
    try {
      const saved = localStorage.getItem('megasender_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('campaign');

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalChannel, setAiModalChannel] = useState<'gmail' | 'zalo'>('gmail');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('megasender_email_templates', JSON.stringify(emailTemplates));
    } catch (e) {
      console.error(e);
    }
  }, [emailTemplates]);

  useEffect(() => {
    try {
      localStorage.setItem('megasender_zalo_templates', JSON.stringify(zaloTemplates));
    } catch (e) {
      console.error(e);
    }
  }, [zaloTemplates]);

  useEffect(() => {
    try {
      localStorage.setItem('megasender_recipients', JSON.stringify(recipients));
    } catch (e) {
      console.error(e);
    }
  }, [recipients]);

  useEffect(() => {
    try {
      localStorage.setItem('megasender_logs', JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }, [logs]);

  // Handlers
  const handleOpenAiModal = (channel: 'gmail' | 'zalo' = 'gmail') => {
    setAiModalChannel(channel);
    setIsAiModalOpen(true);
  };

  const handleApplyEmailTemplateFromAi = (tpl: Partial<EmailTemplate>) => {
    const newTemplate: EmailTemplate = {
      id: `email-ai-${Date.now()}`,
      name: tpl.name || 'Mẫu Email AI',
      category: tpl.category || 'sales',
      subject: tpl.subject || 'Thông báo',
      content: tpl.content || '',
      isHtml: true,
      tags: tpl.tags || ['AI Gemini'],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setEmailTemplates([newTemplate, ...emailTemplates]);
    setActiveTab('email_templates');
  };

  const handleApplyZaloTemplateFromAi = (tpl: Partial<ZaloTemplate>) => {
    const newTemplate: ZaloTemplate = {
      id: `zalo-ai-${Date.now()}`,
      name: tpl.name || 'Mẫu Zalo AI',
      category: tpl.category || 'customer_care',
      content: tpl.content || '',
      ctaText: tpl.ctaText,
      ctaUrl: tpl.ctaUrl,
      tags: tpl.tags || ['AI Gemini'],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setZaloTemplates([newTemplate, ...zaloTemplates]);
    setActiveTab('zalo_templates');
  };

  const handleAddLog = (newLog: CampaignLog) => {
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleClearLogs = () => {
    if (confirm('Bạn có muốn xóa toàn bộ lịch sử gửi?')) {
      setLogs([]);
    }
  };

  const sentCount = recipients.filter((r) => r.status === 'sent').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        emailCount={emailTemplates.length}
        zaloCount={zaloTemplates.length}
        contactCount={recipients.length}
        sentCount={sentCount}
        onOpenAiModal={() => handleOpenAiModal('gmail')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        {activeTab === 'campaign' && (
          <CampaignRunner
            recipients={recipients}
            emailTemplates={emailTemplates}
            zaloTemplates={zaloTemplates}
            onUpdateRecipients={setRecipients}
            logs={logs}
            onAddLog={handleAddLog}
            onClearLogs={handleClearLogs}
            onNavigateToTemplates={(channel) => {
              setActiveTab(channel === 'zalo' ? 'zalo_templates' : 'email_templates');
            }}
          />
        )}

        {activeTab === 'email_templates' && (
          <EmailTemplateManager
            templates={emailTemplates}
            onSaveTemplates={setEmailTemplates}
            recipients={recipients}
            onOpenAiGenerator={() => handleOpenAiModal('gmail')}
          />
        )}

        {activeTab === 'zalo_templates' && (
          <ZaloTemplateManager
            templates={zaloTemplates}
            onSaveTemplates={setZaloTemplates}
            recipients={recipients}
            onOpenAiGenerator={() => handleOpenAiModal('zalo')}
          />
        )}

        {activeTab === 'recipients' && (
          <RecipientManager
            recipients={recipients}
            onUpdateRecipients={setRecipients}
          />
        )}

        {activeTab === 'ai_studio' && (
          <AiStudioView
            onSaveEmailTemplate={(t) => {
              setEmailTemplates([t, ...emailTemplates]);
            }}
            onSaveZaloTemplate={(t) => {
              setZaloTemplates([t, ...zaloTemplates]);
            }}
            onNavigateToTemplates={(ch) => {
              setActiveTab(ch === 'zalo' ? 'zalo_templates' : 'email_templates');
            }}
          />
        )}
      </main>

      {/* Quick AI Generator Modal */}
      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        defaultChannel={aiModalChannel}
        onApplyEmailTemplate={handleApplyEmailTemplateFromAi}
        onApplyZaloTemplate={handleApplyZaloTemplateFromAi}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">MegaSender</span>
            <span>•</span>
            <span>Hệ thống gửi tin Zalo & Gmail hàng loạt thông minh</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Biến động tự động: &#123;&#123;ho_ten&#125;&#125;, &#123;&#123;danh_xung&#125;&#125;, &#123;&#123;so_dien_thoai&#125;&#125;</span>
            <span>•</span>
            <span>Tích hợp AI Gemini</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
