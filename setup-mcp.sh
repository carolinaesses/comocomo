#!/bin/bash

# Setup script for MCP configuration
# This script helps configure MCP servers with environment variables

# Load environment variables from mcp-config.env if it exists
if [ -f "mcp-config.env" ]; then
    echo "Loading MCP configuration from mcp-config.env..."
    export $(grep -v '^#' mcp-config.env | xargs)
else
    echo "Warning: mcp-config.env not found. Please create it from mcp-config.env.example"
    echo "You can copy mcp-config.env.example to mcp-config.env and configure your values"
fi

# Display current configuration (without sensitive values)
echo "MCP Configuration Status:"
echo "- Mesimati Project: ${MESIMATI_PROJECT_REF:+Configured} ${MESIMATI_PROJECT_REF:-Not configured}"
echo "- Orgsightdev Project: ${ORGSIGHTDEV_PROJECT_REF:+Configured} ${ORGSIGHTDEV_PROJECT_REF:-Not configured}"
echo "- Justrun Project: ${JUSTRUN_PROJECT_REF:+Configured} ${JUSTRUN_PROJECT_REF:-Not configured}"
echo "- Comocomo Database: ${COMOCOMO_DATABASE_URL:+Configured} ${COMOCOMO_DATABASE_URL:-Not configured}"

echo ""
echo "To use these variables in your MCP configuration, make sure your mcp.json references them as:"
echo "  \"SUPABASE_ACCESS_TOKEN\": \"\${MESIMATI_SUPABASE_ACCESS_TOKEN}\""
echo "  \"--project-ref=\${MESIMATI_PROJECT_REF}\""
echo ""
echo "Note: The global mcp.json is located at ~/.cursor/mcp.json"

