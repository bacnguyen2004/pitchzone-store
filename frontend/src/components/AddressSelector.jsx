import { useEffect, useMemo, useState } from "react";

import {
  formatFullAddress,
  getProvinces,
  getWards,
} from "../api/address";
import { MapPinIcon } from "./StoreIcons";

const EMPTY_PARTS = {
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
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label} <span className="text-red-500">*</span>
      </span>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled || loading}
        required
        className="input-field mt-1.5 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
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

function AddressSelector({ onChange, onValidityChange }) {
  const [parts, setParts] = useState(EMPTY_PARTS);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState({
    provinces: true,
    wards: false,
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
  }, [parts.provinceCode]);

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

  const fullAddress = useMemo(
    () =>
      formatFullAddress({
        street: parts.street.trim(),
        wardName: labels.wardName,
        provinceName: labels.provinceName,
      }),
    [parts.street, labels],
  );

  const isComplete = Boolean(
    parts.street.trim() && parts.provinceCode && parts.wardCode,
  );

  useEffect(() => {
    onChange(fullAddress);
    onValidityChange?.(isComplete);
  }, [fullAddress, isComplete]);

  function handleProvinceChange(event) {
    setParts({
      street: parts.street,
      provinceCode: event.target.value,
      wardCode: "",
    });
  }

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          Số nhà, tên đường <span className="text-red-500">*</span>
        </span>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <MapPinIcon className="h-4 w-4" />
          </span>
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

      <div className="grid gap-5 sm:grid-cols-2">
        <AddressSelect
          label="Tỉnh / Thành phố"
          value={parts.provinceCode}
          onChange={handleProvinceChange}
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

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {isComplete && (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Địa chỉ giao hàng: </span>
          {fullAddress}
        </p>
      )}

      <p className="text-xs text-slate-400">
        Dữ liệu địa giới hành chính (v2) từ{" "}
        <a
          href="https://provinces.open-api.vn/api/v2/redoc"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:text-primary-hover"
        >
          provinces.open-api.vn
        </a>
      </p>
    </div>
  );
}

export default AddressSelector;