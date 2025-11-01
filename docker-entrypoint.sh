#!/bin/sh
set -e

# Validate environment variables to prevent injection attacks
validate_url() {
  # Basic URL validation - must start with http:// or https://
  echo "$1" | grep -qE '^https?://' || {
    echo "ERROR: Invalid URL format: $1" >&2
    return 1
  }
}

# Validate server URL if provided
if [ -n "${JELLYFIN_SERVER_URL}" ]; then
  validate_url "${JELLYFIN_SERVER_URL}" || {
    echo "SECURITY: JELLYFIN_SERVER_URL must be a valid HTTP/HTTPS URL"
    exit 1
  }
fi

# Use jq to safely generate JSON configuration (prevents injection)
# This approach ensures proper JSON escaping of all values
# Write to /var/cache/nginx (writable volume) since root filesystem is read-only
jq -n \
  --arg serverUrl "${JELLYFIN_SERVER_URL:-}" \
  --arg clientName "${JELLYFIN_CLIENT_NAME:-Jellyfin Mini Client}" \
  --arg deviceName "${JELLYFIN_DEVICE_NAME:-Jellyfin Web}" \
  --arg version "${APP_VERSION:-0.1.0}" \
  '{
    serverUrl: $serverUrl,
    clientName: $clientName,
    deviceName: $deviceName,
    version: $version
  }' >/var/cache/nginx/config.json

# Generate JavaScript that safely loads the JSON config
cat >/var/cache/nginx/config.js <<'EOF'
// Runtime configuration loaded securely from JSON
// Initialize config object immediately (prevents errors if accessed before async load)
window.__JELLYFIN_CONFIG__ = {
  serverUrl: '',
  clientName: 'Jellyfin Mini Client',
  deviceName: 'Jellyfin Web',
  version: '0.1.0'
};

// Load actual configuration from JSON (asynchronous)
(async function() {
  try {
    const response = await fetch('/config.json');
    if (response.ok) {
      window.__JELLYFIN_CONFIG__ = await response.json();
    }
  } catch (error) {
    console.error('Failed to load configuration:', error);
    // Config already initialized with defaults above
  }
})();
EOF

echo "Generated runtime config (sanitized for security):"
cat /var/cache/nginx/config.json

# Execute the main command (nginx)
exec "$@"
