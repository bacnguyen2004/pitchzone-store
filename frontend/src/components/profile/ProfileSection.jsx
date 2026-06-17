function ProfileSection({ title, description, children, action }) {
  return (
    <section className="profile-section">
      <header className="profile-content-head">
        <div className="min-w-0">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </header>
      <div className="profile-content-body">{children}</div>
    </section>
  );
}

export default ProfileSection;