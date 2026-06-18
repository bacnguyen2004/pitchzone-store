import { useLocation } from "react-router-dom";

import { adminNavItems } from "../../config/adminNav";

function resolveNavIcon(pathname, icon) {
  if (icon) {
    return icon;
  }

  const match = adminNavItems.find((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  );

  return match?.Icon || null;
}

function AdminPageHeader({ title, description, action, icon }) {
  const { pathname } = useLocation();
  const Icon = resolveNavIcon(pathname, icon);

  return (
    <header className="admin-page-header">
      <div className="admin-page-header-main">
        {Icon && (
          <span className="admin-page-header-icon" aria-hidden>
            <Icon className="h-6 w-6" />
          </span>
        )}
        <div className="min-w-0">
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
      </div>
      {action && <div className="admin-page-header-action">{action}</div>}
    </header>
  );
}

export default AdminPageHeader;