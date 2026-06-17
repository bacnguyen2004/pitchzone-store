import { Link } from "react-router-dom";

import { LogoutIcon } from "../AuthIcons";

function getDisplayName(user) {
  return user?.customer_profile?.full_name?.trim() || user?.username || "Thành viên";
}

function getInitial(user) {
  const name = getDisplayName(user);
  return name.charAt(0).toUpperCase();
}

function ProfileMemberCard({ user, onLogout, compact = false }) {
  const displayName = getDisplayName(user);

  if (compact) {
    return (
      <div className="profile-member-card is-compact">
        <div className="profile-member-top">
          <span className="profile-avatar profile-avatar-dark">
            {getInitial(user)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="profile-member-name">{displayName}</p>
            <p className="profile-member-meta">@{user.username}</p>
          </div>
          <button type="button" onClick={onLogout} className="profile-logout-compact">
            <LogoutIcon className="h-4 w-4" />
            <span className="sr-only">Đăng xuất</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-member-card">
      <div className="profile-member-top">
        <span className="profile-avatar profile-avatar-dark">
          {getInitial(user)}
        </span>
        <div className="min-w-0">
          <p className="profile-member-name">{displayName}</p>
          <p className="profile-member-meta">@{user.username}</p>
          {user.email && (
            <p className="profile-member-email">{user.email}</p>
          )}
        </div>
      </div>

      <div className="profile-member-badges">
        <span className="profile-member-badge">Thành viên PitchZone</span>
        {user.is_staff && (
          <span className="profile-member-badge is-admin">Quản trị</span>
        )}
      </div>

      <div className="profile-member-actions">
        {user.is_staff && (
          <Link to="/admin" className="profile-member-link">
            Vào khu quản trị
          </Link>
        )}
        <button type="button" onClick={onLogout} className="profile-logout">
          <LogoutIcon className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default ProfileMemberCard;