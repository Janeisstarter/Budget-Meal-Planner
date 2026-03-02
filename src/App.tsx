import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Utensils, Zap, DollarSign, ExternalLink, Loader2, ChevronRight, Info } from 'lucide-react';
import Markdown from 'react-markdown';
import { generateMealPlan, MealPlanResponse, Meal } from './services/geminiService';

export default function App() {
  const [budget, setBudget] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget || !url) return;

    setLoading(true);
    setError(null);
    try {
      const data = await generateMealPlan(parseFloat(budget), url);
      setResult(data);
    } catch (err) {
      setError('Failed to generate meal plan. Please check the URL and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Utensils size={20} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Budget Meal Planner</h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm text-black/40">
            <span className="flex items-center gap-1"><Zap size={14} /> AI Powered</span>
            <span className="flex items-center gap-1"><ShoppingCart size={14} /> Smart Shopping</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Input Section */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-black/5">
              <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
                Plan your Weekly Meal
              </h2>
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="budget" className="text-xs font-semibold uppercase tracking-wider text-black/40">
                    Total Budget
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                    <input
                      id="budget"
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full bg-[#f9f9f9] border border-black/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="url" className="text-xs font-semibold uppercase tracking-wider text-black/40">
                    Grocery Store URL
                  </label>
                  <div className="relative">
                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                    <input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://store.com/deals"
                      className="w-full bg-[#f9f9f9] border border-black/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-4 rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Generating 21 Meals...
                    </>
                  ) : (
                    <>
                      Generate Weekly Plan
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </section>

            <section className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
              <div className="flex gap-3">
                <Info className="text-emerald-600 shrink-0" size={20} />
                <p className="text-sm text-emerald-800 leading-relaxed">
                  We use AI to scan the provided URL for current prices and availability to ensure your meal plan stays within budget.
                </p>
              </div>
            </section>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-3xl mb-8"
                >
                  {error}
                </motion.div>
              )}

              {result ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight">Your Weekly Plan</h3>
                      <p className="text-black/40 text-sm">21 curated meals based on your budget</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-light text-emerald-600">
                        {result.currency}{result.totalEstimatedCost.toFixed(2)}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-black/30">Total Weekly Cost</div>
                    </div>
                  </div>

                  {/* Shopping List Section - Now at the Top */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-black/5"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <ShoppingCart className="text-emerald-500" size={24} />
                        Shopping List / 購物清單
                      </h3>
                      <span className="text-xs font-bold uppercase tracking-widest text-black/30 bg-black/5 px-3 py-1 rounded-full">
                        {result.shoppingList.length} Items
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {result.shoppingList.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-[#f9f9f9] rounded-2xl border border-black/5 group hover:border-emerald-200 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-black/80">{item.exactProductInfo}</span>
                            <span className="text-xs text-black/40 italic">{item.englishName}</span>
                          </div>
                          <div className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center group-hover:border-emerald-500 group-hover:bg-emerald-50 transition-all">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <div className="space-y-12">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                      const dayMeals = result.meals.filter(m => m.day === day);
                      if (dayMeals.length === 0) return null;
                      
                      return (
                        <div key={day} className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="h-px bg-black/5 flex-grow" />
                            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-black/30">Day {day}</h4>
                            <div className="h-px bg-black/5 flex-grow" />
                          </div>
                          <div className="space-y-6">
                            {dayMeals.sort((a, b) => {
                              const order = { breakfast: 0, lunch: 1, dinner: 2 };
                              return order[a.type] - order[b.type];
                            }).map((meal, idx) => (
                              <MealCard key={`${day}-${idx}`} meal={meal} index={idx} currency={result.currency} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-4 opacity-20">
                  <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center">
                    <Utensils size={40} />
                  </div>
                  <div>
                    <p className="text-xl font-medium">Ready to start?</p>
                    <p className="text-sm">Enter your budget and a store URL to see the magic.</p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/50 rounded-3xl p-8 h-64 animate-pulse border border-black/5" />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function MealCard({ meal, index, currency }: { meal: Meal; index: number; currency: string }) {
  const typeColors = {
    breakfast: 'bg-amber-50 text-amber-700 border-amber-100',
    lunch: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    dinner: 'bg-indigo-50 text-indigo-700 border-indigo-100'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-black/5 hover:shadow-md transition-shadow"
    >
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 bg-black/5 text-black/60 text-[10px] font-bold uppercase tracking-widest rounded-full">
                Meal {index + 1}
              </span>
              <span className={`inline-block px-3 py-1 border text-[10px] font-bold uppercase tracking-widest rounded-full ${typeColors[meal.type]}`}>
                {meal.type}
              </span>
            </div>
            <h4 className="text-2xl font-semibold tracking-tight">{meal.name}</h4>
          </div>
          <div className="text-right">
            <div className="text-xl font-medium text-emerald-600">{currency}{meal.estimatedCost.toFixed(2)}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-black/30">Est. Cost</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-black/30 mb-3 flex items-center gap-2">
                <ShoppingCart size={14} /> Ingredients
              </h5>
              <ul className="space-y-2">
                {meal.ingredients.map((ing, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#f9f9f9] rounded-2xl p-6 border border-black/5">
              <h5 className="text-xs font-bold uppercase tracking-widest text-black/30 mb-4 flex items-center gap-2">
                <Zap size={14} /> Macronutrients
              </h5>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-black/80">{meal.nutrition.carbs}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-black/30">Carbs</div>
                </div>
                <div className="text-center border-x border-black/5">
                  <div className="text-lg font-semibold text-black/80">{meal.nutrition.proteins}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-black/30">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-black/80">{meal.nutrition.fats}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-black/30">Fats</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-black/30 mb-3 flex items-center gap-2">
              <Utensils size={14} /> Recipe
            </h5>
            <div className="prose prose-sm max-w-none text-black/70 leading-relaxed">
              <Markdown>{meal.recipe}</Markdown>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
