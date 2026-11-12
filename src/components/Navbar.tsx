import React from 'react';
import { Send, Mail, MessageSquare, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export type ActiveTab = 'campaign' | 'email_templates' | 'zalo_templates' | 'recipients' | 'ai_studio';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  emailCount: number;
  zaloCount: number;
  contactCount: number;
  sentCount: number;
  onOpenAiModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  emailCount,
  zaloCount,
  contactCount,
  sentCount,
  onOpenAiModal,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('campaign')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-red-500 text-white flex items-center justify-center shadow-md">
              <Send className="w-5 h-5 -rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  MegaSender
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-[#0068FF] rounded-md tracking-wide">
                  GMAIL & ZALO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Hệ Thống Tạo Mẫu & Gửi Tin Nhắn Hàng Loạt
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => onSelectTab('campaign')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'campaign'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Chiến Dịch Gửi</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('email_templates')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'email_templates'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Mẫu Gửi Mail</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'email_templates' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'}`}>
                {emailCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('zalo_templates')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'zalo_templates'
                  ? 'bg-[#0068FF] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0068FF] hover:bg-blue-50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Mẫu Gửi Zalo</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'zalo_templates' ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#0068FF]'}`}>
                {zaloCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('recipients')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'recipients'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Người Nhận</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'recipients' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                {contactCount}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenAiModal}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs transition whitespace-nowrap ml-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">AI Gemini</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
