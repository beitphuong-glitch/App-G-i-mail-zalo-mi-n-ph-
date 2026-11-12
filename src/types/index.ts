export type RecipientStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'skipped';

export interface Recipient {
  id: string;
  ho_ten: string;
  danh_xung: string; // 'Anh' | 'Chị' | 'Bạn' | 'Quý khách'
  so_dien_thoai: string;
  email: string;
  cong_ty: string;
  ma_don: string;
  so_tien: string;
  ngay_hen: string;
  ghi_chu: string;
  status: RecipientStatus;
  sentAt?: string;
  error?: string;
  customField1?: string;
  customField2?: string;
}

export type TemplateCategory = 'sales' | 'customer_care' | 'order' | 'reminder' | 'holiday' | 'custom';

export interface EmailTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  subject: string;
  content: string; // HTML or Markdown formatted string
  isHtml: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ZaloTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CampaignLog {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientTarget: string; // phone or email
  channel: 'gmail' | 'zalo';
  templateName: string;
  status: 'sent' | 'failed' | 'skipped';
  timestamp: string;
  note?: string;
}

export interface ZaloOaConfig {
  appId: string;
  secretKey: string;
  accessToken: string;
  oaId: string;
  templateId?: string;
}
