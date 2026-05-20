// components/PdfAttachment.jsx
// Clickable PDF/notes attachment card shown inside a post

import { FileText, Download } from "lucide-react";

export default function PdfAttachment({ pdf }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all group mt-3">
      {/* Icon */}
      <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-red-500" />
      </div>

      {/* Meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{pdf.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{pdf.size}</p>
      </div>

      {/* Download button */}
      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:border-indigo-300 transition-colors flex-shrink-0">
        <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
      </div>
    </div>
  );
}