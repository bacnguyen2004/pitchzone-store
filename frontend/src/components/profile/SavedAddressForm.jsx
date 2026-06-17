import { useEffect, useMemo, useState } from "react";

import { getProvinces, getWards } from "../../api/address";
import AuthField from "../AuthField";
import { UserIcon } from "../AuthIcons";
import { MapPinIcon, PhoneIcon } from "../StoreIcons";

const emptyParts = {
  street: "",
  provinceCode: "",
  wardCode: "",
};

function AddressSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  loading,
}) {
  return (
    <label className="checkout-field">
      <span>
        {label} <span className="text-red-500">*</span>
      </span>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled || loading}
        required
        className="input-field mt-0 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        <option value="">{loading ? "Đang tải..." : placeholder}</option>
        {options.map((option) => (
          <option key={option.code} value={String(option.code)}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function SavedAddressForm({
  initialValues = null,
  submitLabel = "Thêm địa chỉ",
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    is_default: false,
  });
  const [parts, setParts] = useState(emptyParts);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState({
    provinces: true,
    wards: false,
    submit: false,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProvinces() {
      setLoading((current) => ({ ...current, provinces: true }));
      setError("");

      try {
        const data = await getProvinces();
        if (!ignore) {
          setProvinces(data);
        }
      } catch {
        if (!ignore) {
          setError("Không tải được danh sách tỉnh/thành.");
        }
      } finally {
        if (!ignore) {
          setLoading((current) => ({ ...current, provinces: false }));
        }
      }
    }

    loadProvinces();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!initialValues || provinces.length === 0) {
      return;
    }

    const province = provinces.find((item) => item.name === initialValues.city);

    setForm({
      full_name: initialValues.full_name || "",
      phone: initialValues.phone || "",
      is_default: Boolean(initialValues.is_default),
    });
    setParts({
      street: initialValues.street_address || "",
      provinceCode: province ? String(province.code) : "",
      wardCode: "",
    });
  }, [initialValues, provinces]);

  useEffect(() => {
    if (!parts.provinceCode) {
      setWards([]);
      return undefined;
    }

    let ignore = false;

    async function loadWards() {
      setLoading((current) => ({ ...current, wards: true }));
      setError("");

      try {
        const data = await getWards(parts.provinceCode);

        if (!ignore) {
          setWards(data);

          if (initialValues?.ward) {
            const ward = data.find((item) => item.name === initialValues.ward);
            if (ward) {
              setParts((current) => ({
                ...current,
                wardCode: String(ward.code),
              }));
            }
          }
        }
      } catch {
        if (!ignore) {
          setError("Không tải được danh sách phường/xã.");
          setWards([]);
        }
      } finally {
        if (!ignore) {
          setLoading((current) => ({ ...current, wards: false }));
        }
      }
    }

    loadWards();

    return () => {
      ignore = true;
    };
  }, [parts.provinceCode, initialValues?.ward]);

  const labels = useMemo(() => {
    const province = provinces.find(
      (item) => String(item.code) === String(parts.provinceCode),
    );
    const ward = wards.find(
      (item) => String(item.code) === String(parts.wardCode),
    );

    return {
      provinceName: province?.name || "",
      wardName: ward?.name || "",
    };
  }, [provinces, wards, parts.provinceCode, parts.wardCode]);

  function updateForm(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!parts.street.trim() || !parts.provinceCode || !parts.wardCode) {
      setError("Vui lòng nhập đầy đủ địa chỉ giao hàng.");
      return;
    }

    setLoading((current) => ({ ...current, submit: true }));

    try {
      await onSubmit({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        street_address: parts.street.trim(),
        ward: labels.wardName,
        city: labels.provinceName,
        is_default: form.is_default,
      });
    } finally {
      setLoading((current) => ({ ...current, submit: false }));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="profile-form profile-address-form">
      <div className="profile-form-grid">
        <AuthField
          label="Người nhận"
          name="full_name"
          value={form.full_name}
          onChange={updateForm}
          icon={<UserIcon className="h-4 w-4" />}
          autoComplete="name"
        />
        <AuthField
          label="Số điện thoại"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={updateForm}
          icon={<PhoneIcon className="h-4 w-4" />}
          autoComplete="tel"
        />
      </div>

      <label className="checkout-field">
        <span>
          Số nhà, tên đường <span className="text-red-500">*</span>
        </span>
        <div className="checkout-field-icon">
          <MapPinIcon className="h-4 w-4" />
          <input
            name="street"
            value={parts.street}
            onChange={(event) =>
              setParts((current) => ({
                ...current,
                street: event.target.value,
              }))
            }
            required
            autoComplete="street-address"
            placeholder="Ví dụ: 123 Nguyễn Huệ"
            className="input-field pl-10"
          />
        </div>
      </label>

      <div className="profile-form-grid">
        <AddressSelect
          label="Tỉnh / Thành phố"
          value={parts.provinceCode}
          onChange={(event) =>
            setParts((current) => ({
              ...current,
              provinceCode: event.target.value,
              wardCode: "",
            }))
          }
          options={provinces}
          placeholder="Chọn tỉnh/thành"
          loading={loading.provinces}
        />
        <AddressSelect
          label="Phường / Xã"
          value={parts.wardCode}
          onChange={(event) =>
            setParts((current) => ({
              ...current,
              wardCode: event.target.value,
            }))
          }
          options={wards}
          placeholder="Chọn phường/xã"
          disabled={!parts.provinceCode}
          loading={loading.wards}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          name="is_default"
          type="checkbox"
          checked={form.is_default}
          onChange={updateForm}
        />
        Đặt làm địa chỉ mặc định
      </label>

      {error && (
        <p role="alert" className="cart-error">
          {error}
        </p>
      )}

      <div className="profile-form-actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary rounded-xl px-6 py-2.5"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={loading.submit}
          className="btn-primary rounded-xl px-6 py-2.5 disabled:opacity-60"
        >
          {loading.submit ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default SavedAddressForm;