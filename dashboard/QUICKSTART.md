# Quick Start Guide

Get your Mobile Device Market Analysis Dashboard running in 3 steps!

## ⚡ Quick Setup

### Step 1: Verify File Structure
Ensure your folder looks like this:
```
dashboard/
├── index.html
├── css/style.css
├── js/main.js
├── js/filters.js
├── data/CLEANED MOBILE DATA SET Extract_Extract.csv
└── README.md
```

### Step 2: Open the Dashboard
Simply **double-click** `index.html` or right-click and select "Open with" your browser.

**That's it!** The dashboard will load automatically with all 915+ devices.

### Step 3: Start Exploring
- View KPI cards at the top (Total Devices, Brands, Price, RAM)
- Scroll down to see 5 interactive charts
- Use filters on the left to narrow down data
- Read Key Insights for each chart

## 🎯 Common Tasks

### Filter by Company
1. Click the **Company** dropdown
2. Select one or more brands (e.g., Apple, Samsung)
3. Charts update instantly

### Set Year Range
1. Drag **Launch Year** slider
2. All visualizations update automatically
3. Use to see trends over time

### Filter by Price
1. Drag **Price (USD)** slider
2. Shows devices in your price range
3. See how pricing changes by year

### Filter by RAM
1. Click **RAM Size** dropdown
2. Select desired RAM sizes
3. See RAM configuration trends

### Reset Everything
Click **Reset Filters** button to return to full dataset

## 📊 What Each Chart Shows

| Chart | Purpose | Use Case |
|-------|---------|----------|
| **Processors** | Top 10 processors in market | Understand processor trends |
| **Companies** | Brand popularity | See market leaders |
| **Price Trend** | Pricing over time | Track market pricing |
| **RAM Distribution** | RAM configuration prevalence | See mainstream specs |
| **Device Launches** | Launches & pricing evolution | Track market activity |

## 💡 Insights Explained

Each chart has a **Key Insights** panel showing:
- Market leaders and trends
- Percentages and market share
- Notable statistics

## 🔍 Pro Tips

✅ **Combine filters** for detailed analysis
- E.g., Apple + 2020-2023 + $600-$1200 price range

✅ **Look for patterns** in the insights
- Processor market dominance
- Company portfolio sizes
- Price evolution trends

✅ **Use year slider** to see device launch timing
- Early launches vs recent
- Market consolidation over time

✅ **Compare RAM** to see market standards
- 8GB dominates mid-range
- 12GB+ for premium devices

## ❓ Troubleshooting

### Charts are blank?
- Check browser console (F12 → Console tab)
- Ensure CSV file exists in `data/` folder
- Try refreshing the page

### Filters not working?
- Refresh the page
- Check that JavaScript is enabled
- Clear browser cache and reload

### Data not loading?
- Verify CSV filename matches exactly
- Check file path: `data/CLEANED MOBILE DATA SET Extract_Extract.csv`
- Try opening in a different browser

## 📱 Mobile View

Dashboard is **fully responsive**:
- Works on tablets and phones
- Charts resize automatically
- Touch-friendly controls

## 🌐 Server Setup (Optional)

For development with hot-reload:

**Python:**
```bash
python -m http.server 8000
# Visit: http://localhost:8000
```

**Node.js:**
```bash
npx serve
# Opens automatically in browser
```

## 🎨 Customization

Want to modify colors? Edit `css/style.css`:
```css
:root {
    --primary-purple: #9C9EFE;    /* Change header color */
    --accent-pink: #EC4899;        /* Change accent color */
}
```

## 📚 Learn More

See `README.md` for:
- Detailed feature descriptions
- Technology stack information
- Browser compatibility
- Advanced usage

## 🚀 You're Ready!

Your dashboard is now running. Start exploring the mobile device market data!

**Happy analyzing!** 📊✨
