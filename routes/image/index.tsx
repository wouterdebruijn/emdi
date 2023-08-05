import { Handlers, PageProps } from "https://deno.land/x/fresh@1.1.1/server.ts";

export const handler: Handlers = {
  async GET(request, ctx) {
    // Check if we have this image cached
    const cache = await caches.open("image-cache");
    const cachedImage = await cache.match(request.url);

    if (cachedImage) {
      return cachedImage;
    }

    const externalUrl = new URL(request.url).searchParams.get("url");

    if (!externalUrl) {
      return new Response("No URL provided", { status: 400 });
    }

    const image = await fetch(externalUrl);

    // Cache the image
    await cache.put(request.url, image.clone());

    return image;
  },
};
