import { ChevronRightIcon } from "./StoreIcons";

function InfoFaqItem({ item, isOpen, onToggle, compact = false }) {
  return (
    <div className="about-faq-item">
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-4 text-left transition hover:bg-primary-light/80 ${
          compact ? "px-4 py-3.5" : "px-5 py-4 sm:px-6 sm:py-5"
        }`}
        aria-expanded={isOpen}
      >
        <span
          className={`font-semibold text-slate-900 ${
            compact ? "text-sm" : "text-[15px] sm:text-base"
          }`}
        >
          {item.question}
        </span>
        <span
          className={`flex shrink-0 items-center justify-center rounded-lg border transition ${
            compact ? "h-6 w-6" : "h-7 w-7"
          } ${
            isOpen
              ? "rotate-90 border-primary/30 bg-primary-light text-primary"
              : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </span>
      </button>
      {isOpen && (
        <div
          className={`border-t border-slate-100 ${
            compact ? "px-4 pb-4 pt-3" : "px-5 pb-5 pt-4 sm:px-6"
          }`}
        >
          <p className="text-sm leading-7 text-slate-600">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default InfoFaqItem;