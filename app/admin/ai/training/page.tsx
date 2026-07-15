"use client";

import { useState } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Search,
  Tag,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface ChatTrainingData {
  id: string;
  keywords: string[];
  response: string;
  category: string;
  priority: number;
  active: boolean;
}

const CATEGORIES = [
  "Temple Timings",
  "Events",
  "Sevas",
  "Donations",
  "Trust",
  "Contact",
  "Gallery",
  "Volunteer",
  "About",
  "General"
];

const DEFAULT_RESPONSES: Omit<ChatTrainingData, "id">[] = [
  {
    keywords: ["timing", "open", "hour", "morning", "evening"],
    response: "🕐 **Temple Timings**\n\n**Morning:** 06:00 AM - 12:00 PM\n**Evening:** 05:00 PM - 08:30 PM\n\nSpecial timings apply during festivals. Please contact the temple office for details.",
    category: "Temple Timings",
    priority: 1,
    active: true,
  },
  {
    keywords: ["event", "festival", "upcoming", "celebration"],
    response: "📅 **Upcoming Events**\n\nWe have several events throughout the year including:\n- Daily poojas\n- Ekadashi celebrations\n- Sri Raghavendra Jayanthi\n- Bramhotsavam\n\nFor the latest schedule, please visit our Events page.",
    category: "Events",
    priority: 1,
    active: true,
  },
  {
    keywords: ["seva", "service", "pooja", "archana"],
    response: "🙏 **Temple Sevas**\n\nWe offer various sevas:\n- Daily Pooja\n- Suptharadhana\n- Maha Pooja\n- Astothram\n- Archana\n\nPlease visit the Sevas page for pricing and booking.",
    category: "Sevas",
    priority: 1,
    active: true,
  },
  {
    keywords: ["donat", "contribute", "support"],
    response: "💝 **Donations**\n\nYour donations help maintain the temple. Visit our Donation page or contact the office for bank transfer details.",
    category: "Donations",
    priority: 1,
    active: true,
  },
  {
    keywords: ["contact", "phone", "email", "address"],
    response: "📞 **Contact Information**\n\n**Address:** Yelahanka New Town, Bengaluru\n**Phone:** +91 80 2332 3456\n**Email:** ngowda759@gmail.com",
    category: "Contact",
    priority: 1,
    active: true,
  },
];

export default function ChatTrainingPage() {
  const [trainingData, setTrainingData] = useState<ChatTrainingData[]>(
    DEFAULT_RESPONSES.map((item, index) => ({
      ...item,
      id: `default-${index + 1}`,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<ChatTrainingData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [formKeywords, setFormKeywords] = useState("");
  const [formResponse, setFormResponse] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formPriority, setFormPriority] = useState(1);
  const [formActive, setFormActive] = useState(true);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  function openNewForm() {
    setEditingItem({
      id: "",
      keywords: [],
      response: "",
      category: "General",
      priority: 1,
      active: true,
    });
    setFormKeywords("");
    setFormResponse("");
    setFormCategory("General");
    setFormPriority(1);
    setFormActive(true);
    setIsNew(true);
  }

  function openEditForm(item: ChatTrainingData) {
    setEditingItem(item);
    setFormKeywords(item.keywords.join(", "));
    setFormResponse(item.response);
    setFormCategory(item.category);
    setFormPriority(item.priority);
    setFormActive(item.active);
    setIsNew(false);
  }

  function closeForm() {
    setEditingItem(null);
    setIsNew(false);
  }

  function saveItem() {
    if (!formKeywords.trim() || !formResponse.trim()) {
      showMessage("error", "Keywords and response are required");
      return;
    }

    const keywords = formKeywords.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);

    setSaving(true);
    try {
      if (isNew) {
        const newItem: ChatTrainingData = {
          id: `new-${Date.now()}`,
          keywords,
          response: formResponse,
          category: formCategory,
          priority: formPriority,
          active: formActive,
        };
        setTrainingData([...trainingData, newItem]);
        showMessage("success", "Training data added successfully");
      } else if (editingItem?.id) {
        setTrainingData(
          trainingData.map((item) =>
            item.id === editingItem.id
              ? { ...item, keywords, response: formResponse, category: formCategory, priority: formPriority, active: formActive }
              : item
          )
        );
        showMessage("success", "Training data updated successfully");
      }
      closeForm();
    } catch (error) {
      console.error("Error saving:", error);
      showMessage("error", "Failed to save training data");
    } finally {
      setSaving(false);
    }
  }

  function deleteItem(id: string) {
    if (!confirm("Are you sure you want to delete this training data?")) return;

    setTrainingData(trainingData.filter((item) => item.id !== id));
    showMessage("success", "Training data deleted");
  }

  function toggleActive(item: ChatTrainingData) {
    setTrainingData(
      trainingData.map((i) =>
        i.id === item.id ? { ...i, active: !i.active } : i
      )
    );
  }

  // Filter data
  const filteredData = trainingData.filter((item) => {
    const matchesSearch = 
      item.keywords.some((k) => k.includes(searchTerm.toLowerCase())) ||
      item.response.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Chat Training</h1>
        <p className="text-stone-600">Manage AI chatbot responses and keywords</p>
      </div>

      {/* Message Toast */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search keywords or responses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={openNewForm}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Response
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">Keywords</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Tag className="w-12 h-12 mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-500 mb-2">No training data found</p>
                    <button
                      onClick={openNewForm}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      Add your first response
                    </button>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className={!item.active ? "bg-stone-50 opacity-60" : ""}>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {item.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-stone-600">{item.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-stone-600">{item.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(item)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          item.active
                            ? "bg-green-100 text-green-800"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {item.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(item)}
                          className="p-2 text-stone-400 hover:text-amber-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h2 className="text-xl font-semibold text-stone-900">
                {isNew ? "Add Training Data" : "Edit Training Data"}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="timing, open, hours"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-xs text-stone-500 mt-1">
                  Enter keywords that will trigger this response
                </p>
              </div>

              {/* Response */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Response
                </label>
                <textarea
                  value={formResponse}
                  onChange={(e) => setFormResponse(e.target.value)}
                  rows={6}
                  placeholder="Enter the response text..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-xs text-stone-500 mt-1">
                  You can use Markdown formatting (**, __, lists)
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Priority (1 = highest)
                </label>
                <input
                  type="number"
                  value={formPriority}
                  onChange={(e) => setFormPriority(parseInt(e.target.value) || 1)}
                  min={1}
                  max={10}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 text-amber-600 border-stone-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="active" className="text-sm text-stone-700">
                  Active (will be used in responses)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-stone-200 bg-stone-50">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-stone-600 hover:text-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveItem}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
