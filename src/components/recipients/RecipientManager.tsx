import React, { useState } from 'react';
import {
  Users, Plus, Upload, Download, Trash2, Search, Check, RefreshCw,
  Mail, MessageSquare, ExternalLink, X, FileSpreadsheet, CheckSquare, Square
} from 'lucide-react';
import { Recipient, RecipientStatus } from '../../types';
import { exportToCsv, getGmailComposeUrl, getZaloChatUrl } from '../../utils/templateUtils';
import { INITIAL_RECIPIENTS } from '../../data/mockData';

interface RecipientManagerProps {
  recipients: Recipient[];
  onUpdateRecipients: (recipients: Recipient[]) => void;
}

export const RecipientManager: React.FC<RecipientManagerProps> = ({
  recipients,
  onUpdateRecipients,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Single Add form
  const [newRecipient, setNewRecipient] = useState<Partial<Recipient>>({
    danh_xung: 'Anh',
    ho_ten: '',
    so_dien_thoai: '',
    email: '',
    cong_ty: '',
    ma_don: '',
    so_tien: '',
    ngay_hen: '',
    ghi_chu: '',
  });

  // Bulk Import text state
  const [importText, setImportText] = useState('');

  const filteredRecipients = recipients.filter((r) => {
    const matchesSearch =
      r.ho_ten.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.so_dien_thoai.includes(searchQuery) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cong_ty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ma_don.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredRecipients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecipients.map((r) => r.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient.ho_ten?.trim()) {
      alert('Vui lòng nhập Họ và tên');
      return;
    }

    const created: Recipient = {
      id: `rec-${Date.now()}`,
      ho_ten: newRecipient.ho_ten.trim(),
      danh_xung: newRecipient.danh_xung || 'Anh',
      so_dien_thoai: newRecipient.so_dien_thoai?.trim() || '',
      email: newRecipient.email?.trim() || '',
      cong_ty: newRecipient.cong_ty?.trim() || '',
      ma_don: newRecipient.ma_don?.trim() || '',
      so_tien: newRecipient.so_tien?.trim() || '',
      ngay_hen: newRecipient.ngay_hen?.trim() || '',
      ghi_chu: newRecipient.ghi_chu?.trim() || '',
      status: 'pending'
    };

    onUpdateRecipients([created, ...recipients]);
    setIsAddModalOpen(false);
    setNewRecipient({
      danh_xung: 'Anh',
      ho_ten: '',
      so_dien_thoai: '',
      email: '',
      cong_ty: '',
      ma_don: '',
      so_tien: '',
      ngay_hen: '',
      ghi_chu: '',
    });
  };

  const handleBulkImport = () => {
    if (!importText.trim()) {
      alert('Vui lòng dán dữ liệu hoặc tải file');
      return;
    }

    const lines = importText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const imported: Recipient[] = [];

    // Check if first line is a header
    const firstLineLower = lines[0].toLowerCase();
    const isHeader =
      firstLineLower.includes('tên') ||
      firstLineLower.includes('name') ||
      firstLineLower.includes('phone') ||
      firstLineLower.includes('sđt') ||
      firstLineLower.includes('email');

    const dataLines = isHeader ? lines.slice(1) : lines;

    dataLines.forEach((line, index) => {
      // Split by tab (Excel/Google Sheets) or comma
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      const cleanParts = parts.map((p) => p.replace(/^"|"$/g, '').trim());

      const ho_ten = cleanParts[0] || `Khách hàng ${index + 1}`;
      const so_dien_thoai = cleanParts[1] || '';
      const email = cleanParts[2] || '';
      const cong_ty = cleanParts[3] || '';
      const danh_xung = cleanParts[4] || (ho_ten.toLowerCase().includes('thị') ? 'Chị' : 'Anh');
      const ma_don = cleanParts[5] || `DH-${Math.floor(1000 + Math.random() * 9000)}`;
      const so_tien = cleanParts[6] || '';
      const ngay_hen = cleanParts[7] || '';
      const ghi_chu = cleanParts[8] || '';

      imported.push({
        id: `rec-import-${Date.now()}-${index}`,
        ho_ten,
        danh_xung,
        so_dien_thoai,
        email,
        cong_ty,
        ma_don,
        so_tien,
        ngay_hen,
        ghi_chu,
        status: 'pending'
      });
    });

    if (imported.length > 0) {
      onUpdateRecipients([...imported, ...recipients]);
      setIsImportModalOpen(false);
      setImportText('');
      alert(`Đã nhập thành công ${imported.length} liên hệ!`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleResetStatusAll = () => {
    if (confirm('Đặt lại tất cả liên hệ về trạng thái "Chưa gửi"?')) {
      const reset = recipients.map((r) => ({ ...r, status: 'pending' as RecipientStatus }));
      onUpdateRecipients(reset);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} liên hệ đã chọn?`)) {
      const remaining = recipients.filter((r) => !selectedIds.includes(r.id));
      onUpdateRecipients(remaining);
      setSelectedIds([]);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Họ và tên',
      'Danh xưng',
      'Số điện thoại',
      'Email',
      'Công ty',
      'Mã đơn',
      'Số tiền',
      'Ngày hẹn',
      'Ghi chú',
      'Trạng thái'
    ];
    const rows = filteredRecipients.map((r) => [
      r.id,
      r.ho_ten,
      r.danh_xung,
      r.so_dien_thoai,
      r.email,
      r.cong_ty,
      r.ma_don,
      r.so_tien,
      r.ngay_hen,
      r.ghi_chu,
      r.status === 'sent' ? 'Đã gửi' : r.status === 'failed' ? 'Thất bại' : 'Chưa gửi'
    ]);
    exportToCsv('danh_sach_nguoi_nhan', headers, rows);
  };

  const handleLoadDemoRecipients = () => {
    onUpdateRecipients(INITIAL_RECIPIENTS);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Quản Lý Danh Sách Người Nhận (Contacts Hub)
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                {recipients.length} liên hệ
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Nhập danh bạ từ Excel / CSV, quản lý thông tin khách hàng, số điện thoại Zalo và địa chỉ Gmail
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handleLoadDemoRecipients}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Nạp Mẫu Demo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition border border-blue-200"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Liên Hệ</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Bulk Actions */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, email, công ty, mã đơn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            {['all', 'pending', 'sent', 'failed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {st === 'all'
                  ? 'Tất cả'
                  : st === 'pending'
                  ? 'Chưa gửi'
                  : st === 'sent'
                  ? 'Đã gửi'
                  : 'Thất bại'}
              </button>
            ))}
          </div>
        </div>

        {/* Selected actions */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa ({selectedIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetStatusAll}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition"
            title="Đặt lại trạng thái chưa gửi để chạy chiến dịch mới"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Trạng Thái</span>
          </button>
        </div>
      </div>

      {/* Recipient Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button type="button" onClick={handleSelectAll}>
                    {selectedIds.length > 0 &&
                    selectedIds.length === filteredRecipients.length ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="p-3">Họ và tên</th>
                <th className="p-3">Số điện thoại (Zalo)</th>
                <th className="p-3">Email (Gmail)</th>
                <th className="p-3">Công ty / Tổ chức</th>
                <th className="p-3">Mã đơn / Tiền</th>
                <th className="p-3">Ngày hẹn</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-right">Tác vụ nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecipients.map((r) => {
                const isSelected = selectedIds.includes(r.id);
                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-50/70 transition ${
                      isSelected ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(r.id)}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                        )}
                      </button>
                    </td>

                    <td className="p-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-normal">
                          {r.danh_xung || 'Quý khách'}
                        </span>
                        <span>{r.ho_ten}</span>
                      </div>
                      {r.ghi_chu && (
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-xs">
                          {r.ghi_chu}
                        </div>
                      )}
                    </td>

                    <td className="p-3 font-mono font-medium text-blue-700">
                      {r.so_dien_thoai || '—'}
                    </td>

                    <td className="p-3 font-mono text-slate-600">
                      {r.email || '—'}
                    </td>

                    <td className="p-3 text-slate-800 font-medium">
                      {r.cong_ty || '—'}
                    </td>

                    <td className="p-3">
                      {r.ma_don && (
                        <span className="font-mono font-semibold text-slate-800">
                          {r.ma_don}
                        </span>
                      )}
                      {r.so_tien && (
                        <div className="text-[11px] text-rose-600 font-semibold">
                          {r.so_tien}
                        </div>
                      )}
                      {!r.ma_don && !r.so_tien && '—'}
                    </td>

                    <td className="p-3 text-slate-600">
                      {r.ngay_hen || '—'}
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          r.status === 'sent'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status === 'sent'
                          ? 'Đã gửi'
                          : r.status === 'failed'
                          ? 'Thất bại'
                          : 'Chưa gửi'}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.email && (
                          <button
                            type="button"
                            onClick={() => {
                              const url = getGmailComposeUrl(
                                r.email,
                                `Kính gửi ${r.danh_xung || ''} ${r.ho_ten}`,
                                `Xin chào ${r.ho_ten}`
                              );
                              window.open(url, '_blank');
                            }}
                            title="Mở soạn thư Gmail cho khách hàng này"
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {r.so_dien_thoai && (
                          <button
                            type="button"
                            onClick={() => {
                              const url = getZaloChatUrl(r.so_dien_thoai);
                              window.open(url, '_blank');
                            }}
                            title="Mở chat Zalo cá nhân"
                            className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-[#0068FF] rounded-lg transition"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRecipients.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                    Không có liên hệ nào trong danh sách
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Single Recipient */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Thêm Mới Liên Hệ Người Nhận</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSingle} className="p-5 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Danh xưng:
                  </label>
                  <select
                    value={newRecipient.danh_xung}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, danh_xung: e.target.value })
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white outline-none"
                  >
                    <option value="Anh">Anh</option>
                    <option value="Chị">Chị</option>
                    <option value="Bạn">Bạn</option>
                    <option value="Quý khách">Quý khách</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Họ và tên (*):
                  </label>
                  <input
                    type="text"
                    required
                    value={newRecipient.ho_ten}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, ho_ten: e.target.value })
                    }
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Số điện thoại (Zalo):
                  </label>
                  <input
                    type="tel"
                    value={newRecipient.so_dien_thoai}
                    onChange={(e) =>
                      setNewRecipient({
                        ...newRecipient,
                        so_dien_thoai: e.target.value
                      })
                    }
                    placeholder="0912345678"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email (Gmail):
                  </label>
                  <input
                    type="email"
                    value={newRecipient.email}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, email: e.target.value })
                    }
                    placeholder="an@example.com"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tên công ty / Tổ chức:
                  </label>
                  <input
                    type="text"
                    value={newRecipient.cong_ty}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, cong_ty: e.target.value })
                    }
                    placeholder="Công ty An Phát..."
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Mã đơn hàng / Mã KH:
                  </label>
                  <input
                    type="text"
                    value={newRecipient.ma_don}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, ma_don: e.target.value })
                    }
                    placeholder="DH-9901"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Số tiền / Giá trị:
                  </label>
                  <input
                    type="text"
                    value={newRecipient.so_tien}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, so_tien: e.target.value })
                    }
                    placeholder="2.500.000 VNĐ"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Ngày hẹn / Hạn chót:
                  </label>
                  <input
                    type="text"
                    value={newRecipient.ngay_hen}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, ngay_hen: e.target.value })
                    }
                    placeholder="20/11/2026"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ghi chú riêng:
                </label>
                <input
                  type="text"
                  value={newRecipient.ghi_chu}
                  onChange={(e) =>
                    setNewRecipient({ ...newRecipient, ghi_chu: e.target.value })
                  }
                  placeholder="Khách VIP, cần chăm sóc kỹ..."
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs"
                >
                  Lưu Liên Hệ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Import from Excel / CSV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 bg-blue-600 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                <span>Nhập Hàng Loạt Từ Excel / Google Sheets / CSV</span>
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                <strong>💡 Cách nhập nhanh:</strong> Bạn có thể copy (Ctrl+C) các cột từ Excel hoặc Google Sheets rồi dán (Ctrl+V) vào ô bên dưới. Thứ tự các cột khuyến nghị:
                <div className="mt-1 font-mono text-[11px] text-blue-700 font-semibold">
                  Họ tên | Số điện thoại | Email | Công ty | Danh xưng | Mã đơn | Số tiền | Ngày hẹn
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Dán dữ liệu vào đây:
                  </label>
                  <label className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Hoặc chọn file .csv / .txt từ máy tính</span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  rows={8}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`Nguyễn Văn An\t0912345678\tan@example.com\tAn Phát\tAnh\nTrần Thị Mai\t0987654321\tmai@example.com\tMai Khôi\tChị`}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  {importText.trim().split('\n').filter(Boolean).length} dòng phát hiện
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkImport}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs"
                  >
                    Tiến Hành Nhập Dữ Liệu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
