import { Link } from "react-router-dom";

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionTo,
  actionLabel,
  secondaryActionTo,
  secondaryActionLabel,
  tone = "default",
  className = "",
}) {
  return (
    <section className={`page-empty-state is-${tone} ${className}`.trim()}>
      {Icon && (
        <span className="page-empty-state-icon" aria-hidden>
          <Icon className="h-9 w-9" />
        </span>
      )}
      <h2 className="page-empty-state-title">{title}</h2>
      {description && <p className="page-empty-state-desc">{description}</p>}
      {action}
      {(actionTo || secondaryActionTo) && (
        <div className="page-empty-state-actions">
          {actionTo && (
            <Link to={actionTo} className="btn-primary rounded-xl px-6 py-3">
              {actionLabel}
            </Link>
          )}
          {secondaryActionTo && (
            <Link to={secondaryActionTo} className="btn-secondary rounded-xl px-6 py-3">
              {secondaryActionLabel}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

export default EmptyState;