import { useState, useRef, useEffect } from "react";

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  id: string;
  required?: boolean;
}

export default function LocationSelect({
  value,
  onChange,
  options,
  placeholder,
  id,
  required,
}: LocationSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div
      ref={ref}
      className="location-select-wrapper"
      data-open={open}
    >
      <button
        type="button"
        id={id}
        className={`location-select-trigger ${!value ? "placeholder" : ""}`}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? selected.label : placeholder}
        <svg
          className={`location-select-arrow ${open ? "open" : ""}`}
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <ul className="location-select-menu" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`location-select-item ${opt.value === value ? "selected" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
      {/* Hidden native select for form validation */}
      <select
        value={value}
        onChange={() => {}}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
        className="location-select-hidden"
      >
        <option value="" />
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} />
        ))}
      </select>
    </div>
  );
}
