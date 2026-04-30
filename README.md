# 🌍 Smart Group Travel Planner

A real-world travel planning application that helps users choose the best combination of travel options within a fixed budget using **Dynamic Programming (0/1 Knapsack)**.

---

## 🚀 Project Overview

Planning a trip involves multiple choices — hotels, food, transport, and activities — all within a limited budget.

This application solves that problem by:
- Taking user inputs (location, budget, number of people)
- Fetching place-specific travel options
- Using Dynamic Programming to select the most valuable combination
- Providing optimal results + smart suggestions

---

## 🧠 Core Concept

This project is based on the **0/1 Knapsack Problem**, where:
- **Weight** → Cost
- **Profit** → Experience Score
- **Constraint** → Budget

The system selects options that:
- Maximize total experience
- Stay within budget
- Keep the number of people fixed

---

## 🌍 Supported Locations

- Goa
- Hyderabad
- Visakhapatnam
- Manali
- Kerala

Each location has predefined datasets including:
- Hotels
- Food options
- Activities
- Transport

---

## 👥 Inputs

Users provide:
- 📍 **Location**
- 👥 **Number of people** (fixed — not modified by algorithm)
- 💰 **Total budget**

---

## 📊 How It Works

**Step 1: Load Location Data**
Each location has:
- Cost
- Rating
- Type (per person / fixed)

**Step 2: Cost Calculation**
- If per person: `total_cost = cost × number_of_people`
- If fixed: `total_cost = cost`

**Step 3: Experience Score Calculation**
`score = rating × 2`

**Step 4: Dynamic Programming**
We apply the 0/1 Knapsack Algorithm to:
- Select or discard options
- Maximize total score
- Stay within budget

⚠️ **Important:**
- Number of people is never reduced.
- Only options are removed if needed.

**Step 5: Output**
The system provides:
- ✅ Optimal plan (selected options)
- 💰 Total cost used
- 🧾 Remaining budget
- ⭐ Total experience score

**Step 6: Smart Suggestions**
- **If budget remains:** Suggest additional options that fit within remaining budget
- **If over budget:** Automatically removes lower-value options

---

## 🖥️ Features

- 📦 Location-based datasets
- 👥 Group-aware cost calculation
- 🧠 Dynamic Programming optimization
- 📊 Real-time results
- 💡 Smart suggestions
- 🎨 Clean and elegant UI

---

## ⚙️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS

**Backend:**
- Node.js
- Express.js

---

## 📁 Project Structure

```text
project-root/
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── backend/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ▶️ How to Run

**1. Clone the repository**
```bash
git clone <your-repo-link>
cd project-root
```

**2. Backend Setup**
```bash
cd backend
npm install
npm run dev
```

**3. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

**4. Open in browser**
```text
http://localhost:5173
```

---

## 🔗 API Endpoints

- `GET /locations` → list of locations
- `GET /options/:location` → options for selected location
- `POST /optimize` → returns optimal plan

---

## 🧪 Example

**Input:**
- Location: Goa
- People: 4
- Budget: ₹10000

**Output:**
- Selected: Hotel + Food + Activity
- Remaining Budget: ₹1200
- Total Score: 26

---

## 🎯 Why This Project Stands Out

- Real-world use case 🌍
- Combines optimization + user preferences
- Demonstrates Dynamic Programming clearly
- Practical and scalable

---

## 💬 Key Concept Explanation

> *"Dynamic Programming is used to select the best combination of travel options that maximizes user experience while staying within the budget."*

---

## 🏁 Conclusion

This project shows how classic algorithms like Knapsack can be applied to real-life decision-making problems like travel planning.

---

## 🙌 Future Improvements

- Live API integration (Google Places, etc.)
- Personalized recommendations
- AI-based scoring system
- Step-by-step DP visualization

---

## 👨‍💻 Author

- **Your Name**
