# Mobile Device Market Analysis Dashboard

An interactive web-based dashboard for analyzing mobile device market trends, specifications, and pricing patterns. Built with modern web technologies including ApexCharts, Bootstrap, and vanilla JavaScript.

## Features

### 📊 Key Visualizations
- **KPI Cards**: Total Devices, Unique Brands, Median Launch Price (USA), Most Common RAM
- **Top 10 Processors by Device Count**: Bar chart showing processor market share
- **Top 10 Companies by Device Count**: Bar chart displaying brand popularity
- **Average Launched Price by Year**: Line chart showing pricing trends over time
- **Distribution of RAM Sizes**: Bar chart of RAM configuration prevalence
- **Device Launches and Median Price by Year**: Combo chart with dual metrics

### 🔍 Interactive Filters
- **Company Filter**: Multi-select dropdown to filter by brand
- **Year Range Slider**: Filter devices by launch year (2014-2025)
- **Price Range Slider**: Filter devices by USA launch price ($0-$3000)
- **RAM Size Filter**: Multi-select dropdown to filter by RAM capacity
- **Reset Filters Button**: Quickly reset all filters to default values

### 💡 Dynamic Insights
- Auto-generated insights for each visualization
- Real-time updates based on filtered data
- Data-driven market analysis and trends

### 🎨 Modern UI/UX
- Purple and blue color scheme with pastel accents
- Responsive grid-based layout
- Smooth animations and transitions
- Professional card-based design
- Mobile-friendly responsive design

## Dataset

**File**: `data/CLEANED MOBILE DATA SET Extract_Extract.csv`

**Contents** (915+ devices):
- Device specifications (camera, battery, RAM, processor, screen size)
- Pricing across 5 regions (USA, China, Dubai, India, Pakistan)
- Launch year and company information
- Device models and variants

## File Structure

```
dashboard/
├── index.html              # Main HTML structure
├── css/
│   └── style.css          # Comprehensive styling
├── js/
│   ├── main.js            # Core logic and chart creation
│   └── filters.js         # Filter state management
├── data/
│   └── CLEANED MOBILE DATA SET Extract_Extract.csv  # Dataset
└── README.md              # This file
```

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No backend server required - runs entirely in the browser

### Installation

1. **Download the files** and extract to your project folder
2. **Place the CSV file** in the `data/` directory
3. **Open `index.html`** in a web browser

```bash
# Simple HTTP server (optional, for local development)
python -m http.server 8000
# or
npx serve .
```

Then navigate to `http://localhost:8000` (or your chosen port)

## Technology Stack

### Frontend Libraries
- **Bootstrap 5.3**: Responsive CSS framework
- **ApexCharts**: Interactive chart library
- **Font Awesome 6.4**: Icon library
- **PapaParse**: CSV parsing library

### Core Technologies
- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript (ES6+)

## How to Use

### 1. View Full Dashboard
- Open the page to see all devices (915+) displayed
- All charts and KPI cards automatically load with the complete dataset

### 2. Filter Data
- **Select Companies**: Click Company filter dropdown and choose one or more brands
- **Set Year Range**: Drag the year sliders to select your desired year range
- **Set Price Range**: Drag the price sliders to filter by launch price
- **Select RAM Sizes**: Click RAM filter dropdown and choose configurations
- **Filters are cumulative**: Selecting multiple filters narrows results further

### 3. View Insights
- Each chart has accompanying **Key Insights** panel
- Insights update dynamically based on your filters
- Insights include statistics, trends, and market observations

### 4. Reset Filters
- Click the **Reset Filters** button to return to the full dataset
- All sliders return to defaults and dropdowns reset to "All"

## Key Features Explained

### KPI Cards
- **Total Devices**: Count of devices matching current filters
- **Unique Brands**: Number of distinct manufacturers represented
- **Median Launch Price**: Middle value of prices (USD)
- **Most Common RAM**: Mode (most frequent) RAM size

### Charts

#### Processors Chart
Shows which processors are most common in the filtered dataset. Useful for understanding market processor trends.

#### Companies Chart
Displays the number of models each brand has. Reveals which companies dominate the market.

#### Price Trend Chart
Shows how average device prices have changed year over year. Reveals market price inflation/deflation.

#### RAM Distribution Chart
Shows the prevalence of different RAM configurations. Reveals market focus areas.

#### Device Launches Chart
Combines two metrics: the number of devices launched per year (columns) and their median price (line). Shows market activity and pricing evolution.

## Color Scheme

- **Primary Purple**: #9C9EFE
- **Primary Blue**: #8B9FFF
- **Light Blue**: #A5B4FC
- **Accent Green**: #10B981 (KPI card)
- **Accent Purple**: #A78BFA (KPI card)
- **Accent Pink**: #EC4899 (KPI card)

## Performance

- **Data Loading**: ~1-2 seconds for full dataset
- **Filter Response**: Real-time updates (<100ms)
- **Chart Rendering**: Smooth animations with immediate display
- **Memory**: Efficient data structures for 900+ devices

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Charts not displaying?
- Ensure ApexCharts CDN is accessible
- Check browser console for errors (F12)
- Verify CSV file path is correct

### Filters not working?
- Ensure JavaScript is enabled
- Check that filter elements have correct IDs
- Verify data is loaded (check console)

### CSV not loading?
- Verify file path: `data/CLEANED MOBILE DATA SET Extract_Extract.csv`
- Ensure CSV file exists and has correct columns
- Check browser console for CORS or file not found errors

## Data Columns

The CSV should contain these columns:
- `Model Name`: Device model identifier
- `Company Name`: Manufacturer name
- `Launched Year`: Year of release
- `Launched Price (USA)`: Price in USD
- `RAM`: RAM size (e.g., "8GB")
- `Processor`: Processor name
- `Battery Capacity`: Battery size
- `Screen Size`: Display size
- `Back Camera`: Rear camera specs
- And other device specifications

## Future Enhancements

Potential additions:
- Export filtered data to CSV/PDF
- Compare devices side-by-side
- Regional price comparison
- Device specifications search
- Processor comparison tool
- Predictive pricing trends
- Dark mode toggle

## License

MIT License - Feel free to use and modify

## Support

For issues or questions about the dashboard, check the browser console (F12) for error messages and ensure:
1. All files are in correct locations
2. CSV file is properly formatted
3. JavaScript is enabled in browser
4. Internet connection is available (for CDN libraries)

## Credits

- **Data Source**: CLEANED MOBILE DATA SET Extract_Extract.csv
- **Charts**: ApexCharts
- **Framework**: Bootstrap 5.3
- **Icons**: Font Awesome 6.4
- **CSV Parsing**: PapaParse
