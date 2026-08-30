"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HomepageSection,
  deleteHomepageSection,
  toggleHomepageSectionStatus,
} from "@/app/actions/homepage";
import {
  Edit,
  Trash2,
  Power,
  PowerOff,
  GripVertical,
  Layers,
  Grid3x3,
  List,
  Image as ImageIcon,
  Calendar,
  User,
  FileText,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface HomepageSectionsClientProps {
  initialSections: HomepageSection[];
}

export default function HomepageSectionsClient({
  initialSections,
}: HomepageSectionsClientProps) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = confirm(
      `Delete section: "${name}"?\n\nThis will remove all items in this section. This cannot be undone.`
    );
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const result = await deleteHomepageSection(id);
      if (result.success) {
        setSections((prev) => prev.filter((section) => section.id !== id));
        alert("Section deleted successfully");
        router.refresh();
      } else {
        alert(`Failed to delete: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Failed to delete section");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setIsProcessing(true);
    try {
      const result = await toggleHomepageSectionStatus(id, !currentStatus);
      if (result.data) {
        setSections((prev) =>
          prev.map((section) =>
            section.id === id ? { ...section, is_enabled: !currentStatus } : section
          )
        );
        router.refresh();
      } else {
        alert(`Failed to toggle status: ${result.error}`);
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to toggle status");
    } finally {
      setIsProcessing(false);
    }
  };

  const getSectionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      featured: "Featured",
      latest: "Latest News",
      trending: "Trending",
      category: "Category",
      custom: "Custom",
    };
    return labels[type] || type;
  };

  const getSectionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      featured: "bg-purple-100 text-purple-700",
      latest: "bg-blue-100 text-blue-700",
      trending: "bg-orange-100 text-orange-700",
      category: "bg-green-100 text-green-700",
      custom: "bg-gray-100 text-gray-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const getLayoutIcon = (layout: string) => {
    switch (layout) {
      case "grid":
        return <Grid3x3 className="w-4 h-4" />;
      case "list":
        return <List className="w-4 h-4" />;
      case "carousel":
        return <Layers className="w-4 h-4" />;
      case "hero":
        return <ImageIcon className="w-4 h-4" />;
      default:
        return <Grid3x3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Sections</p>
          <p className="text-2xl font-bold text-gray-900">{sections.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Enabled</p>
          <p className="text-2xl font-bold text-green-600">
            {sections.filter((s) => s.is_enabled).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Featured</p>
          <p className="text-2xl font-bold text-purple-600">
            {sections.filter((s) => s.section_type === "featured").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Custom</p>
          <p className="text-2xl font-bold text-gray-600">
            {sections.filter((s) => s.section_type === "custom").length}
          </p>
        </div>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {sections.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No homepage sections created yet</p>
            <Link
              href="/admin/homepage/sections/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Layout
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Settings
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sections.map((section) => (
                  <tr key={section.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full font-bold text-sm">
                          {section.display_order}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {section.name}
                        </p>
                        {section.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {section.description}
                          </p>
                        )}
                        {section.category && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            Category: {section.category.name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getSectionTypeColor(
                          section.section_type
                        )}`}
                      >
                        {getSectionTypeLabel(section.section_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        {getLayoutIcon(section.configuration?.layout_style || 'grid')}
                        <span className="capitalize">{section.configuration?.layout_style || 'grid'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          Max: {section.configuration?.max_items || 6}
                        </span>
                        {section.configuration?.show_images && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            Images
                          </span>
                        )}
                        {section.configuration?.show_excerpt && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Excerpt
                          </span>
                        )}
                        {section.configuration?.show_author && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Author
                          </span>
                        )}
                        {section.configuration?.show_date && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Date
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {section.is_enabled ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Enabled
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleToggleStatus(section.id, section.is_enabled)
                          }
                          disabled={isProcessing}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                            section.is_enabled
                              ? "text-green-600 hover:bg-green-50"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                          title={section.is_enabled ? "Disable" : "Enable"}
                        >
                          {section.is_enabled ? (
                            <Power className="w-4 h-4" />
                          ) : (
                            <PowerOff className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          href={`/admin/homepage/sections/${section.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(section.id, section.name)}
                          disabled={isProcessing}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Section Management Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Sections are displayed in order on the homepage</li>
          <li>• Featured sections show hero-style layouts for top stories</li>
          <li>• Category sections automatically pull latest articles from that category</li>
          <li>• Custom sections allow manual content curation</li>
          <li>• Disable sections to temporarily hide them without deleting</li>
        </ul>
      </div>
    </div>
  );
}
