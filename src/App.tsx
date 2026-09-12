import React, { useState, useEffect } from "react";
import {
  Refrigerator,
  Camera,
  ShoppingCart,
  ChefHat,
  Sparkles,
  ShieldCheck,
  Github,
  RotateCcw,
  CheckCircle2,
  CalendarCheck,
  Zap,
  ArrowRight,
  Filter,
} from "lucide-react";
import { ImageUploader } from "./components/ImageUploader.tsx";
import { CameraCapture } from "./components/CameraCapture.tsx";
import { PreferenceBar } from "./components/PreferenceBar.tsx";
import { AnalysisOverview } from "./components/AnalysisOverview.tsx";
import { MealCard } from "./components/MealCard.tsx";
import { GroceryCartDrawer } from "./components/GroceryCartDrawer.tsx";
import { ChefCopilotDrawer } from "./components/ChefCopilotDrawer.tsx";
import { requestFridgeAnalysis, AnalysisPreferences } from "./services/apiClient.ts";
import {
  AnalysisResult,
  MealRecipe,
  DetectedIngredient,
  MissingIngredient,
} from "../server/geminiService.ts";
import { MissingCartItem } from "./utils/groceryDelivery.ts";
import { SAMPLE_FRIDGES } from "./data/sampleFridges.ts";

export default function App() {
  // Image & Camera State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgressMsg, setAnalysisProgressMsg] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Preferences & Routine
  const [preferences, setPreferences] = useState<AnalysisPreferences>({
    dietary: "Balanced / Any",
    maxCookTime: "Any Time",
    cuisinePreference: "All Cuisines",
  });
  const [rescueExpiring, setRescueExpiring] = useState<boolean>(true);

  // Grocery Cart State
  const [cartItems, setCartItems] = useState<MissingCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Chef Copilot & Modals
  const [isChefCopilotOpen, setIsChefCopilotOpen] = useState<boolean>(false);
  const [chefContextMeal, setChefContextMeal] = useState<string | undefined>(undefined);

  // Meal Tier Filter
  const [tierFilter, setTierFilter] = useState<"all" | "ready_now" | "quick_trip" | "gourmet_upgrade">("all");

  // Autonomous routine decision banner state
  const [autonomousDecisionDismissed, setAutonomousDecisionDismissed] = useState<boolean>(false);

  // Handle Analysis trigger
  const runAnalysis = async (imgData?: string) => {
    const imageToAnalyze = imgData || selectedImage;
    if (!imageToAnalyze) return;

    setIsAnalyzing(true);
    setAnalysisProgressMsg("Inspecting fridge shelves and produce crisper...");

    const progressTimer = setTimeout(() => {
      setAnalysisProgressMsg("Identifying protein sources, dairy, and perishables...");
    }, 1200);

    const progressTimer2 = setTimeout(() => {
      setAnalysisProgressMsg("Calculating zero-waste meal formulas and delivery baskets...");
    }, 2400);

    try {
      const result = await requestFridgeAnalysis(
        imageToAnalyze,
        "image/jpeg",
        preferences
      );
      setAnalysisResult(result);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      clearTimeout(progressTimer);
      clearTimeout(progressTimer2);
      setIsAnalyzing(false);
      setAnalysisProgressMsg("");
    }
  };

  const handleImageSelected = (dataUrl: string) => {
    setSelectedImage(dataUrl);
    setAnalysisResult(null);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
  };

  const handleCameraCapture = (dataUrl: string) => {
    setIsLiveCameraOpen(false);
    setSelectedImage(dataUrl);
    // Auto-trigger analysis for seamless agent experience
    runAnalysis(dataUrl);
  };

  // Grocery Cart Handlers
  const handleAddToCart = (item: MissingIngredient, mealTitle: string) => {
    setCartItems((prev) => {
      const exists = prev.some((i) => i.name.toLowerCase() === item.name.toLowerCase());
      if (exists) {
        return prev.filter((i) => i.name.toLowerCase() !== item.name.toLowerCase());
      }
      const newItem: MissingCartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: item.name,
        amount: item.amount,
        estimatedPrice: item.estimatedPrice,
        storeCategory: item.storeCategory,
        substituteOption: item.substituteOption,
        mealTitle,
        checked: true,
      };
      return [...prev, newItem];
    });
  };

  const handleAddAllMissingToCart = (items: MissingIngredient[], mealTitle: string) => {
    setCartItems((prev) => {
      const newItems: MissingCartItem[] = [];
      for (const it of items) {
        const already = prev.some((p) => p.name.toLowerCase() === it.name.toLowerCase());
        if (!already) {
          newItems.push({
            id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: it.name,
            amount: it.amount,
            estimatedPrice: it.estimatedPrice,
            storeCategory: it.storeCategory,
            substituteOption: it.substituteOption,
            mealTitle,
            checked: true,
          });
        }
      }
      return [...prev, ...newItems];
    });
    setIsCartOpen(true);
  };

  const isItemInCart = (itemName: string) => {
    return cartItems.some((i) => i.name.toLowerCase() === itemName.toLowerCase());
  };

  const handleToggleCartItem = (id: string) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleAskChef = (mealTitle?: string) => {
    setChefContextMeal(mealTitle);
    setIsChefCopilotOpen(true);
  };

  const handleUpdateIngredients = (updated: DetectedIngredient[]) => {
    if (!analysisResult) return;
    setAnalysisResult({
      ...analysisResult,
      detectedIngredients: updated,
    });
  };

  // Filter meals
  const displayedMeals = (analysisResult?.suggestedMeals || []).filter((meal) => {
    if (tierFilter === "all") return true;
    return meal.tier === tierFilter;
  });

  const totalCartCount = cartItems.length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Agent Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Refrigerator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-lg text-stone-900 leading-tight">
                  Fridge Meal AI
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  Autonomous Agent
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Smart Fridge Scanner & Grocery Delivery Copilot
              </p>
            </div>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Host on GitHub button */}
            <button
              id="open-github-export-button"
              type="button"
              onClick={() => setIsGitHubModalOpen(true)}
              className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="View instructions to host on GitHub"
            >
              <Github className="w-4 h-4" />
              <span className="hidden md:inline">Host on GitHub</span>
            </button>

            {/* Chef Remy Chat */}
            <button
              id="open-chef-copilot-button"
              type="button"
              onClick={() => handleAskChef()}
              className="px-3 py-2 rounded-xl border border-stone-200 hover:border-emerald-500 hover:text-emerald-700 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ChefHat className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Ask Chef Remy</span>
            </button>

            {/* Delivery Cart Button */}
            <button
              id="open-delivery-cart-button"
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Grocery Cart</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 font-bold text-[11px] flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Autonomous Background Agent Banner */}
        {!autonomousDecisionDismissed && (
          <div
            id="autonomous-agent-routine-banner"
            className="p-4 sm:p-5 rounded-2xl bg-stone-900 text-white shadow-md border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Autonomous Dinner Agent Routine
                  </span>
                  <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full font-mono">
                    Always Running
                  </span>
                </div>
                <p className="text-sm text-stone-200 leading-snug">
                  Instead of planning meals from scratch every day, snap a photo of your fridge.
                  The agent detects perishable items and queues high-rated dinner recipes with 1-click grocery ordering.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(SAMPLE_FRIDGES[0].imageDataUrl);
                  runAnalysis(SAMPLE_FRIDGES[0].imageDataUrl);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Run Demo Routine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAutonomousDecisionDismissed(true)}
                className="p-2 text-stone-400 hover:text-white text-xs transition"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Section 1: Capture or Upload Fridge */}
        <section className="space-y-4">
          <div className="text-left">
            <h2 className="text-2xl font-bold font-display text-stone-900 tracking-tight">
              Step 1: Fridge & Pantry Scan
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">
              Take a snapshot with your live camera, upload an image, or click one of the demo fridges below.
            </p>
          </div>

          <ImageUploader
            selectedImage={selectedImage}
            onImageSelected={handleImageSelected}
            onClearImage={handleClearImage}
            onOpenLiveCamera={() => setIsLiveCameraOpen(true)}
            isAnalyzing={isAnalyzing}
            onStartAnalysis={() => runAnalysis()}
          />

          {/* Preferences and Diet Controls */}
          <PreferenceBar
            preferences={preferences}
            onChange={setPreferences}
            rescueExpiring={rescueExpiring}
            onToggleRescue={() => setRescueExpiring(!rescueExpiring)}
          />
        </section>

        {/* Analysis Loading Indicator */}
        {isAnalyzing && (
          <div className="p-10 rounded-2xl bg-white border border-stone-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-stone-900">
                Agent Analyzing Refrigerator Visuals
              </h3>
              <p className="text-sm text-stone-500 font-medium mt-1">
                {analysisProgressMsg || "Processing multimodal vision through Gemini 3.8 Flash..."}
              </p>
            </div>
            <div className="max-w-xs mx-auto h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 animate-indeterminate rounded-full" />
            </div>
          </div>
        )}

        {/* Section 2: Analysis Results & Inventory */}
        {analysisResult && !isAnalyzing && (
          <section className="space-y-6">
            <div className="text-left flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold font-display text-stone-900 tracking-tight">
                  Step 2: Fridge Assessment & Waste Prevention
                </h2>
                <p className="text-sm text-stone-500 mt-0.5">
                  The AI detected the following items and flagged perishables to use first.
                </p>
              </div>

              <button
                type="button"
                onClick={() => runAnalysis()}
                className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-xs font-medium text-stone-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-analyze with new preferences</span>
              </button>
            </div>

            <AnalysisOverview
              analysis={analysisResult}
              onUpdateIngredients={handleUpdateIngredients}
            />

            {/* Section 3: Recommended Meal Ideas */}
            <div className="pt-4 space-y-5 text-left">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
                <div>
                  <h3 className="text-2xl font-bold font-display text-stone-900">
                    Step 3: Curated Meal Recommendations
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Choose a ready-to-cook meal or order missing items through local delivery services.
                  </p>
                </div>

                {/* Meal Tier Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTierFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      tierFilter === "all"
                        ? "bg-white text-stone-900 shadow-2xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    All Meals ({analysisResult.suggestedMeals.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTierFilter("ready_now")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      tierFilter === "ready_now"
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "text-emerald-700 hover:text-emerald-900"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ready Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTierFilter("quick_trip")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      tierFilter === "quick_trip"
                        ? "bg-amber-600 text-white shadow-2xs"
                        : "text-amber-800 hover:text-amber-900"
                    }`}
                  >
                    Quick Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setTierFilter("gourmet_upgrade")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      tierFilter === "gourmet_upgrade"
                        ? "bg-sky-600 text-white shadow-2xs"
                        : "text-sky-800 hover:text-sky-900"
                    }`}
                  >
                    Chef Upgrade
                  </button>
                </div>
              </div>

              {/* Meals Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {displayedMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onAddToCart={handleAddToCart}
                    onAddAllMissingToCart={handleAddAllMissingToCart}
                    isItemInCart={isItemInCart}
                    onAskChefAboutMeal={(title) => handleAskChef(title)}
                  />
                ))}
              </div>

              {displayedMeals.length === 0 && (
                <div className="p-10 text-center bg-white rounded-2xl border border-stone-200 text-stone-500">
                  <Filter className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                  <p className="font-semibold text-stone-700">No meals found in this filter category</p>
                  <button
                    type="button"
                    onClick={() => setTierFilter("all")}
                    className="mt-3 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium"
                  >
                    Reset Filter to All Meals
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">Akul</span>
            <span>·</span>
          
          </div>

        
            <span>·</span>
            <span>Local Delivery Partners: Instacart, Walmart, Amazon Fresh</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {isLiveCameraOpen && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setIsLiveCameraOpen(false)}
        />
      )}

      <GroceryCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onToggleItem={handleToggleCartItem}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      <ChefCopilotDrawer
        isOpen={isChefCopilotOpen}
        onClose={() => setIsChefCopilotOpen(false)}
        fridgeItems={analysisResult?.detectedIngredients.map((i) => i.name) || []}
        initialContextMeal={chefContextMeal}
      />
    </div>
  );
}
