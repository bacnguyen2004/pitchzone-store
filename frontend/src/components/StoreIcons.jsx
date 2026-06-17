function IconBase({ children, className = "h-5 w-5", strokeWidth = 1.75 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      {typeof children === "function" ? children(strokeWidth) : children}
    </svg>
  );
}

function strokePath(d, strokeWidth = 1.75) {
  return (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d={d}
    />
  );
}

export function ChevronRightIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className} strokeWidth={2}>
      {(sw) => strokePath("M9 5l7 7-7 7", sw)}
    </IconBase>
  );
}

export function ChevronLeftIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className} strokeWidth={2}>
      {(sw) => strokePath("M15 6l-6 6 6 6", sw)}
    </IconBase>
  );
}

export function ChevronDownIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className} strokeWidth={2}>
      {(sw) => strokePath("M6 9l6 6 6-6", sw)}
    </IconBase>
  );
}

export function ArrowLeftIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => strokePath("M19 12H5M12 19l-7-7 7-7", sw)}
    </IconBase>
  );
}

export function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M10.5 10.5L16 16", sw)}
          <circle cx="11" cy="11" r="6" strokeWidth={sw} />
        </>
      )}
    </IconBase>
  );
}

export function FilterIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => strokePath("M4 6h16M7 12h10M10 18h4", sw)}
    </IconBase>
  );
}

export function SortIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M8 6v12M8 18l-3-3M8 18l3-3", sw)}
          {strokePath("M16 18V6M16 6l3 3M16 6l-3 3", sw)}
        </>
      )}
    </IconBase>
  );
}

export function CategoryIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M4 6h7v7H4V6zM13 6h7v4h-7V6zM13 14h7v4h-7v-4zM4 17h7v1H4v-1z", sw)}
        </>
      )}
    </IconBase>
  );
}

export function BrandIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M20 12V8l-8-5-8 5v4l8 5 8-5z", sw)}
          {strokePath("M4 8l8 5 8-5", sw)}
        </>
      )}
    </IconBase>
  );
}

export function PriceIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M12 3v18", sw)}
          {strokePath("M16.5 7.5c0 2-1.5 3-4.5 3s-4.5-1-4.5-3 1.5-3 4.5-3 4.5-1 4.5-3-1.5-3-4.5-3", sw)}
        </>
      )}
    </IconBase>
  );
}

export function ImagePlaceholderIcon({ className = "h-10 w-10" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M4 7h16v12H4V7zM4 15l4-4 3 3 2-2 5 5", sw)}
          <circle cx="9" cy="10" r="1.25" strokeWidth={sw} />
        </>
      )}
    </IconBase>
  );
}

export function InStockIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <IconBase className={className}>
      {(sw) => strokePath("M9 12l2 2 4-4M12 21a9 9 0 100-18 9 9 0 000 18z", sw)}
    </IconBase>
  );
}

export function LowStockIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M12 9v4", sw)}
          <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="none" />
          {strokePath("M10.3 4.7l-7 12A2 2 0 005 20h14a2 2 0 001.7-3.3l-7-12a2 2 0 00-3.4 0z", sw)}
        </>
      )}
    </IconBase>
  );
}

export function OutOfStockIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <IconBase className={className}>
      {(sw) => strokePath("M6 6l12 12M9 9l6 6M15 9l-6 6", sw)}
    </IconBase>
  );
}

export function ShieldCheckIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => strokePath("M9 12l2 2 4-4M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7l7-4z", sw)}
    </IconBase>
  );
}

export function TruckIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => strokePath("M3 7h11v8H3V7zm11 2h4l3 3v3h-7V9zM7 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z", sw)}
    </IconBase>
  );
}

export function ReturnBoxIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => strokePath("M4 7h13l3 5v5H4V7zm3 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8 7V5a3 3 0 016 0v2", sw)}
    </IconBase>
  );
}

export function SupportIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => strokePath("M4 6h16v10H8l-4 4V6zM8 10h8M8 13h5", sw)}
    </IconBase>
  );
}

export function SparklesIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M12 3l1.2 4.2L17.5 8.5 13.2 9.7 12 14l-1.2-4.3L6.5 8.5l4.3-1.3L12 3z", sw)}
          {strokePath("M5 14l.6 2.1L7.7 17l-2.1.6L5 20l-.6-2.4L2.3 17l2.1-.9L5 14z", sw)}
        </>
      )}
    </IconBase>
  );
}

export function GridIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className}>
      {(sw) => strokePath("M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z", sw)}
    </IconBase>
  );
}

export function TagIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M20 12l-8 8-9-9V4h7l10 8z", sw)}
          <circle cx="7.5" cy="7.5" r="1.25" strokeWidth={sw} />
        </>
      )}
    </IconBase>
  );
}

export function ProductsIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => strokePath("M6 8h12M6 12h12M6 16h8M4 5h16v14H4V5z", sw)}
    </IconBase>
  );
}

export function ResetIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M4 12a8 8 0 0113.5-5.7M20 8v4h-4", sw)}
          {strokePath("M20 12a8 8 0 01-13.5 5.7M4 16v-4h4", sw)}
        </>
      )}
    </IconBase>
  );
}

export function EmptyBoxIcon({ className = "h-10 w-10" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M4 7h16v12H4V7zM4 11h16", sw)}
          {strokePath("M9 15h.01M12 15h.01M15 15h.01", sw)}
        </>
      )}
    </IconBase>
  );
}

export function ContactIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => strokePath("M4 6h16v12H4V6zM4 7l8 6 8-6", sw)}
    </IconBase>
  );
}

export function PhoneIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => strokePath("M8 4h8l2 4v8l-4 2H8L6 14V8l2-4zM11 14h2", sw)}
    </IconBase>
  );
}

export function MapPinIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => (
        <>
          {strokePath("M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z", sw)}
          <circle cx="12" cy="10" r="2.25" strokeWidth={sw} />
        </>
      )}
    </IconBase>
  );
}

export function ClockIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => (
        <>
          <circle cx="12" cy="12" r="8" strokeWidth={sw} />
          {strokePath("M12 8v4l3 2", sw)}
        </>
      )}
    </IconBase>
  );
}

export function HomeIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z", sw)}
        </>
      )}
    </IconBase>
  );
}

export function PlusIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className} strokeWidth={2}>
      {(sw) => strokePath("M12 5v14M5 12h14", sw)}
    </IconBase>
  );
}

export function MinusIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className} strokeWidth={2}>
      {(sw) => strokePath("M5 12h14", sw)}
    </IconBase>
  );
}

export function TrashIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M4 7h16", sw)}
          {strokePath("M10 11v6M14 11v6", sw)}
          {strokePath("M6 7l1 12a1 1 0 001 1h8a1 1 0 001-1l1-12", sw)}
          {strokePath("M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2", sw)}
        </>
      )}
    </IconBase>
  );
}

export function PencilIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) =>
        strokePath("M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z", sw)
      }
    </IconBase>
  );
}

export function ViewIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z", sw)}
          {strokePath("M12 15a3 3 0 100-6 3 3 0 000 6z", sw)}
        </>
      )}
    </IconBase>
  );
}

export function PackageIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          {strokePath("M4 8l8-4 8 4v10l-8 4-8-4V8z", sw)}
          {strokePath("M12 12l8-4M12 12v10M12 12L4 8", sw)}
        </>
      )}
    </IconBase>
  );
}

export function InfoIcon({ className = "h-4 w-4" }) {
  return (
    <IconBase className={className}>
      {(sw) => (
        <>
          <circle cx="12" cy="12" r="8" strokeWidth={sw} />
          {strokePath("M12 10v6M12 8h.01", sw)}
        </>
      )}
    </IconBase>
  );
}

export function LaptopCategoryIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => (
        <>
          {strokePath("M4 7h16v10H4V7z", sw)}
          {strokePath("M2 17h20", sw)}
          {strokePath("M9 20h6", sw)}
        </>
      )}
    </IconBase>
  );
}

export function KeyboardCategoryIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => (
        <>
          {strokePath("M3 8h18v8H3V8z", sw)}
          {strokePath("M7 12h.01M11 12h.01M15 12h.01M7 15h10", sw)}
        </>
      )}
    </IconBase>
  );
}

export function MouseCategoryIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => (
        <>
          {strokePath("M8 5h8a4 4 0 014 4v7a7 7 0 01-14 0V9a4 4 0 014-4z", sw)}
          {strokePath("M12 5v5", sw)}
        </>
      )}
    </IconBase>
  );
}

export function HeadphoneCategoryIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => (
        <>
          {strokePath("M4 14v-2a8 8 0 0116 0v2", sw)}
          {strokePath("M4 14a2 2 0 00-2 2v1a2 2 0 002 2h2v-6H4zM20 14a2 2 0 012 2v1a2 2 0 01-2 2h-2v-6h2z", sw)}
        </>
      )}
    </IconBase>
  );
}

export function ChargerCategoryIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => (
        <>
          {strokePath("M13 2L8 12h4l-1 10 7-12h-4l1-8z", sw)}
          {strokePath("M5 18h14", sw)}
        </>
      )}
    </IconBase>
  );
}

export function BackpackCategoryIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => (
        <>
          {strokePath("M8 9V7a4 4 0 018 0v2", sw)}
          {strokePath("M6 9h12l1 12H5L6 9z", sw)}
          {strokePath("M9 14h6", sw)}
        </>
      )}
    </IconBase>
  );
}

export function FootballBootsCategoryIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => (
        <>
          {strokePath("M5 14c2-4 5-6 7-6s5 2 7 6", sw)}
          {strokePath("M7 14h10l-1 4H8l-1-4z", sw)}
          {strokePath("M9 10l1-3M15 10l-1-3", sw)}
        </>
      )}
    </IconBase>
  );
}

export function JerseyCategoryIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => (
        <>
          {strokePath("M8 6l4-2 4 2v3l3 2v9H5V11l3-2V6z", sw)}
          {strokePath("M12 6v15", sw)}
        </>
      )}
    </IconBase>
  );
}

export function ShortsCategoryIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => (
        <>
          {strokePath("M7 8h10v2l-1 8H8l-1-8V8z", sw)}
          {strokePath("M12 8v10", sw)}
        </>
      )}
    </IconBase>
  );
}

export function SocksCategoryIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => (
        <>
          {strokePath("M9 4h6v8c0 2-1 4-3 5l-2 3H8l-2-3c-2-1-3-3-3-5V4z", sw)}
          {strokePath("M9 8h6", sw)}
        </>
      )}
    </IconBase>
  );
}

export function BallCategoryIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => (
        <>
          <circle cx="12" cy="12" r="8" strokeWidth={sw} />
          {strokePath("M12 4v16M4 12h16M6 7l12 10M18 7L6 17", sw)}
        </>
      )}
    </IconBase>
  );
}

export function AccessoriesCategoryIcon({ className = "h-5 w-5" }) {
  return (
    <IconBase className={className} strokeWidth={1.5}>
      {(sw) => (
        <>
          {strokePath("M8 9V7a4 4 0 018 0v2", sw)}
          {strokePath("M6 9h12l1 10H5L6 9z", sw)}
          {strokePath("M10 14h4", sw)}
        </>
      )}
    </IconBase>
  );
}