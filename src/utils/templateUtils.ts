import { Recipient } from '../types';

/**
 * Available template tags with human-readable labels
 */
export const TEMPLATE_VARIABLES = [
  { tag: '{{ho_ten}}', label: 'Họ và tên', example: 'Nguyễn Văn An' },
  { tag: '{{danh_xung}}', label: 'Danh xưng', example: 'Anh / Chị / Bạn' },
  { tag: '{{so_dien_thoai}}', label: 'Số điện thoại', example: '0987654321' },
  { tag: '{{email}}', label: 'Email', example: 'an.nguyen@example.com' },
  { tag: '{{cong_ty}}', label: 'Tên công ty', example: 'An Phát Tech' },
  { tag: '{{ma_don}}', label: 'Mã đơn / Mã KH', example: 'HD-9821' },
  { tag: '{{so_tien}}', label: 'Số tiền / Giá trị', example: '1.500.000 VNĐ' },
  { tag: '{{ngay_hen}}', label: 'Ngày hẹn / Hạn chót', example: '15/11/2026' },
  { tag: '{{ghi_chu}}', label: 'Ghi chú riêng', example: 'Khách VIP thân thiết' },
];

/**
 * Replace variables in template string with recipient data
 */
export function renderTemplate(template: string, recipient: Partial<Recipient>): string {
  if (!template) return '';
  
  return template
    .replace(/\{\{ho_ten\}\}/gi, recipient.ho_ten || 'Quý khách')
    .replace(/\{\{danh_xung\}\}/gi, recipient.danh_xung || 'Quý khách')
    .replace(/\{\{so_dien_thoai\}\}/gi, recipient.so_dien_thoai || '')
    .replace(/\{\{email\}\}/gi, recipient.email || '')
    .replace(/\{\{cong_ty\}\}/gi, recipient.cong_ty || '')
    .replace(/\{\{ma_don\}\}/gi, recipient.ma_don || '')
    .replace(/\{\{so_tien\}\}/gi, recipient.so_tien || '')
    .replace(/\{\{ngay_hen\}\}/gi, recipient.ngay_hen || '')
    .replace(/\{\{ghi_chu\}\}/gi, recipient.ghi_chu || '')
    .replace(/\{\{customField1\}\}/gi, recipient.customField1 || '')
    .replace(/\{\{customField2\}\}/gi, recipient.customField2 || '');
}

/**
 * Clean and format phone number for Zalo direct link (zalo.me/phone)
 * In Vietnam: 0901234567 -> 0901234567 or 84901234567
 */
export function normalizeZaloPhone(phone: string): string {
  if (!phone) return '';
  // Remove non-digit characters
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('84') && clean.length >= 11) {
    clean = '0' + clean.slice(2);
  }
  return clean;
}

/**
 * Generate Zalo Me link
 */
export function getZaloChatUrl(phone: string): string {
  const clean = normalizeZaloPhone(phone);
  return `https://zalo.me/${clean}`;
}

/**
 * Generate Gmail Web Compose URL
 */
export function getGmailComposeUrl(to: string, subject: string, bodyText: string): string {
  // Strip HTML tags for Gmail web compose text body if formatted
  const plainText = bodyText
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .trim();

  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: to,
    su: subject,
    body: plainText,
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Play a friendly Web Audio API chime on send
 */
export function playChimeSound(type: 'success' | 'click' | 'complete' = 'success') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.2);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
      });
    } else if (type === 'complete') {
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
      });
    }
  } catch (err) {
    console.debug('Audio error:', err);
  }
}

/**
 * Export recipients or logs to CSV with UTF-8 BOM for Excel
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Vietnamese characters in Excel
    headers.join(',') +
    '\n' +
    rows
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      )
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
