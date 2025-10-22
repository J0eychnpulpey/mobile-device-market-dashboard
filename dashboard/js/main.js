// Global variables
let fullData = [];
let filteredData = [];
let charts = {};
let batteryChartSortOrder = 'count-desc'; // 'asc' or 'desc'
let marketAffordabilityChart = null;
let countryPriceChart = null;

// Helper function to parse prices with currency codes
function parsePrice(priceStr) {
    if (!priceStr) return NaN;
    // Remove currency codes (USD, CNY, AED, etc.), commas, and whitespace
    const cleaned = priceStr.toString()
        .replace(/[A-Z]{3}\s*/g, '') // Remove currency codes like "USD "
        .replace(/,/g, '') // Remove commas
        .trim();
    return parseFloat(cleaned);
}

// Helper function to parse battery capacity
function parseBattery(batteryStr) {
    if (!batteryStr) return NaN;
    const cleaned = batteryStr.toString().replace(/mAh/g, '').replace(/,/g, '').trim();
    return parseInt(cleaned, 10);
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadAndProcessData();
});

// Load CSV data using PapaParse
function loadAndProcessData() {
    const csvUrl = 'data/CLEANED MOBILE DATA SET Extract_Extract.csv';
    
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            fullData = results.data.filter(row => row['Model Name']); // Remove empty rows
            console.log('Data loaded:', fullData.length, 'devices');
            
            initializeDashboard();
        },
        error: function(error) {
            console.error('Error loading CSV:', error);
            showError('Failed to load data. Please check the CSV file path.');
        }
    });
}

// Initialize dashboard components
function initializeDashboard() {
    filteredData = JSON.parse(JSON.stringify(fullData));
    
    populateFilterOptions();
    populateRAMFilterButtons();
    attachFilterListeners();
    updateDashboard();
}

// Populate filter dropdowns
function populateFilterOptions() {
    const companies = [...new Set(fullData.map(d => d['Company Name']).filter(Boolean))].sort();
    
    const companySelect = document.getElementById('companyFilter');
    
    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        companySelect.appendChild(option);
    });

}

// Populate RAM filter buttons
function populateRAMFilterButtons() {
    const ramSizes = [...new Set(fullData.map(d => d['RAM']).filter(Boolean))].sort((a, b) => {
        const aNum = parseFloat(a);
        const bNum = parseFloat(b);
        return aNum - bNum;
    });
    
    const buttonsContainer = document.querySelector('.ram-filter-buttons');
    
    // Add event listener to the "All" button that's already in HTML
    const allButton = buttonsContainer.querySelector('[data-ram="all"]');
    if (allButton) {
        allButton.addEventListener('click', function() {
            handleRAMButtonClick(this);
        });
    }
    
    // Add other RAM size buttons
    ramSizes.forEach(ram => {
        const button = document.createElement('button');
        button.className = 'ram-btn';
        button.textContent = ram;
        button.dataset.ram = ram;
        button.addEventListener('click', function() {
            handleRAMButtonClick(this);
        });
        buttonsContainer.appendChild(button);
    });
}

// Attach filter event listeners
function attachFilterListeners() {
    document.getElementById('companyFilter').addEventListener('change', applyFilters);
    document.getElementById('yearMinFilter').addEventListener('input', applyFilters);
    document.getElementById('yearMaxFilter').addEventListener('input', applyFilters);
    document.getElementById('priceMinFilter').addEventListener('input', applyFilters);
    document.getElementById('priceMaxFilter').addEventListener('input', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);

    // Add event listeners for numeric input controls (up/down arrows)
    setupNumericInputControls();

    // Event listeners for battery sort buttons
    document.querySelectorAll('.battery-sort-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.battery-sort-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            batteryChartSortOrder = this.dataset.sort;
            updateBatteryChart();
        });
    });
}

// Setup numeric input controls (up/down arrows)
function setupNumericInputControls() {
    // Year filter controls
    const yearMinInput = document.getElementById('yearMinInput');
    const yearMaxInput = document.getElementById('yearMaxInput');
    const yearMinSlider = document.getElementById('yearMinFilter');
    const yearMaxSlider = document.getElementById('yearMaxFilter');
    
    // Price filter controls
    const priceMinInput = document.getElementById('priceMinInput');
    const priceMaxInput = document.getElementById('priceMaxInput');
    const priceMinSlider = document.getElementById('priceMinFilter');
    const priceMaxSlider = document.getElementById('priceMaxFilter');

    // Year input to slider sync
    if (yearMinInput && yearMinSlider) {
        yearMinInput.addEventListener('input', function() {
            yearMinSlider.value = this.value;
            applyFilters();
        });
    }
    
    if (yearMaxInput && yearMaxSlider) {
        yearMaxInput.addEventListener('input', function() {
            yearMaxSlider.value = this.value;
            applyFilters();
        });
    }

    // Year slider to input sync
    if (yearMinSlider && yearMinInput) {
        yearMinSlider.addEventListener('input', function() {
            yearMinInput.value = this.value;
            applyFilters();
        });
    }
    
    if (yearMaxSlider && yearMaxInput) {
        yearMaxSlider.addEventListener('input', function() {
            yearMaxInput.value = this.value;
            applyFilters();
        });
    }

    // Price input to slider sync
    if (priceMinInput && priceMinSlider) {
        priceMinInput.addEventListener('input', function() {
            priceMinSlider.value = this.value;
            applyFilters();
        });
    }
    
    if (priceMaxInput && priceMaxSlider) {
        priceMaxInput.addEventListener('input', function() {
            priceMaxSlider.value = this.value;
            applyFilters();
        });
    }

    // Price slider to input sync
    if (priceMinSlider && priceMinInput) {
        priceMinSlider.addEventListener('input', function() {
            priceMinInput.value = this.value;
            applyFilters();
        });
    }
    
    if (priceMaxSlider && priceMaxInput) {
        priceMaxSlider.addEventListener('input', function() {
            priceMaxInput.value = this.value;
            applyFilters();
        });
    }
}

// Handle RAM button clicks
function handleRAMButtonClick(button) {
    const ramValue = button.dataset.ram;
    
    if (ramValue === 'all') {
        // Deselect all other buttons
        document.querySelectorAll('.ram-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    } else {
        // Toggle the clicked button
        const allButton = document.querySelector('[data-ram="all"]');
        
        if (button.classList.contains('active')) {
            button.classList.remove('active');
            // If no buttons selected, select "All"
            const anyActive = document.querySelectorAll('.ram-btn.active:not([data-ram="all"])').length > 0;
            if (!anyActive) {
                allButton.classList.add('active');
            }
        } else {
            button.classList.add('active');
            allButton.classList.remove('active');
        }
    }
    
    // Only update the RAM chart, not all charts
    updateRAMChart();
}

// Apply filters to data
function applyFilters() {
    const companySelect = document.getElementById('companyFilter');
    
    let companies = Array.from(companySelect.selectedOptions)
        .map(o => o.value)
        .filter(v => v !== 'all'); // Remove "all" option
    
    // Get selected RAM sizes from buttons
    let ramSizes = [];
    document.querySelectorAll('.ram-btn.active').forEach(btn => {
        const ram = btn.dataset.ram;
        if (ram !== 'all') {
            ramSizes.push(ram);
        }
    });
    
    const yearMin = parseInt(document.getElementById('yearMinFilter').value);
    const yearMax = parseInt(document.getElementById('yearMaxFilter').value);
    const priceMin = parseInt(document.getElementById('priceMinFilter').value);
    const priceMax = parseInt(document.getElementById('priceMaxFilter').value);
    
    // Filter data
    filteredData = fullData.filter(device => {
        const deviceYear = parseInt(device['Launched Year']) || 0;
        const devicePrice = parsePrice(device['Launched Price (USA)']);
        const deviceRAM = device['RAM'];
        const deviceCompany = device['Company Name'];
        const companyMatch = companies.length === 0 || companies.includes(deviceCompany);
        const yearMatch = deviceYear >= yearMin && deviceYear <= yearMax;
        // Include devices with missing prices (NaN) OR with prices in range
        const priceMatch = isNaN(devicePrice) || (devicePrice >= priceMin && devicePrice <= priceMax);
        const ramMatch = ramSizes.length === 0 || ramSizes.includes(deviceRAM);
        
        return companyMatch && yearMatch && priceMatch && ramMatch;
    });
    
    updateDashboard();
}

// Reset all filters
function resetFilters() {
    document.getElementById('companyFilter').selectedIndex = 0;
    document.getElementById('yearMinFilter').value = 2014;
    document.getElementById('yearMaxFilter').value = 2025;
    document.getElementById('priceMinFilter').value = 0;
    document.getElementById('priceMaxFilter').value = 3000;
    

    // Reset sort buttons
    document.querySelectorAll('.battery-sort-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.battery-sort-btn[data-sort="count-desc"]').classList.add('active');
    batteryChartSortOrder = 'count-desc';

    // Reset RAM filter buttons
    document.querySelectorAll('.ram-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-ram="all"]').classList.add('active');
    
    applyFilters();
}

// Update all dashboard components
function updateDashboard() {
    updateKPIs();
    updateProcessorChart();
    updateCompanyChart();
    updatePriceTrendChart();
    updateRAMChart();
    updateLaunchesChart();
    updateLaunchesByCompanyChart();
    updateBatteryChart();
    updateMarketAffordabilityChart();
    updateCountryPriceChart();
}

// Get RAM-specific filtered data (separate from global filters)
function getRAMFilteredData() {
    // Get selected RAM sizes from buttons
    let ramSizes = [];
    document.querySelectorAll('.ram-btn.active').forEach(btn => {
        const ram = btn.dataset.ram;
        if (ram !== 'all') {
            ramSizes.push(ram);
        }
    });
    
    // If no specific RAM sizes selected (or "All" is selected), return all filtered data
    if (ramSizes.length === 0) {
        return filteredData;
    }
    
    // Filter by selected RAM sizes
    return filteredData.filter(device => {
        const deviceRAM = device['RAM'];
        return ramSizes.includes(deviceRAM);
    });
}

// Calculate and update KPIs
function updateKPIs() {
    const totalDevices = filteredData.length;
    const uniqueBrands = new Set(filteredData.map(d => d['Company Name'])).size;
    
    const prices = filteredData
        .map(d => parsePrice(d['Launched Price (USA)']))
        .filter(p => !isNaN(p))
        .sort((a, b) => a - b);
    
    const medianPrice = prices.length > 0 
        ? prices[Math.floor(prices.length / 2)] 
        : 0;
    
    const ramCounts = {};
    filteredData.forEach(d => {
        const ram = d['RAM'];
        ramCounts[ram] = (ramCounts[ram] || 0) + 1;
    });
    
    const mostCommonRAM = Object.keys(ramCounts).reduce((a, b) => 
        ramCounts[a] > ramCounts[b] ? a : b, 'N/A');
    
    document.getElementById('totalDevices').textContent = totalDevices.toLocaleString();
    document.getElementById('uniqueBrands').textContent = uniqueBrands;
    document.getElementById('medianPrice').textContent = `$${medianPrice.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
    document.getElementById('commonRAM').textContent = mostCommonRAM;
}

// Update processor chart
function updateProcessorChart() {
    const processorCounts = {};
    
    filteredData.forEach(device => {
        const processor = device['Processor'] || 'Unknown';
        processorCounts[processor] = (processorCounts[processor] || 0) + 1;
    });
    
    const sorted = Object.entries(processorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const categories = sorted.map(item => {
        const name = item[0];
        return name.length > 20 ? name.substring(0, 17) + '...' : name;
    });
    const data = sorted.map(item => item[1]);
    
    const options = {
        chart: { 
            type: 'bar', 
            height: 300, 
            toolbar: { show: false },
            fontFamily: 'inherit'
        },
        series: [{ name: 'Device Count', data: data }],
        xaxis: { 
            categories: categories,
            labels: {
                show: false
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '11px'
                }
            }
        },
        plotOptions: {
            bar: { distributed: true, horizontal: false, dataLabels: { position: 'top' } }
        },
        colors: ['#9C9EFE', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1'],
        grid: { show: false },
        dataLabels: {
            enabled: false
        },
        tooltip: { 
            theme: 'light',
            style: {
                fontSize: '12px'
            }
        },
        states: { hover: { filter: { type: 'darken', value: 0.1 } } },
        legend: {
            show: true,
            position: 'bottom',
            horizontalAlign: 'center',
            labels: {
                colors: '#6B7280',
                useSeriesColors: false
            },
            markers: {
                width: 12,
                height: 12,
                radius: 3
            },
            itemMargin: {
                horizontal: 8,
                vertical: 4
            }
        }
    };
    
    if (charts.processor) charts.processor.destroy();
    charts.processor = new ApexCharts(document.querySelector("#processorChart"), options);
    charts.processor.render();
    
    generateProcessorInsights(sorted);
}

// Generate processor insights
function generateProcessorInsights(data) {
    const companySelect = document.getElementById('companyFilter');
    const selectedCompanies = Array.from(companySelect.selectedOptions).map(o => o.value).filter(v => v !== 'all' && v !== '');

    if (data.length === 0) {
        document.getElementById('processorInsights').innerHTML = '<p>No processor data available.</p>';
        return;
    }

    const topProcessor = data[0];
    let insights = '';

    if (selectedCompanies.length === 1) {
        insights = `
            <ul>
                <li>For <strong>${selectedCompanies[0]}</strong>, the most frequent processor is <strong>${topProcessor[0]}</strong> with <strong>${topProcessor[1]}</strong> devices.</li>
                <li>Displaying the top <strong>${data.length}</strong> processors for the selected company.</li>
            </ul>
        `;
    } else {
        const totalTop10Devices = data.reduce((sum, item) => sum + item[1], 0);
        const top3DeviceCount = data.slice(0, 3).reduce((sum, item) => sum + item[1], 0);
        const top3Percentage = totalTop10Devices > 0 ? ((top3DeviceCount / totalTop10Devices) * 100).toFixed(0) : 0;
        insights = `
            <ul>
                <li><strong>${topProcessor[0]}</strong> is the most frequent processor overall with <strong>${topProcessor[1]}</strong> devices.</li>
                <li>The top 3 processors are found in <strong>${top3Percentage}%</strong> of the top 10 devices shown.</li>
            </ul>
        `;
    }
    document.getElementById('processorInsights').innerHTML = insights;
}

// Update company chart
function updateCompanyChart() {
    const companyCounts = {};
    
    filteredData.forEach(device => {
        const company = device['Company Name'] || 'Unknown';
        companyCounts[company] = (companyCounts[company] || 0) + 1;
    });
    
    const sorted = Object.entries(companyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const categories = sorted.map(item => item[0]);
    const data = sorted.map(item => item[1]);
    
    const options = {
        chart: { 
            type: 'bar', 
            height: 300, 
            toolbar: { show: false },
            fontFamily: 'inherit'
        },
        series: [{ name: 'Device Count', data: data }],
        xaxis: { 
            categories: categories,
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '11px'
                }
            }
        },
        plotOptions: {
            bar: { distributed: true, horizontal: false, dataLabels: { position: 'top' } }
        },
        colors: ['#9C9EFE', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1'],
        grid: { show: false },
        tooltip: { 
            theme: 'light',
            style: {
                fontSize: '12px'
            }
        },
        legend: {
            labels: {
                colors: '#6B7280'
            }
        }
    };
    
    if (charts.company) charts.company.destroy();
    charts.company = new ApexCharts(document.querySelector("#companyChart"), options);
    charts.company.render();
    
    generateCompanyInsights(sorted);
}

// Generate company insights
function generateCompanyInsights(data) {
    if (data.length === 0) {
        document.getElementById('companyInsights').innerHTML = '<p>No company data available.</p>';
        return;
    }

    const topCompany = data[0];
    const totalTop10Devices = data.reduce((sum, item) => sum + item[1], 0);
    const top3DeviceCount = data.slice(0, 3).reduce((sum, item) => sum + item[1], 0);
    const top3Percentage = totalTop10Devices > 0 ? ((top3DeviceCount / totalTop10Devices) * 100).toFixed(0) : 0;

    const insights = `
        <ul>
            <li><strong>${topCompany[0]}</strong> leads this group with <strong>${topCompany[1]}</strong> devices shown.</li>
            <li>The top 3 companies shown account for <strong>${top3Percentage}%</strong> of the devices from the top 10.</li>
        </ul>
    `;
    document.getElementById('companyInsights').innerHTML = insights;
}

// Update price trend chart
function updatePriceTrendChart() {
    const priceByYear = {};
    
    filteredData.forEach(device => {
        const year = device['Launched Year'];
        const price = parsePrice(device['Launched Price (USA)']);
        
        if (year && !isNaN(price)) {
            if (!priceByYear[year]) {
                priceByYear[year] = [];
            }
            priceByYear[year].push(price);
        }
    });
    
    const sorted = Object.keys(priceByYear).sort().slice(0, 20);
    const avgPrices = sorted.map(year => {
        const prices = priceByYear[year];
        return (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
    });
    
    const options = {
        chart: { 
            type: 'line', 
            height: 300, 
            toolbar: { show: false },
            fontFamily: 'inherit'
        },
        series: [{ name: 'Avg Price (USD)', data: avgPrices.map(p => parseFloat(p)) }],
        xaxis: { 
            categories: sorted,
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '11px'
                }
            }
        },
        colors: ['#A78BFA'],
        stroke: { curve: 'smooth', width: 3 },
        grid: { show: false },
        tooltip: { 
            theme: 'light',
            style: {
                fontSize: '12px'
            }
        },
        markers: {
            size: 4,
            hover: {
                size: 6
            }
        },
        legend: {
            labels: {
                colors: '#6B7280'
            }
        }
    };
    
    if (charts.priceTrend) charts.priceTrend.destroy();
    charts.priceTrend = new ApexCharts(document.querySelector("#priceTrendChart"), options);
    charts.priceTrend.render();
    
    generatePriceTrendInsights(sorted, avgPrices);
}

// Generate price trend insights
function generatePriceTrendInsights(years, prices) {
    if (years.length === 0) {
        document.getElementById('priceTrendInsights').innerHTML = '<p>No data available</p>';
        return;
    }
    
    const minYear = years[0];
    const maxYear = years[years.length - 1];
    const minPrice = Math.min(...prices.map(p => parseFloat(p)));
    const maxPrice = Math.max(...prices.map(p => parseFloat(p)));
    const trend = parseFloat(prices[prices.length - 1]) > parseFloat(prices[0]) ? 'increased' : 'decreased';
    
    const insights = `
        <ul>
            <li>Price range: <strong>$${minPrice.toFixed(0)}</strong> to <strong>$${maxPrice.toFixed(0)}</strong></li>
            <li>Prices have <strong>${trend}</strong> from ${minYear} to ${maxYear}</li>
            <li>Average across period: <strong>$${(prices.reduce((a, b) => a + parseFloat(b), 0) / prices.length).toFixed(0)}</strong></li>
        </ul>
    `;
    document.getElementById('priceTrendInsights').innerHTML = insights;
}

// Update RAM distribution chart
function updateRAMChart() {
    // Get RAM-specific filtered data
    const ramFilteredData = getRAMFilteredData();
    const ramCounts = {};
    
    ramFilteredData.forEach(device => {
        const ram = device['RAM'];
        ramCounts[ram] = (ramCounts[ram] || 0) + 1;
    });
    
    const sorted = Object.entries(ramCounts).sort((a, b) => {
        // Extract the first number from RAM strings like "8GB / 12GB" or "8GB"
        const aNum = parseFloat(a[0].match(/[\d.]+/)?.[0] || 0);
        const bNum = parseFloat(b[0].match(/[\d.]+/)?.[0] || 0);
        return aNum - bNum;
    });
    
    const categories = sorted.map(item => item[0]);
    const data = sorted.map(item => item[1]);
    
    const options = {
        chart: { 
            type: 'bar', 
            height: 300, 
            toolbar: { show: false },
            fontFamily: 'inherit'
        },
        series: [{ name: 'Count', data: data }],
        xaxis: { 
            categories: categories,
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '11px'
                }
            }
        },
        plotOptions: {
            bar: { distributed: true, horizontal: false, dataLabels: { position: 'top' } }
        },
        colors: ['#10B981'],
        grid: { show: false },
        tooltip: { 
            theme: 'light',
            style: {
                fontSize: '12px'
            }
        },
        legend: {
            labels: {
                colors: '#6B7280'
            }
        }
    };
    
    if (charts.ram) charts.ram.destroy();
    charts.ram = new ApexCharts(document.querySelector("#ramChart"), options);
    charts.ram.render();
    
    generateRAMInsights(sorted);
}

// Generate RAM insights
function generateRAMInsights(data) {
    const companySelect = document.getElementById('companyFilter');
    const selectedCompanies = Array.from(companySelect.selectedOptions).map(o => o.value).filter(v => v !== 'all' && v !== '');

    if (data.length === 0) {
        document.getElementById('ramInsights').innerHTML = '<p>No RAM data available.</p>';
        return;
    }

    const sortedByCount = [...data].sort((a, b) => b[1] - a[1]);
    
    if (sortedByCount.length === 0) {
        document.getElementById('ramInsights').innerHTML = '<p>No RAM data available.</p>';
        return;
    }

    const topCount = sortedByCount[0][1];
    const mostCommon = sortedByCount.filter(item => item[1] === topCount);
    
    let mostCommonText;
    if (mostCommon.length > 1) {
        const ramList = mostCommon.map(item => `<strong>${item[0]}</strong>`).join(' & ');
        mostCommonText = `the most common RAM sizes are ${ramList}, each with <strong>${topCount}</strong> devices.`;
    } else {
        mostCommonText = `the most common RAM size is <strong>${mostCommon[0][0]}</strong> with <strong>${mostCommon[0][1]}</strong> devices.`;
    }

    let insights = '';
    if (selectedCompanies.length === 1) {
        insights = `<ul><li>For <strong>${selectedCompanies[0]}</strong>, ${mostCommonText}</li></ul>`;
    } else {
        insights = `<ul><li>${mostCommonText.charAt(0).toUpperCase() + mostCommonText.slice(1)}</li></ul>`;
    }
    document.getElementById('ramInsights').innerHTML = insights;
}

// Update launches and price combo chart
function updateLaunchesChart() {
    const companySelect = document.getElementById('companyFilter');
    const selectedCompanies = Array.from(companySelect.selectedOptions).map(o => o.value).filter(v => v !== 'all' && v !== '');
    const isSingleCompany = selectedCompanies.length === 1;

    const launchByYear = {};
    const priceByYear = {};
    
    filteredData.forEach(device => {
        const year = device['Launched Year'];
        const price = parsePrice(device['Launched Price (USA)']);
        
        if (year) {
            launchByYear[year] = (launchByYear[year] || 0) + 1;
            if (!isNaN(price)) {
                if (!priceByYear[year]) {
                    priceByYear[year] = [];
                }
                priceByYear[year].push(price);
            }
        }
    });
    
    const sorted = Object.keys(launchByYear).sort();
    const launchCounts = sorted.map(year => launchByYear[year]);
    const medianPrices = sorted.map(year => {
        const prices = priceByYear[year] || [];
        if (prices.length === 0) return 0;
        const sorted = prices.sort((a, b) => a - b);
        return sorted[Math.floor(sorted.length / 2)];
    });
    
    // Create series based on filter state
    let series;
    if (isSingleCompany) {
        // Only show Median Price series for single company
        series = [
            { name: 'Median Price (USD)', type: 'line', data: medianPrices }
        ];
    } else {
        // Show both series for all companies
        series = [
            { name: 'Device Count', type: 'column', data: launchCounts },
            { name: 'Median Price (USD)', type: 'line', data: medianPrices }
        ];
    }

    // Update HTML title based on company filter
    const chartTitle = isSingleCompany 
        ? `Median Price (USA) by Year - ${selectedCompanies[0]}`
        : 'Device Launches and Median Price (USA) by Year';
    
    // Update the HTML title
    const titleElement = document.getElementById('launchesChartTitle');
    if (titleElement) {
        titleElement.textContent = chartTitle;
    }

    const options = {
        chart: { 
            type: 'bar', 
            height: 300, 
            toolbar: { show: false },
            fontFamily: 'inherit',
            sparkline: { enabled: false }
        },
        series: series,
        xaxis: { 
            categories: sorted,
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '12px'
                }
            }
        },
        yaxis: isSingleCompany ? [
            { 
                title: { 
                    text: 'Median Price (USD)',
                    style: {
                        color: '#6B7280',
                        fontSize: '12px',
                        fontWeight: 400
                    }
                },
                labels: {
                    style: {
                        colors: '#6B7280',
                        fontSize: '11px'
                    }
                }
            }
        ] : [
            { 
                title: { 
                    text: 'Device Count',
                    style: {
                        color: '#6B7280',
                        fontSize: '12px',
                        fontWeight: 400
                    }
                },
                labels: {
                    style: {
                        colors: '#6B7280',
                        fontSize: '11px'
                    }
                }
            },
            { 
                opposite: true, 
                title: { 
                    text: 'Median Price (USD)',
                    style: {
                        color: '#6B7280',
                        fontSize: '12px',
                        fontWeight: 400
                    }
                },
                labels: {
                    style: {
                        colors: '#6B7280',
                        fontSize: '11px'
                    }
                }
            }
        ],
        colors: isSingleCompany ? ['#EC4899'] : ['#9C9EFE', '#EC4899'],
        legend: {
            show: true,
            showForSingleSeries: true,
            showForNullSeries: false,
            showForZeroSeries: false,
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '12px',
            fontFamily: 'inherit',
            labels: {
                colors: '#6B7280'
            }
        },
        grid: { show: false },
        tooltip: { 
            theme: 'light',
            style: {
                fontSize: '12px'
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        markers: {
            size: 4,
            hover: {
                size: 6
            }
        },
        dataLabels: {
            enabled: true,
            enabledOnSeries: [1],
            style: {
                fontSize: '12px',
                fontWeight: 'bold',
                colors: ['#000000']
            },
            background: {
                enabled: true,
                foreColor: '#FFFFFF',
                borderRadius: 4,
                padding: 6,
                opacity: 1,
                borderWidth: 1,
                borderColor: '#E5E7EB'
            },
            offsetY: -10,
            dropShadow: {
                enabled: true,
                top: 1,
                left: 1,
                blur: 1,
                opacity: 0.2
            }
        },
        legend: {
            labels: {
                colors: '#6B7280',
                useSeriesColors: false
            },
            fontSize: '12px',
            fontWeight: 400
        },
        plotOptions: {
            bar: {
                columnWidth: '75%'
            }
        }
    };
    
    if (charts.launches) charts.launches.destroy();
    charts.launches = new ApexCharts(document.querySelector("#launchesChart"), options);
    charts.launches.render();
    
    generateLaunchesInsights(sorted, launchCounts);
}

// Generate launches insights
function generateLaunchesInsights(years, counts) {
    if (years.length === 0) {
        document.getElementById('launchesInsights').innerHTML = '<p>No data available</p>';
        return;
    }
    
    const maxYear = years[counts.indexOf(Math.max(...counts))];
    const maxCount = Math.max(...counts);
    const totalLaunches = counts.reduce((a, b) => a + b, 0);
    
    const insights = `
        <ul>
            <li><strong>${maxYear}</strong> had the most launches with <strong>${maxCount}</strong> devices</li>
            <li>Total launches across period: <strong>${totalLaunches}</strong></li>
            <li>Average launches per year: <strong>${(totalLaunches / years.length).toFixed(0)}</strong></li>
        </ul>
    `;
    document.getElementById('launchesInsights').innerHTML = insights;
}

// Update Device Launches by Company chart
function updateLaunchesByCompanyChart() {
    const companySelect = document.getElementById('companyFilter');
    const selectedCompanies = Array.from(companySelect.selectedOptions)
        .map(o => o.value)
        .filter(v => v !== 'all' && v !== '');

    const titleElement = document.getElementById('launchesByCompanyTitle');
    let companiesToShow = [];
    let chartTitle = '';
    let isStacked = true;

    if (selectedCompanies.length === 1) {
        companiesToShow = selectedCompanies;
        chartTitle = `Device Launches per Year for ${selectedCompanies[0]}`;
        isStacked = false;
    } else if (selectedCompanies.length > 1) {
        companiesToShow = selectedCompanies;
        chartTitle = `Device Launches per Year for Selected Companies`;
        isStacked = true;
    } else {
        const companyCounts = {};
        filteredData.forEach(d => {
            const company = d['Company Name'];
            if (company) {
                companyCounts[company] = (companyCounts[company] || 0) + 1;
            }
        });
        companiesToShow = Object.entries(companyCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(entry => entry[0]);
        chartTitle = 'Device Launches by Year and Company (Top 10 Companies)';
        isStacked = true;
    }

    titleElement.textContent = chartTitle;

    const launchesByYearCompany = {};
    const yearsSet = new Set();
    filteredData.forEach(d => {
        const year = d['Launched Year'];
        const company = d['Company Name'];
        if (year && companiesToShow.includes(company)) {
            yearsSet.add(year);
            if (!launchesByYearCompany[year]) {
                launchesByYearCompany[year] = {};
            }
            launchesByYearCompany[year][company] = (launchesByYearCompany[year][company] || 0) + 1;
        }
    });

    const years = Array.from(yearsSet).sort();

    const series = companiesToShow.map(company => {
        return {
            name: company,
            data: years.map(year => (launchesByYearCompany[year] && launchesByYearCompany[year][company]) || 0)
        };
    });

    const options = {
        chart: {
            type: 'bar',
            height: 350,
            stacked: isStacked,
            toolbar: { show: false },
            fontFamily: 'inherit'
        },
        series: series,
        xaxis: {
            categories: years,
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '11px'
                }
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: isStacked ? '70%' : '45%',
            },
        },
        colors: ['#9C9EFE', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1'],
        legend: {
            position: 'top',
            horizontalAlign: 'left',
            show: isStacked
        },
        grid: {
            show: false
        },
        dataLabels: {
            enabled: !isStacked,
        }
    };

    if (charts.launchesByCompany) charts.launchesByCompany.destroy();
    charts.launchesByCompany = new ApexCharts(document.querySelector("#launchesByCompanyChart"), options);
    charts.launchesByCompany.render();
    generateLaunchesByCompanyInsights(companiesToShow, years, series);
}

// Generate Launches by Company insights
function generateLaunchesByCompanyInsights(companies, years, series) {
    const insightsContainer = document.getElementById('launchesByCompanyInsights');
    if (series.length === 0 || series.every(s => s.data.every(d => d === 0))) {
        insightsContainer.innerHTML = '<p>No launch data available for the selected company/companies in this period.</p>';
        return;
    }

    const totalLaunches = series.flatMap(s => s.data).reduce((a, b) => a + b, 0);

    const yearTotals = years.map((year, i) => {
        return series.reduce((sum, s) => sum + (s.data[i] || 0), 0);
    });
    const maxYearIndex = yearTotals.indexOf(Math.max(...yearTotals));
    const mostActiveYear = years[maxYearIndex];
    const mostActiveYearCount = yearTotals[maxYearIndex];

    let insights = '';

    if (companies.length === 1) {
        // Insights for a single company
        insights = `
            <ul>
                <li><strong>${companies[0]}</strong> launched a total of <strong>${totalLaunches}</strong> devices in the selected period.</li>
                <li>Their most active year was <strong>${mostActiveYear}</strong> with <strong>${mostActiveYearCount}</strong> launches.</li>
            </ul>
        `;
    } else {
        // Insights for multiple companies
        const companyTotals = series.map(s => ({
            name: s.name,
            total: s.data.reduce((a, b) => a + b, 0)
        })).sort((a, b) => b.total - a.total);

        const topCompanyInGroup = companyTotals[0];

        insights = `
            <ul>
                <li><strong>${topCompanyInGroup.name}</strong> was the most active in this group, launching <strong>${topCompanyInGroup.total}</strong> devices.</li>
                <li>The most active year for these companies combined was <strong>${mostActiveYear}</strong> with <strong>${mostActiveYearCount}</strong> launches.</li>
                <li>A total of <strong>${totalLaunches}</strong> devices were launched by this group in the selected period.</li>
            </ul>
        `;
    }
    
    insightsContainer.innerHTML = insights;
}

// Update Battery Capacity chart
function updateBatteryChart() {
    const batteryCounts = {};
    filteredData.forEach(d => {
        const battery = parseBattery(d['Battery Capacity']);
        if (battery && !isNaN(battery)) {
            batteryCounts[battery] = (batteryCounts[battery] || 0) + 1;
        }
    });

    const top10 = Object.entries(batteryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    if (batteryChartSortOrder === 'asc') {
        top10.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    } else if (batteryChartSortOrder === 'desc') {
        top10.sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
    } else if (batteryChartSortOrder === 'count-asc') {
        top10.sort((a, b) => a[1] - b[1]);
    } else { // 'count-desc'
        top10.sort((a, b) => b[1] - a[1]);
    }

    const categories = top10.map(item => item[0] + ' mAh');
    const data = top10.map(item => item[1]);

    const options = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false },
            fontFamily: 'inherit'
        },
        series: [{
            name: 'Count',
            data: data
        }],
        xaxis: {
            categories: categories,
            title: { text: 'Battery Capacity (mAh)' },
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            title: { text: 'Device Count' },
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '11px'
                }
            }
        },
        plotOptions: {
            bar: {
                distributed: true,
                horizontal: false
            }
        },
        colors: ['#9C9EFE', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1'],
        legend: {
            show: false
        },
        grid: {
            show: false
        },
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#374151']
            }
        }
    };

    if (charts.battery) charts.battery.destroy();
    charts.battery = new ApexCharts(document.querySelector("#batteryChart"), options);
    charts.battery.render();
    generateBatteryInsights(top10);
}

// Generate Battery insights
function generateBatteryInsights(data) {
    const companySelect = document.getElementById('companyFilter');
    const selectedCompanies = Array.from(companySelect.selectedOptions).map(o => o.value).filter(v => v !== 'all' && v !== '');

    if (data.length === 0 || data.every(d => d[1] === 0)) {
        document.getElementById('batteryInsights').innerHTML = '<p>No battery data available.</p>';
        return;
    }

    const sortedByCount = [...data].sort((a, b) => b[1] - a[1]);
    
    if (sortedByCount.length === 0) {
        document.getElementById('batteryInsights').innerHTML = '<p>No battery data available.</p>';
        return;
    }

    const topCount = sortedByCount[0][1];
    const mostCommon = sortedByCount.filter(item => item[1] === topCount);

    let mostCommonText;
    if (mostCommon.length > 1) {
        const batteryList = mostCommon.map(item => `<strong>${item[0]} mAh</strong>`).join(' & ');
        mostCommonText = `the most common capacities are ${batteryList}, each found in <strong>${topCount}</strong> devices.`;
    } else {
        mostCommonText = `the most common battery capacity is <strong>${mostCommon[0][0]} mAh</strong>, found in <strong>${mostCommon[0][1]}</strong> devices.`;
    }

    let insights = '';
    if (selectedCompanies.length === 1) {
        insights = `<ul><li>For <strong>${selectedCompanies[0]}</strong>, ${mostCommonText}</li></ul>`;
    } else {
        insights = `<ul><li>${mostCommonText.charAt(0).toUpperCase() + mostCommonText.slice(1)}</li></ul>`;
    }
    document.getElementById('batteryInsights').innerHTML = insights;
}

// Update market affordability vs premium chart
function updateMarketAffordabilityChart() {
    const companySelect = document.getElementById('companyFilter');
    const selectedCompanies = Array.from(companySelect.selectedOptions).map(o => o.value).filter(v => v !== 'all' && v !== '');
    const isSingleCompany = selectedCompanies.length === 1;

    // Hide chart when single company is filtered
    const chartRow = document.getElementById('marketAffordabilityRow');
    if (isSingleCompany) {
        chartRow.style.display = 'none';
        return;
    } else {
        chartRow.style.display = 'grid';
    }

    // Define price categories
    const priceCategories = {
        'Budget': { min: 0, max: 200, color: '#10B981' },
        'Mid-Range': { min: 200, max: 500, color: '#F59E0B' },
        'Premium': { min: 500, max: 1000, color: '#EC4899' },
        'Flagship': { min: 1000, max: Infinity, color: '#8B5CF6' }
    };

    // Analyze price distribution
    const priceDistribution = {};
    Object.keys(priceCategories).forEach(category => {
        priceDistribution[category] = 0;
    });

    let validPrices = 0;
    filteredData.forEach(device => {
        const price = parsePrice(device['Launched Price (USA)']);
        if (!isNaN(price) && price > 0) {
            validPrices++;
            Object.keys(priceCategories).forEach(category => {
                const range = priceCategories[category];
                if (price >= range.min && price < range.max) {
                    priceDistribution[category]++;
                }
            });
        }
    });

    console.log('Market Affordability Debug:', {
        totalDevices: filteredData.length,
        validPrices: validPrices,
        priceDistribution: priceDistribution
    });

    // Prepare chart data
    const categories = Object.keys(priceDistribution);
    const values = Object.values(priceDistribution);
    const colors = categories.map(cat => priceCategories[cat].color);

    const options = {
        chart: {
            type: 'bar',
            height: 400,
            toolbar: { show: false },
            fontFamily: 'inherit'
        },
        series: [{
            name: 'Device Count',
            data: values
        }],
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            title: {
                text: 'Number of Devices',
                style: {
                    color: '#6B7280',
                    fontSize: '12px',
                    fontWeight: 400
                }
            },
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '11px'
                }
            }
        },
        colors: colors,
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '60%'
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '12px',
                fontWeight: 'bold',
                colors: ['#ffffff']
            }
        },
        legend: {
            show: false
        },
        grid: {
            show: false
        },
        tooltip: {
            theme: 'light',
            style: {
                fontSize: '12px'
            }
        }
    };

    if (marketAffordabilityChart) {
        marketAffordabilityChart.destroy();
    }

    marketAffordabilityChart = new ApexCharts(document.querySelector('#marketAffordabilityChart'), options);
    marketAffordabilityChart.render();

    // Generate insights
    generateMarketAffordabilityInsights(priceDistribution);
}

// Generate market affordability insights
function generateMarketAffordabilityInsights(priceDistribution) {
    const companySelect = document.getElementById('companyFilter');
    const selectedCompanies = Array.from(companySelect.selectedOptions).map(o => o.value).filter(v => v !== 'all' && v !== '');
    
    const total = Object.values(priceDistribution).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
        document.getElementById('marketAffordabilityInsights').innerHTML = '<p>No price data available.</p>';
        return;
    }

    // Find dominant category
    const dominantCategory = Object.entries(priceDistribution).reduce((a, b) => priceDistribution[a[0]] > priceDistribution[b[0]] ? a : b);
    const dominantPercentage = Math.round((dominantCategory[1] / total) * 100);
    
    // Find most premium category with devices
    const premiumCategories = ['Flagship', 'Premium'].filter(cat => priceDistribution[cat] > 0);
    const mostPremium = premiumCategories.length > 0 ? premiumCategories[0] : null;
    
    let insights = '';
    if (selectedCompanies.length === 1) {
        insights = `<ul>
            <li>For <strong>${selectedCompanies[0]}</strong>, the market is dominated by <strong>${dominantCategory[0]}</strong> devices (${dominantPercentage}%)</li>
            <li>Total devices analyzed: <strong>${total}</strong></li>
            ${mostPremium ? `<li>Premium positioning: <strong>${priceDistribution[mostPremium]}</strong> ${mostPremium.toLowerCase()} devices</li>` : ''}
        </ul>`;
    } else {
        insights = `<ul>
            <li>The smartphone market is dominated by <strong>${dominantCategory[0]}</strong> devices (${dominantPercentage}%)</li>
            <li>Total devices analyzed: <strong>${total}</strong></li>
            <li>Budget devices: <strong>${priceDistribution['Budget']}</strong> | Mid-range: <strong>${priceDistribution['Mid-Range']}</strong></li>
            <li>Premium devices: <strong>${priceDistribution['Premium']}</strong> | Flagship: <strong>${priceDistribution['Flagship']}</strong></li>
        </ul>`;
    }
    
    document.getElementById('marketAffordabilityInsights').innerHTML = insights;
}

// Update country price comparison chart
function updateCountryPriceChart() {
    const companySelect = document.getElementById('companyFilter');
    const selectedCompanies = Array.from(companySelect.selectedOptions).map(o => o.value).filter(v => v !== 'all' && v !== '');
    const isSingleCompany = selectedCompanies.length === 1;

    // Hide chart when single company is filtered
    const chartRow = document.getElementById('countryPriceRow');
    if (isSingleCompany) {
        chartRow.style.display = 'none';
        return;
    } else {
        chartRow.style.display = 'grid';
    }

    // Define country price columns with currency conversion rates (approximate)
    const countryColumns = {
        'Pakistan (PKR)': { column: 'Launched Price (Pakistan)', rate: 0.0036 }, // 1 PKR ≈ 0.0036 USD
        'India (INR)': { column: 'Launched Price (India)', rate: 0.012 }, // 1 INR ≈ 0.012 USD
        'China (CNY)': { column: 'Launched Price (China)', rate: 0.14 }, // 1 CNY ≈ 0.14 USD
        'USA (USD)': { column: 'Launched Price (USA)', rate: 1 }, // 1 USD = 1 USD
        'Dubai (AED)': { column: 'Launched Price (Dubai)', rate: 0.27 } // 1 AED ≈ 0.27 USD
    };

    // Calculate average prices for each country (converted to USD)
    const countryPrices = {};
    Object.keys(countryColumns).forEach(country => {
        const { column, rate } = countryColumns[country];
        const prices = filteredData
            .map(device => parsePrice(device[column]))
            .filter(price => !isNaN(price) && price > 0)
            .map(price => price * rate); // Convert to USD
        
        if (prices.length > 0) {
            const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
            countryPrices[country] = Math.round(average);
        } else {
            countryPrices[country] = 0;
        }
    });

    // Prepare chart data
    const countries = Object.keys(countryPrices);
    const prices = Object.values(countryPrices);
    const colors = ['#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444']; // Different colors for each country

    const options = {
        chart: {
            type: 'bar',
            height: 400,
            toolbar: { show: false },
            fontFamily: 'inherit'
        },
        series: [{
            name: 'Average Price (USD Equivalent)',
            data: prices
        }],
        xaxis: {
            categories: countries,
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            title: {
                text: 'Average Price (USD Equivalent)',
                style: {
                    color: '#6B7280',
                    fontSize: '12px',
                    fontWeight: 400
                }
            },
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '11px'
                }
            }
        },
        colors: colors,
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '60%'
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '12px',
                fontWeight: 'bold',
                colors: ['#ffffff']
            }
        },
        legend: {
            show: false
        },
        grid: {
            show: false
        },
        tooltip: {
            theme: 'light',
            style: {
                fontSize: '12px'
            }
        }
    };

    if (countryPriceChart) {
        countryPriceChart.destroy();
    }

    countryPriceChart = new ApexCharts(document.querySelector('#countryPriceChart'), options);
    countryPriceChart.render();

    // Generate insights
    generateCountryPriceInsights(countryPrices);
}

// Generate country price insights
function generateCountryPriceInsights(countryPrices) {
    const total = Object.values(countryPrices).reduce((sum, price) => sum + price, 0);
    
    if (total === 0) {
        document.getElementById('countryPriceInsights').innerHTML = '<p>No price data available.</p>';
        return;
    }

    // Find most and least expensive countries
    const sortedCountries = Object.entries(countryPrices)
        .filter(([country, price]) => price > 0)
        .sort((a, b) => b[1] - a[1]);

    if (sortedCountries.length === 0) {
        document.getElementById('countryPriceInsights').innerHTML = '<p>No price data available.</p>';
        return;
    }

    const mostExpensive = sortedCountries[0];
    const leastExpensive = sortedCountries[sortedCountries.length - 1];
    
    // Calculate price difference
    const priceDifference = mostExpensive[1] - leastExpensive[1];
    const priceDifferencePercent = Math.round((priceDifference / leastExpensive[1]) * 100);

    const insights = `<ul>
        <li><strong>${mostExpensive[0]}</strong> is the most expensive market ($${mostExpensive[1]} USD equivalent)</li>
        <li><strong>${leastExpensive[0]}</strong> is the most affordable market ($${leastExpensive[1]} USD equivalent)</li>
        <li>Price difference: <strong>$${priceDifference}</strong> (${priceDifferencePercent}% higher)</li>
        <li>All prices converted to USD for fair comparison</li>
        <li>Total countries analyzed: <strong>${sortedCountries.length}</strong></li>
    </ul>`;
    
    document.getElementById('countryPriceInsights').innerHTML = insights;
}

// Error handling
function showError(message) {
    console.error(message);
    alert(message);
}






