import React from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-05">
      <div className="bg-white w-[90%] max-w-2xl rounded shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[400px] overflow-y-auto text-sm space-y-3">
          {children}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t text-right">
          <button
            onClick={onClose}
            className="bg-teal-500 text-white px-4 py-1 rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
