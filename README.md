# Link Manager Dashboard

A static GitHub Pages dashboard for managing and viewing links for your apps, plugins, and services. All configuration is stored in a single `links.json` file that serves as the source of truth.

## Features

- **Environment Switching**: Toggle between Production, Staging, and Development environments
- **On/Off Toggles**: Enable/disable individual links without deleting them
- **Categorization**: Organize links into collapsible categories
- **Search & Filter**: Quickly find links by name, key, or category
- **Export Options**: 
  - View raw JSON configuration
  - Copy resolved key-value pairs for use in applications
- **Validation**: Detects duplicate IDs, invalid URLs, and unknown categories
- **Demo Mode**: All changes are client-side only (no server writes)

## Setup Instructions

### Enable GitHub Pages

1. Push this repository to GitHub
2. Go to your repository settings
3. Scroll down to the "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Select "main" branch and "/" (root) folder
6. Click "Save"

Your dashboard will be available at `https://<username>.github.io/<repository-name>`

### Customizing links.json

Edit the `links.json` file to add, remove, or modify your links:

```json
{
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
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "updated": "2026-02-12T10:00:00Z"
  }
}
```

#### Schema Explanation

- `activeEnv`: Current active environment (default: "prod")
- `envs`: Array of environment definitions
- `categories`: Array of category definitions
- `items`: Array of link items with:
  - `id`: Unique identifier
  - `name`: Display name
  - `category`: Category key (must match a category in the categories array)
  - `enabled`: Whether the item is active
  - `type`: Type indicator (server/web/mobile/social/other)
  - `key`: Programmatic key for use in applications
  - `values`: Contains default URL and optional environment-specific overrides
  - `notes`: Optional description

### Using in Applications

To consume the link configuration in your applications:

```javascript
// Fetch the configuration
const response = await fetch('https://<username>.github.io/<repository-name>/links.json');
const config = await response.json();

// Resolve URLs based on active environment
function resolveUrl(item) {
  if (item.values.env && item.values.env[config.activeEnv]) {
    return item.values.env[config.activeEnv];
  }
  return item.values.default;
}

// Example: Get API gateway URL for current environment
const apiGatewayUrl = resolveUrl(config.items.find(item => item.key === 'api_gateway_url'));
```

For cache-busting in production, append a timestamp to the URL:
```javascript
const timestamp = Date.now();
const response = await fetch(`https://<username>.github.io/<repository-name>/links.json?t=${timestamp}`);
```

## Security Warning

⚠️ **Never store secrets, passwords, or sensitive credentials in `links.json`**. Since this is served publicly via GitHub Pages, all data is accessible to anyone who visits your page.

## Local Development

To run locally for development:

1. Clone or download the repository
2. Serve the files using a local web server (due to CORS restrictions when opening directly in browser)

### Option 1: Python Server
If you have Python installed:
- For Python 3.x: `python -m http.server 8000`
- For Python 2.x: `python -m SimpleHTTPServer 8000`
- Then visit `http://localhost:8000`

### Option 2: Node.js Server
If you have Node.js installed:
- Install a simple server: `npx http-server`
- Then visit the provided URL (typically `http://localhost:8000`)

### Option 3: Browser Extensions
Use a browser extension like "Live Server" in VS Code or similar tools that serve files with proper headers.

When running via a local server, the application will load `links.json` dynamically. When opened directly as a file in the browser, it will use embedded sample data with a notice.

## License

This project is in the public domain. Feel free to use and modify as needed.