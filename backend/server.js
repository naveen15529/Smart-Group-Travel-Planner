const express = require("express");
const cors = require("cors");
const travelData = require("./data");
const knapsack = require("./knapsack");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// GET /locations  →  list all location names
// ─────────────────────────────────────────────
app.get("/locations", (req, res) => {
  const locations = Object.keys(travelData);
  res.json({ locations });
});

// ─────────────────────────────────────────────
// GET /options/:location  →  raw options list
// ─────────────────────────────────────────────
app.get("/options/:location", (req, res) => {
  const { location } = req.params;
  const options = travelData[location];

  if (!options) {
    return res.status(404).json({ error: `Location "${location}" not found.` });
  }

  res.json({ location, options });
});

// ─────────────────────────────────────────────
// POST /optimize  →  run 0/1 knapsack DP
// Body: { location, budget, itemPersons (optional mapping) }
// ─────────────────────────────────────────────
app.post("/optimize", (req, res) => {
  const { location, budget, itemPersons } = req.body;

  // Validation
  if (!location || !budget) {
    return res.status(400).json({ error: "location and budget are required." });
  }

  const rawOptions = travelData[location];
  if (!rawOptions) {
    return res.status(404).json({ error: `Location "${location}" not found.` });
  }

  const totalBudget = parseInt(budget, 10);
  if (isNaN(totalBudget) || totalBudget < 1) {
    return res.status(400).json({ error: "budget must be a positive integer." });
  }

  // Evaluate ALL items to maximize profit.
  // Profit = Rating.
  const options = rawOptions.map((opt, idx) => {
    // Check if the user specified a specific number of persons for this item
    let pCount = 1;
    if (itemPersons && itemPersons[opt.name] !== undefined) {
      pCount = parseInt(itemPersons[opt.name], 10);
      if (isNaN(pCount) || pCount < 1) pCount = 1;
    }

    return {
      id: idx,
      name: opt.name,
      category: opt.category,
      cost: opt.cost,
      type: opt.type,
      rating: opt.rating,
      persons: pCount,
      total_cost: opt.type === "per_person" ? opt.cost * pCount : opt.cost,
      score: parseFloat((opt.rating * 2).toFixed(2)),
    };
  });

  // Run 0/1 Knapsack DP over ALL options to maximize the score (profit)
  const { selected, totalCost, totalScore } = knapsack(options, totalBudget);

  const remainingBudget = totalBudget - totalCost;

  // Find suggestions: options NOT in selected that fit remaining budget
  const selectedIds = new Set(selected.map((s) => s.id));
  const suggestions = options.filter(
    (opt) => !selectedIds.has(opt.id) && opt.total_cost <= remainingBudget
  );

  res.json({
    selected,
    totalCost,
    remainingBudget,
    totalScore: parseFloat(totalScore.toFixed(2)),
    suggestions,
    totalBudget,
    location
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Smart Travel Planner Backend running at http://localhost:${PORT}`);
  console.log(`   → GET  /locations`);
  console.log(`   → GET  /options/:location`);
  console.log(`   → POST /optimize\n`);
});
