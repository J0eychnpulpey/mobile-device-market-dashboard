// Filter state management and initialization

// Initialize filters on page load if DOM is ready
function initializeFilters() {
    const companyFilter = document.getElementById('companyFilter');
    
    if (companyFilter) {
        setupMultiSelectBehavior(companyFilter);
        setupRangeSliders();
        setupNumericInputs();
        updateActiveFiltersCount();
    }
}

// Setup multi-select behavior with "All" option
function setupMultiSelectBehavior(select) {
    select.addEventListener('change', function() {
        const allOption = this.querySelector('option[value="all"]');
        const otherOptions = Array.from(this.options).filter(o => o.value !== 'all');
        const selectedNonAll = otherOptions.filter(o => o.selected);
        
        // If "All" was just selected
        if (allOption && allOption.selected && selectedNonAll.length === 0) {
            // Deselect all others (keep only "all" selected for the moment)
            otherOptions.forEach(opt => opt.selected = false);
        } else {
            // If any other option is selected, deselect "All"
            if (allOption && selectedNonAll.length > 0) {
                allOption.selected = false;
            }
            // If no options selected, select "All" instead
            if (selectedNonAll.length === 0 && otherOptions.length > 0) {
                allOption.selected = true;
                otherOptions.forEach(opt => opt.selected = false);
            }
        }
        
        updateActiveFiltersCount();
    });
}

// Setup range sliders with constraint logic
function setupRangeSliders() {
    const yearMinInput = document.getElementById('yearMinFilter');
    const yearMaxInput = document.getElementById('yearMaxFilter');
    const priceMinInput = document.getElementById('priceMinFilter');
    const priceMaxInput = document.getElementById('priceMaxFilter');
    const batteryMinInput = document.getElementById('batteryMinFilter');
    const batteryMaxInput = document.getElementById('batteryMaxFilter');
    
    if (yearMinInput && yearMaxInput) {
        yearMinInput.addEventListener('input', function() {
            if (parseInt(this.value) > parseInt(yearMaxInput.value)) {
                this.value = yearMaxInput.value;
            }
            document.getElementById('yearMinInput').value = this.value;
        });
        
        yearMaxInput.addEventListener('input', function() {
            if (parseInt(this.value) < parseInt(yearMinInput.value)) {
                this.value = yearMinInput.value;
            }
            document.getElementById('yearMaxInput').value = this.value;
        });
    }
    
    if (priceMinInput && priceMaxInput) {
        priceMinInput.addEventListener('input', function() {
            if (parseInt(this.value) > parseInt(priceMaxInput.value)) {
                this.value = priceMaxInput.value;
            }
            document.getElementById('priceMinInput').value = this.value;
        });
        
        priceMaxInput.addEventListener('input', function() {
            if (parseInt(this.value) < parseInt(priceMinInput.value)) {
                this.value = priceMinInput.value;
            }
            document.getElementById('priceMaxInput').value = this.value;
        });
    }

    if (batteryMinInput && batteryMaxInput) {
        batteryMinInput.addEventListener('input', function() {
            if (parseInt(this.value) > parseInt(batteryMaxInput.value)) {
                this.value = batteryMaxInput.value;
            }
            document.getElementById('batteryMinInput').value = this.value;
        });

        batteryMaxInput.addEventListener('input', function() {
            if (parseInt(this.value) < parseInt(batteryMinInput.value)) {
                this.value = batteryMinInput.value;
            }
            document.getElementById('batteryMaxInput').value = this.value;
        });
    }
}

// Setup numeric input fields that sync with range sliders
function setupNumericInputs() {
    const yearMinInput = document.getElementById('yearMinInput');
    const yearMaxInput = document.getElementById('yearMaxInput');
    const priceMinInput = document.getElementById('priceMinInput');
    const priceMaxInput = document.getElementById('priceMaxInput');
    const batteryMinInput = document.getElementById('batteryMinInput');
    const batteryMaxInput = document.getElementById('batteryMaxInput');
    
    const yearMinSlider = document.getElementById('yearMinFilter');
    const yearMaxSlider = document.getElementById('yearMaxFilter');
    const priceMinSlider = document.getElementById('priceMinFilter');
    const priceMaxSlider = document.getElementById('priceMaxFilter');
    const batteryMinSlider = document.getElementById('batteryMinFilter');
    const batteryMaxSlider = document.getElementById('batteryMaxFilter');
    
    if (yearMinInput && yearMinSlider) {
        yearMinInput.addEventListener('input', function() {
            const val = parseInt(this.value);
            if (val <= parseInt(yearMaxInput.value)) {
                yearMinSlider.value = val;
            } else {
                this.value = yearMaxInput.value;
            }
        });
    }
    
    if (yearMaxInput && yearMaxSlider) {
        yearMaxInput.addEventListener('input', function() {
            const val = parseInt(this.value);
            if (val >= parseInt(yearMinInput.value)) {
                yearMaxSlider.value = val;
            } else {
                this.value = yearMinInput.value;
            }
        });
    }
    
    if (priceMinInput && priceMinSlider) {
        priceMinInput.addEventListener('input', function() {
            const val = parseInt(this.value);
            if (val <= parseInt(priceMaxInput.value)) {
                priceMinSlider.value = val;
            } else {
                this.value = priceMaxInput.value;
            }
        });
    }
    
    if (priceMaxInput && priceMaxSlider) {
        priceMaxInput.addEventListener('input', function() {
            const val = parseInt(this.value);
            if (val >= parseInt(priceMinInput.value)) {
                priceMaxSlider.value = val;
            } else {
                this.value = priceMinInput.value;
            }
        });
    }

    if (batteryMinInput && batteryMinSlider) {
        batteryMinInput.addEventListener('input', function() {
            const val = parseInt(this.value);
            if (val <= parseInt(batteryMaxInput.value)) {
                batteryMinSlider.value = val;
            } else {
                this.value = batteryMaxInput.value;
            }
        });
    }

    if (batteryMaxInput && batteryMaxSlider) {
        batteryMaxInput.addEventListener('input', function() {
            const val = parseInt(this.value);
            if (val >= parseInt(batteryMinInput.value)) {
                batteryMaxSlider.value = val;
            } else {
                this.value = batteryMinInput.value;
            }
        });
    }
}

// Update the active filters count badge
function updateActiveFiltersCount() {
    const companyFilter = document.getElementById('companyFilter');
    const yearMin = parseInt(document.getElementById('yearMinFilter').value);
    const yearMax = parseInt(document.getElementById('yearMaxFilter').value);
    const priceMin = parseInt(document.getElementById('priceMinFilter').value);
    const priceMax = parseInt(document.getElementById('priceMaxFilter').value);
    const batteryMin = parseInt(document.getElementById('batteryMinFilter').value);
    const batteryMax = parseInt(document.getElementById('batteryMaxFilter').value);
    
    let activeCount = 0;
    
    // Check if company filter is active (not "All")
    const companySelected = Array.from(companyFilter.selectedOptions)
        .filter(o => o.value !== 'all' && o.value !== '')
        .length;
    if (companySelected > 0) {
        activeCount += 1;
        document.getElementById('companyCount').textContent = `(${companySelected})`;
    } else {
        document.getElementById('companyCount').textContent = '';
    }
    
    // Check if year range is active (not default 2014-2025)
    if (yearMin !== 2014 || yearMax !== 2025) {
        activeCount += 1;
    }
    
    // Check if price range is active (not default 0-3000)
    if (priceMin !== 0 || priceMax !== 3000) {
        activeCount += 1;
    }
    
    // Check if battery range is active
    if (batteryMin !== 0 || batteryMax !== 10000) {
        activeCount += 1;
    }

    // Update active filters badge
    const badge = document.getElementById('activeFiltersCount');
    if (activeCount > 0) {
        badge.textContent = `${activeCount} Active`;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Initialize filters when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFilters);
} else {
    initializeFilters();
}
