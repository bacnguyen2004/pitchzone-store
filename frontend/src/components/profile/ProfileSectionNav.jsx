import { profileSections } from "../../config/profileContent";

function ProfileSectionNav({ activeSection, onChange, variant = "sidebar" }) {
  const isTabs = variant === "tabs";

  return (
    <nav
      className={isTabs ? "profile-nav is-tabs" : "profile-nav"}
      aria-label="Mục tài khoản"
    >
      <ul className={isTabs ? "profile-nav-list is-tabs" : "profile-nav-list"}>
        {profileSections.map((section) => {
          const { Icon } = section;
          const isActive = activeSection === section.id;

          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onChange(section.id)}
                className={`profile-nav-btn${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="profile-nav-icon" />
                <span>{section.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default ProfileSectionNav;