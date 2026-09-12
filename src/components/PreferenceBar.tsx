import React from "react";
import { SlidersHorizontal, Leaf, Clock, Utensils, ShieldAlert } from "lucide-react";
import { AnalysisPreferences } from "../services/apiClient.ts";

interface PreferenceBarProps {
  preferences: AnalysisPreferences;
  onChange: (updated: AnalysisPreferences) => void;
  rescueExpiring: boolean;
  onToggleRescue: () => void;
}

export const PreferenceBar: React.FC<PreferenceBarProps> = ({
  preferences,
  onChange,
  rescueExpiring,
  onToggleRescue,
}) => {
  const dietaryOptions = ["Balanced / Any", "High Protein", "Vegetarian", "Vegan", "Low Carb", "Kid-Friendly"];
  const cookTimeOptions = ["Any Time", "< 20 mins", "< 35 mins"];
  const cuisineOptions = ["All Cuisines", "Mediterranean", "Italian Comfort", "Asian Fusion", "Mexican Fresh"];

  return (
    <div id="chef-preferences-panel" className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-2xs text-left">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-stone-600" />
          <h4 className="text-xs uppercase tracking-wider font-bold text-stone-700">
            Chef AI Preferences & Routine Filters
          </h4>
        </div>

        {/* Autonomous Waste Reduction Switch */}
        <button
          id="toggle-rescue-expiring-button"
          type="button"
          onClick={onToggleRescue}
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
            rescueExpiring
              ? "bg-amber-100 text-amber-900 border border-amber-300"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200"
          }`}
        >
          <ShieldAlert className={`w-3.5 h-3.5 ${rescueExpiring ? "text-amber-600" : "text-stone-400"}`} />
          <span>Zero Food Waste Priority: {rescueExpiring ? "Active" : "Off"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Diet */}
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1.5 flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dietary Style</span>
          </label>
          <select
            id="select-dietary-style"
            value={preferences.dietary || "Balanced / Any"}
            onChange={(e) => onChange({ ...preferences, dietary: e.target.value })}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          >
            {dietaryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Cook Time */}
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Cooking Speed</span>
          </label>
          <select
            id="select-cook-time"
            value={preferences.maxCookTime || "Any Time"}
            onChange={(e) => onChange({ ...preferences, maxCookTime: e.target.value })}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          >
            {cookTimeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Cuisine Preference */}
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1.5 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-rose-600" />
            <span>Cuisine Mood</span>
          </label>
          <select
            id="select-cuisine-preference"
            value={preferences.cuisinePreference || "All Cuisines"}
            onChange={(e) => onChange({ ...preferences, cuisinePreference: e.target.value })}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          >
            {cuisineOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
