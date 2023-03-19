#!/bin/sh
set -e

# Check if SYSTEM_SSL is set to true
if [ "$SYSTEM_SSL" = "true" ]; then
    export DENO_TLS_CA_STORE="system"
fi

# Run the command
"$@"