import { Link } from "react-router-dom";

import { LogoutIcon } from "../AuthIcons";
import { profileSections } from "../../config/profileContent";

function getDisplayName(user) {
  return user?.customer_profile?.full_name?.trim() || user?.username;
}

function getInitial(user) {
  return getDisplayName(user).charAt(0).toUpperCase();
}

function ProfileSidebar({ user, activeSection, onSectionChange, onLogout }) {
  const displayName = getDisplayName(user);

  return (
    <div className="cart-summary profile-side-panel">
      <div className="profile-side-user">
        <span className="profile-side-avatar">{getInitial(user)}</span>
        <div className="min-w-0">
          <p className="profile-side-name">{displayName}</p>
          {user.email && <p className="profile-side-email">{user.email}</p>}
        </div>
      </div>

      <nav className="profile-side-nav" aria-label="Mục tài khoản">
        <ul>
          {profileSections.map((section) => {
            const { Icon } = section;
            const isActive = activeSection === section.id;

            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => onSectionChange(section.id)}
                  className={`profile-side-nav-btn${isActive ? " is-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{section.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="profile-side-foot">
        {user.is_staff && (
          <Link to="/admin" className="profile-side-admin">
            Khu quản trị
          </Link>
        )}
        <button type="button" onClick={onLogout} className="profile-side-logout">
          <LogoutIcon className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default ProfileSidebar;