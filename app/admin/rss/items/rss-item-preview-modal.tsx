"use client";

import { RssItem } from "@/app/actions/rss";
import { X, CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface RssItemPreviewModalProps {
  item: RssItem;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export default function RssItemPreviewModal({
  item,
  onClose,
  onApprove,
  onReject,
}: RssItemPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">RSS Item Preview</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Image */}
          {item.image_url && (
            <div className="mb-6">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Title */}
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h3>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
            {item.author && (
              <span className="flex items-center gap-1">
                <strong>By:</strong> {item.author}
              </span>
            )}
            {item.published_at && (
              <span>
                {new Date(item.published_at).toLocaleDateString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <strong>From:</strong> {item.feed?.source_name || item.feed?.name}
            </span>
          </div>

          {/* Description */}
          {item.description && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Description
              </h4>
              <p className="text-gray-700 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Content */}
          {item.content && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Full Content
              </h4>
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            </div>
          )}

          {/* Source URL */}
          <div className="pt-4 border-t border-gray-200">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="w-4 h-4" />
              View Original Source
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            {item.status === "pending" && (
              <>
                <button
                  onClick={onApprove}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={onReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
