import { Handlers, PageProps } from "https://deno.land/x/fresh@1.1.1/server.ts";
import { JSXInternal } from "https://esm.sh/v95/preact@10.11.0/src/jsx.d.ts";
import { Torrent } from "../externals/Deluge.ts";
import { Movie, QueueItem } from "../externals/Radarr.ts";

import { services } from "../main.ts";

function getLatestMovies() {
  return services.radarr.getLastMovies(20);
}

function getCurrentQueue() {
  return services.radarr.getQueue();
}

function getCurrentTorrents() {
  return services.deluge.getTorrents();
}

interface Data {
  movies: Movie[];
  torrents: Torrent[];
  radarrQueue: QueueItem[];
}

export const handler: Handlers<Data> = {
  async GET(_, ctx) {
    const movies = await getLatestMovies();
    const torrents = await getCurrentTorrents();
    const radarrQueue = await getCurrentQueue();

    await services.sonarr.getSeries();

    return ctx.render({ movies, torrents, radarrQueue });
  },
};

export default function Home({ data }: PageProps<Data>) {
  const movieObjects = data.movies.map((movie) => Movie(movie));
  const torrentObjects = data.torrents.map((torrent) => Torrent(torrent));
  const radarrQueue = data.radarrQueue.map((item) => QueueItem(item));

  return (
    <div class="bg-gray-900 min-h-screen">
      <div class="max-w-screen">
        <header class="bg-green-800 flex items-center">
          <img
            src="/logo.svg"
            class="w-16 h-16 mx-2"
            alt="the fresh logo: a sliced lemon dripping with juice"
          />
          <h1 class="font-bold text-white">Emdi - Media Dashboard</h1>
        </header>
      </div>

      <section class="mx-2 m-3">
        <h1 class="text-xl font-bold text-white">Latest Movies</h1>
        <div class="flex flex-nowrap overflow-x-scroll">
          {movieObjects}
        </div>
      </section>

      <section class="mx-2 m-3">
        <h1 class="text-xl font-bold text-white">Current Queue</h1>
        <div class="flex flex-col overflow-x-scroll">
          {radarrQueue}
        </div>
      </section>

      <section class="mx-2 m-3">
        <h1 class="text-xl font-bold text-white">Current Torrents</h1>
        <div class="flex flex-col overflow-x-scroll">
          {torrentObjects}
        </div>
      </section>
    </div>
  );
}

function getTag(movie: Movie): JSXInternal.Element {
  // If we have a file, then the movie is available on Emby
  if (movie.hasFile === true) {
    return <p class="text-green-500">On Emby</p>;
  }

  // If the movies isn't available, we wait for a release.
  if (movie.isAvailable === false) {
    return (
      <p class="text-yellow-500">
        Waiting {movie.physicalRelease.toLocaleDateString()}
      </p>
    );
  }

  // If the movie has only been in radarr for less than 24 hours.
  const threshold = new Date(Date.now() - 86400000); // -24h
  if (movie.added > threshold) {
    return <p class="text-yellow-500">Searching</p>;
  }

  // If we don't have a file and the movie is released (metadata) we should have been downloading it.
  return <p class="text-red-500">Failed</p>;
}

function Movie(movie: Movie) {
  return (
    <div class="mt-2 mr-4 bg-gray-800 rounded shadow-white">
      <div
        class="w-48 h-72 bg-cover rounded-t"
        style={`background-image: url("${movie.images[0].remoteUrl}");`}
      >
        {/* <div class="text-white absolute top-0 left-0 w-full opacity-25">
          <div class="bg-black p-2">
            <h2>{movie.title}</h2>
            <p>{movie.year}</p>
          </div>
        </div> */}
      </div>
      <div class="left-0 right-0 p-2 text-center">
        {getTag(movie)}
      </div>
    </div>
  );
}

function Torrent(torrent: Torrent) {
  const lastSeenDate = new Date(torrent.last_seen_complete * 1000);

  return (
    <div class="my-1 p-2 border">
      <div>
        <h2 class="font-bold inline" title={torrent.name}>
          {torrent.name.slice(0, 32)}
        </h2>
        <pre class="text-xs inline ml-2">({ torrent.id })</pre>
      </div>
      {torrent.state === "Seeding"
        ? <p class="text-green-500 inline">Complete</p>
        : <p class="text-yellow-500 inline">Downloading</p>}
      <p class="inline pl-1">{torrent.progress.toFixed(2)}%</p>
      <p>Was available on: {lastSeenDate.toLocaleTimeString()}</p>
    </div>
  );
}

function QueueItem(item: QueueItem) {
  const progress = 100 - (item.sizeleft / item.size * 100);

  return (
    <div class="my-1 p-2 border">
      <h2 class="font-bold">{item.title}</h2>
      {item.status === "paused"
        ? <p class="text-yellow-500 inline">Paused</p>
        : <p class="text-green-500 inline">Downloading</p>}
      <p class="inline pl-1">{progress.toFixed(2)}%</p>
    </div>
  );
}
