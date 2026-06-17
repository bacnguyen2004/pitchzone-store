import { profileSections } from "../../config/profileContent";

function ProfileMobileNav({ activeSection, onChange }) {
  return (
    <nav className="profile-mobile-pills" aria-label="Mục tài khoản">
      {profileSections.map((section) => {
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(section.id)}
            className={`pill ${isActive ? "pill-active" : "pill-inactive"}`}
          >
            {section.label}
          </button>
        );
      })}
    </nav>
  );
}

export default ProfileMobileNav;