// Link Manager Dashboard Application
class LinkManagerApp {
    constructor() {
        // State management
        this.data = null;
        this.originalData = null;
        this.filteredItems = [];
        
        // DOM elements
        this.elements = {
            searchBox: document.getElementById('search-box'),
            envSelector: document.getElementById('env-selector'),
            categoryFilter: document.getElementById('category-filter'),
            showDisabledToggle: document.getElementById('show-disabled-toggle'),
            linksContainer: document.getElementById('links-container'),
            version: document.getElementById('version'),
            lastUpdated: document.getElementById('last-updated'),
            showPatchBtn: document.getElementById('show-patch-btn'),
            closePatchBtn: document.getElementById('close-patch-btn'),
            patchPanel: document.getElementById('patch-panel'),
            patchTextarea: document.getElementById('patch-textarea'),
            copyPatchBtn: document.getElementById('copy-patch-btn'),
            rawJsonBtn: document.getElementById('raw-json-btn'),
            copyKvBtn: document.getElementById('copy-kv-btn'),
            validationMessages: document.getElementById('validation-messages')
        };
        
        // Initialize the application
        this.init();
    }
    
    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.render();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load link data. Please check the links.json file.');
        }
    }
    
    async loadData() {
        try {
            // Check if we're running on a web server or locally
            const isLocal = window.location.protocol === 'file:';
            
            if (isLocal) {
                // For local file access, embed the data directly
                // This will be replaced by the actual links.json content when served via HTTP
                this.data = {
  "activeEnv": "prod",
  "envs": [
    {
      "key": "prod",
      "name": "Production",
      "color": "#ff4444"
    },
    {
      "key": "staging",
      "name": "Staging",
      "color": "#ffaa00"
    },
    {
      "key": "dev",
      "name": "Development",
      "color": "#44aaff"
    }
  ],
  "categories": [
    {
      "key": "backend",
      "name": "Backend Services",
      "icon": "server"
    },
    {
      "key": "frontend",
      "name": "Frontend Apps",
      "icon": "desktop"
    },
    {
      "key": "tools",
      "name": "Developer Tools",
      "icon": "wrench"
    }
  ],
  "items": [
    {
      "id": "api-gateway",
      "name": "API Gateway",
      "category": "backend",
      "enabled": true,
      "type": "server",
      "key": "api_gateway_url",
      "values": {
        "default": "https://api.example.com",
        "env": {
          "prod": "https://api.example.com",
          "staging": "https://staging-api.example.com",
          "dev": "https://dev-api.example.com"
        }
      },
      "notes": "Main entry point for all API requests"
    },
    {
      "id": "auth-service",
      "name": "Authentication Service",
      "category": "backend",
      "enabled": true,
      "type": "server",
      "key": "auth_service_url",
      "values": {
        "default": "https://auth.example.com",
        "env": {
          "prod": "https://auth.example.com",
          "staging": "https://staging-auth.example.com",
          "dev": "https://dev-auth.example.com"
        }
      },
      "notes": "Handles user authentication and authorization"
    },
    {
      "id": "dashboard-app",
      "name": "Dashboard App",
      "category": "frontend",
      "enabled": true,
      "type": "web",
      "key": "dashboard_url",
      "values": {
        "default": "https://dashboard.example.com"
      },
      "notes": "Main user dashboard application"
    },
    {
      "id": "admin-panel",
      "name": "Admin Panel",
      "category": "frontend",
      "enabled": false,
      "type": "web",
      "key": "admin_url",
      "values": {
        "default": "https://admin.example.com",
        "env": {
          "prod": "https://admin.example.com",
          "staging": "https://staging-admin.example.com",
          "dev": "https://dev-admin.example.com"
        }
      },
      "notes": "Administrative interface (currently disabled)"
    },
    {
      "id": "websocket-service",
      "name": "WebSocket Service",
      "category": "backend",
      "enabled": true,
      "type": "server",
      "key": "websocket_url",
      "values": {
        "default": "wss://ws.example.com",
        "env": {
          "prod": "wss://ws.example.com",
          "staging": "wss://staging-ws.example.com",
          "dev": "wss://dev-ws.example.com"
        }
      },
      "notes": "Real-time communication service"
    },
    {
      "id": "monitoring-tool",
      "name": "Monitoring Tool",
      "category": "tools",
      "enabled": true,
      "type": "web",
      "key": "monitoring_url",
      "values": {
        "default": "https://monitoring.example.com"
      },
      "notes": "System monitoring and alerting"
    },
    {
      "id": "logging-service",
      "name": "Logging Service",
      "category": "backend",
      "enabled": true,
      "type": "server",
      "key": "logging_url",
      "values": {
        "default": "https://logs.example.com",
        "env": {
          "prod": "https://logs.example.com",
          "staging": "https://staging-logs.example.com",
          "dev": "https://dev-logs.example.com"
        }
      },
      "notes": "Centralized logging system"
    },
    {
      "id": "database-ui",
      "name": "Database UI",
      "category": "tools",
      "enabled": false,
      "type": "web",
      "key": "db_ui_url",
      "values": {
        "default": "https://db.example.com"
      },
      "notes": "Database administration interface (disabled in production)"
    },
    {
      "id": "notification-service",
      "name": "Notification Service",
      "category": "backend",
      "enabled": true,
      "type": "server",
      "key": "notifications_url",
      "values": {
        "default": "https://notifications.example.com"
      },
      "notes": "Email and push notification service"
    },
    {
      "id": "payment-gateway",
      "name": "Payment Gateway",
      "category": "backend",
      "enabled": true,
      "type": "server",
      "key": "payments_url",
      "values": {
        "default": "https://payments.example.com",
        "env": {
          "prod": "https://payments.example.com",
          "staging": "https://sandbox-payments.example.com",
          "dev": "https://test-payments.example.com"
        }
      },
      "notes": "Handles payment processing"
    }
  ],
  "kv": {},
  "metadata": {
    "version": "1.0.0",
    "updated": "2026-02-12T10:00:00Z"
  }
};
            } else {
                // Generate a timestamp for cache busting when on a web server
                const timestamp = Date.now();
                const response = await fetch(`links.json?t=${timestamp}`, {
                    headers: {
                        'Cache-Control': 'no-store'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                this.data = await response.json();
            }
            
            this.originalData = JSON.parse(JSON.stringify(this.data)); // Deep clone for comparison
            
            // Update version and last updated info
            if (this.data.metadata) {
                this.elements.version.textContent = `v${this.data.metadata.version}`;
                this.elements.lastUpdated.textContent = `Updated: ${this.data.metadata.updated}`;
            }
        } catch (error) {
            console.error('Error loading data:', error);
            
            // If fetch fails (e.g., running locally), try to use embedded data or show error
            if (typeof window.linksData !== 'undefined') {
                this.data = window.linksData;
                this.originalData = JSON.parse(JSON.stringify(this.data));
            } else {
                // Show a user-friendly message for local file access
                if (window.location.protocol === 'file:') {
                    this.showError('Running locally: Using embedded sample data. Deploy to a web server to load links.json dynamically.');
                } else {
                    throw error;
                }
            }
        }
    }
    
    setupEventListeners() {
        // Search functionality
        this.elements.searchBox.addEventListener('input', () => {
            this.filterAndRender();
        });
        
        // Environment selection
        this.elements.envSelector.addEventListener('change', (e) => {
            this.data.activeEnv = e.target.value;
            this.updatePatchPreview();
            this.filterAndRender();
        });
        
        // Category filter
        this.elements.categoryFilter.addEventListener('change', () => {
            this.filterAndRender();
        });
        
        // Show disabled toggle
        this.elements.showDisabledToggle.addEventListener('change', () => {
            this.filterAndRender();
        });
        
        // Patch panel controls
        this.elements.showPatchBtn.addEventListener('click', () => {
            this.showPatchPanel();
        });
        
        this.elements.closePatchBtn.addEventListener('click', () => {
            this.hidePatchPanel();
        });
        
        this.elements.copyPatchBtn.addEventListener('click', () => {
            this.copyPatchToClipboard();
        });
        
        // Export buttons
        this.elements.rawJsonBtn.addEventListener('click', () => {
            this.openRawJson();
        });
        
        this.elements.copyKvBtn.addEventListener('click', () => {
            this.copyResolvedKv();
        });
    }
    
    filterAndRender() {
        this.applyFilters();
        this.render();
    }
    
    applyFilters() {
        const searchTerm = this.elements.searchBox.value.toLowerCase();
        const selectedCategory = this.elements.categoryFilter.value;
        const showDisabled = this.elements.showDisabledToggle.checked;
        
        this.filteredItems = this.data.items.filter(item => {
            // Search filter
            const matchesSearch = !searchTerm || 
                item.name.toLowerCase().includes(searchTerm) ||
                item.key.toLowerCase().includes(searchTerm) ||
                item.id.toLowerCase().includes(searchTerm) ||
                (item.notes && item.notes.toLowerCase().includes(searchTerm));
            
            // Category filter
            const matchesCategory = !selectedCategory || item.category === selectedCategory;
            
            // Enabled filter
            const matchesEnabled = showDisabled || item.enabled;
            
            return matchesSearch && matchesCategory && matchesEnabled;
        });
    }
    
    render() {
        this.populateCategoryFilter();
        this.renderLinks();
        this.validateData();
    }
    
    populateCategoryFilter() {
        // Clear existing options except the first one
        this.elements.categoryFilter.innerHTML = '<option value="">All Categories</option>';
        
        if (this.data && this.data.categories) {
            this.data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.key;
                option.textContent = category.name;
                this.elements.categoryFilter.appendChild(option);
            });
        }
    }
    
    renderLinks() {
        // Clear the container
        this.elements.linksContainer.innerHTML = '';
        
        if (!this.data || !this.data.categories) return;
        
        // Group items by category
        const itemsByCategory = {};
        this.filteredItems.forEach(item => {
            if (!itemsByCategory[item.category]) {
                itemsByCategory[item.category] = [];
            }
            itemsByCategory[item.category].push(item);
        });
        
        // Render each category section
        this.data.categories.forEach(category => {
            const categoryItems = itemsByCategory[category.key] || [];
            if (categoryItems.length > 0 || this.shouldShowEmptyCategory(category.key)) {
                this.renderCategorySection(category, categoryItems);
            }
        });
    }
    
    shouldShowEmptyCategory(categoryKey) {
        // Show empty categories if no search/filter is applied
        return !this.elements.searchBox.value && 
               !this.elements.categoryFilter.value && 
               this.elements.showDisabledToggle.checked;
    }
    
    renderCategorySection(category, items) {
        const section = document.createElement('div');
        section.className = 'category-section';
        
        const header = document.createElement('div');
        header.className = 'category-header collapsed';
        header.innerHTML = `
            <span>${category.name}</span>
            <span class="item-count">(${items.length})</span>
        `;
        
        // Toggle collapse on click
        header.addEventListener('click', () => {
            section.classList.toggle('collapsed');
            header.classList.toggle('collapsed');
        });
        
        const content = document.createElement('div');
        content.className = 'category-content';
        
        items.forEach(item => {
            content.appendChild(this.renderItemCard(item));
        });
        
        section.appendChild(header);
        section.appendChild(content);
        this.elements.linksContainer.appendChild(section);
    }
    
    renderItemCard(item) {
        const card = document.createElement('div');
        card.className = `link-item ${item.enabled ? '' : 'disabled'}`;
        
        // Resolve the URL based on environment
        const resolvedUrl = this.resolveUrl(item);
        
        card.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-key">${item.key}</div>
                <div class="item-url">${resolvedUrl}</div>
                ${item.notes ? `<div class="item-notes">${item.notes}</div>` : ''}
                <div class="item-meta">
                    <span class="status-badge ${item.enabled ? 'enabled' : 'disabled'}">
                        ${item.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <span class="type-badge">${item.type}</span>
                </div>
            </div>
            <div class="item-actions">
                <button class="action-btn open-btn" ${item.enabled ? '' : 'disabled'} 
                    onclick="app.openUrl('${resolvedUrl}')">
                    Open
                </button>
                <button class="action-btn copy-btn" onclick="app.copyUrl('${resolvedUrl}')">
                    Copy
                </button>
                <label class="toggle-label">
                    <input type="checkbox" ${item.enabled ? 'checked' : ''} 
                        onchange="app.toggleItem('${item.id}', this.checked)">
                    On/Off
                </label>
            </div>
        `;
        
        return card;
    }
    
    resolveUrl(item) {
        // Check if there's an environment-specific override
        if (item.values.env && item.values.env[this.data.activeEnv]) {
            return item.values.env[this.data.activeEnv];
        }
        // Otherwise use the default value
        return item.values.default;
    }
    
    openUrl(url) {
        if (url) {
            window.open(url, '_blank');
        }
    }
    
    async copyUrl(url) {
        try {
            await navigator.clipboard.writeText(url);
            // Visual feedback could be added here
        } catch (err) {
            console.error('Failed to copy URL: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }
    
    toggleItem(itemId, isEnabled) {
        const item = this.data.items.find(i => i.id === itemId);
        if (item) {
            item.enabled = isEnabled;
            this.updatePatchPreview();
            // Re-filter and re-render to reflect changes
            this.filterAndRender();
        }
    }
    
    updatePatchPreview() {
        // Calculate the differences between original and current data
        const patch = this.calculatePatch(this.originalData, this.data);
        this.elements.patchTextarea.value = JSON.stringify(patch, null, 2);
    }
    
    calculatePatch(original, current) {
        const patch = {};
        
        // Compare active environment
        if (original.activeEnv !== current.activeEnv) {
            patch.activeEnv = current.activeEnv;
        }
        
        // Compare items
        const itemsPatch = [];
        original.items.forEach((origItem, index) => {
            const currentItem = current.items[index];
            if (!currentItem) return; // Skip if somehow missing
            
            const itemPatch = {};
            let hasChanges = false;
            
            if (origItem.enabled !== currentItem.enabled) {
                itemPatch.enabled = currentItem.enabled;
                hasChanges = true;
            }
            
            if (hasChanges) {
                itemPatch.id = currentItem.id;
                itemsPatch.push(itemPatch);
            }
        });
        
        if (itemsPatch.length > 0) {
            patch.items = itemsPatch;
        }
        
        return patch;
    }
    
    showPatchPanel() {
        this.updatePatchPreview();
        this.elements.patchPanel.classList.remove('hidden');
    }
    
    hidePatchPanel() {
        this.elements.patchPanel.classList.add('hidden');
    }
    
    async copyPatchToClipboard() {
        try {
            await navigator.clipboard.writeText(this.elements.patchTextarea.value);
            // Visual feedback could be added here
        } catch (err) {
            console.error('Failed to copy patch: ', err);
        }
    }
    
    openRawJson() {
        // Open the raw JSON in a new tab
        const url = window.location.origin + window.location.pathname.replace('index.html', '') + 'links.json';
        window.open(url, '_blank');
    }
    
    async copyResolvedKv() {
        const kvObject = {};
        
        // Only include enabled items
        this.data.items
            .filter(item => item.enabled)
            .forEach(item => {
                kvObject[item.key] = this.resolveUrl(item);
            });
        
        try {
            await navigator.clipboard.writeText(JSON.stringify(kvObject, null, 2));
            // Visual feedback could be added here
        } catch (err) {
            console.error('Failed to copy KV: ', err);
        }
    }
    
    validateData() {
        const errors = [];
        const warnings = [];
        
        // Check for duplicate IDs
        const ids = this.data.items.map(item => item.id);
        const uniqueIds = [...new Set(ids)];
        if (ids.length !== uniqueIds.length) {
            errors.push('Duplicate item IDs found in links.json');
        }
        
        // Check for duplicate keys
        const keys = this.data.items.map(item => item.key);
        const uniqueKeys = [...new Set(keys)];
        if (keys.length !== uniqueKeys.length) {
            errors.push('Duplicate item keys found in links.json');
        }
        
        // Check for unknown categories
        const categoryKeys = this.data.categories.map(cat => cat.key);
        this.data.items.forEach(item => {
            if (!categoryKeys.includes(item.category)) {
                warnings.push(`Item "${item.name}" has unknown category: ${item.category}`);
            }
        });
        
        // Check for invalid URLs
        this.data.items.forEach(item => {
            const url = this.resolveUrl(item);
            try {
                new URL(url);
            } catch (e) {
                warnings.push(`Item "${item.name}" has invalid URL: ${url}`);
            }
        });
        
        // Display validation messages
        this.displayValidationMessages(errors, warnings);
    }
    
    displayValidationMessages(errors, warnings) {
        this.elements.validationMessages.innerHTML = '';
        
        errors.forEach(error => {
            const errorEl = document.createElement('div');
            errorEl.className = 'validation-error';
            errorEl.textContent = error;
            this.elements.validationMessages.appendChild(errorEl);
        });
        
        warnings.forEach(warning => {
            const warningEl = document.createElement('div');
            warningEl.className = 'validation-warning';
            warningEl.textContent = warning;
            this.elements.validationMessages.appendChild(warningEl);
        });
    }
    
    showError(message) {
        this.elements.validationMessages.innerHTML = '';
        const errorEl = document.createElement('div');
        errorEl.className = 'validation-error';
        errorEl.textContent = message;
        this.elements.validationMessages.appendChild(errorEl);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LinkManagerApp();
});