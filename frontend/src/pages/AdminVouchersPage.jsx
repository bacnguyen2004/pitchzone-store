import { useEffect, useMemo, useState } from "react";

import {
  createAdminVoucher,
  deleteAdminVoucher,
  getAdminVouchers,
  normalizePageResponse,
  updateAdminVoucher,
} from "../api/admin";
import AdminAlert from "../components/admin/AdminAlert";
import AdminCreatePanel from "../components/admin/AdminCreatePanel";
import AdminDataSection from "../components/admin/AdminDataSection";
import AdminEmptyState from "../components/admin/AdminEmptyState";
import AdminLoading from "../components/admin/AdminLoading";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminToolbar from "../components/admin/AdminToolbar";
import AdminVoucherCard from "../components/admin/AdminVoucherCard";
import AdminVoucherFields from "../components/admin/AdminVoucherFields";
import { PlusIcon, TagIcon } from "../components/StoreIcons";
import { getCampaignStatus } from "../utils/adminStatus";
import { getApiErrorMessage } from "../utils/adminErrors";
import { fromDatetimeLocal, toDatetimeLocal } from "../utils/datetime";

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

function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

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

  const statusCounts = useMemo(() => {
    const counts = { running: 0, upcoming: 0, expired: 0, totalUses: 0 };
    vouchers.forEach((voucher) => {
      const campaignStatus = getCampaignStatus(voucher);
      if (campaignStatus.tone === "active") {
        counts.running += 1;
      } else if (campaignStatus.tone === "pending") {
        counts.upcoming += 1;
      } else if (campaignStatus.tone === "cancelled") {
        counts.expired += 1;
      }
      counts.totalUses += Number(voucher.used_count || 0);
    });
    return counts;
  }, [vouchers]);

  function updateFormField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateDraftField(voucherId, field, value) {
    setDrafts((current) => ({
      ...current,
      [voucherId]: {
        ...current[voucherId],
        [field]: value,
      },
    }));
  }

  async function createVoucher(event) {
    event.preventDefault();
    setIsCreating(true);
    setMessage("");
    setError("");

    try {
      await createAdminVoucher(buildPayload(form));
      setForm(defaultForm());
      setMessage("Đã tạo voucher.");
      await loadVouchers();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể tạo voucher."));
    } finally {
      setIsCreating(false);
    }
  }

  async function saveVoucher(voucherId) {
    setSavingId(voucherId);
    setMessage("");
    setError("");

    try {
      await updateAdminVoucher(voucherId, buildPayload(drafts[voucherId]));
      setMessage("Đã cập nhật voucher.");
      await loadVouchers();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể cập nhật voucher."));
    } finally {
      setSavingId(null);
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
    <div className="admin-vouchers-page">
      <section className="admin-deals-top">
        <AdminPageHeader
          title="Voucher"
          description="Tạo và quản lý mã giảm giá áp dụng khi thanh toán."
        />

        <div className="admin-deals-metrics">
          <article className="admin-deals-metric is-total">
            <span className="admin-deals-metric-label">Tổng mã</span>
            <span className="admin-deals-metric-value">{vouchers.length}</span>
          </article>
          <article className="admin-deals-metric is-running">
            <span className="admin-deals-metric-label">Đang chạy</span>
            <span className="admin-deals-metric-value">{statusCounts.running}</span>
          </article>
          <article className="admin-deals-metric is-upcoming">
            <span className="admin-deals-metric-label">Sắp diễn ra</span>
            <span className="admin-deals-metric-value">{statusCounts.upcoming}</span>
          </article>
          <article className="admin-deals-metric is-expired">
            <span className="admin-deals-metric-label">Đã hết hạn</span>
            <span className="admin-deals-metric-value">{statusCounts.expired}</span>
          </article>
        </div>
      </section>

      <AdminCreatePanel
        title="Thêm voucher mới"
        description="Mã áp dụng tại checkout — giảm % hoặc số tiền cố định."
        icon={PlusIcon}
      >
        <form onSubmit={createVoucher} className="admin-panel-body">
          <AdminVoucherFields
            values={form}
            onFieldChange={updateFormField}
            footerAction={
              <button
                type="submit"
                disabled={isCreating}
                className="admin-btn admin-btn-primary"
              >
                <PlusIcon className="h-4 w-4" />
                {isCreating ? "Đang tạo..." : "Tạo voucher"}
              </button>
            }
          />
        </form>
      </AdminCreatePanel>

      {message && <AdminAlert tone="success">{message}</AdminAlert>}
      {error && <AdminAlert tone="error">{error}</AdminAlert>}

      <AdminDataSection>
        <AdminToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm mã hoặc mô tả..."
          countLabel={`${filteredVouchers.length} / ${vouchers.length} mã · ${statusCounts.totalUses} lượt dùng`}
          onRefresh={loadVouchers}
          isRefreshing={status === "loading"}
        />

        {status === "loading" && <AdminLoading rows={3} variant="cards" />}

        {status === "success" && (
          <div className="admin-voucher-list">
            {filteredVouchers.length === 0 && (
              <AdminEmptyState
                icon={TagIcon}
                title="Chưa có voucher"
                description="Tạo mã giảm giá mới ở form phía trên."
              />
            )}

            {filteredVouchers.map((voucher) => (
              <AdminVoucherCard
                key={voucher.id}
                voucher={voucher}
                draft={drafts[voucher.id] || buildDraft(voucher)}
                voucherStatus={getCampaignStatus(voucher)}
                onFieldChange={(field, value) =>
                  updateDraftField(voucher.id, field, value)
                }
                onSave={() => saveVoucher(voucher.id)}
                onDelete={() => removeVoucher(voucher.id)}
                isSaving={savingId === voucher.id}
              />
            ))}
          </div>
        )}
      </AdminDataSection>
    </div>
  );
}

export default AdminVouchersPage;