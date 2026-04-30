import { useState, useEffect } from "react";

// --- Icons ---
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#D4AF37]">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#D4AF37]">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-green-500">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#00d2ff]">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// High-quality, reliable, appropriate fallback images per category
const FALLBACK_IMAGES = {
  Hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80",
  Activity: "https://images.unsplash.com/photo-1533604130095-d853e8d9860b?auto=format&fit=crop&w=500&q=80",
  Food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=80",
  Transport: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=500&q=80"
};

function App() {
  const [locations, setLocations] = useState([]);
  const [options, setOptions] = useState([]);
  const [formData, setFormData] = useState({ location: "", budget: 20000 });
  const [itemPersons, setItemPersons] = useState({}); // Stores per-item person count
  const [selectedCards, setSelectedCards] = useState(new Set()); // Manually selected cards
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    fetch("http://localhost:5000/locations")
      .then((res) => res.json())
      .then((data) => {
        setLocations(data.locations || []);
        if (data.locations?.length > 0) {
          setFormData((prev) => ({ ...prev, location: data.locations[0] }));
        }
      })
      .catch((err) => console.error("Failed to fetch locations:", err));
  }, []);

  useEffect(() => {
    if (!formData.location) return;
    fetch(`http://localhost:5000/options/${formData.location}`)
      .then((res) => res.json())
      .then((data) => {
        setOptions(data.options || []);
        const initialPersons = {};
        (data.options || []).forEach(opt => {
          initialPersons[opt.name] = 1;
        });
        setItemPersons(initialPersons);
        setSelectedCards(new Set()); // Reset selections
      })
      .catch((err) => console.error("Failed to fetch options:", err));
  }, [formData.location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCardSelection = (itemName) => {
    setSelectedCards(prev => {
      const next = new Set(prev);
      if (next.has(itemName)) next.delete(itemName);
      else next.add(itemName);
      return next;
    });
  };

  const updateItemPersons = (e, itemName, delta) => {
    e.stopPropagation();
    setItemPersons(prev => {
      const newCount = Math.max(1, (prev[itemName] || 1) + delta);
      return { ...prev, [itemName]: newCount };
    });
  };

  const selectAll = () => {
    setSelectedCards(new Set(options.map(o => o.name)));
  };

  const handleOptimize = async () => {
    if (selectedCards.size === 0) {
      setError("Please select at least one card to include in the DP Knapsack algorithm.");
      return;
    }

    setLoading(true);
    setError(null);

    // Build the itemPersons payload only for selected cards
    const payloadItemPersons = {};
    selectedCards.forEach(name => {
      payloadItemPersons[name] = itemPersons[name] || 1;
    });

    try {
      const res = await fetch("http://localhost:5000/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, itemPersons: payloadItemPersons }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Optimization failed");
      
      setTimeout(() => {
        setResults(data);
        setLoading(false);
        setCurrentPage("plan");
      }, 800);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 font-sans text-slate-100">
      {/* Navigation */}
      <nav className="royal-nav py-5 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentPage("home")}>
            <GlobeIcon />
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Elite Travel Planner</h1>
              <p className="text-xs text-[#D4AF37] font-sans tracking-widest uppercase mt-0.5">Advanced DP Knapsack Engine</p>
            </div>
          </div>
          {currentPage === "plan" && (
            <button 
              onClick={() => setCurrentPage("home")}
              className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-[#00d2ff] transition-colors"
            >
              <BackIcon /> Edit Selection
            </button>
          )}
        </div>
      </nav>

      {currentPage === "home" && (
        <main className="max-w-7xl mx-auto px-6 mt-10 space-y-12 animate-in fade-in duration-500">
          
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg">
              Select Your <span className="text-[#00d2ff]">Assets</span>
            </h2>
            <p className="text-white/80 font-sans text-lg drop-shadow">
              Manually select the cards you want the Knapsack algorithm to evaluate. You can configure the exact number of persons for each option independently, including <strong className="text-white">Transportation cards</strong>.
            </p>
          </div>

          {/* Configuration Panel */}
          <section className="royal-panel p-8 border-t-4 border-t-[#00d2ff]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#00d2ff] uppercase tracking-widest font-sans">Location</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-[#0a1128]/80 border border-white/20 text-white font-sans font-semibold rounded-lg px-4 py-4 focus:ring-2 focus:ring-[#00d2ff] outline-none transition-all"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc} className="text-black">{loc.charAt(0).toUpperCase() + loc.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-[#00d2ff] uppercase tracking-widest font-sans">Knapsack Capacity (Budget in ₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-sans font-bold">₹</span>
                  <input
                    type="number"
                    name="budget"
                    min="1000"
                    step="500"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full bg-[#0a1128]/80 border border-white/20 text-white font-sans font-bold rounded-lg pl-10 pr-4 py-4 focus:ring-2 focus:ring-[#00d2ff] outline-none transition-all"
                  />
                </div>
              </div>
            </div>
            
            {error && <div className="mt-6 p-4 bg-red-900/50 text-red-100 font-sans text-sm rounded-lg border border-red-500/50 flex items-center justify-center">{error}</div>}

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={handleOptimize}
                disabled={loading}
                className="bg-gradient-to-r from-[#8a2be2] to-[#00d2ff] hover:brightness-110 text-white px-12 py-5 rounded-full text-xl font-bold tracking-wider shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center gap-3 w-full sm:w-auto justify-center transition-all duration-300"
              >
                {loading ? "Optimizing..." : `Run DP Knapsack (${selectedCards.size} Selected)`}
              </button>
              <button 
                onClick={selectAll} 
                className="text-sm text-white/70 font-bold underline hover:text-white transition-colors"
              >
                Select All Available Cards
              </button>
            </div>
          </section>

          {/* Catalog Display */}
          <section className="space-y-8">
            <h3 className="text-3xl font-bold text-white border-b border-white/20 pb-4 drop-shadow-md">
              {formData.location} Options Catalog
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {options.map((opt, idx) => {
                const isSelected = selectedCards.has(opt.name);
                const pCount = itemPersons[opt.name] !== undefined ? itemPersons[opt.name] : 1;
                const totalCostForGroup = opt.type === 'per_person' ? opt.cost * pCount : opt.cost;
                
                // Use a guaranteed high-quality appropriate fallback image based on category
                const fallbackImg = FALLBACK_IMAGES[opt.category] || FALLBACK_IMAGES.Activity;
                
                return (
                  <div 
                    key={idx} 
                    className={`royal-card flex flex-col h-full relative group ${
                      isSelected ? 'ring-2 ring-[#00d2ff] transform scale-[1.02] shadow-[0_0_20px_rgba(0,210,255,0.3)]' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="h-48 overflow-hidden relative border-b border-white/10">
                      <img 
                        src={opt.image || fallbackImg} 
                        onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
                        alt={opt.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute top-3 right-3 bg-[#0a1128]/90 backdrop-blur px-3 py-1.5 rounded flex items-center gap-1 text-white font-bold font-sans shadow-lg border border-white/10">
                        {opt.rating} <StarIcon />
                      </div>
                      <div className="absolute top-3 left-3 bg-[#0a1128]/90 backdrop-blur px-3 py-1.5 rounded text-xs font-bold text-[#00d2ff] uppercase tracking-wider font-sans shadow-lg border border-white/10">
                        {opt.category}
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-grow text-white">
                      <h4 className="text-lg font-bold text-white mb-4 leading-tight">{opt.name}</h4>
                      
                      <div className="mt-auto flex flex-col gap-4">
                        {opt.type === 'per_person' ? (
                          <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/10">
                            <span className="text-xs text-white/70 font-sans font-bold flex items-center gap-1">
                              <UserIcon /> Persons
                            </span>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => updateItemPersons(e, opt.name, -1)}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:border-[#00d2ff] hover:text-[#00d2ff] font-bold transition-colors"
                              >-</button>
                              <span className="font-sans font-bold text-white w-4 text-center">{pCount}</span>
                              <button 
                                onClick={(e) => updateItemPersons(e, opt.name, 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:border-[#00d2ff] hover:text-[#00d2ff] font-bold transition-colors"
                              >+</button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white/5 p-2 rounded-lg text-center border border-white/10 py-3">
                            <span className="text-xs text-white/60 font-sans font-bold tracking-widest">FIXED GROUP PRICE</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-end px-1 border-t border-white/10 pt-3">
                          <span className="text-xs text-white/50 font-sans font-bold uppercase tracking-wider">Weight (Cost)</span>
                          <span className="text-xl font-bold font-sans text-[#00d2ff]">
                            ₹{totalCostForGroup.toLocaleString()}
                          </span>
                        </div>
                        
                        <button 
                          onClick={() => toggleCardSelection(opt.name)}
                          className={`mt-2 py-3 rounded-lg font-bold font-sans transition-all duration-300 w-full flex items-center justify-center gap-2 shadow-md ${
                            isSelected 
                              ? 'bg-gradient-to-r from-[#00d2ff] to-[#43e97b] text-white shadow-[0_0_15px_rgba(0,210,255,0.3)] border border-transparent' 
                              : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                          }`}
                        >
                          {isSelected ? (
                            <> <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> Selected for DP </>
                          ) : (
                            "Select Option"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {currentPage === "plan" && results && (
        <main className="max-w-7xl mx-auto px-6 mt-10 space-y-12 animate-in slide-in-from-bottom-8 duration-700">
          
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold text-white drop-shadow-lg">DP Knapsack Execution Results</h2>
            <p className="text-[#00d2ff] font-sans text-lg tracking-widest uppercase font-bold drop-shadow">Maximizing Profit (Rating) over Capacity (Budget)</p>
          </div>

          {/* Knapsack Visualizer Bar */}
          <div className="royal-panel p-8 space-y-4">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h3 className="text-xl font-bold text-white">Capacity Utilization</h3>
                <p className="text-sm text-white/60">Total Budget: ₹{results.totalBudget.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-[#43e97b]">₹{results.totalCost.toLocaleString()}</span>
                <span className="text-white/60"> spent</span>
              </div>
            </div>
            
            <div className="h-10 w-full bg-[#0a1128]/50 rounded-full overflow-hidden flex shadow-inner border border-white/10">
              {results.selected.map((item, idx) => {
                const percentage = (item.total_cost / results.totalBudget) * 100;
                let blockColor = "bg-[#00d2ff]"; // Cyan
                if(item.category === "Hotel") blockColor = "bg-[#8a2be2]"; // Lavender/Purple
                if(item.category === "Activity") blockColor = "bg-[#43e97b]"; // Green
                if(item.category === "Food") blockColor = "bg-[#ff6b6b]"; // Orange/Red
                if(item.category === "Transport") blockColor = "bg-[#feca57]"; // Yellow
                
                return (
                  <div 
                    key={idx}
                    style={{ width: `${percentage}%` }}
                    className={`${blockColor} h-full border-r border-[#0a1128] flex items-center justify-center relative group/tooltip hover:brightness-125 transition-all cursor-pointer`}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-[#0a1128] text-xs font-bold px-3 py-1.5 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                      {item.name} (₹{item.total_cost})
                    </div>
                  </div>
                );
              })}
              {/* Unused space */}
              <div 
                style={{ width: `${(results.remainingBudget / results.totalBudget) * 100}%` }}
                className="bg-repeating-linear-gradient from-transparent to-transparent bg-[length:10px_10px] bg-white/5 h-full flex items-center justify-center text-xs font-bold text-white/40"
              >
                {results.remainingBudget > 0 ? `Unused (₹${results.remainingBudget})` : ""}
              </div>
            </div>
          </div>

          {/* Budget Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="royal-panel p-6 text-center">
              <p className="text-xs text-[#00d2ff] uppercase tracking-widest font-bold mb-2 font-sans">Knapsack Capacity</p>
              <p className="text-3xl font-sans font-light tracking-tight text-white">₹{results.totalBudget.toLocaleString()}</p>
            </div>
            <div className="royal-panel p-6 text-center border-[#43e97b]/50 shadow-[0_0_20px_rgba(67,233,123,0.15)]">
              <p className="text-xs text-[#43e97b] uppercase tracking-widest font-bold mb-2 font-sans">Remaining Capacity</p>
              <p className="text-3xl font-sans font-bold text-[#43e97b] tracking-tight">₹{results.remainingBudget.toLocaleString()}</p>
            </div>
            <div className="royal-panel p-6 text-center border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <p className="text-xs text-[#D4AF37] uppercase tracking-widest font-bold mb-2 font-sans">Maximized Total Profit</p>
              <p className="text-4xl font-sans font-bold text-[#D4AF37] flex items-center justify-center gap-3">
                {results.totalScore} <StarIcon />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Selected Items Column */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-4 pb-4 border-b border-white/20">
                <CheckIcon /> Items Included in Knapsack
              </h3>
              
              <div className="space-y-4">
                {results.selected.length > 0 ? (
                  results.selected.map((item, idx) => {
                    const originalOpt = options.find(o => o.name === item.name);
                    const fallbackImg = FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES.Activity;
                    return (
                      <div key={idx} className="royal-panel flex overflow-hidden border-white/20 bg-white/5">
                        <div className="w-1/3 h-auto relative border-r border-white/10">
                          <img 
                            src={originalOpt?.image || fallbackImg} 
                            onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="w-2/3 p-5 flex flex-col justify-between relative">
                          <div>
                            <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-widest font-sans mb-1 block">
                              {item.category}
                            </span>
                            <h4 className="text-lg font-bold text-white leading-tight">{item.name}</h4>
                          </div>
                          <div className="mt-4 flex justify-between items-end">
                            <div>
                              <p className="text-xs text-white/50 font-sans font-bold uppercase mb-1">Profit Yield</p>
                              <div className="text-sm font-sans font-bold text-white bg-white/10 px-2 py-1 rounded inline-flex items-center gap-1 border border-white/10">
                                {item.rating} <StarIcon />
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-white/50 font-sans font-bold uppercase mb-1">Cost Weight</p>
                              <span className="text-xl font-sans font-bold text-[#43e97b]">₹{item.total_cost.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="royal-panel p-12 text-center text-red-200 font-sans border-red-500/30 bg-red-900/30">
                    No selected items fit within your knapsack capacity.
                  </div>
                )}
              </div>
            </div>

            {/* Rejected / Suboptimal Items */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white/60 flex items-center gap-4 pb-4 border-b border-white/10">
                <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                Rejected / Suboptimal Profit
              </h3>
              
              <div className="space-y-4">
                {options.filter(o => selectedCards.has(o.name) && !results.selected.some(s => s.name === o.name)).map((skipped, idx) => {
                  const pCount = itemPersons[skipped.name] !== undefined ? itemPersons[skipped.name] : 1;
                  const cost = skipped.type === 'per_person' ? skipped.cost * pCount : skipped.cost;
                  const originalOpt = options.find(o => o.name === skipped.name);
                  const fallbackImg = FALLBACK_IMAGES[skipped.category] || FALLBACK_IMAGES.Activity;

                  // Determine why it was rejected
                  let reason = "Suboptimal Profit-to-Weight Ratio";
                  if (cost > results.remainingBudget) reason = "Exceeds Remaining Capacity";
                  if (cost > results.totalBudget) reason = "Exceeds Total Capacity";

                  return (
                    <div key={idx} className="royal-panel flex overflow-hidden border-white/5 bg-[#0a1128]/50 opacity-70 grayscale-[0.5]">
                      <div className="w-1/4 h-auto relative border-r border-white/10">
                        <img 
                          src={originalOpt?.image || fallbackImg} 
                          onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
                          alt={skipped.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="w-3/4 p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <h4 className="text-base font-bold text-white/70 line-through">{skipped.name}</h4>
                          <span className="text-sm font-sans font-bold text-white/50">₹{cost.toLocaleString()}</span>
                        </div>
                        <div className="mt-3">
                          <span className="text-[10px] font-sans font-bold uppercase px-2 py-1 bg-red-900/40 text-red-300 border border-red-500/30 rounded">
                            {reason}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {options.filter(o => selectedCards.has(o.name) && !results.selected.some(s => s.name === o.name)).length === 0 && (
                  <p className="text-white/50 font-sans text-sm p-4 text-center">All your selected items were optimal and successfully packed into the knapsack!</p>
                )}
              </div>
            </div>

          </div>
        </main>
      )}
    </div>
  );
}

export default App;
