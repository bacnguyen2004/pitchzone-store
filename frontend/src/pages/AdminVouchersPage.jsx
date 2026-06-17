import { useEffect, useMemo, useState } from "react";

import {
  createAdminVoucher,
  deleteAdminVoucher,
  getAdminVouchers,
  normalizePageResponse,
  updateAdminVoucher,
} from "../api/admin";
import AdminAlert from "../components/admin/AdminAlert";
import AdminLoading from "../components/admin/AdminLoading";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminStatusBadge from "../components/admin/AdminStatusBadge";
import AdminToolbar from "../components/admin/AdminToolbar";
import { getCampaignStatus } from "../utils/adminStatus";
import { getApiErrorMessage } from "../utils/adminErrors";
import { fromDatetimeLocal, toDatetimeLocal } from "../utils/datetime";
import { formatCurrency } from "../utils/format";

function defaultForm() {
  const starts = new Date();
  const ends = new Date(starts.getTime() + 90 * 24 * 60 * 60 * 1000);

  return {
    code: "",
    description: "",
    discount_type: "percent",
    discount_value: "10",
    min_order_amount: "500000",
    max_discount_amount: "200000",
    starts_at: toDatetimeLocal(starts.toISOString()),
    ends_at: toDatetimeLocal(ends.toISOString()),
    is_active: true,
    usage_limit: "",
  };
}

function buildDraft(voucher) {
  return {
    code: voucher.code || "",
    description: voucher.description || "",
    discount_type: voucher.discount_type || "percent",
    discount_value: voucher.discount_value || "",
    min_order_amount: voucher.min_order_amount || "0",
    max_discount_amount: voucher.max_discount_amount ?? "",
    starts_at: toDatetimeLocal(voucher.starts_at),
    ends_at: toDatetimeLocal(voucher.ends_at),
    is_active: Boolean(voucher.is_active),
    usage_limit: voucher.usage_limit ?? "",
  };
}

function buildPayload(draft) {
  return {
    code: draft.code.trim().toUpperCase(),
    description: draft.description,
    discount_type: draft.discount_type,
    discount_value: Number(draft.discount_value),
    min_order_amount: Number(draft.min_order_amount || 0),
    max_discount_amount: draft.max_discount_amount
      ? Number(draft.max_discount_amount)
      : null,
    starts_at: fromDatetimeLocal(draft.starts_at),
    ends_at: fromDatetimeLocal(draft.ends_at),
    is_active: draft.is_active,
    usage_limit: draft.usage_limit ? Number(draft.usage_limit) : null,
  };
}

function formatOffer(voucher) {
  if (voucher.discount_type === "fixed") {
    return formatCurrency(voucher.discount_value);
  }

  return `${Number(voucher.discount_value)}%`;
}

function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadVouchers() {
    setStatus("loading");
    setError("");

    try {
      const data = await getAdminVouchers({ page_size: 100 });
      const list = normalizePageResponse(data).results;
      setVouchers(list);
      setDrafts(
        Object.fromEntries(
          list.map((voucher) => [voucher.id, buildDraft(voucher)]),
        ),
      );
      setStatus("success");
    } catch {
      setError("Không tải được danh sách voucher.");
      setStatus("error");
    }
  }

  useEffect(() => {
    loadVouchers();
  }, []);

  const filteredVouchers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return vouchers;
    }

    return vouchers.filter((voucher) =>
      `${voucher.code} ${voucher.description}`.toLowerCase().includes(keyword),
    );
  }, [vouchers, search]);

  function updateForm(event) {
    const { name, value, type, checked } = event.target;
    const nextValue =
      type === "checkbox"
        ? checked
        : name === "code"
          ? value.toUpperCase()
          : value;

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }));
  }

  function updateDraft(voucherId, field, value) {
    setDrafts((current) => ({
      ...current,
      [voucherId]: {
        ...current[voucherId],
        [field]: field === "code" ? String(value).toUpperCase() : value,
      },
    }));
  }

  async function createVoucher(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await createAdminVoucher(buildPayload(form));
      setForm(defaultForm());
      setMessage("Đã tạo voucher.");
      await loadVouchers();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể tạo voucher."));
    }
  }

  async function saveVoucher(voucherId) {
    setMessage("");
    setError("");

    try {
      await updateAdminVoucher(voucherId, buildPayload(drafts[voucherId]));
      setMessage("Đã cập nhật voucher.");
      await loadVouchers();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể cập nhật voucher."));
    }
  }

  async function removeVoucher(voucherId) {
    if (!window.confirm("Xóa voucher này?")) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deleteAdminVoucher(voucherId);
      setMessage("Đã xóa voucher.");
      await loadVouchers();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể xóa voucher."));
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Voucher"
        description="Tạo và quản lý mã giảm giá áp dụng khi thanh toán."
      />

      <section className="admin-panel mt-6">
        <header className="admin-panel-head">
          <h2>Thêm voucher</h2>
        </header>
        <form onSubmit={createVoucher} className="admin-panel-body">
          <div className="admin-form-grid">
            <input
              name="code"
              value={form.code}
              onChange={updateForm}
              placeholder="Mã — VD: PITCH10"
              className="admin-input font-mono uppercase"
              required
            />
            <input
              name="description"
              value={form.description}
              onChange={updateForm}
              placeholder="Mô tả hiển thị"
              className="admin-input"
            />
            <select
              name="discount_type"
              value={form.discount_type}
              onChange={updateForm}
              className="admin-select"
            >
              <option value="percent">Giảm %</option>
              <option value="fixed">Giảm cố định</option>
            </select>
            <input
              name="discount_value"
              type="number"
              min="0"
              value={form.discount_value}
              onChange={updateForm}
              className="admin-input"
              required
            />
            <input
              name="min_order_amount"
              type="number"
              min="0"
              value={form.min_order_amount}
              onChange={updateForm}
              placeholder="Đơn tối thiểu"
              className="admin-input"
            />
            <input
              name="max_discount_amount"
              type="number"
              min="0"
              value={form.max_discount_amount}
              onChange={updateForm}
              placeholder="Giảm tối đa (%)"
              className="admin-input"
            />
            <input
              name="starts_at"
              type="datetime-local"
              value={form.starts_at}
              onChange={updateForm}
              className="admin-input"
              required
            />
            <input
              name="ends_at"
              type="datetime-local"
              value={form.ends_at}
              onChange={updateForm}
              className="admin-input"
              required
            />
            <input
              name="usage_limit"
              type="number"
              min="1"
              value={form.usage_limit}
              onChange={updateForm}
              placeholder="Giới hạn lượt dùng"
              className="admin-input"
            />
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                name="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={updateForm}
              />
              Đang bật
            </label>
            <button type="submit" className="admin-btn admin-btn-primary">
              Tạo voucher
            </button>
          </div>
        </form>
      </section>

      {message && <AdminAlert tone="success">{message}</AdminAlert>}
      {error && <AdminAlert tone="error">{error}</AdminAlert>}

      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm mã voucher..."
        countLabel={`${filteredVouchers.length} / ${vouchers.length} voucher`}
        onRefresh={loadVouchers}
        isRefreshing={status === "loading"}
      />

      {status === "loading" && <AdminLoading rows={5} columns={5} />}

      {status === "success" && (
        <div className="admin-table-wrap mt-4">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Ưu đãi</th>
                  <th>Điều kiện</th>
                  <th>Hiệu lực</th>
                  <th>Lượt dùng</th>
                  <th>Hiệu lực</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <p className="admin-empty">Chưa có voucher.</p>
                    </td>
                  </tr>
                )}

                {filteredVouchers.map((voucher) => {
                  const voucherStatus = getCampaignStatus(voucher);

                  return (
                  <tr key={voucher.id}>
                    <td>
                      <input
                        value={drafts[voucher.id]?.code || ""}
                        onChange={(event) =>
                          updateDraft(voucher.id, "code", event.target.value)
                        }
                        className="admin-input min-w-28 font-mono uppercase"
                      />
                    </td>
                    <td>
                      <select
                        value={drafts[voucher.id]?.discount_type || "percent"}
                        onChange={(event) =>
                          updateDraft(
                            voucher.id,
                            "discount_type",
                            event.target.value,
                          )
                        }
                        className="admin-select min-w-28"
                      >
                        <option value="percent">%</option>
                        <option value="fixed">Cố định</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={drafts[voucher.id]?.discount_value || ""}
                        onChange={(event) =>
                          updateDraft(
                            voucher.id,
                            "discount_value",
                            event.target.value,
                          )
                        }
                        className="admin-input mt-2 w-28"
                      />
                      <p className="admin-table-sub mt-1">
                        {formatOffer({
                          discount_type: drafts[voucher.id]?.discount_type,
                          discount_value: drafts[voucher.id]?.discount_value,
                        })}
                      </p>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={drafts[voucher.id]?.min_order_amount || ""}
                        onChange={(event) =>
                          updateDraft(
                            voucher.id,
                            "min_order_amount",
                            event.target.value,
                          )
                        }
                        className="admin-input w-32"
                        placeholder="Đơn tối thiểu"
                      />
                    </td>
                    <td className="min-w-44 space-y-2">
                      <input
                        type="datetime-local"
                        value={drafts[voucher.id]?.starts_at || ""}
                        onChange={(event) =>
                          updateDraft(
                            voucher.id,
                            "starts_at",
                            event.target.value,
                          )
                        }
                        className="admin-input"
                      />
                      <input
                        type="datetime-local"
                        value={drafts[voucher.id]?.ends_at || ""}
                        onChange={(event) =>
                          updateDraft(
                            voucher.id,
                            "ends_at",
                            event.target.value,
                          )
                        }
                        className="admin-input"
                      />
                    </td>
                    <td>
                      {voucher.used_count}
                      {voucher.usage_limit ? ` / ${voucher.usage_limit}` : ""}
                    </td>
                    <td>
                      <AdminStatusBadge
                        label={voucherStatus.label}
                        tone={voucherStatus.tone}
                      />
                      <label className="mt-2 flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={Boolean(drafts[voucher.id]?.is_active)}
                          onChange={(event) =>
                            updateDraft(
                              voucher.id,
                              "is_active",
                              event.target.checked,
                            )
                          }
                        />
                        Bật mã
                      </label>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          type="button"
                          onClick={() => saveVoucher(voucher.id)}
                          className="admin-btn admin-btn-primary"
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVoucher(voucher.id)}
                          className="admin-btn admin-btn-danger"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminVouchersPage;