import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '5mb' }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasAiKey: !!apiKey,
    timestamp: new Date().toISOString()
  });
});

// AI Template Generator
app.post('/api/ai/generate', async (req, res) => {
  try {
    const {
      channel = 'gmail',
      purpose = 'sales',
      tone = 'professional',
      businessName = '',
      productOrService = '',
      keyPoints = '',
      customInstruction = ''
    } = req.body;

    if (!ai) {
      // Fallback templates if no API key is provided
      if (channel === 'zalo') {
        return res.json({
          success: true,
          source: 'fallback',
          template: {
            name: `Mẫu Zalo: ${purpose}`,
            content: `Chào {{danh_xung}} {{ho_ten}}, em là chuyên viên từ ${businessName || 'Công ty'}.\n\nBên em xin gửi đến {{danh_xung}} thông tin cập nhật mới nhất về ${productOrService || 'dịch vụ'}:\n- ${keyPoints || 'Ưu đãi đặc biệt dành riêng cho khách hàng'}\n\n{{danh_xung}} nhắn lại em hoặc gọi hotline để em hỗ trợ nhanh nhất nhé ạ! Chúc {{danh_xung}} ngày mới nhiều niềm vui ✨`,
            ctaText: 'Xem chi tiết',
            ctaUrl: 'https://zalo.me'
          }
        });
      } else {
        return res.json({
          success: true,
          source: 'fallback',
          template: {
            name: `Mẫu Email: ${purpose}`,
            subject: `[${businessName || 'Thông báo'}] Gửi {{danh_xung}} {{ho_ten}} thông tin về ${productOrService || 'dịch vụ'}`,
            content: `<p>Kính gửi {{danh_xung}} <strong>{{ho_ten}}</strong>${businessName ? ` - Quý ${businessName}` : ''},</p><p>Lời đầu tiên, em xin gửi lời chúc sức khỏe và thành công đến {{danh_xung}}.</p><p>Em liên hệ để gửi đến {{danh_xung}} thông tin quan trọng về <strong>${productOrService || 'sản phẩm / dịch vụ'}</strong>:</p><ul><li>${keyPoints || 'Chính sách ưu đãi và giải pháp tối ưu'}</li><li>Hỗ trợ triển khai nhanh chóng và bảo hành chu đáo</li></ul><p>Nếu {{danh_xung}} có bất kỳ thắc mắc nào, vui lòng phản hồi email này hoặc liên hệ qua số điện thoại <strong>{{so_dien_thoai}}</strong>.</p><p>Trân trọng,<br><strong>Đội ngũ Chăm sóc Khách hàng</strong></p>`
          }
        });
      }
    }

    const systemPrompt = `Bạn là chuyên gia Marketing và Chăm sóc Khách hàng hàng đầu tại Việt Nam.
Nhiệm vụ: Tạo mẫu tin nhắn ${channel === 'zalo' ? 'ZALO' : 'GMAIL'} gửi hàng loạt chuyên nghiệp, hấp dẫn, có tỷ lệ phản hồi cao.
Các biến số thay thế có thể sử dụng (hãy khéo léo đưa vào mẫu):
- {{danh_xung}}: Danh xưng (Anh/Chị/Bạn)
- {{ho_ten}}: Họ và tên người nhận
- {{so_dien_thoai}}: Số điện thoại
- {{email}}: Địa chỉ email
- {{cong_ty}}: Tên công ty/cửa hàng
- {{ma_don}}: Mã đơn hàng / mã khách hàng
- {{so_tien}}: Số tiền / giá trị hợp đồng
- {{ngay_hen}}: Ngày hẹn / hạn chót

Quy chuẩn kênh:
- Kênh ZALO: Độ dài vừa phải (150-350 từ), dùng emoji hợp lý, sinh động, lịch sự, dễ đọc trên điện thoại. Không dùng thẻ HTML, dùng xuống dòng rõ ràng.
- Kênh GMAIL: Cần có Subject (Tiêu đề cuốn hút, tránh từ khóa spam) và Body dạng HTML sạch sẽ kèm style nhẹ (đoạn văn <p>, in đậm <strong>, danh sách <ul><li>).

Trả về ĐÚNG định dạng JSON sau (không kèm markdown ngoài khối JSON):
{
  "name": "Tên gợi nhớ cho mẫu",
  ${channel === 'gmail' ? '"subject": "Tiêu đề email",' : ''}
  "content": "Nội dung mẫu (chứa các biến {{...}})",
  "ctaText": "Văn bản kêu gọi hành động nếu có",
  "tips": "1-2 mẹo gửi tin nhắn hiệu quả"
}`;

    const userPrompt = `Yêu cầu tạo mẫu:
- Kênh: ${channel.toUpperCase()}
- Mục đích gửi: ${purpose}
- Giọng văn: ${tone} (ví dụ: Chuyên nghiệp, Thân thiện, Thuyết phục, Trang trọng)
- Tên thương hiệu/doanh nghiệp: ${businessName || 'Doanh nghiệp'}
- Sản phẩm / Dịch vụ / Nội dung chính: ${productOrService || 'Chăm sóc khách hàng'}
- Điểm nổi bật cần truyền tải: ${keyPoints || 'Thông tin cần gửi đến khách hàng'}
${customInstruction ? `- Lưu ý thêm: ${customInstruction}` : ''}`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timeout')), 10000)
    );

    const response: any = await Promise.race([generatePromise, timeoutPromise]);

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Clean potential wrappers
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      source: 'gemini',
      template: parsed
    });
  } catch (error: any) {
    console.error('AI Generation Error, returning fallback:', error);
    const { channel = 'gmail', purpose = 'Kinh doanh', businessName = 'Công ty', productOrService = 'Dịch vụ' } = req.body;
    
    if (channel === 'zalo') {
      return res.json({
        success: true,
        source: 'smart-fallback',
        template: {
          name: `Mẫu Zalo: ${purpose}`,
          content: `Dạ em chào {{danh_xung}} {{ho_ten}} ạ! ✨\n\nEm là đại diện từ ${businessName}. Em xin gửi đến {{danh_xung}} thông tin mới nhất về ${productOrService}.\n\nBên em đang có chương trình hỗ trợ đặc biệt dành cho ${businessName ? `đối tác của ${businessName}` : 'khách hàng'}. Nếu {{danh_xung}} cần thêm thông tin chi tiết, cứ nhắn tin trực tiếp cho em nhé ạ! 🍀`,
          ctaText: 'Xem chi tiết',
          ctaUrl: 'https://zalo.me',
          tips: 'Nên gửi vào khung giờ 09:30 - 11:30 hoặc 14:00 - 16:30 để có tỷ lệ phản hồi cao nhất.'
        }
      });
    } else {
      return res.json({
        success: true,
        source: 'smart-fallback',
        template: {
          name: `Mẫu Email: ${purpose}`,
          subject: `[${businessName}] Thông tin quan trọng gửi {{danh_xung}} {{ho_ten}} (${productOrService})`,
          content: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;"><p>Kính gửi {{danh_xung}} <strong>{{ho_ten}}</strong>,</p><p>Em xin gửi đến {{danh_xung}} thông tin mới nhất về giải pháp <strong>${productOrService}</strong> từ ${businessName}.</p><p>Những lợi ích nổi bật:</p><ul><li>Tối ưu hóa quy trình làm việc và tiết kiệm thời gian.</li><li>Cá nhân hóa tin nhắn trực tiếp tới khách hàng.</li></ul><p>Nếu {{danh_xung}} cần trao đổi thêm, vui lòng phản hồi email này hoặc liên hệ qua số điện thoại <strong>{{so_dien_thoai}}</strong>.</p><p>Trân trọng,<br><strong>${businessName}</strong></p></div>`,
          tips: 'Tiêu đề ngắn gọn dưới 60 ký tự giúp hiển thị trọn vẹn trên điện thoại.'
        }
      });
    }
  }
});

// AI Message Personalizer for individual recipient
app.post('/api/ai/personalize', async (req, res) => {
  try {
    const { channel = 'zalo', content, recipient } = req.body;

    if (!ai || !content) {
      return res.json({
        success: true,
        personalizedContent: content
      });
    }

    const prompt = `Bạn là trợ lý tinh chỉnh tin nhắn cá nhân hóa.
Dưới đây là mẫu tin nhắn ${channel.toUpperCase()}:
"""
${content}
"""

Thông tin khách hàng:
- Họ tên: ${recipient.ho_ten || 'Quý khách'}
- Danh xưng: ${recipient.danh_xung || 'Anh/Chị'}
- Công ty: ${recipient.cong_ty || 'Đối tác'}
- Ghi chú: ${recipient.ghi_chu || ''}

Hãy giữ nguyên ý nghĩa chính và cấu trúc, nhưng làm cho lời chào và đoạn mở đầu thật tự nhiên, ấm áp, phù hợp đúng với khách hàng này.
Chỉ trả về trực tiếp nội dung tin nhắn kết quả, không viết thêm lời dẫn.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.5 }
    });

    return res.json({
      success: true,
      personalizedContent: response.text?.trim() || content
    });
  } catch (error: any) {
    console.error('Personalize error:', error);
    return res.json({
      success: false,
      personalizedContent: req.body.content || ''
    });
  }
});

// Setup Vite in Dev or Serve Static in Production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Zalo & Gmail Bulk Sender server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
