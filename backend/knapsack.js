/**
 * 0/1 Knapsack DP Algorithm
 *
 * @param {Array} options  - Array of { name, category, total_cost, score }
 * @param {number} budget  - Integer budget in rupees
 * @returns {{ selected: Array, totalCost: number, totalScore: number }}
 */
function knapsack(options, budget) {
  const n = options.length;
  // Cap the budget to the maximum possible cost to prevent memory overflow (OOM)
  const maxPossibleCost = options.reduce((sum, item) => sum + Math.floor(item.total_cost), 0);
  const W = Math.min(budget, maxPossibleCost);

  // Build DP table: dp[i][w] = max score using first i items with capacity w
  // Use 1-indexed items for clarity
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const item = options[i - 1];
    const cost = Math.floor(item.total_cost); // ensure integer
    const score = item.score;

    for (let w = 0; w <= W; w++) {
      // Don't take item i
      dp[i][w] = dp[i - 1][w];

      // Take item i if it fits
      if (cost <= w) {
        const withItem = dp[i - 1][w - cost] + score;
        if (withItem > dp[i][w]) {
          dp[i][w] = withItem;
        }
      }
    }
  }

  // Backtrack to find which items were selected
  const selected = [];
  let w = W;
  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(options[i - 1]);
      w -= Math.floor(options[i - 1].total_cost);
    }
  }

  const totalCost = selected.reduce((sum, item) => sum + item.total_cost, 0);
  const totalScore = selected.reduce((sum, item) => sum + item.score, 0);

  return { selected, totalCost, totalScore };
}

module.exports = knapsack;
