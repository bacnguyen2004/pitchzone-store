import { useCallback, useEffect, useState } from "react";

import {
  createUserAddress,
  deleteUserAddress,
  getUserAddresses,
  updateUserAddress,
} from "../../api/userAddresses";
import AuthAlert from "../AuthAlert";
import { MapPinIcon, TrashIcon } from "../StoreIcons";
import { parseProfileError } from "../../utils/authErrors";
import SavedAddressForm from "./SavedAddressForm";

function ProfileAddresses({ onAddressChange = undefined }) {
  const [addresses, setAddresses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [alert, setAlert] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadAddresses = useCallback(async () => {
    setStatus("loading");

    try {
      const data = await getUserAddresses();
      setAddresses(data);
      onAddressChange?.(data.length);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  async function handleCreate(payload) {
    setAlert(null);

    try {
      await createUserAddress(payload);
      setShowAddForm(false);
      setAlert({
        tone: "success",
        title: "Đã thêm địa chỉ",
        messages: ["Địa chỉ giao hàng mới đã được lưu."],
      });
      await loadAddresses();
    } catch (error) {
      setAlert(parseProfileError(error));
    }
  }

  async function handleUpdate(addressId, payload) {
    setAlert(null);

    try {
      await updateUserAddress(addressId, payload);
      setEditingId(null);
      setAlert({
        tone: "success",
        title: "Đã cập nhật địa chỉ",
        messages: ["Thông tin địa chỉ đã được lưu."],
      });
      await loadAddresses();
    } catch (error) {
      setAlert(parseProfileError(error));
    }
  }

  async function handleDelete(addressId) {
    if (!window.confirm("Xóa địa chỉ này?")) {
      return;
    }

    setAlert(null);

    try {
      await deleteUserAddress(addressId);
      if (editingId === addressId) {
        setEditingId(null);
      }
      setAlert({
        tone: "success",
        title: "Đã xóa địa chỉ",
        messages: ["Địa chỉ đã được xóa khỏi tài khoản."],
      });
      await loadAddresses();
    } catch (error) {
      setAlert(parseProfileError(error));
    }
  }

  async function handleSetDefault(addressId) {
    setAlert(null);

    try {
      await updateUserAddress(addressId, { is_default: true });
      setAlert({
        tone: "success",
        title: "Đã đặt mặc định",
        messages: ["Địa chỉ mặc định đã được cập nhật."],
      });
      await loadAddresses();
    } catch (error) {
      setAlert(parseProfileError(error));
    }
  }

  return (
    <div className="space-y-4">
      {alert && (
        <AuthAlert
          tone={alert.tone || "error"}
          title={alert.title}
          messages={alert.messages}
        />
      )}

      {status === "loading" && (
        <p className="text-sm text-slate-500">Đang tải địa chỉ...</p>
      )}

      {status === "error" && (
        <p role="alert" className="cart-error">
          Không tải được danh sách địa chỉ.
        </p>
      )}

      {status === "success" && addresses.length === 0 && !showAddForm && (
        <p className="text-sm text-slate-500">
          Chưa có địa chỉ. Bấm bên dưới để thêm.
        </p>
      )}

      {status === "success" && addresses.length > 0 && (
        <ul className="profile-address-list">
          {addresses.map((address) => (
            <li
              key={address.id}
              className={`profile-address-card${
                address.is_default ? " is-default" : ""
              }`}
            >
              {editingId === address.id ? (
                <SavedAddressForm
                  initialValues={address}
                  submitLabel="Lưu địa chỉ"
                  onSubmit={(payload) => handleUpdate(address.id, payload)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {address.full_name}
                      </p>
                      {address.is_default && (
                        <span className="profile-address-badge">Mặc định</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{address.phone}</p>
                    <p className="mt-2 flex items-start gap-2 text-sm text-slate-700">
                      <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{address.full_address}</span>
                    </p>
                  </div>

                  <div className="profile-address-actions">
                    {!address.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address.id)}
                        className="btn-secondary rounded-lg px-3 py-1.5 text-sm"
                      >
                        Đặt mặc định
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingId(address.id);
                      }}
                      className="btn-secondary rounded-lg px-3 py-1.5 text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(address.id)}
                      className="profile-address-delete"
                      aria-label="Xóa địa chỉ"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {showAddForm ? (
        <SavedAddressForm
          submitLabel="Thêm địa chỉ"
          onSubmit={handleCreate}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setShowAddForm(true);
          }}
          className="profile-add-btn"
        >
          Thêm địa chỉ mới
        </button>
      )}
    </div>
  );
}

export default ProfileAddresses;