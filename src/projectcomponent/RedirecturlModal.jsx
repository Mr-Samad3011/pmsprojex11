"use client";

import { FaTimes } from "react-icons/fa";

export default function RedirectUrlsModal({ rid, onClose }) {
  const baseURL = "https://redirect.pursuitmindshare.com/landingpage";

  const urls = [
    { label: "Complete URL", query: `?stv=4&RID=${rid}` },
    { label: "Terminate URL", query: `?stv=5&RID=${rid}` },
    { label: "Quotaful URL", query: `?stv=6&RID=${rid}` },
    { label: "Security Term URL", query: `?stv=7&RID=${rid}` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[550px] p-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
        >
          <FaTimes size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Redirect URLs</h2>

        <div className="space-y-3">
          {urls.map(u => (
            <div key={u.label} className="flex items-center gap-3">
              <label className="w-40 text-sm font-medium">{u.label}</label>
              <input
                type="text"
                value={`${baseURL}${u.query}`}
                readOnly
                className="flex-1 border rounded px-2 py-1 text-sm bg-gray-100 cursor-pointer"
                onClick={(e) => e.target.select()}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-3 py-1 rounded text-sm hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
