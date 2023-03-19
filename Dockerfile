FROM frolvlad/alpine-glibc:latest

# Install Deno
RUN apk add --no-cache curl unzip git 
RUN curl -fsSL https://deno.land/x/install/install.sh | sh

# Add Deno to PATH
ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"

# Install Deno dependencies
WORKDIR /app

# Copy source code
COPY . .

# Build and run
RUN deno cache --lock=lock.json --lock-write main.ts
RUN deno cache --lock=lock.json main.ts

ENTRYPOINT [ "./entrypoint.sh" ]

# Run
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "--unstable", "main.ts"]
