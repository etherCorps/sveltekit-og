# Render (and any Docker host) image for examples/bun-build.
# Build context is the repo root: the example consumes @ethercorps/sveltekit-og and
# @examples/shared as workspace packages, so the whole pnpm workspace is installed.
#
# Single stage on purpose: @sveltejs/adapter-bun needs production deps in
# node_modules at runtime, and pnpm's symlinked layout doesn't survive a partial
# COPY into a slimmer image. ponytail: split into build/runtime stages if image
# size ever matters.
FROM node:24-bookworm-slim

ENV BUN_INSTALL=/usr/local
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates curl unzip \
	&& curl -fsSL https://bun.sh/install | bash -s "bun-v1.4.2" \
	&& corepack enable \
	&& corepack prepare pnpm@10.30.3 --activate \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# prepare scripts build packages/sveltekit-og and examples/shared into dist/
RUN pnpm install --frozen-lockfile --filter bun-build...

# the adapter refuses a Node-run build
WORKDIR /app/examples/bun-build
RUN bun run --bun vite build

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["bun", "./build"]
