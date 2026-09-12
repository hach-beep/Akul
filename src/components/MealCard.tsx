import React, { useState } from "react";
import {
  Clock,
  Flame,
  Check,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  ChefHat,
  HelpCircle,
} from "lucide-react";
import { MealRecipe, MissingIngredient } from "../../server/geminiService.ts";
import { GROCERY_PROVIDERS } from "../utils/groceryDelivery.ts";

interface MealCardProps {
  meal: MealRecipe;
  onAddToCart: (item: MissingIngredient, mealTitle: string) => void;
  onAddAllMissingToCart: (items: MissingIngredient[], mealTitle: string) => void;
  isItemInCart: (itemName: string) => boolean;
  onAskChefAboutMeal: (mealTitle: string) => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onAddToCart,
  onAddAllMissingToCart,
  isItemInCart,
  onAskChefAboutMeal,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [substituteOpen, setSubstituteOpen] = useState<Record<string, boolean>>({});

  // Kitchen Timer State
  const [timerDuration, setTimerDuration] = useState<number>(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Timer tick effect
  React.useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && timerRunning) {
      setTimerRunning(false);
      // Play soft chime or alert
      if (typeof window !== "undefined") {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } catch (e) {
          // ignore audio restriction
        }
      }
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSecondsLeft]);

  const startKitchenTimer = (minutes: number) => {
    const totalSec = minutes * 60;
    setTimerDuration(totalSec);
    setTimerSecondsLeft(totalSec);
    setTimerRunning(true);
  };

  const toggleStep = (stepIndex: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepIndex]: !prev[stepIndex],
    }));
  };

  const toggleSub = (itemName: string) => {
    setSubstituteOpen((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const tierStyles = {
    ready_now: {
      border: "border-emerald-200",
      badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
      label: "Ready Now (100% In Fridge)",
      desc: "Cook immediately without buying anything extra",
    },
    quick_trip: {
      border: "border-amber-200",
      badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
      label: "Quick Delivery (1-2 Items)",
      desc: "Fast delivery or quick pantry substitute",
    },
    gourmet_upgrade: {
      border: "border-sky-200",
      badgeBg: "bg-sky-100 text-sky-900 border-sky-300",
      label: "Chef Upgrade (Few Items Needed)",
      desc: "Elevated flavor with grocery delivery",
    },
  }[meal.tier] || {
    border: "border-stone-200",
    badgeBg: "bg-stone-100 text-stone-800 border-stone-200",
    label: meal.tierLabel,
    desc: "",
  };

  const missingTotal = meal.ingredientsMissing.reduce((acc, i) => acc + i.estimatedPrice, 0);

  return (
    <div
      id={`meal-card-${meal.id}`}
      className={`bg-white rounded-2xl border ${tierStyles.border} shadow-xs hover:shadow-md transition-all overflow-hidden text-left flex flex-col justify-between`}
    >
      {/* Top Banner */}
      <div className="p-5 pb-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${tierStyles.badgeBg}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tierStyles.label}</span>
          </span>

          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            {meal.cuisine}
          </span>
        </div>

        <div>
          <h3 className="text-xl font-bold font-display text-stone-900 leading-snug">
            {meal.title}
          </h3>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">{meal.description}</p>
        </div>

        {/* Key Metrics */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-600 border-y border-stone-100 py-2.5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-semibold text-stone-800">{meal.totalTime}</span>
            <span className="text-stone-400 font-normal">({meal.prepTime} prep)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-stone-800">{meal.calories} kcal</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
            <span>{meal.difficulty}</span>
          </div>

          <div className="ml-auto text-[11px] text-stone-500 flex items-center gap-2">
            <span>P: {meal.nutrition.protein}</span>
            <span>C: {meal.nutrition.carbs}</span>
            <span>F: {meal.nutrition.fat}</span>
          </div>
        </div>

        {/* Waste Reduction Impact */}
        {meal.wasteReductionNote && (
          <div className="text-[11px] text-emerald-800 bg-emerald-50/70 rounded-xl px-3 py-1.5 border border-emerald-200/60 flex items-center gap-1.5">
            <ChefHat className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium">{meal.wasteReductionNote}</span>
          </div>
        )}

        {/* Ingredients Summary Grid */}
        <div className="space-y-3 pt-1">
          {/* Have Items */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1.5">
              <span className="flex items-center gap-1 text-emerald-700">
                <Check className="w-3.5 h-3.5" />
                <span>In Your Fridge ({meal.ingredientsHave.length})</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {meal.ingredientsHave.map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-stone-50 text-stone-700 border border-stone-200 rounded-lg text-xs"
                >
                  {item.name} {item.amount && <span className="text-stone-400">({item.amount})</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Items & Grocery Integration */}
          {meal.ingredientsMissing.length > 0 ? (
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-800 flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
                  <span>Missing Ingredients ({meal.ingredientsMissing.length})</span>
                </span>
                <span className="text-stone-600 font-semibold">
                  Est: ${missingTotal.toFixed(2)}
                </span>
              </div>

              {/* Missing list items */}
              <div className="space-y-2">
                {meal.ingredientsMissing.map((miss, idx) => {
                  const inCart = isItemInCart(miss.name);
                  const isSubOpen = substituteOpen[miss.name];

                  return (
                    <div
                      key={idx}
                      className="bg-white p-2.5 rounded-lg border border-stone-200 text-xs flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-stone-900">{miss.name}</span>
                          <span className="text-stone-500 text-[11px] ml-1.5">
                            {miss.amount} · ~${miss.estimatedPrice.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Quick Instacart Search */}
                          <a
                            href={GROCERY_PROVIDERS[0].buildSearchUrl(miss.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 font-medium text-[11px] flex items-center gap-1 transition"
                            title="Find on Instacart"
                          >
                            <span>Instacart</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>

                          {/* Add to Master Delivery Cart */}
                          <button
                            type="button"
                            onClick={() => onAddToCart(miss, meal.title)}
                            className={`px-2.5 py-1 rounded font-semibold text-[11px] transition cursor-pointer ${
                              inCart
                                ? "bg-emerald-600 text-white"
                                : "bg-stone-900 text-white hover:bg-stone-800"
                            }`}
                          >
                            {inCart ? "In Cart ✓" : "+ Delivery Cart"}
                          </button>
                        </div>
                      </div>

                      {/* Smart Zero-Cost Substitute Toggle */}
                      {miss.substituteOption && (
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleSub(miss.name)}
                            className="text-[11px] text-amber-700 hover:text-amber-900 flex items-center gap-1 font-medium transition cursor-pointer"
                          >
                            <HelpCircle className="w-3 h-3" />
                            <span>
                              {isSubOpen ? "Hide Kitchen Substitute" : "Don't want to buy? Free Substitute"}
                            </span>
                          </button>
                          {isSubOpen && (
                            <p className="mt-1 p-2 bg-amber-50/90 rounded-md text-[11px] text-amber-900 border border-amber-200 leading-relaxed">
                              💡 <strong>Zero-Cost Pantry Swap:</strong> {miss.substituteOption}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add All Missing to Master Cart button */}
              <button
                type="button"
                onClick={() => onAddAllMissingToCart(meal.ingredientsMissing, meal.title)}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add All ({meal.ingredientsMissing.length}) to Delivery Cart</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Zero groceries needed!</strong> You have everything required to make this right now.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Cooking Instructions & Timers */}
      {isExpanded && (
        <div className="p-5 pt-0 border-t border-stone-100 space-y-4 bg-stone-50/50">
          {/* Chef Pro Tip */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1">
            <span className="font-bold text-stone-900 flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-amber-600" />
              Chef's Pro Tip
            </span>
            <p className="text-stone-600 leading-relaxed">{meal.chefTip}</p>
          </div>

          {/* Kitchen Timer Widget */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TimerIcon className="w-4 h-4 text-stone-600" />
              <span className="text-xs font-bold text-stone-800">Kitchen Timer:</span>
              <span className="text-sm font-mono font-bold text-stone-900">
                {Math.floor(timerSecondsLeft / 60)}:
                {(timerSecondsLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {[5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => startKitchenTimer(mins)}
                  className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  +{mins}m
                </button>
              ))}

              {timerDuration > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="p-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 cursor-pointer"
                    title={timerRunning ? "Pause" : "Resume"}
                  >
                    {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerSecondsLeft(0);
                    }}
                    className="p-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Step by step Instructions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Cooking Instructions (Step-by-Step)
            </h4>
            <div className="space-y-2">
              {meal.instructions.map((step, idx) => {
                const done = completedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-3 rounded-xl border text-xs leading-relaxed transition cursor-pointer flex items-start gap-2.5 ${
                      done
                        ? "bg-emerald-50/80 border-emerald-200 text-stone-400 line-through"
                        : "bg-white border-stone-200 text-stone-800 hover:border-stone-300"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                        done
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {done ? "✓" : idx + 1}
                    </span>
                    <span className="flex-1">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ask AI Chef about this specific recipe */}
          <button
            type="button"
            onClick={() => onAskChefAboutMeal(meal.title)}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <ChefHat className="w-4 h-4 text-emerald-600" />
            <span>Ask Chef Remy: "How to adapt this recipe?"</span>
          </button>
        </div>
      )}

      {/* Card Footer Toggle */}
      <div className="p-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
        <button
          id={`toggle-instructions-${meal.id}`}
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1.5 transition cursor-pointer"
        >
          <span>{isExpanded ? "Collapse Recipe" : "View Step-by-Step Instructions"}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <span className="text-[11px] text-stone-400">
          {meal.instructions.length} cooking steps
        </span>
      </div>
    </div>
  );
};
