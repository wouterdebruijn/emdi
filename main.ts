/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "https://deno.land/x/dotenv@v3.2.0/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

import { RadarrAPI } from "./externals/Radarr.ts";
import { DelugeAPI } from "./externals/Deluge.ts";

const radarr = new RadarrAPI(
  new URL("https://radarr.hedium.nl"),
  Deno.env.get("RADARR_API_KEY")!,
);
const deluge = new DelugeAPI(
  new URL("https://mediadownload.hedium.nl"),
  Deno.env.get("DELUGE_PASSWORD")!,
);

export const services = {
  radarr,
  deluge,
};

await start(manifest, { plugins: [twindPlugin(twindConfig)] });
