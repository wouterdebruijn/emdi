# Extra Media Dashboard Interface

A extra media dashboard interface for end user interaction with Radarr and
Sonarr.

# Docker
This project is released as a docker image. This image accepts the following options:

## Environment
```
RADARR_URL=https://radarr.example.com/
DELUGE_URL=https://deluge.example.com/
SONARR_URL=https://sonarr.example.com/

RADARR_API_KEY=my-radarr-key
DELUGE_PASSWORD=my-deluge-password
SONARR_API_KEY=my-sonarr-key

# Optional option to use the system's SSL CA store. Should be used with a volume map: /etc/ssl/certs/ca-certificates.crt:/etc/ssl/certs/ca-certificates.crt:ro
SYSTEM_SSL=true

```
# Development Usage

Start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.
