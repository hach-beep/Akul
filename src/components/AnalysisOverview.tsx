import React, { useState } from "react";
import { ShieldAlert, CheckCircle, Plus, X, Tag } from "lucide-react";
import { AnalysisResult, DetectedIngredient } from "../../server/geminiService.ts";

interface AnalysisOverviewProps {
  analysis: AnalysisResult;
  onUpdateIngredients: (updated: DetectedIngredient[]) => void;
}

export const AnalysisOverview: React.FC<AnalysisOverviewProps> = ({
  analysis,
  onUpdateIngredients,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemCategory, setNewItemCategory] = useState<DetectedIngredient["category"]>("Produce");

  const categories = ["All", "Produce", "Dairy", "Protein", "Condiments", "Bakery & Grains", "Pantry & Spices"];

  const filteredItems =
    selectedCategory === "All"
      ? analysis.detectedIngredients
      : analysis.detectedIngredients.filter((item) => item.category === selectedCategory);

  const handleRemoveItem = (id: string) => {
    const updated = analysis.detectedIngredients.filter((i) => i.id !== id);
    onUpdateIngredients(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: DetectedIngredient = {
      id: `manual-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      quantityEstimated: "User Added",
      freshnessStatus: "Fresh",
    };

    onUpdateIngredients([...analysis.detectedIngredients, newItem]);
    setNewItemName("");
    setIsAddingItem(false);
  };

  return (
    <div id="fridge-analysis-overview" className="space-y-4 text-left">
      {/* Top Health & Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Inventory & Score */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-stone-500">
              Fridge Inventory
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {analysis.fridgeSummary.varietyScore} Variety
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-stone-900">
              {analysis.detectedIngredients.length}
            </span>
            <span className="text-sm text-stone-500 font-medium">items recognized</span>
          </div>
          <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
            {analysis.fridgeSummary.generalObservation}
          </p>
        </div>

        {/* Proteins & Bases */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs">
          <span className="text-xs uppercase tracking-wider font-bold text-stone-500">
            Identified Proteins & Staples
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {analysis.fridgeSummary.keyProteins.map((p, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200 flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                {p}
              </span>
            ))}
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Great foundation for fast, balanced dinner combos.
          </p>
        </div>

        {/* Food Waste Reduction / Expiry Alert */}
        <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Rescue Priority (Use Soon)</span>
          </div>
          <div className="mt-2 space-y-1">
            {analysis.fridgeSummary.perishableWarning.length > 0 ? (
              analysis.fridgeSummary.perishableWarning.map((item, idx) => (
                <p key={idx} className="text-xs font-medium text-amber-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  {item}
                </p>
              ))
            ) : (
              <p className="text-xs text-stone-600">All visible produce and dairy look fresh!</p>
            )}
          </div>
          <p className="text-[11px] text-amber-700 mt-2 font-medium">
            AI has tuned meal suggestions to prioritize using these first.
          </p>
        </div>
      </div>

      {/* Detected Ingredients Shelf */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-stone-600" />
            <h4 className="text-sm font-bold text-stone-800 font-display">
              Detected Ingredients & Pantry Stock
            </h4>
            <span className="text-xs text-stone-400">
              ({analysis.detectedIngredients.length})
            </span>
          </div>

          <button
            id="add-pantry-item-toggle-button"
            type="button"
            onClick={() => setIsAddingItem(!isAddingItem)}
            className="px-3 py-1.5 rounded-lg border border-stone-300 hover:border-emerald-500 hover:text-emerald-700 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item (Freezer/Pantry)</span>
          </button>
        </div>

        {/* Add item inline form */}
        {isAddingItem && (
          <form
            onSubmit={handleAddItem}
            className="flex flex-wrap items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200"
          >
            <input
              type="text"
              placeholder="e.g. Canned Black Beans, Olive Oil..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-emerald-500"
              autoFocus
            />
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg"
            >
              <option value="Produce">Produce</option>
              <option value="Protein">Protein</option>
              <option value="Dairy">Dairy</option>
              <option value="Condiments">Condiments</option>
              <option value="Bakery & Grains">Bakery & Grains</option>
              <option value="Pantry & Spices">Pantry & Spices</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
            >
              Save Item
            </button>
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="px-2 py-1.5 text-stone-500 hover:text-stone-700 text-xs"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`filter-cat-${cat.replace(/\s+/g, "-")}`}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tag Badges Grid */}
        <div className="flex flex-wrap gap-2 pt-1">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border text-xs font-medium transition ${
                item.freshnessStatus === "Use Soon" || item.freshnessStatus === "Expiring"
                  ? "bg-amber-50/70 border-amber-200 text-amber-900"
                  : "bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100"
              }`}
            >
              <span className="font-semibold">{item.name}</span>
              <span className="text-[10px] text-stone-500">
                ({item.quantityEstimated || item.category})
              </span>
              {item.freshnessStatus === "Use Soon" && (
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                  Use Soon
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="opacity-40 group-hover:opacity-100 text-stone-400 hover:text-rose-600 transition p-0.5"
                title="Remove item"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
