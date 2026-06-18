import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getOrders } from "../api/orders";
import { UserIcon } from "../components/AuthIcons";
import ProfileAccountForm from "../components/profile/ProfileAccountForm";
import ProfileAddresses from "../components/profile/ProfileAddresses";
import ProfileHero from "../components/profile/ProfileHero";
import ProfileMobileNav from "../components/profile/ProfileMobileNav";
import ProfilePasswordForm from "../components/profile/ProfilePasswordForm";
import ProfileSection from "../components/profile/ProfileSection";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import { useAuth } from "../contexts/AuthContext";
import { profileSections } from "../config/profileContent";
import { formatCurrency } from "../utils/format";
import { buildProductsUrl } from "../utils/productFilters";
import { ChevronRightIcon } from "../components/StoreIcons";

const orderStatusLabel = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const orderStatusClass = {
  pending: "profile-order-status is-pending",
  processing: "profile-order-status is-processing",
  shipping: "profile-order-status is-shipping",
  completed: "profile-order-status is-completed",
  cancelled: "profile-order-status is-cancelled",
};

function getDisplayName(user) {
  return user?.customer_profile?.full_name?.trim() || user?.username;
}

function ProfileOrdersContent({ dataStatus, recentOrders }) {
  if (dataStatus === "loading") {
    return <p className="text-sm text-slate-500">Đang tải...</p>;
  }

  if (recentOrders.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Chưa có đơn hàng.{" "}
        <Link to={buildProductsUrl()} className="font-medium text-primary">
          Xem sản phẩm
        </Link>
      </p>
    );
  }

  return (
    <ul className="profile-orders">
      {recentOrders.map((order) => (
        <li key={order.id}>
          <Link to={`/orders/${order.id}`} className="profile-order-row">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="profile-order-id">#{order.id}</span>
                <span
                  className={
                    orderStatusClass[order.status] || orderStatusClass.pending
                  }
                >
                  {orderStatusLabel[order.status] || order.status}
                </span>
              </div>
              <p className="profile-order-meta">
                {new Date(order.created_at).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div className="profile-order-end">
              <span className="profile-order-price">
                {formatCurrency(order.total_price)}
              </span>
              <ChevronRightIcon className="h-4 w-4 text-slate-300" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ProfileSkeleton() {
  return (
    <main className="cart-page">
      <div className="skeleton-shimmer h-36" />
      <div className="cart-page-body">
        <div className="page-container py-8 sm:py-10">
          <div className="checkout-layout profile-layout">
            <div className="checkout-panel-skeleton skeleton-shimmer" />
            <div className="checkout-panel-skeleton skeleton-shimmer hidden lg:block" />
          </div>
        </div>
      </div>
    </main>
  );
}

function GuestProfile() {
  return (
    <main className="cart-page">
      <ProfileHero
        title="Tài khoản"
        subtitle="Đăng nhập để quản lý thông tin và đơn hàng."
      />
      <div className="page-container py-12">
        <div className="cart-guest-panel">
          <span className="cart-guest-icon">
            <UserIcon className="h-8 w-8" />
          </span>
          <h2>Chưa đăng nhập</h2>
          <p>Đăng nhập để sửa thông tin, địa chỉ và xem đơn hàng.</p>
          <div className="cart-guest-actions">
            <Link to="/login" className="btn-primary rounded-xl px-7 py-3">
              Đăng nhập
            </Link>
            <Link to="/register" className="btn-secondary rounded-xl px-7 py-3">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProfilePage() {
  const { user, isAuthenticated, status, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("account");
  const [orders, setOrders] = useState([]);
  const [dataStatus, setDataStatus] = useState("loading");

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    async function loadProfileData() {
      setDataStatus("loading");

      try {
        const orderData = await getOrders();
        setOrders(orderData);
        setDataStatus("success");
      } catch {
        setOrders([]);
        setDataStatus("error");
      }
    }

    loadProfileData();
  }, [isAuthenticated]);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const activeMeta = profileSections.find(
    (section) => section.id === activeSection,
  );

  if (status === "loading") {
    return <ProfileSkeleton />;
  }

  if (!isAuthenticated) {
    return <GuestProfile />;
  }

  return (
    <main className="cart-page pb-12">
      <ProfileHero
        title={`Xin chào, ${getDisplayName(user)}`}
        subtitle="Quản lý tài khoản PitchZone"
      />

      <div className="cart-page-body">
        <div className="page-container py-8 sm:py-10">
          {dataStatus === "error" && (
            <p role="alert" className="cart-error">
              Không tải được dữ liệu. Vui lòng tải lại trang.
            </p>
          )}

          <ProfileMobileNav
            activeSection={activeSection}
            onChange={setActiveSection}
          />

          <section className="checkout-layout profile-layout">
            <div className="checkout-panel">
              {activeSection === "account" && activeMeta && (
                <ProfileSection
                  title={activeMeta.label}
                  description={activeMeta.description}
                >
                  <ProfileAccountForm
                    user={user}
                    onGoToAddresses={() => setActiveSection("addresses")}
                  />
                </ProfileSection>
              )}

              {activeSection === "password" && activeMeta && (
                <ProfileSection
                  title={activeMeta.label}
                  description={activeMeta.description}
                >
                  <ProfilePasswordForm />
                </ProfileSection>
              )}

              {activeSection === "addresses" && activeMeta && (
                <ProfileSection
                  title={activeMeta.label}
                  description={activeMeta.description}
                >
                  <ProfileAddresses />
                </ProfileSection>
              )}

              {activeSection === "orders" && activeMeta && (
                <ProfileSection
                  title={activeMeta.label}
                  description={activeMeta.description}
                  action={
                    <Link to="/orders" className="link-action shrink-0 text-sm">
                      Tất cả
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                  }
                >
                  <ProfileOrdersContent
                    dataStatus={dataStatus}
                    recentOrders={recentOrders}
                  />
                </ProfileSection>
              )}
            </div>

            <aside className="checkout-aside">
              <ProfileSidebar
                user={user}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                onLogout={logout}
              />
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;