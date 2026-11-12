import { EmailTemplate, ZaloTemplate, Recipient } from '../types';

export const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'email-1',
    name: 'Chào hàng & Giới thiệu dịch vụ B2B',
    category: 'sales',
    subject: '[Hợp tác] Giải pháp tối ưu hóa kinh doanh dành cho {{cong_ty}}',
    isHtml: true,
    tags: ['Kinh doanh', 'Chào hàng', 'B2B'],
    createdAt: '2026-11-01',
    updatedAt: '2026-11-01',
    content: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px;">
  <p>Kính gửi {{danh_xung}} <strong>{{ho_ten}}</strong>,</p>
  <p>Em là chuyên viên tư vấn giải pháp chuyển đổi số từ công ty chúng em. Được biết {{cong_ty}} đang phát triển mạnh mẽ và chú trọng nâng cao hiệu suất vận hành trong năm nay.</p>
  
  <p>Bên em vừa ra mắt bộ giải pháp mới giúp:</p>
  <ul style="padding-left: 20px;">
    <li>Tiết kiệm tới <strong>40% thời gian xử lý</strong> đơn từ và chăm sóc khách hàng.</li>
    <li>Tự động hóa tin nhắn Zalo và Email tới danh sách đối tác chỉ với 1 cú click.</li>
    <li>Báo cáo dữ liệu chi tiết, tăng tỷ lệ chuyển đổi chốt đơn.</li>
  </ul>

  <p>Em xin phép gửi đính kèm tài liệu chi tiết và demo giải pháp để {{danh_xung}} tham khảo qua email <strong>{{email}}</strong>.</p>
  
  <p style="margin: 25px 0;">
    <a href="https://example.com/demo" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Đăng ký trải nghiệm miễn phí 14 ngày</a>
  </p>

  <p>Nếu thuận tiện, em xin phép liên hệ lại với {{danh_xung}} qua số <strong>{{so_dien_thoai}}</strong> vào ngày mai nhé ạ.</p>
  <p>Kính chúc {{danh_xung}} và {{cong_ty}} ngày càng thịnh vượng!</p>
  
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
  <p style="font-size: 13px; color: #64748b;">
    <strong>Phòng Phát Triển Kinh Doanh</strong><br>
    Hotline: 1900 6868 | Email: contact@example.com
  </p>
</div>`
  },
  {
    id: 'email-2',
    name: 'Xác nhận đơn hàng & Hóa đơn',
    category: 'order',
    subject: '[Xác nhận đơn hàng {{ma_don}}] Cảm ơn {{danh_xung}} {{ho_ten}} đã mua sắm',
    isHtml: true,
    tags: ['Đơn hàng', 'Thanh toán', 'Hóa đơn'],
    createdAt: '2026-11-02',
    updatedAt: '2026-11-02',
    content: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px;">
  <h2 style="color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Thông Tin Đơn Hàng #{{ma_don}}</h2>
  <p>Dạ em chào {{danh_xung}} <strong>{{ho_ten}}</strong>,</p>
  <p>Cảm ơn {{danh_xung}} đã tin tưởng lựa chọn sản phẩm của chúng em. Đơn hàng của {{danh_xung}} đã được hệ thống ghi nhận thành công.</p>
  
  <table style="width: 100%; border-collapse: collapse; margin: 15px 0; background: #f8fafc; border-radius: 8px; overflow: hidden;">
    <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 14px; font-weight: bold;">Khách hàng:</td><td style="padding: 10px 14px;">{{danh_xung}} {{ho_ten}}</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 14px; font-weight: bold;">Số điện thoại:</td><td style="padding: 10px 14px;">{{so_dien_thoai}}</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 14px; font-weight: bold;">Đơn vị / Công ty:</td><td style="padding: 10px 14px;">{{cong_ty}}</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 14px; font-weight: bold;">Tổng thanh toán:</td><td style="padding: 10px 14px; color: #dc2626; font-weight: bold; font-size: 16px;">{{so_tien}}</td></tr>
    <tr><td style="padding: 10px 14px; font-weight: bold;">Thời gian giao dự kiến:</td><td style="padding: 10px 14px;">{{ngay_hen}}</td></tr>
  </table>

  <p>Ghi chú đơn hàng: <em>{{ghi_chu}}</em></p>
  <p>Đơn hàng sẽ được nhân viên giao hàng liên hệ trước khi phát. Nếu cần hỗ trợ khẩn cấp, {{danh_xung}} vui lòng liên hệ hotline để được phục vụ tốt nhất.</p>
  <p>Trân trọng cảm ơn {{danh_xung}}!</p>
</div>`
  },
  {
    id: 'email-3',
    name: 'Nhắc lịch hẹn & Họp trực tuyến',
    category: 'reminder',
    subject: '[Nhắc lịch] Cuộc hẹn trao đổi dự án với {{cong_ty}} ngày {{ngay_hen}}',
    isHtml: true,
    tags: ['Lịch hẹn', 'Họp', 'Chăm sóc'],
    createdAt: '2026-11-03',
    updatedAt: '2026-11-03',
    content: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px;">
  <p>Kính gửi {{danh_xung}} <strong>{{ho_ten}}</strong>,</p>
  <p>Em xin gửi email để nhắc lại lịch hẹn trao đổi chi tiết kế hoạch hợp tác giữa hai bên:</p>
  
  <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; margin: 15px 0;">
    <p style="margin: 0 0 6px 0;"><strong>Thời gian:</strong> 09:30 sáng, ngày {{ngay_hen}}</p>
    <p style="margin: 0 0 6px 0;"><strong>Tham dự:</strong> {{danh_xung}} {{ho_ten}} ({{cong_ty}}) & Đội ngũ tư vấn</p>
    <p style="margin: 0;"><strong>Nội dung:</strong> Đánh giá phương án triển khai mã đơn {{ma_don}}</p>
  </div>

  <p>Nếu {{danh_xung}} có bất kỳ thay đổi nào về thời gian, xin vui lòng phản hồi lại email này hoặc thông báo qua số <strong>{{so_dien_thoai}}</strong> để em sắp xếp lại lịch cho phù hợp nhất.</p>
  <p>Rất mong sớm được làm việc cùng {{danh_xung}}.</p>
  <p>Trân trọng,<br><strong>Ban Thư ký Dự án</strong></p>
</div>`
  },
  {
    id: 'email-4',
    name: 'Tri ân sinh nhật & Tặng Voucher',
    category: 'holiday',
    subject: '🎂 Chúc mừng sinh nhật {{danh_xung}} {{ho_ten}} - Nhận món quà từ chúng em',
    isHtml: true,
    tags: ['Sinh nhật', 'Tri ân', 'Voucher'],
    createdAt: '2026-11-04',
    updatedAt: '2026-11-04',
    content: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; text-align: center; border: 1px solid #fed7aa; padding: 30px; border-radius: 12px; background: #fffaf5;">
  <h1 style="color: #ea580c; margin-top: 0;">🎉 Chúc Mừng Sinh Nhật 🎉</h1>
  <p style="font-size: 16px;">Kính chúc {{danh_xung}} <strong>{{ho_ten}}</strong> một tuổi mới tràn đầy sức khỏe, hạnh phúc và thành công vượt bậc!</p>
  
  <p>Nhân ngày đặc biệt này, chúng em xin gửi tặng {{danh_xung}} món quà tri ân:</p>
  
  <div style="background: #ffedd5; border: 2px dashed #f97316; padding: 18px; margin: 20px auto; border-radius: 8px; max-width: 400px;">
    <span style="font-size: 13px; text-transform: uppercase; color: #9a3412; font-weight: bold; letter-spacing: 1px;">Mã Voucher Độc Quyền</span>
    <h2 style="color: #c2410c; margin: 8px 0; letter-spacing: 2px;">SINHNHAT-{{ho_ten}}</h2>
    <p style="margin: 0; font-size: 14px; color: #7c2d12;">Giảm ngay <strong>{{so_tien}}</strong> cho đơn hàng kế tiếp (Hạn dùng: {{ngay_hen}})</p>
  </div>

  <p style="font-size: 14px; color: #475569;">Cảm ơn {{danh_xung}} đã luôn đồng hành cùng chúng em trong suốt thời gian qua!</p>
</div>`
  }
];

export const INITIAL_ZALO_TEMPLATES: ZaloTemplate[] = [
  {
    id: 'zalo-1',
    name: 'CSKH 1-1 & Thăm hỏi thân thiết',
    category: 'customer_care',
    tags: ['CSKH', 'Thân thiện', 'Định kỳ'],
    createdAt: '2026-11-01',
    updatedAt: '2026-11-01',
    content: `Dạ em chào {{danh_xung}} {{ho_ten}} ạ! ✨

Em liên hệ từ bên dịch vụ khách hàng. Đợt này công việc bên {{cong_ty}} của {{danh_xung}} vẫn thuận lợi và phát triển tốt chứ ạ? 🌸

Em nhắn tin để thăm hỏi tình hình sử dụng dịch vụ của {{danh_xung}}, không biết {{danh_xung}} có gặp trở ngại nào cần bên em hỗ trợ thêm không ạ?

Nếu {{danh_xung}} cần bất cứ thông tin gì, cứ nhắn lại ngay cho em nhé! Chúc {{danh_xung}} một ngày làm việc nhiều niềm vui và may mắn 🍀`,
    ctaText: 'Chat với tư vấn viên',
    ctaUrl: 'https://zalo.me'
  },
  {
    id: 'zalo-2',
    name: 'Thông báo đơn hàng đang vận chuyển',
    category: 'order',
    tags: ['Giao hàng', 'Đơn hàng', 'Vận chuyển'],
    createdAt: '2026-11-02',
    updatedAt: '2026-11-02',
    content: `📦 THÔNG BÁO VẬN CHUYỂN ĐƠN HÀNG #{{ma_don}}

Dạ em chào {{danh_xung}} {{ho_ten}}!
Đơn hàng của {{danh_xung}} đã được đóng gói cẩn thận và đang trên đường giao tới địa chỉ của {{cong_ty}}.

Thông tin chi tiết:
🔹 Mã vận đơn: {{ma_don}}
🔹 Thu hộ (COD): {{so_tien}}
🔹 Dự kiến giao: {{ngay_hen}}

👉 {{danh_xung}} chú ý điện thoại vào ngày hẹn để shipper tiện liên lạc nhé ạ. Cảm ơn {{danh_xung}} nhiều! ❤️`,
    ctaText: 'Tra cứu đơn hàng',
    ctaUrl: 'https://zalo.me'
  },
  {
    id: 'zalo-3',
    name: 'Nhắc lịch hẹn làm việc / Họp',
    category: 'reminder',
    tags: ['Lịch hẹn', 'Họp', 'Chuyên nghiệp'],
    createdAt: '2026-11-03',
    updatedAt: '2026-11-03',
    content: `Kính gửi {{danh_xung}} {{ho_ten}} ({{cong_ty}}), 🗓️

Em xin phép gửi tin nhắn nhắc lịch hẹn giữa 2 bên vào ngày {{ngay_hen}} sắp tới.

Bên em đã chuẩn bị đầy đủ tài liệu và bảng phương án tối ưu để trao đổi cùng {{danh_xung}}. Nếu {{danh_xung}} có bất kỳ điều chỉnh nào về thời gian, vui lòng nhắn lại giúp em để em sắp xếp chu đáo nhất ạ.

Em xin cảm ơn {{danh_xung}}! Chúc {{danh_xung}} một ngày hiệu quả! 💼`,
    ctaText: 'Xác nhận lịch hẹn',
    ctaUrl: 'https://zalo.me'
  },
  {
    id: 'zalo-4',
    name: 'Ưu đãi Flash Sale độc quyền Zalo',
    category: 'sales',
    tags: ['Khuyến mãi', 'Flash Sale', 'Quà tặng'],
    createdAt: '2026-11-04',
    updatedAt: '2026-11-04',
    content: `🔥 ƯU ĐÃI ĐẶC QUYỀN DÀNH RIÊNG CHO {{danh_xung}} {{ho_ten}}! 🔥

Chào {{danh_xung}}, bên em vừa mở cổng ưu đãi Flash Sale cho nhóm khách hàng thân thiết:
🎁 Giảm ngay {{so_tien}} khi kích hoạt gói dịch vụ trong tuần này.
🎁 Tặng kèm gói bảo hành và hỗ trợ kỹ thuật 1-1 chuyên sâu.
⏰ Thời hạn áp dụng chỉ tới ngày: {{ngay_hen}}.

👉 {{danh_xung}} nhắn "ĐỒNG Ý" để em giữ lại suất ưu đãi tốt nhất này cho {{danh_xung}} nhé!`,
    ctaText: 'Nhận ưu đãi ngay',
    ctaUrl: 'https://zalo.me'
  },
  {
    id: 'zalo-5',
    name: 'Nhắc phí / Gia hạn hợp đồng lịch sự',
    category: 'reminder',
    tags: ['Kế toán', 'Gia hạn', 'Lịch sự'],
    createdAt: '2026-11-05',
    updatedAt: '2026-11-05',
    content: `Dạ em chào {{danh_xung}} {{ho_ten}} ạ! 🌸

Bộ phận Kế toán bên em xin phép gửi thông báo đối soát hợp đồng cho {{cong_ty}}. Khoản thanh toán định kỳ số tiền {{so_tien}} có hạn chót vào ngày {{ngay_hen}}.

{{danh_xung}} kiểm tra giúp em để hệ thống duy trì dịch vụ liên tục và không bị gián đoạn nhé ạ.

Nếu cần xuất hóa đơn VAT điện tử, {{danh_xung}} cứ báo lại em hỗ trợ ngay nhé. Em cảm ơn {{danh_xung}} nhiều ạ! 🙏`,
    ctaText: 'Xem hóa đơn',
    ctaUrl: 'https://zalo.me'
  }
];

export const INITIAL_RECIPIENTS: Recipient[] = [
  {
    id: 'rec-1',
    ho_ten: 'Nguyễn Văn An',
    danh_xung: 'Anh',
    so_dien_thoai: '0912345678',
    email: 'an.nguyen@anphattech.vn',
    cong_ty: 'Công ty CP An Phát Tech',
    ma_don: 'DH-8821',
    so_tien: '2.500.000 VNĐ',
    ngay_hen: '15/11/2026',
    ghi_chu: 'Khách hàng VIP, quan tâm giải pháp phần mềm',
    status: 'pending'
  },
  {
    id: 'rec-2',
    ho_ten: 'Trần Thị Mai',
    danh_xung: 'Chị',
    so_dien_thoai: '0987654321',
    email: 'mai.tran@maikhoifashion.com',
    cong_ty: 'Thời trang Mai Khôi',
    ma_don: 'DH-8822',
    so_tien: '1.800.000 VNĐ',
    ngay_hen: '16/11/2026',
    ghi_chu: 'Cần hỗ trợ giao giờ hành chính',
    status: 'pending'
  },
  {
    id: 'rec-3',
    ho_ten: 'Lê Hoàng Phúc',
    danh_xung: 'Anh',
    so_dien_thoai: '0903456789',
    email: 'phuc.le@phucthinhlogistics.vn',
    cong_ty: 'Phúc Thịnh Logistics',
    ma_don: 'DH-8823',
    so_tien: '4.200.000 VNĐ',
    ngay_hen: '17/11/2026',
    ghi_chu: 'Hẹn gặp trực tiếp tại văn phòng',
    status: 'pending'
  },
  {
    id: 'rec-4',
    ho_ten: 'Phạm Thu Hương',
    danh_xung: 'Chị',
    so_dien_thoai: '0938123987',
    email: 'huong.pham@huongsenspa.vn',
    cong_ty: 'Viện Thẩm Mỹ Hương Sen',
    ma_don: 'DH-8824',
    so_tien: '3.600.000 VNĐ',
    ngay_hen: '18/11/2026',
    ghi_chu: 'Thích nhắn qua Zalo hơn gọi điện',
    status: 'pending'
  },
  {
    id: 'rec-5',
    ho_ten: 'Đỗ Minh Trí',
    danh_xung: 'Anh',
    so_dien_thoai: '0979888999',
    email: 'tri.do@namthanhcorp.vn',
    cong_ty: 'Tập đoàn Xây dựng Nam Thành',
    ma_don: 'DH-8825',
    so_tien: '8.900.000 VNĐ',
    ngay_hen: '20/11/2026',
    ghi_chu: 'Hợp đồng doanh nghiệp lớn, cần xuất VAT',
    status: 'pending'
  }
];
