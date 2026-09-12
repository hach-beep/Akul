import React, { useState } from "react";
import {
  X,
  ShoppingCart,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Store,
  Clock,
  Printer,
  ChevronRight,
} from "lucide-react";
import {
  GROCERY_PROVIDERS,
  GroceryProvider,
  MissingCartItem,
  generateShoppingListText,
} from "../utils/groceryDelivery.ts";

interface GroceryCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: MissingCartItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const GroceryCartDrawer: React.FC<GroceryCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onToggleItem,
  onRemoveItem,
  onClearCart,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<GroceryProvider>(
    GROCERY_PROVIDERS[0]
  );
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const checkedItems = cartItems.filter((i) => i.checked);
  const subtotal = checkedItems.reduce((acc, i) => acc + i.estimatedPrice, 0);
  const estimatedTax = subtotal * 0.06;
  const estimatedDelivery = subtotal > 35 ? 0 : 3.99;
  const total = subtotal + (subtotal > 0 ? estimatedTax + estimatedDelivery : 0);

  const handleCopyList = () => {
    const text = generateShoppingListText(cartItems);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOrderOnline = () => {
    if (checkedItems.length === 0) return;
    const searchTerms = checkedItems.map((i) => i.name);
    const url = selectedProvider.buildBatchUrl
      ? selectedProvider.buildBatchUrl(searchTerms)
      : selectedProvider.buildSearchUrl(searchTerms.join(" "));

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      id="grocery-delivery-cart-drawer"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity"
    >
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden text-left">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-display text-stone-900 leading-tight">
                Local Grocery Delivery
              </h3>
              <p className="text-xs text-stone-500">
                {cartItems.length} missing items queued for delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="p-2 text-stone-400 hover:text-rose-600 transition"
                title="Clear all items"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              id="close-grocery-drawer-button"
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-800 transition"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-stone-500" />
                <span>Select Delivery Service</span>
              </label>
              <span className="text-[11px] text-emerald-700 font-semibold">
                {selectedProvider.deliverySpeed}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GROCERY_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => setSelectedProvider(provider)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    selectedProvider.id === provider.id
                      ? "border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <span className="font-bold text-xs text-stone-900">{provider.name}</span>
                  <span className="text-[10px] text-stone-500 mt-1">{provider.minOrder}</span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-stone-500 bg-stone-100 p-2.5 rounded-xl">
              <strong>{selectedProvider.name}:</strong> {selectedProvider.popularFor}
            </p>
          </div>

          {/* Cart Item List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Ingredients to Order ({checkedItems.length}/{cartItems.length} selected)
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyList}
                  className="text-xs text-stone-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied!" : "Copy List"}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 space-y-2">
                <ShoppingCart className="w-8 h-8 mx-auto text-stone-300" />
                <p className="text-sm font-medium text-stone-600">Your delivery cart is empty</p>
                <p className="text-xs">
                  Pick recipe suggestions and tap "+ Delivery Cart" on missing items to order them here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                      item.checked
                        ? "bg-white border-stone-200 shadow-2xs"
                        : "bg-stone-50 border-stone-200/60 opacity-60"
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => onToggleItem(item.id)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className={`text-xs font-semibold text-stone-900 block ${!item.checked && "line-through text-stone-400"}`}>
                          {item.name}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {item.amount || "1 unit"} · {item.storeCategory}
                          {item.mealTitle && ` (for ${item.mealTitle})`}
                        </span>
                      </div>
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-800">
                        ${item.estimatedPrice.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-stone-300 hover:text-rose-500 p-1"
                        title="Delete from cart"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer & Checkout Action */}
        <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-4">
          {/* Cost Breakdown */}
          <div className="space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Sales Tax (approx.)</span>
              <span>${estimatedTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>Delivery Fee ({selectedProvider.deliverySpeed})</span>
              </span>
              <span>
                {subtotal > 35 ? (
                  <span className="text-emerald-700 font-bold">FREE ($35+)</span>
                ) : (
                  `$${estimatedDelivery.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
              <span>Estimated Total</span>
              <span className="text-emerald-700 text-base font-display">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout Direct Button */}
          <button
            id="checkout-grocery-provider-button"
            type="button"
            onClick={handleOrderOnline}
            disabled={checkedItems.length === 0}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <span>Order Missing on {selectedProvider.name}</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <p className="text-[10px] text-center text-stone-400 leading-tight">
            Opens {selectedProvider.name} with your missing ingredients pre-populated for fast same-day delivery.
          </p>
        </div>
      </div>
    </div>
  );
};
