import { useEffect, useRef, useState } from "react";

export default function ActionDropdown({ options, onSelect }) {
  const dropdownRef = useRef();
  const [openUpwards, setOpenUpwards] = useState(false);

  useEffect(() => {
    const rect = dropdownRef.current?.getBoundingClientRect();

    if (rect && window.innerHeight - rect.bottom < 200) {
      setOpenUpwards(true);
    }

    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        onSelect(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 w-48 bg-white border rounded shadow-lg z-50 
      transition-all duration-150
      ${openUpwards ? "bottom-full mb-2" : "mt-2"}`}
    >
      {options.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
        >
          {item}
        </button>
      ))}
    </div>
  );
}