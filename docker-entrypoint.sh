#!/bin/sh

# Generate runtime configuration
cat > /usr/share/nginx/html/config.js << EOF
window.RUNTIME_CONFIG = {
  GEMINI_API_KEY: '${GEMINI_API_KEY}'
};
EOF

# Start nginx
exec nginx -g "daemon off;"