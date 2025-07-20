// components/Accordion.jsx
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Accordion = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded mb-2 shadow-sm bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 text-left font-medium flex justify-between items-center bg-gray-100 hover:bg-gray-200"
      >
        <span className="text-black break-words">
          {title?.toString() || "Untitled Section"}
        </span>
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {open && <div className="px-4 py-3 border-t">{children}</div>}
    </div>
  );
};

export default Accordion;
